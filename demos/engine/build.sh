#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
: "${CLANGXX:=clang++}"
"$CLANGXX" --target=wasm32 -std=c++20 -O2 -nostdlib \
  -Wl,--no-entry -Wl,--export-all -Wl,--export-memory \
  -Wl,-z,stack-size=131072 -Wl,--initial-memory=262144 \
  labs.cpp -o labs.wasm
printf 'Generated %s bytes: %s\n' "$(wc -c < labs.wasm)" "$(pwd)/labs.wasm"
