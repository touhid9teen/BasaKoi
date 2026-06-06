import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BasaKoi — Bangladesh Property Rentals",
    short_name: "BasaKoi",
    description:
      "Map-based rental and sublet finder for Bangladesh. Find apartments, sublets, and rental properties near you.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#059669",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
