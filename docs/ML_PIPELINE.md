# ML Pipeline Documentation — BrainTumorAI

This document details the Machine Learning modeling pipeline, dataset preparation, training phases, evaluation criteria, and model explainability approach.

---

## 1. Model Architecture

The core of the system is based on **EfficientNetB0**, pre-trained on ImageNet.
- **Base Model**: Convolutional features of EfficientNetB0 are loaded, excluding the top dense classification layers.
- **Top Classifier Head**:
  - `GlobalAveragePooling2D()` layer.
  - `Dropout(0.3)` to minimize overfitting.
  - `Dense(256)` unit layer with `ReLU` activation.
  - `Dropout(0.2)`.
  - `Dense(4)` output units with `Softmax` activation representing four classes.

---

## 2. Preprocessing & Data Augmentation

To ensure robustness, images are preprocessed and augmented dynamically at training time:
- **Resizing**: Downsampled to `224x224` pixels.
- **Rescaling**: Pixel values mapped to `[0, 1]` range by dividing by 255.0.
- **Augmentation**:
  - Rotation (up to 20 degrees)
  - Zoom range (up to 15%)
  - Width and height shifts (up to 10%)
  - Horizontal flips

---

## 3. Two-Phase Training Strategy

1. **Phase 1: Feature Extraction (Base Frozen)**
   - Learning rate: `1e-4`
   - Only the custom classification head is trained.
   - Prevents ruining the pre-trained ImageNet weights.
2. **Phase 2: Fine-Tuning (Top Base Layers Unfrozen)**
   - Unfreezes layers from index 100 onwards.
   - Learning rate: `1e-5` (10x smaller to prevent large gradient updates).
   - Allows fine adaptation of features to the tumor morphology.

---

## 4. Evaluation Metrics
The pipeline computes:
- Accuracy, Precision, Recall, and F1-score (macro and class-wise).
- Confusion Matrix to spot misclassifications.
- Sensitivity is prioritized because false negatives (missing a tumor) are extremely risky.

---

## 5. Explainable AI: Grad-CAM
Grad-CAM calculates gradients of the predicted class score with respect to the feature map activations of the last convolutional layer. These gradients are globally pooled to weight the activation maps, yielding a localization map highlighting the visual evidence the model used for its prediction.
