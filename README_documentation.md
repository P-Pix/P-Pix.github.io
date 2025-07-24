# Documentation Technique - Portfolio P-Pix.github.io

## 📋 Vue d'ensemble

Ce document LaTeX fournit une documentation technique complète du site web portfolio de Guillaume Lemonnier (P-Pix.github.io).

## 📄 Fichiers générés

- **`documentation_technique.tex`** : Code source LaTeX
- **`documentation_technique.pdf`** : Document PDF final (14 pages)

## 🎨 Couleurs utilisées

Le document utilise une palette de couleurs cohérente :

- 🔴 **Rouge** (`#DC143C`) : Sections importantes, alertes
- 🟢 **Vert** (`#228B22`) : Technologies, fonctionnalités
- 🟡 **Jaune** (`#FFD700`) : Avertissements, notes
- 🔵 **Bleu** (`#1E90FF`) : Titres principaux, liens

## 📖 Contenu de la documentation

### Structure du document :

1. **Introduction** - Présentation du projet
2. **Architecture** - Structure des fichiers et pages
3. **Analyse du Code** - HTML5, CSS3, JavaScript
4. **Interactions** - Communication entre fichiers
5. **Fonctionnalités** - Composants et animations
6. **Protection** - Système de licence
7. **SEO & Accessibilité** - Optimisations
8. **Déploiement** - GitHub Pages et performance
9. **Maintenance** - Architecture modulaire

### Sections détaillées :

- **🏗️ Architecture** : Arborescence complète, navigation
- **💻 Code Source** : Templates HTML, variables CSS, JavaScript ES6+
- **🎯 Fonctionnalités** : Animations, responsive design, interactions
- **📊 Performance** : Lighthouse scores, optimisations
- **♿ Accessibilité** : Standards WCAG 2.1, ARIA labels
- **🔍 SEO** : Meta tags, structure sémantique
- **🛡️ Sécurité** : Protection par licence MIT

## 🔧 Compilation LaTeX

### Prérequis :
```bash
sudo apt-get install texlive-full
# ou
sudo apt-get install texlive-latex-extra texlive-fonts-recommended
```

### Compilation :
```bash
pdflatex documentation_technique.tex
pdflatex documentation_technique.tex  # Seconde passe pour ToC
```

### Packages LaTeX utilisés :
- `xcolor` : Gestion des couleurs
- `listings` : Coloration syntaxique du code
- `tcolorbox` : Boîtes colorées
- `tikz` : Diagrammes et graphiques
- `forest` : Arborescences
- `hyperref` : Liens hypertextes

## 📊 Statistiques du document

- **Pages** : 14 pages
- **Taille** : ~216 KB
- **Sections** : 9 sections principales
- **Code samples** : 10+ exemples commentés
- **Diagrammes** : Architecture, flux de navigation
- **Couleurs** : 4 couleurs principales + variations

## 🎯 Utilisation

Cette documentation est destinée à :

- **Développeurs** : Comprendre l'architecture technique
- **Recruteurs** : Évaluer les compétences techniques
- **Étudiants** : Exemple de documentation professionnelle
- **Maintenance** : Guide pour futures modifications

## 📝 Notes techniques

### Responsive Design :
- CSS Grid et Flexbox
- 3 breakpoints (mobile, tablette, desktop)
- Images optimisées

### Performance :
- Lighthouse scores 95+
- Variables CSS pour cohérence
- JavaScript moderne avec optimisations

### Accessibilité :
- WCAG 2.1 AA compliance
- Navigation clavier
- ARIA labels appropriés

## 🔗 Liens utiles

- **Site web** : https://p-pix.github.io
- **Repository** : https://github.com/P-Pix/P-Pix.github.io
- **LinkedIn** : https://linkedin.com/in/lemonnier-guillaume

---

*Documentation générée le 24 juillet 2025*  
*Auteur : Guillaume Lemonnier*  
*Version : 1.0*
