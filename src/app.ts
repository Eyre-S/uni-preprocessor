import package_js from "../package.json" with { type: "json" }

export const version = package_js.version

export default {
	version
}
