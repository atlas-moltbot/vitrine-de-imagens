import express from 'express';
import cors from 'cors';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Load .env ───────────────────────────────────────────────
const envVars = {};
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    envVars[key] = val;
    process.env[key] = val;
  }
}

console.log('─── Server .env loaded ───');
console.log('  GEMINI_CHAT_API_KEY:', envVars.GEMINI_CHAT_API_KEY ? '✅ Found' : '❌ NOT FOUND');
console.log('  GEMINI_API_KEY:', envVars.GEMINI_API_KEY ? '✅ Found' : '⚠️ not set (optional)');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/gemini.php', async (req, res) => {
    const { endpoint, model, payload, isChat } = req.body;

    // Choose the right key: chat-specific key for chat requests, fallback to general
    let apiKey = null;
    if (isChat && envVars.GEMINI_CHAT_API_KEY) {
        apiKey = envVars.GEMINI_CHAT_API_KEY;
    }
    if (!apiKey && envVars.GEMINI_API_KEY) {
        apiKey = envVars.GEMINI_API_KEY;
    }
    // Fallback: try chat key even if not isChat (user might only have one key)
    if (!apiKey && envVars.GEMINI_CHAT_API_KEY) {
        apiKey = envVars.GEMINI_CHAT_API_KEY;
    }

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'API Key não configurada. Defina GEMINI_CHAT_API_KEY ou GEMINI_API_KEY no arquivo .env' 
        });
    }

    if (!endpoint) {
        return res.status(400).json({ error: 'Parâmetro "endpoint" é obrigatório.' });
    }

    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    let googleApiUrl = "";
    
    if (endpoint === 'generateImages') {
        googleApiUrl = `${baseUrl}/${model}:predict?key=${apiKey}`;
    } else {
        googleApiUrl = `${baseUrl}/${model}:generateContent?key=${apiKey}`;
    }

    console.log(`[Proxy] ${endpoint} → ${model} | isChat=${!!isChat} | key=${apiKey.slice(0,8)}...`);

    try {
        const fetchRes = await fetch(googleApiUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await fetchRes.json();
        
        if (!fetchRes.ok) {
            console.error(`[Proxy] Google API Error ${fetchRes.status}:`, JSON.stringify(data).slice(0, 300));
        }
        
        res.status(fetchRes.status).json(data);
    } catch (error) {
        console.error('[Proxy] Request Failed:', error.message);
        res.status(500).json({ error: 'Proxy Request Failed', details: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', chatKey: !!envVars.GEMINI_CHAT_API_KEY, apiKey: !!envVars.GEMINI_API_KEY });
});

app.listen(8000, () => {
    console.log('🚀 Local Node Proxy Server running on http://localhost:8000');
    console.log('   Proxying /api/gemini.php → Google Gemini API');
});
