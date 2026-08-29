const fs = require('fs');

let content = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");

content = content.replace(
    "import InsightPanel from '@/components/InsightPanel';",
    "import InsightPanel from '@/components/InsightPanel';\nimport DataChatbot from '@/components/DataChatbot';"
);

content = content.replace(/figJson=\{c\.fig_json\}/g, "chartData={c.chart_data}");
content = content.replace(/figJson=\{result\.forecast\?\.fig_json\}/g, "chartData={result.forecast?.chart_data}");
content = content.replace(/figJson=\{result\.segmentation\?\.scatter_json\}/g, "chartData={result.segmentation?.scatter_data}");
content = content.replace(/figJson=\{result\.segmentation\?\.profile_json\}/g, "chartData={result.segmentation?.radar_data}");
content = content.replace(/figJson=\{result\.anomalies\?\.fig_json\}/g, "chartData={result.anomalies?.chart_data}");
content = content.replace(/figJson=\{result\.feature_importance\?\.fig_json\}/g, "chartData={result.feature_importance?.chart_importance}");
content = content.replace(/figJson=\{result\.feature_importance\?\.shap_json\}/g, "chartData={result.feature_importance?.chart_shap}");

content = content.replace("import { BarChart3,", "import { BarChart3, Bot,");

const tabsRegex = /const tabs = \[([\s\S]*?)\];/;
const match = content.match(tabsRegex);
if (match) {
    let newTabs = match[0].replace("];", "  { id: 'chat', label: 'Asistente IA', icon: Bot },\n];");
    content = content.replace(match[0], newTabs);
}

const chatPanel = `
              {/* Tab 6: Asistente IA */}
              {activeTab === 6 && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <DataChatbot context={result} />
                </div>
              )}`;

content = content.replace(
    `              {/* Tab 5: Informe IA */}
              {activeTab === 5 && (
                <InsightPanel
                  text={result.narrative?.text || 'Generando informe...'}
                  source={result.narrative?.source}
                />
              )}
            </div>
          </div>`,
    `              {/* Tab 5: Informe IA */}
              {activeTab === 5 && (
                <InsightPanel
                  text={result.narrative?.text || 'Generando informe...'}
                  source={result.narrative?.source}
                />
              )}
${chatPanel}
            </div>
          </div>`
);

fs.writeFileSync("src/app/dashboard/page.tsx", content);
