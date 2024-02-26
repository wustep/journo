import fs from "fs-extra"
import path from "path"

export const ROOT_FOLDER = path.join(__dirname, "..", "..")

/**
 * Writes files to the project root and returns its path.
 */
export function writeFile(fileName: string, contents: string): string {
	const newPath = path.join(ROOT_FOLDER, fileName)
	fs.outputFileSync(newPath, contents)
	return newPath
}
