const mongoose = require("mongoose")
const { getReceiverSocketId, io } = require("./socket.service")
const Notification = require("../models/Notification")


const NOTIFICATION_MAP = {
    newMessage: {
        event: "newMessage",
        title: "New Appointment Booked",
        message: "You have a new appointment booking"
    },
    confirmed: {
        event: "appointmentConfirmed",
        title: "Appointment Confirmed",
        message: "Your appointment has been confirmed"
    },
    cancelled: {
        event: "appointmentCancelled",
        title: "Appointment Cancelled",
        message: "Your appointment has been cancelled"
    },
    completed: {
        event: "appointmentCompleted",
        title: "Appointment Completed",
        message: "Your appointment has been marked as completed"
    },
    rescheduled: {
        event: "appointmentRescheduled",
        title: "Appointment Rescheduled",
        message: "Your appointment date or time has been updated"
    },
    prescriptionAdded: {
        event: "prescriptionAdded",
        title: "New Prescription Added",
        message: "A new prescription has been added to your account"
    }
}


exports.createNotificationService = async ({
    recipient,
    type,
    data
}) => {
    if (!mongoose.Types.ObjectId.isValid(recipient)) {
        throw new Error("Invalid recipient ID")
    }

    const config = NOTIFICATION_MAP[type]

    if (!config) {
        throw new Error("Invalid notification type")
    }

    const newNotification = await Notification.create({
        recipient,
        type: config.event,
        title: config.title,
        message: config.message,
        appointment: data
    })

    const receiverSocketId = getReceiverSocketId(recipient)
    if (receiverSocketId) {
        io.to(receiverSocketId).emit(config.event, {
            notification: newNotification
        })
    }

    return newNotification

}

exports.getUserNotificationsService = async (userId) => {
    return await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
}

exports.markNotificationAsReadService = async (notificationId) => {
    return await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    )
}

exports.getUnreadCountService = async (userId) => {
    return await Notification.countDocuments({
        recipient: userId,
        read: false
    })
}

