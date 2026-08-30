import re

with open('frontend/src/app/page.tsx', 'r') as f:
    text = f.read()

# Add FloatingIcons component before HeroMockup
floating_icons = """
function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:flex items-center justify-center z-[-1]">
      <motion.div 
        animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] bg-white p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
      >
        <BarChart3 className="w-10 h-10 text-mio-violet" />
      </motion.div>
      <motion.div 
        animate={{ y: [15, -15, 15], rotate: [5, -5, 5] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-[30%] right-[10%] bg-mio-lime p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
      >
        <TrendingUp className="w-10 h-10 text-gray-900" />
      </motion.div>
      <motion.div 
        animate={{ y: [-10, 10, -10], rotate: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        className="absolute bottom-[40%] left-[20%] bg-white p-4 border-4 border-[#111] shadow-[6px_6px_0px_#111] rounded-none"
      >
        <FileSpreadsheet className="w-10 h-10 text-blue-500" />
      </motion.div>
    </div>
  );
}

function HeroMockup() {
"""

text = text.replace('function HeroMockup() {', floating_icons)

# Add <FloatingIcons /> inside the hero section
hero_start = '<section className="relative pt-24 sm:pt-32 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">'
hero_replacement = '<section className="relative pt-24 sm:pt-32 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-visible">\n        <FloatingIcons />'

text = text.replace(hero_start, hero_replacement)

with open('frontend/src/app/page.tsx', 'w') as f:
    f.write(text)
