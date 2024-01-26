import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry, Render } from "astro:content";

export interface Props {
  href?: string;
  tip: CollectionEntry<"tips">['data'];
  secHeading?: boolean;
  content: Render<'md'>['Content'];
}

export default function TipCard({ href, tip, content: Content, secHeading = true }: Props) {
  const { title } = tip;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 {...headerProps}>{title}</h2>
        ) : (
          <h3 {...headerProps}>{title}</h3>
        )}
      </a>
      <p>
          <Content/>
      </p>
    </li>
  );
}
