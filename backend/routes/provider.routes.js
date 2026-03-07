const express = require("express");
const providerRouter = express.Router();
const providerController = require("../controllers/provider.controller");
const { protectProvider } = require("../middleware/protectProviderMiddleware");

providerRouter.post("/signup", providerController.signup);
providerRouter.post("/signin", providerController.signin);

providerRouter.get("/me",   protectProvider, providerController.getMe);
providerRouter.patch("/me", protectProvider, providerController.updateMe);

providerRouter.post("/hospitals",              protectProvider, providerController.createHospital);
providerRouter.get("/hospitals",               protectProvider, providerController.getMyHospitals);
providerRouter.get("/hospitals/:id",           protectProvider, providerController.getHospitalById);
providerRouter.patch("/hospitals/:id",         protectProvider, providerController.updateHospital);
providerRouter.delete("/hospitals/:id",        protectProvider, providerController.deleteHospital);
providerRouter.patch("/hospitals/:id/toggle",  protectProvider, providerController.toggleActiveStatus);
providerRouter.post("/hospitals/add-doctor",   protectProvider, providerController.addDoctor);
providerRouter.post("/hospitals/remove-doctor",protectProvider, providerController.removeDoctor);

module.exports = providerRouter;
