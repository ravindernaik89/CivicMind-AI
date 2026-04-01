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

  // For officers: show status flow ASSIGNED → IN_PROGRESS → RESOLVED
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
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-xl hover:scale-105 transition duration-300 mb-6">

      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold flex-1">
          {complaint.description}
        </h3>
        <span className="text-sm text-gray-400">#{complaint.id}</span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
        <span>Severity: 
          <span className="ml-2 text-red-400 font-semibold">
            {complaint.severity || "N/A"}
          </span>
        </span>
        
        <span>Type: 
          <span className="ml-2 text-purple-400 font-semibold">
            {complaint.issue_type || "N/A"}
          </span>
        </span>

        <span>Status: 
          <span className={`ml-2 font-semibold ${getStatusColor(complaint.status)}`}>
            {complaint.status}
          </span>
        </span>

        {complaint.created_at && (
          <span>Created: 
            <span className="ml-2 text-gray-400">
              {new Date(complaint.created_at).toLocaleDateString()}
            </span>
          </span>
        )}
      </div>

      {onUpdate && (
        <div className="mt-3">
          <label className="text-sm text-gray-300 mr-2">
            {isOfficer ? "Update Status:" : "Update Status:"}
          </label>
          {isOfficer ? (
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="px-3 py-2 bg-white/20 rounded-lg text-white"
            >
              {getOfficerStatusOptions().map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-900">
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="px-3 py-2 bg-white/20 rounded-lg text-white"
            >
              <option value="PENDING" className="bg-gray-900">PENDING</option>
              <option value="ASSIGNED" className="bg-gray-900">ASSIGNED</option>
              <option value="IN_PROGRESS" className="bg-gray-900">IN_PROGRESS</option>
              <option value="RESOLVED" className="bg-gray-900">RESOLVED</option>
              <option value="REJECTED" className="bg-gray-900">REJECTED</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
}

export default ComplaintCard;
