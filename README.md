[![GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/sun-justin/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/sun-justin/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# GTA VI Trophy Guide & Tracker

An offline, open-source guide and tracker for all **55 official PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze.

## What it does

- **Checklist** of every trophy with its official name, description and grade, saved in your browser (localStorage), with **export / import** of your progress.
- **Filters by kind** — story, missable, collectibles, activities, online — plus grade filter and search.
- **Spoiler setting** that hides the names and descriptions of story trophies until you earn them.
- **A guide for every trophy, in our own words, with its sources cited** (Exophase for names/descriptions/grades, PSNProfiles for counts, and our own advice from the official description, marked "not yet checked in the game").
- **Roadmap to the platinum** in six stages, and **missable flags** for the 17 trophies tied to one specific mission or moment.
- Fully offline: it fetches nothing from the network and uses no Rockstar artwork or logo.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` directly in a browser. Try it with demo progress: `http://localhost:8080/?demo=1` (ticks 14 trophies), or click "Load demo progress" in the app. Deep links: `?trophy=17` opens a trophy's guide, `?view=roadmap` opens the roadmap, `?kind=missable` filters to missables.

## Hand in (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

- Exophase — GTA VI trophy list (official names, descriptions, grades, frozen 2026-11-18).
- PSNProfiles — GTA VI trophy list (counts PlayStation tracks).
- Steps are our own advice drawn from the official descriptions only.

## License

MIT — see [LICENSE](LICENSE).
