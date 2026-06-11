# Sumant Digital Universe

An immersive liquid-glass social universe for `@Hey_sumant`.

## Preview

From this folder, run:

```bash
/Users/sumantraj/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Included

- Full-screen Three.js universe background
- Cinematic intro with skip control
- Sumant avatar asset from the supplied image
- Link share thumbnail in `assets/social-preview.png`
- Floating social nodes with animated SVG connections
- Direct social links for Instagram, Snapchat, Telegram, YouTube, Spotify, GitHub, LinkedIn fallback, and Linktree
- Contact portal ready for WhatsApp or email forwarding
- Mood and ambience controls
- Responsive mobile layout
- Local-only MP3 support with a public-safe Spotify fallback when the file is not deployed

The public version uses CDN-hosted libraries and does not publish the local MP3 file.

## Contact Forwarding

Open `src/app.js` and set one of these values:

```js
const contactDestination = {
  email: "your-email@example.com",
  whatsapp: "91XXXXXXXXXX",
};
```

For a deployed site, update the Open Graph image URL in `index.html` to the full deployed URL for best link previews.
