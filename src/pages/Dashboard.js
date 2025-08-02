import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CreateClass from "./CreateClass";
import JoinClass from "./JoinClass";
import ClassList from "../components/ClassList";
import { 
	AcademicCapIcon, 
	UserGroupIcon, 
	ArrowRightOnRectangleIcon,
	PlusIcon,
	UserPlusIcon
} from "@heroicons/react/24/outline";

function Dashboard() {
	const { user, logout } = useAuth();
	const [userRole, setUserRole] = useState(null);
	const [userClasses, setUserClasses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showCreateClass, setShowCreateClass] = useState(false);
	const [showJoinClass, setShowJoinClass] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUserData = async () => {
			if (user) {
				try {
					const userDoc = await getDoc(doc(db, "usuarios", user.uid));
					if (userDoc.exists()) {
						const userData = userDoc.data();
						setUserRole(userData.role);
						
						// Obtener clases del usuario
						const classesQuery = userData.role === "maestro" 
							? query(collection(db, "clases"), where("maestroId", "==", user.uid))
							: query(collection(db, "inscripciones"), where("alumnoId", "==", user.uid));
						
						const classesSnapshot = await getDocs(classesQuery);
						const classes = [];
						
						if (userData.role === "maestro") {
							classesSnapshot.forEach(doc => {
								classes.push({ id: doc.id, ...doc.data() });
							});
						} else {
							// Para alumnos, obtener detalles de las clases
							for (const inscripcion of classesSnapshot.docs) {
								const claseDoc = await getDoc(doc(db, "clases", inscripcion.data().claseId));
								if (claseDoc.exists()) {
									classes.push({ id: claseDoc.id, ...claseDoc.data() });
								}
							}
						}
						
						setUserClasses(classes);
					}
				} catch (error) {
					console.error("Error fetching user data:", error);
				}
				setLoading(false);
			}
		};

		fetchUserData();
	}, [user]);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	if (loading) {
		return <div className="loading">Cargando...</div>;
	}

	return (
		<div className="dashboard">
			<header className="dashboard-header">
				<div className="header-left">
					<AcademicCapIcon className="header-icon" />
					<h1>Elihudroom</h1>
				</div>
				<div className="user-info">
					<span>Hola, {user?.email}</span>
					<span className="role-badge">
						{userRole === "maestro" ? (
							<>
								<UserGroupIcon className="role-icon" />
								Maestro
							</>
						) : (
							<>
								<AcademicCapIcon className="role-icon" />
								Alumno
							</>
						)}
					</span>
					<button onClick={handleLogout} className="logout-btn">
						<ArrowRightOnRectangleIcon className="logout-icon" />
						Cerrar sesión
					</button>
				</div>
			</header>

			<main className="dashboard-main">
				<div className="dashboard-actions">
					{userRole === "maestro" ? (
						<button 
							onClick={() => setShowCreateClass(true)}
							className="btn-primary"
						>
							<PlusIcon className="btn-icon" />
							Crear nueva clase
						</button>
					) : (
						<button 
							onClick={() => setShowJoinClass(true)}
							className="btn-primary"
						>
							<UserPlusIcon className="btn-icon" />
							Unirse a una clase
						</button>
					)}
				</div>

				<div className="classes-section">
					<h2>Mis Clases</h2>
					{userClasses.length === 0 ? (
						<p className="no-classes">
							{userRole === "maestro" 
								? "No has creado ninguna clase aún." 
								: "No te has unido a ninguna clase aún."
							}
						</p>
					) : (
						<ClassList classes={userClasses} userRole={userRole} />
					)}
				</div>
			</main>

			{showCreateClass && (
				<CreateClass 
					onClose={() => setShowCreateClass(false)}
					onClassCreated={(newClass) => {
						setUserClasses([...userClasses, newClass]);
						setShowCreateClass(false);
					}}
				/>
			)}

			{showJoinClass && (
				<JoinClass 
					onClose={() => setShowJoinClass(false)}
					onClassJoined={(newClass) => {
						setUserClasses([...userClasses, newClass]);
						setShowJoinClass(false);
					}}
				/>
			)}
		</div>
	);
}

export default Dashboard; 