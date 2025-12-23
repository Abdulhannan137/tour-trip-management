import { 
  db 
} from "./firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";

/**
 * TOURS MANAGEMENT
 */

/**
 * Add a new tour
 * @param {object} tourData - Tour information
 * @returns {Promise<string>} Document ID of the new tour
 */
export const addTour = async (tourData) => {
  try {
    const toursCollection = collection(db, "tours");
    const docRef = await addDoc(toursCollection, {
      ...tourData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "Open",
      registeredStudents: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding tour:", error);
    throw error;
  }
};

/**
 * Get all tours
 * @returns {Promise<array>} Array of tour objects
 */
export const getAllTours = async () => {
  try {
    const toursCollection = collection(db, "tours");
    const querySnapshot = await getDocs(toursCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching tours:", error);
    throw error;
  }
};

/**
 * Get tour by ID
 * @param {string} tourId - Tour ID
 * @returns {Promise<object>} Tour data
 */
export const getTourById = async (tourId) => {
  try {
    const tourDoc = await getDoc(doc(db, "tours", tourId));
    if (tourDoc.exists()) {
      return { id: tourDoc.id, ...tourDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching tour:", error);
    throw error;
  }
};

/**
 * Update tour
 * @param {string} tourId - Tour ID
 * @param {object} updateData - Data to update
 * @returns {Promise}
 */
export const updateTour = async (tourId, updateData) => {
  try {
    await updateDoc(doc(db, "tours", tourId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    throw error;
  }
};

/**
 * Delete tour
 * @param {string} tourId - Tour ID
 * @returns {Promise}
 */
export const deleteTour = async (tourId) => {
  try {
    await deleteDoc(doc(db, "tours", tourId));
  } catch (error) {
    console.error("Error deleting tour:", error);
    throw error;
  }
};

/**
 * TOUR REGISTRATION MANAGEMENT
 */

/**
 * Register student for a tour
 * @param {string} tourId - Tour ID
 * @param {string} userId - Student user ID
 * @param {object} registrationData - Registration details
 * @returns {Promise<string>} Registration document ID
 */
export const registerForTour = async (tourId, userId, registrationData) => {
  try {
    const registrationCollection = collection(
      db,
      "tours",
      tourId,
      "registrations"
    );
    const docRef = await addDoc(registrationCollection, {
      userId,
      ...registrationData,
      registeredAt: serverTimestamp(),
      paymentStatus: "Pending",
    });
    
    // Update tour registered students count
    const tourDoc = doc(db, "tours", tourId);
    const tourSnap = await getDoc(tourDoc);
    const currentCount = tourSnap.data().registeredStudents || 0;
    await updateDoc(tourDoc, {
      registeredStudents: currentCount + 1,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error registering for tour:", error);
    throw error;
  }
};

/**
 * Simple register function - minimal parameters
 * @param {string} tourId - Tour ID
 * @param {string} userId - Student user ID
 * @returns {Promise<string>} Registration document ID
 */
export const register = async (tourId, userId) => {
  try {
    const registrationCollection = collection(
      db,
      "tours",
      tourId,
      "registrations"
    );
    const docRef = await addDoc(registrationCollection, {
      userId,
      registeredAt: serverTimestamp(),
      paymentStatus: "Pending",
    });
    
    // Update tour registered students count
    const tourDoc = doc(db, "tours", tourId);
    const tourSnap = await getDoc(tourDoc);
    const currentCount = tourSnap.data().registeredStudents || 0;
    await updateDoc(tourDoc, {
      registeredStudents: currentCount + 1,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error registering for tour:", error);
    throw error;
  }
};

/**
 * Get registrations for a tour
 * @param {string} tourId - Tour ID
 * @returns {Promise<array>} Array of registration objects
 */
export const getTourRegistrations = async (tourId) => {
  try {
    const registrationsCollection = collection(
      db,
      "tours",
      tourId,
      "registrations"
    );
    const querySnapshot = await getDocs(registrationsCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error;
  }
};

/**
 * Check if student registered for a tour
 * @param {string} tourId - Tour ID
 * @param {string} userId - Student user ID
 * @returns {Promise<boolean>}
 */
export const isStudentRegistered = async (tourId, userId) => {
  try {
    const registrationsCollection = collection(
      db,
      "tours",
      tourId,
      "registrations"
    );
    const q = query(registrationsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking registration:", error);
    throw error;
  }
};

/**
 * VOTING MANAGEMENT
 */

/**
 * Add a voting place suggestion
 * @param {string} tourId - Tour ID
 * @param {string} userId - User ID
 * @param {object} placeData - Place information
 * @returns {Promise<string>} Document ID
 */
export const addVotingPlace = async (tourId, userId, placeData) => {
  try {
    const placesCollection = collection(db, "tours", tourId, "votingPlaces");
    const docRef = await addDoc(placesCollection, {
      ...placeData,
      suggestedBy: userId,
      votes: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding voting place:", error);
    throw error;
  }
};

/**
 * Get voting places for a tour
 * @param {string} tourId - Tour ID
 * @returns {Promise<array>} Array of voting places
 */
export const getVotingPlaces = async (tourId) => {
  try {
    const placesCollection = collection(db, "tours", tourId, "votingPlaces");
    const querySnapshot = await getDocs(placesCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching voting places:", error);
    throw error;
  }
};

/**
 * Vote for a place
 * @param {string} tourId - Tour ID
 * @param {string} placeId - Place ID
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const voteForPlace = async (tourId, placeId, userId) => {
  try {
    const placeDoc = doc(db, "tours", tourId, "votingPlaces", placeId);
    const placeSnap = await getDoc(placeDoc);
    
    if (placeSnap.exists()) {
      const currentVotes = placeSnap.data().votes || 0;
      
      // Add vote to subcollection
      const votesCollection = collection(placeDoc, "votes");
      await addDoc(votesCollection, {
        userId,
        votedAt: serverTimestamp(),
      });

      // Update vote count
      await updateDoc(placeDoc, {
        votes: currentVotes + 1,
      });
    }
  } catch (error) {
    console.error("Error voting for place:", error);
    throw error;
  }
};

/**
 * Check if user voted for a place
 * @param {string} tourId - Tour ID
 * @param {string} placeId - Place ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const hasUserVoted = async (tourId, placeId, userId) => {
  try {
    const votesCollection = collection(
      db,
      "tours",
      tourId,
      "votingPlaces",
      placeId,
      "votes"
    );
    const q = query(votesCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking vote:", error);
    throw error;
  }
};

/**
 * SEATING PLAN MANAGEMENT
 */

/**
 * Add seating assignment
 * @param {string} tourId - Tour ID
 * @param {string} userId - Student user ID
 * @param {object} seatData - Seat information
 * @returns {Promise<string>} Document ID
 */
export const addSeatingAssignment = async (tourId, userId, seatData) => {
  try {
    const seatingCollection = collection(db, "tours", tourId, "seatingPlan");
    const docRef = await addDoc(seatingCollection, {
      userId,
      ...seatData,
      assignedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding seating assignment:", error);
    throw error;
  }
};

/**
 * Get seating plan for a tour
 * @param {string} tourId - Tour ID
 * @returns {Promise<array>} Array of seating assignments
 */
export const getSeatingPlan = async (tourId) => {
  try {
    const seatingCollection = collection(db, "tours", tourId, "seatingPlan");
    const querySnapshot = await getDocs(seatingCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching seating plan:", error);
    throw error;
  }
};

/**
 * Update seating assignment
 * @param {string} tourId - Tour ID
 * @param {string} seatId - Seating assignment ID
 * @param {object} updateData - Data to update
 * @returns {Promise}
 */
export const updateSeatingAssignment = async (tourId, seatId, updateData) => {
  try {
    const seatDoc = doc(db, "tours", tourId, "seatingPlan", seatId);
    await updateDoc(seatDoc, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating seating assignment:", error);
    throw error;
  }
};

/**
 * GROUPING MANAGEMENT
 */

/**
 * Create a group
 * @param {string} tourId - Tour ID
 * @param {object} groupData - Group information
 * @returns {Promise<string>} Group ID
 */
export const createGroup = async (tourId, groupData) => {
  try {
    const groupsCollection = collection(db, "tours", tourId, "groups");
    const docRef = await addDoc(groupsCollection, {
      ...groupData,
      createdAt: serverTimestamp(),
      members: [],
      memberCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

/**
 * Get all groups for a tour
 * @param {string} tourId - Tour ID
 * @returns {Promise<array>} Array of group objects
 */
export const getGroups = async (tourId) => {
  try {
    const groupsCollection = collection(db, "tours", tourId, "groups");
    const querySnapshot = await getDocs(groupsCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

/**
 * Add member to group
 * @param {string} tourId - Tour ID
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID
 * @param {object} memberData - Member information
 * @returns {Promise}
 */
export const addGroupMember = async (tourId, groupId, userId, memberData) => {
  try {
    const groupDoc = doc(db, "tours", tourId, "groups", groupId);
    const groupSnap = await getDoc(groupDoc);
    
    if (groupSnap.exists()) {
      const members = groupSnap.data().members || [];
      
      // Add member to subcollection
      const membersCollection = collection(groupDoc, "members");
      await addDoc(membersCollection, {
        userId,
        ...memberData,
        joinedAt: serverTimestamp(),
      });

      // Update group members list and count
      await updateDoc(groupDoc, {
        members: [...members, userId],
        memberCount: members.length + 1,
      });
    }
  } catch (error) {
    console.error("Error adding group member:", error);
    throw error;
  }
};

/**
 * Get group members
 * @param {string} tourId - Tour ID
 * @param {string} groupId - Group ID
 * @returns {Promise<array>} Array of group members
 */
export const getGroupMembers = async (tourId, groupId) => {
  try {
    const membersCollection = collection(
      db,
      "tours",
      tourId,
      "groups",
      groupId,
      "members"
    );
    const querySnapshot = await getDocs(membersCollection);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching group members:", error);
    throw error;
  }
};

/**
 * Remove member from group
 * @param {string} tourId - Tour ID
 * @param {string} groupId - Group ID
 * @param {string} memberId - Member document ID
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const removeGroupMember = async (tourId, groupId, memberId, userId) => {
  try {
    // Delete from members subcollection
    await deleteDoc(doc(db, "tours", tourId, "groups", groupId, "members", memberId));

    // Update group member list
    const groupDoc = doc(db, "tours", tourId, "groups", groupId);
    const groupSnap = await getDoc(groupDoc);
    const members = (groupSnap.data().members || []).filter(id => id !== userId);
    
    await updateDoc(groupDoc, {
      members,
      memberCount: members.length,
    });
  } catch (error) {
    console.error("Error removing group member:", error);
    throw error;
  }
};
