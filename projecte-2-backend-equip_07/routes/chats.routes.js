import { Router } from 'express';
const router = Router();
import multer from "multer";
import {
  chatCreate,
  chatAddParticipants,
  chatAddMessage,
  chatDeleteMessage,
  chatUpdate,
  chatUpdateImage,
  chatDeleteImage,
  chatList,
  chatDetail,
  chatRemoveParticipant,
  chatDeleteOrLeave,
  chatDeleteAllMessages,
  chatSubscribe
} from '../controllers/chatsController.js';

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

router.post('/', upload.single('image'), chatCreate);

router.get('/events', chatSubscribe)

router.post('/:id/participants', chatAddParticipants);
router.delete('/:chatId/participants/:email', chatRemoveParticipant);

router.post('/:chatId/messages', chatAddMessage);
router.delete('/:chatId/messages/:messageId', chatDeleteMessage);

router.delete('/:chatId/messages', chatDeleteAllMessages) // Eleminar Todos los mensajes

router.put('/:chatId', chatUpdate);

router.post('/:chatId/images', upload.single('image'), chatUpdateImage);
router.delete('/:chatId/images', chatDeleteImage);

router.get('/', chatList);
router.get('/:chatId', chatDetail);

router.delete('/:chatId', chatDeleteOrLeave);

export default router;