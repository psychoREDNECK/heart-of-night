# GitHub Setup Guide for Heart of Night APK Building

## 🚀 Quick Setup

### 1. Create GitHub Repository
```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Heart of Night cyberpunk Python-to-APK platform"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/heart-of-night.git

# Push to GitHub
git push -u origin main
```

### 2. Enable GitHub Actions
1. Go to your GitHub repository
2. Click on the "Actions" tab
3. GitHub Actions will automatically be enabled
4. The APK build workflow will trigger on every push

### 3. Automatic APK Building
Once you push code to GitHub:
- ✅ GitHub Actions automatically builds both debug and release APKs
- ✅ APK files are available as downloadable artifacts
- ✅ Release APKs are attached to GitHub releases
- ✅ Build status is visible in the Actions tab

## 📱 Getting Your APK Files

### From GitHub Actions (Every Push)
1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Scroll down to **Artifacts** section
4. Download:
   - `heart-of-night-debug` - Debug APK for testing
   - `heart-of-night-release` - Release APK for distribution

### From GitHub Releases (Tagged Releases)
1. Create a new release in GitHub
2. APK files are automatically attached
3. Users can download directly from releases page

## 🔧 Configuration Options

### Android Signing (Optional)
To create signed release APKs:

1. **Generate keystore** (one-time setup):
```bash
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

2. **Add to GitHub Secrets**:
   - `KEYSTORE_FILE` - Base64 encoded keystore file
   - `KEYSTORE_PASSWORD` - Keystore password
   - `KEY_ALIAS` - Key alias name
   - `KEY_PASSWORD` - Key password

3. **Update workflow** to use signing configuration

### Environment Variables for AI Features
Add these as GitHub repository secrets for AI functionality:
- `OPENAI_API_KEY` - For OpenAI services
- `ANTHROPIC_API_KEY` - For Anthropic services
- `MISTRAL_API_KEY` - For Mistral services
- `TOGETHER_API_KEY` - For Together AI services

## 🛠️ Local Development

### Test APK Build Locally
```bash
# Build web application
npm run build

# Sync with Android project
npx cap sync android

# Build debug APK
cd android && ./gradlew assembleDebug

# Find APK file at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Install on Android Device
```bash
# Enable USB debugging on Android device
# Connect device via USB
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 📊 Repository Features

### Automated Workflows
- ✅ **APK Building**: Automatic on every push
- ✅ **Multi-Platform**: Debug and release variants
- ✅ **Artifact Storage**: 90-day retention
- ✅ **Release Integration**: Automatic attachment to releases

### Documentation
- ✅ **README**: Comprehensive project overview
- ✅ **Contributing**: Guidelines for contributors
- ✅ **License**: MIT license for open source
- ✅ **Setup Guide**: This file for quick setup

### Version Control
- ✅ **GitIgnore**: Proper exclusions for Node.js and Android
- ✅ **Branch Protection**: Recommended for main branch
- ✅ **Issue Templates**: For bug reports and feature requests

## 🔥 Quick Commands

```bash
# Clone and setup
git clone https://github.com/yourusername/heart-of-night.git
cd heart-of-night
npm install

# Development
npm run dev

# Build web app
npm run build

# Android development
npx cap sync android
npx cap open android

# Direct APK build
cd android && ./gradlew assembleDebug
```

## 🚀 Distribution

### APK Distribution Methods
1. **GitHub Releases** - Professional distribution
2. **Direct APK Sharing** - Download from Actions artifacts
3. **F-Droid** - Open source app store (requires additional setup)
4. **Google Play Store** - Commercial distribution (requires developer account)

### User Installation Instructions
1. Download APK from GitHub releases
2. Enable "Install from unknown sources" on Android
3. Install the APK file
4. Grant necessary permissions (file access, internet)

## 🎯 Next Steps

1. **Push to GitHub** - Upload your code
2. **Watch Actions** - Monitor first APK build
3. **Test APK** - Download and install on device
4. **Create Release** - Tag a version for stable release
5. **Share Project** - Distribute your cyberpunk Python-to-APK platform

Your Heart of Night application is now ready for GitHub with automated APK building! 🌙⚡