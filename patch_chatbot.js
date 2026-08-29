const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/DataChatbot.tsx', 'utf8');

// Add import
content = content.replace(
    "import { Send, Bot, User, Loader2 } from 'lucide-react';",
    "import { Send, Bot, User, Loader2 } from 'lucide-react';\nimport ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';"
);

// Replace message rendering
content = content.replace(
    /<p className="text-sm leading-relaxed whitespace-pre-wrap">\{msg\.content\}<\/p>/g,
    `<div className="text-sm leading-relaxed whitespace-pre-wrap markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>`
);

fs.writeFileSync('frontend/src/components/DataChatbot.tsx', content, 'utf8');
