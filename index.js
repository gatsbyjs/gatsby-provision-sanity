#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

const sanityClient = require("@sanity/client");
const execa = require("execa");

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const args = yargs(hideBin(process.argv)).argv;

require("dotenv").config();

const API_VERSION = new Date().toISOString().split("T")[0];
const env = process.env.NODE_ENV;
const isCloud = process.env.GATSBY_CLOUD === "true";

yargs(hideBin(process.argv)).check((_, opts) => {
  const sanityStudioPath = opts.sanityStudioPath;
  const sanityProjectId = opts.sanityProjectId;
  const sanityDataset = opts.dataset;
  // const sanityContentPath = opts.sanityContentPath;
  if (sanityStudioPath && sanityProjectId && sanityDataset) return true;
  if (!sanityStudioPath) {
    throw new Error(
      "--sanity-studio-path is required — this should be path to the Sanity Studio directory"
    );
  }
  if (!sanityProjectId) {
    throw new Error("--sanity-project-id is required");
  }
  if (!sanityDataset) {
    throw new Error("--sanity-dataset is required");
  }
  // if (!sanityContentPath) {
  //   throw new Error(
  //     "--sanity-content-path is required — this should be the path to the compressed content file"
  //   );
  // }
});

const createProject = async (opts = {}) => {
  const token = process.env.SANITY_TOKEN;
  const sanityStudioPath = args.sanityStudioPath;
  const sanityContentPath = args.sanityContentPath;
  const sanityProjectId = args.sanityProjectId;
  const sanityProjectName = args.name;
  const sanityDataset = args.dataset;
  let config, client;

  try {
    config = require(path.resolve(
      process.env.INIT_CWD,
      sanityStudioPath,
      "sanity.json"
    ));
  } catch (e) {
    console.log(`Failed to get sanity.json config in ${sanityStudioPath}`);
    process.exit(1);
  }

  config.api = config.api || {};

  try {
    client = sanityClient({
      apiVersion: API_VERSION,
      token,
      useProjectHostname: false,
      useCdn: false,
    });
  } catch (e) {
    console.log(`Failed to create Sanity API client ${e}`);
    process.exit(1);
  }

  console.log("Creating new Sanity project");

  let projectId =
    process.env.SANITY_PROJECT_ID || sanityProjectId || config.api?.projectId;
  let displayName = sanityProjectName || config.project?.name;
  let datasetName =
    process.env.SANITY_DATASET || sanityDataset || config.api?.dataset; // TODO: could be SANITY_PROJECT_DATASET
  const envVars = [];

  if (projectId !== config.api?.projectId) {
    config.api.projectId = projectId;
  }

  if (displayName !== config.project?.name) {
    config.project.name = displayName;
  }

  if (datasetName !== config.api?.dataset) {
    config.api.dataset = datasetName;
  }

  // Update the sanity.json file config as other things read from it later
  console.log("Updating sanity.json");
  fs.outputJson(path.join(`${sanityStudioPath}`, "sanity.json"), config, {
    spaces: 2,
  });

  // update / write .env file if not in cloud
  if (!isCloud) {
    if (fs.existsSync(".env")) {
      console.log("Updating .env file");
      fs.appendFileSync(".env", envVars.join("\n"));
    }
  }

  await deployGraphQL(sanityStudioPath);

  // if we are given a content path, use it to import documents
  if (sanityContentPath) {
    await importSanityData(sanityContentPath, datasetName);
  }

  console.log("Sanity project successfully created");
};

const deployGraphQL = async (dirname) => {
  console.log("Preparing to deploy Sanity GraphQL API...");
  const studioDirname = path.resolve(dirname);
  // install needed Sanity Studio dependencies
  console.log("Installing Sanity Studio dependencies...");
  try {
    const proc = await execa("npm", ["install"], {
      cwd: studioDirname,
    });
    console.log(proc.stdout);
  } catch (e) {
    console.log(`Failed to install studio dependencies: ${e}`);
    process.exit(1);
  }

  // deploy sanity studio
  console.log("Deploying Sanity GraphQL API...");
  try {
    const proc = await execa("sanity", ["graphql", "deploy"], {
      cwd: studioDirname,
      env: {
        SANITY_AUTH_TOKEN: process.env.SANITY_TOKEN, // re-map env var name
      },
    });
    console.log(proc.stdout);
  } catch (e) {
    console.log(`Failed to deploy Sanity GraphQL API: ${e}`);
    process.exit(1);
  }
};

const importSanityData = async (sanityContentPath, datasetName) => {
  console.log("Importing Sanity documents...");

  try {
    const proc = await execa("npx", [
      "@sanity/cli",
      "dataset",
      "import",
      `${sanityContentPath}`,
      `${datasetName}`,
    ]);
    console.log(proc.stdout);
  } catch (e) {
    console.log(`Failed to import Sanity documents: ${e}`);
    process.exit(1);
  }
};

// Show prompt in local dev
if (env !== "production" && !isCloud) {
  const inquirer = require("inquirer");
  const questions = [
    {
      name: "token",
      message: "Sanity API Token",
      when: !args.token && !process.env.SANITY_TOKEN,
      default: process.env.SANITY_TOKEN,
    },
    {
      name: "displayName",
      message: "Project Name",
      when: !args.name,
    },
    {
      name: "dataset",
      message: "Dataset Name",
      default: "production",
      when: !args.dataset && !process.env.SANITY_DATASET,
      default: process.env.SANITY_DATASET,
    },
  ];
  inquirer
    .prompt(questions)
    .then((res) => {
      console.log("inquirer response: ", res);
      createProject(res);
    })
    .catch((err) => console.error(err));
} else {
  createProject(args);
}
