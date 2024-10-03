# Universal Preprocessor

[![NPM Version](https://img.shields.io/npm/v/uni-preprocessor)](https://www.npmjs.com/package/uni-preprocessor)
[![NPM Downloads](https://img.shields.io/npm/dy/uni-preprocessor)](https://www.npmjs.com/package/uni-preprocessor)

An util library / cli tool for preprocessing any type of files.

Currently used implementation is [ifdef.js](https://github.com/davebalmer/ifdefjs), written in Dave Balmer. You can find more about how it works there.

## Library

The original project is just a cli program and does not provides any export functions.

This project exports a function `ifdef_js.process_string(...)`, it receives string as the file content, and output the preprocessed string file content. For more information, you can see the function comments.

```js
import upp from "uni-preprocessor"

const file_content = ...

const targets = ["windows", "app", "melty_kiss"]
const [processed_result, warnings] = upp.ifdef_js.process_string(file_content, targets)
```

## CLI

This package exported two CLI command, `uni-preprocessor` and `upp`. These two command are equivalent to each other.

You can use `npm install --global uni-preprocessor` to install the CLI to your computer, or use `npm install --save-dev uni-preprocessor` to install this CLI to your project develop environment.

Then, just use `$ upp --help` to see the help page. There are helps and examples for the CLI.
