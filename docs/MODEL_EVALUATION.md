# Model Evaluation Documentation — BrainTumorAI

This document outlines the validation procedures, performance metrics, and serialization of evaluation results.

---

## 1. Metrics Defined

The evaluation script (`ml/evaluate.py`) computes standard medical image classification statistics:
- **Accuracy**: Overall fraction of correct predictions.
- **Precision (per-class)**: Out of all scans predicted as tumor type X, how many were actually type X? (Critical to minimize false positives).
- **Recall / Sensitivity (per-class)**: Out of all scans that actually have tumor type X, how many did the model find? (Crucial to minimize false negatives).
- **F1-Score**: Harmonic mean of Precision and Recall.

---

## 2. Confusion Matrix & History Visualization
The script automatically:
- Saves a confusion matrix heatmap to `models/confusion_matrix.png`.
- Plots training accuracy/loss curves to `models/training_curves.png`.
- Saves a tabular classification report to `models/evaluation_results.json`.

---

## 3. Serialization Schema

The generated `models/evaluation_results.json` contains:
```json
{
  "test_loss": 0.1234,
  "test_accuracy": 0.9542,
  "macro_precision": 0.9521,
  "macro_recall": 0.9540,
  "macro_f1": 0.9530,
  "class_metrics": {
    "glioma": {
      "precision": 0.941,
      "recall": 0.932,
      "f1": 0.936
    },
    ...
  }
}
```
This file is read by the backend to display performance metrics in the admin dashboard.
- **Clinical Notice**: If evaluation runs are not completed, the admin interface displays "Evaluation not available" rather than hardcoding placeholder or fake metrics.
