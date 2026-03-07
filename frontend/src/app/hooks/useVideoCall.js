import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "@/app/context/AuthContext"
import { SocketContext } from "@/app/context/SocketContext"
import { useParams, useSearchParams } from "next/navigation"
import peer from "@/app/services/peer"

export const useVideoCall = (showToast) => {
    const { id } = useParams()
    const searchParams = useSearchParams()
    const patientId = searchParams.get("patientId")

    const { socket } = useContext(SocketContext)
    const { UserAuthData } = useContext(AuthContext)

    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isCameraOff, setIsCameraOff] = useState(false)
    const [remoteStream, setRemoteStream] = useState(null)
    const [isDoctorJoin, setIsDoctorJoin] = useState(false)
    const [isUserJoined, setIsUserJoined] = useState(false)
    const [remoteUserLeft, setRemoteUserLeft] = useState(false)

    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const localStreamRef = useRef(null)
    const remoteSocketIdRef = useRef(null)
    const fromRef = useRef(null)
    const offerRef = useRef(null)
    const roomInfoRef = useRef({ roomId: null, role: null, userId: null })

    const updateRemoteSocketId = useCallback((socketId) => {
        setRemoteSocketId(socketId)
        remoteSocketIdRef.current = socketId
    }, [])

    const startLocalStream = useCallback(async () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop())
            localStreamRef.current = null
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
        return stream
    }, [])

    const initPeerConnection = useCallback(() => {
        peer.destroyPeer()
        peer.initPeer(
            (candidate) => {
                if (remoteSocketIdRef.current) {
                    socket.emit("ice-candidate", {
                        to: remoteSocketIdRef.current,
                        candidate,
                    })
                }
            },
            (stream) => {
                setRemoteStream(stream)
                setRemoteUserLeft(false)
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream
                }
                showToast({ message: "Video stream connected successfully", type: "success" })
            }
        )
    }, [socket, showToast])

    const softCleanupStream = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop())
            localStreamRef.current = null
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = null
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
        peer.destroyPeer()
        setRemoteStream(null)
        setIsDoctorJoin(false)
        setIsMuted(false)
        setIsCameraOff(false)
    }, [])

    const handleRoomState = useCallback(({ remoteSocketId: rSocketId, remoteRole, shouldCall }) => {
        updateRemoteSocketId(rSocketId)
        setRemoteUserLeft(false)

        if (remoteRole === "patient") {
            setIsUserJoined(true)
            showToast({ message: "Patient is in the room.", type: "call" })
        }

        if (remoteRole === "doctor") {
            setIsDoctorJoin(true)
            showToast({ message: "Doctor is in the room.", type: "info" })
        }

        if (shouldCall) {
            setTimeout(async () => {
                try {
                    initPeerConnection()
                    const stream = await startLocalStream()
                    for (const track of stream.getTracks()) {
                        peer.peer.addTrack(track, stream)
                    }
                    const offer = await peer.getOffer()
                    socket.emit("video:offer", { to: rSocketId, offer })
                    showToast({ message: "Calling patient...", type: "call" })
                } catch (err) {
                    showToast({ message: "Failed to reconnect. Please try manually.", type: "error" })
                }
            }, 500)
        }
    }, [updateRemoteSocketId, initPeerConnection, startLocalStream, socket, showToast])

    const handleUserJoined = useCallback(({ SocketId, role }) => {
        updateRemoteSocketId(SocketId)
        setRemoteUserLeft(false)

        if (role === "patient") {
            setIsUserJoined(true)
            showToast({ message: "Patient has joined the room", type: "call" })
        }

        if (role === "doctor") {
            setIsDoctorJoin(true)
            showToast({ message: "Doctor has joined the room", type: "info" })
        }
    }, [updateRemoteSocketId, showToast])

    const handleUserLeft = useCallback(({ role }) => {
        softCleanupStream()
        updateRemoteSocketId(null)
        setIsUserJoined(false)
        setRemoteUserLeft(true)

        if (role === "patient") {
            showToast({ message: "Patient has left the room", type: "endcall" })
        }
        if (role === "doctor") {
            showToast({ message: "Doctor has left the room", type: "endcall" })
        }
    }, [softCleanupStream, updateRemoteSocketId, showToast])

    const handleIncomingCall = useCallback(({ from, offer }) => {
        updateRemoteSocketId(from)
        setIsDoctorJoin(true)
        setRemoteUserLeft(false)
        fromRef.current = from
        offerRef.current = offer
        showToast({ message: "Incoming call from Doctor. Tap Join to connect.", type: "call" })
    }, [updateRemoteSocketId, showToast])

    const handleIncomingCallAns = useCallback(async () => {
        try {
            initPeerConnection()
            const stream = await startLocalStream()
            for (const track of stream.getTracks()) {
                peer.peer.addTrack(track, stream)
            }
            const ans = await peer.getAnswer(offerRef.current)
            socket.emit("answerofcall", { to: fromRef.current, ans })
            showToast({ message: "Joining consultation...", type: "info" })
        } catch (err) {
            showToast({ message: "Could not access camera/mic. Please check permissions.", type: "error" })
        }
    }, [initPeerConnection, startLocalStream, socket, showToast])

    const handleAnswerOfCall = useCallback(async ({ ans }) => {
        if (peer.peer && peer.peer.signalingState === "have-local-offer") {
            await peer.setRemoteDescription(ans)
            showToast({ message: "Patient accepted the call", type: "success" })
        }
    }, [showToast])

    const handleCallUser = useCallback(async () => {
        try {
            initPeerConnection()
            const stream = await startLocalStream()
            for (const track of stream.getTracks()) {
                peer.peer.addTrack(track, stream)
            }
            const offer = await peer.getOffer()
            socket.emit("video:offer", { to: remoteSocketIdRef.current, offer })
            showToast({ message: "Calling patient...", type: "call" })
        } catch (err) {
            showToast({ message: "Could not access camera/mic. Please check permissions.", type: "error" })
        }
    }, [initPeerConnection, startLocalStream, socket, showToast])

    const toggleMute = useCallback(() => {
        if (!localStreamRef.current) return
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled))
        setIsMuted((prev) => {
            showToast({ message: prev ? "Microphone unmuted" : "Microphone muted", type: prev ? "success" : "error" })
            return !prev
        })
    }, [showToast])

    const toggleCamera = useCallback(() => {
        if (!localStreamRef.current) return
        localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled))
        setIsCameraOff((prev) => {
            showToast({ message: prev ? "Camera turned on" : "Camera turned off", type: prev ? "success" : "error" })
            return !prev
        })
    }, [showToast])

    const cleanupCall = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop())
            localStreamRef.current = null
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = null
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
        peer.destroyPeer()
        setRemoteStream(null)
        updateRemoteSocketId(null)
        setIsDoctorJoin(false)
        setIsUserJoined(false)
        setRemoteUserLeft(false)
        setIsMuted(false)
        setIsCameraOff(false)
    }, [updateRemoteSocketId])

    const handleEndCall = useCallback(() => {
        if (remoteSocketIdRef.current) {
            socket.emit("video:end-call", { to: remoteSocketIdRef.current })
        }
        cleanupCall()
        showToast({ message: "You ended the call", type: "endcall" })
    }, [socket, cleanupCall, showToast])

    const handleRemoteEndCall = useCallback(() => {
        cleanupCall()
        showToast({ message: "The other party ended the call", type: "endcall" })
    }, [cleanupCall, showToast])

    useEffect(() => {
        if (!socket || !UserAuthData?.userId) return

        roomInfoRef.current = {
            roomId: id,
            role: UserAuthData.role,
            userId: UserAuthData.userId,
        }

        socket.emit("video:join-room", {
            userId: UserAuthData.userId,
            roomId: id,
            role: UserAuthData.role,
            patientId: UserAuthData.role === "doctor" ? patientId : undefined,
        })

        showToast({ message: "You joined the room", type: "info" })

        const handleIceCandidate = async ({ candidate }) => {
            await peer.addIceCandidate(candidate)
        }

        const handleForceDisconnect = () => {
            cleanupCall()
        }

        socket.on("video:room-state", handleRoomState)
        socket.on("video:user-joined", handleUserJoined)
        socket.on("video:user-left", handleUserLeft)
        socket.on("incommingcall", handleIncomingCall)
        socket.on("callacceptted", handleAnswerOfCall)
        socket.on("video:end-call", handleRemoteEndCall)
        socket.on("ice-candidate", handleIceCandidate)
        socket.on("video:force-disconnect", handleForceDisconnect)

        return () => {
            const { roomId, role, userId } = roomInfoRef.current
            if (roomId && role && userId) {
                socket.emit("video:leave-room", { userId, roomId, role })
            }

            socket.off("video:room-state", handleRoomState)
            socket.off("video:user-joined", handleUserJoined)
            socket.off("video:user-left", handleUserLeft)
            socket.off("incommingcall", handleIncomingCall)
            socket.off("callacceptted", handleAnswerOfCall)
            socket.off("video:end-call", handleRemoteEndCall)
            socket.off("ice-candidate", handleIceCandidate)
            socket.off("video:force-disconnect", handleForceDisconnect)
            cleanupCall()
        }
    }, [socket, id, UserAuthData?.userId, UserAuthData?.role])

    return {
        id,
        UserAuthData,
        remoteSocketId,
        isMuted,
        isCameraOff,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        isDoctorJoin,
        isUserJoined,
        remoteUserLeft,
        handleCallUser,
        toggleMute,
        toggleCamera,
        handleIncomingCallAns,
        handleEndCall,
    }
}
