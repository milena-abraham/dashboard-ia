const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/InsightPanel.tsx', 'utf8');

content = content.replace(
    "import { Sparkles, Cpu, CheckCircle2 } from 'lucide-react';",
    "import { Sparkles, Cpu, CheckCircle2 } from 'lucide-react';\nimport ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';"
);

content = content.replace(
    /<div className="prose prose-indigo max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">\s*\{text\}\s*<\/div>/g,
    `<div className="text-gray-700 text-sm leading-relaxed font-sans markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      </div>`
);

fs.writeFileSync('frontend/src/components/InsightPanel.tsx', content, 'utf8');
