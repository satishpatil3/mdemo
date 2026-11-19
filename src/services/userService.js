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

// Create a new user (defaults to plus, prevents duplicate emails)
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

    // Prevent displaying duplicate records for the same email
    if (!seenEmails.has(cleanEmail)) {
      seenEmails.add(cleanEmail);
      users.push({
        id: docSnap.id,
        name: data.name || (data.email ? data.email.split("@")[0] : "User"),
        email: data.email || "No email",
        role: data.role || "plus",
        createdAt: data.createdAt || ""
      });
    }
  });

  return users;
};

// Change user role by email to plus or pro
export const updateUserRoleByEmail = async (email, newRole) => {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    throw new Error("Please enter a valid email address");
  }

  const q = query(
    collection(db, "users"),
    where("email", "==", cleanEmail)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error(`No user found with email "${cleanEmail}" in database`);
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
