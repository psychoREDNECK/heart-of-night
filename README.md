# Heart of Night 🌙⚡

A cyberpunk-themed Python-to-APK weaponization platform that converts Python applications into Android APK files. This comprehensive development environment features a hacker-aesthetic interface with Matrix-inspired visuals and advanced AI-powered development tools.

## 🎯 Features

### 🔥 Core Capabilities
- **Python-to-APK Conversion**: Upload Python files and convert them to Android applications
- **Multi-Format File Support**: Handle Python files, archives, config files, media assets, and more
- **Real-time Build Process**: Monitor APK compilation with live progress tracking
- **Project Management**: Organize files, manage dependencies, and configure app settings

### 🤖 AI-Powered Development
- **Multi-AI Integration**: Support for OpenAI, Anthropic, Mistral, LLaMA Maverick, Together AI, and custom endpoints
- **AI Code Editor**: Direct code modification with natural language instructions
- **Code Analysis**: Real-time vulnerability assessment and optimization suggestions
- **Image Generation**: DALL-E 3 integration for cyberpunk-themed assets

### 📱 Mobile App
- **Native Android App**: Built with Capacitor for web-to-native conversion
- **Mobile-Optimized UI**: Touch-friendly interface designed for mobile devices
- **Native Features**: File system access, sharing, device storage integration
- **Cross-Platform**: Single codebase runs on web and Android

### 🎨 Cyberpunk Theme
- **Matrix-Inspired Design**: Green terminal aesthetics with scanline effects
- **Hacker Terminology**: "Weaponize", "Exploit", "Infiltrate" throughout the interface
- **Visual Effects**: Glitch animations, neon glows, and matrix grid backgrounds
- **Dark Theme**: Professional cybersecurity-focused appearance

## 🚀 Quick Start

### Web Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Android APK

#### Automatic Build (GitHub Actions)
1. Fork/clone this repository
2. Push changes to trigger automatic APK building
3. Download APK files from GitHub Actions artifacts
4. Install on Android device

#### Manual Build
```bash
# Build web application
npm run build

# Sync with Android project
npx cap sync android

# Open in Android Studio
npx cap open android

# Or build directly
cd android && ./gradlew assembleDebug
```

## 📁 Project Structure

```
heart-of-night/
├── client/                 # Frontend React application
├── server/                 # Backend Express.js API
├── android/                # Capacitor Android project
├── shared/                 # Shared TypeScript types
├── .github/workflows/      # GitHub Actions for APK building
└── dist/                   # Production build output
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional - Database (uses in-memory if not set)
DATABASE_URL=postgresql://...

# Optional - AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...
TOGETHER_API_KEY=...
```

### Android Configuration
- **App ID**: `com.heartofnight.app`
- **App Name**: Heart of Night
- **Target SDK**: Android 7.0+ (API level 24+)
- **Permissions**: Internet, file system access, camera (for file uploads)

## 🏗️ Building APKs

### GitHub Actions (Recommended)
1. Push code to GitHub repository
2. GitHub Actions automatically builds APK files
3. Download from Actions artifacts or releases

### Local Development
```bash
# Debug APK (for testing)
cd android && ./gradlew assembleDebug

# Release APK (for distribution)
cd android && ./gradlew assembleRelease
```

## 📱 Installation

### From GitHub Releases
1. Go to the [Releases page](../../releases)
2. Download the latest APK file
3. Enable "Install from unknown sources" on Android
4. Install the APK file

### Direct Download
- Debug APK: Available in GitHub Actions artifacts
- Release APK: Available in GitHub releases

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js, TypeScript
- **Mobile**: Capacitor for native Android features
- **Database**: PostgreSQL with Drizzle ORM (optional)
- **AI**: Multiple provider integration with OpenAI, Anthropic, etc.

### Key Components
- **Project Manager**: Create and organize Python-to-APK projects
- **File Upload**: Support for multiple file formats with drag-and-drop
- **Build System**: Real-time APK compilation with progress tracking
- **AI Assistant**: Code analysis, modification, and generation
- **Mobile Interface**: Native Android app with touch optimization

## 🔒 Security Features

- **Code Analysis**: Real-time vulnerability scanning
- **Secure File Handling**: Validation and sanitization of uploads
- **Environment Isolation**: Sandboxed build processes
- **API Security**: Rate limiting and input validation

## 📊 Deployment

### Web Deployment
- Optimized for Replit Deployments
- Health check endpoints for monitoring
- Graceful shutdown handling
- Production environment configuration

### APK Distribution
- Automated builds via GitHub Actions
- Debug and release variants
- Signed releases for app stores
- Direct APK distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Features in Development

- **Advanced Python Analysis**: Enhanced code conversion algorithms
- **More AI Models**: Additional AI provider integrations
- **iOS Support**: Capacitor iOS implementation
- **Desktop Apps**: Electron wrapper for desktop platforms
- **Plugin System**: Extensible architecture for custom tools

---

**Heart of Night** - Transform your Python code into weaponized Android applications with cyberpunk style. 🚀🔥