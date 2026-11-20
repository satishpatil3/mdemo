import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

import { db } from "../firebase/firebase";

// Helper to normalize email to lowercase
export const normalizeEmail = (email) => {
  return email ? email.trim().toLowerCase() : "";
};

// Create a new user (admin pre-adds a user: defaults to plus, marked as pending signup)
export const createUser = async ({ name, email, role = "plus" }) => {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    throw new Error("Email is required");
  }

  // Check if user with this email already exists in Firestore
  const q = query(
    collection(db, "users"),
    where("email", "==", cleanEmail)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error(`User with email "${cleanEmail}" already exists`);
  }

  return addDoc(collection(db, "users"), {
    name: name?.trim() || cleanEmail.split("@")[0],
    email: cleanEmail,
    role: role || "plus", // Default role is plus
    isSignedUp: false, // Added by admin; has not signed up yet
    status: "pending_signup",
    source: "admin",
    createdAt: new Date().toISOString()
  });
};

// Get all users from Firestore (deduplicates by email)
export const getAllUsers = async () => {
  const q = query(collection(db, "users"));
  const querySnapshot = await getDocs(q);
  const users = [];
  const seenEmails = new Set();

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const cleanEmail = data.email ? normalizeEmail(data.email) : docSnap.id;

    // Check if user has actually completed signup
    const isSignedUp =
      data.isSignedUp === true ||
      (data.isSignedUp === undefined && data.source !== "admin" && data.status !== "pending_signup");

    // Prevent displaying duplicate records for the same email
    if (!seenEmails.has(cleanEmail)) {
      seenEmails.add(cleanEmail);
      users.push({
        id: docSnap.id,
        name: data.name || (data.email ? data.email.split("@")[0] : "User"),
        email: data.email || "No email",
        role: data.role || "plus",
        isSignedUp: isSignedUp,
        status: isSignedUp ? "signed_up" : "pending_signup",
        source: data.source || (isSignedUp ? "signup" : "admin"),
        createdAt: data.createdAt || ""
      });
    }
  });

  return users;
};

// Change user role by email to plus, pro, or admin (ONLY signed-up users can be edited; caller cannot demote themselves)
export const updateUserRoleByEmail = async (email, newRole, callerEmail = "") => {
  const cleanEmail = normalizeEmail(email);
  const cleanCaller = normalizeEmail(callerEmail);

  if (!cleanEmail) {
    throw new Error("Please enter a valid email address");
  }

  // Self-action protection: an admin cannot change their own access level
  if (cleanCaller && cleanEmail === cleanCaller) {
    throw new Error("You cannot change your own access level to prevent locking yourself out.");
  }

  const q = query(
    collection(db, "users"),
    where("email", "==", cleanEmail)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error(`No user found with email "${cleanEmail}" in database`);
  }

  // Verify that the user has completed signup
  const firstDoc = querySnapshot.docs[0].data();

  const isSignedUp =
    firstDoc.isSignedUp === true ||
    (firstDoc.isSignedUp === undefined && firstDoc.source !== "admin" && firstDoc.status !== "pending_signup");

  if (!isSignedUp) {
    throw new Error(
      `Cannot edit role: User "${cleanEmail}" is Signup Pending. Only signed-up users can have their roles edited.`
    );
  }

  let isFirst = true;
  for (const docSnap of querySnapshot.docs) {
    if (isFirst) {
      const userDocRef = doc(db, "users", docSnap.id);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      isFirst = false;
    } else {
      // Clean up any redundant duplicate doc found in database
      await deleteDoc(doc(db, "users", docSnap.id));
    }
  }

  return true;
};

// Delete user by doc id
export const deleteUser = async (userId) => {
  const userDocRef = doc(db, "users", userId);
  return deleteDoc(userDocRef);
};
