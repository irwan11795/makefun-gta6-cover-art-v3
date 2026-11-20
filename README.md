[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/irwan11795/makefun-gta6-cover-art-v3/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/irwan11795/makefun-gta6-cover-art-v3/reward.svg)](https://make.fun/c/gta6-cover-art-01)

# Vice Cover Studio v4.4

Turn any photo + caption into GTA-style cover art: a multi-panel Vice City
poster with bold lettering and a sunset / neon colour grade, exported as a PNG
to share. The app runs offline in a desktop browser from its own static files —
photos are read on your machine and never uploaded.

## What it does

- **Multi-panel layouts** — Four-photo collage (the default: three panels
  across the top with the big one in the middle, one wide panel below),
  Hero + two, Triple vertical, Grid 2×2, Lineup (four equal vertical
  strips, shoulder to shoulder like a police lineup), a Slanted duo,
  Family lineup (five equal vertical strips, shoulder to shoulder — the
  whole Family in one row), and Leader + crew (one big panel for the
  gang's leader, three small panels stacked beside her for the crew),
  Spotlight centre (one big panel in the middle for the leader, four
  small panels in the corners around him for the crew), and Poster
  mosaic (a full-bleed five-panel mosaic — one large centre panel, four
  around it, photos edge to edge — with the title overlapping the art).
  One button shuffles the layout.
- **Five sample-photo sets, one per panel** — the Sunset Heist crew: Marina
  (blonde, dark sunglasses, boulevard at sunset), Dante (curly hair,
  laughing, neon ocean drive), Sofia (red bandana, dancing at dusk) and
  Rico (bearded, round sunglasses, pier at sunset); the Police crew:
  the Chief (policewoman with gold insignia), the Rookie (young patrol
  officer), the Detective (plainclothes, neon street) and the Patrol
  (senior grey-haired officer); and the Family crew: the Don (elderly
  don in a pinstripe suit, thick gold chain, gold rings and a gold
  watch), the Enforcer (muscular thug, double gold chains, gold watch
  and ring), the Bruiser (heavy-set thug, gold chain, gold rings and
  watch), the Vixen (dark wavy hair, red dress, gold necklace, earrings,
  bracelets and rings) and the Siren (sleek dark hair, black-and-gold
  dress, gold chain, hoop earrings, rings and bangle); and the Vice Heroes
  crew: the Leader (charismatic man in his late thirties, slicked-back dark
  hair with grey temples, charcoal suit, gold watch), the Driver
  (auburn-haired woman in a leather racing jacket, neon street behind her),
  the Lookout (young man in a grey hoodie on a rooftop at dusk) and the
  Muscle (shaved head, neck tattoos, black tank top) — four new faces, none
  of them Marina, Dante, Sofia or Rico — plus the Vice City establishing
  shot (a dusk skyline over the port, neon streets, no people in frame)
  for the VICE CITY corner, so the cover shows four different faces and
  the city, never the same face twice; and the Coast crew: Lucia
  (laughing in a convertible at sunset, the big centre panel of the
  Poster mosaic), Marco (standing on a boat at sunset), the beach-party
  crew (four friends laughing under string lights and tiki torches),
  Nina (dancing on a neon street at dusk) and Dario (on a rooftop at
  dusk) — five candid golden-hour faces, all new. All twenty-three photos were
  made with an image model for this entry. Pick a set with the five
  pills in the Photos card, or `?set=police` / `?set=mafia` / `?set=hero` / `?set=coast` in the URL.
  The billing block fills itself in from the four (or five) cast tags.
- **Poster furniture** — a critic-quote strip with five stars and its
  source across the top, a season badge in the top-right corner, a tagline
  under the title, a release line above the billing block, and the seal
  badge in the bottom-left corner. Every word of it is ours. The Poster
  mosaic adds angled cast-tag chips on the photos, a dark pill behind
  the tagline and the billing line, and a barcode plate in the
  bottom-right corner — and its title is a huge gold-orange-pink
  gradient over the art itself, with a hard offset shadow.
- **Any photo, cropped per panel** — drag a panel to move its photo, scroll to
  zoom, or use the sliders. One photo for all panels, or a different photo per
  panel.
- **Caption editing** — big title, subtitle, billing line and release line. The
  billing block fills itself in from the panels' cast tags when left blank.
- **Colour grades** — Vice Sunset, Neon Night, Palm Noir, Pastel Dawn,
  Golden Hour, Mafia Gold (dark brass noir for the Family cover) and
  Sunset Hero (burning red-gold for the Vice Heroes cover), with an
  intensity slider and a random-grade button.
- **Original lettering** — gradient title with outline, drop shadow and a
  slanted option; a seal badge and a release line finish the poster.
- **Export PNG in the common post sizes** — 1080×1080, 1080×1350 and
  1920×1080, one button each or all three at once.
- **Live preview** — every change redraws the cover on the canvas at once.

Everything is original: the sky, skyline and palms are drawn with canvas
paths, the lettering uses system font stacks, and no Rockstar Games logo,
artwork or font is used anywhere.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

Screenshot scenes for the entry: `?shot=editor` shows the editor with the
sample photos loaded, `?shot=cover` shows the cover art full-frame. Both
accept `?layout=collage|hero|trio|grid|lineup|slant|family|leader|spotlight|poster`, `?grade=...`,
`?aspect=square|portrait|wide`, `?mode=one|per-panel`, `?caption=...`,
`?subtitle=...`, `?tagline=...`, `?quote=...`, `?quotesource=...`,
`?badge=...`, `?release=...`, `?seal=...`, `?billing=...` and `?set=heist|police|mafia|hero|coast`, `?tag0=…&tag1=…&tag2=…&tag3=…&tag4=…` to rename a panel's cast tag for one shot,
and `?ay0=…&ay1=…&ay2=…&ay3=…&ay4=…` to frame a panel's
photo from its top (smaller ay) instead of its centre — used by the
Vice Heroes shot so all four faces show whole, forehead to chin —
and `?zoom0=…&zoom1=…` to tighten one panel's crop,
`?photo0=…&photo1=…` to put a different photo of the loaded set on a
panel (the Vice Coast shot puts Nina's direct-to-camera frame in the
centre panel and Lucia's laugh on a side panel),
`?bleed=0` restores the classic inset rendering (white-framed panels
on the sky) for the Family and Lineup layouts, which are edge-to-edge
by default since v4.3 — the strips run to the bottom edge of the frame
with the title over the art, the same poster treatment as the mosaic —
and `?stars=0` to drop the five gold stars from the quote strip.
Naming a text param with an empty value
(`?release=`) clears that line. The four screenshots in `screenshots/`
are taken from `shots.json`:
`1-cover.jpg` (Vice Coast, Poster mosaic, Sunset Hero, wide 16:9 —
Nina dancing on the neon street in the big centre panel, Lucia
laughing in the convertible, Marco on the boat, the beach-party crew
and Dario on the rooftop in the corners, the title in huge gold-orange-pink
letters over the art),
`2-editor.jpg` (editor, v4.4 header, Poster mosaic with the Coast crew,
full wide preview visible), `3-cover-square.jpg` (The Family, Family lineup
edge-to-edge, Mafia Gold, square — the Don, the Enforcer, the Bruiser,
the Vixen and the Siren, all wearing visible gold jewellery; short
20-character critic quote, no stars, no release pill) and
`4-cover-portrait.jpg` (Vice Squad, Lineup edge-to-edge, Palm Noir,
Police crew, portrait — short 18-character critic quote, no stars,
no release pill) — three covers that differ in title, layout,
grade, photos and every line of poster furniture.

## Pointer shortcuts

- Click a panel to select it; drag it to move its photo.
- Scroll over a panel to zoom its photo in and out.
- The Zoom / Move sliders and the Centre button do the same for the selected
  panel, and its cast tag (the chip on the panel, and the billing line) is
  editable in the Layout &amp; crop card.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored make.fun
library in `vendor/makefun-app.ts`.

## License

MIT — see [LICENSE](LICENSE).
