import fs from "node:fs"

export function readString (resourceName: string): string {
	return fs.readFileSync(import.meta.dirname + "/" + resourceName, "utf8")
}

export default {
	readString
}
