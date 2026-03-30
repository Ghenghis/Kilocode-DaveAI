# Branch Protection Rules Configuration

## Main Branch Protection

### Required Status Checks
- **Code Quality**: All linting, formatting, and type checking must pass
- **Security**: Security audit and security tests must pass
- **Test Coverage**: Minimum 80% test coverage required
- **Performance**: Performance tests and bundle size checks must pass
- **Documentation**: Documentation checks must pass
- **Build Verification**: All packages must build successfully

### Required Reviews
- **Minimum 1 reviewer** required
- **Require review from Code Owners**
- **Dismiss stale PR approvals when new commits are pushed**
- **Require review from PR collaborators**

### Enforcements
- **Do not allow bypassing the above settings**
- **Require linear history**
- **Do not allow force pushes**
- **Do not allow deletions**

## Develop Branch Protection

### Required Status Checks
- **Code Quality**: Linting and type checking
- **Security**: Security audit
- **Unit Tests**: All unit tests must pass
- **Build Verification**: Basic build verification

### Required Reviews
- **Minimum 1 reviewer** required
- **Require review from Code Owners**

### Enforcements
- **Do not allow bypassing the above settings**
- **Do not allow force pushes**
- **Do not allow deletions**

## Release Branch Protection

### Required Status Checks
- **Code Quality**: All quality checks
- **Security**: All security checks
- **Test Coverage**: Full test suite
- **Performance**: All performance tests
- **Documentation**: Complete documentation
- **Build Verification**: Full build verification

### Required Reviews
- **Minimum 2 reviewers** required
- **Require review from Code Owners**
- **Require review from maintainers**

### Enforcements
- **Do not allow bypassing the above settings**
- **Require linear history**
- **Do not allow force pushes**
- **Do not allow deletions**

## Hotfix Branch Protection

### Required Status Checks
- **Code Quality**: Basic linting and type checking
- **Security**: Security audit
- **Unit Tests**: Critical unit tests
- **Build Verification**: Build verification

### Required Reviews
- **Minimum 2 reviewers** required
- **Require review from maintainers**

### Enforcements
- **Do not allow bypassing the above settings**
- **Require linear history**
- **Do not allow force pushes**
- **Do not allow deletions**

## Implementation

### GitHub Settings
These rules can be configured in GitHub repository settings:

1. Go to repository Settings > Branches
2. Add branch protection rules for each branch
3. Configure the required status checks and reviews

### GitHub Actions Integration
The quality gates workflow will enforce these rules automatically:

```yaml
# Required status checks for main branch
required_checks:
  - code-quality
  - security
  - test-coverage
  - performance
  - documentation
  - build-verification
```

### CODEOWNERS
Create a `.github/CODEOWNERS` file to define code owners:

```
# Core maintainers
* @maintainer1 @maintainer2

# Package-specific owners
packages/opencode/ @opencode-team
packages/kilo-vscode/ @vscode-team
packages/kilo-ui/ @ui-team

# Test files
tests/ @qa-team

# Documentation
docs/ @docs-team
*.md @docs-team
```

## Automated Enforcement

### Pre-commit Hooks
Set up pre-commit hooks to catch issues before commit:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "bun run lint && bun run typecheck && bun run format",
      "pre-push": "bun run test:unit"
    }
  }
}
```

### PR Templates
Create comprehensive PR templates to guide contributors:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Coverage maintained

## Security
- [ ] Security review completed
- [ ] No new vulnerabilities

## Performance
- [ ] Performance impact assessed
- [ ] No performance regression

## Documentation
- [ ] Documentation updated
- [ ] API docs updated
```

## Monitoring and Alerts

### Quality Metrics Dashboard
Monitor key quality metrics:
- Test coverage trends
- Code quality scores
- Security vulnerability counts
- Performance benchmarks
- Build success rates

### Alerting
Set up alerts for:
- Failed quality gates
- Decreasing test coverage
- New security vulnerabilities
- Performance regressions
- Build failures

## Continuous Improvement

### Regular Reviews
- Monthly review of quality gate effectiveness
- Quarterly update of quality thresholds
- Annual comprehensive quality assessment

### Feedback Loop
- Collect feedback from developers
- Monitor false positives/negatives
- Adjust quality gates based on feedback
- Continuously improve the process
