// import { useState, useEffect } from "react";
// import { db } from "../firebase/firebaseConfig";
// import { collection, getDocs } from "firebase/firestore";
// import { register } from "../firebase/database";
// import "../styles/TourDates.css";

// const TourDates = ({ userId }) => {
//   const [tours, setTours] = useState([]);
//   const [selectedTour, setSelectedTour] = useState(null);
//   const [registrations, setRegistrations] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchToursAndRegistrations();
//   }, [userId]);

//   const fetchToursAndRegistrations = async () => {
//     try {
//       const toursCollection = collection(db, "tours");
//       const toursSnapshot = await getDocs(toursCollection);
//       const toursData = toursSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setTours(toursData);

//       // Fetch user registrations from tour subcollections
//       const userRegs = [];
//       for (const tour of toursData) {
//         const registrationsCollection = collection(db, "tours", tour.id, "registrations");
//         const registrationsSnapshot = await getDocs(registrationsCollection);
//         registrationsSnapshot.docs.forEach((doc) => {
//           if (doc.data().userId === userId) {
//             userRegs.push({
//               id: doc.id,
//               tourId: tour.id,
//               ...doc.data(),
//             });
//           }
//         });
//       }
//       setRegistrations(userRegs);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setLoading(false);
//     }
//   };

//   const isRegistered = (tourId) => {
//     return registrations.some((reg) => reg.tourId === tourId);
//   };

//   const handleRegister = async (tour) => {
//     try {
//       await register(tour.id, userId);
//       fetchToursAndRegistrations();
//       alert("Registered successfully!");
//     } catch (error) {
//       console.error("Error registering:", error);
//       alert(`Registration failed: ${error.message}`);
//     }
//   };

//   const getDateStatus = (startDate) => {
//     const today = new Date();
//     const tourDate = new Date(startDate);
//     const daysUntil = Math.ceil((tourDate - today) / (1000 * 60 * 60 * 24));

//     if (daysUntil < 0) return { text: "Completed", color: "gray" };
//     if (daysUntil === 0) return { text: "Today", color: "red" };
//     if (daysUntil <= 7) return { text: `${daysUntil} days left`, color: "orange" };
//     return { text: `${daysUntil} days left`, color: "green" };
//   };

//   if (loading) return <div className="loading">Loading tours...</div>;

//   return (
//     <div className="tour-dates-container">
//       <h2>📅 Tour Dates & Registration</h2>

//       {tours.length === 0 ? (
//         <p className="no-tours">No tours scheduled</p>
//       ) : (
//         <div className="dates-grid">
//           {tours.map((tour) => {
//             const status = getDateStatus(tour.startDate);
//             const registered = isRegistered(tour.id);

//             return (
//               <div key={tour.id} className="date-card">
//                 <div className="date-status" style={{ borderTopColor: status.color }}>
//                   <span className={`status-badge ${status.color}`}>{status.text}</span>
//                 </div>

//                 <div className="date-info">
//                   <h3>{tour.name}</h3>
//                   <p className="destination">📍 {tour.destination}</p>

//                   <div className="date-timeline">
//                     <div className="date-item">
//                       <span className="label">Starts:</span>
//                       <span className="value">{tour.startDate}</span>
//                     </div>
//                     <div className="date-item">
//                       <span className="label">Ends:</span>
//                       <span className="value">{tour.endDate}</span>
//                     </div>
//                     <div className="date-item">
//                       <span className="label">Cost:</span>
//                       <span className="value cost">PKR {tour.cost?.toLocaleString()}</span>
//                     </div>
//                   </div>

//                   <p className="description">{tour.description}</p>

//                   <div className="capacity-bar">
//                     <div className="capacity-label">
//                       <span>Capacity</span>
//                       <span>{tour.registeredStudents?.length || 0} / {tour.capacity}</span>
//                     </div>
//                     <div className="progress">
//                       <div
//                         className="progress-fill"
//                         style={{
//                           width: `${((tour.registeredStudents?.length || 0) / tour.capacity) * 100}%`,
//                         }}
//                       ></div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="date-actions">
//                   {registered ? (
//                     <button className="registered-btn" disabled>
//                       ✓ Registered
//                     </button>
//                   ) : (
//                     <button
//                       className="register-btn"
//                       onClick={() => handleRegister(tour)}
//                       disabled={(tour.registeredStudents?.length || 0) >= tour.capacity}
//                     >
//                       {(tour.registeredStudents?.length || 0) >= tour.capacity
//                         ? "Full Capacity"
//                         : "Register"}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TourDates;
