import React from 'react';
import { TMDBItem } from '../services/tmdb';
import { getCardMetrics } from '../utils/cylinderMath';

interface CylinderCardProps {
  item: TMDBItem;
  index: number;
  totalCards: number;
  rotationY: number;
  radius: number;
  cardWidth: number;
  cardHeight: number;
  isFront: boolean;
  onCardClick: (index: number, item: TMDBItem) => void;
  onOpenDetails: (item: TMDBItem) => void;
}

export const CylinderCard: React.FC<CylinderCardProps> = ({
  item,
  index,
  totalCards,
  rotationY,
  radius,
  cardWidth,
  cardHeight,
  isFront,
  onCardClick,
  onOpenDetails,
}) => {
  const step = 360 / totalCards;
  const baseAngle = index * step;
  const metrics = getCardMetrics(index, totalCards, rotationY);

  // 3D cylindrical transform: rotateY around cylinder axis, push out by radius
  const transform = `rotateY(${baseAngle}deg) translateZ(${radius}px)`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFront) {
      onOpenDetails(item);
    } else {
      onCardClick(index, item);
    }
  };

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none cursor-pointer group"
      style={{
        transform,
        zIndex: metrics.zIndex,
        opacity: metrics.opacity,
        filter: metrics.blurPx > 0 ? `blur(${metrics.blurPx.toFixed(1)}px)` : 'none',
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        transformStyle: 'preserve-3d',
        transition: 'opacity 0.2s ease-out, filter 0.2s ease-out',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${item.title} (${item.releaseYear}). Clique para ${isFront ? 'ver detalhes' : 'centralizar'}.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Front Face: ONLY the clean vertical poster without text, glow, or overlays */}
      <div
        className={`relative w-full h-full rounded-[22px] md:rounded-[26px] overflow-hidden transition-all duration-300 ease-out bg-[#0c0d12] ${
          isFront
            ? 'scale-[1.03] shadow-[0_20px_45px_rgba(0,0,0,0.95)] ring-1 ring-white/20'
            : 'shadow-[0_10px_30px_rgba(0,0,0,0.85)] ring-1 ring-white/5 hover:ring-white/20 hover:scale-[1.01]'
        }`}
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)',
        }}
      >
        {/* Pure Vertical Movie Poster */}
        <img
          src={item.posterUrl}
          alt={item.title}
          className="w-full h-full object-cover object-center pointer-events-none rounded-[22px] md:rounded-[26px]"
          loading="eager"
        />

        {/* Minimal border stroke for clean edge definition (no glow) */}
        <div className="absolute inset-0 rounded-[22px] md:rounded-[26px] border border-white/10 pointer-events-none" />
      </div>

      {/* Back Face: Clean dark matte backing seen from behind the cylinder (no text, no glow) */}
      <div
        className="absolute inset-0 rounded-[22px] md:rounded-[26px] overflow-hidden border border-white/10 bg-[#0a0b10] shadow-[0_10px_30px_rgba(0,0,0,0.9)]"
        style={{
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Subtle dark texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#141620] to-[#08090d]" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-16 rounded-lg border border-white/10 opacity-30 flex items-center justify-center">
            <span className="w-4 h-4 rounded-full border border-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
};
