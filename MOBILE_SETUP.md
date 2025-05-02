
# DentalPilote Mobile Setup Guide

This guide will help you set up and run DentalPilote as a mobile application on Android and iOS devices.

## Prerequisites

- Node.js and npm installed
- For Android: Android Studio installed
- For iOS: macOS with Xcode installed
- Git and GitHub account (to export the project)

## Initial Setup

1. **Export the project to your GitHub repository**
   - Use the "Export to GitHub" button in Lovable
   - Clone the repository to your local machine
   
2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the mobile setup script**
   ```bash
   node mobile-setup.js
   ```
   - Choose which platform(s) you want to set up (android, ios, or both)
   - This script will build the web app and set up the selected platforms

## Running the App

### Android

```bash
npm run android
```

This will:
1. Build the web app
2. Sync changes to the Android project
3. Open Android Studio with your project
4. From there, you can run on an emulator or physical device

### iOS

```bash
npm run ios
```

This will:
1. Build the web app
2. Sync changes to the iOS project
3. Open Xcode with your project
4. From there, you can run on a simulator or physical device

## Making Changes

After making changes to your web app:

1. Build the web app: `npm run build`
2. Sync changes to mobile platforms: `npx cap sync`
3. Run the app using the commands mentioned above

## Troubleshooting

If you encounter issues:

- Make sure all dependencies are installed correctly
- Check that the build process completes successfully
- Verify that Android Studio or Xcode are properly installed
- For iOS development, ensure you're using a Mac
- For detailed logs, run `npx cap sync --verbose`

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Xcode Guide](https://developer.apple.com/xcode/)
