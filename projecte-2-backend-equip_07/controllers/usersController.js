import User from "../models/User.js";
import { hashPassword, comparePassword } from "../config/crypto.js";
import { sendSuccess, sendError } from "../lib/response.js";

// ==================== LIST USERS ====================
export const usersLista = async (req, res) => {
  try {
    const { email, nom, q } = req.query || {};

    let filter = {};

    if (email) filter.email = email;
    if (nom) filter.nom = nom;

    if (q) {
      filter = {
        $or: [
          { nom: new RegExp(q, "i") },
          { email: new RegExp(q, "i") },
        ],
      };
    }

    const users = await User.find(filter).select(
      "nom cognoms email dataNaixement descripcio idiomes avatar"
    );

    return sendSuccess(res, { users }, "Users list fetched successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error fetching users list", 500, { error: err.message });
  }
};

// ==================== GET SINGLE USER ====================
export const userSearch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !User.exists({ _id: id })) {
      return sendError(res, "Invalid user ID", 400);
    }

    const user = await User.findById(id).select(
      "nom cognoms email dataNaixement descripcio idiomes avatar"
    );

    if (!user) return sendError(res, "User not found", 404);

    return sendSuccess(res, { user }, "User fetched successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error fetching user", 500, { error: err.message });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom, cognoms, descripcio, idiomes } = req.body;

    const updateData = {};
    if (nom) updateData.nom = nom;
    if (cognoms) updateData.cognoms = cognoms;
    if (descripcio) updateData.descripcio = descripcio;
    if (idiomes) updateData.idiomes = idiomes;
    if (req.file) updateData.avatar = req.file.buffer;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) return sendError(res, "User not found", 404);

    return sendSuccess(res, { user }, "Profile updated successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error updating profile", 500, { error: err.message });
  }
};

// ==================== UPDATE PASSWORD ====================
export const updatePassword = async (req, res) => {
  try {
    const { currentPass, newPass } = req.body;

    if (!currentPass || !newPass) {
      return sendError(res, "Current and new password are required", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, "User not found", 404);

    const isMatch = await comparePassword(currentPass, user.password);
    if (!isMatch) return sendError(res, "Current password is incorrect", 403);

    user.password = await hashPassword(newPass);
    await user.save();

    return sendSuccess(res, { logout: true }, "Password updated successfully. Please login again.");
  } catch (err) {
    console.error(err);
    return sendError(res, "Error updating user password", 500, { error: err.message });
  }
};
