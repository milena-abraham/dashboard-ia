import re

with open('frontend/src/app/page.tsx', 'r') as f:
    text = f.read()

# Replace the gradient span with two separate colored spans
old_span = r'<span className="text-transparent bg-clip-text bg-gradient-to-r from-mio-lime from-48% to-mio-violet to-52% py-1">decisiones inteligentes\.</span>'
new_spans = '<span className="text-mio-lime">decisiones</span> <span className="text-mio-violet">inteligentes.</span>'

text = re.sub(old_span, new_spans, text)

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(text)
