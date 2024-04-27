import { describe, expect, it } from "@jest/globals"
import { getPageId } from "./notion"
import { randId, withoutDashes } from "./id"

describe("getDatabaseId", () => {
	const uuid1 = randId()
	const uuid1WithoutDashes = withoutDashes(uuid1)
	const uuid2 = randId()
	const uuid2WithoutDashes = withoutDashes(uuid2)

	it("works with Notion URLs", () => {
		expect(
			getPageId(`https://www.notion.so/My-Database-${uuid1WithoutDashes}`)
		).toBe(uuid1WithoutDashes)
		expect(
			getPageId(
				`https://www.notion.so/My-Database-${uuid1WithoutDashes}?v=${uuid2WithoutDashes}}`
			)
		).toBe(uuid1WithoutDashes)
	})

	it("works with dashed IDs directly", () => {
		expect(getPageId(uuid1)).toBe(uuid1WithoutDashes)
		expect(getPageId(uuid2)).toBe(uuid2WithoutDashes)
	})
})
