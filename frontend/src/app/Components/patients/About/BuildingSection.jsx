import { CheckCircle, TrendingUp, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Find a Local Doctor",
    description:
      "Search thousands of verified doctors near you by specialty, location, and real-time availability.",
  },
  {
    title: "Choose Your Schedule",
    description:
      "Pick a time that works for you. Book instantly or plan ahead with flexible appointment slots.",
  },
  {
    title: "Make a Payment",
    description:
      "Pay securely through multiple payment options. Get instant confirmation right to your phone.",
  },
];

export default function BuildingSection() {
  return (
    <section className="py-20 px-4 bg-white overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap');`}</style>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-500 mb-4">
              Building
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-10 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              We are Building a <br />Sustainable Future.
            </h2>

            <div className="space-y-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#F97316" }}>
                    <CheckCircle className="text-white" style={{ width: 18, height: 18 }} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: "#0D5B4E", fontFamily: "'Playfair Display', serif" }}>
                      {f.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[480px]">
            <div
              className="absolute top-0 right-0 w-[58%] h-[62%] rounded-2xl overflow-hidden shadow-xl"
              style={{ zIndex: 2 }}
            >
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80"
                alt="Doctor consulting"
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className="absolute bottom-0 left-0 w-[48%] h-[42%] rounded-2xl overflow-hidden shadow-xl"
              style={{ zIndex: 2 }}
            >
              <img
                src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80"
                alt="Medical scan"
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className="absolute top-0 left-0 w-[46%] h-[58%] rounded-2xl p-6 flex flex-col justify-end shadow-xl"
              style={{ background: "#F97316", zIndex: 3 }}
            >
              <TrendingUp className="text-white mb-4 opacity-90" style={{ width: 44, height: 44 }} strokeWidth={1.5} />
              <h4
                className="text-white font-bold text-xl leading-snug mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Consult top doctors
              </h4>
              <p className="text-orange-100 text-xs leading-relaxed">
                Get expert medical advice from verified specialists anytime, anywhere across India.
              </p>
            </div>

            <div
              className="absolute bottom-0 right-0 w-[50%] h-[36%] rounded-2xl p-5 flex flex-col justify-center shadow-xl"
              style={{ background: "#0D5B4E", zIndex: 3 }}
            >
              <ShieldCheck className="text-white mb-3 opacity-90" style={{ width: 36, height: 36 }} strokeWidth={1.5} />
              <h4
                className="text-white font-bold text-lg leading-snug"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                You are in safe hands
              </h4>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}