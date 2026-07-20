import type { ShowDetail, TourWithShows } from "@/lib/types/domain";

/** Demo data so UI shells work before Supabase is wired. */

export const DEMO_TOUR_ID = "tour-demo-1";

export const demoTour: TourWithShows = {
  id: DEMO_TOUR_ID,
  userId: "user-demo",
  name: "Summer 2026 European Tour",
  artistName: "Example Artist",
  startDate: "2026-07-20",
  endDate: "2026-07-30",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  shows: [
    {
      id: "show-paris",
      tourId: DEMO_TOUR_ID,
      date: "2026-07-20",
      city: "Paris",
      country: "France",
      venue: "La Cigale",
      promoter: "Paris Live",
      status: "confirmed",
      loadInTime: "14:00",
      soundcheckTime: "16:00",
      doorsTime: "19:00",
      showTime: "20:00",
      curfew: "23:00",
      notes: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "show-amsterdam",
      tourId: DEMO_TOUR_ID,
      date: "2026-07-22",
      city: "Amsterdam",
      country: "Netherlands",
      venue: "Paradiso",
      promoter: null,
      status: "confirmed",
      loadInTime: null,
      soundcheckTime: "15:00",
      doorsTime: "19:30",
      showTime: "20:30",
      curfew: null,
      notes: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "show-berlin",
      tourId: DEMO_TOUR_ID,
      date: "2026-09-15",
      city: "Berlin",
      country: "Germany",
      venue: "Lido Berlin",
      promoter: "XYZ Events",
      status: "confirmed",
      loadInTime: "14:00",
      soundcheckTime: "16:00",
      doorsTime: "19:00",
      showTime: "20:00",
      curfew: "23:00",
      notes: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "show-copenhagen",
      tourId: DEMO_TOUR_ID,
      date: "2026-07-27",
      city: "Copenhagen",
      country: "Denmark",
      venue: "Vega",
      promoter: null,
      status: "draft",
      loadInTime: null,
      soundcheckTime: null,
      doorsTime: null,
      showTime: "21:00",
      curfew: null,
      notes: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ],
};

export const demoShowDetails: Record<string, ShowDetail> = {
  "show-berlin": {
    ...demoTour.shows.find((s) => s.id === "show-berlin")!,
    contacts: [
      {
        id: "contact-sarah",
        userId: "user-demo",
        name: "Sarah Johnson",
        company: "XYZ Events",
        role: "Promoter",
        email: "sarah@xyz.com",
        phone: "+49 30 123456",
      },
    ],
    travel: [
      {
        id: "travel-1",
        showId: "show-berlin",
        type: "flight",
        date: "2026-09-15",
        departure: "Paris (CDG)",
        arrival: "Berlin (BER)",
        departureTime: "10:45",
        arrivalTime: "12:30",
        confirmationNumber: "ABC123",
        notes: null,
      },
    ],
    hotels: [],
    documents: [
      {
        id: "doc-contract",
        tourId: DEMO_TOUR_ID,
        showId: "show-berlin",
        fileUrl: "#",
        fileName: "Berlin_Show_Contract.pdf",
        documentType: "contract",
        extractionStatus: "applied",
        extractedJson: null,
        uploadedAt: "2026-06-01T00:00:00Z",
      },
      {
        id: "doc-rider",
        tourId: DEMO_TOUR_ID,
        showId: "show-berlin",
        fileUrl: "#",
        fileName: "Technical_Rider.pdf",
        documentType: "rider",
        extractionStatus: "applied",
        extractedJson: null,
        uploadedAt: "2026-06-02T00:00:00Z",
      },
    ],
  },
};

export function getDemoShowDetail(showId: string): ShowDetail | null {
  if (demoShowDetails[showId]) return demoShowDetails[showId];

  const show = demoTour.shows.find((s) => s.id === showId);
  if (!show) return null;

  return {
    ...show,
    contacts: [],
    travel: [],
    hotels: [],
    documents: [],
  };
}
