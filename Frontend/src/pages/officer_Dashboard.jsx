import Navbar from "../components/navbar";
import ComplaintCard from "../components/ComplaintCard";
import { useState, useEffect } from "react";
import API from "../services/api";

function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchComplaints();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await API.get("/officer/profile");
      setProfile(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await API.get("/officer/complaints");
      setComplaints(response.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await API.put(`/officer/complaints/${complaintId}/status?new_status=${newStatus}`);
      fetchComplaints();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <>
      <Navbar title="Officer Dashboard" />

      <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-6">
        <div className="pointer-events-none absolute right-8 top-12 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-4 bottom-10 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />

        {profile && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">Welcome back, {profile.name}</h2>
                <p className="mt-2 text-sm text-slate-400">Stay on top of your assigned issues.</p>
              </div>
              <div className="rounded-3xl bg-white/5 px-5 py-3 text-sm text-slate-200 ring-1 ring-white/10">
                Officer ID #{profile.id}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Email", value: profile.email },
                { label: "Role", value: profile.role },
                { label: "Department", value: profile.department_id || "Not Assigned" },
                { label: "Assigned", value: complaints.length },
              ].map((card) => (
                <div key={card.label} className="rounded-3xl bg-white/5 p-5 text-slate-200 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/10">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                  <p className="mt-3 text-xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white mb-4">Assigned Complaints</h3>
            <p className="text-sm text-slate-400 mb-6">Resolve complaints with a single status update.</p>

            {loading ? (
              <p className="text-center text-slate-400">Loading complaints...</p>
            ) : error ? (
              <p className="text-center text-red-400">{error}</p>
            ) : complaints.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-8 text-center text-slate-400">
                <p>No complaints assigned to you yet.</p>
                <p className="mt-2 text-sm text-slate-500">Ask admin to assign new tasks.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onUpdate={(id, status) => handleStatusUpdate(id, status)}
                    isOfficer={true}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <h4 className="text-xl font-semibold text-white mb-4">Quick Actions</h4>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white/5 p-4 text-slate-300">
                <p className="text-sm text-slate-400">Tip</p>
                <p className="mt-2 text-sm">Update complaint statuses as soon as progress changes to keep citizens informed.</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4 text-slate-300">
                <p className="text-sm text-slate-400">Status Flow</p>
                <p className="mt-2 text-sm">Assigned → In Progress → Resolved</p>
              </div>
              <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-cyan-200">
                <p className="text-sm font-semibold">Need help?</p>
                <p className="mt-2 text-sm">Contact an administrator if you need more assignments.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export default OfficerDashboard;
