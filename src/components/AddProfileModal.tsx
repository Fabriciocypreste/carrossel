import React, { useState } from 'react';
import { X, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ProfileCard } from '../types/carousel';

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: ProfileCard) => void;
}

const PRESET_AVATARS = [
  {
    label: 'Neon Red',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    color: '#ef4444',
  },
  {
    label: 'Studio Gold',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    color: '#f59e0b',
  },
  {
    label: 'Cyber Cyan',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    color: '#06b6d4',
  },
  {
    label: 'Electric Violet',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    color: '#a855f7',
  },
];

export const AddProfileModal: React.FC<AddProfileModalProps> = ({
  isOpen,
  onClose,
  onAddProfile,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<ProfileCard['category']>('designer');
  const [handle, setHandle] = useState('');
  const [country, setCountry] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_AVATARS[0].url);
  const [accentColor, setAccentColor] = useState(PRESET_AVATARS[0].color);
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const newProfile: ProfileCard = {
      id: `profile-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      category,
      handle: handle.trim().replace(/^@/, '') || name.toLowerCase().replace(/\s+/g, ''),
      country: country.trim() || 'Global',
      imageUrl: imageUrl.trim() || PRESET_AVATARS[0].url,
      accentColor,
      glowColor: `${accentColor}99`,
      bio: bio.trim() || `${name} is an innovative ${role} shaping visual experiences.`,
      followers: '15K',
      experience: '4 years',
      skills: [role, category.toUpperCase()],
    };

    onAddProfile(newProfile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0f1117] border border-white/15 rounded-3xl p-6 shadow-2xl z-10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold">Add 3D Profile Card</h3>
            <p className="text-xs text-white/50">Insert a new card into the rotating cylinder</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 mb-1 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leo Vance"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1 font-medium">Role / Title</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Creative Technologist"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProfileCard['category'])}
                className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-400 cursor-pointer"
              >
                <option value="designer">Designer</option>
                <option value="creator">Creator</option>
                <option value="motion">Motion & 3D</option>
                <option value="photo">Photographer</option>
                <option value="developer">Developer</option>
              </select>
            </div>

            <div>
              <label className="block text-white/70 mb-1 font-medium">Location</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Brazil"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 mb-1 font-medium">Instagram Handle</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. leovance"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1 font-medium">Accent Glow Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                />
                <span className="font-mono text-white/60">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Avatars */}
          <div>
            <label className="block text-white/70 mb-1.5 font-medium">Portrait Image Presets</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AVATARS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setImageUrl(preset.url);
                    setAccentColor(preset.color);
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer h-16 ${
                    imageUrl === preset.url ? 'border-white scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover rounded-lg" />
                  <span className="absolute bottom-1 inset-x-1 text-[9px] text-center bg-black/70 rounded truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/70 mb-1 font-medium">Or Custom Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-red-400"
            />
          </div>

          <div>
            <label className="block text-white/70 mb-1 font-medium">Short Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of creative discipline and visual focus..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-red-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-red-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add to Carousel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
