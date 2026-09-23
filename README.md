# Astro Cat

Website for Astro Cat, a Los Angeles production company with two service lines: **Studio** (commercial, music video, documentary, narrative) and **Live** (multicam broadcast, events, streaming).

Plain HTML, CSS and JavaScript with no build step. It's ready for GitHub Pages.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: showreel hero, Studio/Live split, clients marquee, recent work, how we work, about |
| `studio.html` | Studio: capabilities, what we make, filterable work grid |
| `live.html` | Live: what we run, technical spec, filterable work grid, networks |
| `about.html` | About: story, crew, full process, Studio/Live doors |
| `contact.html` | Contact: job form (opens a pre-filled email), call sheet, FAQ |

Shared styles are in `assets/css/site.css` and shared behaviour is in `assets/js/site.js`. The header and footer are repeated in each page, so an edit to one has to be copied to the other four.

## Filling in placeholders

- **Stills and video:** every grey `.ph` box is a placeholder. Put an `<img>` (or a muted, looping `<video>` for the home showreel) inside it and it fills the box.
- **Client and network logos:** replace the `.logo-slot` text with logo images.
- **Live technical spec:** replace each `TBC` in `live.html`.
- **Crew:** names, roles and headshots in `about.html`.
- **Draft copy:** the About story and the Contact FAQ are drafts to edit.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
