import mongoose from "mongoose";
import Kiss from "../models/Kiss.js";
import Bio from "../models/Bio.js";
import User from "../models/User.js";
import { sendSuccess, sendError } from "../lib/response.js";

/* -----------------------------
   POST/DELETE /bios/:bioId/kisses
   Hacer/deshacer un "Kiss" a la bio de un usuario.
--------------------------------*/
export const toggleKiss = async (req, res) => {
  try {
    const { bioId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(bioId)) {
      return sendError(res, "Invalid bio ID", 400);
    }

    const bio = await Bio.findById(bioId);
    if (!bio) return sendError(res, "Bio not found", 404);

    const targetUser = await User.findOne({ email: bio.author.email });
    if (!targetUser) return sendError(res, "Target user not found", 404);

    if (targetUser._id.toString() === userId.toString()) {
      return sendError(res, "You can't 'kiss' your own bio.", 400);
    }

    const existingKiss = await Kiss.findOne({ author: userId, bioId });
    if (existingKiss) {
      await existingKiss.deleteOne();
      return sendSuccess(res, null, "Kiss deleted");
    }

    const newKiss = await Kiss.create({
      author: userId,
      targetUser: targetUser._id,
      bioId
    });

    return sendSuccess(res, { kiss: newKiss }, "Kiss created", 201);

  } catch (err) {
    console.error(err);
    return sendError(res, "Error toggling kiss", 500, { error: err.message });
  }
};


/* -----------------------------
   GET /bios/:bioId/kisses
   Mostrar kisses de una bio.
--------------------------------*/
export const getBioKisses = async (req, res) => {
  try {
    const { bioId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bioId)) {
      return sendError(res, "Invalid bio ID", 400);
    }

    const kisses = await Kiss.find({ bioId })
      .populate("author", "nom cognoms email") // traer datos del autor
      .sort({ createdAt: -1 });

    return sendSuccess(res, { kisses }, "Kisses fetched successfully");

  } catch (err) {
    console.error(err);
    return sendError(res, "Error fetching bio's kisses", 500, { error: err.message });
  }
};


/* -----------------------------
   GET /users/:userId/kisses
   Mostrar todas las bios a las que un usuario ha hecho kiss.
--------------------------------*/
export const getUserKisses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return sendError(res, "Invalid user ID", 400);
    }

    const user = await User.findById(userId);
    if (!user) return sendError(res, "User not found", 404);

    const kisses = await Kiss.find({ author: userId })
      .populate({
        path: "bioId",
        select: "title url tags image author createdAt updatedAt",
      })
      .sort({ "bioId.createdAt": -1 });

    const result = kisses.filter(k => k.bioId !== null);

    return sendSuccess(res, { kisses: result }, "User's kisses fetched successfully");

  } catch (err) {
    console.error(err);
    return sendError(res, "Error fetching user's kisses", 500, { error: err.message });
  }
};