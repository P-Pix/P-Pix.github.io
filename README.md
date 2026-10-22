# Portfolio — Guillaume Lemonnier

Portfolio statique destiné à présenter un profil de développeur logiciel orienté **C++ et Linux**, avec un intérêt pour les logiciels du spatial, la télémétrie et les télécommunications.

La refonte du 21 octobre 2026 privilégie une lecture professionnelle : dominante blanc et bleu, encadrés aux angles peu arrondis, bordures fines et survols gris clair. La seconde passe apporte une présence plus personnelle avec le portrait dès l’accueil, la salutation « Bonjour, moi c’est Guillaume », des textes plus naturels et des touches discrètes d’ivoire et de cuivre. L’accueil relie chaque domaine technique à une réalisation et distingue les **projets personnels C++** de l’**expérience professionnelle en développement métier à l’ARS Normandie**.

Le schéma de télémétrie reçoit une animation illustrative courte, terminée après environ **3,05 secondes**. Certains blocs bénéficient d’une apparition ponctuelle au défilement avec `IntersectionObserver`. Le contenu reste visible par défaut, y compris sans JavaScript ; la préférence de réduction des animations et l’impression sont respectées. Ces ajustements n’ajoutent aucune dépendance.

## Laboratoire C++ interactif (22 octobre 2026)

[**Lancer le laboratoire**](demos/index.html?demo=telemetry) - cinq ateliers executes par un module WebAssembly compile depuis du C++20, et une maquette illustrative ScanGUI :

- STGS : construire, controler, corrompre et restaurer une trame de telemetrie.
- MCPS : tester CONNECT/AUTH, les droits et les modes d'une session fictive.
- HPBLR : visualiser la saturation d'une file circulaire, en `try_push` non bloquant (ce n'est pas le writer natif).
- LHBD et EDDS : inspecter des trames big-endian/little-endian avec leur CRC-32.
- ScanGUI : parcourir une maquette HTML avec donnees inventees (pas de GTK ni de PostgreSQL).

Le laboratoire est **precompile et directement publiable sur GitHub Pages**. Pour le tester sur votre poste, utiliser `python3 -m http.server 8000` a la racine du site, puis ouvrir `http://localhost:8000/demos/`. Le simple double-clic sur le fichier HTML (`file://`) est insuffisant pour charger le WASM.

Les modules n'embarquent pas la totalite des projets natifs : le fichier [`demos/README.md`](demos/README.md) precise les chemins de code portes, les limitations et les tests. L'adaptateur C++20 inclus dans `demos/engine/labs.cpp` est distinct des sources originales, qui restent accessibles dans leurs depots.

**Tetris SDL2 non integre :** l'archive recue ne contient que des dossiers vides, sans `.cpp` ni `.hpp` a compiler.

## Parcours de lecture

| Page | Contenu |
| --- | --- |
| [Accueil](index.html) | Positionnement C++/Linux, trois projets prioritaires, compétences reliées au code, expérience et contacts. |
| [Projets C++](src/html/projets.html) | Six études de cas avec filtres par domaine et accès aux autres réalisations. |
| [Laboratoire C++ interactif](demos/index.html) | Cinq ateliers WebAssembly et une maquette ScanGUI. |
| [Parcours](src/html/cv.html) | Expérience ARS, recherche au GREYC, développement scientifique au CERMN et formation. |
| [Projet professionnel](src/html/recherche-emploi.html) | Orientation vers le développement C++ sous Linux pour le spatial et les télécommunications. |
| [Contact](src/html/contact.html) | Adresse e-mail, copie de l’adresse, GitHub, LinkedIn et CV. |

## Six études de cas C++

La sélection principale donne la priorité à la station de télémétrie, au serveur de commande et à l’enregistreur binaire.

| Projet | Sujets présentés | Étude de cas |
| --- | --- | --- |
| Station sol de télémétrie | Simulation logicielle, UDP/TCP, trames binaires, CRC, concurrence et relecture. | [Télémétrie](src/html/projet-telemetrie.html) |
| Mission Control Protocol Server | Sessions TCP, commandes, état partagé, gestion des ressources et supervision. | [Serveur de commande](src/html/projet-mission-control.html) |
| High-Performance Binary Log Recorder | Producteurs multiples, file bornée, écriture asynchrone, intégrité et mesure du débit. | [Enregistreur binaire](src/html/projet-binary-log.html) |
| Linux Hardware Bus Driver Simulator | Pilote en espace utilisateur, périphérique simulé, socket Unix, délais et erreurs. | [Pilote utilisateur](src/html/projet-driver-bus.html) |
| Embedded Device Driver Simulator | API C++ typée pour capteurs simulés, séparation transport/protocole et tests avec mocks. | [Interface de capteurs](src/html/projet-embedded-driver.html) |
| ScanGUI | Application native GTKmm, sources de données, API HTTP et PostgreSQL. | [Application native](src/html/projet-scangui.html) |

Chaque page présente le contexte, l’architecture, les décisions, une démonstration, le périmètre et le lien vers le dépôt source. Les mentions de simulation et les limites techniques sont explicites.

**Les projets natifs C++ complets sont dans les dépôts GitHub associés ; ils ne font pas partie de cette archive du site.** Un adaptateur C++20 propre aux démonstrations WebAssembly est maintenant livré dans `demos/engine/labs.cpp`. La refonte porte sur le portfolio. Les vidéos et posters fournis dans `assets/demos/` ont été conservés : leur présence ne constitue pas une nouvelle compilation ou exécution des projets pendant cette refonte. Les mesures affichées dans un extrait correspondent à cet extrait, avec ses limites de contexte.

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
5. Après publication, vérifier l’accueil, les six études de cas, le laboratoire `demos/`, le CV, les contacts et les démonstrations de données.

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
| `demos/` | Laboratoire C++ avec page interactive, moteur `.wasm`, adaptateurs C++20 et tests. |
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
