import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../lib/response.js";

// ==================== CREATE CHAT ====================
export const chatCreate = async (req, res) => {
  try {
    const { title, participants: participantsRaw, messages: messagesRaw } = req.body || {};
    const participants = participantsRaw ? JSON.parse(participantsRaw) : [];
    const messages = messagesRaw ? JSON.parse(messagesRaw) : [];
    const creator_id = req.user.id;

    if (!creator_id) return sendError(res, "Falta el id de creador para crear chat!", 400);

    const data = {};
    if (title) data.title = title;
    if (req.file) data.image = req.file.buffer;

    const creatorUser = await User.findById(creator_id);
    if (!creatorUser) return sendError(res, "Creator not found", 404);

    data.creator = {
      id: creator_id,
      name: creatorUser.nom,
      email: creatorUser.email,
    };

    const addedParticipants = new Set();
    data.participants = [];

    for (const p of participants) {

      if (!p || addedParticipants.has(p.email) || p._id.toString() === data.creator.id.toString()) continue;
      
      data.participants.push({ id: p._id, name: p.name, email: p.email });
      addedParticipants.add(p.email);
    }

    data.messages = [];
    for (const msg of messages) {
      if (!msg || !msg.author || !msg.author.email || !msg.content) continue;

      let authorObj = null;
      if (msg.author.email === data.creator.email) authorObj = data.creator;
      else authorObj = data.participants.find(p => p.email === msg.author.email);

      if (authorObj) data.messages.push({ author: authorObj, content: msg.content });
    }

    await Chat.create(data);
    return sendSuccess(res, data, "Chat creado con éxito", 201);

  } catch (err) {
    console.error(err);
    return sendError(res, "Error creating chat", 500, { error: err.message });
  }
};

// ==================== ADD PARTICIPANTS ====================
export const chatAddParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const { participants } = req.body || {};
    const userId = req.user.id;

    const chat = await Chat.findById(id);
    if (!chat) return sendError(res, "Chat no encontrado", 404);

    if (chat.creator.id.toString() !== userId.toString()) {
        return sendError(res, "Solo el administrador del grupo puede añadir participantes", 403);
    }

    if (!participants || !Array.isArray(participants)) return sendError(res, "Participants debe ser un array", 400);

    for (const p of participants) {
      if (!p || p._id.toString() === chat.creator.id.toString()) continue;

      const userDb = await User.findById(p._id);
      if (!userDb) return sendError(res, `Usuario con id ${p._id} no existe`, 400);

      if (!chat.participants.some(part => part.id.toString() === userDb._id.toString())) {
        chat.participants.push({ id: userDb._id, name: userDb.nom, email: userDb.email });
      }
    }

    await chat.save();
    return sendSuccess(res, { chat }, "Participantes añadidos correctamente");

  } catch (err) {
    console.error(err);
    return sendError(res, "Error adding participants", 500, { error: err.message });
  }
};
// ==================== ADD MESSAGES ====================

// ==================== SSE SUBSCRIBE ====================

let clientes = []

export const chatSubscribe = (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  
  res.writeHead(200, headers);
  
  clientes.push(res);

  // Cuando el cliente cierra la conexión, lo sacamos de la lista
  req.on('close', () => {
    clientes = clientes.filter(client => client !== res);
  });
};

export const chatAddMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return sendError(res, "Chat no encontrado", 404);
    if (!Array.isArray(messages) || messages.length === 0) return sendError(res, "No hay mensajes para añadir", 400);

    chat.messages = chat.messages || [];

    for (const msg of messages) {
      if (!msg || !msg.author || !msg.author.email || !msg.content) continue;

      let authorObj = null;
      if (msg.author.email === chat.creator.email) authorObj = chat.creator;
      else authorObj = chat.participants.find(p => p.email === msg.author.email);

      if (authorObj) chat.messages.push({ author: authorObj, content: msg.content });
    }

    await chat.save();

    clientes.forEach(client => {
      client.write(`data: ${chatId}\n\n`); 
    });

    return sendSuccess(res, { chat }, "Mensajes añadidos");

  } catch (err) {
    console.error(err);
    return sendError(res, "Error adding messages", 500, { error: err.message });
  }
};

