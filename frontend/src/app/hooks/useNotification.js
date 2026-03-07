'use client'

import { useState, useCallback } from 'react'
import * as notificationService from "@/app/services/notification.service"

export const useNotification = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await notificationService.getNotifications()
      return { status: response.status, data: response.data }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications')
      return { status: err?.response?.status, data: err?.response?.data }
    } finally {
      setLoading(false)
    }
  }, [])

  const markNotificationRead = useCallback(async (id) => {
    try {
      const response = await notificationService.markAsRead(id)
      return { status: response.status, data: response.data }
    } catch (err) {
      return { status: err?.response?.status, data: err?.response?.data }
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount()
      return { status: response.status, data: response.data }
    } catch (err) {
      return { status: err?.response?.status, data: err?.response?.data }
    }
  }, [])

  return {
    loading,
    error,
    fetchNotifications,
    markNotificationRead,
    fetchUnreadCount,
  }
}
