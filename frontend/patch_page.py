import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Add DataChatbot import
content = content.replace(
    "import InsightPanel from '@/components/InsightPanel';",
    "import InsightPanel from '@/components/InsightPanel';\nimport DataChatbot from '@/components/DataChatbot';"
)

# Update chart properties (figJson -> chartData)
content = content.replace("figJson={c.fig_json}", "chartData={c.chart_data}")
content = content.replace("figJson={result.forecast?.fig_json}", "chartData={result.forecast?.chart_data}")
content = content.replace("figJson={result.segmentation?.scatter_json}", "chartData={result.segmentation?.scatter_data}")
content = content.replace("figJson={result.segmentation?.profile_json}", "chartData={result.segmentation?.radar_data}")
content = content.replace("figJson={result.anomalies?.fig_json}", "chartData={result.anomalies?.chart_data}")
content = content.replace("figJson={result.feature_importance?.fig_json}", "chartData={result.feature_importance?.chart_importance}")
content = content.replace("figJson={result.feature_importance?.shap_json}", "chartData={result.feature_importance?.chart_shap}")

# Add Chat tab
tabs_match = re.search(r'const tabs = \[.*?\];', content, re.DOTALL)
if tabs_match:
    tabs_text = tabs_match.group(0)
    # Add Bot icon to imports
    if "import { BarChart3," in content:
        content = content.replace("import { BarChart3,", "import { BarChart3, Bot,")
    
    # Add tab to array
    new_tabs = tabs_text.replace("];", "  { id: 'chat', label: 'Asistente IA', icon: Bot },\n];")
    content = content.replace(tabs_text, new_tabs)

# Add chat panel
chat_panel = """
              {/* Tab 6: Asistente IA */}
              {activeTab === 6 && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <DataChatbot context={result} />
                </div>
              )}
"""

content = content.replace("            </div>\n          </div>", f"              {{/* Tab 5: Informe IA */}}\n              {{activeTab === 5 && (\n                <InsightPanel\n                  text={{result.narrative?.text || 'Generando informe...'}}\n                  source={{result.narrative?.source}}\n                />\n              )}}\n{chat_panel}            </div>\n          </div>")

# Remove duplicate Tab 5 if I accidentally created it
content = re.sub(r'\{\/\* Tab 5: Informe IA \*\/}.*?\{\/\* Tab 5: Informe IA \*\/}', '{/* Tab 5: Informe IA */}', content, flags=re.DOTALL)


with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
