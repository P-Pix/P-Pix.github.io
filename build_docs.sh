#!/bin/bash

# Script de compilation de la documentation LaTeX
# Usage: ./build_docs.sh

echo "📚 Compilation de la documentation technique..."

# Aller dans le dossier docs
cd "$(dirname "$0")/docs" || exit 1

# Compilation LaTeX (double passe pour ToC)
echo "🔧 Première passe de compilation..."
pdflatex -interaction=nonstopmode documentation_technique.tex > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "🔧 Seconde passe de compilation (pour la table des matières)..."
    pdflatex -interaction=nonstopmode documentation_technique.tex > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Compilation réussie !"
        echo "📄 Fichier généré : docs/documentation_technique.pdf"
        
        # Afficher les informations du PDF
        if command -v pdfinfo &> /dev/null; then
            echo ""
            echo "📊 Informations du document :"
            pdfinfo documentation_technique.pdf | grep -E "(Pages|File size|Producer)"
        fi
        
        # Nettoyage automatique des fichiers temporaires
        echo ""
        echo "🧹 Nettoyage des fichiers temporaires..."
        rm -f *.aux *.log *.out *.toc *.synctex.gz 2>/dev/null
        echo "✅ Nettoyage terminé !"
        
    else
        echo "❌ Erreur lors de la seconde compilation"
        echo "📝 Consultez documentation_technique.log pour plus de détails"
        exit 1
    fi
else
    echo "❌ Erreur lors de la première compilation"
    echo "📝 Consultez documentation_technique.log pour plus de détails"
    exit 1
fi

echo ""
echo "🎯 Documentation prête à être utilisée !"
