// release-config-minerals.js
export default {
    branches: ['master'],
    tagFormat: 'minerals-v${version}',
    plugins: [
      [
        '@semantic-release/commit-analyzer',
        {
          preset: 'angular',
          releaseRules: [
            { type: 'feat', scope: 'minerals', release: 'minor' },
            { type: 'fix', scope: 'minerals', release: 'patch' },
            { type: 'refactor', scope: 'minerals', release: 'patch' },
            { type: 'perf', scope: 'minerals', release: 'patch' },
            { type: 'docs', scope: 'minerals', release: 'patch' },
            { type: 'chore', scope: 'minerals', release: false },
            { type: 'style', scope: 'minerals', release: 'patch' },
            { type: 'test', scope: 'minerals', release: false },
            { type: 'ci', scope: 'minerals', release: false },
            // If no scope is specified but mentions minerals in subject
            { subject: '*mineral*', release: 'patch' }
          ],
          parserOpts: {
            noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
          }
        }
      ],
      [
        '@semantic-release/release-notes-generator',
        {
          preset: 'conventionalcommits',
          parserOpts: {
            noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING']
          },
          writerOpts: {
            // Filter commits to only include minerals-related ones
            commitGroupsSort: 'title',
            commitsSort: ['scope', 'subject'],
            transform: (commit, context) => {
              if (
                commit.scope === 'minerals' || 
                (commit.subject && commit.subject.toLowerCase().includes('mineral'))
              ) {
                return commit;
              }
              return null;
            }
          }
        }
      ],
      [
        '@semantic-release/github',
        {
          successComment: '🎉 Minerals app is included in version ${nextRelease.version}',
          failComment: '❌ Semantic release for Minerals app failed',
          releasedLabels: ['minerals-released'],
          // Only create a GitHub release for commits related to minerals
          addReleases: 'bottom'
        }
      ]
    ]
  };