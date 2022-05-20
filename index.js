const fs = require("fs-extra");
const path = require("path");

const sanityClient = require("@sanity/client");
const execa = require("execa");

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const args = yargs(hideBin(process.argv)).argv;

require("dotenv").config();

const API_VERSION = "2022-03-30";
const env = process.env.NODE_ENV;
const isCloud = process.env.GATSBY_CLOUD === "true";

yargs(hideBin(process.argv)).check((args, opts) => {
  const sanityConfigPath = opts.sanityConfigPath;
  if (sanityConfigPath) return true;
  if (!sanityConfigPath) {
    throw new Error("--sanity-config-path is required");
  }
});

const createProject = async (opts = {}) => {
  const token = process.env.SANITY_TOKEN;
  const sanityConfigPath = opts.sanityConfigPath;
  let config, client;

  try {
    config = require(path.resolve(process.env.INIT_CWD, sanityConfigPath));
  } catch (e) {
    console.log(`Failed to get sanity.json config in ${dirname}`);
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

  const displayName = config.project?.name || "New Sanity Project";
  const datasetName = config.api?.dataset || "production";
  const envVars = [];

  try {
    const project = await client.request({
      method: "POST",
      uri: "/projects",
      body: {
        displayName,
      },
    });

    config.api.projectId = project.id;
    envVars.push(`SANITY_PROJECT_ID="${project.id}"`);

    const dataset = await client.request({
      method: "PUT",
      uri: `/projects/${project.id}/datasets/${datasetName}`,
    });

    config.api.dataset = dataset.datasetName;
    envVars.push(`SANITY_DATASET="${dataset.datasetName}"`);
  } catch (e) {
    console.log(`Failed to create new Sanity project ${e}`);
    process.exit(1);
  }

  if (!isCloud) {
    console.log("Updating sanity.json");
    fs.outputJson(configFile, config, {
      spaces: 2,
    });

    if (fs.existsSync(".env")) {
      console.log("Updating .env file");
      fs.appendFileSync(".env", envVars.join("\n"));
    }
  }

  await deployGraphQL();

  console.log("Sanity project successfully created");
};

const deployGraphQL = async (dirname) => {
  console.log("Deploying Sanity GraphQL API");
  try {
    // TODO: use @sanity/cli
    const proc = await execa("npx", ["@sanity/cli", "deploy"], {
      cwd: dirname,
    });
    console.log(proc.stdout);
  } catch (e) {
    console.log(`Failed to deploy Sanity GraphQL API ${e}`);
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
      when: !argv.name,
    },
    {
      name: "dataset",
      message: "Dataset Name",
      default: "production",
      when: !argv.dataset && !process.env.SANITY_DATASET,
      default: process.env.SANITY_DATASET,
    },
  ];
  inquirer
    .prompt(questions)
    .then((res) => {
      createProject(res);
    })
    .catch((err) => console.error(err));
} else {
  createProject(args);
}
