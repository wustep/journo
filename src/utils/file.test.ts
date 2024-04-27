import { fs } from "memfs"

import { describe, it, expect } from "@jest/globals"
import {
	DATA_FOLDER,
	IMPORT_FOLDER,
	copyFile,
	dataPath,
	extension,
	importPath,
	readFile,
	readJSON,
	writeFile,
	writeJSON,
} from "./file"
import path from "path"

/**
 * Tests for file.ts.
 */
describe("dataPath", () => {
	it("Returns the correct path", () => {
		expect(dataPath("hello.txt")).toEqual(path.join(DATA_FOLDER, "hello.txt"))
	})
})

describe("importPath", () => {
	it("Returns the correct path", () => {
		expect(importPath("hello.txt")).toEqual(
			path.join(IMPORT_FOLDER, "hello.txt")
		)
	})
})

describe("writeFile", () => {
	it("Writes relative paths to new files correctly", () => {
		writeFile(dataPath("hello.txt"), "hello world")
		expect(
			fs.readFileSync(path.resolve(DATA_FOLDER, "./hello.txt"), {
				encoding: "utf-8",
				flag: "r",
			})
		).toEqual("hello world")

		writeFile(dataPath("world.txt"), "hello\nworld")
		expect(
			fs.readFileSync(path.resolve(DATA_FOLDER, "./world.txt"), {
				encoding: "utf-8",
				flag: "r",
			})
		).toEqual("hello\nworld")

		writeFile(dataPath("./1/2/3.txt"), "123")
		expect(
			fs.readFileSync(path.resolve(DATA_FOLDER, "./1/2/3.txt"), {
				encoding: "utf-8",
				flag: "r",
			})
		).toEqual("123")
	})
})

describe("writeJSON", () => {
	it("Writes JSON content to files correctly", () => {
		const obj = { hello: "world" }
		writeJSON(dataPath("hello.json"), obj)
		expect(
			fs.readFileSync(path.resolve(DATA_FOLDER, "./hello.json"), {
				encoding: "utf-8",
				flag: "r",
			})
		).toEqual(JSON.stringify(obj, null, 2))
	})
})

describe("extension", () => {
	it("Returns the correct extension", () => {
		expect(extension("hello.txt")).toEqual("txt")
		expect(extension(dataPath("hello.md"))).toEqual("md")
		expect(extension("hello")).toEqual("hello")
	})
})

describe("readFile", () => {
	it("Reads files correctly", () => {
		writeFile(dataPath("hello.txt"), "hello world")
		expect(readFile(dataPath("hello.txt"))).toEqual("hello world")
	})
})

describe("readJSON", () => {
	it("Reads JSON files correctly", () => {
		const obj = { hello: "world" }
		writeJSON(dataPath("hello.json"), obj)
		expect(readJSON(dataPath("hello.json"))).toEqual(obj)
	})
})

describe("copyFile", () => {
	it("Copies files correctly", () => {
		writeFile(dataPath("yeehaw.txt"), "yeehaw")
		copyFile(dataPath("yeehaw.txt"), dataPath("yeehaw2.txt"))
		expect(
			fs.readFileSync(path.resolve(DATA_FOLDER, "./yeehaw2.txt"), {
				encoding: "utf-8",
				flag: "r",
			})
		).toEqual("yeehaw")
	})
})
