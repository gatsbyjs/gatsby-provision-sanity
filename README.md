# Gatsby Provision Sanity

This package is to be used for provisioning Sanity data models and content associated with a Gatsby site.

When included as a dependency, it can be used in two contexts — within Gatsby Cloud and locally. Convention dictates that it be used in conjunction with the npm script named `gatsby-provision`. It also requires the path to the Sanity studio directory and the path to the compressed content file. For example:

`"gatsby-provision": "gatsby-provision-sanity --sanity-config-path='./studio' --sanity-content-path='./scripts/content.tar.gz'"`

# Usage

There exists some prerequisites for this package to work, namely:

- You will need to have created a Sanity account and project (likely with sanity-cli and the `sanity init` command)
- You will need to have created two tokens for the Sanity project — one with an Editor role and one with a Deploy role
- The repository you include this package as a dependency for contains a Sanity Studio instance with a tarball of the content associated with the project that was created with the `sanity dataset export` command
- The `sanity.json` file in Sanity Studio directory contains a value for `project.studioHostname`

## Cloud usage

**Note:** Instructions subject to change

In order to use this script in Gatsby Cloud, all environment variables must be provided in the Environment Variables form prior to electing to Provision the Sanity Studio in the Deploy Now flow.

## Local usage

When running this locally, you will be prompted for environment variables if they are not found on the current process. Additionally, the script will update an `.env` file with the environment variables provided if one exists in the project already.

## Limitations

As of 5/26/22, this script depends upon a Sanity project having already been created with `sanity init` as well as a pair of tokens with Editor and Deploy permissions, respectively.
