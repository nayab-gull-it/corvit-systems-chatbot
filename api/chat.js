/**
 * Vercel Serverless Function Adapter for /api/chat
 * Delegates directly to netlify/functions/chat.js logic
 * Allowing 1-click deployment on BOTH Vercel and Netlify!
 */

const { handler: chatHandler } = require('../netlify/functions/chat.js');

module.exports = async (req, res) => {
  // CORS Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const netlifyEvent = {
      httpMethod: req.method,
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}),
      headers: req.headers
    };

    const result = await chatHandler(netlifyEvent, {});
    const parsedBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

    res.status(result.statusCode || 200).json(parsedBody);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      fallback: true,
      source: 'vercel-adapter-exception'
    });
  }
};
