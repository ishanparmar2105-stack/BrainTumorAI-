# Security Policy & Implementation — BrainTumorAI

This document outlines the security features implemented in the BrainTumorAI platform.

---

## 1. Authentication & Security Cryptography
- **Password Hashing**: Uses `passlib` with `bcrypt` algorithm. Passwords are never stored in plain text.
- **JWT tokens**: Standard `HS256` symmetric signing with dynamically configured secret key (`SECRET_KEY`). Token expiry is set to 24 hours (1440 minutes) by default.

---

## 2. File Upload Safeguards
File uploads are a major attack vector in medical apps. We mitigate risks using the following:
- **Extension whitelist**: Only `.jpg`, `.jpeg`, and `.png` extensions are allowed.
- **Content-Type validation**: The `content_type` header must start with `image/`.
- **Size constraint**: File size is validated asynchronously. Uploads exceeding 10MB (`MAX_FILE_SIZE`) are rejected with `400 Bad Request`.
- **Safe Filename Generation**: The upload service replaces the original filename with a randomly generated UUID4 (e.g. `d7a5b3f2-1234-5678-abcd-ef1234567890.png`). This prevents path traversal attacks (`../../etc/passwd`).

---

## 3. Web Layer Security
- **CORS configuration**: CORS middleware allows only specified origins (such as `http://localhost:5173`) to make API requests, preventing cross-origin data leakage.
- **Role-Based Access Control (RBAC)**: Route middleware restricts sensitive statistics and model version metrics endpoints to accounts with `admin` role.
