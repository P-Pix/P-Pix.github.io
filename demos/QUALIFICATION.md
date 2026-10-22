# Qualification — Laboratoire C++ / WebAssembly

Date : **22 octobre 2026**. Statut : **site statique qualifié localement dans la limite des tests décrits, publication GitHub non effectuée**.

## Baseline et entrées

Portfolio initial enrichi (six projets, cinq moteurs WASM + ScanGUI) depuis `P-Pix_Portfolio_CPP_WebAssembly_20261022.zip`.
Nouvelles archives analysées : `TetrisAutoCPP(1).zip` et `Neural_Boundary_Lab_CPP17_GitHub(1).zip`, contenant le code et les tests. L'ancienne archive `TetrisAutoLAN_SDL2_PRO(1).zip`, signalée sans source, **n'est plus un blocage**, les sources ayant été fournies dans `TetrisAutoCPP(1).zip`.

## Compilation native des deux nouveaux projets

| Projet | Configuration | Résultat |
| --- | --- | --- |
| Tetris AutoCPP C++17 | CMake, GUI SDL2 désactivée ; coeur / réseau / tests | **2/2 tests CTest réussis** |
| Neural Boundary Lab C++17 | CMake, GUI SDL2 désactivée ; coeur / CLI / tests | **2/2 tests CTest réussis** |

Les six premiers projets avaient déjà été compilés/testés pour les configurations natives disponibles lors de la précédente livraison. Ce contrôle n'exécute pas le jeu SDL2 dans sa fenêtre native et ne teste pas un LAN réel entre deux ordinateurs.

## Compilation WebAssembly

- Ancien module `labs.wasm` : C++20 freestanding, CRC-32 de contrôle `123456789` → `0xCBF43926`, trames STGS/LHBD/EDDS, session fictive MCPS, FIFO.
- Nouveau `tetris.wasm` : C++17 freestanding (mouvements, 7-bag, plateau, réserve, collisions, effacement de lignes, heuristique IA 2-ply).
- Nouveau `neural.wasm` : C++17 freestanding (MLP, backpropagation, métriques, poids ; fonctions math importées du navigateur).
- Compilation LLVM `clang++ --target=wasm32` et `wasm-ld` réussie. Reproduction : `demos/engine/build.sh` et `demos/engine/build-games.sh`.

## Tests automatisés

- `node demos/tests/verify.mjs` : **10/10 PASS** (ancien module).
- `node demos/tests/verify-games.mjs` : **PASS** (pièces, collisions, rotation, réserve, IA, évolution de la partie ; apprentissage XOR 1 et 2 couches, diminution de la perte et précision de test des scénarios fixes).
- **Comparaison Tetris** : 180 actions avec la même graine et les mêmes contrôles, états successifs du plateau et du jeu identiques au programme natif, zéro divergence observée. Cela ne compare pas les IA native 3-ply et web 2-ply.
- Test navigateur Chromium isolé : chargement WASM, jeu manuel clavier, IA, pause/reprise, reset, boutons tactiles, responsive sans débordement ; entraînement XOR et diminution de la perte (~0,734 à ~0,027 dans un scénario), passage entre les datasets, réglage des couches, visualisations et contrôles.
- Contrôles du site : catalogue **8 projets** et filtre IA, accueil, navigation vers les nouvelles démos ; anciens scénarios navigateur conservés, absence d'erreurs JavaScript dans les scénarios parcourus.

## Restrictions de qualification

- Les deux modules sont des adaptations C++ sélectionnées, **pas des exécutables SDL2 ni des logiciels Linux entiers** exécutés dans le navigateur.
- Pas de sockets TCP natifs, de serveur applicatif ni de multithreading natif dans GitHub Pages.
- IA Tetris à deux coups d'anticipation au lieu de trois ; pas de mode versus LAN dans la page web.
- Neural : génération des points et tracés par JavaScript et pseudo-aléatoire différent de l'original ; les résultats peuvent varier.
- ScanGUI conserve son rôle de maquette HTML sur données fictives, sans GTK/PostgreSQL réels.
- Le banc Chromium charge les fichiers locaux en mémoire ; la politique de son environnement ne permet pas la navigation directe vers un serveur `localhost`. **Un essai HTTP normal et une vérification sur GitHub Pages après `git push` restent nécessaires**.
- Aucun accès en écriture au dépôt GitHub depuis ce travail, donc aucune publication distante attestée.
