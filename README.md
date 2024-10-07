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

## Added features

For now, CLI does not supports the following features yet.

### change #ifdef tag name

You can change `#ifdef` to another name such as `#iftarget` etc. using the `IfdefJsConfig` like below:

```javascript
const result = ifdefJs.process_string(
	source, ["target-a"],
	{
		alternative_target_tagname: "def"
	}
)
```

Set the `alternative_target_tagname` to a string
like `"x"` will let ifdefJs uses `#ifx` as `#ifdef`, `#ifnx` as `#ifndef`, while `#endif` will still be `#endif`.

```javascript
const result = ifdefJs.process_string(
	source, ["target-a"],
	{
		alternative_target_tagname: {
			start: "ifdef",
			start_rev: "ifndef"
			end: "endif"
		}
	}
)
```

You can also set the `alternative_target_name` to an
object that contains `start`, `start_rev`, `end`.
In this case, `start`'s value indicates `ifdef`,
`start_rev` indicates `ifndef`, `end` indicates
`endif`. Notice that you should not add `#` here
and the ifdefJs will still need a prefixed `#`.

### Replace texts

You can use `IfdefJsConfig.defines` to make the
ifdefJs find and replace the texts. For example,
if you want to change `{{version}}` to `0.0.1`,
just set configs like this:

```javascript
const result = ifdefJs.process_string(
	source, ["target-a"],
	{
		defines: {
			"{{version}}": "0.0.1"
		}
	}
)
```

You can also set multiple find-and-replace pairs,
ifdefJs will find-and-replace them in order. Notice
that the find-and-replace cannot find across lines,
while match multiple times in one line is supported.

```javascript
const result = ifdefJs.process_string(
	source, ["target-a"],
	{
		defines: {
			"{{id}}": "my-hp"
			"{{name}}": "My Hypothetical Project",
			"{{version}}": "0.0.1",
			// due to this match string have \n,
			// means it must match across line,
			// but ifdefJs does not supports matches
			// across line, so this find-and-replace
			// pair will never be matched.
			"# my-hp\n": "# My Hypothetical Project\n"
		}
	}
)
```
