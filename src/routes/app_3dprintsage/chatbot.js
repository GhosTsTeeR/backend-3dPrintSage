const { loadModel, createCompletion } = require('gpt4all');
const translate = require('google-translate-api');

let model;
let conversationHistory = []; 

async function initializeModel() {
  if (!model) {
    model = await loadModel('mistral-7b-instruct-v0.1.Q4_0.gguf', {
      verbose: true,
      device: 'gpu',
      nCtx: 2048,
    });
  }
}

async function handleChatMessage(msg) {
  try {
    await initializeModel();
    const chat = await model.createChatSession({
      temperature: 0.8,
      language: 'es'
    });

    // Almacenar el mensaje en el historial de la conversación
    conversationHistory.push({ question: msg });

    const response = await createCompletion(chat, msg, {
      language: 'es' 
    });

    // Almacenar la respuesta en el historial de la conversación
    conversationHistory[conversationHistory.length - 1].answer = response.choices[0].message;

    return response.choices[0].message;
  } catch (error) {
    console.error('Error al manejar el mensaje:', error);
    return 'Lo siento, hubo un error al generar la respuesta.';
  }
}

// Función para obtener el historial de la conversación
function getConversationHistory() {
  return conversationHistory;
}

module.exports = {
  handleChatMessage,
  getConversationHistory
};
