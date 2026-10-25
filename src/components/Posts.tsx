import SectionList from './SectionList';
import { postItems } from '../lib/sectionData';

// Posts — section /08 (articles and write-ups). Deep band, closing the
// plain/deep alternation before the footer.
export default function Posts() {
  return (
    <SectionList
      id="posts"
      number="/08"
      title="Posts"
      items={postItems}
      className="bg-paper-deep"
    />
  );
}
