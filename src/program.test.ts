/**
 * Tests for program.ts.
 * https://github.com/tj/commander.js/blob/master/tests/options.version.test.js
 */

import { describe, expect, test } from "@jest/globals"
import fs from "fs"
import path from "path"

import { Program } from "./program"
import { ROOT_FOLDER } from "./utils/file"

describe("Commands", () => {
	const writeOut = jest.fn()
	const consoleLog = jest.spyOn(console, "log")

	function getProgram() {
		const program = Program()
		program.exitOverride().configureOutput({ writeOut })
		return program
	}

	describe("help", () => {
		test("help returns a list of commands", () => {
			const program = getProgram()
			expect(() => {
				program.parse(["node", "test", "help"])
			}).toThrow()
			expect(writeOut).toHaveBeenCalledWith(
				expect.stringContaining("Usage: journo [options] [command]")
			)
		})
	})

	describe("set-api-key", () => {
		test("set-api-key sets the API key", () => {
			const program = getProgram()
			const apiKey = "secret_LALALALALALLALALALLA"
			program.parse(["node", "test", "set-api-key", apiKey])
			expect(fs.readFileSync(path.join(ROOT_FOLDER, ".env"), "utf-8")).toBe(
				`NOTION_API_KEY=${apiKey}\n`
			)
			expect(consoleLog).toHaveBeenCalledWith("API key saved to .env file")
		})
	})
})
