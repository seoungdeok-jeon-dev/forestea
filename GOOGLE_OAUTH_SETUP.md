# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for Forestea.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name: `Forestea` (or your preferred name)
5. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"
   - Alternatively, search for "People API" and enable it

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: `Forestea`
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Add or Remove Scopes"
   - Add: `userinfo.email`, `userinfo.profile`, `openid`
   - Or just use the defaults
7. Click "Save and Continue"
8. Add test users (your email) if in testing mode
9. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Enter name: `Forestea Web`
5. Add **Authorized JavaScript origins**:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
6. Add **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Click "Create"
8. **IMPORTANT**: Copy the Client ID and Client Secret

### 5. Configure Environment Variables

1. Open `apps/web/.env.local`
2. Add your credentials:

```bash
AUTH_GOOGLE_ID="your-client-id-here.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-client-secret-here"
```

3. Save the file

### 6. Restart Your Development Server

```bash
# Stop your current server (Ctrl+C)
# Then restart
pnpm dev
```

### 7. Test Google Login

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. You should now see "Continue with Google" button with Google icon
3. Click it to test the OAuth flow
4. Sign in with your Google account
5. You should be redirected back to your app and logged in

## Production Deployment

### Environment Variables

Make sure to set these environment variables in your production environment:

```bash
AUTH_GOOGLE_ID="your-production-client-id"
AUTH_GOOGLE_SECRET="your-production-client-secret"
AUTH_URL="https://yourdomain.com"
AUTH_SECRET="your-secure-random-secret"
```

### Generate AUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Update Redirect URIs

In Google Cloud Console, make sure your production domain is added to:
- Authorized JavaScript origins
- Authorized redirect URIs

Example:
- Origin: `https://yourdomain.com`
- Redirect: `https://yourdomain.com/api/auth/callback/google`

## Troubleshooting

### "Redirect URI mismatch" error

- Make sure the redirect URI in Google Cloud Console exactly matches:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://yourdomain.com/api/auth/callback/google` (prod)
- No trailing slashes
- Exact protocol (http vs https)

### Google button not showing

- Check that `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set in `.env.local`
- Restart your dev server after changing environment variables
- Check browser console for errors

### "Access blocked: This app's request is invalid"

- Make sure OAuth consent screen is configured
- Add your email as a test user if the app is in testing mode
- Wait a few minutes after making changes in Google Cloud Console

### "The redirect URI in the request did not match a registered redirect URI"

- Double-check your redirect URIs in Google Cloud Console
- Make sure `AUTH_URL` in `.env.local` matches your current domain
- For localhost, it should be `http://localhost:3000` (not https)

## Security Notes

- Never commit `.env.local` to git (it's in `.gitignore` by default)
- Keep your `AUTH_GOOGLE_SECRET` secure
- Use different OAuth credentials for development and production
- Regularly rotate your secrets
- Enable 2FA on your Google Cloud account

## Additional Resources

- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
