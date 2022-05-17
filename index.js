#! /usr/bin/env node

// TODO: conditional logic for when this is running in Gatsby Cloud

const fs = require("fs");
const path = require("path");
const Configstore = require("configstore");
const argv = require("yargs-parser")(process.argv.slice(2));

const studio = require(path.resolve(
  process.env.INIT_CWD,
  argv.sanityConfigPath
));

const config = new Configstore(
  "sanity",
  {},
  {
    globalConfigPath: true,
  }
);
const token = process.env.SANITY_TOKEN || config.get("authToken");
const dataset = process.env.SANITY_DATASET || studio.api?.dataset;
const projectId = process.env.SANITY_PROJECT_ID || studio.api?.projectId;

if (!token) {
  throw new Error("Could not find Sanity token.");
}

if (!dataset) {
  throw new Error("Could not find Sanity Studio dataset.");
}

if (!projectId) {
  throw new Error("Could not find Sanity Studio Project ID.");
}

const content = [
  `# All environment variables will be sourced`,
  `# and made available to gatsby-config.js, gatsby-node.js, etc.`,
  `# Do NOT commit this file to source control`,
  `SANITY_TOKEN='${token}'`,
  `SANITY_PROJECT_ID='${projectId}'`,
  `SANITY_DATASET='${dataset}'`,
].join("\n");

fs.writeFileSync(".env.development", content);
fs.writeFileSync(".env.production", content);

console.log(
  "Sanity environment variables written to `.env.development` and `.env.production`"
);
