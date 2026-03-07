const express = require("express");
const hospitalRouter = express.Router();
const hospitalController = require("../controllers/hospital.controller");

hospitalRouter.get("/",        hospitalController.getHospitals);
hospitalRouter.get("/search",  hospitalController.searchHospitals);
hospitalRouter.get("/nearby",  hospitalController.getNearbyHospitals);
hospitalRouter.get("/:id",     hospitalController.getHospitalById);

module.exports = hospitalRouter;
