#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const program_1 = require("./program");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const program = (0, program_1.Program)();
program.parse(process.argv);
//# sourceMappingURL=index.js.map