"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = exports.ROOT_FOLDER = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
exports.ROOT_FOLDER = path_1.default.join(__dirname, "..", "..");
/**
 * Writes files to the project root.
 */
function writeFile(fileName, contents) {
    fs_extra_1.default.outputFileSync(path_1.default.join(exports.ROOT_FOLDER, fileName), contents);
}
exports.writeFile = writeFile;
//# sourceMappingURL=file.js.map