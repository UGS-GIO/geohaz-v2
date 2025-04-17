# Semantic Release Setup for GeoHaz Monorepo

This document explains how the semantic release workflow is set up for this monorepo.

## Overview

The repository uses semantic-release to automate version management and package publishing. It's configured to:

1. Create a main release that includes all commits
2. Create separate releases for each application:
   - Hazards app
   - Minerals app
   - CCUS app

## Commit Message Format

For proper release management, your commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature (triggers a minor version bump)
- `fix`: A bug fix (triggers a patch version bump)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance improvements
- `docs`: Documentation only changes
- `style`: Changes that don't affect the code's functionality
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools and libraries
- `ci`: Changes to CI configuration files and scripts

### Scopes

The valid scopes for this project are:

- `hazards`: Changes related to the Hazards application
- `minerals`: Changes related to the Minerals application
- `ccus`: Changes related to the CCUS application
- `common`: Changes that affect multiple applications

### Examples

```
feat(hazards): add earthquake risk visualization
fix(minerals): correct legend display for ore deposits
refactor(ccus): optimize carbon storage calculation
feat(common): add shared map component for all applications
```

## Releases

### Main Release

The main release includes all commits and updates the main version number of the project.

### App-Specific Releases

Each app has its own release configuration:

- Hazards: Tagged as `hazards-v<version>`
- Minerals: Tagged as `minerals-v<version>`
- CCUS: Tagged as `ccus-v<version>`

These releases only include commits relevant to their specific app. The relevance is determined by:
1. The scope in the commit message (e.g., `feat(hazards): ...`)
2. Mentions of the app name in the commit subject if no scope is specified

## How It Works

1. The workflow is triggered on pushes to the `master` branch
2. It first creates a global release
3. Then it creates separate releases for each application
4. Each release creates:
   - A GitHub release with release notes
   - A Git tag
   - Updates to the CHANGELOG.md file

## Troubleshooting

If a release fails:

1. Check the GitHub Actions logs
2. Ensure your commit messages follow the conventional commits format
3. Verify that you've specified the correct scope in your commits