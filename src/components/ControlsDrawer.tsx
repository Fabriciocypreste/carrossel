import React from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Sliders,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { CylinderSettings } from '../types/carousel';

export interface TMDBCategory {
  id: string;
  label: string;
  icon?: string;
}

interface ControlsDrawerProps {
  settings: CylinderSettings;
  onUpdateSettings: (newSettings: Partial<CylinderSettings>) => void;
  onPrev: () => void;
  onNext: () => void;
  onSnapCenter: () => void;
  onOpenCurrentDetails?: () => void;
  isOpenSettings: boolean;
  onToggleSettings: () => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  categories: TMDBCategory[];
  currentTitle: string;
  currentIndex: number;
  totalCards: number;
  isLoading: boolean;
}

export const ControlsDrawer: React.FC<ControlsDrawerProps> = ({
  settings,
  onUpdateSettings,
  onPrev,
  onNext,
  onSnapCenter,
  onOpenCurrentDetails,
  isOpenSettings,
  onToggleSettings,
  activeCategory,
  onSelectCategory,
  categories,
  currentTitle,
  currentIndex,
  totalCards,
  isLoading,
}) => {
  return (
    <aside aria-label="Controles do Carrossel" className="fixed bottom-0 inset-x-0 z-30 pointer-events-none pb-4 px-4 flex flex-col items-center">
      {/* Category Pills Navigation */}
      <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-white/15 shadow-2xl mb-3 max-w-full overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              disabled={isLoading}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Glass Control HUD bar */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-4 px-4 py-2.5 rounded-2xl bg-[#0d0f14]/85 backdrop-blur-2xl border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
          title="Card Anterior (Seta Esquerda)"
          aria-label="Item anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Play / Pause Auto-spin */}
        <button
          onClick={() => onUpdateSettings({ autoRotate: !settings.autoRotate })}
          className={`p-2 rounded-xl transition-all cursor-pointer border ${
            settings.autoRotate
              ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
              : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/15 hover:text-white'
          }`}
          title={settings.autoRotate ? 'Pausar Rotação (Espaço)' : 'Iniciar Auto Rotação (Espaço)'}
          aria-label={settings.autoRotate ? 'Pausar auto-spin' : 'Retomar auto-spin'}
        >
          {settings.autoRotate ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
          title="Próximo Card (Seta Direita)"
          aria-label="Próximo item"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/15" />

        {/* Current Active Indicator */}
        <div className="hidden sm:flex flex-col items-center px-2">
          <span className="text-[11px] text-white/50 uppercase tracking-widest font-mono">
            {totalCards > 0 ? `${currentIndex + 1} / ${totalCards}` : '0 / 0'}
          </span>
          <span className="text-xs font-bold text-white truncate max-w-[130px]">
            {currentTitle || 'Carregando...'}
          </span>
        </div>

        {/* View Details button in HUD */}
        {onOpenCurrentDetails && (
          <button
            onClick={onOpenCurrentDetails}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 flex items-center gap-1.5"
            title="Ver Detalhes do Filme/Série"
            aria-label="Ver detalhes do título"
          >
            <Play className="w-4 h-4 fill-current text-red-400" />
            <span className="text-xs font-semibold hidden md:inline">Detalhes</span>
          </button>
        )}

        <div className="hidden sm:block w-px h-6 bg-white/15" />

        {/* Snap to Center button */}
        <button
          onClick={onSnapCenter}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all cursor-pointer border border-white/10"
          title="Centralizar Card Atual"
          aria-label="Centralizar item"
        >
          <Compass className="w-5 h-5" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
          className={`p-2 rounded-xl transition-all cursor-pointer border ${
            settings.soundEnabled
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
          }`}
          title={settings.soundEnabled ? 'Silenciar Efeitos Sonoros' : 'Ativar Efeitos Sonoros'}
          aria-label={settings.soundEnabled ? 'Silenciar som' : 'Ativar som'}
        >
          {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onToggleSettings}
          className={`p-2 rounded-xl transition-all cursor-pointer border ${
            isOpenSettings
              ? 'bg-white text-black border-white shadow-lg'
              : 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border-white/10'
          }`}
          title="Ajustar Parâmetros 3D do Cilindro"
          aria-label="Ajustar 3D"
        >
          <Sliders className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Modal Drawer */}
      {isOpenSettings && (
        <div className="pointer-events-auto mt-3 p-5 rounded-3xl bg-[#0c0d12]/95 backdrop-blur-2xl border border-white/15 shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Parâmetros 3D do Cilindro</h3>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  radius: 540,
                  tilt: -4,
                  autoRotateSpeed: 0.15,
                  perspective: 1400,
                })
              }
              className="text-xs text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Restaurar padrões recomendados"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Cylinder Radius */}
            <div>
              <div className="flex justify-between text-white/80 mb-1.5">
                <span>Raio do Cilindro (Profundidade)</span>
                <span className="font-mono text-white">{settings.radius}px</span>
              </div>
              <input
                type="range"
                min="400"
                max="850"
                step="10"
                value={settings.radius}
                onChange={(e) => onUpdateSettings({ radius: Number(e.target.value) })}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-0.5">
                <span>Compacto (400px)</span>
                <span>Arco Aberto (850px)</span>
              </div>
            </div>

            {/* Tilt Angle */}
            <div>
              <div className="flex justify-between text-white/80 mb-1.5">
                <span>Ângulo de Inclinação da Câmera</span>
                <span className="font-mono text-white">{settings.tilt}°</span>
              </div>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={settings.tilt}
                onChange={(e) => onUpdateSettings({ tilt: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-0.5">
                <span>Visão de Baixo (-20°)</span>
                <span>Alinhado (0°)</span>
                <span>Visão Aérea (+20°)</span>
              </div>
            </div>

            {/* Auto-spin Speed */}
            <div>
              <div className="flex justify-between text-white/80 mb-1.5">
                <span>Velocidade de Auto-Rotação</span>
                <span className="font-mono text-white">{settings.autoRotateSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={settings.autoRotateSpeed}
                onChange={(e) => onUpdateSettings({ autoRotateSpeed: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Perspective */}
            <div>
              <div className="flex justify-between text-white/80 mb-1.5">
                <span>Campo de Visão (Perspectiva)</span>
                <span className="font-mono text-white">{settings.perspective}px</span>
              </div>
              <input
                type="range"
                min="900"
                max="2200"
                step="50"
                value={settings.perspective}
                onChange={(e) => onUpdateSettings({ perspective: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
