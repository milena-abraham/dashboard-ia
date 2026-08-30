import re

with open('frontend/src/app/page.tsx', 'r') as f:
    text = f.read()

# Replace the cyan gradient with a sharp transition
text = text.replace(
    'bg-gradient-to-r from-mio-lime via-cyan-400 to-mio-violet', 
    'bg-gradient-to-r from-mio-lime from-40% to-mio-violet to-60%'
)

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(text)
