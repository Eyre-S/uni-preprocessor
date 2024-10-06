import ifdefJs, { IfdefJsConfig, process_string } from "@/libs/ifdef-js.js";
import fs from "fs";
import { expect } from "chai";

const test_configs: {
	saveName: string,
	appliedTargets: string[],
	configs?: IfdefJsConfig
}[] = [
	{ saveName: "windows", appliedTargets: ["windows", "app"] },
	{ saveName: "android", appliedTargets: ["android", "app"] },
	{ saveName: "linux",   appliedTargets: ["linux", "app"],  configs: { alternative_target_tagname: "def" } },
	{ saveName: "router",  appliedTargets: ["router"] },
]

const root = import.meta.dirname
function read (name: string): string {
	return fs.readFileSync(`${root}/${name}.yaml`, "utf-8")
}
function readTemplate (): string {
	return fs.readFileSync(`${root}/ifdef_template.yaml`, "utf-8")
}
function readConfigTemplate (configName: string): string {
	return fs.readFileSync(`${root}/ifdef_template.generated_${configName}.yaml`, "utf8");
}

function process (func: () => [string, string[]]): string {
	
	const [processed_content, warnings] = func()
	warnings.forEach(warning => console.log(warning))
	
	
	return processed_content
	
}

describe("when using ifdef backend", () => {
	
	test_configs.forEach(config => it(`using template ${config.saveName} works`, () => {
		
		const processed = process(() =>
			process_string(readTemplate(), config.appliedTargets, config.configs)
		)
		
		expect(processed).equals(readConfigTemplate(config.saveName))
		
	}))
	
	describe("on defining alternative target tagname", () => {
		
		it ("using a string name should works", () => {
			expect(ifdefJs.getTagRegex({ alternative_target_tagname: "def" }))
				.deep.equal(ifdefJs.getTagRegex())
		})
		
		it ("using a object to define three tagname should works", () => {
			expect(ifdefJs.getTagRegex({ alternative_target_tagname: {
				start: "ifdef",
				start_rev: "ifndef",
				end: "endif"
			}})).deep.equals(ifdefJs.getTagRegex())
		})
		
		it ("should available to use in process_string", () => {
			
			const processed = process(() => process_string(
				read("if_target/source"), ["app"],
				{ alternative_target_tagname: "target" }
			))
			
			expect(processed).equals(read("if_target/result_app"))
			
		})
		
	})
	
})
