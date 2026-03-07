'use client'
import React from 'react'
import { PhoneOff, Mic, MicOff, Video, VideoOff, Users, HeartPulse, Phone, Signal } from 'lucide-react'
import { useVideoCall } from '@/app/hooks/useVideoCall'
import { useToast } from '@/app/hooks/useToast'
import ToastContainer from '@/app/Components/common/ToastContainer/ToastContainer'
import useAppointment from '@/app/hooks/useAppointment'
import { useParams } from 'next/navigation'

const PatientVideoCall = () => {
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
        isDoctorJoin,
        remoteUserLeft,
        toggleMute,
        toggleCamera,
        handleIncomingCallAns,
        handleEndCall
    } = useVideoCall(showToast)

    const handleJoin = async () => {
        if (appointmentId) await joinCall(appointmentId, 'patient')
        handleIncomingCallAns()
    }

    const handleLeave = async () => {
        if (appointmentId) await leaveCall(appointmentId, 'patient')
        handleEndCall()
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #080b14 0%, #0d1120 50%, #080b14 100%)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; opacity: 0.12; }
                .pulse-ring { animation: pulseRing 2s ease-in-out infinite; }
                @keyframes pulseRing {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.6; }
                }
                .bounce-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; animation: bounceDot 1.4s ease-in-out infinite; }
                .bounce-dot:nth-child(2) { animation-delay: 0.2s; }
                .bounce-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounceDot {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
                    40% { transform: translateY(-8px); opacity: 1; }
                }
                .ctrl-btn { border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; }
                .ctrl-btn:hover { transform: translateY(-2px) scale(1.05); }
                .ctrl-btn:active { transform: scale(0.94); }
                .join-btn { border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 10px 22px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 12px; font-weight: 700; border-radius: 14px; letter-spacing: 0.03em; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35); }
                .join-btn:hover { transform: translateY(-1px) scale(1.03); box-shadow: 0 6px 28px rgba(16, 185, 129, 0.5); }
                .join-btn:active { transform: scale(0.96); }
                .video-card { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; }
                .incoming-banner { margin: 0 24px; margin-top: 16px; display: flex; align-items: center; justify-content: space-between; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 18px; padding: 16px 20px; backdrop-filter: blur(20px); animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .label-badge { position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.55); backdrop-filter: blur(10px); color: white; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.04em; border: 1px solid rgba(255,255,255,0.08); }
                .muted-badge { position: absolute; top: 12px; right: 12px; background: rgba(239, 68, 68, 0.85); backdrop-filter: blur(10px); color: white; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.04em; display: flex; align-items: center; gap: 4px; }
                .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #3b82f6; animation: pulseRing 1.8s ease-in-out infinite; }
                .controls-bar { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 20px 24px 28px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); }
            `}</style>

            <div className="orb" style={{ width: 500, height: 500, background: '#3b82f6', top: -200, right: -100 }} />
            <div className="orb" style={{ width: 400, height: 400, background: '#6366f1', bottom: -150, left: -100 }} />

            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
                        <HeartPulse size={15} color="white" />
                    </div>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>Consultation Room</span>
                    <div className="status-dot" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '5px 12px' }}>
                        <Signal size={12} color={remoteStream ? '#10b981' : '#64748b'} />
                        <span style={{ color: remoteStream ? '#10b981' : '#64748b', fontSize: 11, fontWeight: 500 }}>
                            {remoteStream ? 'In consultation' : remoteSocketId ? 'Doctor connected' : remoteUserLeft ? 'Doctor left — waiting...' : 'Waiting for doctor...'}
                        </span>
                    </div>
                </div>
            </div>

            {isDoctorJoin && !remoteStream && (
                <div className="incoming-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pulse-ring">
                            <Phone size={17} color="#10b981" />
                        </div>
                        <div>
                            <p style={{ color: 'white', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Incoming call from Doctor</p>
                            <p style={{ color: '#6ee7b7', fontSize: 11 }}>Tap Join to connect</p>
                        </div>
                    </div>
                    <button className="join-btn" onClick={handleJoin}>
                        <Phone size={13} />
                        Join
                    </button>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 5 }}>
                <div style={{ width: '100%', maxWidth: 900 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

                        <div className="video-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: remoteStream ? 'block' : 'none' }} />
                            {!remoteStream && (
                                remoteUserLeft ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={24} color="#475569" />
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Doctor left the room</p>
                                        <p style={{ color: '#475569', fontSize: 11 }}>Waiting for them to rejoin...</p>
                                    </div>
                                ) : remoteSocketId ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f, #1e2d4a)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59,130,246,0.15)' }}>
                                            <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Dr</span>
                                        </div>
                                        <p style={{ color: '#94a3b8', fontSize: 11 }}>{isDoctorJoin ? 'Doctor is calling...' : 'Connecting stream...'}</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                        <Users size={28} color="#334155" />
                                        <p style={{ color: '#475569', fontSize: 13 }}>Waiting for doctor to join...</p>
                                    </div>
                                )
                            )}
                            {remoteSocketId && !remoteUserLeft && <div className="label-badge">Doctor</div>}
                        </div>

                        <div className="video-card" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.18)' }}>
                            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                            {isCameraOff && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,11,20,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{UserAuthData?.name?.[0] || 'P'}</span>
                                    </div>
                                </div>
                            )}
                            <div className="label-badge">{UserAuthData?.name || 'Patient'} (You)</div>
                            {isMuted && <div className="muted-badge"><MicOff size={9} />Muted</div>}
                        </div>
                    </div>

                    {!remoteSocketId && !remoteUserLeft && (
                        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <span className="bounce-dot" />
                                <span className="bounce-dot" />
                                <span className="bounce-dot" />
                            </div>
                            <p style={{ color: '#475569', fontSize: 12 }}>Your doctor will start the call shortly</p>
                        </div>
                    )}

                    {remoteUserLeft && !remoteSocketId && (
                        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <span className="bounce-dot" style={{ background: '#334155' }} />
                                <span className="bounce-dot" style={{ background: '#334155' }} />
                                <span className="bounce-dot" style={{ background: '#334155' }} />
                            </div>
                            <p style={{ color: '#475569', fontSize: 12 }}>Doctor disconnected. Waiting for them to return...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="controls-bar">
                <button className="ctrl-btn" onClick={toggleMute} style={{ width: 48, height: 48, borderRadius: '50%', background: isMuted ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.07)', border: isMuted ? 'none' : '1px solid rgba(255,255,255,0.1)', boxShadow: isMuted ? '0 4px 18px rgba(239,68,68,0.4)' : 'none' }}>
                    {isMuted ? <MicOff size={17} color="white" /> : <Mic size={17} color="white" />}
                </button>
                <button className="ctrl-btn" onClick={toggleCamera} style={{ width: 48, height: 48, borderRadius: '50%', background: isCameraOff ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.07)', border: isCameraOff ? 'none' : '1px solid rgba(255,255,255,0.1)', boxShadow: isCameraOff ? '0 4px 18px rgba(239,68,68,0.4)' : 'none' }}>
                    {isCameraOff ? <VideoOff size={17} color="white" /> : <Video size={17} color="white" />}
                </button>
                {isDoctorJoin && !remoteStream && (
                    <button className="ctrl-btn" onClick={handleJoin} style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 6px 24px rgba(16,185,129,0.45)' }}>
                        <Phone size={20} color="white" />
                    </button>
                )}
                <button className="ctrl-btn" onClick={handleLeave} style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 6px 24px rgba(239,68,68,0.4)' }}>
                    <PhoneOff size={20} color="white" />
                </button>
            </div>
        </div>
    )
}

export default PatientVideoCall
