"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memfs_1 = require("memfs");
/**
 * Mock the file system with memfs for a virtual file system.
 */
const vol = new memfs_1.Volume();
(0, memfs_1.createFsFromVolume)(vol);
jest.mock("fs", () => memfs_1.fs);
jest.mock("fs-extra", () => memfs_1.fs);
afterEach(() => vol.reset());
//# sourceMappingURL=jest.setup.js.map