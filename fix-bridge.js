const fs = require('fs');
let c = fs.readFileSync('lib/useSettings.ts', 'utf8');

// Remove all stray backtick blocks
c = c.replace(/\`\`\`\n/g, '');
c = c.replace(/\n\`\`\`/g, '');
c = c.replace(/```\n/g, '');
c = c.replace(/\n```/g, '');
c = c.replace(/```/g, '');

fs.writeFileSync('lib/useSettings.ts', c);
console.log('Fixed! Removed stray backticks.');