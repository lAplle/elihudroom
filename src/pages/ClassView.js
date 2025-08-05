import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import CreatePost from "../components/CreatePost";
import PostList from "../components/PostList";
import { 
	ArrowLeftIcon, 
	PlusIcon,
	UserGroupIcon,
	AcademicCapIcon,
	DocumentTextIcon,
	ClipboardDocumentIcon
} from "@heroicons/react/24/outline";

function ClassView() {
	const { classId } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();
	
	const [classData, setClassData] = useState(null);
	const [posts, setPosts] = useState([]);
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showCreatePost, setShowCreatePost] = useState(false);
	const [copiedCode, setCopiedCode] = useState(false);

	useEffect(() => {
		const fetchClassData = async () => {
			try {
				// Obtener datos de la clase
				const classDoc = await getDoc(doc(db, "clases", classId));
				if (!classDoc.exists()) {
					alert("La clase no existe");
					navigate("/dashboard");
					return;
				}

				const data = classDoc.data();
				setClassData({ id: classDoc.id, ...data });

				// Determinar el rol del usuario en esta clase
				if (data.maestroId === user.uid) {
					setUserRole("maestro");
				} else {
					// Verificar si es alumno
					const isAlumno = data.alumnos?.some(alumno => alumno.id === user.uid);
					if (isAlumno) {
						setUserRole("alumno");
					} else {
						alert("No tienes acceso a esta clase");
						navigate("/dashboard");
						return;
					}
				}

				// Suscribirse a las publicaciones en tiempo real
				const postsQuery = query(
					collection(db, "clases", classId, "publicaciones"),
					orderBy("fechaCreacion", "desc")
				);

				const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
					const postsData = [];
					snapshot.forEach(doc => {
						postsData.push({ id: doc.id, ...doc.data() });
					});
					setPosts(postsData);
				});

				return unsubscribe;
			} catch (error) {
				console.error("Error fetching class data:", error);
				alert("Error al cargar la clase");
				navigate("/dashboard");
			} finally {
				setLoading(false);
			}
		};

		fetchClassData();
	}, [classId, user.uid, navigate]);

	const handlePostCreated = (newPost) => {
		setShowCreatePost(false);
		// La lista se actualizará automáticamente gracias al listener en tiempo real
	};

	const copyClassCode = async () => {
		try {
			await navigator.clipboard.writeText(classData.codigo);
			setCopiedCode(true);
			setTimeout(() => setCopiedCode(false), 2000); // Ocultar después de 2 segundos
		} catch (error) {
			console.error("Error copying to clipboard:", error);
			// Fallback para navegadores que no soportan clipboard API
			const textArea = document.createElement("textarea");
			textArea.value = classData.codigo;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			setCopiedCode(true);
			setTimeout(() => setCopiedCode(false), 2000); // Ocultar después de 2 segundos
		}
	};

	if (loading) {
		return (
			<div className="loading-container">
				<div className="loading-spinner">
					<div className="spinner-ring"></div>
					<div className="spinner-logo">
						<AcademicCapIcon className="spinner-icon" />
					</div>
				</div>
				<div className="loading-text">Cargando clase...</div>
			</div>
		);
	}

	if (!classData) {
		return <div>Clase no encontrada</div>;
	}

	return (
		<div className="class-view">
			<header className="class-header">
				<button onClick={() => navigate("/dashboard")} className="back-btn">
					<ArrowLeftIcon className="back-icon" />
					Volver al Dashboard
				</button>
				<div className="class-info">
					<h1>{classData.nombre}</h1>
					<div className="class-code-container">
						<p className="class-code">Código: {classData.codigo}</p>
						<div className="copy-code-wrapper">
							<button 
								onClick={copyClassCode}
								className={`copy-code-btn ${copiedCode ? 'copied' : ''}`}
								title="Copiar código al portapapeles"
							>
								<ClipboardDocumentIcon className="copy-icon" />
							</button>
							{copiedCode && (
								<span className="copy-feedback">¡Copiado!</span>
							)}
						</div>
					</div>
					<p className="class-description">{classData.descripcion}</p>
					<div className="class-stats">
						<span>
							<UserGroupIcon className="stat-icon" />
							Maestro: {classData.maestroName}
						</span>
						<span>
							<AcademicCapIcon className="stat-icon" />
							Alumnos: {classData.alumnos?.length || 0}
						</span>
					</div>
				</div>
			</header>

			<main className="class-main">
				<div className="class-actions">
					{userRole === "maestro" && (
						<button 
							onClick={() => setShowCreatePost(true)}
							className="btn-primary"
						>
							<PlusIcon className="btn-icon" />
							Crear Publicación
						</button>
					)}
				</div>

				<div className="posts-section">
					<h2>
						<DocumentTextIcon className="section-icon" />
						Publicaciones
					</h2>
					{posts.length === 0 ? (
						<p className="no-posts">
							{userRole === "maestro" 
								? "No hay publicaciones aún. ¡Crea la primera!" 
								: "No hay publicaciones en esta clase."
							}
						</p>
					) : (
						<PostList 
							posts={posts} 
							userRole={userRole} 
							classId={classId}
							onPostUpdated={() => {
								// La lista se actualizará automáticamente gracias al listener en tiempo real
							}}
							onPostDeleted={() => {
								// La lista se actualizará automáticamente gracias al listener en tiempo real
							}}
						/>
					)}
				</div>
			</main>

			{showCreatePost && (
				<CreatePost 
					classId={classId}
					onClose={() => setShowCreatePost(false)}
					onPostCreated={handlePostCreated}
				/>
			)}
		</div>
	);
}

export default ClassView; 