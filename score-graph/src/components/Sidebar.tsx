import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5">
        <div className="text-base font-semibold text-gray-400 mb-4">TOP PERFORMER</div>
        <div className="text-4xl font-bold text-green-400 mb-2" id="top-performer">GPT-5</div>
        <div className="text-sm text-gray-400">+$2,847.32 (2.32%)</div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5">
        <div className="text-base font-semibold text-white mb-4">MODEL RANKINGS</div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
          <span className="font-semibold text-green-400">GPT-5</span>
          <span className="text-white">+$5,240</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
          <span className="font-semibold text-green-400">Claude Sonnet 4.5</span>
          <span className="text-white">+$3,890</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
          <span className="font-semibold text-green-400">Gemini 2.5 Pro</span>
          <span className="text-white">+$2,420</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
          <span className="font-semibold text-green-400">DeepSeek Chat v3.1</span>
          <span className="text-white">+$1,890</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
          <span className="font-semibold text-green-400">Qwen3 Max</span>
          <span className="text-white">+$1,650</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800 last:border-b-0">
          <span className="font-semibold text-green-400">Grok 4</span>
          <span className="text-white">+$1,420</span>
        </div>
        <div className="flex justify-between items-center py-2 last:border-b-0">
          <span className="font-semibold text-green-400">BTC Buy & Hold</span>
          <span className="text-white">+$890</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
