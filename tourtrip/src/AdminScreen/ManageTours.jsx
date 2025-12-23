import { useState, useEffect } from "react";
import { getAllTours, addTour, updateTour, deleteTour } from "../firebase/database";
import "../styles/AdminTours.css";

const ManageTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    cost: "",
    capacity: "",
    description: "",
  });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const toursData = await getAllTours();
      setTours(toursData);
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTour(editingId, {
          ...formData,
          cost: parseFloat(formData.cost),
          capacity: parseInt(formData.capacity),
        });
      } else {
        await addTour({
          ...formData,
          cost: parseFloat(formData.cost),
          capacity: parseInt(formData.capacity),
        });
      }
      setFormData({
        name: "",
        destination: "",
        startDate: "",
        endDate: "",
        cost: "",
        capacity: "",
        description: "",
      });
      setEditingId(null);
      setShowForm(false);
      await fetchTours();
    } catch (error) {
      console.error("Error saving tour:", error);
      alert(`Error saving tour: ${error.message || "Please try again."}`);
    }
  };

  const handleEdit = (tour) => {
    setFormData({
      name: tour.name,
      destination: tour.destination,
      startDate: tour.startDate,
      endDate: tour.endDate,
      cost: tour.cost.toString(),
      capacity: tour.capacity.toString(),
      description: tour.description,
    });
    setEditingId(tour.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tour?")) {
      try {
        await deleteTour(id);
        await fetchTours();
      } catch (error) {
        console.error("Error deleting tour:", error);
        alert("Error deleting tour. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      cost: "",
      capacity: "",
      description: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="admin-loading">Loading tours...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Tours Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add New Tour"}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="tour-form">
            <div className="form-row">
              <div className="form-group">
                <label>Tour Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter tour name"
                />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter destination"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cost (PKR)</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter cost"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter capacity"
                  min="1"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter tour description"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? "Update Tour" : "Create Tour"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tours-table-container">
        {tours.length === 0 ? (
          <p className="no-tours">No tours available. Create your first tour!</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tour Name</th>
                <th>Destination</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Cost</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id}>
                  <td>{tour.name}</td>
                  <td>{tour.destination}</td>
                  <td>{tour.startDate}</td>
                  <td>{tour.endDate}</td>
                  <td>PKR {tour.cost.toFixed(2)}</td>
                  <td>{tour.capacity}</td>
                  <td>
                    <span className={`status-badge status-${tour.status?.toLowerCase() || "open"}`}>
                      {tour.status || "Open"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => handleEdit(tour)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(tour.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageTours;



//main

// import { useState, useEffect } from "react";
// import { getAllTours, addTour, updateTour, deleteTour } from "../firebase/database";
// import "../styles/AdminTours.css";

// const ManageTours = () => {
//   const [tours, setTours] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     destination: "",
//     startDate: "",
//     endDate: "",
//     cost: "",
//     capacity: "",
//     description: "",
//   });

//   useEffect(() => {
//     fetchTours();
//   }, []);

//   const fetchTours = async () => {
//     try {
//       setLoading(true);
//       const toursData = await getAllTours();
//       setTours(toursData);
//     } catch (error) {
//       console.error("Error fetching tours:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         await updateTour(editingId, {
//           ...formData,
//           cost: parseFloat(formData.cost),
//           capacity: parseInt(formData.capacity),
//         });
//       } else {
//         await addTour({
//           ...formData,
//           cost: parseFloat(formData.cost),
//           capacity: parseInt(formData.capacity),
//         });
//       }
//       setFormData({
//         name: "",
//         destination: "",
//         startDate: "",
//         endDate: "",
//         cost: "",
//         capacity: "",
//         description: "",
//       });
//       setEditingId(null);
//       setShowForm(false);
//       await fetchTours();
//     } catch (error) {
//       console.error("Error saving tour:", error);
//       alert(`Error saving tour: ${error.message || "Please try again."}`);
//     }
//   };

//   const handleEdit = (tour) => {
//     setFormData({
//       name: tour.name,
//       destination: tour.destination,
//       startDate: tour.startDate,
//       endDate: tour.endDate,
//       cost: tour.cost.toString(),
//       capacity: tour.capacity.toString(),
//       description: tour.description,
//     });
//     setEditingId(tour.id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this tour?")) {
//       try {
//         await deleteTour(id);
//         await fetchTours();
//       } catch (error) {
//         console.error("Error deleting tour:", error);
//         alert("Error deleting tour. Please try again.");
//       }
//     }
//   };

//   const handleCancel = () => {
//     setFormData({
//       name: "",
//       destination: "",
//       startDate: "",
//       endDate: "",
//       cost: "",
//       capacity: "",
//       description: "",
//     });
//     setEditingId(null);
//     setShowForm(false);
//   };

//   if (loading) return <div className="admin-loading">Loading tours...</div>;

//   return (
//     <div className="admin-container">
//       <div className="admin-header">
//         <h2>Tours Management</h2>
//         <button
//           className="btn btn-primary"
//           onClick={() => setShowForm(!showForm)}
//         >
//           {showForm ? "Cancel" : "Add New Tour"}
//         </button>
//       </div>

//       {showForm && (
//         <div className="form-container">
//           <form onSubmit={handleSubmit} className="tour-form">
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Tour Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   required
//                   placeholder="Enter tour name"
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Destination</label>
//                 <input
//                   type="text"
//                   name="destination"
//                   value={formData.destination}
//                   onChange={handleInputChange}
//                   required
//                   placeholder="Enter destination"
//                 />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label>Start Date</label>
//                 <input
//                   type="date"
//                   name="startDate"
//                   value={formData.startDate}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//               <div className="form-group">
//                 <label>End Date</label>
//                 <input
//                   type="date"
//                   name="endDate"
//                   value={formData.endDate}
//                   onChange={handleInputChange}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label>Cost (PKR)</label>
//                 <input
//                   type="number"
//                   name="cost"
//                   value={formData.cost}
//                   onChange={handleInputChange}
//                   required
//                   placeholder="Enter cost"
//                   min="0"
//                   step="0.01"
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Capacity</label>
//                 <input
//                   type="number"
//                   name="capacity"
//                   value={formData.capacity}
//                   onChange={handleInputChange}
//                   required
//                   placeholder="Enter capacity"
//                   min="1"
//                 />
//               </div>
//             </div>

//             <div className="form-group full-width">
//               <label>Description</label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Enter tour description"
//                 rows="4"
//               />
//             </div>

//             <div className="form-actions">
//               <button type="submit" className="btn btn-success">
//                 {editingId ? "Update Tour" : "Create Tour"}
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="tours-table-container">
//         {tours.length === 0 ? (
//           <p className="no-tours">No tours available. Create your first tour!</p>
//         ) : (
//           <table className="admin-table">
//             <thead>
//               <tr>
//                 <th>Tour Name</th>
//                 <th>Destination</th>
//                 <th>Start Date</th>
//                 <th>End Date</th>
//                 <th>Cost</th>
//                 <th>Capacity</th>
//                 <th>Registered</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tours.map((tour) => (
//                 <tr key={tour.id}>
//                   <td>{tour.name}</td>
//                   <td>{tour.destination}</td>
//                   <td>{tour.startDate}</td>
//                   <td>{tour.endDate}</td>
//                   <td>PKR {tour.cost.toFixed(2)}</td>
//                   <td>{tour.capacity}</td>
//                   <td>{tour.registeredStudents || 0}</td>
//                   <td>
//                     <span className={`status-badge status-${tour.status?.toLowerCase() || "open"}`}>
//                       {tour.status || "Open"}
//                     </span>
//                   </td>
//                   <td className="actions-cell">
//                     <button
//                       className="btn btn-sm btn-info"
//                       onClick={() => handleEdit(tour)}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       className="btn btn-sm btn-danger"
//                       onClick={() => handleDelete(tour.id)}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManageTours;
