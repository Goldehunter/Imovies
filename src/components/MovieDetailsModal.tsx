import React, { useState, useEffect } from 'react';
import { Movie, Show, Theatre } from '../types/cinema';
import { api } from '../services/api';
import { X, Star, Clock, Calendar, Film, MapPin, Sparkles, ArrowLeft } from 'lucide-react';

interface MovieDetailsModalProps {
  movie: Movie;
  theatres: Theatre[];
  onClose: () => void;
  onSelectShow: (show: Show, movie: Movie, theatre: Theatre) => void;
}

export function MovieDetailsModal({
  movie,
  theatres,
  onClose,
  onSelectShow,
}: MovieDetailsModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState<boolean>(true);

  // Next 4 days
  const dateOptions = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date(Date.now() + i * 86400000);
    return {
      dateString: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    async function loadShows() {
      setLoadingShows(true);
      try {
        const fetched = await api.getShows({
          movieId: movie.id,
          date: selectedDate,
        });
        setShows(fetched);
      } catch (err) {
        console.error('Failed to load shows:', err);
      } finally {
        setLoadingShows(false);
      }
    }
    loadShows();
  }, [movie.id, selectedDate]);

  // Keyboard escape listener to return back to previous page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Viewport Top-Left Back Arrow Button (always visible on screen) */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition-all text-xs font-semibold backdrop-blur-md shadow-2xl group cursor-pointer"
        title="Back to Movies Homepage"
        aria-label="Back to previous page"
      >
        <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Movies</span>
      </button>

      <div className="bg-[#10131d] border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-8 text-slate-100">
        {/* Backdrop Header */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top filter brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10131d] via-[#10131d]/60 to-transparent" />

          {/* Modal Header Back button at top left */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white transition-all text-xs font-semibold backdrop-blur-md shadow-lg group cursor-pointer"
            title="Back to Movies Homepage"
            aria-label="Back to Movies"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Movies</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close modal"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Content */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-5">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="w-24 sm:w-28 rounded-lg shadow-xl border border-slate-700/60 shrink-0 hidden xs:block"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {movie.rating} / 10
                </span>
                <span>·</span>
                <span className="text-slate-300">({movie.votesCount.toLocaleString()} votes)</span>
                <span>·</span>
                <span className="border border-slate-700 px-1.5 py-0.2 rounded text-[10px] text-slate-300">
                  {movie.certificate}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                {movie.title}
              </h1>
              <p className="text-xs text-slate-300 italic mt-0.5 max-w-xl">{movie.tagline}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{movie.durationMinutes} mins</span>
            </div>
            <span>·</span>
            <div>
              <span>Genres: </span>
              <span className="text-slate-200">{movie.genres.join(', ')}</span>
            </div>
            <span>·</span>
            <div>
              <span>Languages: </span>
              <span className="text-slate-200">{movie.languages.join(', ')}</span>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Synopsis
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{movie.description}</p>
          </div>

          {/* Cast & Director */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
            <div>
              <span className="text-slate-400 block text-[11px]">Director</span>
              <span className="font-semibold text-slate-200">{movie.director}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Starring Cast</span>
              <span className="font-semibold text-slate-200">{movie.cast.join(', ')}</span>
            </div>
          </div>

          {/* Showtime Date Picker */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Select Date & Showtimes</span>
            </h3>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {dateOptions.map((opt) => (
                <button
                  key={opt.dateString}
                  onClick={() => setSelectedDate(opt.dateString)}
                  className={`flex flex-col items-center justify-center min-w-[72px] py-2 px-3 rounded-xl border text-xs transition-all ${
                    selectedDate === opt.dateString
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] uppercase font-medium">{opt.dayName}</span>
                  <span className="text-base font-bold font-mono">{opt.dayNumber}</span>
                  <span className="text-[10px]">{opt.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theatres and Showtimes */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Available Theatres & Experience Formats
            </h3>

            {loadingShows ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading showtimes for {selectedDate}...
              </div>
            ) : shows.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                No shows scheduled for {selectedDate}. Please select another date.
              </div>
            ) : (
              <div className="space-y-3">
                {theatres.map((theatre) => {
                  const theatreShows = shows.filter((s) => s.theatreId === theatre.id);
                  if (theatreShows.length === 0) return null;

                  return (
                    <div
                      key={theatre.id}
                      className="p-4 bg-slate-900/70 border border-slate-800/80 rounded-xl space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            {theatre.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">{theatre.address}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          {theatre.amenities.slice(0, 2).join(' · ')}
                        </div>
                      </div>

                      {/* Showtime Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        {theatreShows.map((show) => {
                          const availableSeats = show.totalSeats - show.bookedSeatsCount;
                          return (
                            <button
                              key={show.id}
                              onClick={() => onSelectShow(show, movie, theatre)}
                              className="group p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-400/80 rounded-xl text-left transition-all hover:scale-102 hover:shadow-md hover:shadow-amber-400/10"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-mono text-amber-300 group-hover:text-amber-200">
                                  {show.startTime}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                  {show.format}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mt-1">
                                <span>from ${show.pricing.standard}</span>
                                <span className="text-emerald-400 font-mono">
                                  {availableSeats} seats left
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
