import { API_KEYS, API_ENDPOINTS } from '../config/constants.js';

export async function callVisionAPI(imageContent) {
  const response = await fetch(`${API_ENDPOINTS.VISION}?key=${API_KEYS.VISION_API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{ 
        image: { content: imageContent }, 
        features: [{ type: "TEXT_DETECTION" }] 
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Vision API error: ${response.statusText}`);
  }
  
  return response.json();
}

export async function callGeminiAPI(text) {
  if (!text.trim()) {
    throw new Error('No text content provided for summarization');
  }

  const prompt = {
    contents: [{
      parts: [{
        text: `Summarize and structure the following text into concise, well-organized notes. Focus only on the key points and important information from the provided text. Use appropriate HTML formatting:

${text}

Guidelines:
- Create a clear hierarchy of information
- Include only content that appears in the source text
- Use <h2> for main sections
- Use <ul> and <li> for bullet points
- Use <strong> for emphasis
- Keep spacing minimal and consistent
- Ensure all sections have content`
      }]
    }],
    generationConfig: {
      temperature: 0.3,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 1024,
    }
  };

  const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${API_KEYS.GEMINI_API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt)
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }
  
  return formatGeminiResponse(data.candidates[0].content.parts[0].text);
}

function formatGeminiResponse(text) {
  return text
    // Remove excessive newlines first
    .replace(/\n{3,}/g, '\n\n')
    // Convert markdown headings to HTML if not already
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Handle bullet points
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // Wrap consecutive list items
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Format bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Add minimal spacing between sections
    .replace(/<\/h[123]>/g, '$&\n')
    .replace(/<\/ul>/g, '$&\n')
    // Clean up any remaining multiple spaces or lines
    .replace(/\n{3,}/g, '\n\n')
    .replace(/  +/g, ' ')
    .trim();
}