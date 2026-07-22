# Pulse — HR Management Tool (Prototype)

A minimal, working prototype of an HR Management Tool built for the technical assessment.

## Stack

- **Backend:** Node.js, built-in `http` module only (no external packages — nothing to `npm install`)
- **Database:** JSON files (`backend/data/employees.json`, `backend/data/leaves.json`) read/written directly on disk
- **Frontend:** Plain HTML/CSS/JavaScript (no build step), served as static files by the same backend

## How to run

```bash
cd backend
node server.js
```

Then open **http://localhost:4000** in your browser.

That's it — one command, no dependencies to install, no build step.

## How to use it

1. On load, choose a role: **HR Admin** or **Employee** (pick a name from the dropdown).
2. **HR Admin** can:
   - View the full employee directory
   - Add a new employee (onboarding)
   - Remove an employee (offboarding)
   - View all leave requests and Approve / Reject pending ones
3. **Employee** can:
   - View the employee directory (read-only)
   - Apply for leave
   - Track the status of their own leave requests

Data persists across restarts because it's written straight to the JSON files in `backend/data/`.

## Project structure

```
hr-tool/
├── backend/
│   ├── server.js        # HTTP server + all API routes
│   ├── db.js            # tiny helper: read/write/ID-generation for the JSON "database"
│   └── data/
│       ├── employees.json
│       └── leaves.json
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```

## API reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Add an employee |
| PUT | `/api/employees/:id` | Update an employee |
| DELETE | `/api/employees/:id` | Remove an employee |
| GET | `/api/leaves?employeeId=` | List leave requests (optionally filtered) |
| POST | `/api/leaves` | Apply for leave |
| PUT | `/api/leaves/:id` | Approve/Reject a leave request |
| GET | `/api/dashboard` | Summary stats for the dashboard |

## What's intentionally simplified (see System Architecture doc for the production path)

- No authentication/JWT — role selection is a simple UI switch for demo purposes
- JSON file storage instead of a real database — fine for a prototype, not for concurrent production writes
- No input sanitization/validation beyond basic required-field checks
