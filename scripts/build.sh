#!/bin/sh

LIGO_VERSION=0.17.0
BUILD_DIRECTORY=./build/michelson
SRC_DIRECTORY=./src/main

# $1: a contract file name without extension
compile_contract() {
    if [[ "$OSTYPE" == "msys"* ]]; then
        ligo="docker run --rm -v /\"\$PWD\":\"\$PWD\" -w /\"\$PWD\" ligolang/ligo:$LIGO_VERSION"
    else
        ligo="docker run --rm -v \"\$PWD\":\"\$PWD\" -w \"\$PWD\" ligolang/ligo:$LIGO_VERSION"
    fi

    eval "$ligo compile-contract --output-file $BUILD_DIRECTORY/$1.tz ${@:2} $SRC_DIRECTORY/$1.religo main"
}

mkdir -p $BUILD_DIRECTORY

# Contracts
compile_contract services-factory $@
