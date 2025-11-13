# Typesense Implementation (demo)

Small demo project: a Create React App frontend + minimal Express backend wired to Typesense for search.

Features

- Frontend: React (CRA) with a single search component at `src/components/form.js` that calls the backend as the user types (debounced, via axios).
- Backend: Express server at `server/server.js` with a `/api/search` endpoint that queries a Typesense collection named `items`.
- Seed script: `server/seed_typesense.js` — creates the `items` collection and imports ~30 example records.

Quick start (dev)

1. Install dependencies:

```bash
npm install
```

2. Run or configure a Typesense server (local or remote). Example local defaults used by this repo:

- host: `localhost`
- port: `8108`
- protocol: `http`
- apiKey: `ASD4Jd65id#8@#9` (set your own in env)

Run Typesense with Docker

If you want to run Typesense locally quickly using Docker, you can start a container with a persistent data volume:

```bash
docker run -d -p 8108:8108 -v$(pwd)/typesense-data:/data typesense/typesense:28.0 --data-dir /data --api-key="ASD4Jd65id#8@#9" --enable-cors
```

This maps port `8108` on your machine to the container, stores data in `./typesense-data`, and sets the API key and CORS for local development.

3. Copy `.env.example` to `.env` and set values (or export env vars). Important vars:

- `BE_PORT` - backend port (defaults to 3001)
- `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_API_KEY`
- `REACT_APP_BE_URL` - optional frontend override for backend base URL (defaults to `http://localhost:3001`)

4. Seed Typesense (this will delete and recreate the `items` collection):

```bash
node server/seed_typesense.js
```

5. Start backend in a terminal:

```bash
npm run dev
```

6. Start frontend in another terminal:

```bash
npm start
```

Open the app at `http://localhost:3000` and use the search box.

API endpoints

- `GET /api/health` - simple health check
- `GET /api/search?q=term` - search the `items` collection (searches `title` and `description`)

Notes and conventions

- Frontend components live in `src/components/` (note filenames use lowercase: e.g., `form.js`).
- Server code uses CommonJS in `server/` while the frontend uses ES modules.
- The project intentionally leaves seeding manual to avoid accidental data loss. The seed script deletes the `items` collection and recreates it.

Troubleshooting

- If search returns empty results after seeding, verify the Typesense server is reachable and the env vars are correct.
- Check backend logs (run `npm run dev`) and seed script output for import success messages.

Next steps (optional)

- Add a protected HTTP seed endpoint (token-protected) if you want remote seeding.
- Replace generated dummy data with a `server/data.json` file if you have real sample records.
- Add tests for the backend search endpoint.

License & contact
This repo is a demo. For questions or changes, edit the files directly and run the seed script to reset data.
