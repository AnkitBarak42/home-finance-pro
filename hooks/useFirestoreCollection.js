"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Subscribes in realtime to families/{familyId}/{sub} and keeps state in sync.
 * Any teammate's change (add/edit/delete) reflects instantly for everyone.
 */
export function useFirestoreCollection(familyId, sub, orderField) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;
    const ref = collection(db, "families", familyId, sub);
    const q = orderField ? query(ref, orderBy(orderField, "desc")) : ref;

    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(`Realtime sync error on ${sub}:`, err);
      setLoading(false);
    });

    return unsub;
  }, [familyId, sub, orderField]);

  return { data, loading };
}
