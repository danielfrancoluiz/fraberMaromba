const { Client } = require("pg");

const pwd = encodeURIComponent("Familia1584012!");
const ref = "epwypeqmgykzgpgwlnhq";
const hosts = [
  "aws-0-sa-east-1",
  "aws-1-sa-east-1",
  "aws-0-us-east-1",
  "aws-1-us-east-1",
];

(async () => {
  for (const h of hosts) {
    const url = `postgresql://postgres.${ref}:${pwd}@${h}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    const c = new Client({ connectionString: url });
    try {
      await c.connect();
      await c.query("SELECT 1");
      console.log("OK", h);
      await c.end();
    } catch (e) {
      console.log("FAIL", h, e.message.split("\n")[0]);
      try {
        await c.end();
      } catch {}
    }
  }
})();
