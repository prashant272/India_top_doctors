const express = require('express')
const { createPlan, getPlans, updatePlan, deletePlan, purchasePlan } = require('../controllers/plans.controller')

const PlansRouter = express.Router()

PlansRouter.post("/createplan",createPlan)
PlansRouter.get("/getplans",getPlans)
PlansRouter.put("/updateplan/:id",updatePlan)
PlansRouter.delete("/deleteplan/:id",deletePlan)
PlansRouter.post("/purchaseplan/",purchasePlan)

module.exports = PlansRouter