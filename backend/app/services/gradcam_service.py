"""Grad-CAM visualization service for model interpretability."""
import logging
from typing import Optional

import numpy as np
from PIL import Image
import matplotlib.cm as cm

from app.core.config import settings

logger = logging.getLogger(__name__)


class GradCAMService:
    """Service for generating Grad-CAM heatmap visualizations."""

    def generate_gradcam(
        self,
        model,
        img_array: np.ndarray,
        pred_index: int,
        last_conv_layer_name: Optional[str] = None,
    ) -> np.ndarray:
        """Generate a Grad-CAM heatmap for the given prediction."""
        import tensorflow as tf

        # Find the last Conv2D layer if not specified
        if last_conv_layer_name is None:
            for layer in reversed(model.layers):
                if isinstance(layer, tf.keras.layers.Conv2D):
                    last_conv_layer_name = layer.name
                    break
            if last_conv_layer_name is None:
                raise ValueError('No Conv2D layer found in the model.')

        # Create gradient model
        grad_model = tf.keras.Model(
            inputs=model.inputs,
            outputs=[
                model.get_layer(last_conv_layer_name).output,
                model.output,
            ],
        )

        # Compute gradients
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            loss = predictions[:, pred_index]

        gradients = tape.gradient(loss, conv_outputs)

        # Pool gradients over spatial dimensions
        pooled_gradients = tf.reduce_mean(gradients, axis=(0, 1, 2))

        # Weight conv outputs by pooled gradients
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_gradients[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        # Apply ReLU and normalize
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)

        return heatmap.numpy()

    def save_gradcam_overlay(
        self,
        image_path: str,
        heatmap: np.ndarray,
        output_path: str,
    ) -> str:
        """Save a Grad-CAM overlay on the original image."""
        # Load and resize original image
        original = Image.open(image_path).resize(
            (settings.IMAGE_SIZE, settings.IMAGE_SIZE)
        )
        original_array = np.array(original).astype(np.float32) / 255.0

        # Resize heatmap to match image dimensions
        heatmap_resized = np.array(
            Image.fromarray((heatmap * 255).astype(np.uint8)).resize(
                (settings.IMAGE_SIZE, settings.IMAGE_SIZE)
            )
        ).astype(np.float32) / 255.0

        # Apply jet colormap
        heatmap_colored = cm.jet(heatmap_resized)[:, :, :3]  # Drop alpha channel

        # Ensure original is 3-channel
        if len(original_array.shape) == 2:
            original_array = np.stack([original_array] * 3, axis=-1)
        elif original_array.shape[-1] == 4:
            original_array = original_array[:, :, :3]

        # Blend images
        superimposed = 0.6 * original_array + 0.4 * heatmap_colored
        superimposed = np.clip(superimposed, 0, 1)
        superimposed = (superimposed * 255).astype(np.uint8)

        # Save
        result_image = Image.fromarray(superimposed)
        result_image.save(output_path, 'PNG')

        return output_path


gradcam_service = GradCAMService()
