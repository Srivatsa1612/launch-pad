# GitHub & VS Code Integration Guide

## Part 1: Setting Up GitHub Repository

### Step 1: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository settings:
   - **Name**: `flowcustodian-wizard`
   - **Description**: `Concierge-Powered Workflow Co-Pilot onboarding wizard with Microsoft Fabric integration`
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### Step 2: Push Your Code to GitHub

From your terminal in the project root:

```bash
cd /path/to/flowcustodian-wizard

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: flowCUSTODIAN wizard with Fabric integration"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/flowcustodian-wizard.git

# Push to GitHub
git push -u origin main
```

If you're using SSH instead of HTTPS:
```bash
git remote add origin git@github.com:YOUR_USERNAME/flowcustodian-wizard.git
```

### Step 3: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. The README.md should display on the repository homepage

## Part 2: Opening in VS Code

### Method 1: From Command Line

```bash
# Navigate to project directory
cd /path/to/flowcustodian-wizard

# Open in VS Code
code .

# Or open the workspace file for better organization
code flowcustodian-wizard.code-workspace
```

### Method 2: From VS Code

1. Open VS Code
2. File → Open Folder → Navigate to `flowcustodian-wizard`
3. Or: File → Open Workspace → Select `flowcustodian-wizard.code-workspace`

### Method 3: Clone from GitHub (Fresh Start)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/flowcustodian-wizard.git
cd flowcustodian-wizard

# Open in VS Code
code .
```

## Part 3: Working with GitHub in VS Code

### Initial Setup

1. **Install VS Code Extensions** (if not already installed):
   - GitLens
   - GitHub Pull Requests and Issues
   - Git Graph

2. **Sign in to GitHub in VS Code**:
   - Click the Account icon (bottom left)
   - Select "Sign in to Sync Settings"
   - Choose "Sign in with GitHub"

### Common Git Operations in VS Code

#### Committing Changes

1. Make changes to files
2. Click the Source Control icon in the left sidebar (or Ctrl+Shift+G)
3. Review changed files
4. Click "+" next to files to stage them (or click "+" at the top to stage all)
5. Enter a commit message in the text box
6. Click the checkmark (✓) to commit

#### Pushing to GitHub

1. After committing, click the "..." menu in Source Control
2. Select "Push" to push your commits to GitHub

Or use the sync button (↻) at the bottom of VS Code.

#### Creating Branches

```bash
# From terminal in VS Code
git checkout -b feature/new-feature-name

# Or use VS Code UI
# Click branch name in bottom left → Create new branch
```

#### Pull Requests

1. Push your branch to GitHub
2. Go to GitHub repository
3. Click "Compare & pull request" button
4. Add description and click "Create pull request"

## Part 4: Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes and test

# 4. Stage and commit
git add .
git commit -m "Description of changes"

# 5. Push to GitHub
git push origin feature/your-feature

# 6. Create Pull Request on GitHub
# 7. After approval, merge and delete branch
```

### VS Code Integrated Terminal

Open terminal in VS Code (Ctrl+` or View → Terminal):

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (open new terminal with +)
cd frontend
npm start
```

## Part 5: Working with GitHub Copilot / Claude Agent

### Using Claude Agent in VS Code

If you have access to Claude Code or similar AI agents:

1. **Install the Extension**:
   - Search for "Claude" or "Anthropic" in VS Code Extensions
   - Install and authenticate

2. **Common Tasks**:
   ```
   # Ask Claude to help with code
   "Add validation to the contact form in KeyContactsPage.js"
   
   # Generate new features
   "Create a new wizard step for payment information"
   
   # Debug issues
   "Why is my API call failing in the serviceOrderAPI?"
   
   # Refactor code
   "Refactor the wizardService to use async/await consistently"
   ```

3. **Best Practices**:
   - Be specific about what you want
   - Reference specific files when possible
   - Ask for explanations of complex code
   - Request tests for new features

## Part 6: Project Structure for Collaboration

### Branch Strategy

```
main                    # Production-ready code
├── develop            # Integration branch
    ├── feature/contacts-validation
    ├── feature/new-wizard-step
    └── bugfix/api-error-handling
```

### Recommended Git Flow

1. **Feature Development**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   # Make changes
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   # Create PR to develop
   ```

2. **Bug Fixes**:
   ```bash
   git checkout develop
   git checkout -b bugfix/issue-description
   # Fix bug
   git commit -m "Fix: description"
   git push origin bugfix/issue-description
   # Create PR to develop
   ```

3. **Releases**:
   ```bash
   # After testing in develop
   git checkout main
   git merge develop
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin main --tags
   ```

## Part 7: GitHub Actions CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:

1. Runs tests on every push
2. Builds the frontend
3. Lints the code

To view:
1. Go to your GitHub repository
2. Click the "Actions" tab
3. See build status and logs

## Part 8: Collaboration Tips

### Code Reviews

When creating a Pull Request:
1. Write a clear description of changes
2. Reference any related issues
3. Include screenshots for UI changes
4. Add reviewers
5. Respond to feedback constructively

### Documentation

Keep these files updated:
- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- Code comments - For complex logic
- Commit messages - Clear and descriptive

### Issue Tracking

Use GitHub Issues for:
- Bug reports
- Feature requests
- Enhancement ideas
- Questions

Template for bug reports:
```markdown
**Description**: Brief description of the issue

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Environment**:
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Node version: 18.x

**Screenshots**: If applicable
```

## Part 9: Useful VS Code Shortcuts

### General
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+P` - Command palette
- `Ctrl+B` - Toggle sidebar
- `Ctrl+`` - Toggle terminal

### Editing
- `Alt+Up/Down` - Move line up/down
- `Ctrl+D` - Select next occurrence
- `Ctrl+/` - Toggle line comment
- `Alt+Shift+Down` - Copy line down

### Git
- `Ctrl+Shift+G` - Source control
- `Ctrl+Enter` - Commit (in source control)

## Part 10: Troubleshooting

### Git Issues

**Problem**: `fatal: not a git repository`
```bash
# Solution: Initialize git
git init
```

**Problem**: `rejected - non-fast-forward`
```bash
# Solution: Pull first
git pull origin main --rebase
# Then push
git push origin main
```

**Problem**: Merge conflicts
```bash
# Solution: Resolve conflicts in VS Code
# 1. Open conflicted files
# 2. VS Code shows conflict markers
# 3. Click "Accept Current" or "Accept Incoming" or edit manually
# 4. Stage resolved files
git add .
git commit -m "Resolve merge conflicts"
```

### VS Code Issues

**Problem**: Extensions not working
- Reload window: Ctrl+Shift+P → "Reload Window"
- Reinstall extension
- Check extension logs

**Problem**: Terminal not working
- Check default shell settings
- Try different shell (PowerShell, Bash, etc.)

## Support

For additional help:
- GitHub Docs: https://docs.github.com
- VS Code Docs: https://code.visualstudio.com/docs
- Git Tutorial: https://git-scm.com/docs/gittutorial

---

© 2026 M-Theory. All rights reserved.
