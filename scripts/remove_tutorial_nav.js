const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../docs/src');

const tutorialFiles = [
  'Tutorial1.omni',
  'Tutorial2.omni',
  'Tutorial3.omni',
  'TutorialMedia.omni',
  'TutorialForm.omni',
  'Tutorial4.omni',
  'Tutorial5.omni',
  'Tutorial6.omni',
  'Tutorial7.omni',
  'TutorialCSS.omni',
  'TutorialAnimation.omni',
  'TutorialTodo.omni'
];

tutorialFiles.forEach(fileName => {
  const filePath = path.join(srcDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping (not found): ${fileName}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Relaxed regex to match the navigation stack block
  const navBlockRegex = /<Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black\/5 dark:border-white\/10">[\s\S]*?<\/Stack>/g;

  if (navBlockRegex.test(content)) {
    content = content.replace(navBlockRegex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully removed navigation from: ${fileName}`);
  } else {
    console.log(`No navigation block found in: ${fileName}`);
  }
});
