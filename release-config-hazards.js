// release-config-hazards.js
export default {
    branches: ['master'],
    tagFormat: 'hazards-v${version}',
    plugins: [
      [
        '@semantic-release/commit-analyzer',
        {
          preset: 'angular',
          releaseRules: [
            { type: 'feat', scope: 'hazards', release: 'minor' },
            { type: 'fix', scope: 'hazards', release: 'patch' },
            { type: 'refactor', scope: 'hazards', release: 'patch' },
            { type: 'perf', scope: 'hazards', release: 'patch' },
            { type: 'docs', scope: 'hazards', release: 'patch' },
            { type: 'chore', scope: 'hazards', release: false },
            { type: 'style', scope: 'hazards', release: 'patch' },
            { type: 'test', scope: 'hazards', release: false },
            { type: 'ci', scope: 'hazards', release: false },
            // If no scope is specified but mentions hazards in subject
            { subject: '*hazard*', release: 'patch' }
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
            // Filter commits to only include hazards-related ones
            commitGroupsSort: 'title',
            commitsSort: ['scope', 'subject'],
            transform: (commit, context) => {
              if (
                commit.scope === 'hazards' || 
                (commit.subject && commit.subject.toLowerCase().includes('hazard'))
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
          successComment: '🎉 Hazards app is included in version ${nextRelease.version}',
          failComment: '❌ Semantic release for Hazards app failed',
          releasedLabels: ['hazards-released'],
          // Only create a GitHub release for commits related to hazards
          addReleases: 'bottom'
        }
      ]
    ]
  };