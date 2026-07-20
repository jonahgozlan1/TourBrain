/** Strict JSON shape returned by Ask (Phase 4). Prefer null over invented answers. */

export type AskCitationKind =
  | "show"
  | "travel"
  | "hotel"
  | "contact"
  | "gap";

export type AskCitation = {
  showId: string;
  label: string;
  kind: AskCitationKind;
};

export type AskResult = {
  answer: string | null;
  citations: AskCitation[];
  unknowns: string[];
};

export type AskTourContextShow = {
  id: string;
  date: string;
  city: string | null;
  country: string | null;
  venue: string | null;
  promoter: string | null;
  status: string;
  loadInTime: string | null;
  soundcheckTime: string | null;
  doorsTime: string | null;
  showTime: string | null;
  curfew: string | null;
  notes: string | null;
  gaps: string[];
  travel: Array<{
    type: string;
    date: string | null;
    departure: string | null;
    arrival: string | null;
    departureTime: string | null;
    arrivalTime: string | null;
    confirmationNumber: string | null;
    notes: string | null;
  }>;
  hotels: Array<{
    name: string | null;
    address: string | null;
    checkIn: string | null;
    checkOut: string | null;
    confirmationNumber: string | null;
    notes: string | null;
  }>;
  contacts: Array<{
    name: string;
    company: string | null;
    role: string | null;
    email: string | null;
    phone: string | null;
  }>;
};

export type AskTourContext = {
  tour: {
    id: string;
    name: string;
    artistName: string;
    startDate: string | null;
    endDate: string | null;
  };
  shows: AskTourContextShow[];
};
