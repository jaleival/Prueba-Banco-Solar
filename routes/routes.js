import express from 'express';
import {
  home,
  ping,
  addUser,
  getUser,
  editUser,
  deleteUser,
  addTransfer,
  getTransfer,
} from '../controller/userController.js';

const router = express.Router();
router.get("/", home);
router.get("/ping", ping);
router.post("/usuario", addUser);
router.get("/usuarios", getUser);
router.put("/usuario", editUser);
router.delete("/usuario", deleteUser);
router.post("/transferencia", addTransfer);
router.get("/transferencias", getTransfer);

export default router;
