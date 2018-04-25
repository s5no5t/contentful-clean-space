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
        }).option("content-types", {
            type: "boolean",
            describe: "Delete content types as well",
            default: false
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
    const isContentTypes: boolean = argv["content-types"];
    const yes: boolean = argv["yes"];

    const contentfulManagementClient = createClient({
        accessToken
    });
    console.log(`Opening Contentful space "${spaceId}"`);
    const contentfulSpace = await contentfulManagementClient.getSpace(spaceId);
    console.log(`Using space "${spaceId}" (${contentfulSpace.name})`);

    if (!yes) {
        if (!await promptForEntriesConfirmation(spaceId))
            return;
    }
    await deleteEntries(contentfulSpace, batchSize, verbose);

    if (isContentTypes) {
        if (!yes) {
            if (!await promptForContentTypesConfirmation(spaceId))
                return;
        }
        await deleteContentTypes(contentfulSpace, batchSize, verbose);
    }
}

async function promptForEntriesConfirmation(spaceId: string) {
    const a: any = await inquirer.prompt([{
        type: "confirm",
        name: "yes",
        message: `Do you really want to delete all entries from space ${spaceId}?`
    }]);
    return a.yes;
}

async function promptForContentTypesConfirmation(spaceId: string) {
    const a: any = await inquirer.prompt([{
        type: "confirm",
        name: "yes",
        message: `Do you really want to delete all content types from space ${spaceId}?`
    }]);
    return a.yes;
}

async function deleteEntries(contentfulSpace: any, batchSize: number, verbose: boolean) {
    const entriesMetadata = await contentfulSpace.getEntries({
        include: 0,
        limit: 0
    });
    let totalEntries = entriesMetadata.total;
    console.log(`Deleting ${totalEntries} entries`);

    // tslint:disable-next-line:max-line-length
    const entriesProgressBar = new ProgressBar("Deleting entries [:bar], rate: :rate/s, done: :percent, time left: :etas", { total: totalEntries });
    do {
        const entries = await contentfulSpace.getEntries({
            include: 0,
            limit: batchSize
        });
        totalEntries = entries.total;

        const promises: Array<Promise<void>> = [];
        for (const entry of entries.items) {
            const promise = unpublishAndDeleteEntry(entry, entriesProgressBar, verbose);
            promises.push(promise);
        }
        await Promise.all(promises);
    } while (totalEntries > batchSize);
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
}

async function deleteContentTypes(contentfulSpace: any, batchSize: number, verbose: boolean) {
    const contentTypesMetadata = await contentfulSpace.getContentTypes({
        include: 0,
        limit: 0
    });
    let totalContentTypes = contentTypesMetadata.total;
    console.log(`Deleting ${totalContentTypes} content types`);

    // tslint:disable-next-line:max-line-length
    const contentTypesProgressBar = new ProgressBar("Deleting content types [:bar], rate: :rate/s, done: :percent, time left: :etas", { total: totalContentTypes });
    do {
        const contentTypes = await contentfulSpace.getContentTypes({
            include: 0,
            limit: batchSize
        });
        totalContentTypes = contentTypes.total;

        const promises: Array<Promise<void>> = [];
        for (const contentType of contentTypes.items) {
            const promise = unpublishAndDeleteContentType(contentType, contentTypesProgressBar, verbose);
            promises.push(promise);
        }
        await Promise.all(promises);
    } while (totalContentTypes > batchSize);
}

async function unpublishAndDeleteContentType(contentType: any, progressBar: ProgressBar, verbose: boolean) {
    try {
        if (contentType.isPublished()) {
            if (verbose)
                console.log(`Unpublishing content type "${contentType.sys.id}"`);
            await contentType.unpublish();
        }
        if (verbose)
            console.log(`Deleting content type '${contentType.sys.id}"`);
        await contentType.delete();
    } catch (e) {
        console.log(e);
        // Continue if something went wrong with Contentful
    } finally {
        progressBar.tick();
    }
}
