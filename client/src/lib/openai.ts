import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getMathResponse(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "openai-01-preview",
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
   - * or - for bullet points

Example:
# Quadratic Formula
The quadratic formula $ax^2 + bx + c = 0$ can be solved using:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
`
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get response from the tutor");
  }
}
