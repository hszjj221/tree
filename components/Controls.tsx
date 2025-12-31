import React from 'react';
import { TreeSettings, LightColorMode } from '../types';
import { Snowflake, Lightbulb, Palette } from 'lucide-react';

interface ControlsProps {
  settings: TreeSettings;
  updateSetting: <K extends keyof TreeSettings>(key: K, value: TreeSettings[K]) => void;
}

const Controls: React.FC<ControlsProps> = ({ settings, updateSetting }) => {
  const cycleColorMode = () => {
    const modes: LightColorMode[] = [
      LightColorMode.MultiColor,
      LightColorMode.WarmWhite,
      LightColorMode.BlueIce
    ];
    const currentIndex = modes.indexOf(settings.colorMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateSetting('colorMode', nextMode);
  };

  const getColorModeLabel = (mode: LightColorMode): string => {
    switch (mode) {
      case LightColorMode.WarmWhite:
        return '暖白';
      case LightColorMode.BlueIce:
        return '冰蓝';
      case LightColorMode.MultiColor:
      default:
        return '多彩';
    }
  };

  const getColorModeColor = (mode: LightColorMode): string => {
    switch (mode) {
      case LightColorMode.WarmWhite:
        return 'text-amber-300';
      case LightColorMode.BlueIce:
        return 'text-cyan-300';
      case LightColorMode.MultiColor:
      default:
        return 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-green-400 to-blue-400';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* Color Mode Cycle Button */}
      <button
        onClick={cycleColorMode}
        disabled={!settings.lightsOn}
        className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 border border-white/20 backdrop-blur-md shadow-lg ${
          settings.lightsOn
            ? 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
            : 'bg-black/40 text-gray-500 cursor-not-allowed'
        }`}
        title="切换灯光颜色"
        aria-label={`切换灯光颜色，当前模式：${getColorModeLabel(settings.colorMode)}`}
      >
        <Palette size={20} />
        <span className={`text-sm font-medium ${getColorModeColor(settings.colorMode)}`}>
          {getColorModeLabel(settings.colorMode)}
        </span>
      </button>

      {/* Lights Toggle */}
      <button
        onClick={() => updateSetting('lightsOn', !settings.lightsOn)}
        className={`p-3 rounded-full transition-all duration-300 border border-white/20 backdrop-blur-md shadow-lg ${
          settings.lightsOn
            ? 'bg-amber-500/80 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]'
            : 'bg-black/40 text-gray-400 hover:bg-black/60 active:scale-95'
        }`}
        title="开关灯光"
        aria-label={settings.lightsOn ? '关闭灯光' : '开启灯光'}
      >
        <Lightbulb size={24} />
      </button>

      {/* Snow Toggle */}
      <button
        onClick={() => updateSetting('snowEnabled', !settings.snowEnabled)}
        className={`p-3 rounded-full transition-all duration-300 border border-white/20 backdrop-blur-md shadow-lg ${
          settings.snowEnabled
            ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
            : 'bg-black/40 text-gray-400 hover:bg-black/60 active:scale-95'
        }`}
        title="开关雪花"
        aria-label={settings.snowEnabled ? '关闭雪花' : '开启雪花'}
      >
        <Snowflake size={24} className={settings.snowEnabled ? 'animate-[spin_3s_linear_infinite]' : ''} />
      </button>
    </div>
  );
};

export default Controls;
