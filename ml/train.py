"""Full training script for BrainTumorAI.

Runs a two-phase training pipeline:
  Phase 1 — Train the classification head with frozen base.
  Phase 2 — Fine-tune unfrozen layers with a lower learning rate.

Usage:
    python -m ml.train [--model efficientnet] [--epochs 30] [--batch-size 32]
"""

from __future__ import annotations

import argparse
import json
import os
import random
import sys
from datetime import datetime
from typing import Optional
from pathlib import Path

import numpy as np
import tensorflow as tf

from .config import TrainingConfig
from .dataset import load_dataset, validate_dataset, get_class_distribution
from .models import get_model, unfreeze_model


def set_seeds(seed: int) -> None:
    """Set random seeds for reproducibility across numpy, tf, and random.

    Args:
        seed: Integer seed value.
    """
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    print(f"[INFO] Random seeds set to {seed}.")


def build_callbacks(config: TrainingConfig, phase: str) -> list:
    """Build Keras callbacks for a training phase.

    Args:
        config: TrainingConfig instance.
        phase: Either 'phase1' or 'phase2', used for file naming.

    Returns:
        List of Keras Callback instances.
    """
    os.makedirs(config.MODEL_DIR, exist_ok=True)
    log_dir = os.path.join(config.MODEL_DIR, 'logs')
    os.makedirs(log_dir, exist_ok=True)

    checkpoint_path = os.path.join(
        config.MODEL_DIR, f'best_model_{phase}.keras'
    )

    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=checkpoint_path,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=7,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1,
        ),
        tf.keras.callbacks.CSVLogger(
            os.path.join(log_dir, f'training_log_{phase}.csv'),
            append=False,
        ),
    ]

    return callbacks


