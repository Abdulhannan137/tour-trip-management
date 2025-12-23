import { useState, useEffect } from "react";
import { getAllTours, getSeatingPlan } from "../firebase/database";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "../styles/AdminSeating.css";

const SeatingViewer = () => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [seatingPlan, setSeatingPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTour) {
      fetchSeatingPlan(selectedTour.id);
    }
  }, [selectedTour]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const toursData = await getAllTours();
      setTours(toursData);
      if (toursData.length > 0) {
        setSelectedTour(toursData[0]);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeatingPlan = async (tourId) => {
    try {
      const seats = await getSeatingPlan(tourId);

      // Fetch all users once
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersMap = {};
      usersSnapshot.docs.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });

      console.log("Users map:", usersMap);
      console.log("Seating plan:", seats);

      // Enrich seats with user data
      const enrichedSeats = seats.map((seat) => {
        const user = usersMap[seat.userId];
        return {
          ...seat,
          studentName: user?.name || user?.fullName || "Unknown",
          studentEmail: user?.email || "N/A",
          studentRollNumber: user?.rollNumber || "N/A",
        };
      });

      console.log("Enriched seats:", enrichedSeats);
      setSeatingPlan(enrichedSeats);
    } catch (error) {
      console.error("Error fetching seating plan:", error);
    }
  };

  if (loading) return <div className="admin-loading">Loading seating data...</div>;

  return (
    <div className="admin-container">
      <div className="seating-header">
        <h2>Seating Plan Viewer</h2>
        <div className="tour-selector">
          <label>Select Tour:</label>
          <select
            value={selectedTour?.id || ""}
            onChange={(e) => {
              const tour = tours.find((t) => t.id === e.target.value);
              setSelectedTour(tour);
            }}
          >
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.name} - {tour.destination}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTour && (
        <div className="seating-info">
          <div className="info-card">
            <h3>{selectedTour.name}</h3>
            <p>
              <strong>Destination:</strong> {selectedTour.destination}
            </p>
            <p>
              <strong>Total Seats Assigned:</strong> {seatingPlan.length}
            </p>
            <p>
              <strong>Capacity:</strong> {selectedTour.capacity}
            </p>
          </div>
        </div>
      )}

   

      {seatingPlan.length > 0 && (
        <div className="seating-summary">
          <h3>Seating Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Total Assigned</h4>
              <p className="summary-number">{seatingPlan.length}</p>
            </div>
            <div className="summary-card">
              <h4>Remaining Seats</h4>
              <p className="summary-number">{selectedTour.capacity - seatingPlan.length}</p>
            </div>
            <div className="summary-card">
              <h4>Occupancy Rate</h4>
              <p className="summary-number">
                {((seatingPlan.length / selectedTour.capacity) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatingViewer;