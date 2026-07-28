import { createClient } from "@/lib/supabase/server";
import { withSignedDocumentUrls } from "@/lib/documents/signedUrl";
import {
  mapDocument,
  mapHotel,
  mapShow,
  mapShowDetail,
  mapTour,
  mapTourWithShows,
  mapTravel,
  type ContactRow,
  type DocumentRow,
  type HotelRow,
  type ShowRow,
  type TourRow,
  type TravelRow,
} from "@/lib/db/mappers";
import type {
  Document,
  Hotel,
  Show,
  ShowDetail,
  Tour,
  TourWithShows,
  Travel,
} from "@/lib/types/domain";

export type ShowTravelAndHotels = {
  travelByShow: Map<string, Travel[]>;
  hotelsByShow: Map<string, Hotel[]>;
};

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return { supabase, user };
}

/** Ensures a profiles row exists (covers users created before the trigger). */
export async function ensureProfile() {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      name:
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split("@")[0] ??
        null,
    });
    if (error) throw error;
  }

  return { supabase, user };
}

export async function getPrimaryTour(): Promise<TourWithShows | null> {
  const { supabase, user } = await ensureProfile();

  const { data: tour, error } = await supabase
    .from("tours")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!tour) return null;

  const { data: shows, error: showsError } = await supabase
    .from("shows")
    .select("*")
    .eq("tour_id", tour.id)
    .order("date", { ascending: true });

  if (showsError) throw showsError;

  return mapTourWithShows(tour as TourRow, (shows ?? []) as ShowRow[]);
}

export async function getTravelAndHotelsByShowId(
  showIds: string[],
): Promise<ShowTravelAndHotels> {
  const travelByShow = new Map<string, Travel[]>();
  const hotelsByShow = new Map<string, Hotel[]>();

  if (showIds.length === 0) {
    return { travelByShow, hotelsByShow };
  }

  const { supabase } = await ensureProfile();

  const [travelRes, hotelsRes] = await Promise.all([
    supabase.from("travel").select("*").in("show_id", showIds),
    supabase.from("hotels").select("*").in("show_id", showIds),
  ]);

  if (travelRes.error) throw travelRes.error;
  if (hotelsRes.error) throw hotelsRes.error;

  for (const row of (travelRes.data ?? []) as TravelRow[]) {
    const mapped = mapTravel(row);
    const list = travelByShow.get(mapped.showId) ?? [];
    list.push(mapped);
    travelByShow.set(mapped.showId, list);
  }

  for (const row of (hotelsRes.data ?? []) as HotelRow[]) {
    const mapped = mapHotel(row);
    const list = hotelsByShow.get(mapped.showId) ?? [];
    list.push(mapped);
    hotelsByShow.set(mapped.showId, list);
  }

  return { travelByShow, hotelsByShow };
}

export async function getTourById(tourId: string): Promise<Tour | null> {
  const { supabase, user } = await ensureProfile();

  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("id", tourId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTour(data as TourRow) : null;
}

export async function getShowDetail(
  showId: string,
): Promise<ShowDetail | null> {
  const { supabase, user } = await ensureProfile();

  const { data: show, error } = await supabase
    .from("shows")
    .select("*, tours!inner(user_id)")
    .eq("id", showId)
    .eq("tours.user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!show) return null;

  const showRow = show as ShowRow;

  const [contactsRes, travelRes, hotelsRes, documentsRes] = await Promise.all([
    supabase
      .from("show_contacts")
      .select("contacts(*)")
      .eq("show_id", showId),
    supabase.from("travel").select("*").eq("show_id", showId),
    supabase.from("hotels").select("*").eq("show_id", showId),
    supabase.from("documents").select("*").eq("show_id", showId),
  ]);

  if (contactsRes.error) throw contactsRes.error;
  if (travelRes.error) throw travelRes.error;
  if (hotelsRes.error) throw hotelsRes.error;
  if (documentsRes.error) throw documentsRes.error;

  const contacts = (contactsRes.data ?? [])
    .map((row) => {
      const nested = row.contacts as ContactRow | ContactRow[] | null;
      if (!nested) return null;
      return Array.isArray(nested) ? nested[0] : nested;
    })
    .filter((c): c is ContactRow => Boolean(c));

  const detail = mapShowDetail({
    show: showRow,
    contacts,
    travel: (travelRes.data ?? []) as TravelRow[],
    hotels: (hotelsRes.data ?? []) as HotelRow[],
    documents: (documentsRes.data ?? []) as DocumentRow[],
  });

  return {
    ...detail,
    documents: await withSignedDocumentUrls(supabase, detail.documents),
  };
}

export async function getShow(showId: string): Promise<Show | null> {
  const detail = await getShowDetail(showId);
  if (!detail) return null;
  const { contacts, travel, hotels, documents, ...show } = detail;
  void contacts;
  void travel;
  void hotels;
  void documents;
  return show;
}

export async function listTourDocuments() {
  const { supabase, user } = await ensureProfile();
  const tour = await getPrimaryTour();
  if (!tour) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("tour_id", tour.id)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapDocument(row as DocumentRow));
}
