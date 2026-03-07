const {
  getUserNotificationsService,
  markNotificationAsReadService,
  getUnreadCountService
} = require("../services/notification.service")

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await getUserNotificationsService(req.user.id)
    return res.status(200).json({ success: true, data: notifications })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const updated = await markNotificationAsReadService(req.params.id)
    return res.status(200).json({ success: true, data: updated })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await getUnreadCountService(req.user.id)
    return res.status(200).json({ success: true, unreadCount: count })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
