#!/bin/bash

# ldc2 -mtriple=wasm32-unknown-unknown-wasm -betterC wasm.d
# -L-allow-undefined
# --compiler=ldc2
# , "lflags": ["-allow-undefined"]

dub build --compiler=ldc2 --arch=wasm32-unknown-unknown-wasm "$@"
