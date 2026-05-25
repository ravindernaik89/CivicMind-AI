import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [showLearnMore, setShowLearnMore] = useState(false);
  const learnMoreRef = useRef(null);

  useEffect(() => {
    if (showLearnMore) {
      learnMoreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showLearnMore]);

  const scrollToLearnMore = () => {
    setShowLearnMore(true);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.25),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.16),transparent_28%)]" />
      <nav className="relative z-10 flex justify-between items-center p-6 bg-black bg-opacity-25 backdrop-blur-sm border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CivicMind AI</h1>
          <p className="text-sm text-gray-300">Smart civic reporting for your neighborhood</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2 text-sm font-semibold shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-6 py-2 text-sm font-semibold shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Register
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-12">
        <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl animate-float" />
        <div className="absolute left-10 bottom-10 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl animate-float animation-delay-2000" />
        <div className="w-full max-w-6xl rounded-[32px] bg-white/10 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl ring-1 ring-white/10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <section className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-white/20 animate-fade-in-up">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                AI-powered civic issue tracking
              </span>
              <h2 className="mt-6 text-5xl font-bold leading-tight text-white sm:text-6xl animate-fade-in-up">
                Make your community safer with real-time issue reporting
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-slate-300 animate-fade-in-up animation-delay-150">
                Manage neighborhood problems faster with smart routing, clear status updates, and an intuitive citizen experience.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 px-8 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition duration-500 group-hover:opacity-100" />
                  <span className="relative">Get Started</span>
                </button>
                <button
                  onClick={scrollToLearnMore}
                  className="rounded-2xl border border-white/20 bg-white/10 px-8 py-3 text-base font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-white/15"
                >
                  Learn More
                </button>
              </div>
            </section>

            <section className="grid gap-5 sm:grid-cols-2">
              {[
                { title: "Citizen Reporting", description: "Submit issues quickly from any device.", accent: "from-blue-500 to-cyan-500" },
                { title: "Officer Routing", description: "Assign and resolve complaints faster.", accent: "from-purple-500 to-fuchsia-500" },
                { title: "Admin Insights", description: "Track department performance with clarity.", accent: "from-rose-500 to-pink-500" },
                { title: "Secure Login", description: "Role-based access for every user type.", accent: "from-emerald-500 to-lime-500" },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`group rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-xl shadow-slate-950/30 transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-slate-900/70 ${index % 2 === 0 ? 'animate-fade-in-up' : 'animate-fade-in-up animation-delay-100'}`}
                >
                  <div className={`mb-3 inline-flex rounded-full bg-gradient-to-r ${item.accent} bg-clip-text px-3 text-sm font-semibold text-transparent`}>•</div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </main>

      {showLearnMore && (
        <section ref={learnMoreRef} id="learn-more" className="relative z-10 scroll-mt-24 bg-slate-950/80 py-16 px-6 text-white sm:px-10">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex flex-col gap-4 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">What CivicMind AI offers</p>
              <h2 className="text-4xl font-bold text-white">A smarter way to manage civic issues</h2>
              <p className="mx-auto max-w-3xl text-lg text-slate-300">
                CivicMind AI connects citizens, officers, and administrators through a single platform for faster reporting, clearer status tracking, and more effective resolution.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {[
                {
                  title: "Citizen Reports",
                  description: "Submit complaints with text and optional images, then track progress in real time.",
                  accent: "from-cyan-500 to-blue-500",
                },
                {
                  title: "Officer Routing",
                  description: "Automatically route issues to the right department with AI-guided assignments.",
                  accent: "from-violet-500 to-fuchsia-500",
                },
                {
                  title: "Admin Insights",
                  description: "Monitor complaint volume, departmental load, and resolution status from one dashboard.",
                  accent: "from-emerald-500 to-lime-500",
                },
                {
                  title: "Secure Access",
                  description: "Role-based login protects citizens, officers, and admins with tailored access.",
                  accent: "from-indigo-500 to-sky-500",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/30 transition hover:-translate-y-1 hover:bg-slate-900/80">
                  <div className={`mb-3 inline-flex rounded-full bg-gradient-to-r ${item.accent} px-3 py-1 text-xs font-semibold text-transparent bg-clip-text`}>Feature</div>
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
