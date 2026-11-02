# Assignment 6 - jQuery (Selectors, Effects, Animations)

```
task1/  index.html  data.js  cases.js  app.js  style.css     <- Task 1: Selector Detective
task2/  copy of task1 + effects.js (spotlight, card, move, sort) <- Task 2: The party in motion
Assignment6_YourName.docx                                      <- report template (rename it!)
```
Open `task1/index.html` / `task2/index.html` in a browser (internet needed for jQuery CDN and avatars).
Push the folders to GitHub and put the repo link in the report.

## Defense cheat-sheet
- Data lives in `PARTY` (data.js). The page is built from it by `buildParty()`; every case rebuilds first.
- Each case is ONE chain in `cases.js` that searches the DOM (`.filter()`, `:has()`, `:not()`, `prev/next/nextAll/closest/add`).
- Task 2: `fadeTo` spotlight; card = `offset()` + `animate()`; move = `clone()` + `animate()` and `PARTY` is changed;
  sort = remember `offset()`, reorder, slide back to 0 (`stop(true)` stops queues).
- Be ready to change a case live (e.g. "who arrived before 21:00 with a cup?") - practise editing `cases.js`.
# assik-6-web
