import { GoogleGenerativeAI, type Content, type GenerateContentResult } from '@google/generative-ai';

const DEFAULT_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

function extractTextFromResult(result: GenerateContentResult): string {
    const response = result.response;
    try {
        const t = response.text();
        if (t?.trim()) return t.trim();
    } catch {
        // blocked or missing candidates
    }

    const block = response.promptFeedback?.blockReason;
    if (block) {
        return `I couldn't answer that (content policy: ${block}). Try rephrasing, or ask about general investing concepts or your paper portfolio.`;
    }

    const finish = response.candidates?.[0]?.finishReason;
    if (finish === 'SAFETY' || finish === 'RECITATION') {
        return 'That request was filtered for safety. Try a broader investing-education question instead.';
    }

    const parts = response.candidates?.[0]?.content?.parts;
    const inline = parts?.map(p => ('text' in p && p.text ? p.text : '')).join('');
    if (inline?.trim()) return inline.trim();

    return '';
}

export async function generateSnapseReply(params: {
    apiKey: string;
    systemInstruction: string;
    contents: Content[];
}): Promise<{ text: string; modelUsed: string }> {
    const envModel = process.env.GEMINI_MODEL?.trim();
    const modelsToTry = envModel ? [envModel, ...DEFAULT_MODELS] : [...DEFAULT_MODELS];
    const seen = new Set<string>();
    const ordered = modelsToTry.filter(m => {
        if (!m || seen.has(m)) return false;
        seen.add(m);
        return true;
    });

    let lastError: unknown;
    for (const modelName of ordered) {
        try {
            const genAI = new GoogleGenerativeAI(params.apiKey);
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: params.systemInstruction,
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.65,
                },
            });
            const result = await model.generateContent({ contents: params.contents });
            const text = extractTextFromResult(result);
            if (text) {
                return { text, modelUsed: modelName };
            }
            lastError = new Error('Empty model response');
        } catch (e) {
            lastError = e;
        }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
