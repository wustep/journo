/**
 * Extended Notion API types.
 */

import {
	PartialBlockObjectResponse,
	BlockObjectResponse,
	PartialPageObjectResponse,
	PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"

/**
 * Blocks without children recursively filled.
 */
export type Block = (
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
export type BlockWithRecursiveChildren = Omit<Block, "children"> &
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
