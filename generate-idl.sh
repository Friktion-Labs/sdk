#!/usr/bin/env bash

# Create IDL files without having to build the whole project in Rust

echo Generating IDL json and types

mkdir -p dao-examples/programs/target/idl/
mkdir -p volt-sdk/idls/

anchor idl parse --file dao-examples/programs/dao-examples/src/lib.rs > target/idl/daoexamples.json

echo "export type DaoExamplesIDL = $(cat target/idl/daoexamples.json);" > src/idls/daoexamples.ts
echo "export const DaoExamplesIDLJsonRaw = $(cat target/idl/daoexamples.json);" >> src/idls/daoexamples.ts