/** Domain types for Tourbase — mirrors Supabase schema, used by UI + extraction. */

export type ShowStatus = "draft" | "confirmed" | "cancelled" | "completed";

export type TravelType = "flight" | "train" | "bus" | "car" | "other";

export type DocumentType =
  | "contract"
  | "flight"
  | "travel"
  | "hotel"
  | "rider"
  | "hospitality_rider"
  | "email"
  | "spreadsheet"
  | "other";

export type ExtractionStatus =
  | "pending"
  | "processing"
  | "ready_for_review"
  | "applied"
  | "failed";

export type Tour = {
  id: string;
  userId: string;
  name: string;
  artistName: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Show = {
  id: string;
  tourId: string;
  date: string;
  city: string | null;
  country: string | null;
  venue: string | null;
  promoter: string | null;
  status: ShowStatus;
  loadInTime: string | null;
  soundcheckTime: string | null;
  doorsTime: string | null;
  showTime: string | null;
  curfew: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  userId: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
};

export type Travel = {
  id: string;
  showId: string;
  type: TravelType;
  date: string | null;
  departure: string | null;
  arrival: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  confirmationNumber: string | null;
  notes: string | null;
};

export type Hotel = {
  id: string;
  showId: string;
  name: string | null;
  address: string | null;
  checkIn: string | null;
  checkOut: string | null;
  confirmationNumber: string | null;
  notes: string | null;
};

export type Document = {
  id: string;
  tourId: string;
  showId: string | null;
  fileUrl: string;
  fileName: string;
  documentType: DocumentType;
  extractionStatus: ExtractionStatus;
  extractedJson: unknown | null;
  uploadedAt: string;
  rawText?: string | null;
  extractionError?: string | null;
};

/** Show with related entities for the Show page. */
export type ShowDetail = Show & {
  contacts: Contact[];
  travel: Travel[];
  hotels: Hotel[];
  documents: Document[];
};

export type TourWithShows = Tour & {
  shows: Show[];
};

/** Core fields we expect for a usable show day (gap detection). */
export const SHOW_CORE_FIELDS = [
  "date",
  "city",
  "venue",
  "showTime",
  "loadInTime",
  "soundcheckTime",
  "doorsTime",
  "curfew",
  "promoter",
] as const;

export type ShowCoreField = (typeof SHOW_CORE_FIELDS)[number];

export type ShowGap = {
  field: ShowCoreField | "hotel" | "travel";
  label: string;
};
