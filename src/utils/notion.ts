/**
 * Utils for interacting with the Notion API.
 */

import { Client } from "@notionhq/client"
import { writeFile } from "./file"
import path from "path"
import {
	QueryDatabaseResponse,
	GetPageResponse,
	RichTextItemResponse,
	GetDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { sleep } from "./sleep"
import { withoutDashes } from "./id"

const IMPORT_FOLDER = "/data/import"

export async function getDatabasePages(client: Client, databaseId: string) {
	// Retrieve database
	const getDatabaseResponse = await client.databases.retrieve({
		database_id: databaseId,
	})
	console.log(
		"Retrieved database: ",
		getDatabaseTitleAndEmoji(getDatabaseResponse)
	)
	const getDatabasePath = writeFile(
		path.join(IMPORT_FOLDER, `getDatabase-${databaseId}.json`),
		JSON.stringify(getDatabaseResponse, null, 2)
	)
	console.log(`Wrote database get to ${getDatabasePath}`)
	sleep(500)

	// Query database
	let hasMore: boolean = true
	let nextCursor: string | undefined = undefined
	const results: QueryDatabaseResponse["results"] = []
	while (hasMore) {
		const databasePagesQueryResponse = await client.databases.query({
			database_id: databaseId,
			start_cursor: nextCursor,
		})
		hasMore = databasePagesQueryResponse.has_more
		console.log(
			"Found " + databasePagesQueryResponse.results.length + " pages!"
		)
		if (hasMore) {
			console.log("More pages to querying, querying next page...")
			nextCursor = databasePagesQueryResponse.next_cursor ?? undefined
		}
		results.push(...databasePagesQueryResponse.results)
		sleep(500)
	}

	const queryDatabasePath = writeFile(
		path.join(IMPORT_FOLDER, `/queryDatabase-${databaseId}.json`),
		JSON.stringify(results, null, 2)
	)
	console.log(`Wrote database query to ${queryDatabasePath}\n`)

	// Retrieve pages
	for (const page of results) {
		const pageId = withoutDashes(page.id)
		const getPageResponse = await client.pages.retrieve({
			page_id: pageId,
		})
		console.log("Retrieved page: " + getPageTitleAndEmoji(getPageResponse))
		const getPagePath = writeFile(
			path.join(IMPORT_FOLDER, `getPage-${pageId}.json`),
			JSON.stringify(getPageResponse, null, 2)
		)
		console.log(`Wrote page to ${getPagePath}`)
		sleep(250)
	}
}

/**
 * Given a database URL or ID as an input, return the undashed uuid.
 */
export function getDatabaseId(input: string): string | undefined {
	const pattern =
		/\b[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}\b/i
	const match = input.match(pattern)
	if (match) {
		return match[0].replace(/-/g, "")
	}
	return
}
function getDatabaseTitleAndEmoji(database: GetDatabaseResponse) {
	const title = getDatabaseTitle(database)
	const emoji = getDatabaseEmoji(database)
	return append(title, emoji)
}

function getDatabaseTitle(database: GetDatabaseResponse) {
	if ("title" in database) {
		return toPlainText(database.title)
	}
	return "Untitled"
}

function getDatabaseEmoji(database: GetDatabaseResponse) {
	if ("icon" in database && database.icon?.type === "emoji") {
		return database.icon.emoji
	}
	return undefined
}

function getPageTitle(page: GetPageResponse) {
	if ("properties" in page) {
		const titleBlob = Object.values(page.properties).find(
			(property) => property.type === "title"
		)
		if (titleBlob && titleBlob.type === "title") {
			return toPlainText(titleBlob.title)
		}
	}
	return "Untitled"
}

function getPageTitleAndEmoji(page: GetPageResponse) {
	const title = getPageTitle(page)
	const emoji = getPageEmoji(page)
	return append(title, emoji)
}

function getPageEmoji(page: GetPageResponse) {
	if ("icon" in page && page.icon?.type === "emoji") {
		return page.icon.emoji
	}
	return undefined
}

function append(title: string, emoji: string | undefined) {
	return emoji ? `${emoji} ${title}` : title
}

function toPlainText(blob: RichTextItemResponse[]) {
	return blob.map((item) => item.plain_text).join("") ?? "Untitled"
}
