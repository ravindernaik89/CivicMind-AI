import Navbar from "../components/navbar";
import { useState, useEffect, useRef } from "react";
import API from "../services/api";

function Dashboard() {
  const userName = localStorage.getItem("name") || "Citizen";
  const fileInputRef = useRef(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [myComplaints, setMyComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const fetchMyComplaints = async () => {
    try {
      const response = await API.get("/complaints/my");
      setMyComplaints(response.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!description.trim()) {
      setErrorMessage("Please enter a description");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("description", description);
      if (image) {
        formData.append("image", image);
      }
      await API.post("/complaints/", formData);
      setSuccessMessage("Complaint submitted successfully! We'll analyze the issue and route it to the relevant department.");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchMyComplaints();
    } catch (error) {
      console.error("Complaint error:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.detail || 
        error.response?.data?.message ||
        "Failed to submit complaint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const complaintStatusCounts = myComplaints.reduce(
    (acc, complaint) => {
      const status = complaint.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <>
      <Navbar title="Citizen Dashboard" />

      <div className="relative overflow-hidden p-10">
        <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-6 top-80 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="mb-6">
              <h1 className="text-4xl font-semibold text-white">Welcome, {userName}</h1>
              <p className="mt-2 text-sm text-slate-400">Submit a complaint and track issue progress from your dashboard.</p>
            </div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-white">Submit a Complaint</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Share details and upload an image to improve AI-assisted routing.
                </p>
              </div>
              <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/10">
                {myComplaints.length} total complaints
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100 mb-5">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-100 mb-5">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Complaint Description</label>
                <textarea
                  className="w-full rounded-3xl border border-white/10 bg-white/10 p-4 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/20"
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload Issue Image (Optional)</label>
                <div className="rounded-3xl border-2 border-dashed border-white/15 bg-white/5 p-6 transition hover:border-cyan-400 hover:bg-white/10">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center text-slate-300">
                    <svg className="h-12 w-12 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-white">Click to upload</p>
                      <p className="text-sm text-slate-500">Supports JPG, PNG, or WEBP</p>
                    </div>
                    <p className="text-sm text-slate-400">{image ? image.name : "No file selected"}</p>
                  </label>
                </div>
              </div>

              {imagePreview && (
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-300">Preview</p>
                  <img src={imagePreview} alt="Preview" className="h-64 w-full rounded-3xl object-cover" />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>

          <aside className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/75 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="rounded-3xl bg-white/5 p-5">
              <h3 className="text-xl font-semibold text-white">Complaint Highlights</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Pending", value: complaintStatusCounts.PENDING || 0, color: "bg-yellow-500/20 text-yellow-300" },
                  { label: "In Progress", value: complaintStatusCounts.IN_PROGRESS || 0, color: "bg-blue-500/20 text-blue-300" },
                  { label: "Resolved", value: complaintStatusCounts.RESOLVED || 0, color: "bg-green-500/20 text-green-300" },
                  { label: "Other", value: complaintStatusCounts.UNKNOWN || 0, color: "bg-slate-500/20 text-slate-300" },
                ].map((item) => (
                  <div key={item.label} className={`rounded-3xl p-4 ${item.color}`}>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-300">{item.label}</p>
                    <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 p-5">
              <h3 className="text-xl font-semibold text-white">Your Recent Complaints</h3>
              <p className="mt-2 text-sm text-slate-400">Review the latest updates at a glance.</p>
              <div className="mt-4 space-y-4">
                {complaintsLoading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : myComplaints.length === 0 ? (
                  <p className="text-sm text-slate-400">No complaints submitted yet.</p>
                ) : (
                  myComplaints.slice(0, 3).map((complaint) => (
                    <div key={complaint.id} className="rounded-3xl bg-slate-900/80 p-3 text-sm text-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">#{complaint.id}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-slate-300">
                          {complaint.status}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-slate-300">{complaint.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-slate-950/75 p-8 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white mb-6">My Complaints</h2>
          {complaintsLoading ? (
            <p className="text-center text-slate-400">Loading your complaints...</p>
          ) : myComplaints.length === 0 ? (
            <p className="text-center text-slate-400">You haven't submitted any complaints yet.</p>
          ) : (
            <div className="grid gap-4">
              {myComplaints.map((complaint) => (
                <div key={complaint.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{complaint.description}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
                        <span>Type: {complaint.issue_type || 'Unknown'}</span>
                        <span>Severity: {complaint.severity || 'Unknown'}</span>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      complaint.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                      complaint.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                      complaint.status === 'RESOLVED' ? 'bg-green-500/20 text-green-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default Dashboard;
