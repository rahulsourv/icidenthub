import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">

      {/* LEFT */}
      <h1 className="text-xl font-bold text-blue-600">
        IncidentHub
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-6">

        <div className="relative cursor-pointer">
          <span className="text-2xl">🔔</span>
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            0
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Account
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow-md w-40">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Navbar;