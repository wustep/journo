## journo
Tooling for Notion journaling synthesis, by @wustep

### description
This repo creates some utilities and scripts for synthesizing journals from Notion.

### setup
1. Follow the instructions in https://www.notion.so/help/create-integrations-with-the-notion-api to create a Notion integration and receive an API key!
2. Share the desired files with the Notion integration added to your workspace.
3. With NPM installed, run `npm install` and in this root directory. Optionally use `npm install -g` instead to install globally so you can use the command `journo` directly.
4. Then, use either `npm run journo [command]` or `journo [command]` (if you used `-g` flag above) to execute commands below.

### commands
- `help` - get list of commands
- `api [Notion API key]` - to add and store an integration API key in .env file
- `import [Notion Database URL]` - to add a database of Notion journal pages, must be shared with the integration
- `import [Notion URL]` - to ingest a Notion page, must be shared with the API key
- `import /path/to/text/file` - to ingest a text file
- `create_notion_export_db [Notion Page URL]` - to create an export database at the given page
- `export_notion [Notion Database URL]` - to export to a Notion export database
- `export_csv /path/to/csv/file` - to export to csv

### dev
- Run `npm run dev` to execute the program in developer mode, which means it'll auto-build on file edits and let you input commands more quickly.