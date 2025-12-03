import mongoose from 'mongoose';
import Bio from '../models/Bio.js';
import Kiss from '../models/Kiss.js';
import { sendSuccess, sendError } from "../lib/response.js";

/* -----------------------------
   GET /bios?q=
   Lista todas las bios; si hay query, busca por título, tags o autor.
--------------------------------*/
export const listBios = async (req, res) => {
  try {
    const { q = '', sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
    const regex = new RegExp(q, 'i');

    const query = {
      $or: [
        { title: regex },
        { tags: regex },
        { 'author.name': regex },
        { 'author.surname': regex },
        { 'author.email': regex }
      ]
    };

    const sortOptions = {};
    if (sortBy === 'author') {
      sortOptions['author.name'] = order === 'asc' ? 1 : -1;
      sortOptions['author.surname'] = order === 'asc' ? 1 : -1;
    } else {
      sortOptions['createdAt'] = order === 'asc' ? 1 : -1;
    }

    const bios = await Bio.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Bio.countDocuments(query);

    // Получаем лайки текущего пользователя для этих био
    const bioIds = bios.map(b => b._id);
    const userId = req.user?._id;
    let likedMap = {};
    if (userId) {
      const kisses = await Kiss.find({ author: userId, bioId: { $in: bioIds } });
      likedMap = kisses.reduce((acc, kiss) => {
        acc[kiss.bioId] = true;
        return acc;
      }, {});
    }

    // Para mostrar en frontend si tiene kiss o no
    const results = bios.map(bio => ({
      ...bio.toObject(),
      liked: !!likedMap[bio._id]
    }));

    return sendSuccess(
      res,
      { total, page: parseInt(page), limit: parseInt(limit), results },
      'Bios fetched successfully'
    );
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error fetching bios', 500, { error: err.message });
  }
};

/* -----------------------------
   GET /bios/personal
   Lista las bios del usuario actual, con búsqueda y paginación.
--------------------------------*/
export const personalBios = async (req, res) => {
  try {
    const {
      q = '',
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const regex = new RegExp(q, 'i');

    const query = {
      'author.email': req.user.email,
      $or: [
        { title: regex },
        { tags: regex }
      ]
    };

    const sortOptions = {};
    if (sortBy === 'title') {
      sortOptions['title'] = order === 'asc' ? 1 : -1;
    } else {
      sortOptions['createdAt'] = order === 'asc' ? 1 : -1;
    }

    const bios = await Bio.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Bio.countDocuments(query);

    // Obtener kisses
    const bioIds = bios.map(b => b._id);
    const userId = req.user?._id;
    let likedMap = {};
    if (userId) {
      const kisses = await Kiss.find({ author: userId, bioId: { $in: bioIds } });
      likedMap = kisses.reduce((acc, kiss) => {
        acc[kiss.bioId] = true;
        return acc;
      }, {});
    }

    const results = bios.map(bio => ({
      ...bio.toObject(),
      liked: !!likedMap[bio._id]
    }));

    return sendSuccess(
      res,
      { total, page: parseInt(page), limit: parseInt(limit), results },
      'Personal bios fetched successfully'
    );
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error fetching personal bios', 500, { error: err.message });
  }
};


/* -----------------------------
   GET /bios/:id
   Devuelve una bio por su ID si existe.
--------------------------------*/
export const getBioById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 'Invalid bio ID', 400);

    const bio = await Bio.findById(id);
    if (!bio) return sendError(res, 'Bio not found', 404);

    return sendSuccess(res, { bio }, 'Bio fetched successfully');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error fetching bio by ID', 500, { error: err.message });
  }
};

/* -----------------------------
   POST /bios
   Crear nueva bio.
--------------------------------*/
export const createBio = async (req, res) => {
  try {
    const { title, url, tags } = req.body;
    if (!title || !url) return sendError(res, 'Title and URL are required', 400);

    const author = {
      name: req.user.nom,
      surname: req.user.cognoms,
      email: req.user.email,
    };

    const bio = new Bio({
      title,
      url,
      tags,
      author,
      image: req.file?.buffer,
    });

    await bio.save();
    return sendSuccess(res, { bio }, 'Bio created successfully', 201);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error creating bio', 500, { error: err.message });
  }
};

/* -----------------------------
   PUT /bios/:id
   Actualizar bio.
--------------------------------*/
export const updateBio = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 'Invalid bio ID', 400);

    console.log(data)

    delete data.author;

    const bio = await Bio.findById(id);
    if (!bio) return sendError(res, 'Bio not found', 404);

    if (bio.author.email !== req.user.email) {
      return sendError(res, 'You can only update your own bios', 403);
    }

    const updatedBio = await Bio.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return sendSuccess(res, { bio: updatedBio }, 'Bio updated successfully');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error updating bio', 500, { error: err.message });
  }
};

/* -----------------------------
   DELETE /bios/:id
   Eliminar bio.
--------------------------------*/
export const deleteBio = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 'Invalid bio ID', 400);

    const bio = await Bio.findById(id);
    if (!bio) return sendError(res, 'Bio not found', 404);

    if (bio.author.email !== req.user.email) {
      return sendError(res, 'You cannot delete someone else\'s bio', 403);
    }

    await Bio.findByIdAndDelete(id);
    return sendSuccess(res, {}, 'Bio deleted successfully');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error deleting bio', 500, { error: err.message });
  }
};

/* -----------------------------
   POST /bios/:id/photo
   Establecer o cambiar la foto (solo UNA).
--------------------------------*/
export const addOrUpdatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return sendError(res, 'Image is required', 400);
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 'Invalid bio ID', 400);

    const bio = await Bio.findById(id);
    if (!bio) return sendError(res, 'Bio not found', 404);

    if (bio.author.email !== req.user.email) return sendError(res, 'You cannot modify someone else\'s bio', 403);

    bio.image = req.file.buffer;
    await bio.save();

    return sendSuccess(res, { bio }, 'Photo updated successfully');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error updating bio photo', 500, { error: err.message });
  }
};

/* -----------------------------
   DELETE /bios/:id/photo
   Elimina la única foto.
--------------------------------*/
export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, 'Invalid bio ID', 400);

    const bio = await Bio.findById(id);
    if (!bio) return sendError(res, 'Bio not found', 404);

    if (bio.author.email !== req.user.email) return sendError(res, 'You cannot modify someone else\'s bio', 403);

    bio.image = undefined;
    await bio.save();

    return sendSuccess(res, {}, 'Photo deleted successfully');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Error deleting bio photo', 500, { error: err.message });
  }
};
