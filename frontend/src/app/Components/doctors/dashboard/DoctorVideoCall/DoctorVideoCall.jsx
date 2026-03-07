'use client'
import React from 'react'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Users, Stethoscope, Signal } from 'lucide-react'
import { useVideoCall } from '@/app/hooks/useVideoCall'
import { useToast } from '@/app/hooks/useToast'
import ToastContainer from '@/app/Components/common/ToastContainer/ToastContainer'
import useAppointment from '@/app/hooks/useAppointment'
import { useParams } from 'next/navigation'

const DoctorVideoCall = () => {
    const { toasts, showToast, removeToast } = useToast()
    const { id: appointmentId } = useParams()
    const { joinCall, leaveCall } = useAppointment()

    const {
        UserAuthData,
        remoteSocketId,
        isMuted,
        isCameraOff,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        isUserJoined,
        remoteUserLeft,
        handleCallUser,
        toggleMute,
        toggleCamera,
        handleEndCall
    } = useVideoCall(showToast)

    const handleStart = async () => {
        if (appointmentId) await joinCall(appointmentId, 'doctor')
        handleCallUser()
    }

    const handleLeave = async () => {
        if (appointmentId) await leaveCall(appointmentId, 'doctor')
        handleEndCall()
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #060d0e 0%, #0a1412 50%, #060d0e 100%)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .orb-doc { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; opacity: 0.1; }
                .pulse-ring-doc { animation: pulseRingDoc 2s ease-in-out infinite; }
                @keyframes pulseRingDoc {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.6; }
                }
                .ctrl-btn-doc { border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .ctrl-btn-doc:hover { transform: translateY(-2px) scale(1.05); }
                .ctrl-btn-doc:active { transform: scale(0.94); }
                .start-btn-doc { border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 10px 22px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 12px; font-weight: 700; border-radius: 14px; letter-spacing: 0.03em; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35); }
                .start-btn-doc:hover { transform: translateY(-1px) scale(1.03); box-shadow: 0 6px 28px rgba(16, 185, 129, 0.5); }
                .start-btn-doc:active { transform: scale(0.96); }
                .video-card-doc { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; }
                .notify-banner-doc { margin: 0 24px; margin-top: 16px; display: flex; align-items: center; justify-content: space-between; background: rgba(16, 185, 129, 0.07); border: 1px solid rgba(16, 185, 129, 0.22); border-radius: 18px; padding: 16px 20px; backdrop-filter: blur(20px); animation: slideDownDoc 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideDownDoc {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .label-badge-doc { position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.55); backdrop-filter: blur(10px); color: white; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.04em; border: 1px solid rgba(255,255,255,0.08); }
                .muted-badge-doc { position: absolute; top: 12px; right: 12px; background: rgba(239, 68, 68, 0.85); backdrop-filter: blur(10px); color: white; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.04em; display: flex; align-items: center; gap: 4px; }
                .status-dot-doc { width: 7px; height: 7px; border-radius: 50%; background: #10b981; animation: pulseRingDoc 1.8s ease-in-out infinite; }
                .controls-bar-doc { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 20px 24px 28px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); }
            `}</style>

            <div className="orb-doc" style={{ width: 500, height: 500, background: '#10b981', top: -200, right: -100 }} />
            <div className="orb-doc" style={{ width: 400, height: 400, background: '#0d9488', bottom: -150, left: -100 }} />

            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}>
                        <Stethoscope size={15} color="white" />
                    </div>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>Doctor Console</span>
                    <div className="status-dot-doc" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '5px 12px' }}>
                        <Signal size={12} color={remoteStream ? '#10b981' : '#64748b'} />
                        <span style={{ color: remoteStream ? '#10b981' : '#64748b', fontSize: 11, fontWeight: 500 }}>
                            {remoteStream ? 'In consultation' : remoteSocketId ? 'Patient connected' : remoteUserLeft ? 'Patient left — waiting...' : 'Waiting for patient...'}
                        </span>
                    </div>
                </div>
            </div>

            {isUserJoined && !remoteStream && (
                <div className="notify-banner-doc">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pulse-ring-doc">
                            <Users size={17} color="#10b981" />
                        </div>
                        <div>
                            <p style={{ color: 'white', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Patient has joined the room</p>
                            <p style={{ color: '#6ee7b7', fontSize: 11 }}>Tap Start to begin the consultation</p>
                        </div>
                    </div>
                    <button className="start-btn-doc" onClick={handleStart}>
                        <Phone size={13} />
                        Start
                    </button>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 5 }}>
                <div style={{ width: '100%', maxWidth: 900 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

                        <div className="video-card-doc" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: remoteStream ? 'block' : 'none' }} />
                            {!remoteStream && (
                                remoteUserLeft ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={24} color="#475569" />
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Patient left the room</p>
                                        <p style={{ color: '#475569', fontSize: 11 }}>Waiting for them to rejoin...</p>
                                    </div>
                                ) : remoteSocketId ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #0d2e25, #0a2420)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(16,185,129,0.12)' }}>
                                            <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>P</span>
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: 11 }}>Connecting stream...</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <Users size={28} color="#1e3a34" />
                                        <p style={{ color: '#475569', fontSize: 13 }}>Waiting for patient to join...</p>
                                    </div>
                                )
                            )}
                            {remoteSocketId && !remoteUserLeft && <div className="label-badge-doc">Patient</div>}
                        </div>

                        <div className="video-card-doc" style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                            {isCameraOff && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,13,14,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{UserAuthData?.name?.[0] || 'D'}</span>
                                    </div>
                                </div>
                            )}
                            <div className="label-badge-doc">Dr. {UserAuthData?.name} (You)</div>
                            {isMuted && <div className="muted-badge-doc"><MicOff size={9} />Muted</div>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="controls-bar-doc">
                <button className="ctrl-btn-doc" onClick={toggleMute} style={{ width: 48, height: 48, borderRadius: '50%', background: isMuted ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.07)', border: isMuted ? 'none' : '1px solid rgba(255,255,255,0.1)', boxShadow: isMuted ? '0 4px 18px rgba(239,68,68,0.4)' : 'none' }}>
                    {isMuted ? <MicOff size={17} color="white" /> : <Mic size={17} color="white" />}
                </button>
                <button className="ctrl-btn-doc" onClick={toggleCamera} style={{ width: 48, height: 48, borderRadius: '50%', background: isCameraOff ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.07)', border: isCameraOff ? 'none' : '1px solid rgba(255,255,255,0.1)', boxShadow: isCameraOff ? '0 4px 18px rgba(239,68,68,0.4)' : 'none' }}>
                    {isCameraOff ? <VideoOff size={17} color="white" /> : <Video size={17} color="white" />}
                </button>
                {remoteSocketId && !remoteStream && (
                    <button className="ctrl-btn-doc" onClick={handleStart} style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 6px 24px rgba(16,185,129,0.45)' }}>
                        <Phone size={20} color="white" />
                    </button>
                )}
                <button className="ctrl-btn-doc" onClick={handleLeave} style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 6px 24px rgba(239,68,68,0.4)' }}>
                    <PhoneOff size={20} color="white" />
                </button>
            </div>
        </div>
    )
}

export default DoctorVideoCall
