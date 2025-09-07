# Environment Configuration

This directory contains environment configuration files for the Oga Mechanic app.

## Setup

1. **Create a `.env` file** in the root directory of your project with the following variables:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://api.ogamechanic.com/v1

# Environment
EXPO_PUBLIC_ENV=development

# App Configuration
EXPO_PUBLIC_APP_NAME=Oga Mechanic
EXPO_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true

# Third-party Services
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here

# WebSocket Configuration
EXPO_PUBLIC_WEBSOCKET_URL=wss://api.ogamechanic.com/ws

# File Upload Configuration
EXPO_PUBLIC_MAX_FILE_SIZE=10485760
EXPO_PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

2. **Update the values** according to your environment:
   - For **development**: Use development API URLs
   - For **staging**: Use staging API URLs  
   - For **production**: Use production API URLs

## Environment Variables

### Required Variables
- `EXPO_PUBLIC_API_URL`: The base URL for your API

### Optional Variables
- `EXPO_PUBLIC_ENV`: Environment name (development, staging, production)
- `EXPO_PUBLIC_APP_NAME`: Application name
- `EXPO_PUBLIC_APP_VERSION`: Application version
- `EXPO_PUBLIC_ENABLE_ANALYTICS`: Enable analytics tracking
- `EXPO_PUBLIC_ENABLE_CRASH_REPORTING`: Enable crash reporting
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `EXPO_PUBLIC_WEBSOCKET_URL`: WebSocket server URL
- `EXPO_PUBLIC_MAX_FILE_SIZE`: Maximum file upload size in bytes
- `EXPO_PUBLIC_ALLOWED_FILE_TYPES`: Comma-separated list of allowed file types

## Usage

The environment configuration is automatically loaded from `config/env.ts`:

```typescript
import { ENV_CONFIG } from '../config/env';

// Use the API URL
const apiUrl = ENV_CONFIG.API_URL;

// Check if analytics is enabled
if (ENV_CONFIG.ENABLE_ANALYTICS) {
  // Initialize analytics
}
```

## Security Notes

- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- Use different API keys for different environments
- Keep your production API keys secure

## Troubleshooting

If you're having issues with environment variables:

1. Make sure your `.env` file is in the root directory
2. Restart your development server after changing environment variables
3. Check that all variable names start with `EXPO_PUBLIC_`
4. Verify that the values don't have extra spaces or quotes
