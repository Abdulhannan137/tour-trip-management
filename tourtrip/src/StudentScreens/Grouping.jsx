

// import { useState, useEffect } from "react";
// import { db } from "../firebase/firebaseConfig";
// import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where } from "firebase/firestore";
// import "../styles/Grouping.css";

// const Grouping = ({ userId, userName, userRollNumber }) => {
//   const [tours, setTours] = useState([]);
//   const [selectedTour, setSelectedTour] = useState(null);
//   const [groups, setGroups] = useState([]);
//   const [showAddGroup, setShowAddGroup] = useState(false);
//   const [groupName, setGroupName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [userGroup, setUserGroup] = useState(null); // Track which group user is in

//   useEffect(() => {
//     fetchToursAndGroups();
//   }, []);

//   const fetchToursAndGroups = async () => {
//     try {
//       const toursCollection = collection(db, "tours");
//       const toursSnapshot = await getDocs(toursCollection);
//       const toursData = toursSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setTours(toursData);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching tours:", error);
//       setLoading(false);
//     }
//   };

//   const handleTourSelect = async (tour) => {
//     setSelectedTour(tour);

//     try {
//       const groupsCollection = collection(db, `tours/${tour.id}/groups`);
//       const groupsSnapshot = await getDocs(groupsCollection);
//       const groupsData = await Promise.all(
//         groupsSnapshot.docs.map(async (doc) => {
//           const groupRef = doc.id;
//           const membersCollection = collection(db, `tours/${tour.id}/groups/${groupRef}/members`);
//           const membersSnapshot = await getDocs(membersCollection);
//           const members = membersSnapshot.docs.map((memberDoc) => ({
//             id: memberDoc.id,
//             ...memberDoc.data(),
//           }));
          
//           // Check if current user is in this group
//           const userInGroup = members.find(m => m.userId === userId);
//           if (userInGroup) {
//             setUserGroup({ groupId: doc.id, memberId: userInGroup.id });
//           }
          
//           return {
//             id: doc.id,
//             ...doc.data(),
//             members,
//           };
//         })
//       );
//       setGroups(groupsData);
//     } catch (error) {
//       console.error("Error fetching groups:", error);
//     }
//   };

//   const handleCreateGroup = async () => {
//     if (!groupName.trim() || !selectedTour) return;

//     try {
//       const groupsCollection = collection(db, `tours/${selectedTour.id}/groups`);
//       await addDoc(groupsCollection, {
//         name: groupName,
//         createdAt: new Date(),
//         createdBy: userId,
//         memberCount: 0,
//       });

//       setGroupName("");
//       setShowAddGroup(false);
//       handleTourSelect(selectedTour);
//     } catch (error) {
//       console.error("Error creating group:", error);
//     }
//   };

//   const handleJoinGroup = async (group) => {
//     // Check if user is already in a group
//     if (userGroup) {
//       alert("You are already in a group. Please leave your current group first.");
//       return;
//     }

//     try {
//       const membersCollection = collection(db, `tours/${selectedTour.id}/groups/${group.id}/members`);
//       await addDoc(membersCollection, {
//         name: userName,
//         userId: userId,
//         rollNumber: userRollNumber,
//         addedAt: new Date(),
//       });

//       handleTourSelect(selectedTour);
//     } catch (error) {
//       console.error("Error joining group:", error);
//     }
//   };

//   const handleRemoveMember = async (group, memberId, memberUserId) => {
//     if (!selectedTour) return;

//     // Check if user created the group OR is removing themselves
//     const isCreator = group.createdBy === userId;
//     const isRemovingSelf = memberUserId === userId;
    
//     if (!isCreator && !isRemovingSelf) {
//       alert("You can only remove yourself or members from groups you created.");
//       return;
//     }

//     if (!window.confirm(isRemovingSelf ? "Are you sure you want to leave this group?" : "Remove this member?")) {
//       return;
//     }

//     try {
//       const memberRef = doc(db, `tours/${selectedTour.id}/groups/${group.id}/members`, memberId);
//       await deleteDoc(memberRef);
      
