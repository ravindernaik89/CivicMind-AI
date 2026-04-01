import Navbar from "../components/navbar";
import ComplaintCard from "../components/ComplaintCard";
import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/authContext";

function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const { token } = useContext(AuthContext);

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
      // Fetch complaints assigned to this officer
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
      // Refresh the list after update
      fetchComplaints();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  return (
    <>
      <Navbar title="Officer Dashboard" />

      <div className="p-10">
        {/* Officer Profile Card */}
        {profile && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Welcome, {profile.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-semibold">{profile.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <p className="font-semibold">{profile.role}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Department ID</p>
                <p className="font-semibold">{profile.department_id || "Not Assigned"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Officer ID</p>
                <p className="font-semibold">#{profile.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
            <p className="text-yellow-400 text-sm">Assigned</p>
            <p className="text-2xl font-bold">
              {complaints.filter(c => c.status === "ASSIGNED").length}
            </p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
            <p className="text-blue-400 text-sm">In Progress</p>
            <p className="text-2xl font-bold">
              {complaints.filter(c => c.status === "IN_PROGRESS").length}
            </p>
          </div>
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
            <p className="text-green-400 text-sm">Resolved</p>
            <p className="text-2xl font-bold">
              {complaints.filter(c => c.status === "RESOLVED").length}
            </p>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
            <p className="text-purple-400 text-sm">Total</p>
            <p className="text-2xl font-bold">{complaints.length}</p>
          </div>
        </div>

        {/* Complaints List */}
        <h3 className="text-xl font-bold mb-4">My Assigned Complaints</h3>
        
        {loading ? (
          <p className="text-center">Loading complaints...</p>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl">
            <p className="text-gray-400">No complaints assigned to you yet.</p>
            <p className="text-sm text-gray-500 mt-2">Contact admin to assign complaints.</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <ComplaintCard 
              key={complaint.id} 
              complaint={complaint} 
              onUpdate={(id, status) => handleStatusUpdate(id, status)}
              isOfficer={true}
            />
          ))
        )}
      </div>
    </>
  );
}

export default OfficerDashboard;
