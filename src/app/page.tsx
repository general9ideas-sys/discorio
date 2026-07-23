import { Landing } from "@/components/Landing";
import { getActiveEvent } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const event = await getActiveEvent();
  return (
    <Landing
      event={
        event
          ? {
              name: event.name,
              date_iso: event.date_iso,
              venue: event.venue,
              price: event.price,
              remaining: event.remaining,
            }
          : null
      }
    />
  );
}
