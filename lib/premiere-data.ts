// =============================================================================
// Single source of truth for all types, data models, and configuration.
// =============================================================================

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ShowType = "Industry" | "Public" | "Cuttack Premiere";

export type ShowStatus = "available" | "soldout" | "cancelled";

// ─── Core Models ─────────────────────────────────────────────────────────────

export type Show = {
  /** Unique within a city; used as URL param */
  type: ShowType;
  /** Human-readable label, e.g. "Industry Premiere" */
  label: string;
  /** Display date string, e.g. "Wednesday, April 8" */
  date: string;
  /** ISO 8601 date for sorting / countdown purposes */
  isoDate: string;
  /** Display time string, e.g. "7:30 pm onwards" */
  time: string;
  /** Material Symbols icon name */
  icon: string;
  /** Short description shown on the card */
  description: string;
  /** Price per ticket in INR */
  pricePerTicket: number;
  /** Total seats available for this show */
  totalSeats: number;
  /** Operational status */
  status: ShowStatus;
};

export type City = {
  /** URL-safe key, lowercase, no spaces, e.g. "bhubaneswar" */
  key: string;
  /** Exact display name used in headings */
  displayName: string;
  /** All shows/premieres happening in this city */
  shows: Show[];
};

// ─── Derived / Utility Types ─────────────────────────────────────────────────

/** Identifies a specific show unambiguously across cities */
export type ShowRef = {
  cityKey: string;
  showType: ShowType;
};

/** Everything needed to render a booking summary / confirmation */
export type BookingDetails = {
  name: string;
  email: string;
  phone: string;
  city: City;
  show: Show;
  ticketCount: number;
  totalAmount: number;
  bookedAt: Date;
  paymentId: string;
  paymentDetails: PaymentDetails | null;
};

export type PaymentDetails = {
  method: string;
  card_network: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
};

export type BookingForm = {
  name: string;
  phone: string;
  email: string;
  ticketCount: number;
};

export type BookingStep = "form" | "payment" | "success";

// ─── Data ────────────────────────────────────────────────────────────────────

export const CITIES: City[] = [
  {
    key: "bhubaneswar",
    displayName: "Bhubaneswar",
    shows: [
      {
        type: "Public",
        label: "Public Premiere",
        date: "Thursday, April 9",
        isoDate: "2025-04-09",
        time: "7:00 pm onwards",
        icon: "groups",
        description: "A special first screening with the Cast & Crew in attendance",
        pricePerTicket: 350,
        totalSeats: 1200,
        status: "available",
      },
      {
        type: "Industry",
        label: "Industry Premiere",
        date: "Friday, April 10",
        isoDate: "2025-04-10",
        time: "7:30 pm onwards",
        icon: "groups",
        description:
          "An exclusive screening with the Cast & Crew and Esteemed Members of the Film Fraternity",
        pricePerTicket: 400,
        totalSeats: 300,
        status: "available",
      },
    ],
  },
  {
    key: "cuttack",
    displayName: "Cuttack",
    shows: [
      {
        type: "Cuttack Premiere",
        label: "Cuttack Premiere",
        date: "Thursday, April 9",
        isoDate: "2025-04-09",
        time: "3:00 pm onwards",
        icon: "groups",
        description: "A special screening with the Cast & Crew in attendance.",
        pricePerTicket: 350,
        totalSeats: 200,
        status: "available",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Add more cities here, e.g.:
  //
  // {
  //   key: "sambalpur",
  //   displayName: "Sambalpur",
  //   shows: [ ... ],
  // },
  // ---------------------------------------------------------------------------
];

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/** Returns the City object for a given key (case-insensitive), or undefined. */
export function getCityByKey(key: string): City | undefined {
  return CITIES.find((c) => c.key === key.trim().toLowerCase());
}

/** Returns the City object whose displayName matches (case-insensitive), or undefined. */
export function getCityByDisplayName(name: string): City | undefined {
  return CITIES.find(
    (c) => c.displayName.toLowerCase() === name.trim().toLowerCase()
  );
}

/** Returns a specific show within a city, or undefined. */
export function getShow(cityKey: string, showType: ShowType): Show | undefined {
  return getCityByKey(cityKey)?.shows.find((s) => s.type === showType);
}

// ─── Business-Rule Helpers ────────────────────────────────────────────────────

export const GLOBAL_MAX_PER_BOOKING = 25;

/**
 * Maximum tickets a single user can book for a given show.
 * Capped at both the show's totalSeats and GLOBAL_MAX_PER_BOOKING.
 */
export function maxTicketsForBooking(show: Show): number {
  return Math.min(show.totalSeats, GLOBAL_MAX_PER_BOOKING);
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/** Turn Razorpay's raw payment data into a human-readable label + optional sub-label */
export function formatPaymentMethod(p: PaymentDetails): {
  label: string;
  sub: string | null;
} {
  switch (p.method) {
    case "card":
      return { label: p.card_network ? `${p.card_network} Card` : "Card", sub: null };
    case "upi":
      return { label: "UPI", sub: p.vpa ?? null };
    case "netbanking":
      return { label: "Net Banking", sub: p.bank ?? null };
    case "wallet":
      return {
        label: p.wallet
          ? p.wallet.charAt(0).toUpperCase() + p.wallet.slice(1) + " Wallet"
          : "Wallet",
        sub: null,
      };
    case "emi":
      return { label: "EMI", sub: p.card_network ?? null };
    case "paylater":
      return { label: "Pay Later", sub: null };
    default:
      return { label: p.method, sub: null };
  }
}
