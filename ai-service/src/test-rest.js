require("dotenv").config();

async function testarGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Chave Gemini não encontrada.");
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Responda apenas: conexão estabelecida!" }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro HTTP:", response.status);
      console.error(data);
      return;
    }

    console.log(data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Erro:", error.message);
  }
}

testarGemini();
