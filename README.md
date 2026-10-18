# Tournament Golf Tracker — v3.1

Choose one to four players at startup. All players stay visible with independent Add stroke and Remove controls. The scorecard shows all 18 holes in two nine-hole grids that fit the viewport.

- **Save Round** downloads a JSON backup containing all players, shots, penalties, pars, and current hole. Keep it in Downloads or save it to Files on iPhone/iPad.
- **Load Round** restores a saved JSON backup, including on another device.
- **Export CSV** downloads a spreadsheet-friendly record of all holes and shots.
- Rounds save automatically in this browser. Connect GitHub under **Save & backup** for automatic uploads.

Open in Safari and choose Share → Add to Home Screen to install on iPhone/iPad. Load online before using offline. Close and reopen the app after an update if the old interface remains.

The original published version is preserved on the `v1` branch at commit `5090c1ee839c67df286dc0cb2632d0b8bde191e6`.

Course preset: Hopewell Valley Golf Club, Blue tees, par 72, 6,612 yards. Source: https://golfmercercounty.com/wp-content/uploads/2025/03/196189_proofV1.pdf
Course and tee details are included in saved JSON and CSV files.

## Save rounds to GitHub (v2.7)

Use **Save to GitHub** to save the current round as a JSON file under `rounds/` in this repository. Each new round has a unique ID and its own file; subsequent saves update the same file. The JSON includes the course, round date, scores, and shot history, and can be downloaded and restored with **Load Round**.

Open **Connect GitHub** in the app. Create a fine-grained personal access token in GitHub Settings → Developer settings → Personal access tokens, limited to this repository with **Contents: Read and write** and an expiration date. Paste the token into the app and connect. The token remains only in page memory until the page closes or reloads; it is never persisted in browser storage or included in round files. The ChatGPT GitHub connection does not authorize writes from the independently hosted app.

Saved rounds are public in the current repository. A successful save displays a link to its file; failed saves retain the round on the device. **Save Round** continues to download a local backup. While offline, use local tracking and save to GitHub after reconnecting.

## Automatic saving (v2.8)

Every change immediately saves the current round and pending GitHub backups to browser storage. After connecting GitHub, pending changes upload automatically about every 15 seconds, without repeated Save taps. Saving manually flushes pending rounds immediately. Each round retains its own JSON file on the **round-data** branch, so saving scores does not deploy the Pages app. This branch started from main to retain any previously saved files.

The durable queue preserves unsynced rounds when starting another round or reopening the app. Network failures retry with increasing delays; coming online retries immediately. GitHub authorization failures pause automatic requests and display an actionable status. Connect again after reopening or reloading the app because the token is kept only in memory. Mobile browsers may suspend background activity; GitHub uploading is best effort when the app becomes hidden and resumes on return. The local queue is the recovery path, not a promise of continuous background uploads.

Tests: `node tests/autosave.cjs` verifies local persistence, automatic batching, offline recovery across restarts, per-round files, edits during upload, retries, invalid credentials, and credential isolation using simulated GitHub responses.

## Course presets (v2.9)

The Meadows at Middlesex Golf Course in Plainsboro has Blue (6,277 yards), White (6,027), Gold (5,109), and Red (4,762) presets, all par 70. Each includes all 18 hole pars and yardages. Data was transcribed from the photographed printed scorecard dated 9/20 in the Bausch Collection:
https://homepage.villanova.edu/joseph.bausch/images/albums/MeadowsatMiddlesex/pages/page_2.html

Cross-check: https://www.golfify.io/courses/the-meadows-at-middlesex-golf-course

The current official course overview gives a general length of 6,290 yards, and some other online listings have different White and Red totals. The app identifies the scorecard date and links the source rather than mixing conflicting entries. Confirm against the current course or tournament scorecard. Hopewell Valley Blue and custom course setup remain available. Starting a preset copies its arrays so changing a round's par never alters the original preset.

## Harkers Hollow (v2.10)

Added Harkers Hollow Golf Club, 950 Uniontown Rd., Phillipsburg, NJ, with all 18 hole pars and yardages from its club-published scorecard PDF:
https://www.harkershollow.com/wp-content/uploads/sites/7948/2020/06/Harkers-Hollow-NJ-9.27.pdf

All four tees are par 70: Blue 6,451 yards; White 6,214; Gold 5,660; Green 5,237. The app uses the club's labels, including Green for the shortest tee. Course rating and slope are not used for this app's gross score tracking.

## Farmstead (v2.11)

Added 12 presets covering Clubview/Valleyview (par 70), Lakeview/Clubview (par 71), and Valleyview/Lakeview (par 69), preserving front/back order. Each includes Blue, White, Red, and the published forward tee label: Gold for Clubview/Valleyview and Lakeview/Clubview, Yellow for Valleyview/Lakeview.

Hole data comes from the route-specific published Golfify scorecards linked by each preset. The official Farmstead course page confirms the three nines: https://www.farmsteadgolf.com/golf. Its illustrated hole guides and general course lengths differ from some published scorecard entries, so the setup screen asks golfers to confirm the actual layout and current card. No claim is made that these are freshly verified tournament distances.

The route-specific White yardage for Lakeview #2 is 380 on Lakeview/Clubview and 400 on Valleyview/Lakeview. These differences are retained rather than silently mixing the cards. Each preset's par and yardage totals are derived from its 18 hole entries.

## Tamarack (v2.12)

Added Tamarack East (par 71) and West (par 72), with Blue, White, and Red tee presets and all 18 holes. Standard published scorecards are linked by each preset. East totals: Blue 6,226, White 5,809, Red 5,343 yards. West totals: Blue 7,025, White 6,340, Red 5,810 yards.

Blue/White arrays were cross-checked against Offcourse, the club overview, and the matching GolfTraxx East / FreeGolfTracker West hole tables. East Red comes from GolfTraxx; West Red comes from FreeGolfTracker and agrees with Golfify's Red column. A conflicting Golfify West White column was excluded because it assigns different hole pars and yardages from the other West cards. The GolfTraxx East metadata's par-72 label is inconsistent with its own 18 hole rows; the app uses their sum, par 71, consistent with the club overview.

The official U.S. Kids Golf Tour Championship page lists November 8, 2026, and says tee times are posted two days prior. It does not yet specify East/West or exact division yardages:
https://tournaments.uskidsgolf.com/tournaments/local/find-tournament/519522/tamarack-golf-course-tour-championship

These are standard course presets, not a claimed verified championship setup. Setup notes remind golfers to confirm the assigned course and age-group tees. Junior tournament distances may differ from standard tee colors.

## v3.0 baseline

Version 2.12 is preserved on the `v2.12` branch at commit `3a2db47ecdde2256487e468d3efa4cec054636a8`. Version 3 starts from the same features and layout, with a refreshed application version and offline cache. The device storage keys, round backup format, GitHub data branch, and course presets are unchanged.

## Simple scoring (v3.1)

Choose 1–4 players before starting. Add stroke increases the current hole score; Remove reverses the last stroke (including penalties in older imported rounds) and stops at zero. Four players use a two-by-two grid on phones and a single row on larger screens. Track and Scorecard use the available viewport height. The scorecard stacks Front and Back nine grids in portrait, and places them beside each other in short landscape windows. Save and GitHub tools are below navigation in an expandable panel. Existing v2 round files, course presets, local saves, and the GitHub backup queue remain supported.
