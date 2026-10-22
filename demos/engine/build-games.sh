#!/bin/sh
set -eu
cd "$(dirname "$0")"
: "${CLANGXX:=clang++}"
for module in tetris neural; do
  "$CLANGXX" --target=wasm32 -std=c++17 -O2 -Wall -Wextra -nostdlib \
    -Wl,--no-entry -Wl,--export-all -Wl,--export-memory -Wl,--allow-undefined \
    -Wl,-z,stack-size=262144 -Wl,--initial-memory=524288 \
    "${module}_wasm.cpp" freestanding_memory.cpp -o "${module}.wasm"
  wc -c "${module}.wasm"
done
