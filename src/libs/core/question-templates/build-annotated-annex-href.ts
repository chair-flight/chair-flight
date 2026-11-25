export const buildAnnotatedAnnexHref = (annotatedAnnex: {
  href: string;
  width?: number;
  height?: number;
  annotations: unknown[];
}) => {
  const payload = encodeURIComponent(
    JSON.stringify({
      width: annotatedAnnex.width,
      height: annotatedAnnex.height,
      annotations: annotatedAnnex.annotations,
    }),
  )
    .replaceAll("(", "%28")
    .replaceAll(")", "%29");
  return `${annotatedAnnex.href}?annotated=${payload}`;
};
