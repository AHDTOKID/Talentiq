# Talentiq · Automated Resume Screening System

A complete full-stack **resume screening and candidate review workspace** inspired by the supplied Talentiq HTML prototype. The frontend is **React + Vite**, the backend is **Node.js + Express**, and records and uploaded resume files are stored in **MongoDB** using Mongoose.

> **Important distinction:** Screening is **explainable, deterministic, keyword/rubric based**. It is not a trained neural network, LLM, or validated predictor of job performance. Scores are recruiter decision-support only; humans must review all employment decisions. An image-only scanned PDF cannot be parsed without an additional OCR pipeline.

## Features

- Beautiful, responsive Screening Hub dashboard based on the supplied design reference, with desktop/mobile layouts.
- Register/sign in, JWT-protected API, admin/recruiter/reviewer role permissions.
- Create roles/requisitions, switch roles, set hiring managers, headcount, descriptions.
- Editable scoring rubric (criterion weights, required terms); automatically rescore existing candidates when changed.
- Upload **1–10 PDF, DOCX or TXT resumes** (max 5 MB each) and parse text on the Node.js backend.
- Extract skills, phone, email, portfolio links, summary, education, work experience, internships, projects, certifications, achievements and explicitly declared experience when text and headings are recognizable; human verification is required.
- Score candidates against role-specific weighted criteria, show matched words and **source excerpts**, missing terms, document evidence coverage, and suggested interview questions.
- Search and filter candidates (All, High Match, Potential, Shortlist, Archive), sort by match or recency.
- Read extracted resume text, view extracted education/skills, download the original uploaded file with authorization.
- Advance to shortlist, request a screening call **status**, reject with a mandatory job-related note, return to review; every change creates an audit event.
- Export shortlisted and interview-stage candidates to CSV, with spreadsheet formula-injection mitigation.
- Idempotent demo seed includes **six fictional demo candidates** and three roles, including MERN Developer. Dashboard counts reflect actual records; no fictitious 248-candidate metrics.

### Directory structure

```text
talentiq_project/
├── package.json                  # optional combined developer command
├── docker-compose.yml             # optional local MongoDB container
├── README.md
├── design-reference/              # original UI screenshot and style guide
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/db.js
│       ├── models/{User,Requisition,Candidate,AuditLog}.js
│       ├── middleware/{auth,error}.js
│       ├── routes/{auth,requisitions,candidates,decisions}.js
│       ├── services/{parser,scoring}.js
│       └── seed.js
└── client/
    ├── .env.example
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── context/AuthContext.jsx
        ├── styles.css
        └── components/              # all requested Talentiq UI components
```

## Requirements

- Node.js **20.19+ or 22+** and npm (Node 22 recommended).
- MongoDB server (local MongoDB, optional Docker container, or MongoDB Atlas).
- Internet for the initial `npm install` and (optionally) Google Fonts.

## 1. Extract and open in VS Code

Extract `talentiq_fullstack_website.zip`; open the extracted `talentiq_project` directory as a folder in VS Code.

## 2. Configure your database

Choose one:

**Option A — Local Docker MongoDB** (Docker Desktop required):

```bash
docker compose up -d mongo
```

**Option B — Existing local MongoDB:** Start your local MongoDB service.

**Option C — MongoDB Atlas:** Create a free cluster, add an Atlas database user with read/write access, add your current IP in Network Access (do **not** globally open in production), and copy the `mongodb+srv://...` connection string. URL-encode special characters in your database password.

Copy `server/.env.example` to `server/.env`, then edit:

```dotenv
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/talentiq
JWT_SECRET=PUT_A_LONG_RANDOM_SECRET_OF_32_OR_MORE_CHARACTERS_HERE
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
SEED_ADMIN_EMAIL=admin@talentiq.demo
SEED_ADMIN_PASSWORD=DemoAdmin123!
```

For Atlas, replace `MONGODB_URI` with your connection string, including the DB name. **Do not commit `.env`**. The demo password is for local development only.

## 3. Install dependencies

From the **project root**:

```bash
npm run install:all
```

Or install the packages manually:

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

## 4. Seed the demo data (optional, recommended)

```bash
npm run seed
```

Creates account `admin@talentiq.demo` with the password from `server/.env`, role `REQ-FENG-2409`, a second role, and six fictional sample applicants. Re-running the seed will **not** duplicate existing demo candidates and **will not overwrite** an existing user's password.

## 5. Run the website

From the project root:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

Or start separately in two terminals:

```bash
# Terminal A
cd server
npm run dev

# Terminal B
cd client
npm run dev
```

Server API: `http://localhost:5001/api/health`. Vite proxies `/api` to the backend during local development.

If you did not seed, choose **Create an account** on the login page. The first signup is a normal **recruiter**, not an admin.

## 6. Build & test

```bash
npm run test
npm run build
```

The frontend release bundle will be generated in `client/dist/`. Tests cover rubric validation, text evidence scoring, and resume profile extraction.

## Typical flow

