# Dataset Documentation — BrainTumorAI

This document describes the brain MRI dataset configuration, sourcing, split structure, and preprocessing steps.

---

## 1. Dataset Overview

The system is trained and evaluated using the **Brain Tumor MRI Dataset** from Kaggle.
- **Total Samples**: ~7,022 MRI images.
- **Classes**: 4 mutually exclusive categories.
  - `glioma`: 1,621 images (Training: 1,321, Testing: 300)
  - `meningioma`: 1,645 images (Training: 1,339, Testing: 306)
  - `pituitary`: 1,757 images (Training: 1,457, Testing: 300)
  - `notumor`: 2,000 images (Training: 1,595, Testing: 405)

---

## 2. Directory Structure

```
data/
└── raw/
    ├── Training/
    │   ├── glioma/
    │   ├── meningioma/
    │   ├── notumor/
    │   └── pituitary/
    └── Testing/
        ├── glioma/
        ├── meningioma/
        ├── notumor/
        └── pituitary/
```

---

## 3. Dataset Loading & Leakage Prevention
- **Splitting**: The dataset contains pre-split Training and Testing folders.
- **Validation**: 15% of the `Training/` directory is carved out dynamically during runtime as a validation split using the `validation_split` parameter in the Keras data generator.
- **Leakage Prevention**: To prevent data leakage, training augmentations are applied *only* to the training subset. The validation and test sets are exclusively rescaled (`1/255.0`) with no random transformations applied.
- **Image Preprocessing**: Raw files of varying resolutions are decoded, resized to `224x224` pixels using bilinear interpolation, and converted to RGB color channels.
