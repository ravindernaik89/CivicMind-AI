import Navbar from "../components/navbar";
import { useState, useEffect, useRef } from "react";
import API from "../services/api";

function Dashboard() {
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
      
      // Only append image if one is selected (making it optional)
      if (image) {
        formData.append("image", image);
      }

      const response = await API.post("/complaints/", formData);

      setSuccessMessage("Complaint submitted successfully! We'll analyze the issue and route it to the relevant department.");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh the complaints list
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

  return (
    <>
      <Navbar title="Citizen Dashboard" />

      <div className="p-10">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl max-w-2xl shadow-xl mb-10">
          <h2 className="text-2xl font-semibold mb-6">Submit Complaint</h2>

          {errorMessage && (
            <div className="bg-red-500/80 text-white p-4 rounded-xl mb-4">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/80 text-white p-4 rounded-xl mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Complaint Description
              </label>
              <textarea
                className="w-full p-4 rounded-xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-300"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
            </div>

            {/* Image Upload - Now Optional */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Issue Image (Optional - for AI detection)
              </label>
              <div className="border-2 border-dashed border-white/30 rounded-xl p-6 cursor-pointer hover:border-indigo-500 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <svg
                    className="w-12 h-12 text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-300">
                    {image ? image.name : "Click to upload or drag and drop"}
                  </p>
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 rounded-xl border border-white/30"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-gray-600 transition font-semibold"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>

        {/* My Complaints Section */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl max-w-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">My Complaints</h2>

          {complaintsLoading ? (
            <p className="text-center">Loading your complaints...</p>
          ) : myComplaints.length === 0 ? (
            <p className="text-center text-gray-400">You haven't submitted any complaints yet.</p>
          ) : (
            <div className="space-y-4">
              {myComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{complaint.description}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${complaint.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 
                        complaint.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 
                        complaint.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 
                        'bg-gray-500/20 text-gray-400'}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Type: {complaint.issue_type || 'Unknown'}</span>
                    <span>Severity: {complaint.severity || 'Unknown'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
