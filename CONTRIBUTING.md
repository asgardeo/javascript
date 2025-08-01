# Contributing to Asgardeo Web UI SDKs

This guide walks you through setting up the development environment and other important information for contributing to Asgardeo Web UI SDKs.

## Table of Contents
- [Prerequisite Software](#prerequisite-software)
- [Development Tools](#development-tools)
  - [NX Console](#nx-console)
  - [React Developer Tools](#react-developer-tools)
  - [ESLint Plugin](#eslint-plugin)
  - [Code Spell Checker](#code-spell-checker)
  - [JSON Sort Order](#json-sort-order)
- [Setting up the Source Code](#setting-up-the-source-code)
- [Setting up the Development Environment](#setting-up-the-development-environment)
- [Contributing to the Documentation](#contributing-to-the-documentation)
- [Commit Message Guidelines](#commit-message-guidelines)
  - [Commit Message Header](#commit-header)
    - [Type](#type)
    - [Scope](#scope)
    - [Summary](#summary)
  - [Commit Message Body](#commit-body)
  - [Commit Message Footer](#commit-footer)
  - [Revert commits](#revert-commits)

## Prerequisite Software

To build and write code, make sure you have the following set of tools on your local environment:

* [Git](https://git-scm.com/downloads) - Open source distributed version control system. For install instructions, refer [this](https://www.atlassian.com/git/tutorials/install-git).
* [Node.js](https://nodejs.org/en/download/) - JavaScript runtime. (`v18 or higher`)
* [pnpm](https://pnpm.io/) - Alternate npm client for faster package installs. (`v9 or higher`)

## Development Tools

### NX Console

Editor plugin which wraps NX commands so you don't have to memorize.

- [Install for VS Code](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console)
- [Install for VS Web Storm](https://plugins.jetbrains.com/plugin/15000-nx-webstorm)

### React Developer Tools

Browser extension to debug React code.

- [Download for Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
- [Download for Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### ESLint Plugin

Static code analysis tool for identifying problematic patterns found in JavaScript/Typescript code.

- [Install for VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Install for VS Web Storm](https://www.jetbrains.com/help/webstorm/eslint.html)

### Code Spell Checker

A basic spell checker that works well with code and documents.

- [Install for VS Code](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

### JSON Sort Order

Sorts JSON objects in alphabetical order.

- [Install for VS Code](https://marketplace.visualstudio.com/items?itemName=msyesyan.json-sorter)

## Setting up the Source Code

1. [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) the repository.
2. Clone your fork to the local machine.

Replace `<github username>` with your own username.

```shell
git clone https://github.com/<github username>/javascript.git
```

3. Set the original repo as the upstream remote.

```shell
git remote add upstream https://github.com/asgardeo/javascript.git
```

## Setting up the Development Environment

1. Install dependencies.

```bash
pnpm install
```

2. Build the project.

```bash
pnpm build
```

## Contributing to the Documentation

We use [Vitepress](https://vitepress.dev/) to generate the documentation site. The documentation site is located in the `docs` directory.
To contribute to the documentation, you can follow the steps below to start the Vitepress server locally.

1. Navigate to the `docs` directory.

```bash
cd docs
```

2. Start the Vitepress server.

```bash
pnpm docs:dev
```

## Commit Message Guidelines

*This specification is inspired by and supersedes the [AngularJS commit message format][commit-message-format].*

We have very precise rules over how our Git commit messages must be formatted.
This format leads to **easier to read commit history**.

Each commit message consists of a **header**, a **body**, and a **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `header` is mandatory and must conform to the [Commit Message Header](#commit-header) format.

The `body` is mandatory for all commits except for those of type "docs".
When the body is present it must be at least 20 characters long and must conform to the [Commit Message Body](#commit-body) format.

The `footer` is optional. The [Commit Message Footer](#commit-footer) format describes what the footer is used for and the structure it must have.


### <a name="commit-header"></a>Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: primitives|scss|react|vue|nuxt
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|chore|test
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.


#### Type

Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* **ci**: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **chore**: Housekeeping tasks that doesn't require to be highlighted in the changelog
* **test**: Adding missing tests or correcting existing tests


#### Scope
The scope should be the name of the npm package affected (as perceived by the person reading the changelog generated from commit messages).

The following is the list of supported scopes:

* `core` - Changes to the `core` / `@asgardeo/js` package.
* `react` - Changes to the `@asgardeo/react` package.
* `vue` - Changes to the `@asgardeo/vue` package.
* `nuxt` - Changes to the `@asgardeo/nuxt` package.
* `workspace` - Changes to the workspace.
* `sample-app` - Changes to the sample app.

There are currently a few exceptions to the "use package name" rule:

* `packaging`: used for changes that change the npm package layout in all of our packages, e.g. public path changes, package.json changes done to all packages, d.ts file/format changes, changes to bundles, etc.

* `changelog`: used for updating the release notes in CHANGELOG.md

* `dev-infra`: used for dev-infra related changes within the directories like /scripts.

* `docs-infra`: used for docs page changes. (`<ROOT>/docs`)

* none/empty string: useful for `test` and `refactor` changes that are done across all packages (e.g. `test: add missing unit tests`) and for docs changes that are not related to a specific package (e.g. `docs: fix typo in example`).


#### Summary

Use the summary field to provide a succinct description of the change:

* Use the imperative, present tense: "change" not "changed" nor "changes".
* Don't capitalize the first letter.
* No dot (.) at the end.


### <a name="commit-body"></a>Commit Message Body

Just as in the summary, use the imperative, present tense: "fix" not "fixed" nor "fixes".

Explain the motivation for the change in the commit message body. This commit message should explain _why_ you are making the change.
You can include a comparison of the previous behavior with the new behavior in order to illustrate the impact of the change.


### <a name="commit-footer"></a>Commit Message Footer

The footer can contain information about breaking changes and deprecations and is also the place to reference GitHub issues, Jira tickets, and other PRs that this commit closes or is related to.
For example:

```
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
<BLANK LINE>
<BLANK LINE>
Fixes #<issue number>
```

or

```
DEPRECATED: <what is deprecated>
<BLANK LINE>
<deprecation description + recommended update path>
<BLANK LINE>
<BLANK LINE>
Closes #<pr number>
```

Breaking Change section should start with the phrase "BREAKING CHANGE: " followed by a summary of the breaking change, a blank line, and a detailed description of the breaking change that also includes migration instructions.

Similarly, a Deprecation section should start with "DEPRECATED: " followed by a short description of what is deprecated, a blank line, and a detailed description of the deprecation that also mentions the recommended update path.


### Revert commits

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.

The content of the commit message body should contain:

- Information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`.
- A clear description of the reason for reverting the commit message.
