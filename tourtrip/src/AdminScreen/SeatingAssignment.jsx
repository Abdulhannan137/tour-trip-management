import { useState, useEffect } from "react";
import { getAllTours } from "../firebase/database";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import "../styles/AdminSeating.css";

const SeatingAssignment = () => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [students, setStudents] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentId: "",
    seatNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTours();
    fetchAllStudents();
  }, []);

  useEffect(() => {
    if (selectedTour) {
      fetchRegisteredStudents(selectedTour.id);
      fetchAssignments(selectedTour.id);
    }
  }, [selectedTour]);

  const fetchTours = async () => {
    try {
      const toursData = await getAllTours();
      setTours(toursData);
      if (toursData.length > 0) {
        setSelectedTour(toursData[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tours:", error);
      setError("Failed to load tours");
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const studentsList = usersSnapshot.docs
        .filter((doc) => doc.data().role === "student")
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.data().fullName,
          rollNumber: doc.data().rollNumber,
          email: doc.data().email,
        }));
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchRegisteredStudents = async (tourId) => {
    try {
      const registrationsCollection = collection(
        db,
        "tours",
        tourId,
        "registrations"
      );
      const registrationsSnapshot = await getDocs(registrationsCollection);
      const registeredIds = registrationsSnapshot.docs.map((doc) =>
        doc.data().userId
      );

      const registered = students.filter((student) =>
        registeredIds.includes(student.id)
      );
      setRegisteredStudents(registered);
    } catch (error) {
      console.error("Error fetching registered students:", error);
    }
  };

  const fetchAssignments = async (tourId) => {
    try {
      const seatingCollection = collection(db, "tours", tourId, "seatingPlan");
      const seatingSnapshot = await getDocs(seatingCollection);
      const assignmentsList = seatingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssignments(assignmentsList);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.studentId || !formData.seatNumber) {
      setError("All fields are required");
      return;
    }

    console.log("Creating seating assignment with:", {
      tourId: selectedTour.id,
      studentId: formData.studentId,
      seatNumber: formData.seatNumber,
    });

    try {
      const seatingCollection = collection(
        db,
        "tours",
        selectedTour.id,
        "seatingPlan"
      );

      const docRef = await addDoc(seatingCollection, {
        userId: formData.studentId,
        seatNumber: formData.seatNumber,
        assignedAt: serverTimestamp(),
      });

      console.log("✓ Seating assignment created with ID:", docRef.id);
      setSuccess("Seating assignment created successfully!");
      setFormData({ studentId: "", seatNumber: "" });
      fetchAssignments(selectedTour.id);
    } catch (error) {
      console.error("Error creating assignment:", error);
      setError(`Failed to create assignment: ${error.message}`);
    }
  };

  const isStudentAssigned = (studentId) => {
    return assignments.some((assignment) => assignment.userId === studentId);
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="seating-header">
        <h2>Create Seating Assignments</h2>
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
        <>
          <div className="seating-info">
            <div className="info-card">
              <h3>{selectedTour.name}</h3>
              <p>
                <strong>Destination:</strong> {selectedTour.destination}
              </p>
              <p>
                <strong>Registered Students:</strong> {registeredStudents.length}
              </p>
              <p>
                <strong>Assigned Seats:</strong> {assignments.length}
              </p>
            </div>
          </div>

          <div className="seating-form-section">
            <h3>Assign Seat</h3>
            <form onSubmit={handleAssign} className="seating-form">
              <div className="form-group">
                <label htmlFor="studentId">Select Student:</label>
                <select
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose a student --</option>
                  {registeredStudents.map((student) => (
                    <option
                      key={student.id}
                      value={student.id}
                      disabled={isStudentAssigned(student.id)}
                    >
                      {student.name} ({student.rollNumber}) -
                      {isStudentAssigned(student.id) ? " Already Assigned" : " Available"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="seatNumber">Seat Number:</label>
                <input
                  type="text"
                  id="seatNumber"
                  name="seatNumber"
                  placeholder="e.g., A1, B2, C3"
                  value={formData.seatNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="btn-primary">
                Assign Seat
              </button>
            </form>
          </div>

          {assignments.length > 0 && (
            <div className="seating-section">
              <h3>Current Assignments ({assignments.length})</h3>
              <div className="seating-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Seat Number</th>
                      <th>Student ID</th>
                      <th>Assigned Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((seat) => (
                      <tr key={seat.id}>
                        <td className="seat-number">{seat.seatNumber || "N/A"}</td>
                        <td>{seat.userId || "N/A"}</td>
                        <td>
                          {seat.assignedAt
                            ? new Date(
                                seat.assignedAt.toDate?.() || seat.assignedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SeatingAssignment;