import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { SeatMatrix } from './components/SeatMatrix';
import { CheckoutModal } from './components/CheckoutModal';
import { TicketPassModal } from './components/TicketPassModal';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminConsole } from './components/AdminConsole';
import { CinemasView } from './components/CinemasView';
import { ExperienceView } from './components/ExperienceView';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Movie, Show, Theatre, Seat, Booking, NotificationItem } from './types/cinema';
import { api } from './services/api';
import {
  Search,
  Star,
  Clock,
  Sparkles,
  Ticket,
  ChevronRight,
  Shield,
  Film,
  SlidersHorizontal,
} from 'lucide-react';

function CinemaApp() {
  const { user, isAdmin, switchRole } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<'movies' | 'cinemas' | 'bookings' | 'experience' | 'admin'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'now_showing' | 'coming_soon'>('All');

  // Modals & Active Flows
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [activeShowForSeats, setActiveShowForSeats] = useState<{
    show: Show;
    movie: Movie;
    theatre: Theatre;
  } | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    movie: Movie;
    show: Show;
    theatre: Theatre;
    selectedSeats: Seat[];
  } | null>(null);
  const [confirmedBookingForPass, setConfirmedBookingForPass] = useState<Booking | null>(null);

  // Navigation Drawers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Initial Data Load
  const loadInitialData = async () => {
    try {
      const [moviesList, theatresList] = await Promise.all([
        api.getMovies(),
        api.getTheatres(),
      ]);
      setMovies(moviesList);
      setTheatres(theatresList);
    } catch (err: any) {
      console.error('Failed to load cinema data:', err);
      showToast('Could not load cinema data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const [bookings, notifs] = await Promise.all([
        api.getBookings(),
        api.getNotifications(),
      ]);
      setUserBookings(bookings);
      setNotifications(notifs);
    } catch (err) {
      console.warn('Failed to fetch user-specific data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Handle movie selection for details
  const handleOpenMovieDetails = (movie: Movie) => {
    setSelectedMovieForDetails(movie);
  };

  // Handle showtime selected from modal
  const handleShowtimeSelected = (show: Show, movie: Movie, theatre: Theatre) => {
    setSelectedMovieForDetails(null);
    setActiveShowForSeats({ show, movie, theatre });
  };

  // Handle locking seats from seat matrix
  const handleLockSeats = async (seatIds: string[]) => {
    if (!activeShowForSeats) return false;
    try {
      await api.lockSeats(activeShowForSeats.show.id, seatIds, 8);
      return true;
    } catch (err: any) {
      showToast(err.message || 'Seat is currently unavailable', 'error');
      return false;
    }
  };

  // Proceed to Checkout
  const handleProceedToCheckout = (selectedSeats: Seat[]) => {
    if (!activeShowForSeats) return;
    setCheckoutData({
      movie: activeShowForSeats.movie,
      show: activeShowForSeats.show,
      theatre: activeShowForSeats.theatre,
      selectedSeats,
    });
  };

  // Handle Booking Success
  const handleBookingSuccess = (newBooking: Booking) => {
    setCheckoutData(null);
    setActiveShowForSeats(null);
    setConfirmedBookingForPass(newBooking);
    loadUserData();
  };

  // Genre and Format lists
  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Horror', 'Cyberpunk', 'Documentary'];
  const formats = ['All', 'IMAX 3D', 'Dolby Cinema', '4DX', 'Standard 2D'];

  // Filtered movies
  const filteredMovies = movies.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.cast.some((c) => c.toLowerCase().includes(q)) ||
        m.director.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedGenre !== 'All' && !m.genres.includes(selectedGenre)) {
      return false;
    }
    if (selectedFormat !== 'All' && !m.formats.includes(selectedFormat)) {
      return false;
    }
    if (selectedStatus !== 'All' && m.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const featuredMovie = movies.find((m) => m.featured) || movies[0];

  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        notifications={notifications}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Floating Demo Role Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-300">
              Active Session: <strong className="text-white">{user?.name || 'Guest'}</strong> ({user?.role?.toUpperCase() || 'USER'})
            </span>
            <span className="hidden sm:inline text-slate-500">· Real-time seat locking active</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Quick Persona:</span>
            <button
              onClick={() => {
                switchRole(isAdmin ? 'user' : 'admin');
                showToast(`Switched active role to ${isAdmin ? 'User' : 'Admin'}`, 'info');
              }}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
            >
              Toggle to {isAdmin ? 'Cinephile User (Alex)' : 'Cinema Admin Console'}
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1">
        {/* VIEW 1: MOVIES BROWSER */}
        {currentTab === 'movies' && (
          <div>
            {/* CINEMATIC HERO SPOTLIGHT */}
            {featuredMovie && (
              <section className="relative w-full h-[480px] sm:h-[540px] overflow-hidden bg-slate-950">
                <img
                  src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
                  alt={featuredMovie.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter brightness-50 contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-[#0b0d14]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d14] via-[#0b0d14]/70 to-transparent" />

                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl space-y-4">
                      {/* Quiet Unboxed Metadata */}
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wide">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {featuredMovie.rating} / 10
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300">{featuredMovie.certificate}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300">{featuredMovie.durationMinutes} mins</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-amber-300 uppercase">{featuredMovie.formats[0]}</span>
                      </div>

                      <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight">
                        {featuredMovie.title}
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
                        {featuredMovie.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={() => handleOpenMovieDetails(featuredMovie)}
                          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>Reserve Seats & Showtimes</span>
                        </button>
                        <button
                          onClick={() => handleOpenMovieDetails(featuredMovie)}
                          className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700/80 transition-all"
                        >
                          Movie Synopsis & Cast
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SEARCH AND FILTER BAR */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
              <div className="bg-[#121622] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search movies by title, director, cast or genre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => setSelectedStatus('All')}
                      className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        selectedStatus === 'All'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Films
                    </button>
                    <button
                      onClick={() => setSelectedStatus('now_showing')}
                      className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        selectedStatus === 'now_showing'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Now Showing
                    </button>
                    <button
                      onClick={() => setSelectedStatus('coming_soon')}
                      className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        selectedStatus === 'coming_soon'
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>

                {/* Genre & Format Segmented Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
                  {/* Genre Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-slate-500 text-[11px] font-medium mr-1 uppercase">Genre:</span>
                    {genres.map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGenre(g)}
                        className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          selectedGenre === g
                            ? 'bg-slate-200 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  {/* Format Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-slate-500 text-[11px] font-medium mr-1 uppercase">Format:</span>
                    {formats.map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedFormat(f)}
                        className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                          selectedFormat === f
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* MOVIE CARDS GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    Showing in Theatres
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any movie to browse showtimes across all partner multiplexes
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {filteredMovies.length} {filteredMovies.length === 1 ? 'Movie' : 'Movies'} found
                </span>
              </div>

              {filteredMovies.length === 0 ? (
                <div className="py-16 text-center bg-slate-900/30 border border-slate-800 rounded-2xl">
                  <Film className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">No movies match your selected filters</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting the search or picking another genre.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGenre('All');
                      setSelectedFormat('All');
                      setSelectedStatus('All');
                    }}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredMovies.map((movie) => (
                    <div
                      key={movie.id}
                      className="group bg-[#121622] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col"
                    >
                      {/* Poster slot with styled fallback container */}
                      <div
                        onClick={() => handleOpenMovieDetails(movie)}
                        className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 cursor-pointer"
                      >
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-transparent to-transparent opacity-80" />

                        {/* Top rating badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 font-mono text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{movie.rating}</span>
                        </div>

                        {/* Bottom overlay inside image */}
                        <div className="absolute bottom-3 left-4 right-4">
                          <div className="flex items-center gap-2 text-[11px] text-slate-300">
                            <span>{movie.certificate}</span>
                            <span>·</span>
                            <span>{movie.durationMinutes} mins</span>
                            <span>·</span>
                            <span>{movie.genres.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3
                            onClick={() => handleOpenMovieDetails(movie)}
                            className="font-bold text-lg font-display text-white group-hover:text-amber-300 transition-colors cursor-pointer leading-tight truncate"
                          >
                            {movie.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {movie.description}
                          </p>
                        </div>

                        {/* Formats and Action */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1">
                            {movie.formats.slice(0, 2).map((fmt) => (
                              <span
                                key={fmt}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                              >
                                {fmt}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => handleOpenMovieDetails(movie)}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
                          >
                            Select Seats
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: CINEMAS DIRECTORY */}
        {currentTab === 'cinemas' && (
          <CinemasView
            theatres={theatres}
            onSelectTheatre={(_theatre) => {
              setCurrentTab('movies');
            }}
          />
        )}

        {/* VIEW 3: MY BOOKINGS & TICKETS */}
        {currentTab === 'bookings' && (
          <MyBookingsView
            bookings={userBookings}
            onRefreshBookings={loadUserData}
            onViewTicket={(b) => setConfirmedBookingForPass(b)}
            onBrowseMovies={() => setCurrentTab('movies')}
          />
        )}

        {/* VIEW 4: EXPERIENCE FORMATS */}
        {currentTab === 'experience' && (
          <ExperienceView onExploreMovies={() => setCurrentTab('movies')} />
        )}

        {/* VIEW 5: ADMIN CONSOLE */}
        {currentTab === 'admin' && isAdmin && (
          <AdminConsole
            theatres={theatres}
            onMovieAddedOrUpdated={() => {
              loadInitialData();
              loadUserData();
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#090b10] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-200">IMovies</span>
            <span>·</span>
            <span>Premium Cinema Booking & Real-Time Seat Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>IMAX Laser</span>
            <span>·</span>
            <span>Dolby Atmos 128-ch</span>
            <span>·</span>
            <span>Encrypted Checkout</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: MOVIE DETAILS & SHOW SELECTOR */}
      {selectedMovieForDetails && (
        <MovieDetailsModal
          movie={selectedMovieForDetails}
          theatres={theatres}
          onClose={() => setSelectedMovieForDetails(null)}
          onSelectShow={handleShowtimeSelected}
        />
      )}

      {/* MODAL 2: INTERACTIVE SEAT MATRIX SCREEN */}
      {activeShowForSeats && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0d14]">
          <SeatMatrix
            show={activeShowForSeats.show}
            movie={activeShowForSeats.movie}
            theatre={activeShowForSeats.theatre}
            onBack={() => setActiveShowForSeats(null)}
            onProceedToCheckout={handleProceedToCheckout}
            onLockSeats={handleLockSeats}
          />
        </div>
      )}

      {/* MODAL 3: CHECKOUT & PAYMENT */}
      {checkoutData && (
        <CheckoutModal
          movie={checkoutData.movie}
          show={checkoutData.show}
          theatre={checkoutData.theatre}
          selectedSeats={checkoutData.selectedSeats}
          onClose={() => setCheckoutData(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* MODAL 4: CONFIRMED DIGITAL TICKET PASS */}
      {confirmedBookingForPass && (
        <TicketPassModal
          booking={confirmedBookingForPass}
          onClose={() => setConfirmedBookingForPass(null)}
          onViewMyBookings={() => {
            setConfirmedBookingForPass(null);
            setCurrentTab('bookings');
          }}
        />
      )}

      {/* MODAL 5: AUTH LOGIN / REGISTER */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* DRAWER: NOTIFICATIONS */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        notifications={notifications}
        onRefresh={loadUserData}
        onSelectBookingNotification={() => setCurrentTab('bookings')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CinemaApp />
      </AuthProvider>
    </ToastProvider>
  );
}
