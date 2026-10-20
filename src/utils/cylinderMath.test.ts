import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAngle180,
  normalizeAngle360,
  getClosestCardIndex,
  getTargetRotationForCard,
  getCardMetrics,
  applyInertia,
} from './cylinderMath.ts';

test('normalizeAngle180 normalizes angles within [-180, 180]', () => {
  assert.equal(normalizeAngle180(0), 0);
  assert.equal(normalizeAngle180(360), 0);
  assert.equal(normalizeAngle180(90), 90);
  assert.equal(normalizeAngle180(270), -90);
  assert.equal(normalizeAngle180(-270), 90);
  assert.equal(normalizeAngle180(180), 180);
  assert.equal(normalizeAngle180(-180), 180); // -180 % 360 is -180, + 360 = 180
});

test('normalizeAngle360 wraps angles within [0, 360)', () => {
  assert.equal(normalizeAngle360(0), 0);
  assert.equal(normalizeAngle360(360), 0);
  assert.equal(normalizeAngle360(450), 90);
  assert.equal(normalizeAngle360(-90), 270);
});

test('getClosestCardIndex identifies the card at the center front', () => {
  const totalCards = 8; // steps of 45 degrees
  // index 0 is at 0
  assert.equal(getClosestCardIndex(0, totalCards), 0);
  
  // Rotating cylinder by -45 brings card 1 to front
  assert.equal(getClosestCardIndex(-45, totalCards), 1);
  
  // Rotating cylinder by -90 brings card 2 to front
  assert.equal(getClosestCardIndex(-90, totalCards), 2);
  
  // Rotating cylinder by +45 brings card 7 (last card) to front
  assert.equal(getClosestCardIndex(45, totalCards), 7);
});

test('getTargetRotationForCard computes shortest path angular distance', () => {
  const totalCards = 6; // steps of 60 degrees: 0, 60, 120, 180, 240, 300
  // Card 1 is at 60deg. To center it, cylinder rotation should be -60deg.
  const targetFor1 = getTargetRotationForCard(1, totalCards, 0);
  assert.equal(targetFor1, -60);

  // When currently at 350deg (-10deg), targeting card 0 should be 360 or 0
  const targetFor0 = getTargetRotationForCard(0, totalCards, 350);
  assert.equal(targetFor0, 360);
});

test('getCardMetrics computes correct depth, zIndex, and front-facing state', () => {
  const total = 4; // 0, 90, 180, 270
  const frontCard = getCardMetrics(0, total, 0);
  assert.equal(frontCard.isFrontFacing, true);
  assert.equal(frontCard.depthRatio, 1);
  assert.equal(frontCard.opacity, 1.0);
  assert.equal(frontCard.zIndex, 100);

  const backCard = getCardMetrics(2, total, 0); // at 180 deg
  assert.equal(backCard.isFrontFacing, false);
  assert.equal(backCard.depthRatio, 0);
  assert.equal(backCard.zIndex, 0);
  assert.ok(backCard.opacity < 0.5);
});

test('applyInertia reduces velocity and stops below threshold', () => {
  const res1 = applyInertia(10, 0.9, 0.1);
  assert.equal(res1.newVelocity, 9);
  assert.equal(res1.isStopped, false);

  const res2 = applyInertia(0.05, 0.9, 0.1);
  assert.equal(res2.newVelocity, 0);
  assert.equal(res2.isStopped, true);
});
