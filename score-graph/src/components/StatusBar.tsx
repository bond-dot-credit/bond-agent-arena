import React from 'react';

const StatusBar: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 flex justify-between items-center text-sm text-gray-400">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span>STATUS: CONNECTED TO SERVER</span>
      </div>
      <div>Last updated: <span id="last-updated">Just now</span></div>
    </div>
  );
};

export default StatusBar;
