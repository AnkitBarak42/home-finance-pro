"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, collection, addDoc, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from "@/utils/format";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { name, email, familyId, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Create a brand-new family workspace and seed default data
  async function signUpCreateFamily({ name, email, password, familyName }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const familyId = cred.user.uid.slice(0, 8) + Math.random().toString(36).slice(2, 6);

    await setDoc(doc(db, "families", familyId), {
      name: familyName || "Our Family",
      createdAt: serverTimestamp(),
      createdBy: cred.user.uid,
    });

    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, familyId, role: "Admin",
    });

    await setDoc(doc(db, "families", familyId, "members", cred.user.uid), {
      name, role: "Admin", email, joinedAt: serverTimestamp(),
    });

    for (const c of DEFAULT_CATEGORIES) {
      const { children, ...parentPayload } = c;
      const parentRef = await addDoc(collection(db, "families", familyId, "categories"), parentPayload);
      if (children?.length) {
        for (const child of children) {
          await addDoc(collection(db, "families", familyId, "categories"), {
            ...child, type: parentPayload.type, budget: 0, parentId: parentRef.id,
          });
        }
      }
    }
    for (const a of DEFAULT_ACCOUNTS) {
      await addDoc(collection(db, "families", familyId, "accounts"), a);
    }

    setProfile({ name, email, familyId, role: "Admin" });
    return familyId;
  }

  // Join an existing family using its invite code (familyId)
  async function signUpJoinFamily({ name, email, password, familyId }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const familySnap = await getDoc(doc(db, "families", familyId));
    if (!familySnap.exists()) {
      await cred.user.delete();
      throw new Error("Family code not found. Check the code and try again.");
    }

    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, familyId, role: "Member",
    });
    await setDoc(doc(db, "families", familyId, "members", cred.user.uid), {
      name, role: "Member", email, joinedAt: serverTimestamp(),
    });

    setProfile({ name, email, familyId, role: "Member" });
  }

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUpCreateFamily, signUpJoinFamily, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
