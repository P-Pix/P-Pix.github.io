# Architecture du portfolio

## 1. Objectif et périmètre

Le portfolio présente Guillaume Lemonnier avec une orientation **C++ / Linux, systèmes et communications**. Il permet de passer d’une compétence à un projet, puis à une explication d’architecture et au dépôt source correspondant.

L’accueil privilégie trois réalisations : station sol de télémétrie, serveur de commande et de supervision, enregistreur binaire. Les deux simulateurs de périphériques, ScanGUI, Tetris AutoCPP et Neural Boundary Lab complètent ce parcours. L’expérience de développement métier à l’ARS Normandie, la recherche et la formation sont présentées séparément des projets personnels C++.

Le périmètre de ce dépôt est celui du **site de présentation**. Les programmes C++, leurs dépendances, leur compilation et leurs suites de tests appartiennent aux dépôts GitHub associés. Leurs sources natives originales ne sont pas incluses ici : seules les adaptations WebAssembly autonomes font partie du site. Les vidéos fournies ont été conservées ; les textes ne doivent pas les présenter comme une nouvelle qualification des programmes effectuée pendant la refonte du site.

## 2. Architecture statique

Le portfolio principal repose sur des fichiers HTML, CSS et JavaScript natifs. Il n’utilise pas de framework, de bundle généré, de serveur applicatif ou de base de données. Aucune commande de build n’est nécessaire.

Chaque page contient directement son contenu, son en-tête et son pied de page. Le navigateur peut donc afficher le portfolio principal en ouvrant `index.html`, y compris sans JavaScript. Les chemins relatifs relient les pages, les styles, les scripts et les médias.

| Élément | Responsabilité |
| --- | --- |
| `index.html` | Accueil, positionnement, sélection de projets, tableau de compétences et expérience. |
| `src/html/projets.html` | Catalogue des huit projets et accès aux rubriques complémentaires. |
| `src/html/projet-*.html` | Huit études de cas techniques. |
| `src/html/cv.html` | Parcours et formation ; lien vers le nouveau CV PDF C++ / Linux. |
| `src/html/recherche-emploi.html` | Projet professionnel C++ / Linux. |
| `src/html/contact.html` | Moyens de contact et accès aux profils externes. |
| Autres pages de `src/html/` | Rubriques historiques, engagement associatif et démonstrations de données. |
| `aaaa/` | Site distinct conservé avec ses propres styles et scripts. |

## 3. Présentation commune et compatibilité

### `src/css/style.css`

Cette feuille porte les variables de présentation, les règles de base et les composants du portfolio : en-tête, boutons, cartes, tableau de compétences, études de cas, formulaires, pied de page et dispositions adaptatives.

Les choix visuels sont cohérents sur le parcours principal : dominante blanc et bleu, texte bleu sombre, filets gris, angles peu arrondis et survol gris clair. Des accents discrets d’ivoire et de cuivre apportent de la chaleur aux repères, aux cartes de profil et à la section de contact.

Le portrait et la salutation sont visibles dès l’accueil. Les textes de présentation et de méthode utilisent une voix plus personnelle, centrée sur les projets et les échanges avec les utilisateurs. Les boutons et les encadrés conservent leur présentation sobre.

Le contenu est visible par défaut. La seconde passe ajoute une animation illustrative finie du schéma de télémétrie et une apparition ponctuelle de certains blocs, déclenchée à leur entrée dans la fenêtre. Ces effets sont décrits dans la section suivante.

Les règles incluent un focus clavier visible, le lien d’évitement, les adaptations mobile/tablette, la préférence de réduction des animations et une présentation pour l’impression.

### `src/css/legacy.css`

Les anciennes rubriques conservent leurs composants et, lorsque nécessaire, leurs styles particuliers. La feuille `legacy.css`, chargée après ces styles, adapte les pages portant la classe `legacy-page` : conteneurs, titres, cartes, boutons, champs et couleurs.

Ce périmètre CSS évite d’imposer les anciens composants aux nouvelles pages. Toutes les pages du portfolio utilisent néanmoins le même en-tête, la même navigation et le même script commun.

Le dossier `aaaa/` reste indépendant de ces deux feuilles.

## 4. Interactions communes

Le fichier `src/js/script.js` apporte des améliorations progressives et active la classe `js` sur le document. Le contenu principal reste visible si ce script n’est pas exécuté.

| Fonctionnement | Comportement |
| --- | --- |
| Menu mobile | Bouton associé à `primary-nav`, état `aria-expanded`, libellé ouvrir/fermer, fermeture avec Échap, au changement de taille et lorsque le visiteur quitte le menu. |
| Filtres du catalogue | Boutons par domaine, attributs `data-categories` sur les cartes, visibilité par `hidden` et nombre de résultats annoncé dans une zone de statut. |
| URL du catalogue | Le paramètre `filtre` conserve le domaine sélectionné pour partager un lien. Une valeur inconnue revient à tous les projets. |
| Copie | Copie des commandes et de l’adresse e-mail avec retour de statut ; solution de repli lorsque l’API du presse-papiers est indisponible. |
| Vidéos | Démarrer une vidéo met les autres en pause. La lecture reste contrôlée par le visiteur. |
| Schéma de télémétrie | Deux points animés illustrent le trajet du signal. Chaque animation dure 2,6 secondes et la seconde commence après 0,45 seconde : l’ensemble se termine après environ 3,05 secondes, sans répétition. |
| Apparition au défilement | `IntersectionObserver` observe les blocs `data-reveal`. À leur première entrée dans la fenêtre, la classe `has-entered` déclenche une transition visuelle de 420 ms, puis le bloc cesse d’être observé. Le contenu reste visible avant ce déclenchement. |

