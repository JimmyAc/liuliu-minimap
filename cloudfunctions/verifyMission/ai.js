const https = require('https');

const REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 2200);

function requestJson(urlString, options, body) {
  const url = new URL(urlString);
  return new Promise((resolve, reject) => {
    const req = https.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      path: `${url.pathname}${url.search}`,
      method: options.method || 'POST',
      headers: options.headers,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          if (res.statusCode >= 400) {
            reject(new Error(parsed.error && parsed.error.message ? parsed.error.message : `http_${res.statusCode}`));
            return;
          }
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error(`ai_request_timeout_${REQUEST_TIMEOUT_MS}ms`)));
    req.write(body);
    req.end();
  });
}

function stripCodeFence(text) {
  return String(text || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
}

function getAiConfig() {
  return {
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: process.env.AI_VISION_MODEL || process.env.AI_CHAT_MODEL || 'qwen-vl-plus',
  };
}

async function chatVisionJson(systemPrompt, prompt, imageUrls) {
  const config = getAiConfig();
  if (!config.apiKey) {
    throw new Error('missing_ai_api_key');
  }

  const content = [{ type: 'text', text: prompt }].concat(
    (imageUrls || []).map((url) => ({ type: 'image_url', image_url: { url } }))
  );

  const payload = await requestJson(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
  }, JSON.stringify({
    model: config.model,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content },
    ],
  }));

  const text = payload && payload.choices && payload.choices[0] && payload.choices[0].message
    ? payload.choices[0].message.content || ''
    : '';
  return JSON.parse(stripCodeFence(text) || '{}');
}

module.exports = { chatVisionJson };
