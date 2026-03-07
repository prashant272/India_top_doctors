import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  createGallery,
  getDoctorGallery,
  getGalleryById,
  updateGallery,
  deleteGallery,
} from '@/app/services/doctorGallery.service'

const useDoctorGallery = (doctorId) => {
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDoctorGallery = useCallback(async () => {
    if (!doctorId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getDoctorGallery(doctorId)
      setGallery(res.data.data || [])
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch gallery')
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => {
    fetchDoctorGallery()
  }, [fetchDoctorGallery])

  const fetchGalleryById = async (id) => {
    try {
      const res = await getGalleryById(id)
      return res.data.data
    } catch (err) {
      toast.error('Failed to fetch gallery item')
    }
  }

  const handleCreateGallery = async (payload) => {
    setActionLoading(true)
    try {
      const res = await createGallery(payload)
      setGallery(prev => [res.data.data, ...prev])
      toast.success('Gallery item added')
    } catch (err) {
      toast.error('Failed to add gallery item')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateGallery = async (id, payload) => {
    setActionLoading(true)
    try {
      const res = await updateGallery(id, payload)
      setGallery(prev => prev.map(item => item._id === id ? res.data.data : item))
      toast.success('Gallery item updated')
    } catch (err) {
      toast.error('Failed to update gallery item')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteGallery = async (id) => {
    try {
      await deleteGallery(id)
      setGallery(prev => prev.filter(item => item._id !== id))
      toast.success('Gallery item removed')
    } catch (err) {
      toast.error('Failed to delete gallery item')
    }
  }

  return {
    gallery,
    loading,
    actionLoading,
    error,
    fetchDoctorGallery,
    fetchGalleryById,
    createGallery: handleCreateGallery,
    updateGallery: handleUpdateGallery,
    deleteGallery: handleDeleteGallery,
  }
}

export default useDoctorGallery
