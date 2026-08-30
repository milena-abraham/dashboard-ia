import re

with open('frontend/src/app/page.tsx', 'r') as f:
    text = f.read()

old_h1 = r'Convertí planillas de datos en <br className="hidden md:block" />\s*<span className="text-transparent bg-clip-text bg-gradient-to-r from-mio-lime to-mio-violet py-2">\s*decisiones inteligentes\.\s*</span>'

new_h1 = 'Convertí planillas de datos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-mio-lime via-cyan-400 to-mio-violet py-1">decisiones inteligentes.</span>'

text = re.sub(old_h1, new_h1, text, flags=re.MULTILINE)

# Also adjust font size so it fits on one line
text = text.replace('className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black', 'className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black')

# And increase max-width slightly if needed (max-w-5xl is 1024px, enough for text-7xl)
# We will use max-w-6xl just in case
text = text.replace('max-w-5xl mx-auto leading-[1.1] sm:leading-[1.05]', 'max-w-6xl mx-auto leading-[1.1] sm:leading-[1.05] whitespace-normal md:whitespace-nowrap')

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(text)
