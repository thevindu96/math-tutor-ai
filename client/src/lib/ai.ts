import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function getMathResponse(message: string) {
  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'anthropic/claude-3-opus-20240229',
        messages: [
          {
            role: "system",
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
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        headers: {
          'HTTP-Referer': 'https://replit.com',
          'X-Title': 'Math Tutor'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("AI API error:", error);
    throw new Error("Failed to get response from the tutor");
  }
}
