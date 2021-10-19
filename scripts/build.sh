#!/bin/bash

LIGO_VERSION=0.24.0
BUILD_DIRECTORY=./build
BUILD_MICHELSON_DIRECTORY=$BUILD_DIRECTORY/michelson
BUILD_JSON_DIRECTORY=$BUILD_DIRECTORY/json
CONTRACTS_DIRECTORY=./src/main
LAMBDAS_DIRECTORY=./src/lambdas

if [[ "$OSTYPE" == "msys"* ]]; then
    ligo="docker run --rm -v /\"\$PWD\":\"\$PWD\" -w /\"\$PWD\" ligolang/ligo:$LIGO_VERSION"
else
    ligo="docker run --rm -v \"\$PWD\":\"\$PWD\" -w \"\$PWD\" ligolang/ligo:$LIGO_VERSION"
fi

mkdir -p $BUILD_MICHELSON_DIRECTORY $BUILD_JSON_DIRECTORY

# $1: a contract file name without extension
compile_contract() {
    echo "Compile contract: $1"
    eval "$ligo compile-contract --michelson-format=text --output-file $BUILD_MICHELSON_DIRECTORY/$1.tz \
        $CONTRACTS_DIRECTORY/$1.religo main"
    eval "$ligo compile-contract --michelson-format=json --output-file $BUILD_JSON_DIRECTORY/$1.json \
        $CONTRACTS_DIRECTORY/$1.religo main"
}

# $1: a contract file name without extension
# $2: a lambda name
compile_lambda() {
    echo "Compile lambda: $1"
    eval "$ligo compile-parameter --michelson-format=text --output-file $BUILD_MICHELSON_DIRECTORY/$1_lambda.tz ${@:3} \
        $LAMBDAS_DIRECTORY/$1.religo main '$2'"
    eval "$ligo compile-parameter --michelson-format=json --output-file $BUILD_JSON_DIRECTORY/$1_lambda.json ${@:3} \
        $LAMBDAS_DIRECTORY/$1.religo main '$2'"
}

# Contracts
compile_contract services-factory $@
compile_contract service $@
compile_contract services-factory-implementation $@
