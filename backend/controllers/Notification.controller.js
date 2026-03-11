const {
  getUserNotificationsService,
  markNotificationAsReadService,
  getUnreadCountService
} = require("../services/notification.service")

exports.getMyNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("getMyNotifications: No user ID found in request");
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID" });
    }
    const notifications = await getUserNotificationsService(req.user.id)
    return res.status(200).json({ success: true, data: notifications })
  } catch (error) {
    console.error("getMyNotifications Error:", error);
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    console.log(`Marking notification ${req.params.id} as read`);
    const updated = await markNotificationAsReadService(req.params.id)
    return res.status(200).json({ success: true, data: updated })
  } catch (error) {
    console.error("markAsRead Error:", error);
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.getUnreadCount = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("getUnreadCount: No user ID found in request");
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID" });
    }
    const count = await getUnreadCountService(req.user.id)
    return res.status(200).json({ success: true, unreadCount: count })
  } catch (error) {
    console.error("getUnreadCount Error:", error);
    return res.status(500).json({ success: false, message: error.message })
  }
}
