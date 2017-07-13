# Steam Condenser

Work in progress implementation of steam-condenser in javascript/node.js.

## Usage

```javascript
var SteamCondenser = require("steam-condenser");
var server = new SteamCondenser.Servers.SourceServer(hostport);
server.initialize()
  .then(function() {
    return server.rconAuth(password); // Optional
  })
  .then(function() {
    return server.getServerInfo();
  })
  .then(function(info) {
    console.log(info);
  })
  .then(function() {
    return server.getRules();
  })
  .then(function(rules) {
    console.log("rules", rules);
  })
  .then(function() {
    return server.getPlayers();
  })
  .then(function(players) {
    console.log("players", players);
  })
  .then(function() {
    return server.rconExec("sv_gravity"); // Requires rcon
  })
  .then(function(gravity) {
    console.log(gravity);
  })
  .then(function() {
    server.disconnect();
  })
  .catch(function(e) {
    server.distonnect(); // Always disconnect server
    console.log("Error", e);
  });

/*
 It appears that the steam master servers sometimes doesn't return the final
 ending 0.0.0.0 IP to tell us that there's no more servers. Expect to catch
 Errors with the message "TimeoutException" even though the list is complete.
*/
var ms = SteamCondenser.Servers.SourceServer.getMaster();
ms.socket.timeout = 500;
ms.getServers(SteamCondenser.Servers.MasterServer.REGION_ALL, "\\map\\de_dust")
  .then(function(servers){
    console.log("Got servers", servers);
  })
  .catch(function(e){
    ms.disconnect();
    console.log("Exception", e, e.servers);
  })
```

## Status and limitations

The module currently only supports what is described in above example. Full
parity with koraktors Steam Condenser is the final goal.

When using the current library it's important to realize that it's ported code
expecting network communication to be blocking, but it uses non-blocking
functions. This means you must not call more than one function that
communicates over the same socket (`getRules` and `getInfo`, or multiple rcon
commands).
