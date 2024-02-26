import { describe, expect, test } from "@jest/globals"
import { getDatabaseId } from "./notion"
import { randomUUID } from "crypto"
import { randID, withoutDashes } from "./id"

describe("getDatabaseId", () => {
	const uuid1 = randID()
	const uuid1WithoutDashes = withoutDashes(uuid1)
	const uuid2 = randID()
	const uuid2WithoutDashes = withoutDashes(uuid2)

	it("works with Notion URLs", () => {
		expect(
			getDatabaseId(`https://www.notion.so/My-Database-${uuid1WithoutDashes}`)
		).toBe(uuid1WithoutDashes)
		expect(
			getDatabaseId(
				`https://www.notion.so/My-Database-${uuid1WithoutDashes}?v=${uuid2WithoutDashes}}`
			)
		).toBe(uuid1WithoutDashes)
	})

	it("works with dashed IDs directly", () => {
		expect(getDatabaseId(uuid1)).toBe(uuid1WithoutDashes)
		expect(getDatabaseId(uuid2)).toBe(uuid2WithoutDashes)
	})
})
