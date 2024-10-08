export type FindReplacementConfig =
	FindReplacementConfig_FieldLike |
	FindReplacementConfig_ArraysLike |
	FindReplacementConfig_ObjectMapLike

export type FindReplacementConfig_ArraysLike = FindReplacementItemDef_ArraysLike[]
export type FindReplacementConfig_ObjectMapLike = { [key: string]: string }
export type FindReplacementConfig_FieldLike = FindReplacementItemDef_FieldLike[]

export type FindReplacementItemDefinition = FindReplacementItemDef_FieldLike | FindReplacementItemDef_ArraysLike

export type FindReplacementItemDef_ArraysLike = [string|RegExp, string]
export interface FindReplacementItemDef_FieldLike {
	match: RegExp | string,
	replacement: string
}

export class FindReplacementItem {
	
	private readonly find: RegExp | string
	private readonly replacement: string
	
	public constructor (find: RegExp | string, replacement: string) {
		this.find = find
		this.replacement = replacement
	}
	
	public static new (definition: FindReplacementItemDefinition): FindReplacementItem {
		if (Array.isArray(definition)) {
			return new FindReplacementItem(definition[0], definition[1])
		} else {
			return new FindReplacementItem(definition.match, definition.replacement)
		}
	}
	
	public static praseConfig (raw: FindReplacementConfig|undefined): FindReplacementItem[] {
		const result: FindReplacementItem[] = []
		if (typeof raw == "undefined") {
			// skip undefined type
		} else if (Array.isArray(raw)) {
			// for array type outside, inside should be array-like or field-like
			// use new() method to parse
			for (const item of raw) {
				result.push(FindReplacementItem.new(item))
			}
		} else {
			// for object type, now it will only be object-map like
			for (const [key, value] of Object.entries(raw)) {
				result.push(new FindReplacementItem(key, value))
			}
		}
		return result
	}
	
	public find_replace (input: string): string {
		return input.replaceAll(this.find, this.replacement)
	}
	
}
