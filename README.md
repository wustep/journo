## journo
Tooling for Notion journaling synthesis, by @wustep

### description
This repo creates some utilities and scripts for synthesizing journals from Notion.

Currently, it can ingest text from a Notion DB and dump thoughts in various organizational patterns. More coming soon!

Inspired by [this review of Sheila Heti's Alphabetical Diaries](https://artreview.com/sheila-heti-alphabetical-diaries/).

### setup
1. Follow the instructions in https://www.notion.so/help/create-integrations-with-the-notion-api to create a Notion integration and receive an API key!
2. Share the desired files with the Notion integration added to your workspace.
3. With NPM installed, run `npm install` and in this root directory. Optionally use `npm install -g` instead to install globally so you can use the command `journo` directly.
4. Use `npm build` to build the codebase.
5. Now, you can use either `npm run journo [command]` or `journo [command]` (if you used `-g` flag above) to execute commands below!

### commands
- ✅ `help` - get list of commands
- ✅ `set-api-key [Notion API key]` - to add and store an integration API key in .env file
- ✅ `import-db [Notion Database URL]` - to ingest a database of Notion journal pages, must be shared with the integration
- ✅ `import-page [Notion URL]` - to ingest a Notion page, must be shared with the API key
- `import /path/to/text/file` - to ingest a text file
- ✅ `thoughts` - dump all the ingested files into a list of thoughts, with some different organizational options
 - ✅ `--abc` (alphabetical), `--regex` (filter by regex), `--sentences` (split by sentences), `--newlines` (add newlines), `--dedupe` (skip dupes), `--words` (split by words)
- `import-stats` - get various stats on all imported content
- `create-notion-db [Notion Page URL]` - to create an export database at the given page (it will be nested at that page)
- `export-csv /path/to/csv/file` - to export to csv
- `export-db [Notion Database URL]` - to export to a Notion export database that matches the given URL
- `set-db [Notion Page URL]` - to set the default notion DB for exporting purposes
- `trash` - delete all imported content and saved databases

### dev
- Run `npm run dev` to execute the program in developer mode, which means it'll auto-build on file edits and let you input commands more quickly.