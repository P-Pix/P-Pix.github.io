# Laboratoire C++ / WebAssembly - P-Pix

Ce dossier fait partie du portfolio statique. Il fournit cinq ateliers executant **du C++20 compile en WebAssembly** et une maquette ScanGUI en HTML/JS. Aucun serveur applicatif n'est necessaire.

## Perimetre exact

| Atelier | Ce qui s'execute dans `labs.wasm` | Ce qui reste natif ou illustre |
| --- | --- | --- |
| Telemetrie STGS | encodage d'une trame v1, champs big-endian, controle CRC32, validations de base | TCP/UDP, fragments, workers, fichiers STGF, traitements, visualisations |
| Mission Control | regles simplifiees de session CONNECT / AUTH / commande privilegiee, mode, stream et compteurs | vrai serveur TCP, multi-clients, atomics/mutex, HTTP, horloge, jeton de production |
| Journalisation binaire | FIFO circulaire et mode **try_push non bloquant** avec saturation | writer multithread, push bloquant du vrai AsyncRecorder, fichiers HPBLR, benchmarks |
| Bus Linux LHBD | trame v1 big-endian (16 + payload + CRC), controle CRC | UNIX socket, transport, retry/timeouts, bus physique |
| Péripherique EDDS | trame de reponse fictive v1 little-endian (10 + payload + CRC), controle CRC | simulateur Python, capteurs physiques, driver Linux, temporisations |
| ScanGUI | HTML/CSS/JS, recherche sur quatre entrees inventees, changement de modes illustre | GTKmm, serveur HTTP, donnees reelles, PostgreSQL, synchro |

**Important :** les executables Linux d'origine ne sont pas directement compiles en WASM. `engine/labs.cpp` est un ensemble d'**adaptateurs autonomes** qui reprennent des formats, constantes et regles de certains chemins des projets sources. L'algorithme CRC-32 correspond au polynome reflechi `0xEDB88320`. L'UI JavaScript gere les formulaires, le terminal et l'affichage ; elle fait appel au WASM pour les operations de protocole et d'etat.

La demonstration de saturation correspond au `BlockingQueue::try_push()` *non bloquant*, qui peut refuser un evenement. La methode `AsyncRecorder::submit()` du projet principal utilise `push()` *bloquant*. La demonstration ne constitue **ni une preuve de performances ni un test de concurrence**.

Les liens vers les depots sources complets sont sur les pages des six projets du portfolio.

## Compiler le moteur

Il faut LLVM/Clang prenant en charge le backend `wasm32` et `wasm-ld` (par exemple une distribution recente avec `clang` et `lld`). La compilation est sans bibliotheque standard C++ ni Emscripten : uniquement du C++ autonome, de petits buffers fixes et une interface C exportee.

```sh
cd demos/engine
./build.sh
```

Le resultat est `labs.wasm`. Le script utilise `CLANGXX` pour personnaliser le compilateur si necessaire.

## Tester

```sh
node demos/tests/verify.mjs
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000/demos/`. L'ouverture en `file://` ne fonctionne pas dans les navigateurs modernes car les modules WASM sont charges avec `fetch()`.

Le code HTML et le WASM sont servis comme fichiers statiques, compatibles avec GitHub Pages sans API, base de donnees ou service tiers. Les ressources du laboratoire (CSS/JS/WASM) sont chargees en chemins relatifs ; les tests de logique peuvent s'executer hors navigateur par Node.js.

## Fichiers

- `index.html` : laboratoire a six ateliers, navigation par `?demo=telemetry|mission|binary|bus|embedded|scangui`.
- `assets/labs.css` : apparence adaptee au portfolio blanc/bleu.
- `assets/labs.js` : rendu, formulaires, gestion d'erreurs, appels WebAssembly.
- `engine/labs.cpp` : adaptateurs C++20 autonomes, commentaires de perimetre.
- `engine/labs.wasm` : module precompile livre avec le site.
- `engine/build.sh` : compilation manuelle reproductible.
- `tests/verify.mjs` : tests CRC, format wire et machines d'etat.

## Limitations

- Pas de sockets TCP/UDP ou UNIX directement dans GitHub Pages.
- Pas de simulation native des verrous, threads et latences disque.
- Pas d'acces a PostgreSQL et pas d'interface GTK native en navigateur.
- L'archive fournie pour le jeu Tetris SDL2 ne contient pas de code source ; aucun portage Tetris n'est annonce.
- Toutes les donnees de simulation sont fictives et restent en memoire, sans collecte reseau par le laboratoire.
