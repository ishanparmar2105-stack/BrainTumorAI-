import os
import sys
import json
import random
from datetime import datetime, timedelta
from PIL import Image, ImageDraw

# Add backend app to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.models.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.prediction import Prediction
from app.core.security import hash_password
from app.core.config import settings

def create_placeholder_image(path, label, color):
    """Create a simple placeholder image for MRI scan preview."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img = Image.new('RGB', (224, 224), color=(10, 14, 39)) # Deep navy background
    draw = ImageDraw.Draw(img)
    
    # Draw simple brain shape (ellipse)
    draw.ellipse([30, 30, 194, 194], fill=(20, 26, 60), outline=(59, 130, 246), width=2)
    
    # If not a "no tumor" class, draw a tumor circle inside the brain
    if label != "notumor":
        draw.ellipse([80, 80, 140, 140], fill=color, outline=(255, 255, 255), width=1)
        draw.text((95, 105), "TUMOR", fill=(255, 255, 255))
        
    draw.text((10, 10), label.upper(), fill=(59, 130, 246))
    img.save(path)

def seed_database():
    print("Seeding database with test data...")
    db = SessionLocal()
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # 1. Clean existing records
    db.query(Prediction).delete()
    db.query(User).delete()
    db.commit()
    
    # 2. Add Users
    admin_user = User(
        email="admin@example.com",
        username="admin",
        hashed_password=hash_password("adminpassword"),
        role="admin"
    )
    test_user = User(
        email="user@example.com",
        username="researcher",
        hashed_password=hash_password("userpassword"),
        role="user"
    )
    
    db.add(admin_user)
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    print("Users created:")
    print("  - Admin: admin@example.com / adminpassword")
    print("  - User: user@example.com / userpassword")
    
    # 3. Add Mock Predictions
    classes = ["glioma", "meningioma", "pituitary", "notumor"]
    class_colors = {
        "glioma": (244, 63, 94),      # Rose
        "meningioma": (245, 158, 11),   # Amber
        "pituitary": (59, 130, 246),    # Blue
        "notumor": (16, 185, 129)       # Emerald
    }
    
    filenames = [
        "mri_axial_t2_01.png", "mri_sagittal_t1_02.png", "scan_brain_03.png", 
        "mri_t2_flair_04.png", "brain_scan_05.png", "mri_axial_06.png",
        "mri_sagittal_07.png", "scan_brain_08.png", "mri_t2_09.png", "brain_scan_10.png"
    ]
    
    now = datetime.utcnow()
    
    for i in range(10):
        pred_class = random.choice(classes)
        confidence = random.uniform(0.78, 0.99) if pred_class != "notumor" else random.uniform(0.92, 0.99)
        
        # Calculate probabilities distribution
        rem = 1.0 - confidence
        probs = {}
        probs[pred_class] = confidence
        other_classes = [c for c in classes if c != pred_class]
        
        # Distribute remaining probability
        p1 = random.uniform(0, rem)
        p2 = random.uniform(0, rem - p1)
        p3 = rem - p1 - p2
        probs[other_classes[0]] = p1
        probs[other_classes[1]] = p2
        probs[other_classes[2]] = p3
        
        # Generate paths
        uuid_name = f"mock-scan-uuid-{i+1}"
        mri_filename = f"{uuid_name}.png"
        gradcam_filename = f"{uuid_name}_gradcam.png"
        
        relative_mri_path = f"/uploads/mri/{mri_filename}"
        relative_gradcam_path = f"/uploads/gradcam/{gradcam_filename}"
        
        absolute_mri_path = os.path.join(settings.UPLOAD_DIR, "mri", mri_filename)
        absolute_gradcam_path = os.path.join(settings.UPLOAD_DIR, "gradcam", gradcam_filename)
        
        # Create placeholder images
        create_placeholder_image(absolute_mri_path, pred_class, class_colors[pred_class])
        create_placeholder_image(absolute_gradcam_path, f"{pred_class} gradcam", class_colors[pred_class])
        
        # Insert Prediction record
        record_date = now - timedelta(days=random.randint(0, 10), hours=random.randint(0, 23))
        prediction = Prediction(
            user_id=test_user.id,
            original_filename=filenames[i],
            image_path=relative_mri_path,
            predicted_class=pred_class,
            confidence=confidence,
            probabilities_json=json.dumps(probs),
            gradcam_path=relative_gradcam_path,
            processing_time_ms=random.uniform(120.0, 350.0),
            model_version=settings.MODEL_VERSION,
            created_at=record_date
        )
        
        db.add(prediction)
        
    db.commit()
    db.close()
    print("Database successfully seeded with 10 mock prediction logs and matching MRI scan preview files!")

if __name__ == "__main__":
    seed_database()
