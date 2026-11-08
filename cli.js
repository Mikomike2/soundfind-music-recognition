#!/usr/bin/env node
const path = require('path');

process.env.NEXT_TEST_WASM = '1';
process.env.NEXT_TEST_WASM_DIR = path.resolve(__dirname, 'node_modules/@next/swc-wasm-nodejs');

require('next/dist/bin/next');
