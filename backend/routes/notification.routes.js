const express = require('express')
const { getMyNotifications, markAsRead, getUnreadCount } = require('../controllers/Notification.controller')
const { authMiddleware } = require('../middleware/authMiddleware')

const NotificationRouter = express.Router()

NotificationRouter.get("/getNotification", authMiddleware, getMyNotifications)
NotificationRouter.put("/markAsRead/:id", authMiddleware, markAsRead)
NotificationRouter.get("/getUnreadCount", authMiddleware, getUnreadCount)

module.exports = NotificationRouter
