import type {
  Contact,
  Document,
  DocumentType,
  ExtractionStatus,
  Hotel,
  Show,
  ShowDetail,
  ShowStatus,
  Tour,
  TourWithShows,
  Travel,
  TravelType,
} from "@/lib/types/domain";

export type TourRow = {
  id: string;
  user_id: string;
  name: string;
  artist_name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ShowRow = {
  id: string;
  tour_id: string;
  date: string;
  city: string | null;
  country: string | null;
  venue: string | null;
  promoter: string | null;
  status: ShowStatus;
  load_in_time: string | null;
  soundcheck_time: string | null;
  doors_time: string | null;
  show_time: string | null;
  curfew: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactRow = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
};

export type TravelRow = {
  id: string;
  show_id: string;
  type: TravelType;
  date: string | null;
  departure: string | null;
  arrival: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  confirmation_number: string | null;
  notes: string | null;
};

export type HotelRow = {
  id: string;
  show_id: string;
  name: string | null;
  address: string | null;
  check_in: string | null;
  check_out: string | null;
  confirmation_number: string | null;
  notes: string | null;
};

export type DocumentRow = {
  id: string;
  tour_id: string;
  show_id: string | null;
  file_url: string;
  file_name: string;
  document_type: DocumentType;
  extraction_status: ExtractionStatus;
  extracted_json: unknown | null;
  uploaded_at: string;
  raw_text?: string | null;
  extraction_error?: string | null;
};

/** Postgres `time` may come back as HH:MM:SS — normalize to HH:MM for forms/UI. */
function mapTime(value: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

export function mapTour(row: TourRow): Tour {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    artistName: row.artist_name,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapShow(row: ShowRow): Show {
  return {
    id: row.id,
    tourId: row.tour_id,
    date: row.date,
    city: row.city,
    country: row.country,
    venue: row.venue,
    promoter: row.promoter,
    status: row.status,
    loadInTime: mapTime(row.load_in_time),
    soundcheckTime: mapTime(row.soundcheck_time),
    doorsTime: mapTime(row.doors_time),
    showTime: mapTime(row.show_time),
    curfew: mapTime(row.curfew),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContact(row: ContactRow): Contact {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    company: row.company,
    role: row.role,
    email: row.email,
    phone: row.phone,
  };
}

export function mapTravel(row: TravelRow): Travel {
  return {
    id: row.id,
    showId: row.show_id,
    type: row.type,
    date: row.date,
    departure: row.departure,
    arrival: row.arrival,
    departureTime: mapTime(row.departure_time),
    arrivalTime: mapTime(row.arrival_time),
    confirmationNumber: row.confirmation_number,
    notes: row.notes,
  };
}

export function mapHotel(row: HotelRow): Hotel {
  return {
    id: row.id,
    showId: row.show_id,
    name: row.name,
    address: row.address,
    checkIn: row.check_in,
    checkOut: row.check_out,
    confirmationNumber: row.confirmation_number,
    notes: row.notes,
  };
}

export function mapDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    tourId: row.tour_id,
    showId: row.show_id,
    fileUrl: row.file_url,
    fileName: row.file_name,
    documentType: row.document_type,
    extractionStatus: row.extraction_status,
    extractedJson: row.extracted_json,
    uploadedAt: row.uploaded_at,
    rawText: row.raw_text ?? null,
    extractionError: row.extraction_error ?? null,
  };
}

export function mapTourWithShows(
  tour: TourRow,
  shows: ShowRow[],
): TourWithShows {
  return {
    ...mapTour(tour),
    shows: shows.map(mapShow),
  };
}

export function mapShowDetail(input: {
  show: ShowRow;
  contacts: ContactRow[];
  travel: TravelRow[];
  hotels: HotelRow[];
  documents: DocumentRow[];
}): ShowDetail {
  return {
    ...mapShow(input.show),
    contacts: input.contacts.map(mapContact),
    travel: input.travel.map(mapTravel),
    hotels: input.hotels.map(mapHotel),
    documents: input.documents.map(mapDocument),
  };
}
