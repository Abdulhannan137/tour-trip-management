import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import "../styles/Voting.css";

const VotingPlace = ({ userId }) => {
  const [tours, setTours] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [currentVotedTourId, setCurrentVotedTourId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToursAndVotes();
  }, [userId]);

  const fetchToursAndVotes = async () => {
    try {
      // Fetch all tours
      const toursCollection = collection(db, "tours");
      const toursSnapshot = await getDocs(toursCollection);
      const toursData = [];
      const votes = {};
      let votedTourId = null;

      // Process each tour to get voting info
      for (const tourDoc of toursSnapshot.docs) {
        const tourData = tourDoc.data();
        
        // Get voting data for this tour
        const votingCollection = collection(db, `tours/${tourDoc.id}/votingPlaces`);
        const votingSnapshot = await getDocs(votingCollection);
        
        let voteCount = 0;
        let hasUserVoted = false;

        votingSnapshot.forEach((voteDoc) => {
          const voteData = voteDoc.data();
          voteCount += voteData.votes || 0;
          if (voteData.voters?.includes(userId)) {
            hasUserVoted = true;
            votedTourId = tourDoc.id;
          }
        });

        toursData.push({
          id: tourDoc.id,
          ...tourData,
          totalVotes: voteCount,
        });

        votes[tourDoc.id] = hasUserVoted;
      }

      setTours(toursData.sort((a, b) => b.totalVotes - a.totalVotes));
      setUserVotes(votes);
      setCurrentVotedTourId(votedTourId);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tours:", error);
      setLoading(false);
    }
  };

  const removeVoteFromTour = async (tourId) => {
    const votingCollection = collection(db, `tours/${tourId}/votingPlaces`);
    const votingSnapshot = await getDocs(votingCollection);

    for (const voteDoc of votingSnapshot.docs) {
      const voteData = voteDoc.data();
      if (voteData.voters?.includes(userId)) {
        const updatedVoters = voteData.voters.filter((v) => v !== userId);
        const voteRef = doc(db, `tours/${tourId}/votingPlaces`, voteDoc.id);
        await updateDoc(voteRef, {
          voters: updatedVoters,
          votes: updatedVoters.length,
        });
      }
    }
  };

  const addVoteToTour = async (tourId) => {
    const votingCollection = collection(db, `tours/${tourId}/votingPlaces`);
    let votingSnapshot = await getDocs(votingCollection);
    let votingPlaceId;

    if (votingSnapshot.empty) {
      // If no voting places exist, create one for the tour
      const newVoteRef = await addDoc(votingCollection, {
        name: "Tour Vote",
        votes: 0,
        voters: [],
        createdAt: new Date(),
      });
      votingPlaceId = newVoteRef.id;
      
      // Refresh voting snapshot to get the newly created document
      votingSnapshot = await getDocs(votingCollection);
    } else {
      votingPlaceId = votingSnapshot.docs[0].id;
    }

    const voteRef = doc(db, `tours/${tourId}/votingPlaces`, votingPlaceId);
    const voteDoc = votingSnapshot.docs.find((d) => d.id === votingPlaceId);
    const voteData = voteDoc?.data() || { voters: [] };

    const updatedVoters = [...(voteData.voters || []), userId];
    
    await updateDoc(voteRef, {
      voters: updatedVoters,
      votes: updatedVoters.length,
    });
  };

  const handleVote = async (tourId) => {
    try {
      if (userVotes[tourId]) {
        // User is removing their vote from this tour
        await removeVoteFromTour(tourId);
        setUserVotes((prev) => ({ ...prev, [tourId]: false }));
        setCurrentVotedTourId(null);
      } else {
        // User is voting for a new tour
        // First, check if they've already voted for another tour
        if (currentVotedTourId && currentVotedTourId !== tourId) {
          // Remove vote from the previously voted tour
          await removeVoteFromTour(currentVotedTourId);
          setUserVotes((prev) => ({ ...prev, [currentVotedTourId]: false }));
        }

        // Add vote to the new tour
        await addVoteToTour(tourId);
        setUserVotes((prev) => ({ ...prev, [tourId]: true }));
        setCurrentVotedTourId(tourId);
      }

      fetchToursAndVotes(); // Refresh data
    } catch (error) {
      console.error("Error voting:", error);
      alert(`Error casting vote: ${error.message}`);
    }
  };

  if (loading) return <div className="loading">Loading tours...</div>;

  return (
    <div className="voting-container">
      <h2>Vote for Your Preferred Tour</h2>
      <p className="voting-instructions">You can vote for only one tour at a time</p>

      <div className="tours-voting-list">
        {tours.length === 0 ? (
          <p className="no-tours">No tours available</p>
        ) : (
          tours.map((tour) => (
            <div key={tour.id} className="tour-voting-card">
              <div className="tour-voting-info">
                <h3>{tour.name}</h3>
                <p className="destination">{tour.destination}</p>
                <div className="tour-details">
                  <span className="dates">
                    {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                  </span>
                  <span className="cost">PKR {tour.cost?.toLocaleString()}</span>
                </div>
                <div className="vote-info">
                  <span className="votes">{tour.totalVotes} votes</span>
                </div>
              </div>
              <div className="vote-action">
                <button
                  className={`vote-btn ${userVotes[tour.id] ? "voted" : ""}`}
                  onClick={() => handleVote(tour.id)}
                >
                  {userVotes[tour.id] ? "✓ Voted" : "Vote"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VotingPlace;
// import { useState, useEffect } from "react";
// import { db } from "../firebase/firebaseConfig";
// import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
// import "../styles/Voting.css";

// const VotingPlace = ({ userId }) => {
//   const [tours, setTours] = useState([]);
//   const [userVotes, setUserVotes] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchToursAndVotes();
//   }, [userId]);

//   const fetchToursAndVotes = async () => {
//     try {
//       // Fetch all tours
//       const toursCollection = collection(db, "tours");
//       const toursSnapshot = await getDocs(toursCollection);
//       const toursData = [];
//       const votes = {};

//       // Process each tour to get voting info
//       for (const tourDoc of toursSnapshot.docs) {
//         const tourData = tourDoc.data();
        
//         // Get voting data for this tour
//         const votingCollection = collection(db, `tours/${tourDoc.id}/votingPlaces`);
//         const votingSnapshot = await getDocs(votingCollection);
        
//         let voteCount = 0;
//         let hasUserVoted = false;

//         votingSnapshot.forEach((voteDoc) => {
//           const voteData = voteDoc.data();
//           voteCount += voteData.votes || 0;
//           if (voteData.voters?.includes(userId)) {
//             hasUserVoted = true;
//           }
//         });

//         toursData.push({
//           id: tourDoc.id,
//           ...tourData,
//           totalVotes: voteCount,
//         });

//         votes[tourDoc.id] = hasUserVoted;
//       }

//       setTours(toursData.sort((a, b) => b.totalVotes - a.totalVotes));
//       setUserVotes(votes);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching tours:", error);
//       setLoading(false);
//     }
//   };

//   const handleVote = async (tourId) => {
//     try {
//       // Create or update a voting record for this tour
//       const votingCollection = collection(db, `tours/${tourId}/votingPlaces`);
//       let votingSnapshot = await getDocs(votingCollection);

//       if (userVotes[tourId]) {
//         // Remove vote - update all voting places to remove this user
//         for (const voteDoc of votingSnapshot.docs) {
//           const voteData = voteDoc.data();
//           const updatedVoters = voteData.voters.filter((v) => v !== userId);
//           const voteRef = doc(db, `tours/${tourId}/votingPlaces`, voteDoc.id);
//           await updateDoc(voteRef, {
//             voters: updatedVoters,
//             votes: updatedVoters.length,
//           });
//         }
//         setUserVotes((prev) => ({ ...prev, [tourId]: false }));
//       } else {
//         // Add vote
//         let votingPlaceId;

//         if (votingSnapshot.empty) {
//           // If no voting places exist, create one for the tour
//           const newVoteRef = await addDoc(votingCollection, {
//             name: "Tour Vote",
//             votes: 0,
//             voters: [],
//             createdAt: new Date(),
//           });
//           votingPlaceId = newVoteRef.id;
          
//           // Refresh voting snapshot to get the newly created document
//           votingSnapshot = await getDocs(votingCollection);
//         } else {
//           votingPlaceId = votingSnapshot.docs[0].id;
//         }

//         const voteRef = doc(db, `tours/${tourId}/votingPlaces`, votingPlaceId);
//         const voteDoc = votingSnapshot.docs.find((d) => d.id === votingPlaceId);
//         const voteData = voteDoc?.data() || { voters: [] };

//         const updatedVoters = [...(voteData.voters || []), userId];
        
//         await updateDoc(voteRef, {
//           voters: updatedVoters,
//           votes: updatedVoters.length,
//         });
//         setUserVotes((prev) => ({ ...prev, [tourId]: true }));
//       }

//       fetchToursAndVotes(); // Refresh data
//     } catch (error) {
//       console.error("Error voting:", error);
//       alert(`Error casting vote: ${error.message}`);
//     }
//   };

//   if (loading) return <div className="loading">Loading tours...</div>;

//   return (
//     <div className="voting-container">
//       <h2>Vote for Your Preferred Tour</h2>

//       <div className="tours-voting-list">
//         {tours.length === 0 ? (
//           <p className="no-tours">No tours available</p>
//         ) : (
//           tours.map((tour) => (
//             <div key={tour.id} className="tour-voting-card">
//               <div className="tour-voting-info">
//                 <h3>{tour.name}</h3>
//                 <p className="destination">{tour.destination}</p>
//                 <div className="tour-details">
//                   <span className="dates">
//                     {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
//                   </span>
//                   <span className="cost">PKR {tour.cost?.toLocaleString()}</span>
//                 </div>
//                 <div className="vote-info">
//                   <span className="votes">{tour.totalVotes} votes</span>
//                 </div>
//               </div>
//               <div className="vote-action">
//                 <button
//                   className={`vote-btn ${userVotes[tour.id] ? "voted" : ""}`}
//                   onClick={() => handleVote(tour.id)}
//                 >
//                   {userVotes[tour.id] ? "✓ Voted" : "Vote"}
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default VotingPlace;
