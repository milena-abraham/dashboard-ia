import re

with open('frontend/src/app/dashboard/page.tsx', 'r') as f:
    text = f.read()

text = text.replace("  Download,", "  Download,\n  Presentation,")

with open('frontend/src/app/dashboard/page.tsx', 'w') as f:
    f.write(text)