def save_metadata(
    config: TrainingConfig,
    history_phase1: tf.keras.callbacks.History,
    history_phase2: Optional[tf.keras.callbacks.History],
    model: tf.keras.Model,
) -> None:
    """Save model metadata and training summary to JSON.

    Args:
        config: TrainingConfig used during training.
        history_phase1: Training history from Phase 1.
        history_phase2: Training history from Phase 2 (may be None).
        model: The trained Keras model.
    """
    metadata = {
        'model_name': config.MODEL_NAME,
        'image_size': config.IMAGE_SIZE,
        'num_classes': config.NUM_CLASSES,
        'class_names': config.CLASS_NAMES,
        'batch_size': config.BATCH_SIZE,
        'seed': config.SEED,
        'dropout': config.DROPOUT,
        'training': {
            'phase1_epochs_completed': len(history_phase1.history.get('loss', [])),
            'phase1_best_val_accuracy': float(
                max(history_phase1.history.get('val_accuracy', [0]))
            ),
            'learning_rate': config.LEARNING_RATE,
        },
        'total_parameters': int(model.count_params()),
        'timestamp': datetime.now().isoformat(),
    }

    if history_phase2 is not None:
        metadata['fine_tuning'] = {
            'phase2_epochs_completed': len(history_phase2.history.get('loss', [])),
            'phase2_best_val_accuracy': float(
                max(history_phase2.history.get('val_accuracy', [0]))
            ),
            'fine_tune_lr': config.FINE_TUNE_LR,
            'fine_tune_at_layer': config.FINE_TUNE_AT,
        }

    output_path = os.path.join(config.MODEL_DIR, 'model_metadata.json')
    with open(output_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"[INFO] Metadata saved to {output_path}")


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments.

    Returns:
        Parsed argument namespace.
    """
    parser = argparse.ArgumentParser(
        description='Train BrainTumorAI classification model.',
    )
    parser.add_argument(
        '--model',
        type=str,
        default='efficientnet',
        choices=['efficientnet', 'baseline_cnn'],
        help='Model architecture to use (default: efficientnet).',
    )
    parser.add_argument(
        '--epochs',
        type=int,
        default=None,
        help='Number of Phase 1 training epochs (overrides config).',
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=None,
        help='Batch size (overrides config).',
    )
    parser.add_argument(
        '--lr',
        type=float,
        default=None,
        help='Phase 1 learning rate (overrides config).',
    )
    parser.add_argument(
        '--no-fine-tune',
        action='store_true',
        help='Skip Phase 2 fine-tuning.',
    )
    parser.add_argument(
        '--data-dir',
        type=str,
        default=None,
        help='Path to data directory (overrides config).',
    )
    return parser.parse_args()


def main() -> None:
    """Run the full training pipeline."""
    args = parse_args()
    config = TrainingConfig()

    # Apply CLI overrides
    config.MODEL_NAME = args.model
    if args.epochs is not None:
        config.EPOCHS = args.epochs
    if args.batch_size is not None:
        config.BATCH_SIZE = args.batch_size
    if args.lr is not None:
        config.LEARNING_RATE = args.lr
    if args.data_dir is not None:
        config.DATA_DIR = args.data_dir

    print("=" * 60)
    print("  BrainTumorAI — Training Pipeline")
    print("=" * 60)
    print(f"  Model:       {config.MODEL_NAME}")
    print(f"  Image size:  {config.IMAGE_SIZE}×{config.IMAGE_SIZE}")
    print(f"  Batch size:  {config.BATCH_SIZE}")
    print(f"  Epochs:      {config.EPOCHS} (Phase 1) + {config.FINE_TUNE_EPOCHS} (Phase 2)")
    print(f"  LR:          {config.LEARNING_RATE} → {config.FINE_TUNE_LR}")
    print(f"  Data dir:    {config.DATA_DIR}")
    print("=" * 60)

    # ── Step 1: Set seeds ───────────────────────────────────────
    set_seeds(config.SEED)

    # ── Step 2: Validate & load dataset ─────────────────────────
    if not validate_dataset(config.DATA_DIR):
        print("[FATAL] Dataset validation failed. Aborting.")
        sys.exit(1)

    train_dir = os.path.join(config.DATA_DIR, 'Training')
    print("\n[INFO] Class distribution (Training/):")
    for cls, count in get_class_distribution(train_dir).items():
        print(f"  {cls}: {count} images")

    train_gen, val_gen, test_gen = load_dataset(config)
    print(f"\n[INFO] Training samples:   {train_gen.samples}")
    print(f"[INFO] Validation samples: {val_gen.samples}")
    if test_gen is not None:
        print(f"[INFO] Test samples:       {test_gen.samples}")

    # ── Step 3: Build model ─────────────────────────────────────
    model = get_model(config.MODEL_NAME, config)
    model.summary(print_fn=lambda x: print(f"  {x}"))

    # ── Step 4: Phase 1 — Train frozen base ─────────────────────
    print("\n" + "=" * 60)
    print("  Phase 1: Training classification head (frozen base)")
    print("=" * 60)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=config.LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    history_phase1 = model.fit(
        train_gen,
        epochs=config.EPOCHS,
        validation_data=val_gen,
        callbacks=build_callbacks(config, 'phase1'),
        verbose=1,
    )

    # ── Step 5: Phase 2 — Fine-tune ────────────────────────────
    history_phase2 = None

    if not args.no_fine_tune and config.MODEL_NAME == 'efficientnet':
        print("\n" + "=" * 60)
        print("  Phase 2: Fine-tuning with unfrozen layers")
        print("=" * 60)

        unfreeze_model(model, at_layer=config.FINE_TUNE_AT)

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=config.FINE_TUNE_LR),
            loss='categorical_crossentropy',
            metrics=['accuracy'],
        )

        total_phase1_epochs = len(history_phase1.history.get('loss', []))
        history_phase2 = model.fit(
            train_gen,
            epochs=total_phase1_epochs + config.FINE_TUNE_EPOCHS,
            initial_epoch=total_phase1_epochs,
            validation_data=val_gen,
            callbacks=build_callbacks(config, 'phase2'),
            verbose=1,
        )
    elif args.no_fine_tune:
        print("\n[INFO] Skipping Phase 2 (--no-fine-tune flag set).")
    else:
        print(f"\n[INFO] Skipping Phase 2 (not applicable for '{config.MODEL_NAME}').")

    # ── Step 6: Save final model & metadata ─────────────────────
    final_model_path = os.path.join(config.MODEL_DIR, 'brain_tumor_model.keras')
    os.makedirs(config.MODEL_DIR, exist_ok=True)
    model.save(final_model_path)
    print(f"\n[INFO] Final model saved to {final_model_path}")

    save_metadata(config, history_phase1, history_phase2, model)

    print("\n" + "=" * 60)
    print("  Training complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
