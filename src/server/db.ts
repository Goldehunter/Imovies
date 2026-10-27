import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  Movie,
  Theatre,
  Show,
  Seat,
  SeatTier,
  Booking,
  PaymentTransaction,
  NotificationItem,
} from '../types/cinema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'imovies_store.json');

interface DatabaseSchema {
  users: User[];
  movies: Movie[];
  theatres: Theatre[];
  shows: Show[];
  bookings: Booking[];
  payments: PaymentTransaction[];
  notifications: NotificationItem[];
}

// Seat map helper
export function generateShowSeats(
  rows: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  colsPerRow = 14,
  basePrices = { standard: 12, premium: 18, vip: 28 },
  randomBookedRatio = 0.25
): Record<string, Seat> {
  const seats: Record<string, Seat> = {};

  rows.forEach((row, rowIndex) => {
    let tier: SeatTier = 'standard';
    let price = basePrices.standard;

    if (rowIndex >= rows.length - 2) {
      tier = 'vip';
      price = basePrices.vip;
    } else if (rowIndex >= 3) {
      tier = 'premium';
      price = basePrices.premium;
    }

    for (let c = 1; c <= colsPerRow; c++) {
      const seatId = `${row}-${c}`;
      // Randomly pre-book a few seats for realistic cinema state
      const isBooked = Math.random() < randomBookedRatio;
      seats[seatId] = {
        id: seatId,
        row,
        number: c,
        tier,
        price,
        status: isBooked ? 'booked' : 'available',
      };
    }
  });

  return seats;
}

// Initial Seed Data
const initialUsers: User[] = [
  {
    id: 'user_admin',
    name: 'Cinema Director (Admin)',
    email: 'admin@imovies.com',
    role: 'admin',
    phone: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'user_demo',
    name: 'Alex Vance',
    email: 'alex@cinephile.com',
    role: 'user',
    phone: '+1 (555) 392-8172',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-01T15:30:00Z',
  },
];

