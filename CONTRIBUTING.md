# Contributing to Asgardeo JavaScript SDKs

This guide walks you through setting up the development environment and other important information for contributing to Asgardeo JavaScript SDKs.

## Table of Contents

- [Prerequisite Software](#prerequisite-software)
- [Development Tools](#development-tools)
- [Setting up the Source Code](#setting-up-the-source-code)
- [Setting up the Development Environment](#setting-up-the-development-environment)
- [Commit Message Guidelines](#commit-message-guidelines)
  - [Types](#types)
  - [Scope](#scope)
  - [Example Commit Message](#example-commit-message)
  - [Revert commits](#revert-commits)
- [Contributing](#contributing)
  - [Contributing to the Internalization (i18n) Package](#contributing-to-the-internalization-i18n-package)
    - [Adding a New Language](#adding-a-new-language)
      - [Create a new language file](#create-a-new-language-file)
      - [Copy the structure from the existing language file](#copy-the-structure-from-the-existing-language-file)
      - [Update the translations and metadata](#update-the-translations-and-metadata)
      - [Export the new language bundle](#export-the-new-language-bundle)
      - [Add the export to the translations index](#add-the-export-to-the-translations-index)
    - [Test your translation](#test-your-translation)
      - [Option 1: Using `npm` symlinks](#option-1-using-npm-symlinks)
      - [Option 2: Integrate into an existing sample](#option-2-integrate-into-an-existing-sample)
      - [Testing with AsgardeoProvider](#testing-with-asgardeoprovider)
      - [Update documentation](#update-documentation)
  - [Contributing to the Documentation](#contributing-to-the-documentation)

## Prerequisite Software

To build and write code, make sure you have the following set of tools on your local environment:

- [Git](https://git-scm.com/downloads) - Open source distributed version control system. For install instructions, refer [this](https://www.atlassian.com/git/tutorials/install-git).
- [Node.js](https://nodejs.org/en/download/) - JavaScript runtime. (`v18 or higher`)
- [pnpm](https://pnpm.io/) - Alternate npm client for faster package installs. (`v9 or higher`)

## Development Tools

| Extension | Description | VS Code Marketplace |
|-----------|-------------|---------------------|
| NX Console | Editor plugin which wraps NX commands so you don't have to memorize. | [Install](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console) |
| ESLint | Static code analysis tool for identifying problematic patterns found in JavaScript/Typescript code. | [Install](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) |
| Code Spell Checker | A basic spell checker that works well with code and documents. | [Install](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) |
| JSON Sort Order | Sorts JSON objects in alphabetical order. | [Install](https://marketplace.visualstudio.com/items?itemName=msyesyan.json-sorter) |

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

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) as the commit message convention.

Please refer to the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) documentation for more information.

> [!IMPORTANT]
>
> 1. Use the imperative, present tense: "change" not "changed" nor "changes".
> 2. Don't capitalize the first letter.
> 3. No dot (.) at the end.

### Types

Must be one of the following:

- **chore**: Housekeeping tasks that doesn't require to be highlighted in the changelog
- **feat**: A new feature
- **ci**: Changes to our CI configuration files and scripts (examples: GitHub Actions)
- **fix**: A bug fix
- **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- **docs**: Documentation only changes
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests

### Scope

The scope should be the name of the npm package affected (as perceived by the person reading the changelog generated from commit messages).

The following is the list of supported scopes:

- `javascript` - Changes to the `@asgardeo/javascript` package.
- `browser` - Changes to the `@asgardeo/browser` package.
- `node` - Changes to the `@asgardeo/node` package.
- `express` - Changes to the `@asgardeo/express` package.
- `i18n` - Changes to the `@asgardeo/i18n` package.
- `react` - Changes to the `@asgardeo/react` package.
- `react-router` - Changes to the `@asgardeo/react-router` package.
- `nextjs` - Changes to the `@asgardeo/nextjs` package.
- `vue` - Changes to the `@asgardeo/vue` package.
- `nuxt` - Changes to the `@asgardeo/nuxt` package.

> [!NOTE]
> If the change affects multiple packages, just use the type without a scope, e.g., `fix: ...`.

### Example Commit Message

Each commit message consists of a **header**, a **body**, and a **footer**.

```
<type>(<scope>): <short summary>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

```
# Update issue templates to include '@asgardeo/i18n' and improve version description
chore: update issue templates to include '@asgardeo/i18n' and improve version description

# Add a new feature to the react package.
feat(react): add `SignInWithPopup` method to facilitate popup-based authentication flows.

# Update GitHub Actions workflows to include linting and testing steps.
ci: enhance GitHub Actions workflows with linting and testing steps

```

### Revert commits

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit.

The content of the commit message body should contain:

- Information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`.
- A clear description of the reason for reverting the commit message.

## Contributing

### Contributing to the Internalization (i18n) Package

The `@asgardeo/i18n` package provides internationalization support for Asgardeo JavaScript SDKs. To add support for a new language, follow these steps:

#### Adding a New Language

##### Create a new language file

Navigate to [`packages/i18n/src/translations/`](../packages/i18n/src/translations/) and create a new TypeScript file for your language.  
Use the correct [IETF BCP 47 language tag](https://datatracker.ietf.org/doc/html/bcp47) (which combines [ISO 639-1 language codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and [ISO 3166-1 country codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)).  
For example:

- `fr-FR.ts` → French (France)  
- `es-ES.ts` → Spanish (Spain)  
- `en-US.ts` → English (United States)  

##### Copy the structure from the existing language file

Use the English (`en-US.ts`) file as a template to ensure you have all the required translation keys:

```bash
cp packages/i18n/src/translations/en-US.ts packages/i18n/src/translations/<locale-code>.ts
```

##### Update the translations and metadata

> [!IMPORTANT]
> ⚠️ Do not change any **formatting** or **keys** in the `translations` object. Only update the text values.

Open your new language file and:

- Translate all the text values in the `translations` object while keeping the keys unchanged
- Update the `metadata` object with the correct locale information

```typescript
const translations: I18nTranslations = {
  'elements.buttons.signIn': 'Se connecter',
  'elements.buttons.signOut': 'Se déconnecter',
  // ... translate all other keys
};

const metadata: I18nMetadata = {
  localeCode: 'fr-FR',
  countryCode: 'FR',
  languageCode: 'fr',
  displayName: 'Français (France)',
  direction: 'ltr', // or 'rtl' for right-to-left languages
};
```

##### Export the new language bundle

At the end of your new language file, export the bundle:

```typescript
const fr_FR: I18nBundle = {
  metadata,
  translations,
};

export default fr_FR;
```

##### Add the export to the translations index

Add your new language to the translations export file at `packages/i18n/src/translations/index.ts`:

```typescript
export {default as fr_FR} from './fr-FR';
```

#### Test your translation

Build the package and test the new language in a sample application to ensure all translations are working correctly:

```bash
pnpm build --filter @asgardeo/i18n
```

To test your new language translation, you have two options:

##### Option 1: Using `npm` symlinks

Create a symlink to test your local changes without publishing:

```bash
# Navigate to the i18n package
cd packages/i18n

# Create a global symlink
npm link

# Navigate to your test application
cd /path/to/your/test-app

# Link the local i18n package
npm link @asgardeo/i18n
```

For more information about npm symlinks, see the [npm link documentation](https://docs.npmjs.com/cli/v10/commands/npm-link).

##### Option 2: Integrate into an existing sample

Use one of the existing sample applications in the [`samples/`](../samples/) directory:

```bash
# Navigate to a sample app (e.g., teamspace-react)
cd samples/teamspace-react

# Install dependencies
pnpm install

# The sample will automatically use your local i18n package changes
```

##### Testing with AsgardeoProvider

Once you have your testing environment set up (using either option above), configure the AsgardeoProvider to use your new language:

- **Import your new language bundle**

```tsx
import {fr_FR} from '@asgardeo/i18n';
```

- **Configure the AsgardeoProvider with the new language**

```tsx
<AsgardeoProvider
  baseUrl={import.meta.env.VITE_ASGARDEO_BASE_URL}
  clientId={import.meta.env.VITE_ASGARDEO_CLIENT_ID}
  // ... other configuration
  preferences={{
    i18n: {
      language: 'fr-FR',
      bundles: {
        'fr-FR': fr_FR,
      },
    },
  }}
>
  <App />
</AsgardeoProvider>
```

For more details on the i18n preferences interface, see the [`I18nPreferences`](packages/javascript/src/models/config.ts#L232).

- **Verify the translations**

- Navigate through your application's authentication flows
- Check that all UI text appears in your new language
- Verify that buttons, labels, error messages, and other UI elements display the correct translations
- Test different authentication scenarios (sign-in, sign-up, errors) to ensure comprehensive coverage

- **Test text direction (if applicable)**

For right-to-left languages, ensure that the UI layout adjusts correctly based on the `direction` property in your metadata.

##### Update documentation

Update any relevant documentation to mention the newly supported language.

### Contributing to the Documentation

The documentation for Asgardeo JavaScript SDKs is maintained in the Asgardeo / WSO2 Identity Server Official Docs site.

- [Asgardeo Docs](https://wso2.com/asgardeo/docs)
- [WSO2 Identity Server Docs](https://is.docs.wso2.com/en/latest/)

To contribute to the documentation, please send a pull request to the [Asgardeo Docs repository](https://github.com/wso2/docs-is).
