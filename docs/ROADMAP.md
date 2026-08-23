# Development Roadmap — BrainTumorAI

This document outlines the multi-stage roadmap for the BrainTumorAI product lifecycle.

---

## Stage 0: Product Planning (Completed)
- [x] Product Requirement Document (PRD) creation.
- [x] High-level database schema design.
- [x] API specification and routing map.
- [x] Frontend layout wireframing.

---

## Stage 1: Foundation & Infrastructure (Completed)
- [x] Repository organization and project structure.
- [x] Vite + React + Tailwind frontend setup.
- [x] FastAPI skeleton backend implementation.
- [x] SQLite database connection & models.
- [x] Dockerfile & Docker Compose support.

---

## Stage 2: ML Pipeline & Core Inference (Completed)
- [x] Training pipeline script utilizing EfficientNetB0.
- [x] Model validation scripts & metric outputs.
- [x] Asynchronous backend inference service.
- [x] Grad-CAM heatmap visualization implementation.

---

## Stage 3: Feature Integration (Completed)
- [x] JWT Authentication & User Registration.
- [x] MRI upload & dynamic frontend state.
- [x] Result visualization page with class probabilities.
- [x] Prediction history grid with deletion and pagination.
- [x] Automated PDF Report exporter.
- [x] Admin dashboard & system statistics tracking.

---

## Stage 4: Future Enhancements (Phase 2 & 3)
- [ ] **DICOM File Integration**: Support direct upload and parsing of medical DICOM files using `pydicom`.
- [ ] **Tumor Segmentation Model**: Incorporate a U-Net model to output pixel-level segmentation maps of identified tumors, rather than classification heatmaps.
- [ ] **Multi-Modal MRI support**: Allow processing of FLAIR, T1w, T2w contrast scans concurrently.
- [ ] **Cloud Object Storage (S3)**: Swap local upload directory storage service to AWS S3 or GCP Cloud Storage buckets.
