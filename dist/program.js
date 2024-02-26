#! /usr/bin/env node
"use strict";
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
exports.Program = void 0;
const commander_1 = require("commander");
const client_1 = require("@notionhq/client");
const notion_1 = require("./utils/notion");
const file_1 = require("./utils/file");
function Program() {
    let notionApiKey = process.env.NOTION_API_KEY;
    let notionClient = notionApiKey
        ? new client_1.Client({ auth: notionApiKey })
        : undefined;
    const program = new commander_1.Command();
    program
        .name("journo")
        .description("CLI for Notion journal entry tooling")
        .version("0.1.0");
    program
        .command("api")
        .argument("<key>", "API key for Notion (e.g. 'secret_UO1...')")
        .description("Set the Notion API key")
        .action((apiKey) => {
        if (apiKey) {
            // TODO: Append if file exists instead of writing.
            (0, file_1.writeFile)(".env", `NOTION_API_KEY=${apiKey}\n`);
            console.log("API key saved to .env file");
            notionClient = new client_1.Client({ auth: apiKey });
        }
    });
    program
        .command("import")
        .argument("<database>", "ID or URL of the Notion database")
        .description("Import a Notion database")
        .action((database) => __awaiter(this, void 0, void 0, function* () {
        const databaseId = (0, notion_1.getDatabaseId)(database);
        if (!notionApiKey) {
            console.log("No API key found, please use `api` to set it");
            return;
        }
        if (!notionClient) {
            console.log("Invalid API key, unable to connect to Notion.");
            return;
        }
        if (databaseId) {
            const pages = yield (0, notion_1.getDatabasePages)(notionClient, databaseId);
            console.log(pages.results);
        }
    }));
    return program;
}
exports.Program = Program;
//# sourceMappingURL=program.js.map