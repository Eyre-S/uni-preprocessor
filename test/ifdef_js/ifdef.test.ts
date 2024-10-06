import assert from "assert";
import { describe } from "node:test";
import { process_string } from "@/libs/ifdef-js.js";
import fs from "fs";

const test_configs: {
	saveName: string,
	appliedTargets: string[]
}[] = [
	{ saveName: "windows", appliedTargets: ["windows", "app"] },
	{ saveName: "android", appliedTargets: ["android", "app"] },
	{ saveName: "linux",   appliedTargets: ["linux", "app"] },
	{ saveName: "router",  appliedTargets: ["router"] },
]

const root = "./test/ifdef_js"
const template: string = fs.readFileSync(root + "/ifdef_template.yaml", "utf8");
function readConfigTemplate (configName: string): string {
	return fs.readFileSync(root + "/ifdef_template.generated_" + configName + ".yaml", "utf8");
}

function process (targets: string[]): string {
	
	const [processed_content, warnings] = process_string(template, targets)
	warnings.forEach(warning => console.log(warning))
	
	return processed_content
	
}

describe("when using ifdef backend", () => {
	
	for (const config of test_configs) {
		describe(`using template ${config.saveName} works`, (t) => {
			
			const processed = process(config.appliedTargets)
			
			assert.equal(readConfigTemplate(config.saveName), processed)
			
		})
	}
	
})
