import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				try {
					// Obtener datos adicionales del usuario desde Firestore
					const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));
					if (userDoc.exists()) {
						const userDataFromFirestore = userDoc.data();
						setUserData({
							...firebaseUser,
							...userDataFromFirestore
						});
					} else {
						setUserData(firebaseUser);
					}
				} catch (error) {
					console.error("Error fetching user data:", error);
					setUserData(firebaseUser);
				}
			} else {
				setUserData(null);
			}
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	const logout = () => signOut(auth);

	return (
		<AuthContext.Provider value={{ user: userData, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};
