import { Router } from 'express';

const router = Router();

// --- RUTA PRIVADA ---
router.get(
  '/restricted',
  (req, res) => {
    res.json({
      success: true,
      data: {
        message: `It worked! User id is: ${req.user._id} and email is: ${req.user.email}`
      }
    });
  }
);

export default router;