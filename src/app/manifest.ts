import type { MetadataRoute } from "next";

import { APP_DESCRIPTION, APP_NAME, APP_BRAND_NAME } from "@/config/navigation";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_BRAND_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#203e51",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
