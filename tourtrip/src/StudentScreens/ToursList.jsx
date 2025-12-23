import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import "../styles/Tours.css";

const ToursList = ({ userId } ) => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const toursCollection = collection(db, "tours");
      const querySnapshot = await getDocs(toursCollection);
      const toursData = querySnapshot.docs.map((doc) => ({
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

  if (loading) return <div className="loading">Loading tours...</div>;

  return (
    <div className="tours-container">
      <h2>Available Tours</h2>
      {tours.length === 0 ? (
        <p className="no-tours">No tours available at the moment</p>
      ) : (
        <div className="tours-grid">
          {tours.map((tour) => (
            <div key={tour.id} className="tour-card">
              <div className="tour-header">
                <h3>{tour.name}</h3>
                <span className="tour-badge">{tour.status || "Open"}</span>
              </div>
              <div className="tour-details">
                <p><strong>📍 Destination:</strong> {tour.destination}</p>
                <p><strong>📅 Start Date:</strong> {tour.startDate}</p>
                <p><strong>📅 End Date:</strong> {tour.endDate}</p>
                <p><strong>💰 Cost:</strong> PKR {tour.cost?.toLocaleString()}</p>
                <p><strong>👥 Capacity:</strong> {tour.registeredStudents?.length || 0}/{tour.capacity}</p>
              </div>
              <p className="tour-description">{tour.description}</p>
              <button 
                className="tour-button"
                onClick={() => setSelectedTour(tour)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedTour && (
        <TourDetailModal tour={selectedTour} onClose={() => setSelectedTour(null)} />
      )}
    </div>
  );
};

const TourDetailModal = ({ tour, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <h2>{tour.name}</h2>
        <div className="modal-details">
          <p><strong>Destination:</strong> {tour.destination}</p>
          <p><strong>Description:</strong> {tour.description}</p>
          <p><strong>Duration:</strong> {tour.startDate} to {tour.endDate}</p>
          <p><strong>Cost per person:</strong> PKR {tour.cost?.toLocaleString()}</p>
          <p><strong>Capacity:</strong> {tour.registeredStudents?.length || 0} / {tour.capacity}</p>
        </div>
      </div>
    </div>
  );
};

export default ToursList;
