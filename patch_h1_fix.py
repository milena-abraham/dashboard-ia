with open('frontend/src/app/page.tsx', 'r') as f:
    text = f.read()

text = text.replace('whitespace-normal md:whitespace-nowrap', '')
text = text.replace('className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl', 'className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl')

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(text)
