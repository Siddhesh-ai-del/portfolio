import SectionList from './SectionList';
import { eventItems } from '../lib/sectionData';

// Events — section /07 (talks, meetups and related write-ups). Plain band,
// between the deep Hackathons and deep Posts bands.
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
