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

/**
 * The config type for {@link TargetMatchTags}.
 * 
 * If provided as string, it will be used as `start` and `start_rev` prefix.
 * For example, if it is `"target"`, it will replace `ifdef`, `ifndef`,
 * and `endif` to `iftarget`, `ifntarget`, and `endif` respectively.
 * 
 * If provided as object, `start` and `start_rev` are required.
 * `end` is optional, default to `"endif"`.
 */
export type TargetNameConfig = {
	/**
	 * The start of ifdef block.
	 * 
	 * Default is `"ifdef"`.
	 */
	start: string
	/**
	 * The start of ifndef block.
	 * 
	 * Default is `"ifndef"`.
	 */
	start_rev: string
	/**
	 * The end of ifdef/ifndef block. Can be omitted.
	 * 
	 * Default is `"endif"`.
	 */
	end?: string
} | string

export class TargetMatchTags {
	
	public readonly start: string = "ifdef"
	public readonly start_rev: string = "ifndef"
	public readonly end: string = "endif"
	
	public constructor (configs?: TargetNameConfig) {
		if (configs !== undefined) {
			if (typeof configs == "string") {
				this.start = "if" + configs
				this.start_rev = "ifn" + configs
			} else {
				this.start = configs.start
				this.start_rev = configs.start_rev
				if (configs.end) this.end = configs.end
			}
		}
	}
	
	public getRegexps (): [RegExp, RegExp, RegExp] {
		return [
			new RegExp(`\\#(${this.start}|${this.start_rev}|${this.end})`, "i"),
			new RegExp(`\\#${this.start_rev}`, "i"),
			new RegExp(`\\#(${this.start}|${this.start_rev}|${this.end})\\s+\\w+`, "i")
		]
	}
	
}

/**
 * The configuration object for ifdef.js.
 * 
 * @see https://github.com/davebalmer/ifdefjs
 */
export interface IfdefJsConfig {
	
	/**
	 * Enable strict parse mode.
	 * 
	 * If the strict parse mode is disabled, the preprocessor parser
	 * will treated all the line contains `ifdef` and its prefix
	 * (which is defined below, and defaults is `"#"`) as a directive.
	 * This is relatively the same behavior as the original *ifdef.js*
	 * behavior.
	 * 
	 * If this mode is enabled, then one line must have *prefix* +
	 * *directive* + *suffix* format (ignoring the *ignorable_prefix*)
	 * to be treated as a directive. This may more likely be the C
	 * preprocessor behavior.
	 * 
	 * Default is `false`.
	 */
	strict?: boolean
	
	/**
	 * The prefix of ifdef/ifndef directive.
	 * 
	 * Only after this prefix, the line will be treated as a directive.
	 * 
	 * Default is `"#"`.
	 */
	prefix?: string
	/**
	 * The suffix of ifdef/ifndef directive.
	 * 
	 * When you enable the strict parse mode, then one line
	 * must ends with this suffix to be treated as a valid directive.
	 * 
	 * Regardless of whether strict mode is enabled or disabled, the
	 * suffix will never to be treated as a part of the directive,
	 * although in non strict mode, the suffix is not required to
	 * exists.
	 * 
	 * Commonly used for make a preprocessor directive as a valid comment
	 * in some language that required a comment start and comment end in
	 * strict mode. Like in HTML, you can set the prefix to `<!--` and
	 * the suffix to `-->`. For most other cases, you may not need it.
	 * 
	 * Default is `undefined`.
	 */
	suffix?: string
	
	/**
	 * The ignorable characters when parsing directive.
	 * 
	 * This may only matters when the strict parse mode is enabled.
	 * The characters in this array can be safely exists before the
	 * prefix, or after the suffix in strict mode.
	 * 
	 * Commonly used for safely ignores indents, or typesetting characters.
	 * 
	 * Default is `["\t", " "]`.
	 */
	ignorable_prefix?: string[]
	
	/**
	 * The alternative target tagname.
	 * 
	 * If provided as string, it will be used as `start` and `start_rev` prefix.
	 * For example, if it is `"target"`, it will replace `ifdef`, `ifndef`, and `endif` to `iftarget`, `ifntarget`, and `endif` respectively.
	 * 
	 * If provided as object, `start` and `start_rev` are required.
	 * `end` is optional, default to `"endif"`.
	 * 
	 * Default is `"def"`, means the preprocessor will use `ifdef`, `ifndef`, `endif` directive set.
	 */
	alternative_target_tagname?: TargetNameConfig
	
	/**
	 * The find-replacement config used to execute the find-replacement.
	 * 
	 * Default is an empty array.
	 * 
	 * @see {@link FindReplacementConfig}
	 */
	defines?: FindReplacementConfig
	
}

export class IfdefJsConfigured {
	
	strict: boolean = false
	
	prefix: string = "#"
	suffix?: string
	ignorable_prefix: string[] = ["\t", " "]
	
	alternative_target_tagname: TargetMatchTags = new TargetMatchTags()
	
	defines: FindReplacementConfig = []
	
	public constructor (configs?: IfdefJsConfig) {
		if (configs !== undefined) {
			if (configs.strict !== undefined) this.strict = configs.strict
			if (configs.prefix !== undefined) this.prefix = configs.prefix
			if (configs.suffix !== undefined) this.suffix = configs.suffix
			if (configs.ignorable_prefix !== undefined) this.ignorable_prefix = configs.ignorable_prefix
			if (configs.alternative_target_tagname !== undefined) this.alternative_target_tagname = new TargetMatchTags(configs.alternative_target_tagname)
			if (configs.defines !== undefined) this.defines = configs.defines
		}
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
	
	const config = new IfdefJsConfigured(configs)
	
	const [ifdefRegex, ifndefRegex, allRegex] = config.alternative_target_tagname.getRegexps()
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
	process_string
}
