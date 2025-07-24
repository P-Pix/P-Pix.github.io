# 📚 Documentation Technique

Ce dossier contient la documentation technique complète du portfolio P-Pix.github.io.

## 📄 Fichiers

### Documentation LaTeX
- **`documentation_technique.tex`** - Code source LaTeX complet
- **`documentation_technique.pdf`** - Document PDF final (14 pages)
- **`README_documentation.md`** - Guide d'utilisation de la documentation

### Fichiers temporaires LaTeX (ignorés par Git)
- `*.aux` - Fichiers auxiliaires
- `*.log` - Logs de compilation
- `*.out` - Fichiers de sortie hyperref
- `*.toc` - Table des matières
- `*.synctex.gz` - Fichiers de synchronisation

## 🎯 Contenu de la documentation

### Vue d'ensemble technique
- Architecture complète du site
- Analyse du code source (HTML5, CSS3, JavaScript)
- Interaction entre les fichiers
- Fonctionnalités avancées
- Optimisations de performance
- Standards d'accessibilité

### Couleurs utilisées
- 🔴 **Rouge** : Sections importantes, alertes
- 🟢 **Vert** : Technologies, fonctionnalités
- 🟡 **Jaune** : Avertissements, notes
- 🔵 **Bleu** : Titres principaux, architecture

## 🔧 Compilation

```bash
# Dans le dossier docs/
pdflatex documentation_technique.tex
pdflatex documentation_technique.tex  # Seconde passe pour ToC
```

## 📊 Statistiques

- **Pages** : 14 pages
- **Sections** : 9 sections principales  
- **Exemples de code** : 10+ avec coloration syntaxique
- **Diagrammes** : Architecture et flux de navigation
- **Taille PDF** : ~216 KB

## 🎯 Utilisation

Cette documentation est destinée à :
- **Développeurs** : Comprendre l'architecture
- **Recruteurs** : Évaluer les compétences techniques
- **Maintenance** : Guide pour modifications futures
- **Étudiants** : Exemple de documentation professionnelle

---

*Dernière mise à jour : 24 juillet 2025*
