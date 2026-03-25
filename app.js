const { Command } = require("commander");
const http = require("http");
const fs = require("fs");

const program = new Command();

program
  .requiredOption("-i, --input <file>")
  .requiredOption("-h, --host <host>")
  .requiredOption("-p, --port <port>");

program.parse(process.argv);
const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.end("Server works");
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});