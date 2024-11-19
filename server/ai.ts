import fetch from 'node-fetch';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function getMathResponse(message: string) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://replit.com',
        'X-Title': 'Math Tutor',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/o1-preview',
        messages: [
          {
            role: 'system',
            content: `You are a knowledgeable math tutor. Follow these formatting rules strictly:
1. For inline math, use ONLY single $ delimiters: $x^2$
2. For display math, use ONLY double $$ delimiters: $$y = mx + b$$
3. Never use \\[ \\] or \\( \\) delimiters
4. Never repeat mathematical expressions - reference them by description instead
5. Use proper markdown for text formatting:
   - # for main title
   - ## for sections
   - ### for subsections
   - Regular paragraphs separated by blank lines
   - * or - for bullet points`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('AI API error:', error);
    throw new Error('Failed to get response from the tutor');
  }
}
