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

// Firebase Auth only speaks "email" natively, so a username is turned into a
// deterministic fake email behind the scenes (e.g. "monu" -> "monu@homefinancepro.local").
// The person never sees or types an email anywhere in the app.
function usernameToEmail(username) {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, "");
  return `${clean}@homefinancepro.local`;
}

function friendlyAuthError(err, context) {
  const code = err?.code || "";
  if (code === "auth/email-already-in-use") return "That username is already taken — pick another.";
  if (code === "auth/user-not-found") return "No account found with that username.";
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") return "Incorrect username or password.";
  if (code === "auth/weak-password") return "Password should be at least 6 characters.";
  if (code === "auth/invalid-email") return "Username can only contain letters, numbers, dots and underscores.";
  return err?.message?.replace("Firebase: ", "") || `Something went wrong${context ? " while " + context : ""}.`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { name, username, familyId, role }
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
  async function signUpCreateFamily({ name, username, password, familyName }) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
      const familyId = cred.user.uid.slice(0, 8) + Math.random().toString(36).slice(2, 6);

      await setDoc(doc(db, "families", familyId), {
        name: familyName || "Our Family",
        createdAt: serverTimestamp(),
        createdBy: cred.user.uid,
      });

      await setDoc(doc(db, "users", cred.user.uid), {
        name, username: username.trim(), familyId, role: "Admin",
      });

      await setDoc(doc(db, "families", familyId, "members", cred.user.uid), {
        name, role: "Admin", username: username.trim(), joinedAt: serverTimestamp(),
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

      setProfile({ name, username: username.trim(), familyId, role: "Admin" });
      return familyId;
    } catch (err) {
      throw new Error(friendlyAuthError(err, "creating your family"));
    }
  }

  // Join an existing family using its invite code (familyId)
  async function signUpJoinFamily({ name, username, password, familyId }) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);

      const familySnap = await getDoc(doc(db, "families", familyId));
      if (!familySnap.exists()) {
        await cred.user.delete();
        throw new Error("Family code not found. Check the code and try again.");
      }

      await setDoc(doc(db, "users", cred.user.uid), {
        name, username: username.trim(), familyId, role: "Member",
      });
      await setDoc(doc(db, "families", familyId, "members", cred.user.uid), {
        name, role: "Member", username: username.trim(), joinedAt: serverTimestamp(),
      });

      setProfile({ name, username: username.trim(), familyId, role: "Member" });
    } catch (err) {
      if (err.message?.includes("Family code not found")) throw err;
      throw new Error(friendlyAuthError(err, "joining the family"));
    }
  }

  async function login(username, password) {
    try {
      await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
    } catch (err) {
      throw new Error(friendlyAuthError(err, "logging in"));
    }
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
