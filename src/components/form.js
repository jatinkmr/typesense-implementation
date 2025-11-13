import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './form.css';

// Single search bar component. Calls backend /api/search using axios as the user types.
export default function Form() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    // Backend base URL: override with REACT_APP_BACKEND_URL if needed
    const BACKEND_URL = process.env.REACT_APP_BE_URL;

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const resp = await axios.get(`${BACKEND_URL}/api/search`, {
                    params: { q: query },
                });
                setResults(resp.data.hits || []);
            } catch (err) {
                console.error('Search request failed', err.message || err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    return (
        <div className="search-container" style={{ padding: 20 }}>
            <label htmlFor="search-input">Search</label>
            <input
                id="search-input"
                type="search"
                placeholder="Type to search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ display: 'block', width: '100%', padding: '8px 12px', marginTop: 8 }}
            />

            {loading && <div style={{ marginTop: 10 }}>Searching...</div>}

            <ul style={{ marginTop: 12 }}>
                {results.map((r) => (
                    <li key={r.id} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                        <strong>{r.title}</strong>
                        {r.year ? <span style={{ marginLeft: 8, color: '#666' }}>({r.year})</span> : null}
                        <div style={{ color: '#444' }}>{r.description}</div>
                        {r.tags ? <div style={{ color: '#888', marginTop: 6 }}>Tags: {r.tags.join(', ')}</div> : null}
                    </li>
                ))}
            </ul>
        </div>
    );
}
