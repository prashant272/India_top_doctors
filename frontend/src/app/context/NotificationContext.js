"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";
import * as notificationService from "@/app/services/notification.service";

export const NotificationContext = createContext();

const EVENT_CONFIG = {
    newMessage: {
        title: (role) => role === "doctor" ? "New Appointment Booked" : "Appointment Update",
        message: (data, role) =>
            role === "doctor"
                ? `${data?.Patient?.basicInfo?.fullName || "A patient"} booked an appointment on ${new Date(data?.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                : `Your appointment with Dr. ${data?.doctor?.basicInfo?.fullName || "your doctor"} has been updated`,
        type: "info",
    },
    appointmentConfirmed: {
        title: () => "Appointment Confirmed",
        message: (data) =>
            `Your appointment on ${new Date(data?.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} has been confirmed`,
        type: "success",
    },
    appointmentCancelled: {
        title: () => "Appointment Cancelled",
        message: (data) =>
            `Appointment on ${new Date(data?.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} was cancelled`,
        type: "error",
    },
    appointmentCompleted: {
        title: () => "Appointment Completed",
        message: (data) =>
            `Your appointment with Dr. ${data?.doctor?.basicInfo?.fullName || "your doctor"} is marked as completed`,
        type: "success",
    },
    appointmentRescheduled: {
        title: (role) => role === "doctor" ? "Appointment Rescheduled by Patient" : "Appointment Rescheduled",
        message: (data, role) =>
            role === "doctor"
                ? `${data?.Patient?.basicInfo?.fullName || "A patient"} rescheduled their appointment to ${new Date(data?.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                : `Your appointment has been rescheduled to ${new Date(data?.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        type: "info",
    },
    prescriptionAdded: {
        title: () => "New Prescription Added",
        message: (data) =>
            `Dr. ${data?.doctor?.basicInfo?.fullName || "Your doctor"} added a prescription${data?.diagnosis ? ` for ${data.diagnosis}` : ""}`,
        type: "info",
    },
    "appointment:missed": {
        title: () => "Appointment Missed",
        message: (data) => data?.message || "An appointment was missed",
        type: "warning",
    },
};

const DoctorJoinedModal = ({ roomId, onJoin, onDismiss }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-blue-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl shadow-blue-900/40">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23 16.92z" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold text-lg">Doctor has joined!</p>
                        <p className="text-slate-400 text-sm mt-1">Your doctor is ready for the consultation</p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onDismiss}
                            className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-all duration-200"
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={onJoin}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-emerald-500/30 active:scale-95"
                        >
                            Join Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const { socket } = useContext(SocketContext);
    const { UserAuthData, Userdispatch } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [doctorJoinedModal, setDoctorJoinedModal] = useState(null);

    const [appointments, setAppointments] = useState([]);

    const upsertAppointment = useCallback((incoming) => {
        if (!incoming?._id) return;
        setAppointments((prev) => {
            const exists = prev.some((a) => a._id === incoming._id);
            if (exists) return prev.map((a) => a._id === incoming._id ? { ...a, ...incoming } : a);
            return [incoming, ...prev];
        });
    }, []);


    const router = useRouter();

    const syncUnreadCount = useCallback((list) => {
        setUnreadCount(list.filter((n) => !n.read).length);
    }, []);

    const showToast = useCallback((type, title, message) => {
        const content = (
            <div>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{message}</p>
            </div>
        );
        const options = {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        };
        if (type === "success") toast.success(content, options);
        else if (type === "error") toast.error(content, options);
        else if (type === "warning") toast.warning(content, options);
        else toast.info(content, options);
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await notificationService.getNotifications();
            if (response?.status === 200) {
                const raw = response.data?.data ?? response.data ?? [];
                const data = Array.isArray(raw) ? raw : [];
                const fetched = data.map((n) => ({
                    id: n._id,
                    title: n.title,
                    message: n.message,
                    type: n.type || "info",
                    notificationId: n._id,
                    read: n.read || false,
                    createdAt: new Date(n.createdAt),
                }));
                setNotifications((prev) => {
                    const fetchedIds = new Set(fetched.map((n) => n.id));
                    const socketOnly = prev.filter((n) => !fetchedIds.has(n.id));
                    const merged = [...socketOnly, ...fetched]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 50);
                    syncUnreadCount(merged);
                    return merged;
                });
            }
            return { status: response.status, data: response.data };
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to load notifications");
            return { status: err?.response?.status, data: err?.response?.data };
        } finally {
            setLoading(false);
        }
    }, [syncUnreadCount]);

    const addNotification = useCallback((notification) => {
        const newNotif = {
            id: notification.id || notification._id || String(Date.now() + Math.random()),
            title: notification.title,
            message: notification.message,
            type: notification.type || "info",
            notificationId: notification.notificationId || notification._id,
            read: false,
            createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date(),
        };
        setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotif.id)) return prev;
            const updated = [newNotif, ...prev].slice(0, 50);
            syncUnreadCount(updated);
            return updated;
        });
    }, [syncUnreadCount]);

    useEffect(() => {
        if (UserAuthData?.userId || UserAuthData?._id) {
            fetchNotifications();
        }
    }, [UserAuthData?.userId]);

    useEffect(() => {
        if (!socket || !UserAuthData) return;

        const handleEvent = (eventKey) => (payload) => {
            const config = EVENT_CONFIG[eventKey];
            if (!config) return;
            const notification = payload?.notification || payload;
            const data = payload?.data || notification;

            const appointment = notification?.appointment || data?.appointment || data;
            if (appointment?._id) upsertAppointment(appointment);

            const title = notification?.title || config.title(UserAuthData?.role);
            const message = notification?.message || config.message(data, UserAuthData?.role);
            showToast(config.type, title, message);
            addNotification({
                id: notification?._id,
                title,
                message,
                type: config.type,
                notificationId: notification?._id,
                read: false,
                createdAt: notification?.createdAt || new Date(),
            });
        };

        const handleMissed = (data) => {
            if (!data?.appointmentId) return;
            setAppointments((prev) =>
                prev.map((a) => a._id === data.appointmentId ? { ...a, status: "missed" } : a)
            );
            const config = EVENT_CONFIG["appointment:missed"];
            showToast(config.type, config.title(), config.message(data));
        };

        const handleCallUpdate = (data) => {
            if (!data?.appointmentId) return;
            setAppointments((prev) =>
                prev.map((a) => a._id === data.appointmentId ? { ...a, ...data } : a)
            );
        };

        const handlePlanExpired = () => {
            Userdispatch({ type: "PLAN_EXPIRED" });
            showToast("warning", "Plan Expired", "Your subscription plan has expired. You've been moved to the Basic Plan.");
        };

        const handleDoctorJoined = ({ roomId }) => {
            setDoctorJoinedModal({ roomId });
            showToast("info", "Doctor Joined", "Your doctor has joined the consultation room");
        };

        const handlers = Object.keys(EVENT_CONFIG)
            .filter((key) => key !== "appointment:missed")
            .map((key) => ({ event: key, fn: handleEvent(key) }));

        handlers.forEach(({ event, fn }) => socket.on(event, fn));
        socket.on("appointment:missed", handleMissed);
        socket.on("appointment:updated", handleCallUpdate);
        socket.on("plan:expired", handlePlanExpired);
        socket.on("video:doctor-joined", handleDoctorJoined);

        return () => {
            handlers.forEach(({ event, fn }) => socket.off(event, fn));
            socket.off("appointment:missed", handleMissed);
            socket.off("appointment:updated", handleCallUpdate);
            socket.off("plan:expired", handlePlanExpired);
            socket.off("video:doctor-joined", handleDoctorJoined);
        };
    }, [socket, UserAuthData, showToast, addNotification, upsertAppointment, Userdispatch]);

    const markOneRead = useCallback(async (id) => {
        setNotifications((prev) => {
            const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
            syncUnreadCount(updated);
            return updated;
        });
        try {
            await notificationService.markAsRead(id);
        } catch {
            setNotifications((prev) => {
                const reverted = prev.map((n) => (n.id === id ? { ...n, read: false } : n));
                syncUnreadCount(reverted);
                return reverted;
            });
        }
    }, [syncUnreadCount]);

    const markAllRead = useCallback(async () => {
        let unreadIds = [];
        setNotifications((prev) => {
            unreadIds = prev.filter((n) => !n.read).map((n) => n.id);
            const updated = prev.map((n) => ({ ...n, read: true }));
            syncUnreadCount(updated);
            return updated;
        });
        try {
            await Promise.all(unreadIds.map((id) => notificationService.markAsRead(id)));
        } catch {
            fetchNotifications();
        }
    }, [syncUnreadCount, fetchNotifications]);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                error,
                fetchNotifications,
                markAllRead,
                markOneRead,
                clearAll,
                // Appointment sync
                appointments,
                setAppointments,
                upsertAppointment,
            }}
        >
            {children}
            {doctorJoinedModal && (
                <DoctorJoinedModal
                    roomId={doctorJoinedModal.roomId}
                    onJoin={() => {
                        setDoctorJoinedModal(null);
                        router.push(`/patient/video-call/${doctorJoinedModal.roomId}`);
                    }}
                    onDismiss={() => setDoctorJoinedModal(null)}
                />
            )}
        </NotificationContext.Provider>
    );
};
