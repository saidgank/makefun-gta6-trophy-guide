[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/saidgank/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/saidgank/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Legend — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft
Auto VI. Every trophy carries its official name, description and grade, a
guide written for this entry in our own words with its sources named, a
missable flag where the official description calls for one, and the stage of
the platinum roadmap it belongs to.

The app is plain static files under `app/` — no build step, no network. Open
it in a desktop browser and it works with the connection off:

- **Checklist & tracker** — tick trophies off as you earn them; progress is
  saved in the browser (localStorage) and can be exported to a file and
  imported back on any machine.
- **Filters & search** — by kind (story, missable, collectibles, activities),
  by grade, by progress, or by name.
- **Spoiler mode** — story trophies stay masked until you earn them.
- **Roadmap** — five stages from the opening mission to the platinum, with
  per-stage progress.
- **Missables** — the handful of trophies the official descriptions tie to a
  single moment, flagged with the moment to catch them in.
- **Counters** — for the trophies PlayStation tracks by a count (250 stunts,
  42 Shooting Range challenges, 100 WAiNK spots, $250,000 laundered…), keep
  your running total beside the trophy.

## Run it

Serve the app folder with any static file server and open it in a browser:

```
cd app && python3 -m http.server 8080
# then open http://localhost:8080
```

Or hand the entry in the way the grader does (Node 22, standard library
only): the program copies `app/` and `screenshots/` to the output directory
and writes the dossier the judge reads.

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Trophy names, descriptions, grades and tracked counts are the official
PlayStation list as published by Exophase and PSNProfiles; each trophy's
guide in the app names its sources beside it. All guide text is our own
words, written for this entry. No Rockstar Games logo or artwork is used.

## License

MIT — see `LICENSE`.
