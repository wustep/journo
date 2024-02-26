/**
 * Utils for interacting with the Notion API.
 */

import { Client } from "@notionhq/client"
import { readFile, writeFile, writeJSON } from "./file"
import path from "path"
import {
	QueryDatabaseResponse,
	GetPageResponse,
	RichTextItemResponse,
	GetDatabaseResponse,
	BlockObjectResponse,
	PartialBlockObjectResponse,
	PageObjectResponse,
	PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { sleep } from "./sleep"
import { withoutDashes } from "./id"

const IMPORT_FOLDER = "/data/import"

export async function getDatabasePages(
	client: Client,
	databaseId: string,
	args?: {
		/**
		 * Skip populating files that have already been retrieved.
		 */
		skip?: boolean
	}
) {
	const { skip } = args ?? {}

	// Retrieve database
	const {
		response: database,
		filePath: getDatabasePath,
		didSkip: didSkipGetDatabase,
	} = await getDatabaseResponse(client, databaseId, { skip })
	console.log("Retrieved database: ", getDatabaseTitleAndEmoji(database))

	if (didSkipGetDatabase) {
		console.log(`Using existing file at ${getDatabasePath}`)
		await sleep(100)
	} else {
		writeJSON(getDatabasePath, database)
		console.log(`Wrote retrieved database to ${getDatabasePath}`)
		await sleep(250)
	}

	// Query database for pages
	const {
		results: databaseResults,
		filePath: queryDatabasePath,
		didSkip: didSkipQueryDatabase,
	} = await queryDatabaseResults(client, databaseId, {
		skip,
		resultsCallback: async (databaseResults, hasMore) => {
			if (hasMore) {
				console.log(
					"Retrieved database results ",
					databaseResults.length,
					", fetching more..."
				)
				await sleep(250)
			} else {
				console.log("Retrieved database results: ", databaseResults.length)
			}
		},
	})

	if (didSkipQueryDatabase) {
		console.log(
			`Skipped database query, using existing file at ${queryDatabasePath}, with ${databaseResults.length} results.`
		)
		await sleep(100)
	} else {
		writeJSON(queryDatabasePath, databaseResults)
		console.log(
			`Wrote database query to ${queryDatabasePath}, with ${databaseResults.length} results.`
		)
		await sleep(250)
	}

	console.log()

	const pageResults: GetPageResponse[] = []
	// Get pages from database results
	for (const page of databaseResults) {
		const pageId = withoutDashes(page.id)
		const {
			page: getPageResults,
			filePath: getPagePath,
			didSkip: didSkipGetPage,
		} = await getPageResponse(client, pageId, { skip })
		pageResults.push(getPageResults)
		const pageTitleAndEmoji = getPageTitleAndEmoji(getPageResults)
		if (didSkipGetPage) {
			console.log(
				`Retrieved page ${pageTitleAndEmoji}, using existing file at ${getPagePath}`
			)
			await sleep(100)
		} else {
			console.log(
				`Retrieved page ${pageTitleAndEmoji}, writing to ${getPagePath}`
			)
			writeJSON(getPagePath, getPageResults)
			await sleep(250)
		}
	}

	console.log()

	// Get blocks from pages
	const blocksMap = new Map<string, BlockWithRecursiveChildren>()
	for (const page of pageResults) {
		const pageId = withoutDashes(page.id)
		const {
			blocks: getBlockResponse,
			filePath: getBlocksPath,
			didSkip: didSkipGetBlocks,
		} = await getPageBlocks(client, page, blocksMap, { skip })
		const pageTitleAndEmoji = getPageTitleAndEmoji(blocksMap.get(pageId))
		if (didSkipGetBlocks) {
			console.log(
				`Retrieved blocks for ${pageTitleAndEmoji}, using existing file at ${getBlocksPath}`
			)
			await sleep(100)
		} else {
			console.log(
				`Retrieved blocks for ${pageTitleAndEmoji}, writing to ${getBlocksPath}`
			)
			writeJSON(getBlocksPath, getBlockResponse)
			await sleep(250)
		}
	}
}

async function getDatabaseResponse(
	client: Client,
	databaseId: string,
	args?: {
		skip?: boolean
	}
): Promise<{
	response: GetDatabaseResponse
	filePath: string
	didSkip: boolean
}> {
	const filePath = path.join(IMPORT_FOLDER, `getDatabase-${databaseId}.json`)
	if (args?.skip) {
		const storedResult = readFile(filePath)
		if (storedResult) {
			return {
				response: JSON.parse(storedResult),
				filePath,
				didSkip: true,
			}
		}
	}
	const getDatabaseResponse = await client.databases.retrieve({
		database_id: databaseId,
	})
	return {
		response: getDatabaseResponse,
		filePath,
		didSkip: false,
	}
}

async function queryDatabaseResults(
	client: Client,
	databaseId: string,
	args: {
		skip?: boolean
		resultsCallback?: (
			result: QueryDatabaseResponse["results"],
			hasMore: boolean
		) => Promise<void>
	}
): Promise<{
	results: QueryDatabaseResponse["results"]
	filePath: string
	didSkip: boolean
}> {
	const filePath = path.join(IMPORT_FOLDER, `queryDatabase-${databaseId}.json`)
	if (args.skip) {
		const storedResult = readFile(filePath)
		if (storedResult) {
			return {
				results: JSON.parse(storedResult),
				filePath,
				didSkip: true,
			}
		}
	}
	let hasMore: boolean = true
	let nextCursor: string | undefined = undefined
	const queryDatabaseResults: QueryDatabaseResponse["results"] = []
	while (hasMore) {
		const databasePagesQueryResponse = await client.databases.query({
			database_id: databaseId,
			start_cursor: nextCursor,
		})
		hasMore = databasePagesQueryResponse.has_more
		nextCursor = databasePagesQueryResponse.next_cursor ?? undefined
		queryDatabaseResults.push(...databasePagesQueryResponse.results)
		await args?.resultsCallback?.(databasePagesQueryResponse.results, hasMore)
		await sleep(500)
	}
	return {
		results: queryDatabaseResults,
		filePath,
		didSkip: false,
	}
}

async function getPageResponse(
	client: Client,
	pageId: string,
	args?: {
		skip?: boolean
	}
): Promise<{
	page: GetPageResponse
	filePath: string
	didSkip: boolean
}> {
	const filePath = path.join(IMPORT_FOLDER, `getPage-${pageId}.json`)
	if (args?.skip) {
		const storedResult = readFile(filePath)
		if (storedResult) {
			return {
				page: JSON.parse(storedResult),
				filePath,
				didSkip: true,
			}
		}
	}
	const getPageResponse = await client.pages.retrieve({
		page_id: pageId,
	})
	return {
		page: getPageResponse,
		filePath,
		didSkip: false,
	}
}

/**
 * Blocks without children recursively filled.
 */
type Block = (
	| PartialBlockObjectResponse
	| BlockObjectResponse
	| PartialPageObjectResponse
	| PageObjectResponse
) & {
	children?: undefined
}

/**
 * Blocks with its children recursively filled.
 */
type BlockWithRecursiveChildren = Omit<Block, "children"> &
	(
		| {
				has_children: true
				children: BlockWithRecursiveChildren[]
		  }
		| {
				has_children: false
				children: undefined
		  }
	)

/**
 * Get the child blocks of a given page, recursively,
 * setting the blocksMap in the process for the page and recursive children.
 */
async function getPageBlocks(
	client: Client,
	page: GetPageResponse,
	blocksMap: Map<string, BlockWithRecursiveChildren>,
	args?: {
		skip?: boolean
	}
): Promise<{
	blocks: BlockWithRecursiveChildren[]
	filePath: string
	didSkip: boolean
}> {
	const pageId = withoutDashes(page.id)
	const filePath = path.join(IMPORT_FOLDER, `getBlocks-${pageId}.json`)
	if (args?.skip) {
		const storedResult = readFile(filePath)
		if (storedResult) {
			return {
				blocks: JSON.parse(storedResult),
				filePath,
				didSkip: true,
			}
		}
	}
	const block = await getBlockWithChildrenRecursively(client, page, blocksMap)
	return {
		blocks: block.has_children ? block.children : [],
		filePath,
		didSkip: false,
	}
}

// async function getBlockRecursively(
// 	client: Client,
// 	blockId: string,
// 	blocksMap: Map<string, BlockWithRecursiveChildren>
// ): Promise<BlockWithRecursiveChildren> {
// 	if (blocksMap.has(blockId)) {
// 		return blocksMap.get(blockId)!
// 	}
// 	const block: BlockWithRecursiveChildren = await client.blocks.retrieve({
// 		block_id: blockId,
// 	})
// 	if ("has_children" in block && block.has_children) {
// 		block.children = await getBlockChildren(client, blockId, blocksMap)
// 	}
// 	blocksMap.set(blockId, block)
// 	return block
// }

async function getBlockChildrenRecursively(
	client: Client,
	block: Block,
	blocksMap: Map<string, BlockWithRecursiveChildren>
): Promise<BlockWithRecursiveChildren[]> {
	const blockId = withoutDashes(block.id)
	const blocksMapMatch = blocksMap.get(blockId)
	if (blocksMapMatch) {
		if (blocksMapMatch.has_children) {
			return blocksMapMatch.children
		}
		return []
	}
	const children: BlockWithRecursiveChildren[] = []
	let hasMore: boolean = true
	let nextCursor: string | undefined = undefined
	while (hasMore) {
		const childrenResponse = await client.blocks.children.list({
			block_id: blockId,
			start_cursor: nextCursor,
		})
		const childrenResults: Block[] = childrenResponse.results
		for (const child of childrenResults) {
			children.push({
				...child,
				...("has_children" in child && child.has_children
					? {
							has_children: true,
							children: await getBlockChildrenRecursively(
								client,
								child,
								blocksMap
							),
					  }
					: {
							has_children: false,
					  }),
			})
		}
		hasMore = childrenResponse.has_more
		nextCursor = childrenResponse.next_cursor ?? undefined
		await sleep(200)
	}
	return children
}

/**
 * Get the block with its children recursively filled.
 *
 * This should only be used on blocks with children, meaning they're either pages or
 * blocks with `has_children` set to true.
 */
async function getBlockWithChildrenRecursively(
	client: Client,
	block: Block,
	blocksMap: Map<string, BlockWithRecursiveChildren>
): Promise<BlockWithRecursiveChildren> {
	const blockId = withoutDashes(block.id)
	const blocksMapMatch = blocksMap.get(blockId)
	if (blocksMapMatch) {
		if (blocksMapMatch.has_children) {
			return blocksMapMatch
		}
	}
	const children = await getBlockChildrenRecursively(client, block, blocksMap)
	const blockWithChildren: BlockWithRecursiveChildren = {
		...block,
		...(children.length
			? {
					has_children: true,
					children,
			  }
			: {
					has_children: false,
					children: undefined,
			  }),
	}
	blocksMap.set(blockId, blockWithChildren)
	return blockWithChildren
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

function getPageTitle(page: BlockWithRecursiveChildren | GetPageResponse) {
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

function getPageTitleAndEmoji(
	page: BlockWithRecursiveChildren | GetPageResponse | undefined
) {
	if (!page) {
		return "Untitled"
	}
	const title = getPageTitle(page)
	const emoji = getPageEmoji(page)
	return append(title, emoji)
}

function getPageEmoji(page: BlockWithRecursiveChildren | GetPageResponse) {
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
