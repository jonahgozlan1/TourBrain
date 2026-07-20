import {
  mapContact,
  mapHotel,
  mapTravel,
  type ContactRow,
  type HotelRow,
  type TravelRow,
} from "@/lib/db/mappers";
import { ensureProfile, getPrimaryTour } from "@/lib/db/queries";
import { getShowGaps } from "@/lib/gaps/showGaps";
import type { AskTourContext } from "@/lib/ask/types";

/**
 * Compact tour graph for Ask — structured DB only (no document raw_text yet).
 */
export async function getTourAskContext(): Promise<AskTourContext | null> {
  const tour = await getPrimaryTour();
  if (!tour) return null;

  const { supabase } = await ensureProfile();
  const showIds = tour.shows.map((s) => s.id);

  if (showIds.length === 0) {
    return {
      tour: {
        id: tour.id,
        name: tour.name,
        artistName: tour.artistName,
        startDate: tour.startDate,
        endDate: tour.endDate,
      },
      shows: [],
    };
  }

  const [travelRes, hotelsRes, contactsRes] = await Promise.all([
    supabase.from("travel").select("*").in("show_id", showIds),
    supabase.from("hotels").select("*").in("show_id", showIds),
    supabase
      .from("show_contacts")
      .select("show_id, contacts(*)")
      .in("show_id", showIds),
  ]);

  if (travelRes.error) throw travelRes.error;
  if (hotelsRes.error) throw hotelsRes.error;
  if (contactsRes.error) throw contactsRes.error;

  const travelByShow = new Map<string, ReturnType<typeof mapTravel>[]>();
  for (const row of (travelRes.data ?? []) as TravelRow[]) {
    const mapped = mapTravel(row);
    const list = travelByShow.get(mapped.showId) ?? [];
    list.push(mapped);
    travelByShow.set(mapped.showId, list);
  }

  const hotelsByShow = new Map<string, ReturnType<typeof mapHotel>[]>();
  for (const row of (hotelsRes.data ?? []) as HotelRow[]) {
    const mapped = mapHotel(row);
    const list = hotelsByShow.get(mapped.showId) ?? [];
    list.push(mapped);
    hotelsByShow.set(mapped.showId, list);
  }

  const contactsByShow = new Map<
    string,
    ReturnType<typeof mapContact>[]
  >();
  for (const row of contactsRes.data ?? []) {
    const showId = (row as { show_id: string }).show_id;
    const nested = (row as { contacts: ContactRow | ContactRow[] | null })
      .contacts;
    if (!nested) continue;
    const contactRow = Array.isArray(nested) ? nested[0] : nested;
    if (!contactRow) continue;
    const list = contactsByShow.get(showId) ?? [];
    list.push(mapContact(contactRow));
    contactsByShow.set(showId, list);
  }

  return {
    tour: {
      id: tour.id,
      name: tour.name,
      artistName: tour.artistName,
      startDate: tour.startDate,
      endDate: tour.endDate,
    },
    shows: tour.shows.map((show) => {
      const travel = travelByShow.get(show.id) ?? [];
      const hotels = hotelsByShow.get(show.id) ?? [];
      const contacts = contactsByShow.get(show.id) ?? [];
      const gaps = getShowGaps(show, travel, hotels);

      return {
        id: show.id,
        date: show.date,
        city: show.city,
        country: show.country,
        venue: show.venue,
        promoter: show.promoter,
        status: show.status,
        loadInTime: show.loadInTime,
        soundcheckTime: show.soundcheckTime,
        doorsTime: show.doorsTime,
        showTime: show.showTime,
        curfew: show.curfew,
        notes: show.notes,
        gaps: gaps.map((g) => g.label),
        travel: travel.map((t) => ({
          type: t.type,
          date: t.date,
          departure: t.departure,
          arrival: t.arrival,
          departureTime: t.departureTime,
          arrivalTime: t.arrivalTime,
          confirmationNumber: t.confirmationNumber,
          notes: t.notes,
        })),
        hotels: hotels.map((h) => ({
          name: h.name,
          address: h.address,
          checkIn: h.checkIn,
          checkOut: h.checkOut,
          confirmationNumber: h.confirmationNumber,
          notes: h.notes,
        })),
        contacts: contacts.map((c) => ({
          name: c.name,
          company: c.company,
          role: c.role,
          email: c.email,
          phone: c.phone,
        })),
      };
    }),
  };
}

/** Gap-driven suggestion prompts for the Ask UI. */
export function buildAskSuggestions(context: AskTourContext): string[] {
  const suggestions: string[] = [];
  const shows = context.shows;

  const missingHotel = shows.find((s) =>
    s.gaps.includes("Hotel"),
  );
  const missingTravel = shows.find((s) => s.gaps.includes("Travel"));
  const withLoadIn = shows.find((s) => s.loadInTime);
  const withHotel = shows.find((s) => s.hotels.length > 0);
  const withTravel = shows.find((s) => s.travel.length > 0);
  const withContact = shows.find((s) => s.contacts.length > 0);

  if (withLoadIn?.city) {
    suggestions.push(`What time is load-in in ${withLoadIn.city}?`);
  }
  if (withHotel?.city) {
    suggestions.push(`Where are we staying in ${withHotel.city}?`);
  }
  if (withTravel) {
    const leg = withTravel.travel[0];
    const dest = leg?.arrival ?? withTravel.city ?? "the next show";
    suggestions.push(`What's the confirmation for travel to ${dest}?`);
  }
  if (missingHotel?.city) {
    suggestions.push(`Which shows are still missing hotel?`);
  } else if (missingTravel) {
    suggestions.push(`Which shows are still missing travel?`);
  }
  if (withContact?.city) {
    suggestions.push(`Who's the contact for ${withContact.city}?`);
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "What's still missing on this tour?",
      "List the next three shows",
      "Summarize today's schedule",
    );
  }

  return [...new Set(suggestions)].slice(0, 5);
}
