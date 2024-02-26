import fs from "fs-extra"
import path from "path"

export const ROOT_FOLDER = path.join(__dirname, "..", "..")

/**
 * Writes to files from the project root.
 */
export function writeFile(fileName: string, contents: string) {
	const newPath = path.join(ROOT_FOLDER, fileName)
	fs.outputFileSync(newPath, contents)
}

/**
 * Writes JSON content to files from the project root.
 */
export function writeJSON(fileName: string, contents: any) {
	writeFile(fileName, JSON.stringify(contents, null, 2))
}

/**
 * Reads files from the project root and returns the contents as a string,
 * or undefined if the file does not exist or there were other issues.
 */
export function readFile(fileName: string): string | undefined {
	const newPath = path.join(ROOT_FOLDER, fileName)
	try {
		return fs.readFileSync(newPath, {
			encoding: "utf-8",
			flag: "r",
		})
	} catch (e) {
		return
	}
}