Sans JavaScript, les boutons de filtre restent masqués et les huit projets sont visibles. La navigation demeure accessible. Les adresses et commandes restent du texte sélectionnable si la copie automatique n’est pas autorisée.

Les animations sont désactivées avec `prefers-reduced-motion: reduce`. Si cette préférence est activée pendant la consultation, l’observation du défilement est arrêtée. À l’impression, les blocs sont entièrement visibles et les points animés du schéma sont masqués. L’absence d’`IntersectionObserver` laisse les blocs dans leur présentation normale. Cette seconde passe n’ajoute aucune dépendance.

## 5. Structure des études de cas

Les huit pages suivent un parcours commun pour faciliter la comparaison :

1. Présentation du projet et de son environnement technique.
2. Enjeu traité.
3. Architecture et circulation des données.
4. Décisions techniques et raisons des choix.
5. Démonstration fournie et commandes ou indications associées.
6. Accès au code, aux tests et à la documentation dans le dépôt du projet.
7. Périmètre et limites.
8. Projet suivant.

Les fiches distinguent une simulation logicielle, un transport par socket et une intégration à du matériel réel. La station de télémétrie illustre le traitement applicatif de trames simulées ; elle ne décrit pas une réception radio effectuée par ce site. Les résultats et débits affichés dans les vidéos sont présentés comme ceux de ces extraits.

## 6. Démonstrations historiques et données

Les pages `budget-cuclm.html`, `carte-twisto.html` et `marches-caen.html` chargent des données JSON avec `fetch`. Une consultation par HTTP est nécessaire pour leur fonctionnement normal ; ouvrir directement leurs fichiers avec une URL `file:` peut être bloqué par le navigateur.

| Démonstration | Script | Données locales |
| --- | --- | --- |
| Budget de Caen la Mer | `src/js/budget-cuclm-updated.js` | `budget-cuclm-optimized-final.json` |
| Réseau Twisto | `src/js/carte-twisto.js` | `src/js/twisto-stops-data.json` |
| Marchés de Caen | `src/js/marches-caen.js` | `src/js/marches-caen-data.json` |

Leaflet, Plotly et les fonds de carte sont chargés depuis des ressources distantes selon la démonstration. La présence des JSON dans le dépôt ne rend donc pas ces pages entièrement autonomes hors ligne.

### Sélection budgétaire

Le script budgétaire conserve le JSON chargé comme source. Le filtre par fonction dérive une vue des communes concernées et agrège leurs lignes de fonction, sans modifier les valeurs sources. Le choix Tous / Recettes / Dépenses détermine le montant présenté.

La carte, les graphiques, le classement, la synthèse et les détails de la commune utilisent cette sélection. La liste des fonctions vient de l’ensemble des données et demeure disponible après un clic sur une commune. Les communes concernées par une fonction peuvent avoir un montant nul pour le type choisi ; les marqueurs de montant nul sont omis, et les graphiques de répartition signalent une sélection sans montant.

Le bouton Réinitialiser restaure les deux listes de sélection et la vue complète. Le panneau de détail est actualisé lors d’un changement de filtre ou réinitialisé lorsque la commune sélectionnée sort du périmètre.

## 7. Médias et fichiers conservés

Les médias sont servis comme fichiers statiques. Les vidéos de `assets/demos/` conservent leurs posters et utilisent les commandes de lecture natives du navigateur. Le portrait et les images existantes sont dans `assets/images/`.

`assets/pdf/cv-cpp-linux.pdf` est le **CV C++ / Linux proposé aux visiteurs** depuis les boutons du portfolio. Ce document statique reprend les faits professionnels, la formation et les langues fournis et distingue la pratique personnelle du C++ de l’expérience professionnelle. Il peut être actualisé en remplaçant le PDF à ce chemin.

L’ancien CV `assets/pdf/cv.pdf`, orienté vers une candidature doctorale, reste conservé à titre d’archive. Il n’est plus mis en avant dans les liens de consultation ou de téléchargement du site.

Les anciens noms de pages, les fichiers de données et le site indépendant `aaaa/` ont été conservés pour maintenir les accès existants.

## 8. Consultation locale et publication

Pour le portfolio principal, ouvrir `index.html` suffit. Pour tester les démonstrations qui chargent du JSON, servir la racine du projet, par exemple avec `python3 -m http.server 8000`, puis consulter `http://localhost:8000`. Python intervient uniquement comme serveur de fichiers local.

Pour GitHub Pages, publier **le contenu du dossier du projet à la racine du dépôt**, avec `index.html`, `src/`, `assets/`, les données et **`.nojekyll`** au même niveau. Ne pas imbriquer le dossier d’extraction à l’intérieur de la racine publiée. Le fichier `.nojekyll` accompagne la publication statique sans traitement Jekyll.

Les métadonnées canoniques ciblent `https://p-pix.github.io/`. Un changement de domaine nécessite de mettre à jour les métadonnées correspondantes ; les liens internes relatifs continuent de suivre l’arborescence du site.

Le site ne contient pas de mécanisme d’envoi de candidature ou de formulaire vers un serveur : les liens de contact ouvrent le client e-mail ou les profils externes. La mise à jour de ces fichiers ne publie pas, à elle seule, une nouvelle version du dépôt GitHub.
