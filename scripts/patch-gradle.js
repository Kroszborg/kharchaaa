/**
 * Patches android/app/build.gradle after expo prebuild
 * to set a custom APK output filename.
 *
 * Run: node scripts/patch-gradle.js
 */
const fs = require('fs');
const path = require('path');

const buildGradle = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!fs.existsSync(buildGradle)) {
  console.error('android/app/build.gradle not found. Run expo prebuild first.');
  process.exit(1);
}

let content = fs.readFileSync(buildGradle, 'utf8');

const patch = `
    // Rename APK output to kharchaaa
    applicationVariants.all { variant ->
        variant.outputs.all { output ->
            output.outputFileName = "kharchaaa-v${require('../package.json').version}-${variant.buildType.name}.apk"
        }
    }
`;

if (content.includes('kharchaaa')) {
  console.log('build.gradle already patched, skipping.');
} else {
  // Insert before the last closing brace of the android block
  content = content.replace(
    /^(android\s*\{[\s\S]*?)(^\})/m,
    (match, body, closingBrace) => body + patch + closingBrace
  );
  fs.writeFileSync(buildGradle, content);
  console.log('✓ Patched build.gradle: APK will be named kharchaaa-vX.X.X-release.apk');
}
