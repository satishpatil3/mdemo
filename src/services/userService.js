import {
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export const createUser = async (
  name,
  email,
  role
) => {

  const q = query(
    collection(db, "users"),
    where("email", "==", email)
  );

  const querySnapshot =
    await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error(
      "User email already exists"
    );
  }

  return addDoc(
    collection(db, "users"),
    {
      name,
      email,
      role,
      createdAt: new Date(),
    }
  );
};