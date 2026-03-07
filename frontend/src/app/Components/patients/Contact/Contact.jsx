"use client";

import { baseURL } from "@/app/utils/Utils";
import {
  MapPin, Mail, Phone, Clock, MessageSquare,
  Send, Facebook, Twitter, Instagram, Linkedin,
  ChevronRight, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import { useState } from "react";

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    title: "Mailing Address",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
    lines: [
      "India Top Doctor",
      "(A Unit of Prime Time Research Media Pvt Ltd)",
      "C-31, Nawada Housing Complex,",
      "Shivaji Marg, New Delhi 110059",
    ],
  },
  {
    icon: Mail,
    title: "Email Info",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    lines: ["info@indiatopdoctors.com", "support@indiatopdoctors.com"],
    links: true,
    linkPrefix: "mailto:",
  },
  {
    icon: Phone,
    title: "Phone Number",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
    lines: ["+91-9319 9319 04", "+91-9319 9319 04"],
    links: true,
    linkPrefix: "tel:",
  },
  {
    icon: Clock,
    title: "Working Hours",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
    lines: ["Monday – Saturday: 9:00 AM – 6:00 PM", "Sunday: Closed"],
  },
];

const SOCIAL = [
  { icon: Facebook,  label: "Facebook",  href: "https://www.facebook.com/primetimeresearch" },
  { icon: Twitter,   label: "Twitter",   href: "#" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/primetimeresearchmedia" },
  { icon: Linkedin,  label: "LinkedIn",  href: "https://www.linkedin.com/" },
];

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form,    setForm]    = useState(initialForm);
  const [status,  setStatus]  = useState(null)
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${baseURL}/email/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setForm(initialForm);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 py-16 px-4 text-center">
        <p className="text-teal-200 text-sm font-semibold uppercase tracking-widest mb-2">
          Get In Touch
        </p>
        <h1 className="text-4xl font-extrabold text-white mb-3">Contact Us</h1>
        <p className="text-teal-100 text-base max-w-xl mx-auto">
          Have a question or need support? We're here to help you 24/7.
        </p>
        <div className="flex items-center justify-center gap-1 mt-4 text-sm text-teal-200">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white font-semibold">Contact</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14 space-y-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_ITEMS.map(({ icon: Icon, title, color, bg, border, lines, links, linkPrefix }) => (
            <div
              key={title}
              className={`bg-white rounded-2xl border ${border} shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow`}
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
                <div className="space-y-1">
                  {lines.map((line, i) =>
                    links ? (
                      <a
                        key={i}
                        href={`${linkPrefix}${line.replace(/\s/g, '')}`}
                        className={`block text-sm ${color} font-medium hover:underline`}
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={i} className="text-sm text-gray-500 leading-relaxed">{line}</p>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Send a Message</h2>
                <p className="text-xs text-gray-400">We'll reply within 24 hours</p>
              </div>
            </div>

            {status === 'success' && (
              <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Message sent! We'll get back to you soon. Check your inbox for a confirmation.
              </div>
            )}

            {status === 'error' && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Failed to send message. Please try again or call us directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-teal-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-teal-400 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-teal-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-teal-400 transition resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <iframe
                title="India Top Doctor Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.4!2d77.1025!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM2JzUwLjAiTiA3N8KwMDYnMDkuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">India Top Doctor</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      C-31, Nawada Housing Complex, Shivaji Marg, New Delhi 110059
                    </p>
                    <a
                      href="https://maps.google.com/?q=Nawada+Housing+Complex+Shivaji+Marg+New+Delhi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-teal-600 font-semibold hover:underline mt-1.5"
                    >
                      Get Directions <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4">Follow Us</h3>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 text-gray-600 transition group"
                  >
                    <Icon className="w-4 h-4 group-hover:text-teal-600 transition" />
                    <span className="text-sm font-medium">{label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-teal-200 uppercase tracking-wider">24/7 Support Line</p>
                  <p className="text-lg font-extrabold">+91-9319 9319 04</p>
                </div>
              </div>
              <p className="text-teal-100 text-sm">
                Our support team is available around the clock for urgent medical queries and platform assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
