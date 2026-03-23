# GitHub Actions Environment Variables Setup Guide

## Required Secrets to Configure

Go to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. Supabase Configuration
- `EXPO_PUBLIC_SUPABASE_URL`: Project URL from Supabase dashboard
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Anon Key from Supabase API settings
- `SUPABASE_SERVICE_ROLE_SECRET`: Service Role Key (Backend only)

### 2. API Keys
- `EXPO_PUBLIC_CLAUDE_API_KEY`: Anthropic Claude API Key
  - Obtain from: https://console.anthropic.com/
  - Scope: Read-only for development, read-write for production
  - Rotation: Every 90 days

- `EXPO_PUBLIC_WHISPER_API_KEY`: OpenAI Whisper API Key
  - Obtain from: https://platform.openai.com/account/api-keys
  - Scope: Speech-to-text only
  - Rotation: Every 60 days

### 3. Monitoring & Analytics
- `SENTRY_AUTH_TOKEN`: Sentry project token
- `EXPO_PUBLIC_SENTRY_DSN`: Sentry DSN URL
- `EXPO_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics ID

## Workflow Usage Example

```yaml
env:
  EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
  EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
  EXPO_PUBLIC_CLAUDE_API_KEY: ${{ secrets.EXPO_PUBLIC_CLAUDE_API_KEY }}
  SUPABASE_SERVICE_ROLE_SECRET: ${{ secrets.SUPABASE_SERVICE_ROLE_SECRET }}
```

## Security Best Practices

1. **Never commit API keys**: They are automatically redacted from logs
2. **Rotate keys regularly**:
   - Claude API: Every 90 days
   - Whisper API: Every 60 days
   - Supabase: Every 120 days
3. **Use separate keys for dev/prod**: Development keys should have limited scope
4. **Enable branch protection**: Require reviews before merging secrets changes
5. **Monitor usage**: Check API dashboards for unusual activity

## Key Revocation Process

If a key is accidentally exposed:

1. **Immediately**: Disable the key in the API dashboard
2. **Within 5 minutes**: Update the secret in GitHub Actions
3. **Within 1 hour**: Deploy new key to production
4. **Document**: Log the incident for audit trail

## Testing Secrets

Before committing:
```bash
# Check git history for exposed keys
git log -p --all -S 'sk-ant' | head -20

# Verify .env files are ignored
git check-ignore .env.local .env.production
```

## Required GitHub Actions Configurations

### Example: Build and Deploy Workflow

```yaml
name: Build and Deploy

on:
  push:
    branches: [develop, main]

jobs:
  build:
    runs-on: ubuntu-latest

    environment:
      name: production

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with secrets
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
          EXPO_PUBLIC_CLAUDE_API_KEY: ${{ secrets.EXPO_PUBLIC_CLAUDE_API_KEY }}
          SUPABASE_SERVICE_ROLE_SECRET: ${{ secrets.SUPABASE_SERVICE_ROLE_SECRET }}
        run: npm run build
```

## Verification Checklist

- [ ] All API keys are in GitHub Actions secrets, not in code
- [ ] `.env.local` and `.env.production` contain only template variables
- [ ] `.gitignore` includes `.env*` patterns
- [ ] Production build uses secrets from GitHub Actions
- [ ] No keys appear in commit history
- [ ] All team members are informed of the new process
