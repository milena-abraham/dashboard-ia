import re

with open('frontend/src/app/page.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    'bg-gradient-to-r from-mio-lime from-40% to-mio-violet to-60%', 
    'bg-gradient-to-r from-mio-lime from-48% to-mio-violet to-52%'
)

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(text)
