// src/services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

function extractJson(text) {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (!match) throw new Error('Formato JSON inválido na resposta da IA.');
    return JSON.parse(match[1].trim());
}

async function generateAiRoutine(hairType, goal, frequency, scalp, hairThickness, hairDamage) {
    const hairGoalsString = (goal || []).join(', ');
    const hairDamageString = (hairDamage || []).join(', ');

    try {
        const prompt = `Atue como especialista em cuidados capilares com base nos dados:
- Tipo de cabelo: ${hairType}
- Frequência de lavagem: ${frequency}
- Couro cabeludo: ${scalp}
- Objetivo: ${hairGoalsString}
- Espessura: ${hairThickness}
- Danos: ${hairDamageString}

Gere um cronograma capilar personalizado. A IA decide a duração total do tratamento (em semanas), os tratamentos para cada dia da semana e os produtos recomendados.

Retorne APENAS o JSON. O JSON deve ter as chaves em INGLÊS: "duration" (tempo total em semanas), "routine" (uma LISTA de objetos, onde cada objeto representa um dia de tratamento), e "products" (um objeto de produtos detalhados).

Exemplo do formato JSON esperado para a rotina (uma lista de objetos):
"routine": [
  {
    "day": "Monday",
    "treatment": "hidratação",
    "products": ["mask_hidration"]
  },
  {
    "day": "Wednesday",
    "treatment": "nutrição",
    "products": ["mask_nutrition"]
  }
]
`;

        const result = await textModel.generateContent(prompt);
        const response = await result.response;
        const aiResponseText = response.text();

        console.log('✅ Resposta bruta da IA (aiService.js):', aiResponseText);
        const rawData = extractJson(aiResponseText);
        
        return {
            duration: rawData.duration,
            routine: rawData.routine,
            products: rawData.products,
        };

    } catch (error) {
        console.error('❌ Erro ao gerar cronograma:', error);
        throw new Error('Falha ao gerar cronograma com a IA.');
    }
}


// 2️⃣ Gera dica diária com base no clima e perfil
async function generateAiTip(hairType, goal, city, weather) {
    try {
        const prompt = `Gere uma dica de cuidado capilar diária para cabelo tipo "${hairType}" com objetivo "${goal}" na cidade ${city}, clima: ${weather.temperature}°C, ${weather.humidity}% umidade, ${weather.condition}. Retorne JSON com a chave "alerts".`;

        const result = await textModel.generateContent(prompt);
        const response = await result.response;
        return extractJson(response.text());
    } catch (error) {
        console.error('Erro ao gerar dica diária:', error);
        throw new Error('Falha ao gerar dica diária com a IA.');
    }
}

// 3️⃣ Gera artigos recomendados
async function generateAiArticles(hairType, goal) {
    try {
        const prompt = `Gere 5 títulos de artigos sobre cabelo tipo "${hairType}" com objetivo "${goal}". Retorne JSON com chave "articles".`;

        const result = await textModel.generateContent(prompt);
        const response = await result.response;
        return extractJson(response.text());
    } catch (error) {
        console.error('Erro ao gerar artigos:', error);
        throw new Error('Falha ao gerar artigos com a IA.');
    }
}

// 4️⃣ Gera notificação push divertida
async function generateAiPushNotification(hairType) {
    try {
        const prompt = `Gere uma frase curta, alegre, divertida e motivadora para notificação push, baseada no cabelo "${hairType}", usando emojis.`;

        const result = await textModel.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Erro ao gerar notificação push:', error);
        throw new Error('Falha ao gerar notificação push.');
    }
}

// 5️⃣ Responde a perguntas do usuário
async function askAiQuestion(question) {
    try {
        const prompt = `Responda à pergunta do usuário sobre cuidados capilares: "${question}"`;

        const result = await textModel.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Erro ao responder pergunta:', error);
        throw new Error('Falha ao responder pergunta da IA.');
    }
}

// 6️⃣ Compara fotos de cabelo
async function comparePhotos(imageBeforeBase64, imageAfterBase64, hairType) {
    try {
        const prompt = `Compare estas duas imagens de cabelo "${hairType}" (antes e depois). Avalie saúde, brilho, volume e melhorias. Retorne texto detalhado.`;

        const imageBefore = {
            inlineData: {
                data: imageBeforeBase64.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: 'image/png'
            }
        };
        const imageAfter = {
            inlineData: {
                data: imageAfterBase64.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: 'image/png'
            }
        };

        const result = await visionModel.generateContent([prompt, imageBefore, imageAfter]);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Erro ao comparar fotos:', error);
        throw new Error('Falha ao analisar fotos com a IA.');
    }
}

module.exports = {
    generateAiPushNotification,
    generateAiRoutine,
    generateAiTip,
    generateAiArticles,
    askAiQuestion,
    comparePhotos
};