/**
 * Strict JSON shapes the AI must return per document type.
 * Prefer null over invented values.
 */

export type ContractExtraction = {
  document_type: "contract";
  show: {
    date: string | null;
    venue: string | null;
    city: string | null;
    country: string | null;
    doors_time: string | null;
    show_time: string | null;
    load_in_time: string | null;
    soundcheck_time: string | null;
    curfew: string | null;
    promoter: string | null;
  };
  contact: {
    name: string | null;
    company: string | null;
    role: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  matched_show_hint: {
    date: string | null;
    city: string | null;
    venue: string | null;
  } | null;
};

/** Flights, tour bus, train, car, etc. */
export type TravelExtraction = {
  document_type: "travel";
  travel: {
    type: "flight" | "train" | "bus" | "car" | "other";
    date: string | null;
    departure: string | null;
    arrival: string | null;
    departure_time: string | null;
    arrival_time: string | null;
    confirmation_number: string | null;
    notes: string | null;
  };
  matched_show_hint: {
    date: string | null;
    city: string | null;
  } | null;
};

/** @deprecated Use TravelExtraction — kept for older review payloads */
export type FlightExtraction = {
  document_type: "flight";
  travel: {
    type: "flight";
    date: string | null;
    departure: string | null;
    arrival: string | null;
    departure_time: string | null;
    arrival_time: string | null;
    confirmation_number: string | null;
  };
  matched_show_hint: {
    date: string | null;
    city: string | null;
  } | null;
};

export type HotelExtraction = {
  document_type: "hotel";
  hotel: {
    name: string | null;
    address: string | null;
    check_in: string | null;
    check_out: string | null;
    confirmation_number: string | null;
    notes: string | null;
  };
  matched_show_hint: {
    date: string | null;
    city: string | null;
  } | null;
};

export type ExtractionResult =
  | ContractExtraction
  | TravelExtraction
  | FlightExtraction
  | HotelExtraction;
