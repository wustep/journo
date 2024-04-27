#! /usr/bin/env node

import { Command, Option } from "commander"
import { Client } from "@notionhq/client"

import { getPageId, importDatabase, importPage } from "./utils/notion"
import {
	DATA_FOLDER,
	copyFile,
	extension,
	importPath,
	writeJSON,
} from "./utils/file"
import { ingestData } from "./utils/ingest"
import path from "path"
import { Thought } from "./types/thought"
import { getISODate } from "./utils/time"
import { setEnv } from "./utils/env"

require("dotenv").config()

function Program(): Command {
	let notionApiKey: string | undefined = process.env.NOTION_API_KEY
	let notionClient: Client | undefined = notionApiKey
		? new Client({ auth: notionApiKey })
		: undefined

	const program = new Command()

	program
		.name("journo")
		.description("CLI for Notion journal entry tooling")
		.version("0.1.0")

	program
		.command("set-data-folder")
		.argument("[folder]", "Folder path", DATA_FOLDER)
		.description(
			`Sets the destination folder for all files, currently ${DATA_FOLDER}`
		)
		.action((folder) => {
			if (folder) {
				const newPath = path.resolve(folder ?? DATA_FOLDER)
				setEnv("DATA_FOLDER", newPath)
				console.log("Set new output directory to " + newPath)
			}
		})

	program
		.command("set-api-key")
		.argument("<key>", "API key for Notion (e.g. 'secret_UO1...')")
		.description("Set the Notion API key")
		.action((apiKey: string) => {
			if (apiKey) {
				setEnv("NOTION_API_KEY", apiKey)
				console.log("API key saved to .env file")
				notionClient = new Client({ auth: apiKey })
			}
		})

	program
		.command("import-db")
		.description("Import a Notion database")
		.argument("<database>", "ID or URL of the Notion database")
		.option(
			"-s, --skip",
			"Skip querying files that have already been retrieved.",
			false
		)
		.addHelpText(
			"after",
			"Note: URLs should be wrapped in quotes to be interpreted correctly!"
		)
		.action(
			async (
				database: string,
				options: {
					skip: boolean
				}
			) => {
				const { skip } = options
				const databaseId = getPageId(database)
				if (!notionApiKey) {
					console.error("No API key found, please use `api` to set it")
					return
				}
				if (!notionClient) {
					console.error("Invalid API key, unable to connect to Notion.")
					return
				}
				if (!databaseId) {
					console.error("Invalid database ID or URL")
					return
				}
				await importDatabase(notionClient, databaseId, { skip })
			}
		)

	program
		.command("import-page")
		.description("Import a Notion page")
		.argument("<page>", "ID or URL of the Notion page")
		.option(
			"-s, --skip",
			"Skip querying files that have already been retrieved.",
			false
		)
		.addHelpText(
			"after",
			"Note: URLs should be wrapped in quotes to be interpreted correctly!"
		)
		.action(
			async (
				page: string,
				options: {
					skip: boolean
					limit: number
				}
			) => {
				const { skip } = options
				const pageId = getPageId(page)
				if (!notionApiKey) {
					console.error("No API key found, please use `api` to set it")
					return
				}
				if (!notionClient) {
					console.error("Invalid API key, unable to connect to Notion.")
					return
				}
				if (!pageId) {
					console.error("Invalid page ID or URL")
					return
				}
				await importPage(notionClient, pageId, { skip })
			}
		)

	program
		.command("import")
		.description("Import a .txt or .md file")
		.argument("<file>", "File to import")
		.action((file) => {
			if (extension(file) === "md" || extension(file) === "txt") {
				copyFile(file, importPath(file.split("/").pop() ?? ""))
			} else {
				console.error("Invalid file type. Only .txt and .md files supported.")
			}
		})

	// program
	// 	.command("export-csv")
	// 	.description("Export ingested data to CSV format")
	// 	.argument("<output>", "Output file for CSV data")
	// 	.action((output: string) => {
	// 		console.error(output)
	// 	})

	program
		.command("thoughts")
		.description("List thoughts from ingested data")
		.option("-reg --regex", "Apply a regex filter", "")
		.option("-n, --newlines", "Add new lines between output", false)
		.option("-d, --dedupe", "De-dupe duplicates", false)
		.addOption(
			new Option("-abc, --abc", "Sort by alphabetical order")
				.default(false)
				.conflicts(["random"])
		)
		.addOption(
			new Option("-r, --rand, --random", "Randomized sort")
				.default(false)
				.conflicts(["abc"])
		)
		.addOption(
			new Option("-b, --blocks", "Split by blocks / paragraphs of text.")
				.default(true)
				.conflicts(["words", "sentences"])
		)
		.addOption(
			new Option("-s, --sentences", "Split by sentences")
				.default(false)
				.conflicts(["words", "blocks"])
		)
		.addOption(
			new Option("-w, --words", "Split by words")
				.default(false)
				.conflicts("sentences")
		)
		.addOption(
			new Option("-j, --json", "Output as JSON for testing purposes").default(
				false
			)
		)
		.action((options) => {
			const { abc, regex, rand, sentences, newlines, dedupe, words, json } =
				options
			let thoughts = ingestData({
				sentences,
				words,
			}).filter((thought) => thought.text.length > 1)
			writeJSON(`./ingest/${getISODate()}.txt`, thoughts)

			if (!thoughts) {
				console.error(
					"No thoughts found! Use import functions to retrieve data for thoughts."
				)
				return
			}
			if (abc) {
				thoughts = thoughts.sort((a, b) => (a.text > b.text ? 1 : -1))
			}
			if (regex) {
				const re = new RegExp(regex)
				thoughts = thoughts.filter((thought) => re.test(thought.text))
			}
			if (dedupe) {
				const seen = new Set()
				thoughts = thoughts.filter((thought) => {
					const duplicate = seen.has(thought.text)
					seen.add(thought.text)
					return !duplicate
				})
			}
			if (rand) {
				// TODO: This is like O(n^2) time, should be faster.
				let randThoughts: Thought[] = []
				for (let thought of thoughts) {
					let randIndex = Math.round(Math.random() * randThoughts.length)
					randThoughts.splice(randIndex, 0, thought)
				}
			}
			if (words) {
				if (newlines) {
					thoughts.forEach((thought) => {
						console.log(thought.text)
					})
				} else {
					console.log(thoughts.map((thought) => thought.text).join(" "))
				}
			} else {
				thoughts.forEach((thought) => {
					if (json) {
						console.log(JSON.stringify(thought))
					} else {
						console.log(thought.text)
					}
					if (newlines) {
						console.log("")
					}
				})
			}
		})

	return program
}

export { Program }
