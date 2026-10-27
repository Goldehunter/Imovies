import React, { useState, useEffect } from 'react';
import { Show, Seat, SeatTier, Movie, Theatre } from '../types/cinema';
import { ArrowLeft, Clock, ShieldCheck, Armchair } from 'lucide-react';

interface SeatMatrixProps {
  show: Show;
  movie: Movie;
  theatre: Theatre;
  onBack: () => void;
  onProceedToCheckout: (selectedSeats: Seat[]) => void;
  onLockSeats: (seatIds: string[]) => Promise<boolean>;
}

export function SeatMatrix({
  show,
  movie,
  theatre,
  onBack,
  onProceedToCheckout,
  onLockSeats,
}: SeatMatrixProps) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [lockCountdown, setLockCountdown] = useState<number>(480); // 8 minutes in seconds
  const [isLocking, setIsLocking] = useState<boolean>(false);

  // Group seats by rows
  const rowNames = Array.from(
    new Set(Object.values(show.seats).map((s) => s.row))
  ).sort();

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked' || (seat.status === 'locked' && !selectedSeatIds.includes(seat.id))) {
      return;
    }

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  // Lock seats countdown timer
  useEffect(() => {
    if (selectedSeatIds.length === 0) return;
    const interval = setInterval(() => {
      setLockCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSeatIds.length]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedSeatsList = selectedSeatIds
    .map((id) => show.seats[id])
    .filter(Boolean);

  const subtotal = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  const handleProceed = async () => {
    if (selectedSeatIds.length === 0) return;
    setIsLocking(true);
    try {
      const ok = await onLockSeats(selectedSeatIds);
      if (ok) {
        onProceedToCheckout(selectedSeatsList);
      }
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-100 pb-24">
      {/* Header bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-18 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{movie.title}</span>
              <span className="text-xs font-normal text-slate-400">·</span>
              <span className="text-xs font-semibold text-amber-400">{show.format}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {theatre.name} · {show.date} · {show.startTime}
            </p>
          </div>
        </div>

        {selectedSeatIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            <span>Lock holds: {formatCountdown(lockCountdown)}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Cinema Curved Screen */}
        <div className="mb-12 text-center">
          <div className="relative mx-auto max-w-2xl h-8 bg-gradient-to-b from-sky-400/30 via-slate-700/20 to-transparent cinema-screen-arc border-t-2 border-sky-400/80 shadow-[0_10px_30px_rgba(56,189,248,0.25)]"></div>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mt-2 font-medium">
            Laser Projection Curved Screen
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-xs text-slate-400 bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-xl max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border border-slate-600 bg-slate-800/80" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-500 border border-amber-400 shadow-sm shadow-amber-500/40" />
            <span className="text-amber-300 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-800/30 border border-slate-800 opacity-40 cursor-not-allowed" />
            <span>Sold / Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-rose-950/60 border border-rose-800/50" />
            <span>VIP Recliner ($30)</span>
          </div>
        </div>

        {/* Interactive Seat Matrix */}
        <div className="overflow-x-auto pb-6">
          <div className="min-w-[680px] max-w-3xl mx-auto space-y-3">
            {rowNames.map((rowName) => {
              const rowSeats = Object.values(show.seats)
                .filter((s) => s.row === rowName)
                .sort((a, b) => a.number - b.number);

              const firstSeat = rowSeats[0];
              const tier = firstSeat?.tier || 'standard';

              return (
                <div key={rowName} className="flex items-center gap-3 justify-center">
                  {/* Row Label Left */}
                  <span className="w-6 text-center text-xs font-bold text-slate-500 font-mono">
                    {rowName}
                  </span>

                  {/* Seat Row */}
                  <div className="flex items-center gap-1.5">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isBooked = seat.status === 'booked';
                      const isLocked = seat.status === 'locked' && !isSelected;

                      // Aisle gaps after seat 4 and seat 10
                      const hasRightAisle = seat.number === 4 || seat.number === 10;

                      return (
                        <React.Fragment key={seat.id}>
                          <button
                            onClick={() => handleSeatClick(seat)}
                            disabled={isBooked || isLocked}
                            title={`Seat ${seat.id} (${seat.tier.toUpperCase()} - $${seat.price})`}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded text-[11px] font-mono font-medium transition-all flex items-center justify-center ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 font-bold scale-110 shadow-lg shadow-amber-400/40 z-10'
                                : isBooked
                                ? 'bg-slate-900/60 text-slate-700 border border-slate-800/40 cursor-not-allowed opacity-30'
                                : isLocked
                                ? 'bg-slate-800/80 text-slate-600 border border-amber-900/30 cursor-not-allowed'
                                : seat.tier === 'vip'
                                ? 'bg-rose-950/40 border border-rose-600/40 text-rose-300 hover:bg-rose-900/60 hover:scale-105'
                                : seat.tier === 'premium'
                                ? 'bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:scale-105'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:scale-105'
                            }`}
                          >
                            {seat.number}
                          </button>
                          {hasRightAisle && <div className="w-5 sm:w-7" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Row Label Right */}
                  <span className="w-6 text-center text-xs font-bold text-slate-500 font-mono">
                    {rowName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier Details Pill Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8">
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Standard Class</p>
              <p className="text-[11px] text-slate-400">Rows A - C</p>
            </div>
            <span className="text-sm font-bold text-slate-100 font-mono">${show.pricing.standard}</span>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Premium Club</p>
              <p className="text-[11px] text-slate-400">Rows D - F</p>
            </div>
            <span className="text-sm font-bold text-amber-400 font-mono">${show.pricing.premium}</span>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-300">VIP Recliner</p>
              <p className="text-[11px] text-slate-400">Rows G - H</p>
            </div>
            <span className="text-sm font-bold text-rose-400 font-mono">${show.pricing.vip}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Order Bar */}
      {selectedSeatIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg p-4 z-40 shadow-2xl">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div>
                <p className="text-xs text-slate-400">Selected Seats ({selectedSeatIds.length})</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedSeatsList.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-semibold"
                    >
                      {s.id}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Ticket Price</p>
                <p className="text-xl font-bold font-mono text-white">${subtotal.toFixed(2)}</p>
              </div>

              <button
                onClick={handleProceed}
                disabled={isLocking}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                <span>{isLocking ? 'Holding Seats...' : 'Proceed to Checkout'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
