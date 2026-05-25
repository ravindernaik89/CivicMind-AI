import { useState, useEffect } from "react";

function ComplaintCard({ complaint, onUpdate, isOfficer = false }) {
  const [selectedStatus, setSelectedStatus] = useState(complaint.status);

  useEffect(() => {
    setSelectedStatus(complaint.status);
  }, [complaint.status]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    if (onUpdate) {
      onUpdate(complaint.id, newStatus);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400';
      case 'ASSIGNED': return 'text-orange-400';
      case 'IN_PROGRESS': return 'text-blue-400';
      case 'RESOLVED': return 'text-green-400';
      case 'REJECTED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getOfficerStatusOptions = () => {
    const currentStatus = complaint.status;
    const options = [];

    if (currentStatus === 'PENDING' || currentStatus === 'ASSIGNED') {
      options.push({ value: 'ASSIGNED', label: 'ASSIGNED' });
    }
    if (currentStatus === 'ASSIGNED' || currentStatus === 'IN_PROGRESS') {
      options.push({ value: 'IN_PROGRESS', label: 'IN_PROGRESS' });
    }
    if (currentStatus === 'IN_PROGRESS' || currentStatus === 'RESOLVED') {
      options.push({ value: 'RESOLVED', label: 'RESOLVED' });
    }

    return options;
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:bg-slate-900/80">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 opacity-70 transition duration-300 group-hover:opacity-100" />
      <div className="relative flex justify-between items-start gap-6 mb-4">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold text-white">{complaint.description}</h3>
          <p className="mt-2 text-sm text-slate-400">
            Reported on {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : "-"}
          </p>
        </div>
        <span className="text-sm text-slate-400">#{complaint.id}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-300 mb-5">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Severity</p>
          <p className="mt-2 font-semibold text-red-300">{complaint.severity || "N/A"}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Type</p>
          <p className="mt-2 font-semibold text-purple-300">{complaint.issue_type || "N/A"}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 col-span-full sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current Status</p>
          <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(complaint.status)}`}>{complaint.status}</p>
        </div>
      </div>

      {onUpdate && (
        <div className="mt-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">Update Status</label>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/20"
          >
            {isOfficer
              ? getOfficerStatusOptions().map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))
              : [
                  { value: 'PENDING', label: 'PENDING' },
                  { value: 'ASSIGNED', label: 'ASSIGNED' },
                  { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
                  { value: 'RESOLVED', label: 'RESOLVED' },
                  { value: 'REJECTED', label: 'REJECTED' },
                ].map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default ComplaintCard;
