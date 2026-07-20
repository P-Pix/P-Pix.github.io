# Portfolio - Guillaume Lemonnier

Site statique GitHub Pages présentant mon profil de développeur logiciel avec deux axes complémentaires :

- ingénierie C++20/Linux : réseau, protocoles binaires, concurrence, drivers, performance et applications natives ;
- conception full-stack de logiciels métier : besoin, UX, API, données, sécurité, documentation et accompagnement.

## Contenu principal

- `index.html` : positionnement, projets phares, compétences et expérience professionnelle ;
- `src/html/projets.html` : index des six études de cas C++ ;
- `src/html/projet-*.html` : une page détaillée par projet avec architecture, décisions, tests et démonstration ;
- `src/html/cv.html` : parcours et socle technique ;
- `src/html/contact.html` : points de contact professionnels.

## Études de cas C++

1. Space Telemetry Ground Station ;
2. Mission Control Protocol Server ;
3. Linux Hardware Bus Driver Simulator ;
4. High-Performance Binary Log Recorder ;
5. Embedded Device Driver Simulator ;
6. ScanGUI.

Les vidéos présentes dans `assets/demos/` sont des captures terminal courtes construites à partir de sorties réellement obtenues après compilation et exécution des projets. Elles n’imitent pas une interface graphique qui n’aurait pas été lancée.

## Exécution locale

Le site n’utilise aucune étape de build :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Principes techniques

- HTML/CSS/JavaScript sans framework ni dépendance de production ;
- responsive desktop, tablette et mobile ;
- navigation clavier, lien d’évitement et respect de `prefers-reduced-motion` ;
- images optimisées en WebP ;
- vidéos MP4 H.264 avec poster PNG et chargement différé des données ;
- chemins relatifs compatibles avec GitHub Pages.

## Licence

Voir [LICENSE](LICENSE).
