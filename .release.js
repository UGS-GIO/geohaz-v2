module.exports = {
    branches: ["master"],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "angular",
          releaseRules: [
            // Default rules for all commits
            { type: "feat", release: "minor" },
            { type: "fix", release: "patch" },
            { type: "perf", release: "patch" },
            { type: "revert", release: "patch" },
            { type: "docs", release: "patch" },
            { type: "style", release: "patch" },
            { type: "refactor", release: "patch" },
            { type: "test", release: "patch" },
            { type: "build", release: "patch" },
            { type: "ci", release: "patch" },
            { type: "chore", release: "patch" }
          ],
          parserOpts: {
            noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"]
          }
        }
      ],
      [
        "@semantic-release/release-notes-generator",
        {
          preset: "angular",
          parserOpts: {
            noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"]
          },
          writerOpts: {
            commitsSort: ["subject", "scope"],
            groupBy: "route",
            commitGroupsSort: ["title"],
            // Custom transform function to handle route-specific commits
            transform: (commit, context) => {
              const issues = [];
  
              // Extract route from commit message - e.g., "feat(hazards): message" or "feat: message (hazards)"
              const routeMatch = commit.subject.match(/\(([^)]+)\)$/);
              if (routeMatch) {
                commit.route = routeMatch[1].trim();
                // Remove the route from the subject for cleaner display
                commit.subject = commit.subject.replace(/\s*\([^)]+\)$/, "");
              } else if (commit.scope) {
                commit.route = commit.scope;
              } else {
                commit.route = "common";
              }
  
              // Process issues
              if (commit.references) {
                commit.references.forEach(reference => {
                  issues.push({
                    issue: reference.issue,
                    repository: reference.repository || context.repository,
                    owner: reference.owner || context.owner
                  });
                });
              }
  
              return {
                ...commit,
                route: commit.route,
                shortHash: commit.hash.substring(0, 7),
                issues
              };
            },
            // Configure groups for the changelog
            commitGroups: [
              { title: "📱 Hazards", route: "hazards" },
              { title: "🪨 Minerals", route: "minerals" },
              { title: "☁️ CCUS", route: "ccus" },
              { title: "🔄 Common Changes", route: "common" }
            ]
          }
        }
      ],
      "@semantic-release/github",
      [
        "@semantic-release/changelog",
        {
          changelogFile: "CHANGELOG.md"
        }
      ],
      [
        "@semantic-release/git",
        {
          assets: ["CHANGELOG.md", "package.json"],
          message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }
      ]
    ]
  };