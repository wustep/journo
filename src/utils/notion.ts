/**
 * Utils for interacting with the Notion API.
 */

import { Client } from "@notionhq/client"

export async function getDatabasePages(client: Client, databaseId: string) {
	return await client.databases.query({
		database_id: databaseId,
	})
}

/**
 * Given a database URL or ID as an input, return the undashed uuid.
 *
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
