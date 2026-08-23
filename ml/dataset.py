"""Dataset loading and preprocessing for BrainTumorAI.

Handles data augmentation, train/val/test splitting, and dataset validation
using tf.keras ImageDataGenerator and flow_from_directory.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, Optional, Tuple

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

from .config import TrainingConfig


def load_dataset(
    config: TrainingConfig,
) -> Tuple[
    tf.keras.preprocessing.image.DirectoryIterator,
    tf.keras.preprocessing.image.DirectoryIterator,
    Optional[tf.keras.preprocessing.image.DirectoryIterator],
]:
    """Load training, validation, and (optionally) test datasets.

    Creates generators with augmentation for training, rescale-only for
    validation, and a separate test generator from the Testing/ folder
    if it exists.

    Args:
        config: TrainingConfig instance with paths and augmentation params.

    Returns:
        Tuple of (train_generator, val_generator, test_generator).
        test_generator is None if the Testing/ directory does not exist.

    Raises:
        FileNotFoundError: If the Training/ directory does not exist.
    """
    train_dir = os.path.join(config.DATA_DIR, 'Training')
    test_dir = os.path.join(config.DATA_DIR, 'Testing')

    if not os.path.isdir(train_dir):
        raise FileNotFoundError(
            f"Training directory not found: {train_dir}. "
            "Expected DATA_DIR to contain a 'Training/' subfolder."
        )

    target_size = (config.IMAGE_SIZE, config.IMAGE_SIZE)

    # Training generator with augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=config.ROTATION_RANGE,
        zoom_range=config.ZOOM_RANGE,
        width_shift_range=config.WIDTH_SHIFT,
        height_shift_range=config.HEIGHT_SHIFT,
        horizontal_flip=config.HORIZONTAL_FLIP,
        validation_split=config.VALIDATION_SPLIT,
    )

    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=target_size,
        batch_size=config.BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        seed=config.SEED,
        shuffle=True,
    )

    # Validation generator — rescale only
    val_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=target_size,
        batch_size=config.BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        seed=config.SEED,
        shuffle=False,
    )

    # Test generator (if Testing/ exists)
    test_generator: Optional[tf.keras.preprocessing.image.DirectoryIterator] = None
    if os.path.isdir(test_dir):
        test_datagen = ImageDataGenerator(rescale=1.0 / 255)
        test_generator = test_datagen.flow_from_directory(
            test_dir,
            target_size=target_size,
            batch_size=config.BATCH_SIZE,
            class_mode='categorical',
            shuffle=False,
        )

    return train_generator, val_generator, test_generator


def get_class_distribution(directory: str) -> Dict[str, int]:
    """Count the number of images per class in a directory.

    Expects `directory` to contain one subfolder per class, each holding
    image files.

    Args:
        directory: Path to a directory with class subfolders.

    Returns:
        Dict mapping class name to image count.

    Raises:
        FileNotFoundError: If the directory does not exist.
    """
    dir_path = Path(directory)
    if not dir_path.is_dir():
        raise FileNotFoundError(f"Directory not found: {directory}")

    distribution: Dict[str, int] = {}
    for class_dir in sorted(dir_path.iterdir()):
        if class_dir.is_dir():
            count = sum(
                1
                for f in class_dir.iterdir()
                if f.is_file() and f.suffix.lower() in {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff'}
            )
            distribution[class_dir.name] = count

    return distribution


def validate_dataset(data_dir: str) -> bool:
    """Validate that the expected dataset directory structure exists.

    Checks for the presence of DATA_DIR, a Training/ subfolder, and at
    least one class subdirectory inside Training/.

    Args:
        data_dir: Root data directory (e.g., data/raw).

    Returns:
        True if the structure is valid, False otherwise.
    """
    data_path = Path(data_dir)

    if not data_path.is_dir():
        print(f"[ERROR] Data directory does not exist: {data_dir}")
        return False

    train_path = data_path / 'Training'
    if not train_path.is_dir():
        print(f"[ERROR] Training directory not found: {train_path}")
        return False

    class_dirs = [d for d in train_path.iterdir() if d.is_dir()]
    if not class_dirs:
        print(f"[ERROR] No class subdirectories found in {train_path}")
        return False

    print(f"[OK] Found {len(class_dirs)} classes in Training/: {[d.name for d in class_dirs]}")

    test_path = data_path / 'Testing'
    if test_path.is_dir():
        test_classes = [d for d in test_path.iterdir() if d.is_dir()]
        print(f"[OK] Found {len(test_classes)} classes in Testing/: {[d.name for d in test_classes]}")
    else:
        print("[WARN] Testing directory not found — test evaluation will be skipped.")

    return True
