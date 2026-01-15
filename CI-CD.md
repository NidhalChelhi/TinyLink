# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions for continuous integration and continuous deployment.

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**

- Push to `main`, `develop`, or `feature/**` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Lint and Test

- Runs on Node.js 18.x and 20.x
- Installs dependencies
- Runs security audit
- Runs linter (if configured)
- Runs tests (if configured)

#### Build Docker

- Builds Docker image
- Tests the image by running a container
- Verifies health check endpoint

#### Security Scan

- Scans code for vulnerabilities using Trivy
- Uploads results to GitHub Security tab

### 2. CD Pipeline (`.github/workflows/cd.yml`)

**Triggers:**

- Push to `main` branch
- Version tags (e.g., `v1.0.0`)

**Jobs:**

#### Build and Push

- Builds Docker image with proper tags
- Pushes to Docker registry (when configured)
- Tags with version, SHA, and branch name

#### Deploy Staging

- Simulates deployment to staging
- Only runs on main branch

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are enabled by default. Workflows run automatically on push/PR.

### 2. Configure Docker Hub (Optional)

To push images to Docker Hub:

1. Create Docker Hub account
2. Add secrets to GitHub:
   - Go to: Settings → Secrets and variables → Actions
   - Add `DOCKER_USERNAME`
   - Add `DOCKER_PASSWORD`
3. Uncomment Docker login step in `cd.yml`

### 3. View Workflow Runs

- Go to repository → Actions tab
- See all workflow runs and logs

### 4. Branch Protection Rules

Recommended settings for `main` branch:

- Go to: Settings → Branches → Add rule
- Branch name pattern: `main`
- Enable:
  - Require pull request reviews before merging
  - Require status checks to pass (CI Pipeline)
  - Require branches to be up to date

## Workflow Status Badges

Add to README.md:

```markdown
[![CI Pipeline](https://github.com/NidhalChelhi/tinylink/actions/workflows/ci.yml/badge.svg)](https://github.com/NidhalChelhi/tinylink/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/NidhalChelhi/tinylink/actions/workflows/cd.yml/badge.svg)](https://github.com/NidhalChelhi/tinylink/actions/workflows/cd.yml)
```

## Pipeline Flow

```
┌─────────────┐
│   Git Push  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  CI Pipeline Starts │
└──────┬──────────────┘
       │
       ├─► Lint & Test (Node 18, 20)
       ├─► Build Docker Image
       ├─► Test Docker Container
       └─► Security Scan
       │
       ▼
┌─────────────────────┐
│   All Checks Pass?   │
└──────┬──────────────┘
       │ Yes
       ▼
┌─────────────────────┐
│ CD Pipeline (main)  │
└──────┬──────────────┘
       │
       ├─► Build & Tag Image
       ├─► Push to Registry
       └─► Deploy to Staging
```

## Dependabot

Automatically creates PRs for:

- npm package updates (weekly)
- GitHub Actions updates (weekly)

Review and merge Dependabot PRs to keep dependencies updated.

## Troubleshooting

### Workflow Fails

1. Check Actions tab for error logs
2. Common issues:
   - Node version mismatch
   - Missing dependencies
   - Docker build failures
   - Health check timeout

### Security Scan Fails

- Review Security tab for vulnerabilities
- Update dependencies: `npm audit fix`
- Check Trivy results in workflow logs

### Docker Build Fails

```bash
# Test locally first
docker build -t tinylink:test .
docker run -p 3000:3000 tinylink:test
```

## Future Enhancements

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Code coverage reports
- [ ] Automated deployment to cloud (AWS/GCP/Azure)
- [ ] Slack/Discord notifications
- [ ] Performance testing
