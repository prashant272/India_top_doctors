const permissionsByRole = {
  SUPER_ADMIN: {
    manageDoctors: true,
    managePatients: true,
    manageAppointments: true,
    manageReports: true
  },
  ADMIN: {
    manageDoctors: true,
    managePatients: true,
    manageAppointments: true,
    manageReports: true
  },
};

module.exports = permissionsByRole;
