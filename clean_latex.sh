#!/bin/bash

# Script de nettoyage des fichiers temporaires LaTeX
# Usage: ./clean_latex.sh

echo "🧹 Nettoyage des fichiers temporaires LaTeX..."

# Aller dans le dossier docs
cd "$(dirname "$0")/docs" || exit 1

# Liste des extensions à supprimer
extensions=("aux" "fdb_latexmk" "fls" "log" "out" "toc" "synctex.gz" "nav" "snm" "vrb" "bbl" "blg" "idx" "ind" "ilg" "lof" "lot" "loa" "thm" "figlist" "makefile" "glg" "glo" "gls" "ist" "acn" "acr" "alg" "glsdefs" "lol" "bcf" "run.xml" "xdv")

# Supprimer les fichiers temporaires
for ext in "${extensions[@]}"; do
    if ls *.${ext} 1> /dev/null 2>&1; then
        echo "🗑️  Suppression des fichiers *.${ext}"
        rm -f *.${ext}
    fi
done

echo "✅ Nettoyage terminé !"
echo "📄 Fichiers conservés :"
ls -la *.tex *.pdf *.md 2>/dev/null || echo "❌ Aucun fichier source trouvé"
