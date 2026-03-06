import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/navbar";
import ChatBox from "../components/ChatBox";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgName, setOrgName] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await api.get("/org/my-orgs");
      setOrgs(res.data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

const handleCreateOrg = async () => {
  if (!orgName) return;

  try {
    // 1️⃣ Create org
    const res = await api.post("/org", { name: orgName });
    const orgId = res.data._id;

    // 2️⃣ Refresh org list immediately
    await fetchOrgs();

    // 3️⃣ Generate invite (separate try)
    try {
      const inviteRes = await api.post(`/org/${orgId}/generate-invite`);

      setInviteLink(inviteRes.data.inviteLink);
      setGeneratedCode(inviteRes.data.inviteCode);
      setShowModal(true);
    } catch (inviteError) {
      console.error("Invite error:", inviteError);
      alert("Organization created but invite could not be generated.");
    }

    setOrgName("");

  } catch (err) {
    console.error("Create org error:", err);
    alert("Error creating organization");
  }
};

  const handleJoinOrg = async () => {
    if (!inviteCode) return;

    try {
      await api.post("/invitations/join", {
        inviteCode,
      });

      alert("Joined successfully!");
      setInviteCode("");
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || "Error joining org");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied!");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <AnimatePresence mode="wait">
        {!selectedOrg ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {/* CREATE ORG */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h2 className="text-xl font-bold mb-4">
                Create Organization
              </h2>

              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Organization Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="flex-1 p-3 border rounded-lg"
                />

                <button
                  onClick={handleCreateOrg}
                  className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </div>

            {/* JOIN ORG */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h2 className="text-xl font-bold mb-4">
                Join Organization
              </h2>

              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Invite Code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="flex-1 p-3 border rounded-lg"
                />

                <button
                  onClick={handleJoinOrg}
                  className="bg-green-600 text-white px-6 rounded-lg hover:bg-green-700"
                >
                  Join
                </button>
              </div>
            </div>

            {/* ORG GRID */}
            <div className="grid grid-cols-3 gap-6">
              {orgs.map((org) => (
                <motion.div
                  key={org.orgId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedOrg(org)}
                  className="bg-white p-6 rounded-xl shadow cursor-pointer"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {org.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Role: {org.role}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex h-[calc(100vh-64px)]"
          >
            {/* LEFT SIDEBAR */}
            <div className="w-1/4 bg-white border-r overflow-y-auto">
              <div className="p-4 font-bold text-lg border-b">
                Organizations
              </div>

              {orgs.map((org) => (
                <motion.div
                  key={org.orgId}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={() => setSelectedOrg(org)}
                  className={`p-4 cursor-pointer border-b ${
                    selectedOrg?.orgId === org.orgId
                      ? "bg-gray-200"
                      : ""
                  }`}
                >
                  {org.name}
                </motion.div>
              ))}
            </div>

            {/* CHAT PANEL */}
            <div className="flex-1 bg-gray-50 flex flex-col">
              <div className="p-4 bg-white border-b flex justify-between items-center">
                <h2 className="font-semibold text-lg">
                  {selectedOrg.name}
                </h2>

                <button
                  onClick={() => setSelectedOrg(null)}
                  className="text-sm text-red-500"
                >
                  Back
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <ChatBox orgId={selectedOrg.orgId} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INVITE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              Organization Created 🎉
            </h2>

            <p className="text-sm text-gray-600 mb-1">
              Invite Link:
            </p>
            <div className="bg-gray-100 p-3 rounded mb-4 break-all text-sm">
              {inviteLink}
            </div>

            <p className="text-sm text-gray-600 mb-1">
              Invite Code:
            </p>
            <div className="bg-gray-100 p-3 rounded mb-4 font-mono text-sm">
              {generatedCode}
            </div>

            <div className="flex justify-between">
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Copy Link
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;