import { dedent } from "../../base/dedent";

const SITE_ORIGIN = "https://www.chair-flight.com";
const DEFAULT_IMAGE = "/images/social/chair-flight.png";
const DEFAULT_DESCRIPTION = dedent`
  Chair Flight is a community driven aviation
  question bank built by students for students.
`;

export const buildPageHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}) => {
  const imageUrl = image.startsWith("/") ? `${SITE_ORIGIN}${image}` : image;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: type },
      { property: "og:site_name", content: "Chair Flight" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: imageUrl },
      ...(path === undefined
        ? []
        : [{ property: "og:url", content: `${SITE_ORIGIN}${path}` }]),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
    links:
      path === undefined
        ? []
        : [{ rel: "canonical", href: `${SITE_ORIGIN}${path}` }],
  };
};
