// tslint:disable-next-line:no-reference
///<reference path="./contentful-management.d.ts" />
import { createClient } from "contentful-management";
import * as yargs from "yargs";

export async function main() {
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
    const accessToken = argv["access-token"];
    const spaceId = argv["space-id"];

    const contentfulManagementClient = createClient({
        accessToken
    });
    console.log(`Opening Contentful space "${spaceId}`);
    const contentfulSpace = await contentfulManagementClient.getSpace(spaceId);

    const metadata = await contentfulSpace.getEntries({
        include: 0,
        limit: 0
    });
    let totalEntries = metadata.total;
    console.log(`Deleting "${totalEntries}" entries`);

    const batchSize = 3;
    do {
        const entries = await contentfulSpace.getEntries({
            include: 0,
            limit: batchSize
        });
        totalEntries = entries.total;
        for (const entry of entries.items) {
            try {
                if (entry.isPublished()) {
                    console.log(`Unpublishing entry "${entry.sys.id}"`);
                    await entry.unpublish();
                }
                console.log(`Deleting entry '${entry.sys.id}"`);
                await entry.delete();
            } catch (e) {
                console.log(e);
                // Continue if something went wrong with Contentful
            }
        }
    } while (totalEntries > batchSize);
}
