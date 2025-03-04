export default { 
    extends: ['@commitlint/config-conventional'],
    rules: {
      'subject-case': [0], // Allow any case in subject
      'scope-enum': [2, 'always', ['hazards', 'minerals', 'ccus', 'common']] // Define allowed scopes
    }
  };