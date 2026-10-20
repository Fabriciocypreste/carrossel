import React, { useEffect } from 'react';
import { X, Instagram, MapPin, Globe, Sparkles, ChevronLeft, ChevronRight, Briefcase, Users, Calendar } from 'lucide-react';
import { ProfileCard } from '../types/carousel';

interface CardDetailModalProps {
  profile: ProfileCard | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  onNavigateNext,
  onNavigatePrev,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigateNext();
      if (e.key === 'ArrowLeft') onNavigatePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigateNext, onNavigatePrev]);

  if (!isOpen || !profile) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-profile-title"
    >
      {/* Background ambient neon glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-40"
        style={{ backgroundColor: profile.accentColor }}
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-3xl bg-[#0f1117] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] z-10"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 0 60px ${profile.glowColor}`,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/15 cursor-pointer"
          aria-label="Close profile details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Visual Image & Floating Badges */}
        <div className="relative md:w-1/2 min-h-[280px] md:min-h-[460px] overflow-hidden bg-black">
          <img
            src={profile.imageUrl}
            alt={profile.name}
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle rim highlight inside image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0f1117]" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-white/20"
              style={{ backgroundColor: `${profile.accentColor}33`, color: profile.accentColor }}
            >
              {profile.category}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>{profile.country}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Content & Actions */}
        <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Available for Projects
              </span>
            </div>

            <h2 id="modal-profile-title" className="font-heading text-3xl font-extrabold text-white tracking-tight">
              {profile.name}
            </h2>

            <p className="text-lg font-semibold mt-1" style={{ color: profile.accentColor }}>
              {profile.role}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 my-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <Users className="w-4 h-4 mx-auto mb-1 text-white/60" />
                <p className="text-sm font-bold text-white">{profile.followers || '50K+'}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Followers</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <Calendar className="w-4 h-4 mx-auto mb-1 text-white/60" />
                <p className="text-sm font-bold text-white">{profile.experience || '6+ yrs'}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Experience</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <Briefcase className="w-4 h-4 mx-auto mb-1 text-white/60" />
                <p className="text-sm font-bold text-white">40+ Projects</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Delivered</p>
              </div>
            </div>

            {/* Bio description */}
            <div className="mb-5">
              <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-1.5">About</h4>
              <p className="text-sm text-white/80 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Skills Pills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Core Specialties</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-white/90"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions and Carousel Stepper */}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <a
                href={profile.website || `https://instagram.com/${profile.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-center text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-2 group"
              >
                <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                <span>@{profile.handle}</span>
              </a>

              <button
                onClick={() => alert(`Connection request sent to ${profile.name}!`)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-center text-black transition-all flex items-center justify-center gap-2 hover:brightness-110 shadow-lg cursor-pointer"
                style={{ backgroundColor: profile.accentColor }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Collaborate</span>
              </button>
            </div>

            {/* Next / Previous profile switcher */}
            <div className="flex items-center justify-between text-xs text-white/60 pt-1">
              <button
                onClick={onNavigatePrev}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Profile</span>
              </button>
              <span className="text-[11px] text-white/40">Use arrow keys ← →</span>
              <button
                onClick={onNavigateNext}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <span>Next Profile</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
