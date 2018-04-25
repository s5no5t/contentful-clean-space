// tslint:disable-next-line:no-reference
///<reference path="./contentful-management.d.ts" />
import { createClient } from "contentful-management";
import * as inquirer from "inquirer";
import * as ProgressBar from "progress";
import * as yargs from "yargs";

export async function main() {
    const argv = yargs.env()
        .option("space-id", {
            type: "string",
            describe: "Contentful space id",
            demandOption: true
        }).option("accesstoken", {
            type: "string",
            describe: "Contentful access token",
            demandOption: true
        }).option("batch-size", {
            type: "number",
            describe: "Number of parallel contentful requests",
            default: 5
        }).option("yes", {
            type: "boolean",
            describe: "Auto-confirm delete prompt",
            alias: "y",
            default: false
        }).option("verbose", {
            type: "boolean",
            alias: "v",
            default: false
        }).version(false)
        .parse();
    const accessToken: string = argv["accesstoken"];
    const spaceId: string = argv["space-id"];
    const verbose: boolean = argv["verbose"];
    const batchSize: number = argv["batch-size"];
    const yes: boolean = argv["yes"];

    const contentfulManagementClient = createClient({
        accessToken
    });
    console.log(`Opening Contentful space "${spaceId}"`);
    const contentfulSpace = await contentfulManagementClient.getSpace(spaceId);
    console.log(`Using space "${spaceId}" (${contentfulSpace.name})`);

    const metadata = await contentfulSpace.getEntries({
        include: 0,
        limit: 0
    });
    let totalEntries = metadata.total;

    if (!yes) {
        if (!await promptForConfirmation(spaceId))
            return;
    }

    console.log(`Deleting ${totalEntries} entries`);

    // tslint:disable-next-line:max-line-length
    const progressBar = new ProgressBar("Deleting entries [:bar], rate: :rate/s, done: :percent, time left: :etas", { total: totalEntries });
    do {
        const entries = await contentfulSpace.getEntries({
            include: 0,
            limit: batchSize
        });
        totalEntries = entries.total;

        const promises: Array<Promise<void>> = [];
        for (const entry of entries.items) {
            const promise = unpublishAndDeleteEntry(entry, progressBar, verbose);
            promises.push(promise);
        }
        await Promise.all(promises);
    } while (totalEntries > batchSize);
    console.log("Done");
}

async function promptForConfirmation(spaceId: string) {
    const a: any = await inquirer.prompt([{
        type: "confirm",
        name: "yes",
        message: `Do you really want to delete all entries from space ${spaceId}?`
    }]);
    return a.yes;
}

async function unpublishAndDeleteEntry(entry: any, progressBar: ProgressBar, verbose: boolean) {
    try {
        if (entry.isPublished()) {
            if (verbose)
                console.log(`Unpublishing entry "${entry.sys.id}"`);
            await entry.unpublish();
        }
        if (verbose)
            console.log(`Deleting entry '${entry.sys.id}"`);
        await entry.delete();
    } catch (e) {
        console.log(e);
        // Continue if something went wrong with Contentful
    } finally {
        progressBar.tick();
    }
    console.log("Done");
}
