const { createServer } = require("http");
const next = require("next");

const dev = false;
const hostname = "127.0.0.1";
const port = parseInt(process.env.PORT || "4001", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`PGYS Website ready on http://${hostname}:${port}`);
  });
});