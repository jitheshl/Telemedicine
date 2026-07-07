import SupportTicket from "../models/SupportTicket.js";

// ===============================
// Create Support Ticket
// ===============================

export const createTicket = async (req, res) => {

    try {

        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {

            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });

        }

        const ticket = await SupportTicket.create({

            patient: req.user._id,

            name,

            email,

            subject,

            message

        });

        res.status(201).json({

            success: true,

            message: "Support ticket submitted successfully.",

            ticket

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ===============================
// Patient Tickets
// ===============================

export const getMyTickets = async (req, res) => {

    try {

        const tickets = await SupportTicket.find({

            patient: req.user._id

        }).sort({

            createdAt: -1

        });

        res.json({

            success: true,

            tickets

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ===============================
// Admin All Tickets
// ===============================

export const getAllTickets = async (req, res) => {

    try {

        const tickets = await SupportTicket.find()

            .populate("patient", "name email")

            .sort({

                createdAt: -1

            });

        res.json({

            success: true,

            tickets

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ===============================
// Admin Reply
// ===============================

export const replyTicket = async (req, res) => {

    try {

        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {

            return res.status(404).json({

                success: false,

                message: "Ticket not found"

            });

        }

        ticket.adminReply = req.body.adminReply;

        ticket.status = "Resolved";

        await ticket.save();

        res.json({

            success: true,

            message: "Reply sent successfully.",

            ticket

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};