import React from 'react';
import { Theatre } from '../types/cinema';
import { MapPin, Sparkles, Film, ArrowRight, ArrowLeft } from 'lucide-react';

interface CinemasViewProps {
  theatres: Theatre[];
  onSelectTheatre: (theatre: Theatre) => void;
  onBack?: () => void;
}

export function CinemasView({ theatres, onSelectTheatre, onBack }: CinemasViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Movies</span>
        </button>
      )}

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          Our Partner Cinemas & Premium Auditoriums
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore laser IMAX projection, multi-speaker Dolby Atmos, and luxury dine-in recliner screens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theatres.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-2">
                <span>{t.chain}</span>
                <span className="text-slate-400 font-normal">{t.city}</span>
              </div>
              <h3 className="text-lg font-bold text-white font-display group-hover:text-amber-300 transition-colors">
                {t.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-start gap-1.5 mt-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t.address}</span>
              </p>

              {/* Screens */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Auditoriums ({t.screens.length})
                </span>
                <div className="space-y-1.5">
                  {t.screens.map((scr) => (
                    <div
                      key={scr.id}
                      className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/60 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-200">{scr.name}</span>
                      <span className="font-mono text-amber-300 text-[11px]">{scr.format}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.amenities.map((am) => (
                  <span
                    key={am}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                  >
                    {am}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectTheatre(t)}
              className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Movies at this Theatre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
