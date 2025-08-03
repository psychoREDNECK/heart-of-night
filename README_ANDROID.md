# PyToApk Android App

This is the Android version of PyToApk - a Python to APK converter application built with Capacitor.

## Features

- **Mobile-Optimized UI**: Responsive design that adapts to mobile devices
- **Native File Access**: Access device storage for file uploads and APK downloads
- **Share Functionality**: Share projects using native Android sharing
- **Offline Support**: Core functionality works without internet connection
- **Touch-Friendly**: Optimized for touch interactions

## Development Setup

### Prerequisites
- Node.js 18+ 
- Android Studio
- Android SDK (API level 33+)
- Java 17+

### Building the Android App

1. **Build web assets:**
   ```bash
   npm run build
   ```

2. **Sync with Android project:**
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

4. **Run on device/emulator:**
   ```bash
   npx cap run android
   ```

## Mobile-Specific Features

### File Upload
- Native file picker integration
- Support for multiple file types
- Visual feedback for upload progress

### APK Download
- Files saved to device Documents folder
- Native sharing capabilities
- Progress tracking

### Project Management
- Touch-optimized interface
- Swipe gestures for file operations
- Mobile-friendly navigation

## Permissions

The app requires the following Android permissions:
- `READ_EXTERNAL_STORAGE` - For file uploads
- `WRITE_EXTERNAL_STORAGE` - For saving APK files
- `INTERNET` - For API communication (when available)

## Build Configuration

- **Target SDK**: Android 13 (API 33)
- **Min SDK**: Android 7.0 (API 24)
- **Architecture**: Universal APK (ARM64, x86_64)

## Deployment

### Debug Build
```bash
npx cap build android
```

### Release Build
1. Generate signed APK in Android Studio
2. Configure release signing in `android/app/build.gradle`
3. Build release APK for distribution

## Testing

Test on various Android devices and versions:
- Android 7.0+ (API 24+)
- Different screen sizes (phone/tablet)
- Various file types and sizes
- Network connectivity scenarios

## Troubleshooting

### Common Issues

1. **Build fails**: Ensure Android SDK is properly configured
2. **App crashes on start**: Check Capacitor plugin compatibility
3. **File upload not working**: Verify storage permissions
4. **UI layout issues**: Test on different screen densities

### Debugging

1. Use Chrome DevTools for web debugging
2. Android Studio logcat for native debugging
3. Capacitor CLI for build diagnostics

## Architecture

The Android app uses:
- **Capacitor**: Web-to-native bridge
- **WebView**: Renders the React web application
- **Native Plugins**: File system, sharing, device info
- **Android Components**: Standard Android app structure