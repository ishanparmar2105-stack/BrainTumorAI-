"""Model architectures for BrainTumorAI.

Provides a baseline CNN and an EfficientNetB0 transfer-learning model,
along with a factory function and fine-tuning utilities.
"""

from __future__ import annotations

from typing import Tuple

import tensorflow as tf
from tensorflow.keras import layers, models

from .config import TrainingConfig


def build_baseline_cnn(
    input_shape: Tuple[int, int, int],
    num_classes: int,
) -> tf.keras.Model:
    """Build a simple 3-block CNN for baseline comparison.

    Architecture:
        3 × (Conv2D → ReLU → MaxPooling2D) → Flatten → Dense(256) → Dropout → Dense(num_classes, softmax)

    Args:
        input_shape: Shape of input images, e.g. (224, 224, 3).
        num_classes: Number of output classes.

    Returns:
        Compiled-ready Keras Model.
    """
    model = models.Sequential(name='baseline_cnn')

    # Block 1
    model.add(layers.Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=input_shape))
    model.add(layers.MaxPooling2D((2, 2)))

    # Block 2
    model.add(layers.Conv2D(64, (3, 3), activation='relu', padding='same'))
    model.add(layers.MaxPooling2D((2, 2)))

    # Block 3
    model.add(layers.Conv2D(128, (3, 3), activation='relu', padding='same'))
    model.add(layers.MaxPooling2D((2, 2)))

    # Classifier head
    model.add(layers.Flatten())
    model.add(layers.Dense(256, activation='relu'))
    model.add(layers.Dropout(0.5))
    model.add(layers.Dense(num_classes, activation='softmax'))

    return model


def build_efficientnet(
    input_shape: Tuple[int, int, int],
    num_classes: int,
    dropout: float = 0.3,
) -> tf.keras.Model:
    """Build an EfficientNetB0-based transfer-learning model.

    Uses ImageNet-pretrained EfficientNetB0 as the frozen feature
    extractor, followed by a custom classification head.

    Architecture:
        EfficientNetB0(frozen) → GlobalAveragePooling2D → Dropout →
        Dense(256, relu) → Dropout(0.2) → Dense(num_classes, softmax)

    Args:
        input_shape: Shape of input images, e.g. (224, 224, 3).
        num_classes: Number of output classes.
        dropout: Dropout rate after the pooling layer.

    Returns:
        Keras Model with frozen base layers.
    """
    base_model = tf.keras.applications.EfficientNetB0(
        weights='imagenet',
        include_top=False,
        input_shape=input_shape,
    )
    base_model.trainable = False  # Freeze base for Phase 1

    inputs = layers.Input(shape=input_shape, name='input_image')
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name='gap')(x)
    x = layers.Dropout(dropout, name='dropout_1')(x)
    x = layers.Dense(256, activation='relu', name='dense_256')(x)
    x = layers.Dropout(0.2, name='dropout_2')(x)
    outputs = layers.Dense(num_classes, activation='softmax', name='predictions')(x)

    model = models.Model(inputs, outputs, name='efficientnet_b0_transfer')
    return model


def get_model(name: str, config: TrainingConfig) -> tf.keras.Model:
    """Factory function to build a model by name.

    Args:
        name: Model architecture name. One of 'efficientnet', 'baseline_cnn'.
        config: TrainingConfig instance.

    Returns:
        Un-compiled Keras Model.

    Raises:
        ValueError: If `name` is not a recognised architecture.
    """
    input_shape = (config.IMAGE_SIZE, config.IMAGE_SIZE, 3)

    if name == 'efficientnet':
        return build_efficientnet(input_shape, config.NUM_CLASSES, config.DROPOUT)
    elif name == 'baseline_cnn':
        return build_baseline_cnn(input_shape, config.NUM_CLASSES)
    else:
        raise ValueError(
            f"Unknown model name '{name}'. Choose from: 'efficientnet', 'baseline_cnn'."
        )


def unfreeze_model(model: tf.keras.Model, at_layer: int = 100) -> None:
    """Unfreeze model layers from a given index for fine-tuning.

    Iterates through the *entire* model (including nested base models)
    and sets layers from index `at_layer` onward to trainable.

    Args:
        model: A Keras Model, typically built by `build_efficientnet`.
        at_layer: Layer index from which to start unfreezing.
    """
    # Find the base model layer (EfficientNetB0)
    base_model = None
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model):
            base_model = layer
            break

    if base_model is not None:
        base_model.trainable = True
        for i, layer in enumerate(base_model.layers):
            if i < at_layer:
                layer.trainable = False
            else:
                layer.trainable = True
        print(
            f"[INFO] Unfroze {len(base_model.layers) - at_layer} layers "
            f"(from index {at_layer}/{len(base_model.layers)})."
        )
    else:
        # Fallback: unfreeze all layers from at_layer in the flat model
        for i, layer in enumerate(model.layers):
            layer.trainable = i >= at_layer
        print(
            f"[INFO] Unfroze layers from index {at_layer}/{len(model.layers)}."
        )
