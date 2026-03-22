export async function POST(request) {
  try {
    const { prompt, system } = await request.json()

    if (!prompt) {
      return Response.json({ error: 'prompt requerido' }, { status: 400 })
    }

    const messages = []
    if (system) messages.push({ role: 'system', content: system })
    messages.push({ role: 'user', content: prompt })

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Error de Groq')
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    return Response.json({ text })
  } catch (error) {
    console.error('Groq error:', error)
    return Response.json(
      { error: error.message || 'Error al conectar con la IA' },
      { status: 500 }
    )
  }
}