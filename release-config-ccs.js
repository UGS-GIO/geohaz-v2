export default {
  branches: ['master'],
  tagFormat: 'ccs-v${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'feat', scope: 'ccs', release: 'minor' },
          { type: 'fix', scope: 'ccs', release: 'patch' },
          { type: 'refactor', scope: 'ccs', release: 'patch' },
          { type: 'perf', scope: 'ccs', release: 'patch' },
          { type: 'docs', scope: 'ccs', release: 'patch' },
          { type: 'chore', scope: 'ccs', release: false },
          { type: 'style', scope: 'ccs', release: 'patch' },
          { type: 'test', scope: 'ccs', release: false },
          { type: 'ci', scope: 'ccs', release: false },
          // If no scope is specified but mentions ccs in subject
          { subject: '*ccs*', release: 'patch' }
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
          // Filter commits to only include ccs-related ones
          commitGroupsSort: 'title',
          commitPartial: '* **{{type}}**{{#if scope}}(`{{scope}}`){{/if}}: {{subject}}',
          commitsSort: ['scope', 'subject'],
          transform: (commit, context) => {
            if (
              commit.scope === 'ccs' ||
              (commit.subject && commit.subject.toLowerCase().includes('ccs'))
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
        successComment: '🎉 CCS app is included in version ${nextRelease.version}',
        failComment: '❌ Semantic release for CCS app failed',
        releasedLabels: ['ccs-released'],
        // Only create a GitHub release for commits related to ccs
        addReleases: 'bottom'
      }
    ]
  ]
};