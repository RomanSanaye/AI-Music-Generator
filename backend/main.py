import uuid
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from enum import Enum

# 👇 NEW: import AI pipeline
from ai.processor import process_audio

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

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ----------------------------
# Serve output files
# ----------------------------
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# ----------------------------
# Home Route
# ----------------------------
@app.get("/")
def home():
    return {
        "message": "AI Music Backend is running 🚀"
    }
# ----------------------
class Instrument(str, Enum):
    piano = "piano"
    guitar = "guitar"
    violin = "violin"
    flute = "flute"
    guzheng = "guzheng"

# ----------------------------
# Generate API (CLEAN PIPELINE)
# ----------------------------
@app.post("/generate")
async def generate(
    file: UploadFile = File(...),
    instrument: Instrument = Form(...)
):

    # 👇 ALL LOGIC MOVED TO AI PIPELINE
    result = process_audio(file, instrument)

    return {
        "success": True,
        "message": "Audio processed successfully 🎧",
        "instrument": instrument,
        **result
    }