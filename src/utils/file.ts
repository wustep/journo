import fs from "fs-extra"
import path from "path"

require("dotenv").config()

export const ROOT_FOLDER = path.join(__dirname, "..", "..")

export const DATA_FOLDER =
	process.env.DATA_FOLDER ?? path.join(ROOT_FOLDER, "./data/")

export const IMPORT_FOLDER = path.join(DATA_FOLDER, "./import/")

export function rootPath(file: string) {
	return path.join(ROOT_FOLDER, file)
}

export function importPath(file: string) {
	return path.join(IMPORT_FOLDER, file)
}

export function dataPath(file: string) {
	return path.join(DATA_FOLDER, file)
}

/**
 * Given a source and destination, copy the source file to the data import folder.
 */
export function copyFile(sourcePath: string, destinationPath: string) {
	fs.copyFileSync(sourcePath, destinationPath)
}

/**
 * Writes to files from the data import folder.
 */
export function writeFile(path: string, contents: string) {
	fs.outputFileSync(path, contents)
}

/**
 * Writes JSON content to files from the data import folder.
 */
export function writeJSON(path: string, contents: object) {
	writeFile(path, JSON.stringify(contents, null, 2))
}

/**
 * Returns the extension of a file.
 */
export function extension(fileName: string): string | undefined {
	return fileName.split(".").pop()
}

/**
 * Reads files or undefined if the file does not exist or there were other issues.
 */
export function readFile(path: string): string | undefined {
	try {
		return fs.readFileSync(path, {
			encoding: "utf-8",
			flag: "r",
		})
	} catch (e) {
		return
	}
}

/**
 * Reads JSON files and return contents as an object.
 */
export function readJSON(path: string): object | undefined {
	try {
		return JSON.parse(
			fs.readFileSync(path, {
				encoding: "utf-8",
				flag: "r",
			})
		)
	} catch (e) {
		return
	}
}

export function getAllImportedFiles() {
	return fs.readdirSync(IMPORT_FOLDER)
}
