#!/bin/bash

# Security Setup Script for Oga Mechanic
echo "🔒 Setting up security features for Oga Mechanic..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# API Configuration
EXPO_PUBLIC_API_URL=https://934233d30363.ngrok-free.app/api/v1
EXPO_PUBLIC_API_KEY=DNTc5u8uGCibny1U5LSz6Su7qYnWHfRFTX1yTSBSU3NwJ8w8iYwBZP0pdg46zqoq

# Environment
EXPO_PUBLIC_ENV=development

# App Configuration
EXPO_PUBLIC_APP_NAME=Oga Mechanic
EXPO_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true

# Security Features (Optional - can be enabled/disabled)
EXPO_PUBLIC_ENABLE_CERTIFICATE_PINNING=false
EXPO_PUBLIC_ENABLE_REQUEST_SIGNING=false
EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=false
EXPO_PUBLIC_ENABLE_RATE_LIMITING=false
EXPO_PUBLIC_ENABLE_DATA_ENCRYPTION=false

# Third-party Services
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# WebSocket Configuration
EXPO_PUBLIC_WEBSOCKET_URL=wss://api.ogamechanic.com/ws

# File Upload Configuration
EXPO_PUBLIC_MAX_FILE_SIZE=10485760
EXPO_PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
EOF
    echo "✅ .env file created successfully!"
else
    echo "⚠️  .env file already exists, skipping creation."
fi

# Install security dependencies
echo "📦 Installing security dependencies..."
npm install expo-secure-store expo-local-authentication expo-crypto

echo "🎉 Security setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Copy .env.example to .env if you haven't already"
echo "2. Update the API_URL and API_KEY in .env with your actual values"
echo "3. Enable security features by setting them to 'true' in .env"
echo "4. Restart your development server"
echo ""
echo "🛡️ Security features available:"
echo "- Certificate Pinning: EXPO_PUBLIC_ENABLE_CERTIFICATE_PINNING=true"
echo "- Request Signing: EXPO_PUBLIC_ENABLE_REQUEST_SIGNING=true"
echo "- Biometric Auth: EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=true"
echo "- Rate Limiting: EXPO_PUBLIC_ENABLE_RATE_LIMITING=true"
echo "- Data Encryption: EXPO_PUBLIC_ENABLE_DATA_ENCRYPTION=true"
