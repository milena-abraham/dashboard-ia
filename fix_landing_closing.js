const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/page.tsx', 'utf8');

content = content.replace(/<\/p>\n            <\/div>/g, '<\/p>\n            <\/div>\n          <\/StaggerItem>');

// Make sure StaggerContainer is closed
content = content.replace(/<\/StaggerItem>\n\n          <\/div>/g, '<\/StaggerItem>\n\n          <\/div>\n          <\/StaggerContainer>');

fs.writeFileSync('frontend/src/app/page.tsx', content, 'utf8');
