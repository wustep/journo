import { BlockWithRecursiveChildren } from "../types/notion"
import { type Thought } from "../types/thought"
import { getAllImportedFiles, readJSON } from "./file"
import { withoutDashes } from "./id"
import { blockToPlainText } from "./notion"

export function ingestData(args: {
	sentences: boolean
	words: boolean
}): Thought[] {
	const thoughts: Thought[] = []
	ingestNotionPages(thoughts, args)
	return thoughts
}

const pageContentFiles = new RegExp(".*getBlocks.*.json")

// TODO: we should probably store thoughts in some data struct (JSON isn't terrible)
// data/thoughts/blocks, sentences, words, etc
// and then manipulate it afterwards

function ingestNotionPages(
	thoughts: Thought[],
	args: { sentences: boolean; words: boolean }
) {
	const files = getAllImportedFiles()
	files.forEach((file) => {
		if (file.match(pageContentFiles)) {
			const contents = readJSON(file) as
				| BlockWithRecursiveChildren[]
				| undefined
			if (contents) {
				const pageId = file.split("/").pop()?.split(".")[0].split("-")[1] ?? ""
				contents?.forEach((block) => {
					const source = {
						page: pageId,
						block: withoutDashes(block.id),
					}
					const plainText = blockToPlainText(block)
					const newThoughts = split(plainText, args)
					if (newThoughts.length) {
						newThoughts.forEach((thought) =>
							thoughts.push({
								type: args.sentences
									? "sentence"
									: args.words
									? "word"
									: "block",
								id: block.id,
								text: thought,
								timestamp:
									"created_time" in block ? (block.created_time as string) : "",
								source,
							})
						)
					}
				})
			}
		}
	})
}

function split(text: string, args: { sentences: boolean; words: boolean }) {
	if (args.sentences) {
		return splitSentences(text)
	} else if (args.words) {
		return splitWords(text)
	} else {
		return [text]
	}
}

/**
 * Smartly split the text into sentences, so it keeps the delimiters and external quotes, except removes newlines and extra spacing on each side.
 *
 * Not perfect yet, mostly chatGPT, but it's almost there.
 */
function splitSentences(text: string): string[] {
	// Regex to match URLs
	const urlRegex =
		/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

	// Temporarily replace URLs with placeholders
	const urlPlaceholderPrefix = "URL_PLACEHOLDER_"
	let urlCount = 0
	let urlMap: {
		[placeholder: string]: string
	} = {}
	text = text.replace(urlRegex, (match) => {
		let placeholder = `${urlPlaceholderPrefix}${urlCount++}`
		urlMap[placeholder] = match
		return placeholder
	})

	// Split the text into blocks of quoted text and non-quoted text
	const quotedAndNonQuotedBlocks = text.match(/"[^"]+"|[^"\n]+|\n/g)

	let thoughts = []
	let currentThought = ""

	quotedAndNonQuotedBlocks?.forEach((block) => {
		if (block.startsWith('"') || block.startsWith("“")) {
			// If the block is a quoted segment, treat it as a complete thought
			if (currentThought) {
				thoughts.push('"' + currentThought.trim() + '"')
				currentThought = ""
			}
			thoughts.push(block)
		} else if (block === "\n") {
			// If the block is a newline, treat it as a boundary
			if (currentThought) {
				thoughts.push(currentThought.trim())
				currentThought = ""
			}
			// Newlines outside of quotes are treated as distinct thoughts, so we don't add them to thoughts
		} else {
			// Process non-quoted block
			block.split(/(\.\.\.|\.)/).forEach((part) => {
				if (part === "..." || part === ".") {
					// Ellipsis and periods are treated as boundaries but included in the thought
					currentThought += part
					thoughts.push(currentThought.trim())
					currentThought = ""
				} else {
					// Accumulate text parts into the current thought
					currentThought += part
				}
			})
		}
	})

	// Add the last thought if it's not empty
	thoughts.push(currentThought.trim())

	return thoughts.map((thought) => {
		return thought.replace(
			new RegExp(`${urlPlaceholderPrefix}\\d+`, "g"),
			(placeholder) => urlMap[placeholder]
		)
	})
}

function splitWords(text: string): string[] {
	const cleanedText = text.replace(/[“”"'.?!,:;()]+/g, " ").replace(/\s+/g, " ")
	const words = cleanedText.trim().split(/\s+/)
	return words
}
