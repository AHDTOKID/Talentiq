# Talentiq v2 — upgrade guide

Your existing MongoDB candidates, uploaded resumes, and hiring decisions are preserved.

## Replace the files

**Option A — complete project:** Extract `talentiq_upgraded_fullstack.zip` to a new folder and open its `talentiq_project` folder in VS Code. Copy your existing `server/.env` into the new project's `server/` directory before starting it.

**Option B — keep your current project (recommended):** Extract `talentiq_upgraded_changed_files.zip` and copy the included `server/`, `client/` and README files over the corresponding files in your existing `talentiq_project/` folder. Allow replacing source files. Do **not** delete `.env`, `node_modules`, or MongoDB data.

## Configuration on Mac

In `server/.env`:

```dotenv
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/talentiq
```

Keep your existing `JWT_SECRET` and account credentials. `client/vite.config.js` now points to backend port `5001`; the website stays at `http://localhost:5173`.

## Start

From the `talentiq_project` folder:

```sh
npm run test
npm run seed
npm run dev
```

`npm run seed` is optional; it creates the **Full Stack / MERN Developer** requisition (if missing) and does not overwrite existing candidates. If npm dependencies were not already installed, run `npm run install:all` first. Open `http://localhost:5173`.

## Fix your existing resume's missing fields and 0% match

1. Select the requisition currently containing your resume (your screenshot showed a Product Designer role).
2. Click your candidate entry, then click **Re-analyze Resume**. The new structured profile sections populate from the stored text.
3. To check a *software developer* match without changing the Product Designer rubric, in the candidate dossier select **Full Stack / MERN Developer** from **Evaluate this resume for another job** and click **Create separate application**. Then the website switches to that job and displays the developer-specific score.
4. Alternatively, for a requisition intended for software hiring, click **Adjust Rubric → MERN / Software Developer → Save & Rescore**. This replaces the current job's rubric and recalculates all applicants' scores for that requisition.
5. Expand **View exact resume evidence** within the criteria breakdown to see which text matched the terms.

## Limits and privacy

- Parsing is deterministic and dependent on selectable document text and recognizable section headings. Image-only/scanned PDFs need OCR (not included).
- Scoring uses explicitly found terms and aliases; it is not a trained AI model or a validated hiring prediction.
- Recruiters must verify extracted claims and make all employment decisions themselves.
- If a section wasn't recognized, the app shows *Not identified*, never fabricated credentials.
- Store real resumes only in a secured instance; demo passwords and local settings are not suitable for production.
