// Seed script for Typesense collection 'items'
// Run: node server/seed_typesense.js

const dotenv = require('dotenv');
dotenv.config();
const Typesense = require('typesense');

console.log('process.env', process.env)

const client = new Typesense.Client({
    nodes: [
        {
            host: process.env.TYPESENSE_HOST,
            port: process.env.TYPESENSE_PORT,
            protocol: process.env.TYPESENSE_PROTOCOL,
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 2,
});

const COLLECTION_NAME = 'items';

const schema = {
    name: COLLECTION_NAME,
    fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'tags', type: 'string[]', optional: true },
        { name: 'year', type: 'int32' },
    ],
    default_sorting_field: 'year',
};

async function ensureCollection() {
    try {
        // If the collection exists, delete it first to ensure a clean recreate
        await client.collections(COLLECTION_NAME).retrieve();
        console.log('Collection exists, deleting:', COLLECTION_NAME);
        await client.collections(COLLECTION_NAME).delete();
        console.log('Collection deleted:', COLLECTION_NAME);
    } catch (err) {
        // If retrieve failed because it does not exist, we'll create it below
        // Log the info but continue
        console.log('Collection does not exist (will create):', COLLECTION_NAME);
    }

    // Create the collection fresh
    try {
        console.log('Creating collection:', COLLECTION_NAME);
        await client.collections().create(schema);
        console.log('Collection created');
    } catch (err) {
        console.error('Error creating collection:', err);
        throw err;
    }
}

function generateDummyData(count = 30) {
    const arr = [];
    const sampleTags = ['tech', 'fiction', 'history', 'guide', 'tutorial', 'reference'];
    for (let i = 1; i <= count; i++) {
        arr.push({
            id: String(i),
            title: `Example Record ${i}`,
            description: `This is a short description for example record number ${i}. It contains sample text to be searchable for demo purposes regarding Typesense. Sample tag: ${sampleTags[i % sampleTags.length]}.`,
            tags: [sampleTags[i % sampleTags.length]],
            year: 2000 + (i % 23),
        });
    }
    return arr;
}

async function importData(docs) {
    // Typesense import expects newline-delimited JSON strings
    const ndjson = docs.map((d) => JSON.stringify(d)).join('\n');
    try {
        const result = await client.collections(COLLECTION_NAME).documents().import(ndjson, { action: 'upsert' });
        console.log('Import result:', result.slice(0, 500));
    } catch (err) {
        console.error('Import error:', err);
    }
}

async function main() {
    try {
        await ensureCollection();
        const docs = generateDummyData(30);
        await importData(docs);
        console.log('Seeding complete');
    } catch (err) {
        console.error('Seeding failed:', err);
    }
}

main();
