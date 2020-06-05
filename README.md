# Steam Condenser

Work in progress implementation of steam-condenser in Typescript/node.js.

## Usage

The library is implemented in Typescript but works fine with JavaScript.

```javascript
let { SourceServer, MasterServer } = require("steam-condenser");

async function main() {
  const server = new SourceServer(ip);
  try {
    // Set up connection
    await server.initialize();

    const info = await server.getServerInfo();
    console.log(info);

    const rules = await server.getRules();
    console.log(rules);

    const players = await server.getPlayers();
    console.log(players);

    // We need to authorize with rcon before executing commands
    await server.rconAuth(password);

    const stats = await server.rconExec("stats");
    console.log(stats);
  }
  catch (e) {
    console.error(e);
  }
  finally {
    // Remember to disconnect
    await server.disconnect();
  }

  const ms = SourceServer.GetMaster();
  try {
    // Get first page of server ip's running de_dust
    const servers = await ms.getServers(MasterServer.REGION_ALL, 
      "\\map\\de_dust");
    console.log(servers);
  }
  catch(error) {
      console.error(error);
  }
  finally {
    await ms.disconnect();
  }
}

main();
```

## Status and limitations

The module currently only supports what is described in above example. Full
parity with koraktors Steam Condenser is the final goal.

When using the current library it's important to realize that it's ported code
expecting network communication to be blocking, but it uses non-blocking
functions. This means you must not call more than one function that
communicates over the same socket (`getRules` and `getInfo`, or multiple rcon
commands).

Ex.
`await Promise.all([server.rconExec("stats"), server.rconExec("sv_gravity")])`
might not work, but opening two connections or running them in serial will
work.
