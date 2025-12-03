import { Router } from 'express';
import multer from 'multer';
import { authRegister, authLogin, authLogout } from '../controllers/authController.js';

const router = Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg') {
    cb(null, true); 
  } else {
    cb(new Error('Formato inválido. Solo se permite JPEG.'), false); 
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

router.post('/register', upload.single('avatar'), authRegister);
router.post('/login', authLogin);
router.post('/logout', authLogout);

export default router;