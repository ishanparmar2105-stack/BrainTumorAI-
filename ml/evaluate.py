"""Evaluation script for BrainTumorAI.

Loads a trained model and test dataset, computes classification metrics,
generates a confusion matrix plot, and saves results to JSON.

Usage:
    python -m ml.evaluate [--model-path models/brain_tumor_model.keras]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

from .config import TrainingConfig
from .dataset import load_dataset, validate_dataset


def plot_confusion_matrix(
    cm: np.ndarray,
    class_names: list[str],
    output_path: str,
) -> None:
    """Plot and save a confusion matrix heatmap using seaborn.

    Args:
        cm: Confusion matrix array of shape (num_classes, num_classes).
        class_names: Ordered list of class label names.
        output_path: File path to save the PNG image.
    """
    import matplotlib
    matplotlib.use('Agg')  # Non-interactive backend
    import matplotlib.pyplot as plt
    import seaborn as sns

    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=class_names,
        yticklabels=class_names,
        ax=ax,
        linewidths=0.5,
        linecolor='gray',
    )
    ax.set_xlabel('Predicted Label', fontsize=12)
    ax.set_ylabel('True Label', fontsize=12)
    ax.set_title('Confusion Matrix — BrainTumorAI', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close(fig)
    print(f"[INFO] Confusion matrix saved to {output_path}")


def evaluate_model(
    model: tf.keras.Model,
    test_generator: tf.keras.preprocessing.image.DirectoryIterator,
    class_names: list[str],
) -> dict:
    """Evaluate a model on the test dataset and return metrics.

    Computes accuracy, weighted precision, recall, F1-score, and the
    raw confusion matrix. All metrics are derived from actual model
    predictions — nothing is fabricated.

    Args:
        model: Trained Keras model.
        test_generator: Test data generator (shuffle=False).
        class_names: Ordered list of class label names.

    Returns:
        Dict containing all computed metrics.
    """
    # Reset generator to ensure we iterate from the beginning
    test_generator.reset()

    # Predict
    print("[INFO] Running predictions on test set...")
    predictions = model.predict(test_generator, verbose=1)
    y_pred = np.argmax(predictions, axis=1)
    y_true = test_generator.classes

    # Ensure alignment (only use as many labels as we predicted)
    num_samples = len(y_pred)
    y_true = y_true[:num_samples]

    # Metrics
    accuracy = float(accuracy_score(y_true, y_pred))
    precision = float(precision_score(y_true, y_pred, average='weighted', zero_division=0))
    recall = float(recall_score(y_true, y_pred, average='weighted', zero_division=0))
    f1 = float(f1_score(y_true, y_pred, average='weighted', zero_division=0))
    cm = confusion_matrix(y_true, y_pred)

    results = {
        'accuracy': accuracy,
        'precision_weighted': precision,
        'recall_weighted': recall,
        'f1_weighted': f1,
        'confusion_matrix': cm.tolist(),
        'num_test_samples': num_samples,
        'class_names': class_names,
    }

    return results


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments.

    Returns:
        Parsed argument namespace.
    """
    parser = argparse.ArgumentParser(
        description='Evaluate a trained BrainTumorAI model.',
    )
    parser.add_argument(
        '--model-path',
        type=str,
        default=None,
        help='Path to saved .keras model file. Defaults to models/brain_tumor_model.keras.',
    )
    parser.add_argument(
        '--data-dir',
        type=str,
        default=None,
        help='Path to data directory (overrides config).',
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default=None,
        help='Directory to save evaluation outputs. Defaults to MODEL_DIR.',
    )
    return parser.parse_args()


def main() -> None:
    """Run the evaluation pipeline."""
    args = parse_args()
    config = TrainingConfig()

    if args.data_dir is not None:
        config.DATA_DIR = args.data_dir

    # Resolve model path
    model_path = args.model_path or os.path.join(config.MODEL_DIR, 'brain_tumor_model.keras')
    output_dir = args.output_dir or config.MODEL_DIR

    print("=" * 60)
    print("  BrainTumorAI — Evaluation Pipeline")
    print("=" * 60)
    print(f"  Model:      {model_path}")
    print(f"  Data dir:   {config.DATA_DIR}")
    print(f"  Output dir: {output_dir}")
    print("=" * 60)

    # ── Step 1: Validate ────────────────────────────────────────
    if not os.path.isfile(model_path):
        print(f"[FATAL] Model file not found: {model_path}")
        sys.exit(1)

    if not validate_dataset(config.DATA_DIR):
        print("[FATAL] Dataset validation failed. Aborting.")
        sys.exit(1)

    # ── Step 2: Load model & data ──────────────────────────────
    print("\n[INFO] Loading model...")
    model = tf.keras.models.load_model(model_path)
    model.summary(print_fn=lambda x: print(f"  {x}"))

    _, _, test_gen = load_dataset(config)

    if test_gen is None:
        print("[FATAL] No Testing/ directory found. Cannot evaluate without test data.")
        sys.exit(1)

    print(f"[INFO] Test samples: {test_gen.samples}")

    # ── Step 3: Evaluate ────────────────────────────────────────
    results = evaluate_model(model, test_gen, config.CLASS_NAMES)

    # ── Step 4: Print report ────────────────────────────────────
    print("\n" + "=" * 60)
    print("  Evaluation Results")
    print("=" * 60)
    print(f"  Accuracy:   {results['accuracy']:.4f}")
    print(f"  Precision:  {results['precision_weighted']:.4f}")
    print(f"  Recall:     {results['recall_weighted']:.4f}")
    print(f"  F1 Score:   {results['f1_weighted']:.4f}")
    print(f"  Samples:    {results['num_test_samples']}")
    print("=" * 60)

    # Full sklearn classification report
    test_gen.reset()
    predictions = model.predict(test_gen, verbose=0)
    y_pred = np.argmax(predictions, axis=1)
    y_true = test_gen.classes[:len(y_pred)]

    print("\n[INFO] Classification Report:")
    print(classification_report(y_true, y_pred, target_names=config.CLASS_NAMES, zero_division=0))

    # ── Step 5: Save outputs ────────────────────────────────────
    os.makedirs(output_dir, exist_ok=True)

    # Confusion matrix plot
    cm = np.array(results['confusion_matrix'])
    cm_path = os.path.join(output_dir, 'confusion_matrix.png')
    plot_confusion_matrix(cm, config.CLASS_NAMES, cm_path)

    # JSON results
    results_path = os.path.join(output_dir, 'evaluation_results.json')
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"[INFO] Results saved to {results_path}")

    print("\n" + "=" * 60)
    print("  Evaluation complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
