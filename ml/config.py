"""Training configuration for BrainTumorAI ML pipeline."""

from dataclasses import dataclass, field
from pathlib import Path
import os


@dataclass
class TrainingConfig:
    """Configuration dataclass for model training parameters.

    Attributes:
        DATA_DIR: Path to raw data directory containing Training/ and Testing/ folders.
        MODEL_DIR: Path to directory where trained models are saved.
        MODEL_NAME: Architecture to use ('efficientnet' or 'baseline_cnn').
        IMAGE_SIZE: Input image dimension (square).
        NUM_CLASSES: Number of tumor classification categories.
        CLASS_NAMES: Ordered list of class label names.
        BATCH_SIZE: Number of samples per training batch.
        EPOCHS: Maximum number of training epochs (Phase 1).
        LEARNING_RATE: Initial learning rate for Phase 1 training.
        FINE_TUNE_LR: Learning rate for Phase 2 fine-tuning.
        FINE_TUNE_EPOCHS: Number of additional fine-tuning epochs.
        FINE_TUNE_AT: Layer index from which to unfreeze during fine-tuning.
        DROPOUT: Dropout rate for regularization.
        SEED: Random seed for reproducibility.
        ROTATION_RANGE: Max rotation angle for augmentation (degrees).
        ZOOM_RANGE: Max zoom factor for augmentation.
        WIDTH_SHIFT: Max horizontal shift fraction for augmentation.
        HEIGHT_SHIFT: Max vertical shift fraction for augmentation.
        HORIZONTAL_FLIP: Whether to apply random horizontal flips.
        VALIDATION_SPLIT: Fraction of training data to use for validation.
    """

    # Paths
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'raw')
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')

    # Model
    MODEL_NAME: str = 'efficientnet'
    IMAGE_SIZE: int = 224
    NUM_CLASSES: int = 4
    CLASS_NAMES: list = field(default_factory=lambda: ['glioma', 'meningioma', 'notumor', 'pituitary'])

    # Training
    BATCH_SIZE: int = 32
    EPOCHS: int = 30
    LEARNING_RATE: float = 1e-4
    FINE_TUNE_LR: float = 1e-5
    FINE_TUNE_EPOCHS: int = 10
    FINE_TUNE_AT: int = 100  # Unfreeze layers from this index
    DROPOUT: float = 0.3
    SEED: int = 42

    # Augmentation
    ROTATION_RANGE: int = 20
    ZOOM_RANGE: float = 0.15
    WIDTH_SHIFT: float = 0.1
    HEIGHT_SHIFT: float = 0.1
    HORIZONTAL_FLIP: bool = True

    # Validation split
    VALIDATION_SPLIT: float = 0.15
