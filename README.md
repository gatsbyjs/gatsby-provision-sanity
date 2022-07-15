# Gatsby Provision Sanity

This package is to be used for provisioning Sanity content models and content associated with a Gatsby site. This is a way to include example content that is associated with the site in the repository and allow for others to easily make their own copies. A typical use case would be if you're building a Gatsby Starter, or a boilerplate or template site for your own re-use.

When included as a dependency to your Gatsby site, and configured correctly, it can be used in two contexts — within Gatsby Cloud and locally.

# Usage

First, export your Sanity project's dataset. You can find instructions on how to do this in [Sanity's Migration docs](https://www.sanity.io/docs/migrating-data).

Then, install this package as a dependency in the repository you want to enable easy provisioning of data for:

```shell
  npm install --save-dev gatsby-provision-sanity
```

or for the yarn users:

```shell
  yarn add --dev gatsby-provision-sanity
```

Next, convention dictates that this package be used in conjunction with an npm script named `gatsby-provision`. It also **requires** the path to Sanity studio as well as the path to the exported Sanity content as arguments to function. For example:

```json
// package.json
"scripts": {
  "start": "gatsby develop",
  "test": "jest",
  ...
  "gatsby-provision": "gatsby-provision-sanity --sanity-studio-path='./studio' --sanity-content-path='./scripts/content.tar.gz'"
}
```

Optionally, you may include the Sanity Editor Token, Deploy Token, Project ID, Project Name, and Dataset name as arguments like so:

`gatsby-provision-sanity --sanity-studio-path='./studio' --sanity-content-path='./scripts/content.tar.gz' --token=$SANITY_EDITOR_TOKEN --deploy-token=$SANITY_DEPLOY_TOKEN --project-id=$SANITY_PROJECT_ID --name=$SANITY_PROJECT_NAME --dataset=$SANITY_PROJECT_DATASET`

**Note:**
The `sanity.json` file in the Sanity Studio directory must contain a value for `project.studioHostname`

## Cloud usage

The easiest way for a `gatsby-provision` script to work in Gatsby Cloud is for you to use Deploy Now. If you are using this package in a template repository you intend other's to re-use, consider adding a Deploy Now button to the README like so:

[![Deploy to Gatsby](https://www.gatsbyjs.com/deploynow.png "Deploy to Gatsby")](https://www.gatsbyjs.com/dashboard/deploynow?url={YOUR_GITHUB_REPO_URL})

When adding a site with a `gatsby-provision` script in the Deploy Now flow, Gatsby Cloud will detect the script when you [Quick Connect](https://support.gatsbyjs.com/hc/en-us/articles/360052324694-Connecting-to-Sanity-via-Quick-Connect) to the suggested Sanity integration and populate the necessary environment variables for the script to run successfully.

If for whatever reason you choose not to Quick Connect, for the purposes of `gatsby-provision-sanity`, these environment variables are required for the provision script to succeed:

- `SANITY_EDITOR_TOKEN`
- `SANITY_DEPLOY_TOKEN`
- `SANITY_PROJECT_ID`
- `SANITY_PROJECT_DATASET`

## Local usage

When running the `gatsby-provision` locally, you will be prompted for environment variables if they are not found on the current process. Additionally, after provisioning your Sanity project dataset, the script will generate a `.env.development` and an `.env.production` file, populated with the environment variables values you provided.
