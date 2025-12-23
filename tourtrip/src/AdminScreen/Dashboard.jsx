import { useState, useEffect } from "react";
import { logoutUser, getCurrentUser, getUserData } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import ManageTours from "./ManageTours";
import VotingManager from "./VotingManager";
import SeatingAssignment from "./SeatingAssignment";
import SeatingViewer from "./SeatingViewer";
 
 
import "../styles/Dashboard.css";

const AdminDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tours");
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const data = await getUserData(currentUser.uid);
        setUserData(data);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  const tabs = [
    { id: "tours", label: "Tours Management" },
    { id: "voting", label: "Voting Manager" },
    { id: "seating", label: "View Seating" },
     
  ];

  return (
    <div className="dashboard admin-dashboard">
      <nav className="dashboard-header admin-header">
        <div className="header-content">
          <div className="nav-brand">
            <h2>Admin Panel - Tour Trip Management</h2>
          </div>

          <div className="tabs-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="nav-user">
            <span className="user-name">{userData?.fullName || "Admin"}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="tab-content">
        {activeTab === "tours" && <ManageTours />}
        {activeTab === "voting" && <VotingManager />}
        
        {activeTab === "seating" && <SeatingViewer />}
        
       
      </div>
    </div>
  );
};

export default AdminDashboard;
