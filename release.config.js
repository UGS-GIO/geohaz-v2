// release.config.js
export default {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: '✨ Features' },
            { type: 'fix', section: '🐛 Bug Fixes' },
            { type: 'refactor', section: '♻️ Refactors' },
            { type: 'perf', section: '⚡️ Performance' },
            { type: 'docs', section: '📚 Documentation' },
            { type: 'chore', section: '🔧 Chores' },
            { type: 'style', section: '💅 Styling' },
            { type: 'test', section: '🧪 Tests' },
            { type: 'ci', section: '👷 CI/CD' }
          ]
        },
        writerOpts: {
          groupBy: 'scope',
          commitGroupsSort: 'title',
          commitsSort: ['scope', 'subject'],
          commitPartial: '* **{{type}}**{{#if scope}}(`{{scope}}`){{/if}}: {{subject}}'
        }
      }
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    [
      '@semantic-release/github',
      {
        successComment: '🎉 This PR is included in version ${nextRelease.version}',
        failComment: '❌ Semantic release failed for this PR'
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
};