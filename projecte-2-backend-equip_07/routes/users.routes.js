import { Router } from 'express';
import multer from "multer"; 
import { usersLista, userSearch, updateProfile, updatePassword } from '../controllers/usersController.js';
import { getUserKisses } from '../controllers/kissController.js';

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

router.get('/', usersLista);
router.get('/:id', userSearch);

router.put('/profile', upload.single('avatar'), updateProfile); 

router.put('/password', updatePassword);
router.get('/:userId/kisses', getUserKisses);

export default router;