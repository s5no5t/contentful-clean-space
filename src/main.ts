import { createClient } from "contentful-management";
import {
  Asset,
  ContentType,
  Entry,
  Space,
} from "contentful-management/dist/typings/export-types";
import * as inquirer from "inquirer";
import * as ProgressBar from "progress";
import * as yargs from "yargs";

export async function main() {
  const argv = yargs
    .env()
    .option("space-id", {
      type: "string",
      describe: "Contentful space id",
      demandOption: true,
    })
    .option("env", {
      type: "string",
      describe: "Contentful environment",
      demandOption: true,
    })
    .option("accesstoken", {
      type: "string",
      describe: "Contentful access token",
      demandOption: true,
    })
    .option("batch-size", {
      type: "number",
      describe: "Number of parallel contentful requests",
      default: 5,
    })
    .option("content-types", {
      type: "boolean",
      describe: "Delete content types as well",
      default: false,
    })
    .option("assets", {
      type: "boolean",
      describe: "Delete assets as well",
      default: false,
    })
    .option("yes", {
      type: "boolean",
      describe: "Auto-confirm delete prompt",
      alias: "y",
      default: false,
    })
    .option("verbose", {
      type: "boolean",
      alias: "v",
      default: false,
    })
    .version(false)
    .parse();
  const accessToken: string = argv["accesstoken"];
  const spaceId: string = argv["space-id"];
  const verbose: boolean = argv["verbose"];
  const batchSize: number = argv["batch-size"];
  const isContentTypes: boolean = argv["content-types"];
  const isAssets: boolean = argv["assets"];
  const yes: boolean = argv["yes"];

  const env: string = argv["env"] || "master";

  const contentfulManagementClient = createClient({
    accessToken,
  });
  const contentfulSpace = await contentfulManagementClient.getSpace(spaceId);
  console.log(`Using space "${spaceId}" (${contentfulSpace.name})`);
  console.log(`Using environment "${env}"`);

  if (!yes) {
    if (!(await promptForEntriesConfirmation(spaceId, env))) return;
  }
  await deleteEntries(contentfulSpace, batchSize, verbose, env);

  if (isContentTypes) {
    if (!yes) {
      if (!(await promptForContentTypesConfirmation(spaceId, env))) return;
    }
    await deleteContentTypes(contentfulSpace, batchSize, verbose, env);
  }

  if (isAssets) {
    if (!yes) {
      if (!(await promptForAssetsConfirmation(spaceId, env))) return;
    }
    await deleteAssets(contentfulSpace, batchSize, verbose, env);
  }
}

async function promptForEntriesConfirmation(
  spaceId: string,
  environment: string
) {
  const prompt = await inquirer.prompt<{ yes: boolean }>([
    {
      type: "confirm",
      name: "yes",
      message: `Do you really want to delete all entries from space ${spaceId}:${environment}?`,
    },
  ]);
  return prompt.yes;
}

async function promptForContentTypesConfirmation(
  spaceId: string,
  environment: string
) {
  const prompt = await inquirer.prompt<{ yes: boolean }>([
    {
      type: "confirm",
      name: "yes",
      message: `Do you really want to delete all content types from space ${spaceId}:${environment}?`,
    },
  ]);
  return prompt.yes;
}

async function promptForAssetsConfirmation(
  spaceId: string,
  environment: string
) {
  const prompt = await inquirer.prompt<{ yes: boolean }>([
    {
      type: "confirm",
      name: "yes",
      message: `Do you really want to delete all assets/media from space ${spaceId}:${environment}?`,
    },
  ]);
  return prompt.yes;
}

