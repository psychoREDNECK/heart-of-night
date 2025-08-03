# Heart of Night - Hacker Android Platform

A cybersecurity-focused Python-to-APK weaponization platform with advanced AI assistance and hacker aesthetics.

## Features

- **Multiple AI Providers**: Mistral, LLaMA Maverick 4, Ollama, Together AI, OpenAI, Anthropic
- **AI Code Editor**: AI can directly read, analyze, and modify the app's source code
- **Image Generation**: DALL-E 3 integration for cyberpunk/hacker-themed visuals
- **Python-to-APK**: Convert Python applications into Android APK files
- **Hacker Interface**: Matrix-inspired terminal aesthetics with neon effects
- **Mobile Optimized**: Responsive design for mobile and desktop

## Download APK

### Automatic Builds
Every commit triggers an automatic APK build via GitHub Actions. Download the latest APK from:

1. **Releases Page**: Go to the "Releases" section
2. **Download APK**: Choose either:
   - `app-debug.apk` (for testing)
   - `app-release-unsigned.apk` (for production)

### Manual Build
If you have Android development tools installed:

```bash
# Clone the repository
git clone <repository-url>
cd heart-of-night

# Install dependencies
npm install

# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug
```

## Installation

1. Download the APK file
2. Enable "Install from unknown sources" on your Android device
3. Install the APK
4. Launch Heart of Night

## Configuration

### AI Providers
Configure your preferred AI provider in the app settings:
- Add API keys for commercial providers (OpenAI, Anthropic)
- Set up local endpoints for Ollama or custom models
- Use Mistral for uncensored AI responses

### Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Sync with Android
npx cap sync android
```

## Security Notice

Heart of Night is designed for cybersecurity research and educational purposes. Use responsibly and in accordance with applicable laws and regulations.

## License

MIT License - See LICENSE file for details.