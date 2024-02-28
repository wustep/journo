#! /usr/bin/env node

import { Command, Option } from "commander"
import { Client } from "@notionhq/client"

import { getPageId, importDatabase, importPage } from "./utils/notion"
import { writeFile } from "./utils/file"
import { ingestData } from "./utils/ingest"

function Program(): Command {
	let notionApiKey: string | undefined = process.env.NOTION_API_KEY
	let notionClient: Client | undefined = notionApiKey
		? new Client({ auth: notionApiKey })
		: undefined
	const today = new Date().toISOString().split("T")[0]

	const program = new Command()

	program
		.name("journo")
		.description("CLI for Notion journal entry tooling")
		.version("0.1.0")

	program
		.command("set-api-key")
		.argument("<key>", "API key for Notion (e.g. 'secret_UO1...')")
		.description("Set the Notion API key")
		.action((apiKey: string) => {
			if (apiKey) {
				// TODO: Append if file exists instead of writing.
				writeFile(".env", `NOTION_API_KEY=${apiKey}\n`)
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
				console.log(database, options)
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
		.command("export-csv")
		.description("Export ingested data to CSV format")
		.argument("<output>", "Output file for CSV data")
		.action((output: string) => {
			console.error(output)
		})

	program
		.command("thoughts")
		.description("List thoughts from ingested data")
		.option("-abc, --abc", "Sort by alphabetical order", false)
		.option("-r, --regex", "Filter by regex", "")
		.option("-n, --newlines", "Add new lines between output", false)
		.option("-d, --dedupe", "De-dupe duplicates", false)
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
			const { abc, regex, sentences, newlines, dedupe, words, json } = options
			let thoughts = ingestData({
				sentences,
				words,
			}).filter((thought) => thought.text.length > 1)

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
