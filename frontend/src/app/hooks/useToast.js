import { useState, useCallback, useRef } from "react"

export const useToast = () => {
    const [toasts, setToasts] = useState([])
    const counterRef = useRef(0)

    const showToast = useCallback(({ message, type = "info", duration = 4000 }) => {
        const id = ++counterRef.current
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return { toasts, showToast, removeToast }
}
