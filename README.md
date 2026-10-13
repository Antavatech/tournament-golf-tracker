# Tournament Golf Tracker — v2.1

Track all three players on the same screen. Each player has independent shot, penalty, undo, and score controls.

- **Save Round** downloads a JSON backup containing all players, shots, penalties, pars, and current hole. Keep it in Downloads or save it to Files on iPhone/iPad.
- **Load Round** restores a saved JSON backup, including on another device.
- **Export CSV** downloads a spreadsheet-friendly record of all holes and shots.
- Rounds also save automatically in this browser; there is no cloud synchronization.

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
