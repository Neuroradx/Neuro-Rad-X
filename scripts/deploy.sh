#!/bin/bash
# Deploy script: git add, commit, push. Firebase deploy runs automatically via GitHub Actions on push to main.

set -e

MESSAGE="${1:-Update: $(date '+%Y-%m-%d %H:%M')}"

echo "📦 Staging all changes..."
git add -A

if git diff --staged --quiet; then
  echo "✅ No hay cambios para subir."
  exit 0
fi

echo "📝 Committing: $MESSAGE"
git commit -m "$MESSAGE"

echo "🚀 Pushing to GitHub..."
git push

echo ""
echo "✅ Código subido a GitHub."
echo "📤 Si estás en la rama 'main', Firebase deploy se ejecutará automáticamente en unos segundos."
echo "   Ver progreso: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
