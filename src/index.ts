import * as yargs from "yargs";

const argv = yargs.option("space-id", {
    type: "string",
    describe: "Contentful space id",
    demandOption: true
}).option("access-token", {
    type: "string",
    describe: "Contentful access token",
    demandOption: true
}).version(false)
    .parse();
