import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "./firebaseConfig";
import { getAuth } from "firebase/auth";

const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence
setPersistence(auth, browserLocalPersistence);

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role ('student' or 'admin')
 * @param {object} userData - Additional user data (name, etc.)
 * @returns {Promise} User credential
 */
export const registerUser = async (email, password, role, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      role: role,
      ...userData,
      createdAt: new Date(),
    });

    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} User credential
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user
 * @returns {object} Current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get user role from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<string>} User role
 */
export const getUserRole = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data().role;
    }
    // Return null if document doesn't exist
    console.warn("User document not found for UID:", uid);
    return null;
  } catch (error) {
    // Log the error but don't throw - allow login to proceed
    console.error("Error fetching user role:", error.message);
    // If it's a permission error, the user might not have data yet
    return null;
  }
};

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<object>} User data
 */
export const getUserData = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

/**
 * Listen to authentication state changes
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChangeListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db };
