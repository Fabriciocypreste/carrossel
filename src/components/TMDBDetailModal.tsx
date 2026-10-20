import React, { useEffect, useState } from 'react';
import { X, Star, Film, Tv, Calendar, Clock, Play, ExternalLink, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { TMDBItem, fetchItemDetails } from '../services/tmdb';

interface TMDBDetailModalProps {
  item: TMDBItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
}

export const TMDBDetailModal: React.FC<TMDBDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onNavigateNext,
  onNavigatePrev,
}) => {
  const [detailedItem, setDetailedItem] = useState<TMDBItem | null>(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!item || !isOpen) {
      setDetailedItem(null);
      setIsPlayingTrailer(false);
      return;
    }

    setDetailedItem(item);
    setIsPlayingTrailer(false);
    setIsLoading(true);

    fetchItemDetails(item.id, item.mediaType)
      .then((fullData) => {
        setDetailedItem(fullData);
      })
      .catch((err) => {
        console.error('Failed to load item details:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [item, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && !isPlayingTrailer) onNavigateNext();
      if (e.key === 'ArrowLeft' && !isPlayingTrailer) onNavigatePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigateNext, onNavigatePrev, isPlayingTrailer]);

  if (!isOpen || !item) return null;

  const current = detailedItem || item;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tmdb-modal-title"
    >
      {/* Background ambient neon glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-30"
        style={{ backgroundColor: current.accentColor }}
      />

      {/* Modal Dialog Container */}
      <div
        className="relative w-full max-w-4xl bg-[#0f1117] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] z-10"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 0 60px ${current.glowColor}`,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/20 cursor-pointer"
          aria-label="Fechar detalhes"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media / Poster / Video Column */}
        <div className="relative md:w-5/12 min-h-[300px] md:min-h-[520px] bg-black overflow-hidden flex items-center justify-center">
          {isPlayingTrailer && current.trailerYoutubeKey ? (
            <div className="relative w-full h-full min-h-[300px]">
              <iframe
                src={`https://www.youtube.com/embed/${current.trailerYoutubeKey}?autoplay=1&rel=0`}
                title="Trailer"
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setIsPlayingTrailer(false)}
                className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 cursor-pointer"
              >
                ← Voltar ao Pôster
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full group">
              <img
                src={current.posterUrl}
                alt={current.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0f1117]" />
              
              {/* Play Trailer overlay button */}
              {current.trailerYoutubeKey && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlayingTrailer(true)}
                    className="p-4 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-2xl hover:scale-110 transition-all flex items-center justify-center cursor-pointer border border-white/20 group-hover:scale-105"
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </button>
                </div>
              )}

              {/* Bottom badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-white/20"
                  style={{ backgroundColor: `${current.accentColor}33`, color: current.accentColor }}
                >
                  {current.primaryGenre}
                </span>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{current.voteAverage.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="p-6 md:p-8 md:w-7/12 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header info */}
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono uppercase tracking-wider font-semibold">
                {current.mediaType === 'tv' ? 'Série' : 'Filme'}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/70">{current.releaseYear}</span>
              {current.runtime && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/70 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor(current.runtime / 60)}h {current.runtime % 60}m</span>
                  </span>
                </>
              )}
            </div>

            <h2 id="tmdb-modal-title" className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {current.title}
            </h2>

            {current.originalTitle !== current.title && (
              <p className="text-xs text-white/50 italic mt-0.5">
                Título original: {current.originalTitle}
              </p>
            )}

            {current.tagline && (
              <p className="text-sm font-semibold mt-2 italic" style={{ color: current.accentColor }}>
                "{current.tagline}"
              </p>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                <Star className="w-4 h-4 mx-auto mb-1 text-amber-400 fill-amber-400" />
                <p className="text-sm font-bold text-white">{current.voteAverage.toFixed(1)} / 10</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Avaliação</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                <Users className="w-4 h-4 mx-auto mb-1 text-white/60" />
                <p className="text-sm font-bold text-white">{current.voteCount.toLocaleString()}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Votos</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                <Calendar className="w-4 h-4 mx-auto mb-1 text-white/60" />
                <p className="text-sm font-bold text-white">{current.releaseDate || current.releaseYear}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Lançamento</p>
              </div>
            </div>

            {/* Overview / Synopsis */}
            <div className="mb-5">
              <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-1.5">Sinopse</h4>
              <p className="text-sm text-white/80 leading-relaxed max-h-36 overflow-y-auto pr-1">
                {current.overview}
              </p>
            </div>

            {/* Cast Members */}
            {current.cast && current.cast.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Elenco Principal</h4>
                <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                  {current.cast.map((actor) => (
                    <div key={actor.id} className="flex-shrink-0 w-20 text-center">
                      <div className="w-14 h-14 mx-auto rounded-full overflow-hidden bg-white/10 border border-white/15 mb-1">
                        {actor.profileUrl ? (
                          <img src={actor.profileUrl} alt={actor.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-white/40 font-bold">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-white truncate">{actor.name}</p>
                      <p className="text-[9px] text-white/50 truncate">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {current.trailerYoutubeKey && !isPlayingTrailer && (
                <button
                  onClick={() => setIsPlayingTrailer(true)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Assistir Trailer</span>
                </button>
              )}

              <a
                href={`https://www.themoviedb.org/${current.mediaType}/${current.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-center text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Film className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Ver no TMDB</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/50" />
              </a>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center justify-between text-xs text-white/60 pt-1">
              <button
                onClick={onNavigatePrev}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              <span className="text-[11px] text-white/40">Use as setas ← →</span>
              <button
                onClick={onNavigateNext}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                <span>Próximo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
