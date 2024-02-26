"use strict";
/**
 * Tests for program.ts.
 * https://github.com/tj/commander.js/blob/master/tests/options.version.test.js
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const program_1 = require("./program");
const file_1 = require("./utils/file");
(0, globals_1.describe)("Commands", () => {
    const writeOut = jest.fn();
    const consoleLog = jest.spyOn(console, "log");
    function getProgram() {
        const program = (0, program_1.Program)();
        program.exitOverride().configureOutput({ writeOut });
        return program;
    }
    (0, globals_1.describe)("help", () => {
        (0, globals_1.test)("help returns a list of commands", () => {
            const program = getProgram();
            (0, globals_1.expect)(() => {
                program.parse(["node", "test", "help"]);
            }).toThrow();
            (0, globals_1.expect)(writeOut).toHaveBeenCalledWith(globals_1.expect.stringContaining("Usage: journo [options] [command]"));
        });
    });
    (0, globals_1.describe)("api", () => {
        (0, globals_1.test)("api sets the API key", () => {
            const program = getProgram();
            const apiKey = "secret_LALALALALALLALALALLA";
            program.parse(["node", "test", "api", apiKey]);
            (0, globals_1.expect)(fs_1.default.readFileSync(path_1.default.join(file_1.ROOT_FOLDER, ".env"), "utf-8")).toBe(`NOTION_API_KEY=${apiKey}\n`);
            (0, globals_1.expect)(consoleLog).toHaveBeenCalledWith("API key saved to .env file");
        });
    });
});
//# sourceMappingURL=program.test.js.map