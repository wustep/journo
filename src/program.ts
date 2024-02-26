#! /usr/bin/env node

import { Command } from "commander"
import { Client } from "@notionhq/client"

import { getPageId, importDatabase, importPage } from "./utils/notion"
import { writeFile } from "./utils/file"

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

	return program
}

export { Program }
