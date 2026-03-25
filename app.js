const { Command } = require("commander");
const http = require("http");
const fs = require("fs");
const { XMLBuilder } = require("fast-xml-parser");

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
  const url = req.url;
  const showMF0 = url.includes("mf0=true");  
  const showNormal = url.includes("normal=true");
  
  fs.readFile(options.input, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error reading file");
      return;
    }
    
    const banks = JSON.parse(data);
    let filteredBanks = banks;
    
    if (showNormal) {
      filteredBanks = [];
      for (let i = 0; i < banks.length; i++) {
        if (banks[i].COD_STATE === 1) {
          filteredBanks.push(banks[i]);
        }
      }
    }
    
    const banksXML = [];
    for (let i = 0; i < filteredBanks.length; i++) {
      const bank = filteredBanks[i];
      
      if (showMF0) {
        banksXML.push({
          mf0_code: bank.MFO,     
          name: bank.NAME,
          state_code: bank.COD_STATE
        });
      } else {
        banksXML.push({
          name: bank.NAME,
          state_code: bank.COD_STATE
        });
      }
    }
    
    const xmlObj = {
      banks: {
        bank: banksXML
      }
    };
    
    const builder = new XMLBuilder({ format: true });
    const xml = builder.build(xmlObj);
    
    res.writeHead(200, { "Content-Type": "application/xml" });
    res.end(xml);
  });
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});