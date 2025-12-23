import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import "../styles/AdminSeating.css";

const DiagnosticsPanel = () => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [seatingData, setSeatingData] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [diagnostics, setDiagnostics] = useState("");

  useEffect(() => {
    fetchToursForDiagnostics();
  }, []);

  const fetchToursForDiagnostics = async () => {
    try {
      const toursCollection = collection(db, "tours");
      const toursSnapshot = await getDocs(toursCollection);
      const toursData = toursSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setTours(toursData);
      console.log("Tours fetched:", toursData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tours:", error);
      addDiagnostic(`Error fetching tours: ${error.message}`);
      setLoading(false);
    }
  };

  const addDiagnostic = (message) => {
    setDiagnostics((prev) => prev + "\n" + new Date().toLocaleTimeString() + ": " + message);
  };

  const checkSeatingForTour = async (tourId) => {
    try {
      setDiagnostics("");
      addDiagnostic(`Checking seating for tour: ${tourId}`);

      const seatingCollection = collection(db, "tours", tourId, "seatingPlan");
      const seatingSnapshot = await getDocs(seatingCollection);

      if (seatingSnapshot.empty) {
        addDiagnostic("❌ No seating assignments found!");
        setSeatingData([]);
        setUserData({});
        return;
      }

      addDiagnostic(`✓ Found ${seatingSnapshot.docs.length} seating assignments`);

      const seats = seatingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSeatingData(seats);

      // Log seating data
      seats.forEach((seat, index) => {
        addDiagnostic(`Seat ${index + 1}: userId="${seat.userId}", seatNumber="${seat.seatNumber}", bus="${seat.bus}"`);
      });

      // Now fetch user data for each userId
      const userMap = {};
      for (const seat of seats) {
        if (!seat.userId) {
          addDiagnostic(`❌ Seat ${seat.seatNumber} has NO userId!`);
          continue;
        }

        addDiagnostic(`Looking up user: ${seat.userId}`);

        try {
          const userDocRef = doc(db, "users", seat.userId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userMap[seat.userId] = userData;
            addDiagnostic(`✓ User found: ${userData.name || userData.fullName} (${userData.email})`);
          } else {
            addDiagnostic(`❌ User document NOT found for: ${seat.userId}`);
            userMap[seat.userId] = null;
          }
        } catch (error) {
          addDiagnostic(`❌ Error fetching user ${seat.userId}: ${error.message}`);
          userMap[seat.userId] = null;
        }
      }

      setUserData(userMap);
    } catch (error) {
      console.error("Error checking seating:", error);
      addDiagnostic(`Error checking seating: ${error.message}`);
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="seating-header">
        <h2>Diagnostics Panel</h2>
        <p style={{ color: "#666", marginTop: "10px" }}>
          Use this to debug seating and user data issues
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Select Tour to Diagnose:</label>
        <select
          value={selectedTour?.id || ""}
          onChange={(e) => {
            const tour = tours.find((t) => t.id === e.target.value);
            setSelectedTour(tour);
            if (tour) {
              checkSeatingForTour(tour.id);
            }
          }}
          style={{ padding: "10px", marginLeft: "10px" }}
        >
          <option value="">-- Choose a tour --</option>
          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTour && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h3>Seating Data</h3>
            {seatingData.length === 0 ? (
              <p style={{ color: "red" }}>No seating assignments found!</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Seat Number</th>
                    <th>Bus</th>
                    <th>User ID</th>
                    <th>User Found?</th>
                  </tr>
                </thead>
                <tbody>
                  {seatingData.map((seat) => (
                    <tr key={seat.id}>
                      <td>{seat.seatNumber}</td>
                      <td>{seat.bus}</td>
                      <td style={{ fontSize: "12px", fontFamily: "monospace" }}>
                        {seat.userId}
                      </td>
                      <td>
                        {userData[seat.userId] ? (
                          <span style={{ color: "green" }}>✓ Yes</span>
                        ) : (
                          <span style={{ color: "red" }}>✗ No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3>User Data Found</h3>
            {Object.keys(userData).length === 0 ? (
              <p style={{ color: "orange" }}>No user data found</p>
            ) : (
              <div>
                {Object.entries(userData).map(([userId, user]) => (
                  <div key={userId} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
                    <strong>ID:</strong> {userId}
                    <br />
                    {user ? (
                      <>
                        <strong>Name:</strong> {user.name || user.fullName}
                        <br />
                        <strong>Email:</strong> {user.email}
                        <br />
                        <strong>Roll Number:</strong> {user.rollNumber}
                      </>
                    ) : (
                      <span style={{ color: "red" }}>User document not found in Firestore</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3>Console Output</h3>
            <textarea
              value={diagnostics}
              readOnly
              style={{
                width: "100%",
                height: "300px",
                padding: "10px",
                fontFamily: "monospace",
                fontSize: "12px",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DiagnosticsPanel;
