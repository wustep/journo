"use strict";
/**
 * Utils for interacting with the Notion API.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseId = exports.getDatabasePages = void 0;
function getDatabasePages(client, databaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield client.databases.query({
            database_id: databaseId,
        });
    });
}
exports.getDatabasePages = getDatabasePages;
/**
 * Given a database URL or ID as an input, return the undashed uuid.
 *
 */
function getDatabaseId(input) {
    const pattern = /\b[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}\b/i;
    const match = input.match(pattern);
    if (match) {
        return match[0].replace(/-/g, "");
    }
    return;
}
exports.getDatabaseId = getDatabaseId;
//# sourceMappingURL=notion.js.map