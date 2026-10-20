/**
 * Pure 3D cylinder calculations for carousel positioning,
 * angles, inertia, and depth of field properties.
 */

export interface Card3DMetrics {
  index: number;
  baseAngle: number;
  effectiveAngle: number;
  normalizedAngle: number; // in [-180, 180]
  isFrontFacing: boolean;
  distanceFromFront: number; // 0 (front) to 180 (back)
  depthRatio: number; // 1 (front) to 0 (back)
  opacity: number;
  scale: number;
  zIndex: number;
  blurPx: number;
}

/**
 * Normalizes an angle into the [-180, 180) range.
 */
export function normalizeAngle180(deg: number): number {
  let angle = deg % 360;
  if (angle > 180) angle -= 360;
  if (angle <= -180) angle += 360;
  return angle;
}

/**
 * Normalizes an angle into the [0, 360) range.
 */
export function normalizeAngle360(deg: number): number {
  const mod = deg % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * Finds the card index currently closest to the front view (center).
 */
export function getClosestCardIndex(rotationY: number, totalCards: number): number {
  if (totalCards <= 0) return 0;
  const step = 360 / totalCards;
  // Card index i is at angle i * step. When rotation is R, its position is i * step + R.
  // We want (i * step + R) closest to 0 (or multiple of 360).
  // i * step = -R => i = -R / step
  const rawIndex = Math.round((-rotationY) / step);
  const normalizedIndex = ((rawIndex % totalCards) + totalCards) % totalCards;
  return normalizedIndex;
}

/**
 * Calculates the shortest-path target rotation angle to bring a specific card to center.
 */
export function getTargetRotationForCard(targetIndex: number, totalCards: number, currentRotation: number): number {
  if (totalCards <= 0) return currentRotation;
  const step = 360 / totalCards;
  const targetBaseAngle = -targetIndex * step;
  
  // Find shortest angular distance from currentRotation to targetBaseAngle + k * 360
  const diff = normalizeAngle180(targetBaseAngle - currentRotation);
  return currentRotation + diff;
}

/**
 * Computes depth metrics for a specific card in the cylinder.
 */
export function getCardMetrics(index: number, totalCards: number, rotationY: number): Card3DMetrics {
  const step = totalCards > 0 ? 360 / totalCards : 0;
  const baseAngle = index * step;
  const totalAngle = baseAngle + rotationY;
  const normalizedAngle = normalizeAngle180(totalAngle);
  const distanceFromFront = Math.abs(normalizedAngle); // 0 to 180
  
  // 1 when front (0 deg), 0 when back (180 deg)
  const depthRatio = 1 - (distanceFromFront / 180);
  
  const isFrontFacing = distanceFromFront < 90;
  
  // Opacity: front cards are 1.0, cards facing back are partially translucent (~0.4 - 0.7)
  const opacity = Math.max(0.35, Math.min(1.0, 0.4 + 0.6 * depthRatio));
  
  // Scale factor: front cards slightly emphasized
  const scale = 0.88 + 0.12 * depthRatio;
  
  // zIndex: higher for front cards
  const zIndex = Math.round(depthRatio * 100);
  
  // Depth of field blur: 0px at front, subtle blur in back
  const blurPx = distanceFromFront > 110 ? Math.min(3, (distanceFromFront - 110) * 0.05) : 0;

  return {
    index,
    baseAngle,
    effectiveAngle: normalizeAngle360(totalAngle),
    normalizedAngle,
    isFrontFacing,
    distanceFromFront,
    depthRatio,
    opacity,
    scale,
    zIndex,
    blurPx,
  };
}

/**
 * Applies deceleration friction to velocity.
 */
export function applyInertia(velocity: number, friction: number = 0.93, minThreshold: number = 0.005): {
  newVelocity: number;
  isStopped: boolean;
} {
  const newVelocity = velocity * friction;
  if (Math.abs(newVelocity) < minThreshold) {
    return { newVelocity: 0, isStopped: true };
  }
  return { newVelocity, isStopped: false };
}
