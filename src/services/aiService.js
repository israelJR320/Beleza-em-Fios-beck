const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

async function generateAiPushNotification(hairType) {
    try {
        const prompt = `Gere uma única frase, alegre, divertida e engraçada, para uma notificação push. A mensagem deve ser curta, motivar a pessoa a cuidar do cabelo e ser baseada no tipo de cabelo \"${hairType}\". Use emojis! Exemplo: \"Cabelo cacheado, bora mostrar quem manda nos cachos! ✨\". Exemplo 2: \"Cabelo liso, a sua elegância brilha mais que o sol! ☀️\".`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Erro ao gerar a notificação push com a IA:', error);
        throw new Error('Falha ao gerar a notificação push.');
    }
}

async function generateAiRoutine(hairType, goal) {
    try {
        const prompt = `Atue como um especialista em cuidados capilares. Baseado no tipo de cabelo "${hairType}" e no objetivo de "${goal}", determine a duração mais adequada para um cronograma (semanal, quinzenal, etc.). Em seguida, gere um cronograma de cuidados capilares e uma lista de produtos recomendados. A resposta deve ser em formato JSON com três chaves: "duration" (uma string com a duração), "routine" (um array de objetos com as chaves "day", "time", "activity" e "product") e "products" (um array de strings com nomes de produtos).`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text().match(/```json\n([\s\S]*)\n```/)[1];
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Erro ao chamar Gemini para cronograma:', error);
        throw new Error('Falha ao gerar o cronograma com a IA.');
    }
}

async function generateAiTip(hairType, goal, city, weather) {
    try {
        const prompt = `Gere uma dica de cuidado capilar diária para uma pessoa com o cabelo do tipo "${hairType}" e o objetivo de "${goal}", na cidade de ${city}, onde o clima atual é de ${weather.temperature}°C, com ${weather.humidity}% de humidade e está ${weather.condition}. A resposta deve ser em formato JSON com as chaves "tip", "alerts" (array de strings) e "articles" (array de strings com títulos de artigos).`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text().match(/```json\n([\s\S]*)\n```/)[1];
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Erro ao chamar Gemini para dica:', error);
        throw new Error('Falha ao gerar a dica com a IA.');
    }
}

async function generateAiArticles(hairType, goal) {
    try {
        const prompt = `Gere 5 títulos de artigos relacionados a cuidados para o cabelo do tipo "${hairType}" com o objetivo de "${goal}". A resposta deve ser em formato JSON com a chave "articles" (um array de strings).`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text().match(/```json\n([\s\S]*)\n```/)[1];
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Erro ao chamar Gemini para artigos:', error);
        throw new Error('Falha ao gerar os artigos com a IA.');
    }
}

async function askAiQuestion(question) {
    try {
        const prompt = `Responda à seguinte pergunta de um utilizador sobre cuidados capilares: "${question}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Erro na pergunta da IA:', error);
        throw new Error('Não foi possível obter a resposta da IA.');
    }
}

async function comparePhotos(imageBeforeBase64, imageAfterBase64, hairType) {
    try {
        const prompt = `Analise as duas imagens. A primeira imagem é o cabelo "antes" e a segunda é o cabelo "depois". Avalie a condição do cabelo "depois" em comparação com o "antes" e com base no tipo de cabelo "${hairType}". Forneça um feedback detalhado sobre as melhorias. Seja específico sobre a saúde, brilho, volume e qualquer outra melhoria observada. A resposta deve ser em formato de texto.`;
        
        const imageBefore = {
            inlineData: {
                data: imageBeforeBase64.replace('data:image/png;base64,', ''),
                mimeType: 'image/png'
            }
        };
        const imageAfter = {
            inlineData: {
                data: imageAfterBase64.replace('data:image/png;base64,', ''),
                mimeType: 'image/png'
            }
        };

        const result = await visionModel.generateContent([prompt, imageBefore, imageAfter]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Erro ao chamar Gemini para análise de fotos:', error);
        throw new Error('Falha ao analisar as fotos com a IA.');
    }
}

// Exporta todas as funções de uma vez
module.exports = {
    generateAiPushNotification,
    generateAiRoutine,
    generateAiTip,
    generateAiArticles,
    askAiQuestion,
    comparePhotos,
};