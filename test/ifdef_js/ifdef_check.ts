import { process_string } from "@/libs/ifdef-js.js";
import fs from "fs";

const root = "./test/ifdef_js"

const template: string = fs.readFileSync(root + "/ifdef_template.yaml", "utf8");

function process (saveName: string, targets: string[]) {
	
	const [processed_content, warnings] = process_string(template, targets)
	warnings.forEach(warning => console.log(warning));
	
	fs.writeFileSync(root + "/generated_" + saveName + ".yaml", processed_content)
	
}

process("windows", ["windows", "app"])
process("android", ["android", "app"])
process("linux", ["linux", "app"])
process("router", ["router"])
