import React from 'react';
import { TreeSettings } from '../types';
import { Snowflake } from 'lucide-react';

interface ControlsProps {
  settings: TreeSettings;
  updateSetting: <K extends keyof TreeSettings>(key: K, value: TreeSettings[K]) => void;
}

const Controls: React.FC<ControlsProps> = ({ settings, updateSetting }) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      
      {/* Snow Toggle */}
      <button
        onClick={() => updateSetting('snowEnabled', !settings.snowEnabled)}
        className={`p-3 rounded-full transition-all duration-300 border border-white/20 backdrop-blur-md shadow-lg ${
          settings.snowEnabled 
            ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
            : 'bg-black/40 text-gray-400 hover:bg-black/60'
        }`}
        title="Toggle Snow"
      >
        <Snowflake size={24} className={settings.snowEnabled ? 'animate-[spin_3s_linear_infinite]' : ''} />
      </button>

    </div>
  );
};

export default Controls;