const initialTheatres: Theatre[] = [
  {
    id: 'th_imax_metropolis',
    name: 'IMAX Metropolis Grand',
    chain: 'IMAX Cineplex',
    city: 'New York',
    address: '450 Broadway & 42nd St, Times Square',
    amenities: ['IMAX Laser 4K', 'Dolby Atmos 128-ch', 'Full Recliners', 'Gourmet Dine-In Bar'],
    screens: [
      { id: 'scr_1', name: 'Auditorium 1 (IMAX Laser)', format: 'IMAX 3D', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_2', name: 'Auditorium 2 (Dolby Cinema)', format: 'Dolby Cinema', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_regal_olympic',
    name: 'Regal Olympic Luxe',
    chain: 'Regal Cinema',
    city: 'Los Angeles',
    address: '1000 W Olympic Blvd, Downtown',
    amenities: ['4DX Motion Seats', 'Dolby Atmos', 'VIP Lounge', 'Mobile Order Delivery'],
    screens: [
      { id: 'scr_3', name: 'Grand Theatre A', format: '4DX', rows: 8, cols: 14, totalSeats: 112 },
      { id: 'scr_4', name: 'Screen 2 Premium', format: 'Dolby Atmos', rows: 7, cols: 12, totalSeats: 84 },
    ],
  },
  {
    id: 'th_pvr_heritage',
    name: 'ArcLight Heritage Cinema',
    chain: 'ArcLight Cinemas',
    city: 'Chicago',
    address: '600 N Michigan Ave, Magnificent Mile',
    amenities: ['Laser Projection', 'Curved Acoustic Wall', 'Craft Beer Bar'],
    screens: [
      { id: 'scr_5', name: 'Screen 1 Master Hall', format: 'Standard 2D', rows: 8, cols: 14, totalSeats: 112 },
    ],
  },
];

const initialMovies: Movie[] = [
  {
    id: 'mov_odyssey_stars',
    title: 'Odyssey of Stars',
    tagline: 'Where journey ends, the universe begins.',
    description: 'When an interstellar anomaly triggers gravitational disruptions across the Solar perimeter, Commander Alexander Reed and astrophysicist Eliza Vostok lead humanity’s deepest deep-space expedition through the unknown ringed world of Kepler-186.',
    genres: ['Sci-Fi', 'Adventure', 'Mystery'],
    languages: ['English', 'Spanish', 'French'],
    durationMinutes: 164,
    releaseDate: '2026-10-18',
    rating: 9.3,
    votesCount: 48920,
    certificate: 'PG-13',
    director: 'Elias Thornton',
    cast: ['Alexander Reed', 'Eliza Vostok', 'Kaelen Miller', 'Elena Rostova'],
    posterUrl: '/src/assets/images/poster_sci_fi_1793119908580.jpg',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema', '4DX', 'Standard 2D'],
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'mov_chrono_protocol',
    title: 'Chrono Protocol',
    tagline: 'Time is the ultimate weapon.',
    description: 'An elite counter-temporal operative investigates a series of paradoxical memory assassinations in high-altitude Neo-Geneva, uncovering a conspiracy that spans three separate timelines.',
    genres: ['Action', 'Thriller', 'Sci-Fi'],
    languages: ['English', 'German', 'Japanese'],
    durationMinutes: 138,
    releaseDate: '2026-10-05',
    rating: 8.8,
    votesCount: 34150,
    certificate: 'R',
    director: 'Sofia Chen-Duval',
    cast: ['Marcus Sterling', 'Lyra Vance', 'Kenji Sato'],
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema'],
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'mov_the_virtuoso',
    title: 'The Virtuoso Maestro',
    tagline: 'Every note holds a reckoning.',
    description: 'A prodigy concert conductor battles progressive hearing loss while preparing the premier performance of a forbidden symphony that unearths her family’s war-time secrets.',
    genres: ['Drama', 'Music'],
    languages: ['English', 'French', 'Italian'],
    durationMinutes: 142,
    releaseDate: '2026-09-22',
    rating: 9.0,
    votesCount: 22890,
    certificate: 'PG-13',
    director: 'Julian Moreau',
    cast: ['Camille Laurent', 'Anthony Hopkins', 'Sebastian Cruz'],
    posterUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Dolby Cinema', 'Standard 2D'],
    status: 'now_showing',
  },
  {
    id: 'mov_phantom_crest',
    title: 'Phantom Crest',
    tagline: 'In the shadows of the storm.',
    description: 'During a relentless Arctic whiteout, a deep-sea salvage crew discovers a submarine that disappeared in 1968, only to find something dormant waiting inside the hull.',
    genres: ['Horror', 'Mystery', 'Thriller'],
    languages: ['English'],
    durationMinutes: 119,
    releaseDate: '2026-10-14',
    rating: 8.4,
    votesCount: 19400,
    certificate: 'R',
    director: 'Lars Lindqvist',
    cast: ['Freja Lind', 'David Oyelowo', 'Thomas Kretschmann'],
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['Standard 2D', 'Dolby Atmos'],
    status: 'now_showing',
  },
  {
    id: 'mov_solaris_blade',
    title: 'Solaris Blade: Neon Horizon',
    tagline: 'Rebellion rises from the neon depths.',
    description: 'An underground courier navigating the flooded canal levels of Sector 9 discovers a cryogenic capsule containing the prototype consciousness of humanity’s first artificial guardian.',
    genres: ['Cyberpunk', 'Action', 'Anime'],
    languages: ['Japanese', 'English'],
    durationMinutes: 126,
    releaseDate: '2026-11-12',
    rating: 9.1,
    votesCount: 12400,
    certificate: 'PG-13',
    director: 'Kenichi Takahashi',
    cast: ['Rin Takahashi', 'Ren Amamiya', 'Sarah Connors'],
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', '4DX'],
    status: 'coming_soon',
  },
  {
    id: 'mov_wild_savannah',
    title: 'Wild Savannah: Giants of Mara',
    tagline: 'The untamed pulse of the earth.',
    description: 'Narrated by world-renowned naturalists, this visual spectacle captured over 4 years in 8K IMAX reveals the secret migrations, predator hierarchies, and survival dynamics of the Great Rift Valley.',
    genres: ['Documentary', 'Nature'],
    languages: ['English', 'Spanish'],
    durationMinutes: 98,
    releaseDate: '2026-11-20',
    rating: 9.4,
    votesCount: 8200,
    certificate: 'U',
    director: 'Amina Kiprop',
    cast: ['David Attenborough', 'Amina Kiprop'],
    posterUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    backdropUrl: '/src/assets/images/hero_cinema_hall_1793119894097.jpg',
    formats: ['IMAX 3D', 'Dolby Cinema'],
    status: 'coming_soon',
  },
];

// Helper to generate shows for today and upcoming dates
function createSeedShows(): Show[] {
  const dates = [
    new Date().toISOString().split('T')[0],
    new Date(Date.now() + 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  ];

  const times = [
    { start: '10:30 AM', end: '01:15 PM' },
    { start: '02:00 PM', end: '04:45 PM' },
    { start: '05:30 PM', end: '08:15 PM' },
    { start: '09:00 PM', end: '11:45 PM' },
  ];

  const shows: Show[] = [];
  let showIdx = 101;

  dates.forEach((date) => {
    // Shows for Odyssey of Stars
    times.forEach((t, i) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 14, { standard: 14, premium: 20, vip: 30 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_odyssey_stars',
        theatreId: 'th_imax_metropolis',
        screenId: 'scr_1',
        date,
        startTime: t.start,
        endTime: t.end,
        format: i % 2 === 0 ? 'IMAX 3D' : 'Dolby Cinema',
        language: 'English',
        pricing: { standard: 14, premium: 20, vip: 30 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for Chrono Protocol
    [times[1], times[3]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 12, premium: 18, vip: 26 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_chrono_protocol',
        theatreId: 'th_regal_olympic',
        screenId: 'scr_3',
        date,
        startTime: t.start,
        endTime: t.end,
        format: '4DX',
        language: 'English',
        pricing: { standard: 12, premium: 18, vip: 26 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });

    // Shows for The Virtuoso Maestro
    [times[0], times[2]].forEach((t) => {
      const seats = generateShowSeats(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 12, { standard: 11, premium: 16, vip: 24 });
      const bookedCount = Object.values(seats).filter((s) => s.status === 'booked').length;
      shows.push({
        id: `show_${showIdx++}`,
        movieId: 'mov_the_virtuoso',
        theatreId: 'th_pvr_heritage',
        screenId: 'scr_5',
        date,
        startTime: t.start,
        endTime: t.end,
        format: 'Standard 2D',
        language: 'English',
        pricing: { standard: 11, premium: 16, vip: 24 },
        seats,
        totalSeats: Object.keys(seats).length,
        bookedSeatsCount: bookedCount,
      });
    });
  });

  return shows;
}

const initialShows = createSeedShows();

const initialBookings: Booking[] = [
  {
    id: 'bk_demo_101',
    bookingCode: 'IMV-9428-TX',
    userId: 'user_demo',
    userName: 'Alex Vance',
    userEmail: 'alex@cinephile.com',
    userPhone: '+1 (555) 392-8172',
    movieId: 'mov_odyssey_stars',
    movieTitle: 'Odyssey of Stars',
    moviePoster: '/src/assets/images/poster_sci_fi_1793119908580.jpg',
    theatreId: 'th_imax_metropolis',
    theatreName: 'IMAX Metropolis Grand',
    theatreAddress: '450 Broadway & 42nd St, Times Square, New York',
    screenName: 'Auditorium 1 (IMAX Laser)',
    format: 'IMAX 3D',
    showId: initialShows[0]?.id || 'show_101',
    showDate: initialShows[0]?.date || new Date().toISOString().split('T')[0],
    showTime: '05:30 PM',
    seats: [
      { seatId: 'G-7', row: 'G', number: 7, tier: 'vip', price: 30 },
      { seatId: 'G-8', row: 'G', number: 8, tier: 'vip', price: 30 },
    ],
    subtotal: 60,
    convenienceFee: 4.5,
    tax: 5.8,
    totalAmount: 70.3,
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    bookingStatus: 'confirmed',
    qrCodeToken: 'IMV-QR-ODYSSEY-G7G8-CONFIRMED-2026',
    bookedAt: '2026-10-26T14:20:00Z',
  },
];

const initialPayments: PaymentTransaction[] = [
  {
    id: 'pay_demo_101',
    bookingId: 'bk_demo_101',
    userId: 'user_demo',
    amount: 70.3,
    method: 'card',
    status: 'completed',
    transactionRef: 'TXN-9028472910',
    timestamp: '2026-10-26T14:20:05Z',
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'user_demo',
    title: 'Booking Confirmed!',
    message: 'Your tickets for Odyssey of Stars (IMAX 3D) are confirmed for seats G-7, G-8.',
    type: 'booking',
    read: false,
    createdAt: '2026-10-26T14:20:06Z',
    link: '/dashboard',
  },
  {
    id: 'notif_2',
    userId: 'user_demo',
    title: 'IMAX Laser Experience Reminder',
    message: 'Doors open 20 minutes prior to showtime at IMAX Metropolis Grand.',
    type: 'reminder',
    read: true,
    createdAt: '2026-10-26T14:25:00Z',
  },
];

class CinemaDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInit();
    // Run background lock sweeper every 30 seconds
    setInterval(() => this.cleanExpiredLocks(), 30000);
  }

  private loadOrInit(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.movies && parsed.shows && parsed.users) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing store, initializing new seed DB:', err);
    }

    const defaultData: DatabaseSchema = {
      users: initialUsers,
      movies: initialMovies,
      theatres: initialTheatres,
      shows: initialShows,
      bookings: initialBookings,
      payments: initialPayments,
      notifications: initialNotifications,
    };
    this.save(defaultData);
    return defaultData;
  }

  private save(dataToSave = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  public cleanExpiredLocks() {
    const now = Date.now();
    let changed = false;

    this.data.shows.forEach((show) => {
      Object.values(show.seats).forEach((seat) => {
        if (seat.status === 'locked' && seat.lockedExpiresAt && seat.lockedExpiresAt < now) {
          seat.status = 'available';
          delete seat.lockedBy;
          delete seat.lockedExpiresAt;
          changed = true;
        }
      });
    });

    if (changed) {
      this.save();
    }
  }

  // Users
  public getUsers() {
    return this.data.users;
  }

  public findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Movies
  public getMovies() {
    return this.data.movies;
  }

  public getMovieById(id: string) {
    return this.data.movies.find((m) => m.id === id);
  }

  public addMovie(movie: Movie) {
    this.data.movies.unshift(movie);
    this.save();
    return movie;
  }

  public updateMovie(id: string, updates: Partial<Movie>) {
    const index = this.data.movies.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.data.movies[index] = { ...this.data.movies[index], ...updates };
    this.save();
    return this.data.movies[index];
  }

  public deleteMovie(id: string) {
    const index = this.data.movies.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.data.movies.splice(index, 1);
    // Also remove associated shows
    this.data.shows = this.data.shows.filter((s) => s.movieId !== id);
    this.save();
    return true;
  }

  // Theatres
  public getTheatres() {
    return this.data.theatres;
  }

  public getTheatreById(id: string) {
    return this.data.theatres.find((t) => t.id === id);
  }

  public addTheatre(theatre: Theatre) {
    this.data.theatres.push(theatre);
    this.save();
    return theatre;
  }

  // Shows
  public getShows(filter?: { movieId?: string; theatreId?: string; date?: string }) {
    this.cleanExpiredLocks();
    return this.data.shows.filter((s) => {
      if (filter?.movieId && s.movieId !== filter.movieId) return false;
      if (filter?.theatreId && s.theatreId !== filter.theatreId) return false;
      if (filter?.date && s.date !== filter.date) return false;
      return true;
    });
  }

  public getShowById(id: string) {
    this.cleanExpiredLocks();
    return this.data.shows.find((s) => s.id === id);
  }

  public addShow(show: Show) {
    this.data.shows.push(show);
    this.save();
    return show;
  }

  public deleteShow(id: string) {
    const idx = this.data.shows.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.shows.splice(idx, 1);
    this.save();
    return true;
  }

  // Lock Seats for checkout (8 minutes hold)
  public lockSeats(showId: string, seatIds: string[], userId: string, holdMinutes = 8) {
    this.cleanExpiredLocks();
    const show = this.data.shows.find((s) => s.id === showId);
    if (!show) throw new Error('Show not found');

    const expiresAt = Date.now() + holdMinutes * 60 * 1000;

    // First verify all requested seats are available or locked by this user
    for (const seatId of seatIds) {
      const seat = show.seats[seatId];
      if (!seat) throw new Error(`Seat ${seatId} does not exist`);
      if (seat.status === 'booked') throw new Error(`Seat ${seatId} is already booked`);
      if (seat.status === 'locked' && seat.lockedBy !== userId && seat.lockedExpiresAt && seat.lockedExpiresAt > Date.now()) {
        throw new Error(`Seat ${seatId} is currently reserved by another guest`);
      }
    }

    // Lock them
    for (const seatId of seatIds) {
      const seat = show.seats[seatId];
      seat.status = 'locked';
      seat.lockedBy = userId;
      seat.lockedExpiresAt = expiresAt;
    }

    this.save();
    return {
      success: true,
      expiresAt,
      seats: seatIds.map((id) => show.seats[id]),
    };
  }

  public releaseSeats(showId: string, seatIds: string[], userId: string) {
    const show = this.data.shows.find((s) => s.id === showId);
    if (!show) return;

    seatIds.forEach((id) => {
      const seat = show.seats[id];
      if (seat && seat.status === 'locked' && seat.lockedBy === userId) {
        seat.status = 'available';
        delete seat.lockedBy;
        delete seat.lockedExpiresAt;
      }
    });
    this.save();
  }

  // Bookings
  public getBookings(userId?: string) {
    if (userId) {
      return this.data.bookings.filter((b) => b.userId === userId);
    }
    return this.data.bookings;
  }

  public getBookingById(id: string) {
    return this.data.bookings.find((b) => b.id === id);
  }

  public createBooking(booking: Booking) {
    // Permanently mark seats as booked in the show
    const show = this.data.shows.find((s) => s.id === booking.showId);
    if (show) {
      booking.seats.forEach((bookedSeat) => {
        if (show.seats[bookedSeat.seatId]) {
          show.seats[bookedSeat.seatId].status = 'booked';
          delete show.seats[bookedSeat.seatId].lockedBy;
          delete show.seats[bookedSeat.seatId].lockedExpiresAt;
        }
      });
      show.bookedSeatsCount = Object.values(show.seats).filter((s) => s.status === 'booked').length;
    }

    this.data.bookings.unshift(booking);

    // Create payment transaction record
    const paymentRecord: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      bookingId: booking.id,
      userId: booking.userId,
      amount: booking.totalAmount,
      method: (booking.paymentMethod as any) || 'card',
      status: 'completed',
      transactionRef: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.payments.unshift(paymentRecord);

    // Create user notification
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.userId,
      title: 'Ticket Confirmed',
      message: `Your reservation for "${booking.movieTitle}" (${booking.seats.map((s) => s.seatId).join(', ')}) is confirmed at ${booking.theatreName}.`,
      type: 'booking',
      read: false,
      createdAt: new Date().toISOString(),
      link: '/dashboard',
    });

    this.save();
    return booking;
  }

  public cancelBooking(bookingId: string, userId: string, isAdmin = false) {
    const booking = this.data.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    if (!isAdmin && booking.userId !== userId) throw new Error('Unauthorized cancellation');
    if (booking.bookingStatus === 'cancelled') throw new Error('Booking is already cancelled');

    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    // 90% refund policy (10% cancellation charge)
    booking.refundAmount = Number((booking.totalAmount * 0.9).toFixed(2));
    booking.paymentStatus = 'refunded';

    // Release seats in the show
    const show = this.data.shows.find((s) => s.id === booking.showId);
    if (show) {
      booking.seats.forEach((seat) => {
        if (show.seats[seat.seatId]) {
          show.seats[seat.seatId].status = 'available';
          delete show.seats[seat.seatId].lockedBy;
          delete show.seats[seat.seatId].lockedExpiresAt;
        }
      });
      show.bookedSeatsCount = Object.values(show.seats).filter((s) => s.status === 'booked').length;
    }

    // Add cancellation notification
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingCode} for "${booking.movieTitle}" was cancelled. Refund of $${booking.refundAmount} initiated.`,
      type: 'cancellation',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return booking;
  }

  // Notifications
  public getNotifications(userId: string) {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  public markNotificationAsRead(id: string) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
    return notif;
  }

  public markAllNotificationsAsRead(userId: string) {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  // Analytics for Admin
  public getAnalytics() {
    const confirmedBookings = this.data.bookings.filter((b) => b.bookingStatus === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + b.seats.length, 0);

    let totalCapacity = 0;
    let totalBookedInShows = 0;
    this.data.shows.forEach((s) => {
      totalCapacity += s.totalSeats;
      totalBookedInShows += s.bookedSeatsCount;
    });

    const occupancyRate = totalCapacity > 0 ? Math.round((totalBookedInShows / totalCapacity) * 100) : 0;

    // Revenue by movie
    const movieMap: Record<string, { title: string; revenue: number; tickets: number }> = {};
    confirmedBookings.forEach((b) => {
      if (!movieMap[b.movieId]) {
        movieMap[b.movieId] = { title: b.movieTitle, revenue: 0, tickets: 0 };
      }
      movieMap[b.movieId].revenue += b.totalAmount;
      movieMap[b.movieId].tickets += b.seats.length;
    });

    const revenueByMovie = Object.entries(movieMap).map(([movieId, val]) => ({
      movieId,
      title: val.title,
      revenue: Number(val.revenue.toFixed(2)),
      tickets: val.tickets,
    }));

    // Daily sales last 7 days
    const dailySalesMap: Record<string, { amount: number; tickets: number }> = {};
    confirmedBookings.forEach((b) => {
      const d = b.bookedAt.split('T')[0];
      if (!dailySalesMap[d]) dailySalesMap[d] = { amount: 0, tickets: 0 };
      dailySalesMap[d].amount += b.totalAmount;
      dailySalesMap[d].tickets += b.seats.length;
    });

    const dailySales = Object.entries(dailySalesMap).map(([date, val]) => ({
      date,
      amount: Number(val.amount.toFixed(2)),
      tickets: val.tickets,
    }));

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalBookings: this.data.bookings.length,
      totalTicketsSold,
      occupancyRate,
      activeMoviesCount: this.data.movies.filter((m) => m.status === 'now_showing').length,
      activeTheatresCount: this.data.theatres.length,
      recentBookings: this.data.bookings.slice(0, 10),
      revenueByMovie,
      dailySales,
    };
  }

  public resetDemoData() {
    this.data = {
      users: initialUsers,
      movies: initialMovies,
      theatres: initialTheatres,
      shows: createSeedShows(),
      bookings: initialBookings,
      payments: initialPayments,
      notifications: initialNotifications,
    };
    this.save();
    return true;
  }
}

export const db = new CinemaDatabase();
