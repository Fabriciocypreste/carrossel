import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { CylinderSettings } from './types/carousel';
import { TMDBItem, fetchTrending } from './services/tmdb';
import { CylinderCarousel } from './components/CylinderCarousel';
import { TMDBDetailModal } from './components/TMDBDetailModal';

export default function App() {
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<TMDBItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Trigger to rotate cylinder to specific index smoothly
  const [targetTrigger, setTargetTrigger] = useState<{ index: number; timestamp: number } | null>(null);

  // Cylinder settings: auto-spin on by default, optimal radius and depth
  const [settings, setSettings] = useState<CylinderSettings>({
    radius: 540,
    tilt: -4,
    autoRotate: true,
    autoRotateSpeed: 0.16,
    soundEnabled: true,
    perspective: 1400,
    cardWidth: 260,
    cardHeight: 415,
  });

  // Load trending movies/shows on mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchTrending('week');
      if (data.length > 0) {
        setItems(data);
        setActiveCardIndex(0);
        setTargetTrigger({ index: 0, timestamp: performance.now() });
      } else {
        setErrorMessage('Nenhum resultado encontrado.');
      }
    } catch (err: any) {
      console.error('TMDB load error:', err);
      setErrorMessage('Não foi possível conectar ao TMDB.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keyboard navigation
  const handleNext = useCallback(() => {
    if (items.length === 0) return;
    const nextIdx = (activeCardIndex + 1) % items.length;
    setTargetTrigger({ index: nextIdx, timestamp: performance.now() });
    setActiveCardIndex(nextIdx);
  }, [activeCardIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (items.length === 0) return;
    const prevIdx = (activeCardIndex - 1 + items.length) % items.length;
    setTargetTrigger({ index: prevIdx, timestamp: performance.now() });
    setActiveCardIndex(prevIdx);
  }, [activeCardIndex, items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, autoRotate: !prev.autoRotate }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className="relative w-screen h-screen bg-black text-white overflow-hidden flex items-center justify-center select-none">
      {/* 3D Cylindrical Carousel: Fullscreen, no menus or controls */}
      {isLoading && items.length === 0 ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center max-w-md mx-4">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-sm text-white/80">{errorMessage}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <CylinderCarousel
          items={items}
          settings={settings}
          onSelectItem={(item) => setSelectedItem(item)}
          onActiveCardChange={(index) => setActiveCardIndex(index)}
          targetIndexTrigger={targetTrigger}
        />
      )}

      {/* TMDB Movie/Series Detail Modal (opens when clicking a poster) */}
      <TMDBDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onNavigateNext={() => {
          if (!selectedItem || items.length === 0) return;
          const currIdx = items.findIndex((i) => i.id === selectedItem.id);
          const nextIdx = (currIdx + 1) % items.length;
          setSelectedItem(items[nextIdx]);
          setActiveCardIndex(nextIdx);
          setTargetTrigger({ index: nextIdx, timestamp: performance.now() });
        }}
        onNavigatePrev={() => {
          if (!selectedItem || items.length === 0) return;
          const currIdx = items.findIndex((i) => i.id === selectedItem.id);
          const prevIdx = (currIdx - 1 + items.length) % items.length;
          setSelectedItem(items[prevIdx]);
          setActiveCardIndex(prevIdx);
          setTargetTrigger({ index: prevIdx, timestamp: performance.now() });
        }}
      />
    </div>
  );
}
