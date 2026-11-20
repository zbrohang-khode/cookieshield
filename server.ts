import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Initialize Google GenAI for cookie security audits / risk analysis
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  app.post('/api/audit-cookies', async (req, res) => {
    try {
      const { cookies } = req.body;
      if (!cookies || !Array.isArray(cookies)) {
        return res.status(400).json({ error: 'Invalid cookies payload provided.' });
      }

      if (!ai) {
        // Fallback local rule-based audit if AI key is missing
        const auditResults = cookies.map((c: any) => {
          const issues = [];
          if (!c.secure) issues.push('Missing Secure flag (exposed on HTTP)');
          if (!c.httpOnly) issues.push('Missing HttpOnly flag (vulnerable to XSS theft)');
          if (!c.sameSite || c.sameSite.toLowerCase() === 'none' && !c.secure) {
            issues.push('SameSite=None without Secure is invalid/risky');
          }
          if (c.value && c.value.length > 500) {
            issues.push('Unusually large cookie value payload');
          }
          const riskLevel = issues.length >= 2 ? 'High' : issues.length === 1 ? 'Medium' : 'Low';
          return {
            name: c.name,
            domain: c.domain,
            riskLevel,
            issues: issues.length ? issues : ['Good security posture']
          };
        });
        return res.json({ audit: auditResults, summary: 'Local heuristic audit performed (Gemini API key not configured).' });
      }

      // Use Gemini 2.5 Flash / 3.5 Flash for professional cookie security analysis
      const prompt = `You are a cybersecurity expert specializing in web session security and cookie hardening.
Analyze the following stored cookies for security risks (missing HttpOnly, missing Secure, weak SameSite policies, sensitive naming, potential tokens):
${JSON.stringify(cookies.map(c => ({ name: c.name, domain: c.domain, secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite, expires: c.expires })))}

Return a valid JSON object with:
1. "summary": A concise overview of the security posture of these cookies.
2. "audit": An array of objects for each cookie containing:
   - "name": cookie name
   - "domain": cookie domain
   - "riskLevel": "Low", "Medium", or "High"
   - "issues": array of string descriptions of security flaws or recommendations.
Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      // Clean markdown code blocks if any
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch (err: any) {
      console.error('Audit error:', err);
      res.status(500).json({ error: err.message || 'Failed to audit cookies.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
