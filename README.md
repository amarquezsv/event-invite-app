# Event Invite App

A full-stack event invitation and RSVP application. Guests can view event details and submit their RSVP through a clean, mobile-first interface.

Built with **React + Vite** on the frontend and **Azure Functions (Node.js)** on the backend, with **Azure Cosmos DB** for data persistence. Designed for zero-friction deployment to **Azure Static Web Apps**.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router v6 |
| Backend  | Azure Functions v4 (Node.js ≥ 18)      |
| Database | Azure Cosmos DB (NoSQL API)             |
| Hosting  | Azure Static Web Apps                   |

---

## Project Structure

```
event-invite-app/
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Footer, RSVPForm
│   │   ├── pages/            # Home, Invitation, Confirmation
│   │   ├── services/         # api.js — Azure Functions client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── staticwebapp.config.json   # SPA routing for Azure SWA
│   ├── .env.example
│   └── vite.config.js
│
├── backend/
│   ├── rsvp/                 # POST /api/rsvp
│   │   ├── index.js
│   │   └── function.json
│   ├── guest/                # GET  /api/guest/{id}
│   │   ├── index.js
│   │   └── function.json
│   ├── shared/
│   │   └── cosmosClient.js   # Shared Cosmos DB client
│   ├── host.json
│   ├── local.settings.json   # ⚠ Git-ignored — local dev only
│   └── package.json
│
└── README.md
```

---

## Local Development

### Prerequisites

- **Node.js** ≥ 18
- **[Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)**
- An **Azure Cosmos DB** account (or the [local emulator](https://learn.microsoft.com/azure/cosmos-db/emulator))

---

### 1 — Frontend

```bash
cd frontend
cp .env.example .env     # set VITE_API_URL (see below)
npm install
npm run dev              # starts at http://localhost:5173
```

### 2 — Backend

```bash
cd backend
npm install
func start               # starts at http://localhost:7071
```

`backend/local.settings.json` is **git-ignored**. Create it manually:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_ENDPOINT": "https://<account>.documents.azure.com:443/",
    "COSMOS_KEY": "<your-cosmos-primary-key>",
    "COSMOS_DB": "eventdb",
    "COSMOS_CONTAINER": "rsvps"
  }
}
```

> ⚠ **Never commit `local.settings.json`** — it contains secrets.

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable       | Description                                                      |
|----------------|------------------------------------------------------------------|
| `VITE_API_URL` | Azure Function App base URL — e.g. `http://localhost:7071/api` for local dev, `https://<app>.azurewebsites.net/api` in production |

### Backend (Azure Function App Settings / `local.settings.json`)

| Variable           | Description                              |
|--------------------|------------------------------------------|
| `COSMOS_ENDPOINT`  | Cosmos DB account endpoint URL           |
| `COSMOS_KEY`       | Cosmos DB primary or secondary key       |
| `COSMOS_DB`        | Database name (e.g. `eventdb`)           |
| `COSMOS_CONTAINER` | Container name (e.g. `rsvps`)            |

---

## API Reference

| Method | Path                | Description                    |
|--------|---------------------|--------------------------------|
| POST   | `/api/rsvp`         | Submit a new RSVP              |
| GET    | `/api/guest/{id}`   | Retrieve guest record by ID    |

### POST `/api/rsvp` — request body

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "attending": "yes"
}
```

### POST `/api/rsvp` — success response `201`

```json
{ "message": "RSVP saved successfully" }
```

---

## Deployment to Azure Static Web Apps

1. **Create** an Azure Static Web App (Azure Portal or `az staticwebapp create`).
2. Set the **build configuration**:
   - App location: `frontend`
   - API location: `backend`
   - Output location: `dist`
3. Add the **backend environment variables** under  
   Azure Portal → Function App → Settings → Environment variables:
   - `COSMOS_ENDPOINT`
   - `COSMOS_KEY`
   - `COSMOS_DB`
   - `COSMOS_CONTAINER`
4. Add the **frontend environment variable** under  
   Azure Portal → Static Web App → Settings → Environment variables:
   - `VITE_API_URL` — the managed Functions URL provided by Azure SWA

The `frontend/public/staticwebapp.config.json` handles SPA client-side routing automatically.

---

## Security

- All secrets are loaded from **environment variables** — nothing is hardcoded.
- `local.settings.json` is listed in `.gitignore`.
- API endpoints validate and sanitise all inputs before writing to the database.
- Cosmos DB queries use **parameterised queries** to prevent injection attacks.

---

## License

MIT
