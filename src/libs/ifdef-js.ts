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



export interface IfdefJsConfig {
	
	defines?: {
		[key: string]: string
	},
	alternative_target_tagname?: {
		start: string,
		start_rev: string,
		end: string
	} | string
	
}

export function getTagRegex (configs?: IfdefJsConfig): [RegExp, RegExp, RegExp] {
	
	if (configs?.alternative_target_tagname) {
		const [start, start_rev, end] = (() => {
			const att = configs.alternative_target_tagname
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
	} else {
		return [
			/\#(ifdef|ifndef|endif)/i,
			/\#ifndef/i,
			/\#(ifdef|ifndef|endif)\s+\w+/i
		]
	}
	
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
	
	const [ifdefRegex, ifndefRegex, allRegex] = getTagRegex(configs)
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
				let line = l
				if (configs?.defines != undefined) {
					for (const [key, value] of Object.entries(configs.defines)) {
						line = line.replaceAll(key, value)
					}
				}
				processed_lines.push(line)
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

export default {
	process_string,
	getTagRegex
}
