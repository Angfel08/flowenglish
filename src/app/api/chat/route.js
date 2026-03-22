export async function POST(request) {
  try {
    const { prompt, system } = await request.json()

    if (!prompt) {
      return Response.json({ error: 'prompt requerido' }, { status: 400 })
    }

    const fullPrompt = system ? `${system}\n\n${prompt}` : prompt

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error de Gemini')
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return Response.json({ text })
  } catch (error) {
    console.error('Gemini error:', error)
    return Response.json(
      { error: error.message || 'Error al conectar con la IA' },
      { status: 500 }
    )
  }
}