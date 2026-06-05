import Navbar from "../components/navbar";
import { useState, useEffect } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_complaints: 0,
    pending_complaints: 0,
    resolved_complaints: 0,
    in_progress_complaints: 0,
    total_citizens: 0,
    total_officers: 0,
    total_departments: 0,
  });
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Modal and filter states
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [searchOfficer, setSearchOfficer] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [filterUserRole, setFilterUserRole] = useState("ALL");
  
  // Form states
  const [newDepartment, setNewDepartment] = useState("");
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // stats and complaints are used on dashboard tab
      const statsRes = await API.get("/admin/statistics").catch((e) => {
        console.warn("Failed to load stats", e);
        return null;
      });
      const complaintsRes = await API.get("/admin/complaints").catch((e) => {
        console.warn("Failed to load complaints", e);
        return null;
      });
      const departmentsRes = await API.get("/admin/departments").catch((e) => {
        console.warn("Failed to load departments", e);
        return null;
      });
      const officersRes = await API.get("/admin/officers").catch((e) => {
        console.warn("Failed to load officers", e);
        return null;
      });
      const usersRes = await API.get("/admin/users").catch((e) => {
        console.warn("Failed to load users", e);
        return null;
      });

      if (statsRes) setStats(statsRes.data);
      if (complaintsRes) setComplaints(complaintsRes.data);
      if (departmentsRes) setDepartments(departmentsRes.data);
      if (officersRes) setOfficers(officersRes.data);
      if (usersRes) setUsers(usersRes.data);
    } catch (err) {
      // unexpected errors
      console.error("Unexpected error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const filteredOfficers = officers.filter((officer) =>
    officer.name.toLowerCase().includes(searchOfficer.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchOfficer.toLowerCase())
  );

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchDepartment.toLowerCase())
  );

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = filterUserRole === "ALL" || user.role === filterUserRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/admin/departments", { name: newDepartment });
      const created = res.data;
      setNewDepartment("");
      // add new department locally so dropdown/grid update immediately
      setDepartments((prev) => [...prev, created]);
      // optionally refresh other data if needed
      fetchData().catch(() => {});
      alert("Department created successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create department");
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await API.delete(`/admin/departments/${id}`);
      fetchData();
      alert("Department deleted successfully!");
    } catch (err) {
      alert("Failed to delete department");
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    if (!newOfficer.department_id) {
      alert("Please select a department");
      return;
    }
    try {
      await API.post("/admin/officers", {
        name: newOfficer.name,
        email: newOfficer.email,
        password: newOfficer.password,
        department_id: parseInt(newOfficer.department_id),
      });
      setNewOfficer({ name: "", email: "", password: "", department_id: "" });
      fetchData();
      alert("Officer created successfully!");
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail;
      alert(msg || "Failed to create officer");
    }
  };

  const handleDeleteOfficer = async (id) => {
    if (!confirm("Are you sure you want to delete this officer?")) return;
    try {
      await API.delete(`/admin/officers/${id}`);
      fetchData();
      alert("Officer deleted successfully!");
    } catch (err) {
      alert("Failed to delete officer");
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await API.put(`/admin/complaints/${complaintId}/status?new_status=${newStatus}`);
      await fetchData();
      alert("Status updated successfully!");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAssignDepartment = async (complaintId, departmentId) => {
    try {
      await API.put(`/admin/complaints/${complaintId}/assign?department_id=${departmentId}`);
      await fetchData();
      alert("Department assigned successfully!");
    } catch (err) {
      alert("Failed to assign department");
    }
  };

  const handleAssignOfficer = async (complaintId, officerId) => {
    if (!officerId) return;
    try {
      await API.put(`/admin/complaints/${complaintId}/assign_officer?officer_id=${officerId}`);
      await fetchData();
      alert("Officer assigned successfully!");
    } catch (err) {
      alert("Failed to assign officer");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500";
      case "IN_PROGRESS": return "bg-blue-500";
      case "RESOLVED": return "bg-green-500";
      case "REJECTED": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="Admin Dashboard" />
        <div className="p-10 text-center">
          <p className="text-white">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Admin Dashboard" />
      
      <div className="mx-auto max-w-7xl p-6 space-y-6 bg-slate-950 min-h-screen">
        {/* Officer Profile Modal */}
        {selectedOfficer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Officer Profile</h2>
                <button
                  onClick={() => setSelectedOfficer(null)}
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Officer ID</p>
                    <p className="text-white font-semibold">#{selectedOfficer.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-semibold">{selectedOfficer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-semibold break-all">{selectedOfficer.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Role</p>
                    <p className="text-white font-semibold">{selectedOfficer.role}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Department</p>
                    <p className="text-white font-semibold">{selectedOfficer.department_name || "Not Assigned"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Department ID</p>
                    <p className="text-white font-semibold">{selectedOfficer.department_id || "-"}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setSelectedOfficer(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2 rounded-2xl font-semibold whitespace-nowrap transition ${
              activeTab === "dashboard" 
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`px-5 py-2 rounded-2xl font-semibold whitespace-nowrap transition ${
              activeTab === "complaints" 
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📝 Complaints
          </button>
          <button
            onClick={() => setActiveTab("officers")}
            className={`px-5 py-2 rounded-2xl font-semibold whitespace-nowrap transition ${
              activeTab === "officers" 
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            👮 Officers
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-5 py-2 rounded-2xl font-semibold whitespace-nowrap transition ${
              activeTab === "departments" 
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            🏢 Departments
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2 rounded-2xl font-semibold whitespace-nowrap transition ${
              activeTab === "users" 
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            👥 All Users
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <div className="mb-8 rounded-[32px] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm uppercase tracking-[0.28em] text-violet-300/70">Admin overview</p>
                  <h2 className="mt-3 text-3xl lg:text-4xl font-semibold text-white">Welcome back, Admin.</h2>
                  <p className="mt-4 max-w-2xl text-slate-300 leading-relaxed">
                    Monitor complaints, assignments, and department activity at a glance. Use the cards below to see what needs attention first.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active tickets</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{stats.pending_complaints + stats.in_progress_complaints}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Departments</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{stats.total_departments}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Assigned officers</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{stats.total_officers}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-[28px] shadow-2xl shadow-purple-900/30 border border-white/10">
                <p className="text-purple-200 text-sm uppercase tracking-[0.24em]">Total Complaints</p>
                <p className="mt-4 text-5xl font-bold text-white">{stats.total_complaints}</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-6 rounded-[28px] shadow-2xl shadow-amber-900/30 border border-white/10">
                <p className="text-yellow-100 text-sm uppercase tracking-[0.24em]">Pending Complaints</p>
                <p className="mt-4 text-5xl font-bold text-white">{stats.pending_complaints}</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-[28px] shadow-2xl shadow-emerald-900/30 border border-white/10">
                <p className="text-emerald-100 text-sm uppercase tracking-[0.24em]">Resolved Complaints</p>
                <p className="mt-4 text-5xl font-bold text-white">{stats.resolved_complaints}</p>
              </div>
              
              <div className="bg-gradient-to-br from-sky-500 to-blue-700 p-6 rounded-[28px] shadow-2xl shadow-sky-900/30 border border-white/10">
                <p className="text-sky-100 text-sm uppercase tracking-[0.24em]">In Progress</p>
                <p className="mt-4 text-5xl font-bold text-white">{stats.in_progress_complaints}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-[28px] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/30">
                <p className="text-sm text-slate-400">Total Citizens</p>
                <p className="mt-3 text-4xl font-semibold text-white">{stats.total_citizens}</p>
              </div>
              
              <div className="rounded-[28px] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/30">
                <p className="text-sm text-slate-400">Total Officers</p>
                <p className="mt-3 text-4xl font-semibold text-white">{stats.total_officers}</p>
              </div>
              
              <div className="rounded-[28px] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/30">
                <p className="text-sm text-slate-400">Total Departments</p>
                <p className="mt-3 text-4xl font-semibold text-white">{stats.total_departments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Complaint Management</h2>
            
            <div className="rounded-[32px] border border-white/10 bg-slate-900/90 shadow-2xl shadow-slate-950/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left">
                  <thead className="bg-slate-800 text-gray-300">
                    <tr className="rounded-t-[32px]">
                      <th className="p-4">ID</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Officer</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {complaints.map((complaint) => (
                      <tr key={complaint.id} className="border-b border-slate-700 transition hover:bg-slate-900">
                        <td className="p-4">#{complaint.id}</td>
                        <td className="p-4 max-w-xs truncate">{complaint.description}</td>
                        <td className="p-4">
                          {complaint.location_lat != null && complaint.location_lng != null ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${complaint.location_lat},${complaint.location_lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-300 hover:text-cyan-200"
                            >
                              View map
                            </a>
                          ) : (
                            <span className="text-slate-500">No location</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={complaint.department_id || ""}
                            onChange={(e) => handleAssignDepartment(complaint.id, e.target.value)}
                            className="bg-slate-800 text-white px-3 py-1 rounded text-sm"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={complaint.assigned_officer_id || ""}
                            onChange={(e) => handleAssignOfficer(complaint.id, e.target.value)}
                            className="bg-slate-800 text-white px-3 py-1 rounded text-sm"
                          >
                            <option value="">Unassigned</option>
                            {officers.map((officer) => (
                              <option key={officer.id} value={officer.id}>
                                {officer.name} {officer.department_name ? `(${officer.department_name})` : ""}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={complaint.status}
                            onChange={(e) => handleUpdateStatus(complaint.id, e.target.value)}
                            className="bg-slate-800 text-white px-3 py-1 rounded text-sm"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Officers Tab */}
        {activeTab === "officers" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Officer Management</h2>
            
            {/* Create Officer Form */}
            <div className="bg-slate-900 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Add New Officer (One per Department)</h3>
              <form onSubmit={handleCreateOfficer} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Officer Name"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder="Officer Email"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({...newOfficer, email: e.target.value})}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newOfficer.password}
                  onChange={(e) => setNewOfficer({...newOfficer, password: e.target.value})}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg"
                  required
                />
                <select
                  value={newOfficer.department_id}
                  onChange={(e) => setNewOfficer({...newOfficer, department_id: e.target.value})}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Add Officer
                </button>
              </form>
            </div>

            {/* Officers List */}
            <div className="bg-slate-900 rounded-xl overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-700 bg-slate-800">
                <input
                  type="text"
                  placeholder="Search officers by name or email..."
                  value={searchOfficer}
                  onChange={(e) => setSearchOfficer(e.target.value)}
                  className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg"
                />
              </div>
              
              <table className="w-full text-left">
                <thead className="bg-slate-800 text-gray-300">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {filteredOfficers.map((officer) => (
                    <tr 
                      key={officer.id} 
                      className="border-b border-slate-700 hover:bg-slate-800 cursor-pointer transition"
                      onClick={() => setSelectedOfficer(officer)}
                    >
                      <td className="p-4">#{officer.id}</td>
                      <td className="p-4">{officer.name}</td>
                      <td className="p-4">{officer.email}</td>
                      <td className="p-4">
                        <span className="bg-green-600 px-3 py-1 rounded-full text-xs text-white">
                          {officer.department_name || "Not Assigned"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOfficer(officer.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {officers.length === 0 && (
                <p className="p-6 text-center text-gray-400">No officers found</p>
              )}
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === "departments" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Department Management</h2>
            
            {/* Create Department Form */}
            <div className="bg-slate-900 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Add New Department</h3>
              <form onSubmit={handleCreateDepartment} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Department Name"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg flex-1"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Add Department
                </button>
              </form>
            </div>

            {/* Departments Grid */}
            <div>
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search departments by name..."
                  value={searchDepartment}
                  onChange={(e) => setSearchDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-2 rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDepartments.map((dept) => (
                  <div key={dept.id} className="bg-slate-900 p-6 rounded-xl flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{dept.name}</h3>
                      <p className="text-gray-400 text-sm">ID: {dept.id}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              {filteredDepartments.length === 0 && (
                <p className="text-center text-gray-400 p-6">No departments found</p>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">User Accounts</h2>
            
            {/* Search and Filter */}
            <div className="bg-slate-900 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg"
              />
              <select
                value={filterUserRole}
                onChange={(e) => setFilterUserRole(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="OFFICER">Officer</option>
                <option value="CITIZEN">Citizen</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-gray-300">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-800">
                      <td className="p-4">#{user.id}</td>
                      <td className="p-4 font-semibold">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs text-white font-semibold ${
                          user.role === "ADMIN" ? "bg-red-600" :
                          user.role === "OFFICER" ? "bg-blue-600" :
                          "bg-green-600"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">{user.department_name || "-"}</td>
                      <td className="p-4 text-xs text-gray-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <p className="p-6 text-center text-gray-400">No users found</p>
              )}
              
              <div className="bg-slate-800 p-4 text-gray-400 text-sm">
                Total: {filteredUsers.length} user(s) 
                {filterUserRole !== "ALL" && ` (${filterUserRole})`}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;

