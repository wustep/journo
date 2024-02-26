import fs from "fs-extra"
import path from "path"

export const ROOT_FOLDER = path.join(__dirname, "..", "..")

/**
 * Writes files to the project root.
 */
export function writeFile(fileName: string, contents: string): void {
	fs.outputFileSync(path.join(ROOT_FOLDER, fileName), contents)
}
