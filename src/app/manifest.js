export default function manifest() {
  return {
    name:             "Mohammed Waleed — Full Stack Developer",
    short_name:       "Mohammed Waleed",
    description:      "Full Stack Developer building scalable web applications and RESTful APIs.",
    start_url:        "/",
    display:          "standalone",
    background_color: "#09090F",
    theme_color:      "#8B5CF6",
    lang:             "en",
    icons: [
      { src: "/photo/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/photo/favicon.png", sizes: "192x192", type: "image/png" },
      { src: "/photo/favicon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
