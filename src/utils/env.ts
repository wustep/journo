import { R_OK } from "constants"
import { rootPath } from "./file"
import { accessSync, readFileSync, writeFileSync } from "fs-extra"
import { EOL } from "os"
import { dirname } from "path"
import { mkdir, mkdirSync } from "fs"

type EnvParam = "NOTION_API_KEY" | "DATA_FOLDER"

/**
 * Set or create environment variable declaration in the env file.
 */
export function setEnv(key: EnvParam, value: string) {
	const envFile = rootPath(".env")

	try {
		accessSync(envFile, R_OK)
	} catch {
		mkdirSync(dirname(envFile), { recursive: true })
		writeFileSync(envFile, "")
	}

	const ENV_VARS = readFileSync(envFile, "utf-8").split(EOL)

	const targetLine = ENV_VARS.find((line) => {
		// (?<!#\s*)   Negative lookbehind to avoid matching comments (lines that starts with #).
		//             There is a double slash in the RegExp constructor to escape it.
		// (?==)       Positive lookahead to check if there is an equal sign right after the key.
		//             This is to prevent matching keys prefixed with the key of the env var to update.
		const keyValRegex = new RegExp(`(?<!#\\s*)${key}(?==)`)
		return line.match(keyValRegex)
	})

	const targetIndex =
		targetLine !== undefined ? ENV_VARS.indexOf(targetLine) : -1

	if (targetIndex !== -1) {
		ENV_VARS.splice(targetIndex, 1, `${key}=${value}`)
	} else {
		ENV_VARS.push(`${key}=${value}`)
	}

	writeFileSync(".env", ENV_VARS.join(EOL))
}
