
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to execute commands and log their output
function runCommand(command) {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

console.log('\n========== DentalPilote Mobile Setup ==========');
console.log('This script will help you set up your mobile project');

rl.question('\nWhich platform would you like to set up? (android/ios/both): ', (platform) => {
  platform = platform.toLowerCase();
  
  if (!['android', 'ios', 'both'].includes(platform)) {
    console.log('Invalid platform. Please choose android, ios, or both.');
    rl.close();
    return;
  }

  console.log('\nBuilding web application...');
  if (!runCommand('npm run build')) {
    console.log('Failed to build the application. Please fix any errors and try again.');
    rl.close();
    return;
  }

  if (platform === 'android' || platform === 'both') {
    console.log('\nSetting up Android platform...');
    if (!fs.existsSync('android')) {
      runCommand('npx cap add android');
    } else {
      console.log('Android platform already exists, updating...');
      runCommand('npx cap update android');
    }
  }

  if (platform === 'ios' || platform === 'both') {
    console.log('\nSetting up iOS platform...');
    if (!fs.existsSync('ios')) {
      runCommand('npx cap add ios');
    } else {
      console.log('iOS platform already exists, updating...');
      runCommand('npx cap update ios');
    }
  }

  console.log('\nSyncing web code to mobile platforms...');
  runCommand('npx cap sync');

  console.log('\n========== Setup Complete ==========');
  console.log('\nTo run your app:');
  if (platform === 'android' || platform === 'both') {
    console.log('- Android: npm run android');
  }
  if (platform === 'ios' || platform === 'both') {
    console.log('- iOS: npm run ios');
  }
  console.log('\nFor more information, see MOBILE_SETUP.md');
  
  rl.close();
});
