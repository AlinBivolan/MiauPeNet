const dns = require("node:dns/promises");

async function main() {
  console.log("Node:", process.version);
  console.log("DNS before:", await dns.getServers());

  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  console.log("DNS after:", await dns.getServers());

  const r = await dns.resolveSrv("_mongodb._tcp.scurityplatform.c5675pl.mongodb.net");
  console.log("SRV:", r);
}

main().catch(console.error);