// ==================== DELETE MESSAGE ====================
export const chatDeleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return sendError(res, "Chat no encontrado", 404);

    chat.messages = chat.messages.filter(m => m._id.toString() !== messageId.toString());
    await chat.save();

    clientes.forEach(client => {
      client.write(`data: ${chatId}\n\n`); 
    });

    return sendSuccess(res, { chat }, "Mensaje eliminado");

  } catch (err) {
    console.error(err);
    return sendError(res, "Error deleting message", 500, { error: err.message });
  }
};

// ==================== DELETE ALL MESSAGES ====================
export const chatDeleteAllMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return sendError(res, "Chat no encontrado", 404);

    chat.messages = [];
    await chat.save();
    return sendSuccess(res, { chat }, "Todos los mensajes han sido eliminados");

  } catch (err) {
    console.error(err);
    return sendError(res, "Error deleting all messages", 500, { error: err.message });
  }
};

// ==================== UPDATE CHAT ====================
export const chatUpdate = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    const chat = await Chat.findByIdAndUpdate(chatId, { title }, { new: true });
    if (!chat) return sendError(res, "Chat no encontrado", 404);

    return sendSuccess(res, { chat }, "Chat actualizado");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error updating chat", 500, { error: err.message });
  }
};

// ==================== UPDATE CHAT IMAGE ====================
export const chatUpdateImage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return sendError(res, "Chat no encontrado", 404);

    if (req.file) {
      chat.image = req.file.buffer;
      await chat.save();
    }

    return sendSuccess(res, { chat }, "Imagen actualizada");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error updating chat image", 500, { error: err.message });
  }
};

// ==================== DELETE CHAT IMAGE ====================
export const chatDeleteImage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return sendError(res, "Chat no encontrado", 404);

    chat.image = undefined;
    await chat.save();
    return sendSuccess(res, { chat }, "Imagen eliminada");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error deleting chat image", 500, { error: err.message });
  }
};

// ==================== LIST CHATS ====================
export const chatList = async (req, res) => {
  try {
    const userId = req.user.id;
    const q = req.query.q;

    let filter = {
      $or: [
        { 'creator.id': userId },
        { 'participants.id': userId },
      ]
    };

    if (q) filter.title = new RegExp(q, 'i');

    const chats = await Chat.find(filter);
    return sendSuccess(res, { chats }, "Chats listados");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error listing chats", 500, { error: err.message });
  }
};

// ==================== CHAT DETAIL ====================
export const chatDetail = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id; 

    const chat = await Chat.findById(chatId);
    if (!chat) return sendError(res, "Chat no encontrado", 404);

    const isCreator = chat.creator.id.toString() === userId.toString();
    
    const isParticipant = chat.participants.some(
      p => p.id.toString() === userId.toString()
    );

    if (!isCreator && !isParticipant) {
      return sendError(res, "No tienes autorización para ver este chat", 403);
    }

    return sendSuccess(res, { chat }, "Detalle del chat");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error getting chat detail", 500, { error: err.message });
  }
};

// ==================== REMOVE PARTICIPANT ====================
export const chatRemoveParticipant = async (req, res) => {
  try {
    const { chatId, email } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) return sendError(res, "Chat no encontrado", 404);

    chat.participants = chat.participants.filter(p => p.email !== email);
    await chat.save();
    return sendSuccess(res, { chat }, "Participante eliminado");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error removing participant", 500, { error: err.message });
  }
};

// ==================== DELETE OR LEAVE CHAT ====================
export const chatDeleteOrLeave = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id; 

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return sendError(res, "Chat no encontrado", 404);
    }

    if (chat.creator.id.toString() === userId.toString()) {

      await Chat.findByIdAndDelete(chatId);
      return sendSuccess(res, "Chat eliminado con éxito!");
    }

    chat.participants = chat.participants.filter(
      (p) => p.id.toString() !== userId.toString()
    );

    await chat.save();

    return sendSuccess(res, { chat }, "Has salido del chat");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error deleting or leaving chat", 500, {
      error: err.message,
    });
  }
};


