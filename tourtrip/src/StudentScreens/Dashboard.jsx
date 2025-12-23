import { useState, useEffect } from "react";
import { logoutUser, getCurrentUser, getUserData } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import ToursList from "./ToursList";
import VotingPlace from "./VotingPlace";
import SeatingPlan from "./SeatingPlan";
import Grouping from "./Grouping";
import "../styles/Dashboard.css";

const StudentDashboard = () => {
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
    { id: "tours", label: "Tours" },
    { id: "voting", label: "Vote Places" },
    { id: "seating", label: "Seating" },
    { id: "groups", label: "Groups" },
  ];

  return (
    <div className="dashboard">
      <nav className="dashboard-header">
        <div className="header-content">
          <div className="nav-brand">
            <h2>Tour Trip Management</h2>
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
            <span className="user-name">{userData?.fullName || "Student"}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="tab-content">
        {activeTab === "tours" && <ToursList userId={currentUser?.uid} />}
        {activeTab === "voting" && <VotingPlace userId={currentUser?.uid} />}
        {activeTab === "seating" && (
          <SeatingPlan 
            userId={currentUser?.uid}
            userRole={userData?.role || "student"}
            userName={userData?.fullName || userData?.name || ""}
            userRollNumber={userData?.rollNumber || userData?.rollNo || ""}
          />
        )}
        {activeTab === "groups" && (
          <Grouping 
            userId={currentUser?.uid}
            userName={userData?.fullName || userData?.name || ""}
            userRollNumber={userData?.rollNumber || userData?.rollNo || ""}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;


//main

// import { useState, useEffect } from "react";
// import { logoutUser, getCurrentUser, getUserData } from "../firebase/auth";
// import { useNavigate } from "react-router-dom";
// import ToursList from "./ToursList";
// import VotingPlace from "./VotingPlace";
// import SeatingPlan from "./SeatingPlan";
// import Grouping from "./Grouping";
// import TourDates from "./TourDates";
// import "../styles/Dashboard.css";

// const StudentDashboard = () => {
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("tours");
//   const navigate = useNavigate();
//   const currentUser = getCurrentUser();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       if (currentUser) {
//         const data = await getUserData(currentUser.uid);
//         setUserData(data);
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [currentUser]);

//   const handleLogout = async () => {
//     try {
//       await logoutUser();
//       navigate("/");
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   if (loading) {
//     return <div className="dashboard-loading">Loading...</div>;
//   }

//   const tabs = [
//     { id: "tours", label: "Tours" },
//     { id: "dates", label: "Dates & Register" },
//     { id: "voting", label: "Vote Places" },
//     { id: "seating", label: "Seating" },
//     { id: "groups", label: "Groups" },
//   ];

//   return (
//     <div className="dashboard">
//       <nav className="dashboard-header">
//         <div className="header-content">
//           <div className="nav-brand">
//             <h2>Tour Trip Management</h2>
//           </div>

//           <div className="tabs-nav">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
//                 onClick={() => setActiveTab(tab.id)}
//                 title={tab.label}
//               >
//                 <span className="tab-label">{tab.label}</span>
//               </button>
//             ))}
//           </div>

//           <div className="nav-user">
//             <span className="user-name">{userData?.fullName || "Student"}</span>
//             <button className="logout-btn" onClick={handleLogout}>
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="tab-content">
//         {activeTab === "tours" && <ToursList userId={currentUser?.uid} />}
//         {activeTab === "dates" && <TourDates userId={currentUser?.uid} />}
//         {activeTab === "voting" && <VotingPlace userId={currentUser?.uid} />}
//         {activeTab === "seating" && (
//           <SeatingPlan 
//             userId={currentUser?.uid}
//             userRole={userData?.role || "student"}
//             userName={userData?.fullName || userData?.name || ""}
//             userRollNumber={userData?.rollNumber || userData?.rollNo || ""}
//           />
//         )}
//     {activeTab === "groups" && (
//   <Grouping 
//     userId={currentUser?.uid}
//     userName={userData?.fullName || userData?.name || ""}
//     userRollNumber={userData?.rollNumber || userData?.rollNo || ""}
//   />
// )
//     /* {activeTab === "groups" && <Grouping userId={currentUser?.uid} />} */
//     }
//       </div>
//     </div>
//   );
// };

// export default StudentDashboard;

