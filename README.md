# Gatsby Provision Sanity

This package is to be used for provisioning Sanity data models and content associated with a Gatsby site.

When included as a dependency, it can be used in two contexts — within Gatsby Cloud and locally. Convention dictates that it be used in conjunction with the npm script named `gatsby-provision`. It also requires the path to the Sanity studio directory and the path to the compressed content file. For example:

`"gatsby-provision": "gatsby-provision-sanity --sanity-config-path='./studio' --sanity-content-path='./scripts/content.tar.gz'"`

## Cloud usage

**Note:** Instructions subject to change

In order to use this script in Gatsby Cloud, all environment variables must be provided in the Environment Variables form prior to electing to Provision the Sanity Studio in the Deploy Now flow.

## Local usage

When running this locally, you will be prompted for environment variables if they are not found on the current process. Additionally, the script will update an `.env` file with the environment variables provided if one exists in the project already.

## Limitations

As of 5/26/22, this script depends upon a Sanity project having already been created with `sanity init` as well as a pair of tokens with Editor and Deploy permissions, respectively.
