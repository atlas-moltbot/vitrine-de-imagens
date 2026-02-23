import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // if needed, depending on Node version

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/gemini.php', async (req, res) => {
    // Simulando o PHP proxy
    const apiKey = "AIzaSyAxzUPi0rrURc48I0NkyGYvxOfFhSuXZ6Q"; // Injetada diretamente apenas para Dev Proxy local
    
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key não configurada no servidor local.' });
    }

    const { endpoint, model, payload } = req.body;
    
    if (!endpoint) {
        return res.status(400).json({ error: 'Invalid request. "endpoint" and "payload" are required.' });
    }

    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    let googleApiUrl = "";
    
    if (endpoint === 'generateImages') {
        googleApiUrl = `${baseUrl}/${model}:predict?key=${apiKey}`;
    } else {
        googleApiUrl = `${baseUrl}/${model}:generateContent?key=${apiKey}`;
    }

    try {
        const fetchRes = await fetch(googleApiUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await fetchRes.json();
        res.status(fetchRes.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy Request Failed', details: error.message });
    }
});

app.listen(8000, () => {
    console.log('Local Node Proxy Server running on port 8000');
});
