export interface ProfileCard {
  id: string;
  name: string;
  role: string;
  category: 'designer' | 'creator' | 'motion' | 'photo' | 'developer';
  handle: string;
  country: string;
  imageUrl: string;
  accentColor: string; // Hex or CSS color
  glowColor: string; // rgba for neon drop-shadow
  bio: string;
  followers?: string;
  experience?: string;
  skills?: string[];
  website?: string;
}

export interface CylinderSettings {
  radius: number; // in pixels, e.g., 420 - 700
  tilt: number; // in degrees, e.g., -15 to +15
  autoRotate: boolean;
  autoRotateSpeed: number; // deg per frame
  soundEnabled: boolean;
  perspective: number; // in pixels
  cardWidth: number;
  cardHeight: number;
}
