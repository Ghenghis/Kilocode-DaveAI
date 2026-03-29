# Typecheck Root Cause Method

## Prioritize by dependency impact
1. broken root type definitions
2. message contract mismatches
3. provider registry shape mismatches
4. import/export errors
5. local file inference errors

## Anti-patterns
- fixing 50 symptom files before fixing one broken exported type
- changing `any` to silence errors
- muting errors with ignore comments
