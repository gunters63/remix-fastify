import fastify from "fastify";
import { remixFastifyPlugin } from "@mcansh/remix-fastify";
import { installGlobals } from "@remix-run/node";

import * as serverBuild from "./build/index.mjs";

let nodeMajor = Number(process.versions.node.split(".")[0]);

if (["true", "1"].includes(process.env.INSTALL_GLOBALS) || nodeMajor < 20) {
  console.log(`installing remix globals`);
  installGlobals();
} else {
  console.log(`using existing globals`);
}

let MODE = process.env.NODE_ENV;

let app = fastify();

await app.register(remixFastifyPlugin, {
  build: serverBuild,
  mode: MODE,
  getLoadContext: () => ({ loadContextName: "John Doe" }),
  purgeRequireCacheInDevelopment: false,
  unstable_earlyHints: true,
});

let port = process.env.PORT ? Number(process.env.PORT) || 3000 : 3000;

let address = await app.listen({ port, host: "0.0.0.0" });
console.log(`✅ app ready: ${address}`);

if (MODE === "development") {
  let { broadcastDevReady } = await import("@remix-run/node");
  broadcastDevReady(serverBuild);
}
