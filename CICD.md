# Semzung CI/CD Guide

## Pipeline Overview

The repository uses one GitHub Actions workflow: `.github/workflows/ci.yml`.

It runs backend, frontend, API, E2E, SonarQube, Snyk, OWASP ZAP, and k6 jobs
when code is pushed to `CICD` or when a pull request targets `main`. After every
job passes, direct pushes to `CICD` also publish the production container to
GitHub Container Registry. Pull requests never publish containers.

Protect the `main` branch and require the workflow's test and security jobs
before merging.

## Required GitHub Secrets

Configure these in repository or environment settings:

| Secret | Used for |
| --- | --- |
| `SNYK_TOKEN` | Snyk Open Source and Snyk Code scanning |
| `SONAR_TOKEN` | SonarQube analysis |
| `SONAR_HOST_URL` | Reachable SonarQube Server URL |
| `REACT_APP_SUPABASE_URL` | Production frontend build |
| `REACT_APP_SUPABASE_ANON_KEY` | Production frontend build |

Configure this non-secret GitHub Actions repository variable:

| Variable | Used for |
| --- | --- |
| `SONAR_ORGANIZATION` | SonarQube Cloud organization key used as `sonar.organization` |

The runtime container also requires `GROQ_API_KEY`. Configure it in the deployment platform, never as a frontend build argument.

If SonarQube is hosted only on a private/local network, use a self-hosted GitHub Actions runner that can reach it.

## Local Commands

```bash
npm ci
cd react-app && npm ci && cd ..

npm run lint
npm run test:coverage
cd react-app && npm run test:coverage && npm run build && cd ..
npm run test:api
npm run test:e2e
npm run test:performance
```

API, E2E, ZAP, and performance tests require a running server. The Playwright command starts one automatically. For Newman and k6:

```bash
DATA_DIR=./data/test npm start
```

## SonarQube Quality Gate

Create the `semzung-mental-health-platform` project in SonarQube and use a quality gate for new code:

- No blocker or critical issues
- No unresolved security hotspots
- At least 80% coverage on new code
- Less than 3% duplicated lines on new code

Coverage is read from `coverage/lcov.info` and `react-app/coverage/lcov.info`.

## Deployment

The publish job runs after successful pushes to `CICD` and publishes:

```text
ghcr.io/<github-owner>/<repository>:CICD
ghcr.io/<github-owner>/<repository>:sha-<commit>
```

Deploy that image to the selected hosting platform and mount persistent storage at `/app/data`. For production scaling, replace JSON-file storage with a database before running multiple container replicas.

Configure the GitHub `production` environment with required reviewers to add a manual approval gate.

## Security Notes

The Groq request now goes through `POST /api/chat`, keeping `GROQ_API_KEY` on the server. Existing conversations, moods, profiles, and `node_modules` are already present in Git history. `.gitignore` prevents future additions, but remove sensitive historical data before making the repository public.

The current profile, mood, and conversation APIs still need server-side Supabase token verification before production use. CI security scans can detect many issues, but they do not create authorization controls.
