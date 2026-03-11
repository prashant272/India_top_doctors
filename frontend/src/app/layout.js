import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { PatientProvider } from "./context/PatientContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "react-toastify";
import { AdminProvider } from "./context/AdminContext";
import Providers from "./providers";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.indiatopdoctors.com"),
  title: {
    default: "India Top Doctors - Best Doctors, Hospitals & Online Consultation",
    template: "%s | India Top Doctors"
  },
  description: "India's leading platform to find top-rated doctors, hospitals, and medical specialists. Book online appointments, video consultations, and get verified healthcare services.",
  keywords: [
    "India Top Doctors",
    "Online Doctor Consultation",
    "Best Hospitals in India",
    "Book Doctor Appointment",
    "Verified Doctors India",
    "Telemedicine India",
    "Medical Specialists India",
    "Healthcare India",
    "Specialist Doctors near me",
    "Top rated medical care",
    "Doctor Consultation online"
  ],
  authors: [{ name: "India Top Doctors" }],
  creator: "India Top Doctors",
  publisher: "India Top Doctors",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    title: "India Top Doctors - Find & Book the Best Healthcare",
    description: "Connect with verified top-rated doctors and hospitals across India. Quality healthcare at your fingertips.",
    url: "https://www.indiatopdoctors.com",
    siteName: "India Top Doctors",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "India Top Doctors Portal" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "India Top Doctors - Best Medical Services in India",
    description: "Verified doctors, top-rated hospitals, and easy online booking.",
    images: ["/og-image.jpg"],
    creator: "@IndiaTopDoctors",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <AdminProvider>
                  <PatientProvider>
                    <main>{children}</main>
                    <ToastContainer />
                  </PatientProvider>
                </AdminProvider>
              </NotificationProvider>
            </SocketProvider>
          </AuthProvider>
        </Providers>

        {/* Google Maps */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />

        {/* OneSignal Push Notifications */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
              
              try {
                await OneSignal.init({
                  appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '4bda9ea2-7479-47c3-afd6-d41e82631e09'}",
                  notifyButton: { enable: true },
                  allowLocalhostAsSecureOrigin: true,
                });
              } catch (e) {
                if (isLocalhost) {
                  console.warn("OneSignal initialization failed on localhost (expected):", e.message);
                } else {
                  throw e;
                }
              }

              if (isLocalhost) {
                console.log("OneSignal: Skipping push notification prompt on localhost to avoid domain restriction errors.");
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
