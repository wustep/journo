#! /usr/bin/env node

import { Command } from "commander"
import { Client } from "@notionhq/client"

import { getDatabaseId, getDatabasePages } from "./utils/notion"
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
		.command("api")
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
		.command("import")
		.argument("<database>", "ID or URL of the Notion database")
		.description("Import a Notion database")
		.action(async (database: string) => {
			const databaseId = getDatabaseId(database)
			if (!notionApiKey) {
				console.log("No API key found, please use `api` to set it")
				return
			}
			if (!notionClient) {
				console.log("Invalid API key, unable to connect to Notion.")
				return
			}
			if (databaseId) {
				const pages = await getDatabasePages(notionClient, databaseId)
				console.log(pages.results)
			}
		})

	return program
}

export { Program }
