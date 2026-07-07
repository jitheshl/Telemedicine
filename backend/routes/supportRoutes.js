import express from "express";

import {

    createTicket,

    getMyTickets,

    getAllTickets,

    replyTicket

} from "../controllers/supportController.js";

import {

    protect,

    authorize

} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("patient"), createTicket);

router.get("/my", authorize("patient"), getMyTickets);

router.get("/", authorize("admin"), getAllTickets);

router.put("/:id/reply", authorize("admin"), replyTicket);

export default router;