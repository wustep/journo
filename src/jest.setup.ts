import { fs, createFsFromVolume, Volume } from "memfs"

/**
 * Mock the file system with memfs for a virtual file system.
 */
const vol = new Volume()
createFsFromVolume(vol)

jest.mock("fs", () => fs)
jest.mock("fs-extra", () => fs)

afterEach(() => vol.reset())
