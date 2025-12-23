import { useState, useEffect } from "react";
import { getAllTours, getVotingPlaces, updateTour } from "../firebase/database";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "../styles/AdminVoting.css";

const VotingManager = () => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [votingPlaces, setVotingPlaces] = useState([]);
  const [voters, setVoters] = useState({});
  const [loading, setLoading] = useState(true);
  const [votingEnabled, setVotingEnabled] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (selectedTour) {
      fetchVotingPlaces(selectedTour.id);
      setVotingEnabled(selectedTour.votingEnabled || false);
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

  const fetchVotingPlaces = async (tourId) => {
    try {
      const places = await getVotingPlaces(tourId);
      // Sort by votes in descending order
      setVotingPlaces(places.sort((a, b) => (b.votes || 0) - (a.votes || 0)));
      
      // Fetch voter details for each voting place
      const votersMap = {};
      for (const place of places) {
        if (place.voters && place.voters.length > 0) {
          const voterDetails = [];
          for (const voterId of place.voters) {
            try {
              const usersRef = collection(db, "users");
              const snapshot = await getDocs(usersRef);
              const voterDoc = snapshot.docs.find(doc => doc.id === voterId);
              if (voterDoc) {
                voterDetails.push({
                  id: voterId,
                  email: voterDoc.data().email || "Unknown",
                  name: voterDoc.data().name || "Unknown User",
                });
              }
            } catch (error) {
              console.error("Error fetching voter details:", error);
            }
          }
          votersMap[place.id] = voterDetails;
        }
      }
      setVoters(votersMap);
    } catch (error) {
      console.error("Error fetching voting places:", error);
    }
  };

  const handleToggleVoting = async () => {
    try {
      await updateTour(selectedTour.id, {
        votingEnabled: !votingEnabled,
      });
      setVotingEnabled(!votingEnabled);
      setSelectedTour({
        ...selectedTour,
        votingEnabled: !votingEnabled,
      });
    } catch (error) {
      console.error("Error toggling voting:", error);
      alert("Error updating voting status. Please try again.");
    }
  };

  if (loading) return <div className="admin-loading">Loading voting data...</div>;

  return (
    <div className="admin-container">
      <div className="voting-header">
        <h2>Voting Management</h2>
        <div className="voting-controls">
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
          <button
            className={`btn ${votingEnabled ? "btn-danger" : "btn-success"}`}
            onClick={handleToggleVoting}
          >
            {votingEnabled ? "Disable Voting" : "Enable Voting"}
          </button>
        </div>
      </div>

      {selectedTour && (
        <div className="voting-info">
          <div className="info-card">
            <h3>{selectedTour.name}</h3>
            <p>
              <strong>Destination:</strong> {selectedTour.destination}
            </p>
            <p>
              <strong>Voting Status:</strong>
              <span className={`status-badge ${votingEnabled ? "active" : "inactive"}`}>
                {votingEnabled ? "Enabled" : "Disabled"}
              </span>
            </p>
            <p>
              <strong>Total Votes Received:</strong> {votingPlaces.reduce((sum, place) => sum + (place.votes || 0), 0)}
            </p>
          </div>
        </div>
      )}

      <div className="voting-places-section">
        <h3>Votes & Voters</h3>
        {votingPlaces.length === 0 ? (
          <p className="no-data">No votes received yet for this tour.</p>
        ) : (
          <div className="places-grid">
            {votingPlaces.map((place, index) => (
              <div key={place.id} className="place-card">
                <div className="place-rank">#{index + 1}</div>
                <div className="place-info">
                  <h4>{place.name || "Tour Vote"}</h4>
                  {place.description && <p className="description">{place.description}</p>}
                </div>
                <div className="place-votes">
                  <div className="vote-count">
                    <span className="votes-number">{place.votes || 0}</span>
                    <span className="votes-label">Votes</span>
                  </div>
                  <div className="vote-bar">
                    <div
                      className="vote-fill"
                      style={{
                        width: `${
                          votingPlaces.length > 0
                            ? ((place.votes || 0) / Math.max(...votingPlaces.map((p) => p.votes || 0)) || 0) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {voters[place.id] && voters[place.id].length > 0 && (
                  <div className="voters-section">
                    <h5>Voted by ({voters[place.id].length})</h5>
                    <div className="voters-list">
                      {voters[place.id].map((voter) => (
                        <div key={voter.id} className="voter-item">
                          <span className="voter-name">{voter.name}</span>
                          <span className="voter-email">{voter.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingManager;
