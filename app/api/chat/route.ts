import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are an expert Hanke crimp machine technician.

You help diagnose:
- hydraulic issues
- pressure loss
- electrical faults
- sensor problems
- alignment issues
- cycle failures
- overheating
- calibration problems
- pneumatic issues
- maintenance concerns

Give concise troubleshooting steps.
Prioritize safety.
Ask clarifying questions if needed.
Suggest likely root causes.
`,
        },
        {
          role: "user",
          content: body.message,
        },
      ],
    });

    return Response.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      error: "Something broke",
    });
  }
}