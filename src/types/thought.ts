import { Block } from "./notion"

export type Source = {
	file?: string
	database?: string
	block?: string
}

type ThoughtType = "sentence" | "word" | "block"

/**
 * A thought object.
 */
export type Thought = {
	type: ThoughtType
	id: string
	timestamp: string
	source: Source
	text: string
}

export type ThoughtSentence = Thought & {
	type: "sentence"
}

export type ThoughtWord = Thought & {
	type: "word"
}

export type ThoughtBlock = Thought & {
	type: "block"
}
