const express = require('express')
const {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    confirmAppointment,
    cancelAppointment,
    joinCall,
    leaveCall,
    deleteAppointment,
} = require('../controllers/appointment.controller')

const AppointmentRouter = express.Router()

AppointmentRouter.post('/createappointment', createAppointment)
AppointmentRouter.get('/getappointment', getAllAppointments)
AppointmentRouter.get('/getappointment/:id', getAppointmentById)
AppointmentRouter.patch('/:id/update', updateAppointment)
AppointmentRouter.patch('/:id/confirm', confirmAppointment)
AppointmentRouter.patch('/:id/cancel', cancelAppointment)
AppointmentRouter.patch('/:id/join', joinCall)
AppointmentRouter.patch('/:id/leave', leaveCall)
AppointmentRouter.delete('/:id/delete', deleteAppointment)

module.exports = AppointmentRouter
