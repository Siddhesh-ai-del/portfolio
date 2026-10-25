import SectionList from './SectionList';
import { eventItems } from '../lib/sectionData';

// Events — section /07. Plain band, between the deep Hackathons and deep
// Posts bands. Its one real entry (IdeaFusion 2026–27) is a featured row:
// banner, description, fact tags and a photo gallery, driven entirely by the
// optional fields in sectionData's `eventItems`.
export default function Events() {
  return (
    <SectionList
      id="events"
      number="/07"
      title="Events"
      items={eventItems}
    />
  );
}
