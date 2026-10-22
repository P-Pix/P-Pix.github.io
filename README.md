# Portfolio — Guillaume Lemonnier

Portfolio statique destiné à présenter un profil de développeur logiciel orienté **C++ et Linux**, avec un intérêt pour les logiciels du spatial, la télémétrie et les télécommunications.

La refonte du 21 octobre 2026 privilégie une lecture professionnelle : dominante blanc et bleu, encadrés aux angles peu arrondis, bordures fines et survols gris clair. La seconde passe apporte une présence plus personnelle avec le portrait dès l’accueil, la salutation « Bonjour, moi c’est Guillaume », des textes plus naturels et des touches discrètes d’ivoire et de cuivre. L’accueil relie chaque domaine technique à une réalisation et distingue les **projets personnels C++** de l’**expérience professionnelle en développement métier à l’ARS Normandie**.

Le schéma de télémétrie reçoit une animation illustrative courte, terminée après environ **3,05 secondes**. Certains blocs bénéficient d’une apparition ponctuelle au défilement avec `IntersectionObserver`. Le contenu reste visible par défaut, y compris sans JavaScript ; la préférence de réduction des animations et l’impression sont respectées. Ces ajustements n’ajoutent aucune dépendance.

## Laboratoire C++ interactif (22 octobre 2026)

[**Ouvrir le laboratoire historique**](demos/index.html?demo=telemetry) — cinq ateliers reposant sur un module WebAssembly compilé depuis du C++20, plus une maquette illustrative ScanGUI :

