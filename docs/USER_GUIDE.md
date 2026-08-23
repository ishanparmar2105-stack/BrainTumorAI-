# User & Setup Guide — BrainTumorAI

A step-by-step guide to run the application, train the ML model, and verify features locally.

---

## 1. Environment Setup

### 1.1 Prerequisites
- Python 3.11+
- Node.js 18+ (npm 9+)

### 1.2 Installation
```bash
# Clone or navigate to the repository
cd BrainTumorAI

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 2. Dataset Setup
1. Download the dataset from Kaggle: [Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset).
2. Extract the dataset inside `data/raw/` in the project root:
   - `data/raw/Training/`
   - `data/raw/Testing/`

---

## 3. Training the Model
To run the training script:
```bash
python -m ml.train --epochs 30 --batch-size 32
```
This will:
- Run training on raw dataset.
- Save the best model checkpoints to `models/best_model.keras`.
- Write training metadata to `models/model_metadata.json`.

---

## 4. Running the Backend
```bash
cd backend
python run.py
```
API docs will be available at: http://localhost:8000/docs

---

## 5. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: http://localhost:5173

---

## 6. Running Tests
To execute backend test suite:
```bash
python -m pytest tests/ -v
```
