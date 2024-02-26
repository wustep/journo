#!/usr/bin/env node

import { Program } from "./program"
import dotenv from "dotenv"

dotenv.config()

const program = Program()
program.parse(process.argv)