- **STGS** : fabriquer, vérifier, corrompre et restaurer une trame de télémétrie.
- **MCPS** : tester la machine d'état CONNECT/AUTH et les droits d'une session fictive.
- **HPBLR** : visualiser la saturation d'une file circulaire en `try_push` non bloquant.
- **LHBD et EDDS** : décoder des trames avec endianness et CRC-32.
- **ScanGUI** : consulter une maquette HTML sur des données fictives (pas d'exécution GTK/PostgreSQL).

**Deux démonstrations WebAssembly supplémentaires, avec leurs propres interfaces :**

- [**Tetris AutoCPP, jouable**](demos/tetris/index.html) : moteur de jeu C++17, clavier et boutons tactiles, score, réserve, IA de placement, pause et contrôle de vitesse. La version navigateur ne possède pas de connexion TCP/LAN et réduit l'IA à deux coups d'anticipation contre trois dans le programme natif.
- [**Neural Boundary Lab**](demos/neural/index.html) : réseau neuronal C++17 entraîné dans le navigateur (propagation, rétropropagation, gradient), quatre jeux de points synthétiques, frontières de décision, courbe de perte et architecture des couches. Les points et graphiques sont affichés par JavaScript.

**Bilan : sept démonstrations C++ compilées en WebAssembly et une maquette HTML, soit huit projets présentés.** Les moteurs fournis sont des adaptations autonomes et non des compilations intégrales des applications natives. Le code, les limites détaillées et les tests figurent dans [`demos/README.md`](demos/README.md).

Pour tester localement :

```sh
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000/demos/`, `http://localhost:8000/demos/tetris/` ou `http://localhost:8000/demos/neural/`. L'ouverture en `file://` n'est pas adaptée au chargement des modules WASM par `fetch()`.

## Parcours de lecture

| Page | Contenu |
| --- | --- |
| [Accueil](index.html) | Positionnement C++/Linux, trois projets prioritaires, compétences reliées au code, expérience et contacts. |
| [Projets C++](src/html/projets.html) | Huit études de cas avec filtres par domaine et accès aux autres réalisations. |
| [Laboratoire C++ interactif](demos/index.html) | Cinq ateliers WebAssembly et une maquette ScanGUI, avec liens vers les deux nouvelles démonstrations C++17. |
| [Parcours](src/html/cv.html) | Expérience ARS, recherche au GREYC, développement scientifique au CERMN et formation. |
| [Projet professionnel](src/html/recherche-emploi.html) | Orientation vers le développement C++ sous Linux pour le spatial et les télécommunications. |
| [Contact](src/html/contact.html) | Adresse e-mail, copie de l’adresse, GitHub, LinkedIn et CV. |

## Huit études de cas C++

La sélection principale donne la priorité à la station de télémétrie, au serveur de commande et à l’enregistreur binaire.

| Projet | Sujets présentés | Étude de cas |
| --- | --- | --- |
| Station sol de télémétrie | Simulation logicielle, UDP/TCP, trames binaires, CRC, concurrence et relecture. | [Télémétrie](src/html/projet-telemetrie.html) |
| Mission Control Protocol Server | Sessions TCP, commandes, état partagé, gestion des ressources et supervision. | [Serveur de commande](src/html/projet-mission-control.html) |
| High-Performance Binary Log Recorder | Producteurs multiples, file bornée, écriture asynchrone, intégrité et mesure du débit. | [Enregistreur binaire](src/html/projet-binary-log.html) |
| Linux Hardware Bus Driver Simulator | Pilote en espace utilisateur, périphérique simulé, socket Unix, délais et erreurs. | [Pilote utilisateur](src/html/projet-driver-bus.html) |
| Embedded Device Driver Simulator | API C++ typée pour capteurs simulés, séparation transport/protocole et tests avec mocks. | [Interface de capteurs](src/html/projet-embedded-driver.html) |
| ScanGUI | Application native GTKmm, sources de données, API HTTP et PostgreSQL. | [Application native](src/html/projet-scangui.html) |
| Tetris AutoCPP | Moteur C++17/SDL2, heuristiques, contrôles et protocole TCP/LAN. | [Jeu et IA](src/html/projet-tetris.html) |
| Neural Boundary Lab | Réseau neuronal C++17, rétropropagation, apprentissage supervisé et visualisation 2D. | [Classification 2D](src/html/projet-neural.html) |

Chaque page présente le contexte, l’architecture, les décisions, une démonstration et le périmètre. Les liens vers des dépôts précis sont fournis lorsqu’ils ont été identifiés ; pour les nouveaux projets, le profil GitHub général est proposé sans inventer d’URL de dépôt. Les mentions de simulation et les limites techniques sont explicites.

**Les sources natives originales des projets ne font pas partie de cette archive du site.** Elles ont été transmises séparément dans les ZIP des projets. Les adaptateurs C++ du laboratoire sont livrés sous `demos/engine/` avec les modules `.wasm` correspondants. La refonte porte sur le portfolio. Les vidéos et posters fournis dans `assets/demos/` ont été conservés : leur présence ne constitue pas une nouvelle compilation ou exécution des projets pendant cette refonte. Les mesures affichées dans un extrait correspondent à cet extrait, avec ses limites de contexte.

## Ouvrir le site localement

### Portfolio principal

Le portfolio utilise HTML, CSS et JavaScript natifs. Il n’a **aucune étape de build** et ne nécessite ni installation npm ni serveur applicatif.

Pour consulter l’accueil, les études de cas, le parcours, les médias et le CV, ouvrir directement `index.html` dans un navigateur. Le contenu reste lisible lorsque JavaScript est désactivé ; le menu adaptatif, les filtres et les boutons de copie sont des améliorations progressives.

Les liens GitHub, LinkedIn et autres destinations externes nécessitent une connexion. La copie dans le presse-papiers dépend des autorisations du navigateur ; l’adresse reste affichée et sélectionnable.

### Démonstrations de cartes et de données

Les pages Budget de Caen la Mer, Twisto et Marchés de Caen utilisent des fichiers JSON chargés avec `fetch`. Pour les consulter, lancer un serveur HTTP **depuis la racine du projet**, là où se trouve `index.html` :

```bash
python3 -m http.server 8000
```

Sous Windows, si Python est installé avec son lanceur :

```powershell
py -m http.server 8000
```

Ouvrir ensuite [http://localhost:8000](http://localhost:8000).

Python sert uniquement les fichiers lors de cette consultation locale. Il n’est pas nécessaire au fonctionnement du site publié sur GitHub Pages.

Les démonstrations historiques chargent également **Leaflet, Plotly et des fonds de carte distants** selon la page. Elles nécessitent donc un accès réseau pour ces ressources. Le site complet ne doit pas être présenté comme entièrement utilisable hors ligne.

## Publier sur GitHub Pages

1. Décompresser l’archive.
2. Copier **le contenu du dossier `P-Pix.github.io-main` à la racine du dépôt `P-Pix.github.io`**. Le fichier `index.html` doit se trouver directement à cette racine, accompagné de `src/`, `assets/`, du JSON budgétaire et des autres fichiers fournis.
3. Conserver le fichier **`.nojekyll`**, inclus dans cette livraison, pour une publication statique sans traitement Jekyll.
4. Enregistrer les changements dans la branche choisie et configurer GitHub Pages pour publier son répertoire racine `/`.
5. Après publication, vérifier l’accueil, les huit études de cas, le laboratoire `demos/` et les deux nouvelles démonstrations, le CV, les contacts et les démonstrations de données.

Ne pas créer un niveau supplémentaire `P-Pix.github.io/P-Pix.github.io-main/` lors de la copie : les fichiers du site doivent être au niveau de publication.

Les URL canoniques et les métadonnées de partage ciblent `https://p-pix.github.io/`. Si le domaine change, mettre ces valeurs à jour dans les pages concernées.

## Organisation et maintenance

| Emplacement | Rôle |
| --- | --- |
| `src/css/style.css` | Présentation commune, navigation, accueil, études de cas, responsive, focus clavier et impression. |
| `src/css/legacy.css` | Adaptation des anciennes rubriques et démonstrations à la présentation commune. |
| `src/js/script.js` | Menu mobile, filtres du catalogue, copie de texte et coordination de la lecture des vidéos. |
| `src/js/budget-cuclm-updated.js` | Vue budgétaire, filtres fonction/type, carte, graphiques et réinitialisation. |
| `src/js/carte-twisto.js`, `src/js/marches-caen.js` | Fonctionnement des cartes historiques. |
| `assets/demos/` | Vidéos et posters fournis. |
| `demos/` | Laboratoire C++20 à cinq ateliers, ScanGUI simulé, Tetris et Neural Boundary Lab en C++17/WebAssembly, scripts et tests. |
| `assets/images/` | Portrait, images existantes et favicon. |
| `assets/pdf/cv-cpp-linux.pdf` | CV C++ / Linux proposé par les boutons du portfolio. |
| `assets/pdf/cv.pdf` | Ancien CV conservé à titre d’archive, sans mise en avant dans le site. |
| `aaaa/` | Site distinct conservé dans l’archive ; sa présentation et ses fichiers restent indépendants du portfolio. |

La page Parcours et le nouveau PDF `assets/pdf/cv-cpp-linux.pdf` présentent le même positionnement C++ / Linux. Le CV s’appuie sur les faits professionnels, la formation et les langues fournis, en distinguant les projets personnels C++ de l’expérience professionnelle. Il est servi comme fichier statique. Pour actualiser le CV proposé aux visiteurs, remplacer ce fichier en conservant son chemin ou mettre à jour les liens correspondants.

L’ancien `assets/pdf/cv.pdf`, orienté vers une candidature doctorale, reste conservé dans les fichiers du projet à titre d’archive. Les boutons du portfolio pointent vers le nouveau CV C++ / Linux.

Les autres pages thématiques et démonstrations restent accessibles depuis la section complémentaire du catalogue. Les noms de fichiers et leurs chemins ont été conservés pour maintenir les liens existants.

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour les responsabilités et les choix de fonctionnement.

## Licence

Voir [LICENSE](LICENSE).
