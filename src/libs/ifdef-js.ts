/**
 * ifdef.js
 * 
 * Originally authored by Dave Balmer in 2013-8-18.
 * 
 * Rewrites by A.C. Sukazyo Eyre for use in uni-preprocessor project.
 * 
 * @author Dave Balmer
 * @repository https://github.com/davebalmer/ifdefjs
 * @license MIT
 */

import { FindReplacementConfig, FindReplacementItem } from "./find-replacement.js"

export type TargetNameConfig = {
	start: string,
	start_rev: string,
	end: string
} | string

export interface IfdefJsConfig {
	
	loose_parse?: boolean, // default: true
	
	prefix?: string, // default: "#"
	suffix?: string, // default: undefined
	ignorable_prefix?: string[], // default: ["\t", " "]
	
	alternative_target_tagname?: TargetNameConfig // default: "def"
	
	defines?: FindReplacementConfig, // default: []
	
}

export class IfdefJsConfigured {
	
	loose_parse: boolean = true
	
	prefix: string = "#"
	suffix?: string
	ignorable_prefix: string[] = ["\t", " "]
	
	alternative_target_tagname: TargetNameConfig = "def"
	
	defines: FindReplacementConfig = []
	
	public constructor (configs?: IfdefJsConfig) {
		if (configs !== undefined) {
			if (configs.loose_parse !== undefined) this.loose_parse = configs.loose_parse
			if (configs.prefix !== undefined) this.prefix = configs.prefix
			if (configs.suffix !== undefined) this.suffix = configs.suffix
			if (configs.ignorable_prefix !== undefined) this.ignorable_prefix = configs.ignorable_prefix
			if (configs.alternative_target_tagname !== undefined) this.alternative_target_tagname = configs.alternative_target_tagname
			if (configs.defines !== undefined) this.defines = configs.defines
		}
	}
	
}

export function getTagRegex (configs: TargetNameConfig = "def"): [RegExp, RegExp, RegExp] {
	
	const [start, start_rev, end] = (() => {
		const att = configs
		if (typeof att == 'string') {
			return [`if${att}`, `ifn${att}`, `endif`]
		} else {
			return [att.start, att.start_rev, att.end]
		}
	})()
	return [
		new RegExp(`\\#(${start}|${start_rev}|${end})`, "i"),
		new RegExp(`\\#${start_rev}`, "i"),
		new RegExp(`\\#(${start}|${start_rev}|${end})\\s+\\w+`, "i")
	]
	
}

/**
 * Using the ifdef.js logic to process a string file.
 * 
 * ifdef.js: https://github.com/davebalmer/ifdefjs
 * 
 * @param file The file content that need to be pre-process, in string
 * @param targets the target tags applied to the ifdef
 * @returns An array, the first element is the processed content, the second is the warning list.
 *          If the ifdef tag is not closed until the file end, a warnings will be added to the warning list.
 */
export function process_string (file: string, targets: string[], configs?: IfdefJsConfig): [string, string[]] {
	
	const config = new IfdefJsConfigured(configs)
	
	const [ifdefRegex, ifndefRegex, allRegex] = getTagRegex(config.alternative_target_tagname)
	const targetRegex: RegExp = new RegExp(targets.join("|"))
	
	let warnings: string[] = []
	let paused = false
	let processed_lines: string[] = []
	
	const data = file.split("\n")
	
	var l = ""
	
		for (var i = 0; i < data.length; i++) {
		l = data[i]
		
		if (l.match(ifdefRegex)) {
			// this is an ifndef
			if (l.match(ifndefRegex)) {
				if (!l.match(targetRegex))
					paused = false
				else
					paused = true
			}
			else if (l.match(targetRegex)) {
				// our target is in the list
				paused = false
			}
			else if (l.match(allRegex)) {
				// our target is not in the list
				paused = true
			}
			else {
				paused = false
			}
		}
		else {
			if (!paused) {
				processed_lines.push(execute_line_replacement(config.defines, l))
			}
		}
	}
	
	if (paused)
		warnings.push("WARNING: unclosed #ifdef")
	
	return [
		processed_lines.join("\n"),
		warnings
	]
	
}

function execute_line_replacement (config: FindReplacementConfig, line: string): string {
	
	let new_line = line
	const replacements = FindReplacementItem.praseConfig(config)
	for (const i of replacements) {
		new_line = i.find_replace(new_line)
	}
	return new_line
	
}

export default {
	process_string,
	getTagRegex
}
