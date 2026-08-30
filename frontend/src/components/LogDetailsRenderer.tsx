import React from 'react';

export default function LogDetailsRenderer({ log }: { log: any }) {
  // Remove known keys
  const { type, timestamp, id, ...metadata } = log;
  
  if (Object.keys(metadata).length === 0) return <span className="text-gray-400">-</span>;

  // Render a clean key-value grid for metadata
  return (
    <div className="bg-white border border-[#111] p-2 max-h-48 overflow-auto">
      <table className="w-full text-left text-xs">
        <tbody className="divide-y divide-gray-100">
          {Object.entries(metadata).map(([k, v]) => (
            <tr key={k}>
              <td className="py-1 pr-2 font-bold text-gray-700 align-top w-1/4 break-all">{k}</td>
              <td className="py-1 font-mono text-gray-600 align-top break-words">
                {typeof v === 'object' ? (
                  <pre className="text-[10px] whitespace-pre-wrap">{JSON.stringify(v, null, 2)}</pre>
                ) : (
                  String(v)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
