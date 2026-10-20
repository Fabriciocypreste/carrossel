import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CylinderSettings } from '../types/carousel';
import { TMDBItem } from '../services/tmdb';
import { CylinderCard } from './CylinderCard';
import {
  getClosestCardIndex,
  getTargetRotationForCard,
  applyInertia,
} from '../utils/cylinderMath';
import { playTickSound, playSelectSound } from '../utils/audioFx';

interface CylinderCarouselProps {
  items: TMDBItem[];
  settings: CylinderSettings;
  onSelectItem: (item: TMDBItem) => void;
  onActiveCardChange?: (index: number) => void;
  targetIndexTrigger?: { index: number; timestamp: number } | null;
}

export const CylinderCarousel: React.FC<CylinderCarouselProps> = ({
  items,
  settings,
  onSelectItem,
  onActiveCardChange,
  targetIndexTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Viewport responsive state
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Compute responsive card dimensions & effective radius
  const effectiveRadius = isMobile ? 270 : settings.radius;
  const effectiveCardWidth = isMobile ? 190 : 270;
  const effectiveCardHeight = isMobile ? 305 : 430;
  
  // Continuous rotation angle in degrees
  const [rotationY, setRotationY] = useState(0);
  
  // Track physics and animation in refs for 60fps performance
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartRotationRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const lastIndexRef = useRef(0);

  // Smooth target animation state (e.g. when clicking card or next/prev)
  const isAnimatingToTargetRef = useRef(false);
  const targetRotationRef = useRef<number | null>(null);

  // Sync ref with state
  useEffect(() => {
    rotationRef.current = rotationY;
  }, [rotationY]);

  // Handle external navigation triggers (e.g., from prev/next HUD buttons)
  useEffect(() => {
    if (targetIndexTrigger && items.length > 0) {
      const targetRotation = getTargetRotationForCard(
        targetIndexTrigger.index,
        items.length,
        rotationRef.current
      );
      targetRotationRef.current = targetRotation;
      isAnimatingToTargetRef.current = true;
      velocityRef.current = 0;
    }
  }, [targetIndexTrigger, items.length]);

  // Reset rotation when items list change substantially
  useEffect(() => {
    lastIndexRef.current = 0;
  }, [items]);

  // Main animation / physics RAF loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      let current = rotationRef.current;
      let hasChanged = false;

      // 1. Target interpolation (smooth snap to specific card)
      if (isAnimatingToTargetRef.current && targetRotationRef.current !== null) {
        const delta = targetRotationRef.current - current;
        if (Math.abs(delta) < 0.05) {
          current = targetRotationRef.current;
          isAnimatingToTargetRef.current = false;
          targetRotationRef.current = null;
        } else {
          current += delta * 0.12;
        }
        hasChanged = true;
      }
      // 2. Drag inertia physics
      else if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.001) {
        const { newVelocity, isStopped } = applyInertia(velocityRef.current, 0.94, 0.01);
        current += velocityRef.current;
        velocityRef.current = isStopped ? 0 : newVelocity;
        hasChanged = true;
      }
      // 3. Ambient auto-rotation when idle
      else if (!isDraggingRef.current && settings.autoRotate && velocityRef.current === 0) {
        current -= settings.autoRotateSpeed;
        hasChanged = true;
      }

      if (hasChanged) {
        rotationRef.current = current;
        setRotationY(current);

        // Check if active front index changed
        if (items.length > 0) {
          const closestIndex = getClosestCardIndex(current, items.length);
          if (closestIndex !== lastIndexRef.current) {
            lastIndexRef.current = closestIndex;
            if (settings.soundEnabled) {
              playTickSound(1.0 + (closestIndex % 4) * 0.1);
            }
            onActiveCardChange?.(closestIndex);
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [settings.autoRotate, settings.autoRotateSpeed, settings.soundEnabled, items.length, onActiveCardChange]);

  const hasDraggedRef = useRef(false);

  // Drag Gesture Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    isAnimatingToTargetRef.current = false;
    targetRotationRef.current = null;
    velocityRef.current = 0;

    dragStartXRef.current = e.clientX;
    dragStartRotationRef.current = rotationRef.current;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const currentX = e.clientX;
    const totalDeltaX = currentX - dragStartXRef.current;

    // Only capture pointer and register drag if user moved past 5px threshold
    if (!hasDraggedRef.current) {
      if (Math.abs(totalDeltaX) > 5) {
        hasDraggedRef.current = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      } else {
        return;
      }
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastPointerTimeRef.current);
    const dx = currentX - lastPointerXRef.current;

    const angularSensitivity = 0.28;
    const newRotation = dragStartRotationRef.current + totalDeltaX * angularSensitivity;

    velocityRef.current = (dx / dt) * 3.5;

    lastPointerXRef.current = currentX;
    lastPointerTimeRef.current = now;

    rotationRef.current = newRotation;
    setRotationY(newRotation);

    if (items.length > 0) {
      const closestIndex = getClosestCardIndex(newRotation, items.length);
      if (closestIndex !== lastIndexRef.current) {
        lastIndexRef.current = closestIndex;
        if (settings.soundEnabled) {
          playTickSound(1.0);
        }
        onActiveCardChange?.(closestIndex);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (hasDraggedRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    isAnimatingToTargetRef.current = false;
    targetRotationRef.current = null;
    
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const rotDelta = delta * 0.15;
    
    velocityRef.current = -rotDelta * 0.2;
    const nextRot = rotationRef.current - rotDelta;
    rotationRef.current = nextRot;
    setRotationY(nextRot);
  };

  const handleCardClick = useCallback((index: number) => {
    if (items.length === 0) return;
    const target = getTargetRotationForCard(index, items.length, rotationRef.current);
    targetRotationRef.current = target;
    isAnimatingToTargetRef.current = true;
    velocityRef.current = 0;
  }, [items.length]);

  const handleOpenDetails = useCallback((item: TMDBItem) => {
    if (settings.soundEnabled) {
      playSelectSound();
    }
    onSelectItem(item);
  }, [settings.soundEnabled, onSelectItem]);

  const activeFrontIndex = items.length > 0 ? getClosestCardIndex(rotationY, items.length) : 0;
  const activeItem = items[activeFrontIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
    >
      {/* 3D Perspective Stage */}
      <div
        className="relative w-full h-full flex items-center justify-center perspective-cylinder"
        style={{
          perspective: `${isMobile ? Math.max(900, settings.perspective - 300) : settings.perspective}px`,
        }}
      >
        {/* The 3D Cylinder Container */}
        <div
          className="relative w-0 h-0 preserve-3d"
          style={{
            transform: `rotateX(${settings.tilt}deg) rotateY(${rotationY}deg)`,
            transition: isDraggingRef.current ? 'none' : 'transform 0.05s linear',
          }}
        >
          {items.map((item, i) => {
            const isFront = i === activeFrontIndex;
            return (
              <CylinderCard
                key={`${item.mediaType}-${item.id}-${i}`}
                item={item}
                index={i}
                totalCards={items.length}
                rotationY={rotationY}
                radius={effectiveRadius}
                cardWidth={effectiveCardWidth}
                cardHeight={effectiveCardHeight}
                isFront={isFront}
                onCardClick={handleCardClick}
                onOpenDetails={handleOpenDetails}
              />
            );
          })}
        </div>
      </div>

      {/* Subtle floor reflection vignette / shadow */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050507] via-[#050507]/60 to-transparent pointer-events-none" />
    </div>
  );
};
