require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectdb } = require("./config/db");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
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
const PaymentRouter = require("./routes/payment.routes");

startAllCrons();

connectdb();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(morgan("dev"));

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
// app.use(mongoSanitize()); // Prevent NoSQL query injection - Disabled due to Express 5 compatibility (Cannot set property query)
app.use(compression()); // Compress response bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth", limiter); // Apply rate limit to auth routes


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
app.use("/api/payment", PaymentRouter);

app.use(errormiddleware);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