async function deleteEntries(
  contentfulSpace: Space,
  batchSize: number,
  verbose: boolean,
  environment: string
) {
  const selectedEnvironment = await contentfulSpace.getEnvironment(environment);
  const entriesMetadata = await selectedEnvironment.getEntries({
    include: 0,
    limit: 0,
  });
  let totalEntries = entriesMetadata.total;
  console.log(`Deleting ${totalEntries} entries`);

  // tslint:disable-next-line:max-line-length
  const entriesProgressBar = new ProgressBar(
    "Deleting entries [:bar], rate: :rate/s, done: :percent, time left: :etas",
    { total: totalEntries }
  );
  do {
    const entries = await selectedEnvironment.getEntries({
      include: 0,
      limit: batchSize,
    });
    totalEntries = entries.total;

    const promises: Array<Promise<void>> = [];
    for (const entry of entries.items) {
      const promise = unpublishAndDeleteEntry(
        entry,
        entriesProgressBar,
        verbose
      );
      promises.push(promise);
    }
    await Promise.all(promises);
  } while (totalEntries > batchSize);
}

async function unpublishAndDeleteEntry(
  entry: Entry | Asset,
  progressBar: ProgressBar,
  verbose: boolean
) {
  try {
    if (entry.isPublished()) {
      if (verbose) console.log(`Unpublishing entry "${entry.sys.id}"`);
      await entry.unpublish();
    }
    if (verbose) console.log(`Deleting entry '${entry.sys.id}"`);
    await entry.delete();
  } catch (e) {
    console.log(e);
    // Continue if something went wrong with Contentful
  } finally {
    progressBar.tick();
  }
}

async function deleteContentTypes(
  contentfulSpace: Space,
  batchSize: number,
  verbose: boolean,
  environment: string
) {
  const selectedEnvironment = await contentfulSpace.getEnvironment(environment);
  const contentTypesMetadata = await selectedEnvironment.getContentTypes({
    include: 0,
    limit: 0,
  });
  let totalContentTypes = contentTypesMetadata.total;
  console.log(`Deleting ${totalContentTypes} content types`);

  // tslint:disable-next-line:max-line-length
  const contentTypesProgressBar = new ProgressBar(
    "Deleting content types [:bar], rate: :rate/s, done: :percent, time left: :etas",
    { total: totalContentTypes }
  );
  do {
    const contentTypes = await selectedEnvironment.getContentTypes({
      include: 0,
      limit: batchSize,
    });
    totalContentTypes = contentTypes.total;

    const promises: Array<Promise<void>> = [];
    for (const contentType of contentTypes.items) {
      const promise = unpublishAndDeleteContentType(
        contentType,
        contentTypesProgressBar,
        verbose
      );
      promises.push(promise);
    }
    await Promise.all(promises);
  } while (totalContentTypes > batchSize);
}

async function unpublishAndDeleteContentType(
  contentType: ContentType,
  progressBar: ProgressBar,
  verbose: boolean
) {
  try {
    if (contentType.isPublished()) {
      if (verbose)
        console.log(`Unpublishing content type "${contentType.sys.id}"`);
      await contentType.unpublish();
    }
    if (verbose) console.log(`Deleting content type '${contentType.sys.id}"`);
    await contentType.delete();
  } catch (e) {
    console.log(e);
    // Continue if something went wrong with Contentful
  } finally {
    progressBar.tick();
  }
}

async function deleteAssets(
  contentfulSpace: Space,
  batchSize: number,
  verbose: boolean,
  environment: string
) {
  const selectedEnvironment = await contentfulSpace.getEnvironment(environment);
  const assetsMetadata = await selectedEnvironment.getAssets({
    include: 0,
    limit: 0,
  });
  let totalAssets = assetsMetadata.total;
  console.log(`Deleting ${totalAssets} assets/media`);

  // tslint:disable-next-line:max-line-length
  const entriesProgressBar = new ProgressBar(
    "Deleting assets [:bar], rate: :rate/s, done: :percent, time left: :etas",
    { total: totalAssets }
  );
  do {
    const assets = await selectedEnvironment.getAssets({
      include: 0,
      limit: batchSize,
    });
    totalAssets = assets.total;

    const promises: Array<Promise<void>> = [];
    for (const asset of assets.items) {
      const promise = unpublishAndDeleteEntry(
        asset,
        entriesProgressBar,
        verbose
      );
      promises.push(promise);
    }
    await Promise.all(promises);
  } while (totalAssets > batchSize);
}
