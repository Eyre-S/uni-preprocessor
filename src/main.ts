#!/usr/bin/env node

import fs from "node:fs"
import app from "./app.js"
import res from "./res/index.js"
import ifdefJs from "./libs/ifdef-js.js"
import path from "node:path"

let args = process.argv.slice(2)

if (args.includes("--help") || args.includes("-h")) {
	console.log(
		res.readString("help.txt")
			.replace("{{app_version}}", app.version)
	)
	process.exit(0);
}
if (args.includes("--version") || args.includes("-v")) {
	console.log(`Universal Preprocessor - v${app.version}`)
	process.exit(0);
}

let log_mode: boolean        = false
let output_file: string|null = null
let input_file: string|null  = null
let targets: string[] = []

let message_stack: string[] = []
function logs (message: string, enforce: boolean = false) {
	
	if (enforce && !log_mode) {
		console.log("uni-preprocessor: " + message)
		return
	}
	
	message_stack.push("uni-preprocessor: " + message)
	if (log_mode) {
		message_stack.forEach(m => console.log(m))
		message_stack = []
	}
	
}

function result (result: string) {
	
	if (!log_mode) {
		console.log(result)
	}
	
	if (output_file != null) {
		
		const out_path = path.parse(output_file)
		const out_dir = out_path.dir
		logs(`debug: output dir: ${out_dir}`)
		if (!fs.existsSync(out_dir)) {
			logs(`seems output dir not exists, creating output directory: ${out_dir}`)
			fs.mkdirSync(out_dir, { recursive: true })
		}
		
		logs(`write output to ${output_file}`)
		fs.writeFileSync(output_file, result)
		
	}
	
}

for (let i = 0; i < args.length; i++) {
	
	let arg = args[i]
	
	if (
		arg == "--verbose" ||
		arg == "-V"
	) {
		logs("enabled verbose mode.")
		logs("preprocess result will not be printed to the console. make sure you have set --output option.")
		log_mode = true
		continue
	}
	
	if (
		arg == "-o" ||
		arg == "--output" ||
		arg == "--out"
	) {
		i++; arg = args[i]
		output_file = arg
		logs(`set output file to: ${output_file}`)
		log_mode = true
		continue
	}
	
	if (
		arg == "--target" ||
		arg == "-t"
	) {
		i++; arg = args[i]
		const local_targets = arg.split(/ |,/)
		logs(`set targets: ${local_targets.join(", ")}`)
		local_targets.forEach(target => targets.push(target))
		continue
	}
	
	input_file = arg
	logs(`set input file to: ${input_file}`)
	
}

if (input_file == null) {
	logs("ERROR: input file is required but not set!", true)
	process.exit(-1);
}
if (targets.length == 0) {
	logs("WARNING: no any target value is set, is this correct?")
}

logs("processing...")

const input_content = fs.readFileSync(input_file, "utf8")
const [preprocess_result, warnings] = ifdefJs.process_string(input_content, targets)
warnings.forEach(warning => (logs("WARNING: " + warning)))

result(preprocess_result)
