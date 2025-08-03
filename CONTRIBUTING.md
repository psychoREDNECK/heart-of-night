# Contributing to Heart of Night

Thank you for your interest in contributing to Heart of Night! This document provides guidelines for contributing to this cyberpunk-themed Python-to-APK platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- Java 17+ (for Android builds)
- Android SDK (for APK compilation)
- Git for version control

### Setup Development Environment
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/heart-of-night.git`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. For Android development: `npx cap sync android`

## 🎯 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Provide environment information (OS, Node version, etc.)
- Add screenshots for UI-related issues

### Feature Requests
- Check existing issues first
- Describe the feature clearly
- Explain the use case and benefits
- Consider implementation complexity

### Code Contributions

#### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Test your changes thoroughly
4. Update documentation if needed
5. Submit a pull request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots for UI changes

## 🏗️ Project Structure

```
heart-of-night/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   └── hooks/        # Custom hooks
├── server/               # Express backend
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Data layer
│   └── ai.ts            # AI integrations
├── shared/               # Shared types
├── android/              # Capacitor Android
└── .github/workflows/    # CI/CD pipelines
```

## 🎨 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic

### UI/UX Guidelines
- Maintain cyberpunk/hacker aesthetic
- Use green (#00ff41) as primary accent color
- Dark theme with neon highlights
- Mobile-first responsive design
- Terminal-inspired typography

### Component Guidelines
- Use Radix UI primitives where possible
- Follow shadcn/ui patterns
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test on both web and mobile interfaces

## 🤖 AI Integration

### Adding New AI Providers
1. Add provider configuration to `server/ai.ts`
2. Implement API integration function
3. Add provider option to frontend configuration
4. Test with various prompts and models
5. Document API requirements and limitations

### AI Feature Development
- Maintain consistent prompt formatting
- Handle API errors gracefully
- Implement rate limiting
- Add proper error messages for users

## 📱 Android Development

### Capacitor Guidelines
- Test on real Android devices when possible
- Ensure native features work correctly
- Maintain compatibility with Android 7.0+
- Follow Android design guidelines

### APK Building
- Test both debug and release builds
- Verify signing configuration
- Check app permissions and manifest
- Test installation and functionality

## 🧪 Testing

### Manual Testing
- Test all major features before submitting
- Verify mobile responsiveness
- Check AI integrations with various providers
- Test file upload and build processes

### Automated Testing
- GitHub Actions run on all PRs
- APK builds are automatically tested
- Lint and type checking must pass

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Update README for new features
- Include usage examples

### User Documentation
- Update feature descriptions
- Add screenshots for new UI
- Document configuration options
- Provide troubleshooting guides

## 🔒 Security Considerations

### File Handling
- Validate all file uploads
- Sanitize file content
- Check file size limits
- Prevent path traversal attacks

### API Security
- Validate all input parameters
- Implement rate limiting
- Secure API key handling
- Use HTTPS in production

## 🚢 Release Process

### Versioning
- Follow semantic versioning (semver)
- Update version in relevant files
- Create release notes
- Tag releases appropriately

### APK Releases
- GitHub Actions automatically builds APKs
- Debug builds for testing
- Signed releases for distribution
- Include changelog in releases

## 📞 Getting Help

- Join discussions in GitHub issues
- Ask questions about implementation
- Request code reviews
- Share feedback and suggestions

## 🎖️ Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes
- Given appropriate GitHub repository permissions
- Credited for significant contributions

Thank you for helping make Heart of Night an awesome cyberpunk development platform! 🌙⚡