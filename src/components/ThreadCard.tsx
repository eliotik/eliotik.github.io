import type { CollectionEntry } from "astro:content";

export interface Props {
  href: string;
  frontmatter: CollectionEntry<"blog">["data"];
}

export default function ThreadCard({ href, frontmatter}: Props) {
  const { title, description } = frontmatter;

  return (
      <li className="sm:min-w-[17rem] bg-gray-50 dark:bg-carddark p-4 rounded hover:shadow-md hover:bg-gray-100">
          <div className="mb-2">
              <a href={href} className="link inline-block">
                  <h3 className="inline-block text-lg font-medium text-skin-accent underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0 decoration-dashed hover:underline">
                      {title}
                  </h3>
              </a>
          </div>
          <p
              className="dark:text-gray-800 text-sm w-60 overflow-hidden">
              {description}
          </p>
      </li>
  );
}
