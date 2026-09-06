#!/usr/bin/env bash
# ==============================================================================
# Script de Despliegue Automático a Hugging Face Spaces (16 GB RAM Gratis)
# ==============================================================================

set -e

echo "🚀 Iniciando despliegue de Dashboard IA Backend en Hugging Face Spaces..."
echo ""

# Pedir datos al usuario si no están definidos
if [ -z "$HF_USERNAME" ]; then
    read -p "Ingresá tu usuario de Hugging Face: " HF_USERNAME
fi

if [ -z "$HF_SPACE_NAME" ]; then
    read -p "Ingresá el nombre del Space [dashboard-ia-api]: " HF_SPACE_NAME
    HF_SPACE_NAME=${HF_SPACE_NAME:-dashboard-ia-api}
fi

HF_REMOTE_URL="https://huggingface.co/spaces/${HF_USERNAME}/${HF_SPACE_NAME}"

echo ""
echo "📦 Configurando repositorio remoto de Hugging Face: $HF_REMOTE_URL"

# Verificar o agregar remoto
if git remote | grep -q "^hf$"; then
    git remote set-url hf "$HF_REMOTE_URL"
else
    git remote add hf "$HF_REMOTE_URL"
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "📤 Subiendo la rama '$CURRENT_BRANCH' a Hugging Face (rama main)..."
echo "ℹ️  Si te pide contraseña, ingresá tu Access Token de Hugging Face (con permisos de Write)"
echo "   (Podés generarlo en https://huggingface.co/settings/tokens)"
echo ""

git push hf "${CURRENT_BRANCH}:main" --force

echo ""
echo "✅ ¡Subida completada con éxito!"
echo "🌐 Podés ver el estado de compilación de tu contenedor en:"
echo "   https://huggingface.co/spaces/${HF_USERNAME}/${HF_SPACE_NAME}"
echo ""
echo "🔗 La URL de tu API para Vercel (NEXT_PUBLIC_API_URL) será:"
echo "   https://${HF_USERNAME}-${HF_SPACE_NAME}.hf.space"
echo "=============================================================================="
