#!/bin/bash
# Setup Piper TTS for local development
# Run this script once after cloning the repository

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TOOLS_DIR="$PROJECT_ROOT/tools"
PIPER_VENV="$TOOLS_DIR/piper-venv"
MODELS_DIR="$TOOLS_DIR/piper/models"

echo "🚀 Setting up Piper TTS..."
echo ""

# Create directories
mkdir -p "$MODELS_DIR"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment and install piper
if [ ! -d "$PIPER_VENV" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv "$PIPER_VENV"
fi

echo "📦 Installing piper-tts via pip..."
source "$PIPER_VENV/bin/activate"
pip install --upgrade pip --quiet
pip install piper-tts --quiet

echo "✓ Piper installed via pip"

# Download voice models from Hugging Face
HUGGINGFACE_BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US"

download_model() {
    local voice=$1
    local quality=$2
    local model_name="en_US-${voice}-${quality}"
    local model_file="$MODELS_DIR/${model_name}.onnx"
    
    if [ -f "$model_file" ]; then
        echo "✓ ${model_name} already exists, skipping..."
        return
    fi
    
    echo "⬇️  Downloading ${model_name}..."
    curl -L "${HUGGINGFACE_BASE}/${voice}/${quality}/${model_name}.onnx" \
         -o "$model_file" \
         --progress-bar
    
    curl -Ls "${HUGGINGFACE_BASE}/${voice}/${quality}/${model_name}.onnx.json" \
         -o "${model_file}.json"
    
    echo "✓ Downloaded ${model_name}"
}

# Download low quality voices for conversations (fastest generation)
echo ""
echo "⬇️  Downloading voice models..."
download_model "ryan" "low"
download_model "lessac" "low"

echo ""
echo "✅ Piper TTS setup complete!"
echo ""
echo "Piper location: $PIPER_VENV/bin/piper"
echo ""
echo "Available voices:"
ls -lh "$MODELS_DIR"/*.onnx 2>/dev/null | awk '{print "  - " $NF " (" $5 ")"}'
echo ""
echo "To start the TTS service, run:"
echo "  pnpm start:tts-service"