1. Sign in; choose a role/requisition from the title dropdown.
2. Click **Adjust Rubric** and edit relevant keywords/weights (weights must total 100%).
3. Click **Upload Resumes**, add PDF/DOCX/TXT, or paste resume text.
4. Filter/select candidates to view evidence breakdown, extracted resume content and suggested questions.
5. Make a **human-reviewed** decision (shortlist, interview status, reject with reason, return to review).
6. Use **Export Shortlist** for CSV or **Activity** for the audit log.

## API endpoints (JWT Bearer token required except noted)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Server health (public) |
| POST | `/api/auth/register` | Create recruiter (public) |
| POST | `/api/auth/login` | Login (public) |
| GET | `/api/auth/me` | Current user |
| GET / POST | `/api/requisitions` | List / create jobs |
| GET / PATCH | `/api/requisitions/:id` | Read / update job and scoring rubric |
| GET | `/api/requisitions/:id/metrics` | Real candidate counts |
| GET | `/api/requisitions/:id/export` | CSV shortlist export |
| GET | `/api/candidates?requisitionId=...` | Search / filter candidates |
| POST | `/api/candidates/upload` | Multipart upload: `requisitionId`, `resumes` (1–10) |
| POST | `/api/candidates/manual` | Create candidate from text |
| GET | `/api/candidates/:id` | Candidate details and score evidence |
| GET | `/api/candidates/:id/resume` | Authenticated original resume download |
| DELETE | `/api/candidates/:id` | Delete candidate and stored resume (admin only) |
| PATCH | `/api/decisions/:id` | Update candidate decision/status + notes |
| GET | `/api/decisions/audit` | Audited events; optional `requisitionId` |

## Security & limitations

- All candidate endpoints require authentication; write actions are limited to recruiters/admins, delete to admin. Accounts created via public signup receive only the recruiter role.
- Resume files are held in MongoDB Binary fields (5 MB max/file) for a straightforward college/demo implementation. For high volume, use virus scanning, object storage or GridFS, document encryption, and retention schedules.
- JWT expires after 8 hours and is stored in the browser's **sessionStorage**; signing out deletes the local session.
- App includes Helmet, CORS allowlist, login rate limit, input checks, audit logs and CSV formula-injection protections. This is an educational project, **not production security certification**.
- The `confidence` field is *resume-text evidence coverage*, not accuracy, uncertainty calibration or job-performance prediction.
- No OCR for scanned PDFs; no email sending; no calendar or ATS/Greenhouse integration; exported CSV is a file download, not a Greenhouse API push.
- The sample UI reference shows high candidate counts and neural-synthesis wording. This implementation **does not fabricate statistics or claim to run an actual neural model**.
- Before production: add organization/tenant isolation, strict account invitation policies, virus scanning, encryption, consent/retention controls, comprehensive access logs, and bias/legal compliance review.

## Troubleshooting

- **MongoDB connection failed**: check `MONGODB_URI`, whether MongoDB is running, and Atlas network access. If you use Atlas, confirm your database account has appropriate permissions.
- **JWT_SECRET missing**: copy `.env.example` to `server/.env`, set at least 32 characters, and restart the API.
- **Login fails**: run `npm run seed` and use the demo password configured in `server/.env`; note that seed does not reset an existing user.
- **Vite API error / Failed to fetch**: ensure port `5000` is running; client by default expects `/api` via Vite proxy.
- **Could not extract text**: use a text-based PDF, DOCX or TXT file; scanned PDFs need OCR.
- **Port 5000 already in use**: change `PORT` in server env and the Vite proxy target in `client/vite.config.js` accordingly.


## Upgrade 2.0 — richer resume profiles and developer-role matching

If you already have Talentiq running, **keep your existing `server/.env` file and MongoDB database**. Copy the changed source files over the originals and restart with `npm run dev`. No `npm install` is required if you already installed the original app's dependencies. You can optionally run `npm run seed` again to add the MERN job role to an existing database (it does not reset candidates).

- **Re-analyze Resume:** Open an existing applicant and click this button to reparse stored text, create structured profile sections and rescore. It does not re-upload anything, erase the original resume or alter hiring decisions. PDF OCR is still not supported.
- **Evaluate for another job:** Choose a different *active* requisition in the candidate dossier and click **Create separate application**. This copies the original resume as a new application scored against that job, keeping the old application and decision untouched. A duplicate candidate email within the target job is prevented.
- **MERN Rubric:** Select **Adjust Rubric → MERN / Software Developer → Save & Rescore** for an intentionally developer-focused requisition. This changes **all applicants' scores for that job**, so do not apply it to a real Product Designer job. Alternatively, run `npm run seed` and choose the new **Full Stack / MERN Developer** job, then copy the candidate there.
- **Supported profile sections:** Skills, summary, projects, internships/training, professional experience, education, certifications and achievements, plus links and contacts. Extraction is best-effort and requires recognizable section headings. Empty fields are shown as *not identified*, not invented.
- **Evidence breakdown:** Each criterion provides terms found, terms not explicitly found and the text fragment/source where a match was found. This is keyword-and-alias matching, not an AI assessment of competence.
- **Mac port note:** The bundled Vite proxy uses port **5001** for the backend to avoid macOS AirPlay/Control Center on port 5000. Ensure `PORT=5001` in your existing `server/.env`. Frontend remains on `localhost:5173`.

Run unit tests: `npm run test`. Run the frontend build after dependencies are installed: `npm run build`.
