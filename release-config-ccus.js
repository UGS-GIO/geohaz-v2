// release-config-ccus.js
export default {
    branches: ['master'],
    tagFormat: 'ccus-v${version}',
    plugins: [
      [
        '@semantic-release/commit-analyzer',
        {
          preset: 'angular',
          releaseRules: [
            { type: 'feat', scope: 'ccus', release: 'minor' },
            { type: 'fix', scope: 'ccus', release: 'patch' },
            { type: 'refactor', scope: 'ccus', release: 'patch' },
            { type: 'perf', scope: 'ccus', release: 'patch' },
            { type: 'docs', scope: 'ccus', release: 'patch' },
            { type: 'chore', scope: 'ccus', release: false },
            { type: 'style', scope: 'ccus', release: 'patch' },
            { type: 'test', scope: 'ccus', release: false },
            { type: 'ci', scope: 'ccus', release: false },
            // If no scope is specified but mentions ccus in subject
            { subject: '*ccus*', release: 'patch' }
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
            // Filter commits to only include ccus-related ones
            commitGroupsSort: 'title',
            commitsSort: ['scope', 'subject'],
            transform: (commit, context) => {
              if (
                commit.scope === 'ccus' || 
                (commit.subject && commit.subject.toLowerCase().includes('ccus'))
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
          successComment: '🎉 CCUS app is included in version ${nextRelease.version}',
          failComment: '❌ Semantic release for CCUS app failed',
          releasedLabels: ['ccus-released'],
          // Only create a GitHub release for commits related to ccus
          addReleases: 'bottom'
        }
      ]
    ]
  };