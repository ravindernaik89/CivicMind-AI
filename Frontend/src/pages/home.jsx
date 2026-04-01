import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <nav className="flex justify-between items-center p-6 bg-black bg-opacity-30">
        <h1 className="text-3xl font-bold">CivicMind AI</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
          >
            Register
          </button>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">Welcome to CivicMind AI</h2>
          <p className="text-xl text-gray-300 mb-8">
            A platform to report and manage civic issues in your community with AI-powered insights
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="bg-blue-500 bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">🏛️ For Citizens</h3>
                <p>Report issues and track their resolution</p>
              </div>
              <div className="bg-purple-500 bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">👮 For Officers</h3>
                <p>Manage and respond to complaints</p>
              </div>
              <div className="bg-pink-500 bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-2">⚙️ For Admins</h3>
                <p>Oversee all civic issues and analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
