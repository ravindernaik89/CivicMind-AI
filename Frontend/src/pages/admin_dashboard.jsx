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
      fetchData();
      alert("Status updated successfully!");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAssignDepartment = async (complaintId, departmentId) => {
    try {
      await API.put(`/admin/complaints/${complaintId}/assign?department_id=${departmentId}`);
      fetchData();
      alert("Department assigned successfully!");
    } catch (err) {
      alert("Failed to assign department");
    }
  };

  const handleAssignOfficer = async (complaintId, officerId) => {
    if (!officerId) return;
    try {
      await API.put(`/admin/complaints/${complaintId}/assign_officer?officer_id=${officerId}`);
      fetchData();
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
      default: return "bg-gray-500";
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
      
      <div className="p-6 bg-gray-900 min-h-screen">
        {/* Officer Profile Modal */}
        {selectedOfficer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
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
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === "dashboard" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === "complaints" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            📝 Complaints
          </button>
          <button
            onClick={() => setActiveTab("officers")}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === "officers" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            👮 Officers
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === "departments" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            🏢 Departments
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap ${
              activeTab === "users" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            👥 All Users
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl shadow-lg">
                <p className="text-purple-200 text-sm">Total Complaints</p>
                <p className="text-4xl font-bold text-white">{stats.total_complaints}</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-6 rounded-xl shadow-lg">
                <p className="text-yellow-200 text-sm">Pending Complaints</p>
                <p className="text-4xl font-bold text-white">{stats.pending_complaints}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-xl shadow-lg">
                <p className="text-green-200 text-sm">Resolved Complaints</p>
                <p className="text-4xl font-bold text-white">{stats.resolved_complaints}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-xl shadow-lg">
                <p className="text-blue-200 text-sm">In Progress</p>
                <p className="text-4xl font-bold text-white">{stats.in_progress_complaints}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-xl">
                <p className="text-gray-400 text-sm">Total Citizens</p>
                <p className="text-3xl font-bold text-white">{stats.total_citizens}</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-xl">
                <p className="text-gray-400 text-sm">Total Officers</p>
                <p className="text-3xl font-bold text-white">{stats.total_officers}</p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-xl">
                <p className="text-gray-400 text-sm">Total Departments</p>
                <p className="text-3xl font-bold text-white">{stats.total_departments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Complaint Management</h2>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700 text-gray-300">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Officer</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {complaints.map((complaint) => (
                      <tr key={complaint.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-4">#{complaint.id}</td>
                        <td className="p-4 max-w-xs truncate">{complaint.description}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={complaint.department_id || ""}
                            onChange={(e) => handleAssignDepartment(complaint.id, e.target.value)}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
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
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
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
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
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
            <div className="bg-gray-800 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Add New Officer (One per Department)</h3>
              <form onSubmit={handleCreateOfficer} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Officer Name"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder="Officer Email"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({...newOfficer, email: e.target.value})}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newOfficer.password}
                  onChange={(e) => setNewOfficer({...newOfficer, password: e.target.value})}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                  required
                />
                <select
                  value={newOfficer.department_id}
                  onChange={(e) => setNewOfficer({...newOfficer, department_id: e.target.value})}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg"
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
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-700 bg-gray-750">
                <input
                  type="text"
                  placeholder="Search officers by name or email..."
                  value={searchOfficer}
                  onChange={(e) => setSearchOfficer(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                />
              </div>
              
              <table className="w-full text-left">
                <thead className="bg-gray-700 text-gray-300">
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
                      className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition"
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
            <div className="bg-gray-800 p-6 rounded-xl mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Add New Department</h3>
              <form onSubmit={handleCreateDepartment} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Department Name"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg flex-1"
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
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDepartments.map((dept) => (
                  <div key={dept.id} className="bg-gray-800 p-6 rounded-xl flex justify-between items-center">
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
            <div className="bg-gray-800 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg"
              />
              <select
                value={filterUserRole}
                onChange={(e) => setFilterUserRole(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="OFFICER">Officer</option>
                <option value="CITIZEN">Citizen</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-700 text-gray-300">
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
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
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
              
              <div className="bg-gray-750 p-4 text-gray-400 text-sm">
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

