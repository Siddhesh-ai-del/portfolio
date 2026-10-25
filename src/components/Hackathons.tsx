import SectionList from './SectionList';
import { hackathonItems } from '../lib/sectionData';

// Hackathons — section /06. Thin wrapper over the shared SectionList: data
// lives in lib/sectionData.ts (PLACEHOLDER content for now), and the
// `bg-paper-deep` band continues the page's plain/deep alternation after the
// plain Certifications section.
export default function Hackathons() {
  return (
    <SectionList
      id="hackathons"
      number="/06"
      title="Hackathons"
      items={hackathonItems}
      className="bg-paper-deep"
    />
  );
}
