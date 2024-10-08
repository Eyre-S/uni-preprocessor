import { FindReplacementConfig, FindReplacementConfig_ArraysLike, FindReplacementConfig_FieldLike, FindReplacementConfig_ObjectMapLike, FindReplacementItem } from "@/libs/find-replacement"
import { expect } from "chai"

describe ("For find-replacement item, ", () => {
	
	const defines_default: FindReplacementItem[] = [
		new FindReplacementItem("{{version}}", "1.0.0-RC3+git.12b75f+windows"),
		new FindReplacementItem("some random text", "some fixed text")
	]
	const defines_empty: FindReplacementItem[] = []
	const defines_with_regex: FindReplacementItem[] = [
		new FindReplacementItem("{{version}}", "1.0.0-RC3+git.12b75f+windows"),
		new FindReplacementItem("some random text", "some fixed text"),
		new FindReplacementItem(/colur|colour/, "color"),
	]
	
	describe("when creating definition array", () => {
		
		const defines_tests: {
			title: string,
			set_default?: FindReplacementConfig,
			set_empty?: FindReplacementConfig,
			set_with_regex?: FindReplacementConfig
		}[] = [
			{
				title: "Array-Like",
				set_default: [
					["{{version}}", "1.0.0-RC3+git.12b75f+windows"],
					["some random text", "some fixed text"]
				] as FindReplacementConfig_ArraysLike,
				set_empty: [] as FindReplacementConfig_ArraysLike,
				set_with_regex: [
					["{{version}}", "1.0.0-RC3+git.12b75f+windows"],
					["some random text", "some fixed text"],
					[/colur|colour/, "color"],
				] as FindReplacementConfig_ArraysLike
			},
			{
				title: "ObjectMap-Like",
				set_default: {
					"{{version}}": "1.0.0-RC3+git.12b75f+windows",
					"some random text": "some fixed text"
				} as FindReplacementConfig_ObjectMapLike,
				set_empty: {} as FindReplacementConfig_ObjectMapLike
			},
			{
				title: "Field-like",
				set_default: [
					{ match: "{{version}}", replacement: "1.0.0-RC3+git.12b75f+windows" },
					{ match: "some random text", replacement: "some fixed text" }
				] as FindReplacementConfig_FieldLike,
				set_empty: [] as FindReplacementConfig_FieldLike,
				set_with_regex: [
					{ match: "{{version}}", replacement: "1.0.0-RC3+git.12b75f+windows" },
					{ match: "some random text", replacement: "some fixed text" },
					{ match: /colur|colour/, replacement: "color" },
				] as FindReplacementConfig_FieldLike
			}
		]
		
		defines_tests.forEach(testDef => { describe(`using ${testDef.title} type`, () => {
			
			if (testDef.set_empty !== undefined) it ("should be able to create empty set", () => {
				expect(FindReplacementItem.praseConfig(testDef.set_empty))
					.deep.equals(defines_empty)
			})
			if (testDef.set_default !== undefined) it ("should be able to create a normal set", () => {
				expect(FindReplacementItem.praseConfig(testDef.set_default))
					.deep.equals(defines_default)
			})
			if (testDef.set_with_regex !== undefined) it ("should be able to create a set with regex", () => {
				expect(FindReplacementItem.praseConfig(testDef.set_with_regex))
					.deep.equals(defines_with_regex)
			})
			
		})});
		
	})
	
})