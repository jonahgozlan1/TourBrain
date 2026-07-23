import { notFound } from "next/navigation";
import { AddContactForm } from "@/components/show/AddContactForm";
import { AddHotelForm } from "@/components/show/AddHotelForm";
import { AddTravelForm } from "@/components/show/AddTravelForm";
import { ShowContacts } from "@/components/show/ShowContacts";
import { ShowDocuments } from "@/components/show/ShowDocuments";
import { ShowGaps } from "@/components/show/ShowGaps";
import { ShowHeader } from "@/components/show/ShowHeader";
import { ShowHotel } from "@/components/show/ShowHotel";
import { ShowNotes } from "@/components/show/ShowNotes";
import { ShowTimeline } from "@/components/show/ShowTimeline";
import { ShowTravel } from "@/components/show/ShowTravel";
import { getShowDetailGaps } from "@/lib/gaps/showGaps";
import { getShowDetail } from "@/lib/db/queries";

type Props = {
  params: Promise<{ showId: string }>;
};

export default async function ShowPage({ params }: Props) {
  const { showId } = await params;
  const show = await getShowDetail(showId);
  if (!show) notFound();

  const gaps = getShowDetailGaps(show);

  return (
    <main className="min-w-0 space-y-6">
      <ShowHeader show={show} />

      <div className="grid min-w-0 gap-3 [&>*]:min-w-0 sm:grid-cols-2 sm:gap-3.5">
        <div className="min-w-0 sm:col-span-2">
          <ShowGaps gaps={gaps} />
        </div>

        <ShowTimeline show={show} />

        <ShowTravel
          travel={show.travel}
          action={<AddTravelForm showId={show.id} />}
        />

        <ShowHotel
          hotels={show.hotels}
          action={<AddHotelForm showId={show.id} />}
        />

        <ShowContacts
          showId={show.id}
          contacts={show.contacts}
          action={<AddContactForm showId={show.id} />}
        />

        {show.notes ? (
          <div className="min-w-0 sm:col-span-2">
            <ShowNotes notes={show.notes} />
          </div>
        ) : null}

        <div className="min-w-0 sm:col-span-2">
          <ShowDocuments documents={show.documents} />
        </div>
      </div>
    </main>
  );
}
