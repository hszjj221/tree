import React, { useState } from 'react';
import Snow from './components/Snow';
import Tree from './components/Tree';
import Controls from './components/Controls';
import GestureController from './components/GestureController';
import { TreeSettings, LightColorMode } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<TreeSettings>({
    lightsOn: true,
    colorMode: LightColorMode.MultiColor,
    snowEnabled: true,
  });

  const updateSetting = <K extends keyof TreeSettings>(key: K, value: TreeSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  
  const setSnowEnabled = (enabled: boolean) => {
    setSettings(prev => {
        if (prev.snowEnabled === enabled) return prev;
        return { ...prev, snowEnabled: enabled };
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050A19] flex flex-col items-center justify-end pb-10">
      
      {/* 
         ATMOSPHERE LAYERS 
         Matches the reference: Dark blue starry night with a top-down blue spotlight/rays 
      */}
      
      {/* 1. Base Gradient - Deep Blue/Black */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020510] via-[#081229] to-[#0a1630] pointer-events-none"></div>

      {/* 2. God Rays / Spotlight from top center */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-60"
        style={{
            background: 'conic-gradient(from 180deg at 50% -10%, transparent 40%, rgba(50, 100, 255, 0.1) 45%, rgba(100, 150, 255, 0.2) 50%, rgba(50, 100, 255, 0.1) 55%, transparent 60%)',
            filter: 'blur(40px)',
        }}
      ></div>
      
      {/* 3. Central Glow behind tree */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 4. Falling Stars / Static Background Stars */}
      <div className="absolute inset-0 pointer-events-none opacity-40" 
           style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>


      {settings.snowEnabled && <Snow />}

      <div className="z-10 w-full px-4 relative">
        <Tree 
            lightsOn={settings.lightsOn} 
            colorMode={settings.colorMode}
        />
      </div>
      
      {/* Gesture Control for Snow */}
      <GestureController 
        isSnowEnabled={settings.snowEnabled} 
        setSnowEnabled={setSnowEnabled} 
      />

      <Controls settings={settings} updateSetting={updateSetting} />
      
    </div>
  );
};

export default App;