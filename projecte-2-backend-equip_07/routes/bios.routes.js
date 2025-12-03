import express from 'express';
import { listBios, personalBios, getBioById, createBio, updateBio, deleteBio, addOrUpdatePhoto, deletePhoto } from '../controllers/biosController.js';
import { toggleKiss, getBioKisses } from '../controllers/kissController.js';
import multer from 'multer';

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

const router = express.Router();

/* -----------------------------
   Bios.
--------------------------------*/
router.get('/', listBios);
router.get('/personal', personalBios);
router.get('/:id', getBioById)

router.post('/', upload.single('image'), createBio);

router.put('/:id', updateBio)
router.delete('/:id', deleteBio)

router.post('/:id/photos', upload.single('image'), addOrUpdatePhoto)

router.delete('/:id/photos', deletePhoto)

/* -----------------------------
   Kisses.
--------------------------------*/
router.post('/:bioId/kisses', toggleKiss)
router.delete('/:bioId/kisses', toggleKiss)
router.get('/:bioId/kisses', getBioKisses)

export default router;