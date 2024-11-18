import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getMathResponse(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable math tutor. Explain concepts clearly and provide step-by-step solutions.
          Use LaTeX notation for mathematical expressions by wrapping them in $$ for display math or $ for inline math.
          When showing code, use markdown code blocks with appropriate syntax highlighting.`
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
