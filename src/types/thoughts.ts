/**
 * A thought object.
 */
export type Thought = {
	id: string
	text: string
	timestamp: string
	/**
	 * Source where the thought was retrieved from.
	 *
	 * If a file, will contain the file path & location.
	 * If a Notion block, will contain both the page and block IDs.
	 */
	source:
		| {
				type: "file"
				file: string
		  }
		| {
				type: "block"
				page: string
				block: string
		  }
}
