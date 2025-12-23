
import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, addDoc, doc, deleteDoc, query, where } from "firebase/firestore";
import "../styles/SeatingPlan.css";

const SeatingPlan = ({ userId, userRole, userName, userRollNumber }) => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [seatingData, setSeatingData] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ seatNumber: "", studentName: "", rollNumber: "" });
  const [loading, setLoading] = useState(true);
  const [userBookedSeat, setUserBookedSeat] = useState(null);

  const isAdmin = userRole === "admin";

  useEffect(() => {
    fetchToursAndSeating();
  }, []);

  const fetchToursAndSeating = async () => {
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
      const seatingCollection = collection(db, `tours/${tour.id}/seatingPlan`);
      const seatingSnapshot = await getDocs(seatingCollection);
      const seatingData = seatingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort by seat number
      const sortedSeating = seatingData.sort((a, b) => {
        const aNum = parseInt(a.seatNumber.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.seatNumber.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      });
      
      setSeatingData(sortedSeating);

      // Find if current user has booked a seat in this tour
      const userSeat = sortedSeating.find(seat => seat.userId === userId);
      setUserBookedSeat(userSeat || null);
    } catch (error) {
      console.error("Error fetching seating:", error);
    }
  };

  const handleBookSeat = async (seatNumber) => {
    if (!selectedTour || !userId) {
      alert("Please make sure you're logged in.");
      return;
    }

    if (!userName || !userRollNumber) {
      alert("User information is missing. Please log out and log in again.");
      return;
    }

    // Check if seat is already taken by someone else
    const seatExists = seatingData.find(
      seat => seat.seatNumber === seatNumber && seat.userId !== userId
    );
    
    if (seatExists) {
      alert("This seat is already booked by another student.");
      return;
    }

    try {
      const seatingCollection = collection(db, `tours/${selectedTour.id}/seatingPlan`);

      // If user has an existing booking, delete it first (change seat)
      if (userBookedSeat) {
        const oldSeatRef = doc(db, `tours/${selectedTour.id}/seatingPlan`, userBookedSeat.id);
        await deleteDoc(oldSeatRef);
      }

      // Book the new seat
      await addDoc(seatingCollection, {
        seatNumber: seatNumber,
        studentName: userName,
        rollNumber: userRollNumber,
        userId: userId,
        bookedAt: new Date(),
      });

      alert(userBookedSeat ? "Seat changed successfully!" : "Seat booked successfully!");
      await handleTourSelect(selectedTour);
    } catch (error) {
      console.error("Error booking seat:", error);
      alert(`Failed to book seat: ${error.message}`);
    }
  };

  const handleCancelBooking = async (seatId, seatUserId) => {
    if (!selectedTour) return;

    // Security check: Students can only cancel their own seats
    if (!isAdmin && seatUserId !== userId) {
      alert("You can only cancel your own booking.");
      return;
    }

    const confirmCancel = window.confirm("Are you sure you want to cancel this seat booking?");
    if (!confirmCancel) return;

    try {
      const seatRef = doc(db, `tours/${selectedTour.id}/seatingPlan`, seatId);
      await deleteDoc(seatRef);
      alert("Booking cancelled successfully!");
      
      // Clear userBookedSeat if it was the user's own seat
      if (seatUserId === userId) {
        setUserBookedSeat(null);
      }
      
      await handleTourSelect(selectedTour);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(`Failed to cancel booking: ${error.message}`);
    }
  };

  const handleAdminAddSeat = async () => {
    if (!formData.seatNumber || !formData.studentName || !selectedTour) {
      alert("Please fill in seat number and student name");
      return;
    }

    // Check if seat number already exists
    const seatExists = seatingData.find(seat => seat.seatNumber === formData.seatNumber);
    if (seatExists) {
      alert("This seat number is already assigned. Please use a different seat number.");
      return;
    }

    try {
      const seatingCollection = collection(db, `tours/${selectedTour.id}/seatingPlan`);
      await addDoc(seatingCollection, {
        seatNumber: formData.seatNumber,
        studentName: formData.studentName,
        rollNumber: formData.rollNumber || "",
        userId: null, // Admin assignment doesn't have userId
        assignedAt: new Date(),
      });

      setFormData({ seatNumber: "", studentName: "", rollNumber: "" });
      setShowAddForm(false);
      alert("Seat assigned successfully!");
      await handleTourSelect(selectedTour);
    } catch (error) {
      console.error("Error adding seat:", error);
      alert(`Failed to add seat: ${error.message}`);
    }
  };

  // Generate available seat numbers (example: A1-A10, B1-B10, etc.)
  const generateAvailableSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatsPerRow = 10;
    const allSeats = [];

    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatNumber = `${row}${i}`;
        const bookedSeat = seatingData.find(seat => seat.seatNumber === seatNumber);
        const isBookedByCurrentUser = bookedSeat?.userId === userId;
        const isBookedByOther = bookedSeat && !isBookedByCurrentUser;
        
        allSeats.push({ 
          seatNumber, 
          isBooked: isBookedByOther,
          isUserSeat: isBookedByCurrentUser
        });
      }
    }

    return allSeats;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="seating-container">
      <h2>🪑 Seating Plan</h2>

      {!selectedTour ? (
        <div className="tour-selection">
          <h3>Select a tour to view seating plan:</h3>
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
        <div className="seating-section">
          <div className="seating-header">
            <button className="back-btn" onClick={() => setSelectedTour(null)}>← Back</button>
            <h3>{selectedTour.name} - Seating Arrangement</h3>
            {isAdmin && (
              <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? "Cancel" : "+ Add Seat"}
              </button>
            )}
          </div>

          {/* User's current booking status */}
          {!isAdmin && (
            <div className="booking-status">
              {userBookedSeat ? (
                <div className="user-booking">
                  <p>✓ Your booked seat: <strong>{userBookedSeat.seatNumber}</strong></p>
                  <button 
                    className="cancel-booking-btn"
                    onClick={() => handleCancelBooking(userBookedSeat.id, userBookedSeat.userId)}
                  >
                    Cancel Booking
                  </button>
                </div>
              ) : (
                <p className="no-booking">You haven't booked a seat yet. Select an available seat below.</p>
              )}
            </div>
          )}

          {/* Admin add form */}
          {isAdmin && showAddForm && (
            <div className="add-form">
              <input
                type="text"
                placeholder="Seat Number (e.g., A1)"
                value={formData.seatNumber}
                onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value.toUpperCase() })}
              />
              <input
                type="text"
                placeholder="Student Name"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Roll Number (optional)"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              />
              <button onClick={handleAdminAddSeat} className="submit-btn">Save Seat</button>
            </div>
          )}

          {/* Student booking interface */}
          {!isAdmin && (
            <div className="student-booking">
              <h4>{userBookedSeat ? "Change Your Seat (Click on a new seat)" : "Select Your Seat"}</h4>
              <div className="seat-selection-grid">
                {generateAvailableSeats().map((seat) => (
                  <button
                    key={seat.seatNumber}
                    className={`seat-option ${
                      seat.isUserSeat ? 'user-seat' : 
                      seat.isBooked ? 'booked' : 
                      'available'
                    }`}
                    disabled={seat.isBooked}
                    onClick={() => {
                      if (!seat.isBooked) {
                        handleBookSeat(seat.seatNumber);
                      }
                    }}
                  >
                    <span className="seat-label">{seat.seatNumber}</span>
                    {seat.isUserSeat && <span className="user-indicator">YOU</span>}
                    {seat.isBooked && <span className="booked-indicator">✓</span>}
                  </button>
                ))}
              </div>
              <div className="legend">
                <div className="legend-item">
                  <span className="legend-box available"></span>
                  <span>Available</span>
                </div>
                {userBookedSeat && (
                  <div className="legend-item">
                    <span className="legend-box user-seat"></span>
                    <span>Your Seat</span>
                  </div>
                )}
                <div className="legend-item">
                  <span className="legend-box booked"></span>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          )}

          {/* Current seating layout (visible to all) */}
          <div className="seating-layout">
            <h4>Current Bookings ({seatingData.length} seats booked)</h4>
            {seatingData.length === 0 ? (
              <p className="no-seats">No seats assigned yet</p>
            ) : (
              <div className="seats-grid">
                {seatingData.map((seat) => (
                  <div 
                    key={seat.id} 
                    className={`seat ${seat.userId === userId ? 'highlight-user' : ''}`}
                  >
                    <div className="seat-number">{seat.seatNumber}</div>
                    <div className="seat-info">
                      <p className="student-name">
                        {seat.studentName}
                        {seat.userId === userId && " (You)"}
                      </p>
                      <p className="roll-number">{seat.rollNumber}</p>
                    </div>
                    {/* Show cancel button only if: Admin OR it's user's own seat */}
                    {(isAdmin || seat.userId === userId) && (
                      <button
                        className="delete-seat-btn"
                        onClick={() => handleCancelBooking(seat.id, seat.userId)}
                        title={isAdmin ? "Delete seat" : "Cancel your booking"}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatingPlan;

//Orignal

// import { useState, useEffect } from "react";
// import { db } from "../firebase/firebaseConfig";
// import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
// import "../styles/SeatingPlan.css";

// const SeatingPlan = ({ userId }) => {
//   const [tours, setTours] = useState([]);
//   const [selectedTour, setSelectedTour] = useState(null);
//   const [seatingData, setSeatingData] = useState([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [formData, setFormData] = useState({ seatNumber: "", studentName: "", rollNumber: "" });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchToursAndSeating();
//   }, []);

//   const fetchToursAndSeating = async () => {
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
//       const seatingCollection = collection(db, `tours/${tour.id}/seatingPlan`);
//       const seatingSnapshot = await getDocs(seatingCollection);
//       const seatingData = seatingSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setSeatingData(seatingData.sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber)));
//     } catch (error) {
//       console.error("Error fetching seating:", error);
//     }
//   };

//   const handleAddSeat = async () => {
//     if (!formData.seatNumber || !formData.studentName || !selectedTour) return;

//     try {
//       const seatingCollection = collection(db, `tours/${selectedTour.id}/seatingPlan`);
//       await addDoc(seatingCollection, {
//         seatNumber: formData.seatNumber,
//         studentName: formData.studentName,
//         rollNumber: formData.rollNumber,
//         assignedAt: new Date(),
//       });

//       setFormData({ seatNumber: "", studentName: "", rollNumber: "" });
//       setShowAddForm(false);
//       handleTourSelect(selectedTour);
//     } catch (error) {
//       console.error("Error adding seat:", error);
//     }
//   };

//   const handleDeleteSeat = async (seatId) => {
//     if (!selectedTour) return;

//     try {
//       const seatRef = doc(db, `tours/${selectedTour.id}/seatingPlan`, seatId);
//       await deleteDoc(seatRef);
//       handleTourSelect(selectedTour);
//     } catch (error) {
//       console.error("Error deleting seat:", error);
//     }
//   };

//   if (loading) return <div className="loading">Loading...</div>;

//   return (
//     <div className="seating-container">
//       <h2>🪑 Seating Plan</h2>

//       {!selectedTour ? (
//         <div className="tour-selection">
//           <h3>Select a tour to view seating plan:</h3>
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
//         <div className="seating-section">
//           <div className="seating-header">
//             <button className="back-btn" onClick={() => setSelectedTour(null)}>← Back</button>
//             <h3>{selectedTour.name} - Seating Arrangement</h3>
//             <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
//               {showAddForm ? "Cancel" : "+ Add Seat"}
//             </button>
//           </div>

//           {showAddForm && (
//             <div className="add-form">
//               <input
//                 type="text"
//                 placeholder="Seat Number (e.g., A1)"
//                 value={formData.seatNumber}
//                 onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
//               />
//               <input
//                 type="text"
//                 placeholder="Student Name"
//                 value={formData.studentName}
//                 onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
//               />
//               <input
//                 type="text"
//                 placeholder="Roll Number"
//                 value={formData.rollNumber}
//                 onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
//               />
//               <button onClick={handleAddSeat} className="submit-btn">Save Seat</button>
//             </div>
//           )}

//           <div className="seating-layout">
//             {seatingData.length === 0 ? (
//               <p className="no-seats">No seats assigned yet</p>
//             ) : (
//               seatingData.map((seat) => (
//                 <div key={seat.id} className="seat">
//                   <div className="seat-number">{seat.seatNumber}</div>
//                   <div className="seat-info">
//                     <p className="student-name">{seat.studentName}</p>
//                     <p className="roll-number">{seat.rollNumber}</p>
//                   </div>
//                   <button
//                     className="delete-seat-btn"
//                     onClick={() => handleDeleteSeat(seat.id)}
//                   >
//                     ✕
//                   </button>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SeatingPlan;
