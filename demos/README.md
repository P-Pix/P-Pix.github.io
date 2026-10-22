# Laboratoire C++ / WebAssembly — 8 projets

Site statique compatible GitHub Pages : **sept démonstrations C++ réellement compilées en WebAssembly** et une maquette HTML illustrant ScanGUI. Toutes les données de démonstration sont fictives et traitées localement dans le navigateur.

## Périmètre des démonstrations

| Démonstration | Code compilé en WASM | Limites par rapport au projet d'origine |
| --- | --- | --- |
| Télémétrie STGS | Fabrication / contrôle des trames v1, endianness, CRC-32 | Sans TCP/UDP, workers ni formats fichiers complets |
| Mission Control | Session fictive CONNECT / AUTH, autorisations et commandes | Sans serveur TCP réel, concurrence ou secret de production |
| Journalisation binaire | FIFO circulaire et `try_push` non bloquant | Ne reproduit ni l'enregistreur asynchrone ni les mesures de débit |
| Bus Linux LHBD | Trame big-endian et CRC | Sans socket UNIX, temporisation ni matériel |
| Périphérique EDDS | Trame little-endian et CRC | Sans vrai pilote, bus physique ou capteurs |
| ScanGUI | **Pas de WASM : maquette HTML/JS** avec données inventées | Sans GTKmm, PostgreSQL ni API de production |
| **Tetris AutoCPP** | Règles 10 × 20, 7-bag, mouvements, rotation, hold, score, effacement de lignes et IA 2-ply en C++17 | Pas de SDL2, de mode LAN TCP ni d'IA 3-ply native |
| **Neural Boundary Lab** | Prédictions du MLP, descente de gradient, rétropropagation, métriques et poids C++17 | Distribution des points et dessin JS, générateur pseudo-aléatoire différent, fonctions mathématiques importées |

Le moteur des cinq premières démonstrations est `engine/labs.cpp` (C++20) → `engine/labs.wasm`. Les deux nouveaux moteurs sont `engine/tetris_wasm.cpp` et `engine/neural_wasm.cpp` (C++17), compilés respectivement en `tetris.wasm` et `neural.wasm`. Ces adaptateurs ont été élaborés depuis le comportement et les contrats des projets sources ; ils ne constituent pas des conversions intégrales.

## Parcours des démonstrations

- `index.html?demo=telemetry|mission|binary|bus|embedded|scangui` : laboratoire initial, cinq moteurs de protocole et ScanGUI.
- `tetris/index.html` + `tetris/tetris.js` : Canvas du jeu, IA, commandes clavier/tactiles.
- `neural/index.html` + `neural/neural.js` : carte de décision, points, réseaux, courbe de perte, commandes d'entraînement.
- `assets/playground.css` : présentation responsive blanche et bleue des deux ateliers ajoutés.

## Compilation et reproduction

LLVM/Clang avec `wasm32` et `wasm-ld` est nécessaire uniquement si vous souhaitez **recompiler** : les `.wasm` sont déjà inclus.

```sh
./demos/engine/build.sh        # 5 ateliers de protocole (C++20)
./demos/engine/build-games.sh  # Tetris et réseau neuronal (C++17)
node demos/tests/verify.mjs
node demos/tests/verify-games.mjs
```

Les programmes sont compilés sans libc/libstdc++ ni Emscripten (cible `wasm32` autonome, exports C, petits buffers statiques). Le module neuronal importe `exp`, `tanh`, `log`, `sqrt` depuis l'environnement JavaScript ; les démonstrations ne dépendent pas d'un CDN.

Pour une démonstration locale, depuis la racine du site :

```sh
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000/demos/`, `/demos/tetris/` ou `/demos/neural/`. `file://` ne suffit pas, car JavaScript utilise `fetch()` pour charger le WASM.

## Validation et fidélité

Les tests natifs des **deux nouveaux projets** passent (2 CTests Tetris, 2 CTests Neural). Les adaptateurs ont leurs tests dédiés dans `tests/verify-games.mjs`. Un comparateur indépendant a confirmé la parité des états de Tetris sur **180 actions**, même graine et même séquence d'entrées, avec le cœur natif. Les scénarios du navigateur ont été effectués dans Chromium pour les deux nouveaux modules, les contrôles tactiles, les anciens ateliers et les filtres du site.

Les tests ne constituent pas une qualification des modes LAN, SDL2, ni du fonctionnement de GTK/PostgreSQL en production. Les jeux synthétiques et les scores affichés ne sont pas des jeux de données scientifiques de référence. Les changements de générateur aléatoire de Neural et l'heuristique de Tetris limitée à deux niveaux rendent certains résultats différents des programmes natifs.

Le projet original **Neural Boundary Lab** comporte une licence MIT ; sa mention est conservée dans `engine/LICENSE-neural-source.txt`. Les archives sources originales de Tetris et Neural ont été transmises séparément et **ne sont pas contenues dans le site**. Voir `QUALIFICATION.md` pour les preuves de test et les réserves de publication.