//       // If user removed themselves, clear userGroup
//       if (isRemovingSelf) {
//         setUserGroup(null);
//       }
      
//       await handleTourSelect(selectedTour);
//     } catch (error) {
//       console.error("Error removing member:", error);
//       alert("Failed to remove member. Please try again.");
//     }
//   };

//   const handleDeleteGroup = async (groupId, createdBy) => {
//     if (!selectedTour) return;

//     // Only allow deletion if user created the group
//     if (createdBy !== userId) {
//       alert("You can only delete groups you created.");
//       return;
//     }

//     try {
//       const groupRef = doc(db, `tours/${selectedTour.id}/groups`, groupId);
//       await deleteDoc(groupRef);
      
//       // Clear userGroup if they were in this group
//       if (userGroup?.groupId === groupId) {
//         setUserGroup(null);
//       }
      
//       handleTourSelect(selectedTour);
//     } catch (error) {
//       console.error("Error deleting group:", error);
//     }
//   };

//   if (loading) return <div className="loading">Loading...</div>;

//   return (
//     <div className="grouping-container">
//       <h2>👥 Student Groups</h2>

//       {!selectedTour ? (
//         <div className="tour-selection">
//           <h3>Select a tour to manage groups:</h3>
//           <div className="tours-list">
//             {tours.map((tour) => (
//               <button
//                 key={tour.id}
//                 className="tour-btn"
//                 onClick={() => handleTourSelect(tour)}
//               >
//                 <div className="tour-name">{tour.name}</div>
//                 <div className="tour-destination">{tour.destination}</div>
//               </button>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <div className="grouping-section">
//           <div className="grouping-header">
//             <button className="back-btn" onClick={() => {
//               setSelectedTour(null);
//               setUserGroup(null);
//             }}>← Back</button>
//             <h3>{selectedTour.name} - Groups</h3>
//             <button className="add-btn" onClick={() => setShowAddGroup(!showAddGroup)}>
//               {showAddGroup ? "Cancel" : "+ Create Group"}
//             </button>
//           </div>

//           {showAddGroup && (
//             <div className="add-group-form">
//               <input
//                 type="text"
//                 placeholder="Group Name (e.g., Group A, Team 1)"
//                 value={groupName}
//                 onChange={(e) => setGroupName(e.target.value)}
//               />
//               <button onClick={handleCreateGroup} className="submit-btn">Create Group</button>
//             </div>
//           )}

//           {userGroup && (
//             <div className="user-group-info">
//               ℹ️ You are currently in a group. You can only be in one group at a time.
//             </div>
//           )}

//           <div className="groups-grid">
//             {groups.length === 0 ? (
//               <p className="no-groups">No groups created yet</p>
//             ) : (
//               groups.map((group) => (
//                 <div key={group.id} className="group-card">
//                   <div className="group-header-card">
//                     <h4>{group.name}</h4>
//                     {group.createdBy === userId && (
//                       <button
//                         className="delete-group-btn"
//                         onClick={() => handleDeleteGroup(group.id, group.createdBy)}
//                         title="Delete group (only creator can delete)"
//                       >
//                         ✕
//                       </button>
//                     )}
//                   </div>

//                   <div className="members-list">
//                     {group.members?.length === 0 ? (
//                       <p className="no-members">No members yet</p>
//                     ) : (
//                       group.members?.map((member) => (
//                         <div key={member.id} className="member-item">
//                           <span>
//                             {member.name} {member.rollNumber && `(${member.rollNumber})`}
//                             {member.userId === userId && " (You)"}
//                           </span>
//                           {(group.createdBy === userId || member.userId === userId) && (
//                             <button
//                               className="remove-member-btn"
//                               onClick={() => handleRemoveMember(group, member.id, member.userId)}
//                               title={member.userId === userId ? "Leave group" : "Remove member"}
//                             >
//                               ✕
//                             </button>
//                           )}
//                         </div>
//                       ))
//                     )}
//                   </div>

