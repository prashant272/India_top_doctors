const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://www.indiatopdoctors.com",
    "https://indiatopdoctors.com",
];

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            // In development, allow if origin is local or missing
            const isLocal = !origin ||
                origin.includes("localhost") ||
                origin.includes("127.0.0.1") ||
                origin.includes("192.168.");

            if (isLocal || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    },
    pingTimeout: 10000,
    pingInterval: 5000,
});

const users = {};
const roomMembers = {};

const getReceiverSocketId = (receiverId) => users[receiverId] || null;

const isSocketAlive = (socketId) => io.sockets.sockets.has(socketId);

const handleRoomLeave = (socket, userId, roomId, role) => {
    if (!roomId || !role) return;
    if (!roomMembers[roomId]) return;
    if (roomMembers[roomId][role]?.socketId !== socket.id) return;

    const otherRole = role === "doctor" ? "patient" : "doctor";
    const otherMember = roomMembers[roomId][otherRole];

    if (otherMember && isSocketAlive(otherMember.socketId)) {
        io.to(otherMember.socketId).emit("video:user-left", { role });
    }

    delete roomMembers[roomId][role];

    if (Object.keys(roomMembers[roomId]).length === 0) {
        delete roomMembers[roomId];
    }
};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        users[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(users));

    socket.on("video:join-room", ({ userId, patientId, roomId, role }) => {
        socket.join(roomId);

        if (!roomMembers[roomId]) roomMembers[roomId] = {};

        const existingEntry = roomMembers[roomId][role];
        if (existingEntry && existingEntry.socketId !== socket.id && isSocketAlive(existingEntry.socketId)) {
            io.to(existingEntry.socketId).emit("video:force-disconnect");
        }

        roomMembers[roomId][role] = { socketId: socket.id, userId };

        const otherRole = role === "doctor" ? "patient" : "doctor";

        if (roomMembers[roomId][otherRole] && !isSocketAlive(roomMembers[roomId][otherRole].socketId)) {
            delete roomMembers[roomId][otherRole];
        }

        const freshOtherMember = roomMembers[roomId][otherRole];

        if (freshOtherMember && isSocketAlive(freshOtherMember.socketId)) {
            socket.emit("video:room-state", {
                remoteSocketId: freshOtherMember.socketId,
                remoteRole: otherRole,
                shouldCall: role === "doctor",
            });

            socket.to(freshOtherMember.socketId).emit("video:room-state", {
                remoteSocketId: socket.id,
                remoteRole: role,
                shouldCall: false,
            });
            return;
        }

        if (role === "doctor" && patientId && users[patientId]) {
            const patientSocketId = users[patientId];
            if (isSocketAlive(patientSocketId)) {
                socket.to(patientSocketId).emit("video:doctor-joined", { roomId });
            }
        }

        socket.to(roomId).emit("video:user-joined", { SocketId: socket.id, role });
    });

    socket.on("video:leave-room", ({ userId, roomId, role }) => {
        handleRoomLeave(socket, userId, roomId, role);
        socket.leave(roomId);
    });

    socket.on("video:offer", ({ to, offer }) => {
        socket.to(to).emit("incommingcall", { from: socket.id, offer });
    });

    socket.on("answerofcall", ({ to, ans }) => {
        io.to(to).emit("callacceptted", { from: socket.id, ans });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        socket.to(to).emit("ice-candidate", { candidate });
    });

    socket.on("video:end-call", ({ to }) => {
        io.to(to).emit("video:end-call");
    });

    socket.on("appointment:status-update", ({ roomId, appointmentId, status, doctorJoinStatus, patientJoinStatus, callStartedAt, callEndedAt, callDuration }) => {
        socket.to(roomId).emit("appointment:updated", {
            appointmentId,
            status,
            doctorJoinStatus,
            patientJoinStatus,
            callStartedAt,
            callEndedAt,
            callDuration,
        });
    });

    socket.on("disconnect", () => {
        if (userId) {
            delete users[userId];
        }

        for (const roomId in roomMembers) {
            for (const role in roomMembers[roomId]) {
                if (roomMembers[roomId][role]?.socketId === socket.id) {
                    handleRoomLeave(socket, userId, roomId, role);
                }
            }
        }

        io.emit("getOnlineUsers", Object.keys(users));
    });
});

module.exports = { app, io, server, getReceiverSocketId };
