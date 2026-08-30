import re

with open('frontend/src/app/page.tsx', 'r') as f:
    text = f.read()

# Replace the solid spans with an inline-style gradient span
old_spans = r'<span className="text-mio-lime">decisiones</span> <span className="text-mio-violet">inteligentes\.</span>'

# We use inline styles to guarantee the exact 10% fade in CSS
new_span = '<span style={{ backgroundImage: "linear-gradient(to right, #bdf559 45%, #815ae1 55%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>decisiones inteligentes.</span>'

text = re.sub(old_spans, new_span, text)

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(text)