//                   {userGroup?.groupId !== group.id && !userGroup && (
//                     <button
//                       className="add-member-btn"
//                       onClick={() => handleJoinGroup(group)}
//                     >
//                       + Join Group
//                     </button>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Grouping;

import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where } from "firebase/firestore";
import "../styles/Grouping.css";

const Grouping = ({ userId, userName, userRollNumber }) => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [userGroup, setUserGroup] = useState(null); // Track which group user is in

  useEffect(() => {
    fetchToursAndGroups();
  }, []);

  const fetchToursAndGroups = async () => {
    try {
      const toursCollection = collection(db, "tours");
      const toursSnapshot = await getDocs(toursCollection);
      const toursData = toursSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTours(toursData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tours:", error);
      setLoading(false);
    }
  };

  const handleTourSelect = async (tour) => {
    setSelectedTour(tour);

    try {
      const groupsCollection = collection(db, `tours/${tour.id}/groups`);
      const groupsSnapshot = await getDocs(groupsCollection);
      const groupsData = await Promise.all(
        groupsSnapshot.docs.map(async (doc) => {
          const groupRef = doc.id;
          const membersCollection = collection(db, `tours/${tour.id}/groups/${groupRef}/members`);
          const membersSnapshot = await getDocs(membersCollection);
          const members = membersSnapshot.docs.map((memberDoc) => ({
            id: memberDoc.id,
            ...memberDoc.data(),
          }));
          
          // Check if current user is in this group
          const userInGroup = members.find(m => String(m.userId) === String(userId));
          if (userInGroup) {
            setUserGroup({ groupId: doc.id, memberId: userInGroup.id });
          }
          
          return {
            id: doc.id,
            ...doc.data(),
            members,
          };
        })
      );
      setGroups(groupsData);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !selectedTour) return;

    try {
      const groupsCollection = collection(db, `tours/${selectedTour.id}/groups`);
      const newGroup = {
        name: groupName,
        createdAt: new Date(),
        createdBy: String(userId),
        memberCount: 0,
      };
      
      console.log("Creating group:", newGroup);
      
      await addDoc(groupsCollection, newGroup);

      setGroupName("");
      setShowAddGroup(false);
      await handleTourSelect(selectedTour);
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Error: " + error.message);
    }
  };

  const handleJoinGroup = async (group) => {
    // Check if user is already in a group
    if (userGroup) {
      alert("You are already in a group. Please leave your current group first.");
      return;
    }

    try {
      const membersCollection = collection(db, `tours/${selectedTour.id}/groups/${group.id}/members`);
      const newMember = {
        name: userName,
        userId: String(userId),
        rollNumber: userRollNumber,
        addedAt: new Date(),
      };
      
      console.log("Adding member:", newMember);
      
      await addDoc(membersCollection, newMember);

      await handleTourSelect(selectedTour);
    } catch (error) {
      console.error("Error joining group:", error);
      alert("Failed to join group. Error: " + error.message);
    }
  };

  const handleRemoveMember = async (group, memberId, memberUserId) => {
    if (!selectedTour) return;

    console.log("Remove member attempt:", {
      groupCreatedBy: group.createdBy,
      currentUserId: userId,
      memberUserId: memberUserId,
      memberId: memberId
    });

    // Check if user created the group OR is removing themselves
    const isCreator = String(group.createdBy) === String(userId);
    const isRemovingSelf = String(memberUserId) === String(userId);
    
    console.log("Permission check:", { isCreator, isRemovingSelf });
    
    if (!isCreator && !isRemovingSelf) {
      alert("You can only remove yourself or members from groups you created.");
      return;
    }

    if (!window.confirm(isRemovingSelf ? "Are you sure you want to leave this group?" : "Remove this member?")) {
      return;
    }

    try {
      const memberRef = doc(db, `tours/${selectedTour.id}/groups/${group.id}/members`, memberId);
      await deleteDoc(memberRef);
      
      console.log("Member removed successfully");
      
      // If user removed themselves, clear userGroup
      if (isRemovingSelf) {
        setUserGroup(null);
      }
      
      await handleTourSelect(selectedTour);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member. Error: " + error.message);
    }
  };

  const handleDeleteGroup = async (groupId, createdBy) => {
    if (!selectedTour) return;

    console.log("Delete group attempt:", {
      groupCreatedBy: createdBy,
      currentUserId: userId,
      groupId: groupId
    });

    // Only allow deletion if user created the group
    const isCreator = String(createdBy) === String(userId);
    
    console.log("Is creator:", isCreator);
    
    if (!isCreator) {
      alert("You can only delete groups you created.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this group? All members will be removed.")) {
      return;
    }

    try {
      // First, delete all members
      const membersCollection = collection(db, `tours/${selectedTour.id}/groups/${groupId}/members`);
      const membersSnapshot = await getDocs(membersCollection);
      
      console.log("Deleting members, count:", membersSnapshot.docs.length);
      
      const deletePromises = membersSnapshot.docs.map((memberDoc) =>
        deleteDoc(doc(db, `tours/${selectedTour.id}/groups/${groupId}/members`, memberDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      // Then delete the group
      const groupRef = doc(db, `tours/${selectedTour.id}/groups`, groupId);
      await deleteDoc(groupRef);
      
      console.log("Group deleted successfully");
      
      // Clear userGroup if they were in this group
      if (userGroup?.groupId === groupId) {
        setUserGroup(null);
      }
      
      await handleTourSelect(selectedTour);
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group. Error: " + error.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="grouping-container">
      <h2>👥 Student Groups</h2>

      {!selectedTour ? (
        <div className="tour-selection">
          <h3>Select a tour to manage groups:</h3>
          <div className="tours-list">
            {tours.map((tour) => (
              <button
                key={tour.id}
                className="tour-btn"
                onClick={() => handleTourSelect(tour)}
              >
                <div className="tour-name">{tour.name}</div>
                <div className="tour-destination">{tour.destination}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grouping-section">
          <div className="grouping-header">
            <button className="back-btn" onClick={() => {
              setSelectedTour(null);
              setUserGroup(null);
            }}>← Back</button>
            <h3>{selectedTour.name} - Groups</h3>
            <button className="add-btn" onClick={() => setShowAddGroup(!showAddGroup)}>
              {showAddGroup ? "Cancel" : "+ Create Group"}
            </button>
          </div>

          {showAddGroup && (
            <div className="add-group-form">
              <input
                type="text"
                placeholder="Group Name (e.g., Group A, Team 1)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <button onClick={handleCreateGroup} className="submit-btn">Create Group</button>
            </div>
          )}

          {userGroup && (
            <div className="user-group-info">
              ℹ️ You are currently in a group. You can only be in one group at a time.
            </div>
          )}

          <div className="groups-grid">
            {groups.length === 0 ? (
              <p className="no-groups">No groups created yet</p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="group-card">
                  <div className="group-header-card">
                    <h4>{group.name}</h4>
                    {String(group.createdBy) === String(userId) && (
                      <button
                        className="delete-group-btn"
                        onClick={() => handleDeleteGroup(group.id, group.createdBy)}
                        title="Delete group (only creator can delete)"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="members-list">
                    {group.members?.length === 0 ? (
                      <p className="no-members">No members yet</p>
                    ) : (
                      group.members?.map((member) => (
                        <div key={member.id} className="member-item">
                          <span>
                            {member.name} {member.rollNumber && `(${member.rollNumber})`}
                            {String(member.userId) === String(userId) && " (You)"}
                          </span>
                          {(String(group.createdBy) === String(userId) || String(member.userId) === String(userId)) && (
                            <button
                              className="remove-member-btn"
                              onClick={() => handleRemoveMember(group, member.id, member.userId)}
                              title={String(member.userId) === String(userId) ? "Leave group" : "Remove member"}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {userGroup?.groupId !== group.id && !userGroup && (
                    <button
                      className="add-member-btn"
                      onClick={() => handleJoinGroup(group)}
                    >
                      + Join Group
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Grouping;