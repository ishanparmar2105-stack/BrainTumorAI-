# Product Requirement Document (PRD) — BrainTumorAI

## 1. Executive Summary & Vision
BrainTumorAI is an end-to-end, medical image decision-support demonstration platform. It allows researchers and radiologists to upload brain MRI scans, receive real-time classification results across four classes (Glioma, Meningioma, Pituitary Tumor, and No Tumor), and visually analyze decision-making areas using Grad-CAM heatmaps.

> [!WARNING]
> **Medical Disclaimer**: This product is an educational/research prototype and must never be used for clinical diagnosis, patient treatment decisions, or as a replacement for qualified medical professionals.

---

## 2. Target Audience & Personas
- **Student Researcher**: Wants to understand end-to-end ML integration with modern full-stack web architectures.
- **Faculty Evaluator / Internship Supervisor**: Evaluates the technical rigor, design quality, testing standards, and completeness of the product lifecycle.
- **Radiologist / Medical Demonstrator**: Evaluates the decision-support flow, Grad-CAM explainability, and PDF reports usability.

---

## 3. Product Modules & Functional Specifications
### 3.1 Authentication & Role-Based Access Control (RBAC)
- **User Role**: Register, login, upload MRI images, view personal analysis history, and download PDF reports.
- **Admin Role**: View system statistics (total predictions, active model version, predictions today) and monitor model metrics.

### 3.2 Machine Learning Inference & Preprocessing
- Real-time preprocessing: image resizing to 224x224, rgb channel normalization.
- Multi-class classification: Glioma, Meningioma, Pituitary Tumor, No Tumor.
- Custom model metadata tracking (image size, class names, framework, checkpoint path).

### 3.3 Explainable AI (XAI)
- Grad-CAM heatmap overlay showing model focus.
- Interactive toggle in the frontend between: Original MRI image, and Grad-CAM overlay.

### 3.4 History & PDF Reports
- Prediction history with pagination, query filtering (by class), and keyword searches on file name.
- Automatically generated PDF report with model parameters, predictions, class probability table, and Grad-CAM image overlay.

### 3.5 Admin Dashboard
- Total system usage statistics, active model details, prediction class distribution, and audit log.

---

## 4. Key Performance Indicators (KPIs)
- **Inference Latency**: Under 500ms on CPU for typical single image.
- **Model Accuracy**: Target validation accuracy > 90% on Kaggle dataset.
- **PDF Generation Speed**: Under 100ms.
- **TypeScript & Python compilation**: Zero errors or warnings.
