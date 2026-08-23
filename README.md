# BrainTumorAI — Brain MRI Tumor Classification Platform

BrainTumorAI is an end-to-end, internship-grade brain tumor MRI classification and decision-support prototype. It features a modern React frontend with a premium dark-mode neural aesthetic, a robust FastAPI backend API, a TensorFlow-based deep learning inference service with Grad-CAM explainability, SQLite database persistence, and automated PDF reporting.

> [!WARNING]
> **Medical Disclaimer**: This system is an educational/research prototype and is not intended for clinical diagnosis or treatment decisions. Results should be reviewed by a qualified medical professional.

---

## 🚀 Features

- **Deep Learning Classifier**: Uses **EfficientNetB0** transfer learning to classify MRI scans into four classes: Glioma, Meningioma, Pituitary tumor, or No tumor.
- **Explainable AI (XAI)**: Generates **Grad-CAM** activation maps highlighting model attention areas overlaid directly on the original scan.
- **Security & RBAC**: Safe registration, JWT-based user session authentication, and role-based endpoints (User and Admin views).
- **Interactive History**: View, search, and filter predictions history with pagination and detailed class probability distribution charts.
- **Automated PDF Reports**: Exporter that packages predictions, probabilities, and Grad-CAM overlays into professional medical reports.
- **Admin Dashboard**: System usage counters, prediction distribution charts, and server metrics logging.
- **Comprehensive Testing**: Unit and integration test suite with high coverage.
- **Container Ready**: Fully configured Docker Compose setup for deployment.

---

## 🛠️ Technology Stack

- **Frontend**: React (v19) + TypeScript + Tailwind CSS (v4) + Vite + Recharts + Lucide Icons.
- **Backend**: FastAPI + Python 3.11 + SQLAlchemy ORM.
- **Machine Learning**: TensorFlow (v2.21) + NumPy + Pillow + Matplotlib + scikit-learn.
- **Database**: SQLite (SQLAlchemy models, support for migration).
- **PDF Generation**: `fpdf2` library.
- **Testing**: `pytest` + `TestClient` (FastAPI).
- **Containerization**: Docker + Docker Compose.

---

## 📁 Repository Structure

```
BrainTumorAI/
├── frontend/               # React SPA (Vite + TS + Tailwind)
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── api/            # API routing modules (auth, predictions, admin)
│   │   ├── core/           # Security, dependencies, configuration
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   └── services/       # Inference, Grad-CAM, Storage, PDF Reports
│   └── run.py              # Backend runner script
├── ml/                     # Machine learning pipeline (train, eval, dataset)
├── tests/                  # Backend unit and integration tests
├── docs/                   # Full documentation suite
├── docker-compose.yml      # Multi-container orchestrator configuration
├── Dockerfile              # Multi-stage container builder
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Python 3.11+
- Node.js 18+

### 2. Sourcing the Dataset
1. Download the raw images from [Brain Tumor MRI Dataset on Kaggle](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset).
2. Create directories and extract folders:
   ```bash
   mkdir -p data/raw
   # Move your 'Training' and 'Testing' folders inside data/raw/
   ```

### 3. Setup and Installation

#### Python Backend
```bash
# In the project root
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### React Frontend
```bash
cd frontend
npm install
```

### 4. Running the Platform

#### Step 1: Run the Backend
```bash
# In your virtual environment, from the project root
cd backend
python run.py
```
*API docs are available at http://localhost:8000/docs*

#### Step 2: Run the Frontend
```bash
# In a new terminal window
cd frontend
npm run dev
```
*Open http://localhost:5173 to access the web application.*

---

## 🐳 Docker Deployment

To launch the complete application using Docker:
```bash
# Build and run containers in background
docker-compose up --build -d
```
- Access Frontend on: http://localhost:3000
- Access Backend API on: http://localhost:8000

---

## 🧪 Testing

To run the Pytest test suite:
```bash
/opt/homebrew/bin/python3.11 -m pytest tests/ -v
```

To verify frontend TypeScript types compile:
```bash
cd frontend
npm run build
```

---

## 🧑‍⚕️ Ethical Considerations & Limitations

- This system is an educational prototype and clinical decision-support demonstration. It must not claim superiority over commercial radiology tools or be used in diagnosis.
- Grad-CAM highlights attention maps, not segmentation boundaries.
- No actual patient data is saved or processed.
