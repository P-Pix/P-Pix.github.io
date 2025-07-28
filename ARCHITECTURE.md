# 🏗️ Architecture du Site Web - Guillaume Lemonnier

## 📁 Structure des Fichiers

```
P-Pix.github.io/
├── index.html                                    # Page d'accueil principale
├── LICENSE                                       # Licence du projet
├── README.md                                     # Documentation GitHub
├── .gitignore                                    # Fichiers ignorés par Git
├── budget-cuclm-optimized-final.json            # Données budget CUCLM (19M€)
│
├── assets/                                       # Ressources statiques
│   ├── images/                                   # Images du site
│   │   ├── pp.png                               # Avatar principal
│   │   ├── pp_b.png                             # Avatar variant
│   │   └── pp_d.png                             # Avatar variant
│   └── pdf/
│       └── cv.pdf                               # CV téléchargeable
│
└── src/                                          # Code source
    ├── css/
    │   └── style.css                            # Styles CSS principaux
    │
    ├── html/                                     # Pages HTML
    │   ├── projets.html                         # Portfolio projets
    │   ├── cv.html                              # CV en ligne
    │   ├── associatif.html                      # Engagement associatif
    │   ├── contact.html                         # Informations contact
    │   │
    │   # Projets interactifs
    │   ├── carte-twisto.html                    # Carte transport Twisto
    │   ├── marches-caen.html                    # Carte marchés de Caen
    │   ├── budget-cuclm.html                    # Dashboard budget CUCLM
    │   │
    │   # Pages expertises techniques
    │   ├── modelisation_ia.html                 # Modélisation IA
    │   ├── analyse_donnees_biomedicales.html    # Analyse données
    │   ├── visualisation_donnees.html           # Visualisation
    │   ├── recherche_prototypage.html           # R&D
    │   ├── redaction_documentation.html         # Documentation
    │   ├── bases_donnees_sql.html               # Bases de données
    │   ├── developpement_web.html               # Développement web
    │   ├── developpement_logiciel.html          # Développement logiciel
    │   └── outils_scientifiques.html            # Outils scientifiques
    │
    └── js/                                       # Scripts JavaScript
        ├── script.js                            # Script commun (navigation, etc.)
        ├── carte-twisto.js                      # Logique carte Twisto
        ├── marches-caen.js                      # Logique carte marchés
        ├── budget-cuclm-updated.js              # Dashboard budget CUCLM
        ├── twisto-stops-data.json               # Données arrêts Twisto
        └── marches-caen-data.json               # Données marchés Caen
```

## 🔗 Dépendances et Relations

### **index.html** → Fichier principal
- **CSS:** `src/css/style.css`
- **JS:** `src/js/script.js`
- **Assets:** `assets/pdf/cv.pdf`, `LICENSE`
- **Links:** Toutes les pages de compétences + `projets.html`, `cv.html`, `associatif.html`

### **projets.html** → Portfolio
- **CSS:** `../css/style.css`
- **JS:** `../js/script.js`
- **Links:** `carte-twisto.html`, `marches-caen.html`, `budget-cuclm.html`

### **Projets Interactifs**
- **carte-twisto.html:**
  - JS: `carte-twisto.js` 
  - Data: `twisto-stops-data.json`
  - External: Leaflet.js

- **marches-caen.html:**
  - JS: `marches-caen.js`
  - Data: `marches-caen-data.json`
  - External: Leaflet.js

- **budget-cuclm.html:**
  - JS: `budget-cuclm-updated.js`
  - Data: `../../budget-cuclm-optimized-final.json`
  - External: Leaflet.js, Plotly.js

### **Pages de Compétences**
Toutes utilisent:
- **CSS:** `../css/style.css`
- **JS:** `../js/script.js`

## 🧹 Fichiers Supprimés (Non Utilisés)

### Anciens fichiers de développement:
- `budget-cuclm-complet.json` - Données incomplètes
- `budget-cuclm-final.json` - Version obsolète
- `budget-cuclm-villes.html` - Page non référencée
- `test-json.html` - Fichier de test
- Dossier `pre-data/` - Données de développement
- Dossier `docs/` - Documentation technique obsolète
- Dossier `.venv/` - Environnement Python local
- Scripts JS obsolètes: `budget-cuclm.js`, `budget-cuclm-villes.js`

## 📊 Statistiques du Projet

- **Total fichiers:** 32
- **Pages HTML:** 17 (1 principale + 16 sections)
- **Scripts JavaScript:** 5
- **Fichiers de données:** 3 (JSON)
- **Assets:** 4 (3 images + 1 PDF)
- **Taille optimisée** après nettoyage

## 🎯 Technologies Utilisées

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Frameworks:** Leaflet.js (cartes), Plotly.js (graphiques)
- **Fonts:** Google Fonts (Inter)
- **Icons:** Emojis natifs
- **Responsive:** Mobile-first design

## 🚀 Points d'Entrée

1. **Site principal:** `index.html`
2. **Portfolio:** `src/html/projets.html`
3. **Projets interactifs:** Accessibles via portfolio
4. **Compétences:** Accessibles via page principale

---
*Architecture optimisée le 28 juillet 2025*
