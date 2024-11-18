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
When writing mathematical expressions:
- Use $...$ for inline math (within text)
- Use $$...$$ for display math (centered on its own line)
- Never repeat mathematical expressions
- Use proper markdown headers (# for main title, ## for sections, ### for subsections)
- Use proper paragraph breaks with blank lines between paragraphs
- Format lists with proper indentation

Example format:
# Main Topic
## Section
Regular text with inline math $x^2$ and display math:
$$y = mx + b$$
### Subsection
- List item 1
- List item 2`
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
