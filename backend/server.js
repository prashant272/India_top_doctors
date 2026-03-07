require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectdb } = require("./config/db");
const { server, app } = require("./services/socket.service");

const AuthRouter = require("./routes/auth.routes");
const PatientRouter = require("./routes/patient.routes");
const AppointmentRouter = require("./routes/appointment.routes");
const DoctorRouter = require("./routes/doctor.routes");
const errormiddleware = require("./middleware/errormiddleware");
const NotificationRouter = require("./routes/notification.routes");
const PrescriptionRouter = require("./routes/prescription.route");
const AdminRouter = require("./routes/admin.routes");
const BlogRouter = require("./routes/blog.routes");
const PlansRouter = require("./routes/plans.routes");
const ReviewRouter = require("./routes/reviews.routes");
const DoctorGalleryRouter = require("./routes/doctorGallery.routes");
const startAllCrons = require("./crons");
const Otprouter = require("./routes/otp.routes");
const ForgotPassrouter = require("./routes/forgotPassword.routes");
const Contactrouter = require("./routes/contact.route");
const hospitalRouter = require("./routes/hospital.route");
const providerRouter = require("./routes/provider.routes");

startAllCrons();

connectdb();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://www.indiatopdoctors.com",
  "https://indiatopdoctors.com",
];

app.use(cors({
  origin: function (origin, callback) {
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
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.send("Server is running"));

app.use("/auth", AuthRouter);
app.use("/patient", PatientRouter);
app.use("/appointment", AppointmentRouter);
app.use("/doctor", DoctorRouter);
app.use("/notification", NotificationRouter);
app.use("/prescription", PrescriptionRouter);
app.use("/admin", AdminRouter);
app.use("/blog", BlogRouter)
app.use("/plans", PlansRouter)
app.use("/review", ReviewRouter)
app.use("/doctorGallery", DoctorGalleryRouter)
app.use("/otp", Otprouter)
app.use("/forgot-password", ForgotPassrouter)
app.use("/email", Contactrouter)
app.use("/hospitals", hospitalRouter)
app.use("/providers", providerRouter)
app.use(errormiddleware);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
