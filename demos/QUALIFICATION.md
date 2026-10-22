# Qualification - Laboratoire C++ / WebAssembly

Date du travail : 2026-10-22

## Sources examinees

- `cpp-space-telemetry-ground-station-main.zip`
- `cpp-mission-control-protocol-server-main.zip`
- `cpp-high-performance-binary-log-recorder-main.zip`
- `cpp-linux-hardware-bus-driver-simulator-main.zip`
- `cpp-embedded-device-driver-simulator-main.zip`
- `ScanGUI-main.zip`
- `TetrisAutoLAN_SDL2_PRO(1).zip` (aucun fichier source, seulement des dossiers)
- `P-Pix.github.io-main(1).zip` (site conserve et enrichi)

## Verification du module WebAssembly

- Clang avec backend wasm32, cible C++20 freestanding : compilation reussie.
- Le module `demos/engine/labs.wasm` est fourni et teste sous Node.js.
- `node demos/tests/verify.mjs` : **10/10 PASS**.
- Test de la constante CRC32 avec `123456789` -> `0xCBF43926`.
- Validation de trames STGS (float32 BE, timestamp u64, CRC), LHBD (BE), EDDS (LE).
- Injection d'un bit modifie -> erreur CRC dans les 3 codecs.
- Machine d'etat MCPS (CONNECT, AUTH, mode, flux) et ring buffer FIFO.

## Verifications natives des six depots

Le code des depots fournis a ete compile separement avec CMake/CTest pour la cible Linux, puis teste :

| Projet | Configuration et resultat CTest |
| --- | --- |
| Space Telemetry Ground Station | `stgs_tests`, 1/1 PASS |
| Mission Control Protocol Server | 1/1 PASS |
| High Performance Binary Log Recorder | 2/2 PASS |
| Linux Hardware Bus Driver Simulator | 2/2 PASS (dont integration) |
| Embedded Device Driver Simulator | 1/1 PASS |
| ScanGUI | GUI OFF, SERVER OFF, tests du coeur 1/1 PASS |

Ces resultats n'equivalent pas a une qualification complete des logiciels natifs sur leur materiel cible. ScanGUI n'a pas ete valide avec GTKmm ni PostgreSQL dans cet environnement.

## Tests interface

Un navigateur Chromium isole a teste la page en injectant les ressources locales en memoire : navigation entre les six ateliers, changement du contenu WASM, corruption/restauration CRC, authentification fictive MCPS, saturation FIFO et recherche maquette. Tous les scenarios ont fonctionne sans erreur JavaScript. L'interface est aussi verifiee en largeurs 1440 et 390 px.

La navigation de Chromium directement vers un serveur localhost est bloquee par la politique de l'environnement de verification. Ces tests ne remplacent donc pas une verification finale sur l'URL publique GitHub Pages apres publication.

## Publication

Le projet reste 100% statique. Le ZIP livre contient la copie complete du portfolio enrichie : `index.html` est a la racine, `.nojekyll` est present, `demos/engine/labs.wasm` est livre. Il reste a copier les fichiers dans la branche de publication du depot GitHub, les pousser, puis controler les URL publiques.

Aucune publication directe sur le depot GitHub n'a ete realisee : la connexion GitHub n'etait pas disponible.
