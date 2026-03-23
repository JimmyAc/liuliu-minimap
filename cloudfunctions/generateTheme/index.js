const cloud = require('wx-server-sdk');
const { GoogleGenAI, Type } = require('@google/genai');
const { retrieveContext, buildFallbackTheme, buildPrompt } = require('./rag');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const ragContext = retrieveContext(event);
  const fallbackTheme = buildFallbackTheme(event, ragContext);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { theme: fallbackTheme, source: 'rag-fallback', ragContext, reason: 'missing_api_key' };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt(event, ragContext);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            missions: { type: Type.ARRAY, items: { type: Type.STRING } },
            vibeColor: { type: Type.STRING },
          },
          required: ['title', 'description', 'category', 'missions', 'vibeColor'],
        },
      },
    });

    const theme = JSON.parse(response.text || '{}');
    return {
      theme: { ...fallbackTheme, ...theme },
      source: 'rag+ai',
      ragContext,
    };
  } catch (error) {
    return {
      theme: fallbackTheme,
      source: 'rag-fallback',
      ragContext,
      reason: error.message || 'generate_failed',
    };
  }
};
