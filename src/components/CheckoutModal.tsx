import React, { useState } from 'react';
import { Movie, Show, Theatre, Seat, Booking } from '../types/cinema';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { X, CreditCard, ShieldCheck, Lock, Smartphone, Building, CheckCircle } from 'lucide-react';

interface CheckoutModalProps {
  movie: Movie;
  show: Show;
  theatre: Theatre;
  selectedSeats: Seat[];
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export function CheckoutModal({
  movie,
  show,
  theatre,
  selectedSeats,
  onClose,
  onBookingSuccess,
}: CheckoutModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'apple_pay' | 'net_banking'>('card');
  const [userName, setUserName] = useState(user?.name || 'Alex Vance');
  const [userEmail, setUserEmail] = useState(user?.email || 'alex@cinephile.com');
  const [userPhone, setUserPhone] = useState(user?.phone || '+1 (555) 392-8172');

  // Card inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [cardName, setCardName] = useState(userName);

  // UPI input
  const [upiId, setUpiId] = useState('alex@okhdfcbank');

  const [isProcessing, setIsProcessing] = useState(false);

  // Calculations
  const subtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = Number((selectedSeats.length * 1.75).toFixed(2));
  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + convenienceFee + tax).toFixed(2));

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Process payment via backend
      await api.processPayment({
        amount: totalAmount,
        method: paymentMethod,
        cardDetails: { cardNumber, cardExpiry, cardCvv },
        upiId,
      });

      // 2. Create the confirmed booking in DB
      const bookingData = {
        showId: show.id,
        movieId: movie.id,
        theatreId: theatre.id,
        userName,
        userPhone,
        seats: selectedSeats.map((s) => ({
          seatId: s.id,
          row: s.row,
          number: s.number,
          tier: s.tier,
          price: s.price,
        })),
        subtotal,
        convenienceFee,
        tax,
        totalAmount,
        paymentMethod,
      };

      const newBooking = await api.createBooking(bookingData);
      showToast('Booking successfully confirmed!', 'success');
      onBookingSuccess(newBooking);
    } catch (err: any) {
      showToast(err.message || 'Payment processing failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121622] border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Secure Checkout & Ticket Pass</h3>
              <p className="text-xs text-slate-400">256-bit encrypted cinema gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePay} className="p-6 space-y-6">
          {/* Order Summary Card */}
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-white text-base">{movie.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {theatre.name} · {show.format}
                </p>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                  {show.date} at {show.startTime}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Seats ({selectedSeats.length})</span>
                <p className="font-mono font-bold text-slate-100 text-sm">
                  {selectedSeats.map((s) => s.id).join(', ')}
                </p>
              </div>
            </div>

            {/* Pricing math */}
            <div className="pt-3 border-t border-slate-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tickets Subtotal</span>
                <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Convenience & Online Service Fee</span>
                <span className="font-mono text-slate-200">${convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Integrated State Cinema Tax</span>
                <span className="font-mono text-slate-200">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm text-white">
                <span>Total Payable</span>
                <span className="font-mono text-amber-400 text-base">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ticket Delivery & Contact Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email for E-Ticket</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Payment Method
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit / Debit</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Apple / Google</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('net_banking')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === 'net_banking'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === 'card' && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-[11px] text-slate-400">Virtual Payment Address (VPA / UPI ID)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-slate-400">
                You will receive a payment request notification on your UPI app to authorize.
              </p>
            </div>
          )}

          {paymentMethod === 'apple_pay' && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center py-6">
              <p className="text-xs text-slate-300">
                Biometric authorization ready via TouchID / FaceID device token.
              </p>
            </div>
          )}

          {paymentMethod === 'net_banking' && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
              <label className="block text-[11px] text-slate-400">Select Bank</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400">
                <option>Chase Bank</option>
                <option>Bank of America</option>
                <option>Wells Fargo</option>
                <option>Citibank</option>
                <option>HDFC Bank</option>
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-400/20 text-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ${totalAmount.toFixed(2)} & Reserve</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
