import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const drawingId = body?.drawing_id;

    if (!drawingId) return Response.json({ error: 'drawing_id obrigatório' }, { status: 400 });

    const drawing = await base44.entities.Drawing.get(drawingId);

    if (!drawing || !drawing.image_url) {
      return Response.json({ error: 'Desenho sem imagem' }, { status: 400 });
    }

    // Chamada corrigida com InvokeLLM (I maiúsculo) e crases no prompt
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em desenvolvimento infantil e arte infantil. Analise o desenho feito por uma criança pequena e sugira em português atividades educativas baseadas nele.`,
      file_urls: [drawing.image_url],
      response_json_schema: {
        type: 'object',
        properties: { sugestao: { type: 'string' } },
        required: ['sugestao'],
      },
    });

    const sugestao = result?.sugestao || '';
    
    // Salva a resposta da IA no banco de dados
    await base44.entities.Drawing.update(drawingId, { ai_suggestion: sugestao });

    return Response.json({ sugestao });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
