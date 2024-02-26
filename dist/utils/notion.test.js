"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const notion_1 = require("./notion");
const crypto_1 = require("crypto");
(0, globals_1.describe)("getDatabaseId", () => {
    const uuid1 = (0, crypto_1.randomUUID)();
    const uuid1WithoutDashes = uuid1.replace(/-/g, "");
    const uuid2 = (0, crypto_1.randomUUID)();
    const uuid2WithoutDashes = uuid2.replace(/-/g, "");
    it("works with Notion URLs", () => {
        (0, globals_1.expect)((0, notion_1.getDatabaseId)(`https://www.notion.so/My-Database-${uuid1WithoutDashes}`)).toBe(uuid1WithoutDashes);
        (0, globals_1.expect)((0, notion_1.getDatabaseId)(`https://www.notion.so/My-Database-${uuid1WithoutDashes}?v=${uuid2WithoutDashes}}`)).toBe(uuid1WithoutDashes);
    });
    it("works with dashed IDs directly", () => {
        (0, globals_1.expect)((0, notion_1.getDatabaseId)(uuid1)).toBe(uuid1WithoutDashes);
        (0, globals_1.expect)((0, notion_1.getDatabaseId)(uuid2)).toBe(uuid2WithoutDashes);
    });
});
//# sourceMappingURL=notion.test.js.map