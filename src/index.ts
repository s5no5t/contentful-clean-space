// tslint:disable-next-line:no-reference
///<reference path="./contentful-management.d.ts" />
import { createManagementClient } from "contentful-management";
import * as yargs from "yargs";

async function main() {
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

    const contentfulManagementClient = createManagementClient({
        accessToken: argv["access-token"]
    });
    const contentfulSpace = await contentfulManagementClient.getSpace(argv["space-id"]);
}

(async () => {
    await main();
})();
