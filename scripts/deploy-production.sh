#!/bin/bash

# Kilo Code v7.1.9 - Production Deployment Script
# This script helps deploy the release to GitHub and create the release

echo "🚀 Kilo Code v7.1.9 - Production Deployment"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the Kilo Code repository root"
    echo "   Please run this script from the repository root directory"
    exit 1
fi

# Check git status
echo "🔍 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Working directory is not clean:"
    git status --porcelain
    echo "   Please commit or stash changes before deploying"
    exit 1
fi
echo "✅ Working directory is clean"

# Check if remote is configured
echo "🔍 Checking git remote..."
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  No remote 'origin' configured"
    echo "   Please set up your GitHub remote:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/kilocode.git"
    exit 1
fi
echo "✅ Git remote configured"

# Validate release
echo "🔍 Validating release..."
if ! node scripts/validate-release.js; then
    echo "❌ Release validation failed"
    exit 1
fi
echo "✅ Release validation passed"

# Push to GitHub
echo "📤 Pushing to GitHub..."
if ! git push -u origin master; then
    echo "❌ Failed to push to GitHub"
    echo "   Please check your permissions and try again"
    echo "   You may need to: git push -u origin master --force-with-lease"
    exit 1
fi
echo "✅ Pushed to GitHub successfully"

# Create and push tag
echo "🏷️  Creating release tag..."
if ! git tag -a v7.1.9 -m "Release v7.1.9 - Enterprise AI Development Platform"; then
    echo "❌ Failed to create tag"
    exit 1
fi

if ! git push origin v7.1.9; then
    echo "❌ Failed to push tag"
    exit 1
fi
echo "✅ Tag created and pushed successfully"

# Check if GitHub CLI is available
echo "🔍 Checking for GitHub CLI..."
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI authenticated"
        
        # Create GitHub release
        echo "📝 Creating GitHub release..."
        if gh release create v7.1.9 \
            --title "Release 7.1.9" \
            --notes-file "release/GITHUB_RELEASE.md" \
            --latest \
            --discussion-category "Announcements" \
            release/CHECKSUMS.sha256 \
            release/release-manifest.json \
            release/RELEASE_INFO.md; then
            echo "✅ GitHub release created successfully"
        else
            echo "⚠️  Failed to create GitHub release automatically"
            echo "   Please create it manually at: https://github.com/Kilo-Org/kilocode/releases/new"
        fi
    else
        echo "⚠️  GitHub CLI not authenticated"
        echo "   Run: gh auth login"
        echo "   Then create release manually at: https://github.com/Kilo-Org/kilocode/releases/new"
    fi
else
    echo "⚠️  GitHub CLI not found"
    echo "   Install it from: https://cli.github.com/"
    echo "   Then create release manually at: https://github.com/Kilo-Org/kilocode/releases/new"
fi

echo ""
echo "🎉 Deployment Summary:"
echo "===================="
echo "✅ Repository pushed to GitHub"
echo "✅ Release tag created (v7.1.9)"
echo "✅ Release validation passed"
echo "📦 Release artifacts ready:"
echo "   - release/CHECKSUMS.sha256"
echo "   - release/release-manifest.json"
echo "   - release/RELEASE_INFO.md"
echo "   - release/GITHUB_RELEASE.md"
echo ""
echo "🔗 Next Steps:"
echo "1. If GitHub release wasn't created automatically, create it manually:"
echo "   https://github.com/Kilo-Org/kilocode/releases/new"
echo "2. Use tag: v7.1.9"
echo "3. Copy content from: release/GITHUB_RELEASE.md"
echo "4. Attach artifacts from release/ directory"
echo ""
echo "📊 After Release:"
echo "1. Monitor GitHub release for issues"
echo "2. Check NPM downloads (if published)"
echo "3. Monitor VS Code extension installs"
echo "4. Watch for user feedback and issues"
echo ""
echo "🎉 Kilo Code v7.1.9 is now DEPLOYED!"
echo ""
echo "📞 Support Links:"
echo "- GitHub Issues: https://github.com/Kilo-Org/kilocode/issues"
echo "- Discord: https://kilo.ai/discord"
echo "- Documentation: https://docs.kilo.ai"
