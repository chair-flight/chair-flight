import { useEffect, useState } from "react";

export const useAnnexDimensions = (
  src: string,
  known: { width?: number; height?: number },
) => {
  const [loaded, setLoaded] = useState<{
    src: string;
    width: number;
    height: number;
  }>();
  const knownWidth = known.width;
  const knownHeight = known.height;

  useEffect(() => {
    if (knownWidth && knownHeight) return;
    const image = new Image();
    image.onload = () =>
      setLoaded({
        src,
        width: image.naturalWidth || 1000,
        height: image.naturalHeight || 1000,
      });
    image.src = src;
    return () => {
      image.onload = null;
    };
  }, [src, knownWidth, knownHeight]);

  if (knownWidth && knownHeight)
    return { width: knownWidth, height: knownHeight };
  return loaded?.src === src ? loaded : undefined;
};
