import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { prompt, system } = await request.json()

    if (!prompt) {
      return Response.json({ error: 'prompt requerido' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: system || '',
      messages: [{ role: 'user', content: prompt }],
    })

    return Response.json({ text: message.content[0].text })
  } catch (error) {
    console.error('Anthropic error:', error)
    return Response.json(
      { error: error.message || 'Error al conectar con la IA' },
      { status: 500 }
    )
  }
}
