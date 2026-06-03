require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

process.env.TS_NODE_SKIP_PROJECT = "1";
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: "CommonJS",
  moduleResolution: "node",
  target: "ES2020",
});

require("ts-node/register/transpile-only");
require("./seed.ts");
