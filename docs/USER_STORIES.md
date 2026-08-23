# User Stories — BrainTumorAI

This document outlines key user stories categorized by functional epics, complete with priorities and acceptance criteria.

---

## Epic 1: User Authentication & Security
### Story US-1.1: Account Creation
- **As a** Researcher,
- **I want to** register an account with my email and password,
- **So that** I can secure my analysis records.
- **Priority**: High (P0)
- **Acceptance Criteria**:
  - Email format must be validated.
  - Password must be at least 6 characters.
  - Returns a JWT token on success.

### Story US-1.2: Security Authentication
- **As a** User,
- **I want to** sign in using my email and password,
- **So that** I can access my private dashboard.
- **Priority**: High (P0)
- **Acceptance Criteria**:
  - Rejects wrong passwords with `401 Unauthorized`.
  - Token is stored in `localStorage`.

---

## Epic 2: MRI Image Analysis
### Story US-2.1: Image Upload
- **As a** Radiologist,
- **I want to** drag and drop a brain MRI scan image,
- **So that** I can validate it before running analysis.
- **Priority**: High (P0)
- **Acceptance Criteria**:
  - Restricts uploads to JPG/PNG format.
  - File size must be less than 10MB.
  - Generates an image preview on-screen.

### Story US-2.2: AI Inference & Explainability
- **As a** Researcher,
- **I want to** run AI prediction and view the class confidence along with the Grad-CAM heatmap,
- **So that** I can understand the model's area of focus.
- **Priority**: High (P0)
- **Acceptance Criteria**:
  - Displays prediction class badge (color-coded).
  - Renders a horizontal probability distribution chart.
  - Shows an interactive toggle for Original / Grad-CAM Overlay image.
  - Displays a mandatory medical disclaimer.

---

## Epic 3: History & Document Export
### Story US-3.1: Prediction Log
- **As a** User,
- **I want to** view a list of all my past analyses,
- **So that** I can filter them by category or search by filename.
- **Priority**: Medium (P1)
- **Acceptance Criteria**:
  - Pagination of history items (12 per page).
  - Search bar query input.
  - Dropdown filter by class.

### Story US-3.2: Export to PDF
- **As a** Radiologist,
- **I want to** download a PDF report of my prediction results,
- **So that** I can share it with colleagues or file it in records.
- **Priority**: Medium (P1)
- **Acceptance Criteria**:
  - PDF contains prediction details, confidence score, and disclaimer.
  - Exporter is fast (< 100ms).
