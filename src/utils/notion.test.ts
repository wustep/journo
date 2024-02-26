import { describe, expect, test } from "@jest/globals"
import { getDatabaseId } from "./notion"
import { randomUUID } from "crypto"

describe("getDatabaseId", () => {
	const uuid1 = randomUUID()
	const uuid1WithoutDashes = uuid1.replace(/-/g, "")
	const uuid2 = randomUUID()
	const uuid2WithoutDashes = uuid2.replace(/-/g, "")

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
