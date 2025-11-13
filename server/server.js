const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');

// Typesense client
const Typesense = require('typesense');

const BE_PORT = process.env.BE_PORT || 3001;

const typesenseClient = new Typesense.Client({
    nodes: [
        {
            host: process.env.TYPESENSE_HOST || 'localhost',
            port: process.env.TYPESENSE_PORT || '8108',
            protocol: process.env.TYPESENSE_PROTOCOL || 'http',
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
    connectionTimeoutSeconds: 2,
});

const app = express();

app.use(cors());
app.use(express.json());

// Simple health endpoint
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Search endpoint: GET /api/search?q=term
app.get('/api/search', async (req, res) => {
    try {
        if (!typesenseClient) throw new Error('Typesense client not initialized');

        const q = req.query.q || '';
        if (!q) return res.json({ hits: [] });

        const searchParameters = {
            q,
            query_by: 'title,description',
            per_page: 20,
        };

        const results = await typesenseClient
            .collections('items')
            .documents()
            .search(searchParameters);

        // return documents only for simplicity
        const docs = results?.hits?.length ? results.hits.map((h) => h.document) : [];
        res.json({ hits: docs });
    } catch (err) {
        const errMessage = err?.message || '';
        const isConnectionError =
            err?.code === 'ECONNREFUSED' ||
            errMessage.includes('ECONNREFUSED') ||
            errMessage.includes('Connection refused');

        if (isConnectionError) {
            console.error('Typesense connection error:', errMessage || err);
            return res
                .status(503)
                .json({ error: 'Failed to connect to Typesense search service.' })
        }

        console.error('Search error:', errMessage || err);
        res.status(500).json({ error: errMessage || 'An unexpected error occurred during search.' });
    }
});

app.listen(BE_PORT, () => console.log(`Server is running on port ${BE_PORT}`));
