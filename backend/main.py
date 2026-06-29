import uuid
from fastapi.staticfiles import StaticFiles

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

app = FastAPI()

# ----------------------------
# CORS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Folders
# ----------------------------
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

# ----------------------------
# Serve output files
# ----------------------------
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ----------------------------
# Home Route
# ----------------------------
@app.get("/")
def home():
    return {
        "message": "AI Music Backend is running 🚀"
    }

# ----------------------------
# Generate API
# ----------------------------
@app.post("/generate")
async def generate(
    file: UploadFile = File(...),
    instrument: str = Form(...)
):

    # ----------------------------
    # Validate file extension
    # ----------------------------
    allowed_extensions = {".mp3", ".wav"}

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        return {
            "success": False,
            "message": "Only MP3 and WAV files are allowed."
        }

    # ----------------------------
    # Validate file size
    # ----------------------------
    MAX_FILE_SIZE = 20 * 1024 * 1024

    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return {
            "success": False,
            "message": "File size must be less than 20 MB."
        }

    # ----------------------------
    # Generate unique filename
    # ----------------------------
    unique_filename = f"{uuid.uuid4().hex}{extension}"

    # ----------------------------
    # Save uploaded file
    # ----------------------------
    upload_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ----------------------------
    # Simulated AI processing (Phase 2.4)
    # ----------------------------
    output_filename = f"converted_{unique_filename}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    # Fake AI step (copy file for now)
    shutil.copyfile(upload_path, output_path)

    # ----------------------------
    # Response
    # ----------------------------
    return {
        "success": True,
        "message": "Audio processed successfully 🎧",
        "instrument": instrument,
        "input_file": unique_filename,
        "output_file": output_filename,
        "output_path": output_path,
        "note": "This is simulated output (AI coming next phase)"
    }