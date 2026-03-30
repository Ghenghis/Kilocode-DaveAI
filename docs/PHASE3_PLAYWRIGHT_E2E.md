# Phase 3: Playwright Smoke + Core E2E

## Objectives
Build end-to-end confidence through comprehensive browser automation testing.

## Current State Assessment

### Existing E2E Infrastructure
- **Playwright Setup**: Configured in multiple packages
- **Test Files**: Basic structure exists
- **Browser Support**: Chromium primary, needs expansion
- **Test Coverage**: Limited basic flows

### Critical User Journeys to Test

#### High Priority Journeys
- Extension startup and activation
- Basic chat interaction flow
- Settings configuration changes
- File mention and context usage
- Error handling and recovery

#### Medium Priority Journeys  
- Agent mode switching
- Multi-session management
- Worktree operations
- Provider configuration
- Import/export workflows

#### Low Priority Journeys
- Advanced agent features
- Complex multi-file operations
- Performance under load
- Accessibility flows

## Implementation Plan

### 3.1 Basic Browser Smoke Tests
- Extension activation smoke
- Web app startup smoke
- Critical page rendering
- Basic interaction validation

### 3.2 Core User Journey Tests
- Complete chat workflow
- Settings management flow
- File operations workflow
- Error recovery workflow

### 3.3 Cross-browser Compatibility
- Firefox support validation
- Safari/WebKit support validation  
- Edge/Chromium validation
- Mobile responsive testing

### 3.4 Error Scenario Testing
- Network failure simulation
- Authentication failure handling
- Resource exhaustion scenarios
- Browser crash recovery

## Success Criteria
- All critical user journeys automated
- Cross-browser compatibility verified
- Error scenarios properly handled
- Tests run reliably in CI environment
- Test execution time < 10 minutes for smoke suite
