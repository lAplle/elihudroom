import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import EditClass from "./EditClass";

function ClassList({ classes, userRole, onClassUpdated, onClassDeleted }) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [editingClass, setEditingClass] = useState(null);
	const [showEditModal, setShowEditModal] = useState(false);

	const handleClassClick = (classId) => {
		navigate(`/class/${classId}`);
	};

	const formatDate = (date) => {
		if (!date) return "";
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const canEditClass = (classItem) => {
		return user && classItem.maestroId === user.uid;
	};

	const handleEditClass = (classItem, e) => {
		e.stopPropagation();
		setEditingClass(classItem);
		setShowEditModal(true);
	};

	const handleDeleteClass = async (classItem, e) => {
		e.stopPropagation();
		if (window.confirm("¿Estás seguro de que quieres eliminar esta clase? Esta acción eliminará todas las publicaciones y no se puede deshacer.")) {
			try {
				// Eliminar todas las publicaciones de la clase
				const postsQuery = query(collection(db, "clases", classItem.id, "publicaciones"));
				const postsSnapshot = await getDocs(postsQuery);
				const deletePromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
				await Promise.all(deletePromises);

				// Eliminar todas las inscripciones de la clase
				const inscripcionesQuery = query(collection(db, "inscripciones"), where("claseId", "==", classItem.id));
				const inscripcionesSnapshot = await getDocs(inscripcionesQuery);
				const deleteInscripcionesPromises = inscripcionesSnapshot.docs.map(doc => deleteDoc(doc.ref));
				await Promise.all(deleteInscripcionesPromises);

				// Eliminar la clase
				await deleteDoc(doc(db, "clases", classItem.id));

				if (onClassDeleted) onClassDeleted(classItem.id);
			} catch (error) {
				console.error("Error deleting class:", error);
				alert("Error al eliminar la clase: " + error.message);
			}
		}
	};

	const handleClassUpdated = (updatedClass) => {
		setShowEditModal(false);
		setEditingClass(null);
		if (onClassUpdated) onClassUpdated(updatedClass);
	};

	return (
		<>
			<div className="class-list">
				{classes.map((classItem) => (
					<div key={classItem.id} className="class-card" onClick={() => handleClassClick(classItem.id)}>
						<div className="class-card-header">
							<div className="class-header-top">
								<h3>{classItem.nombre}</h3>
								{canEditClass(classItem) && (
									<div className="class-actions">
										<button
											onClick={(e) => handleEditClass(classItem, e)}
											className="edit-class-btn"
											title="Editar clase"
										>
											<PencilIcon className="action-icon" />
										</button>
										<button
											onClick={(e) => handleDeleteClass(classItem, e)}
											className="delete-class-btn"
											title="Eliminar clase"
										>
											<TrashIcon className="action-icon" />
										</button>
									</div>
								)}
							</div>
							<span className="class-code">{classItem.codigo}</span>
						</div>
					
					<div className="class-card-content">
						<p className="class-description">
							{classItem.descripcion || "Sin descripción"}
						</p>
						
						<div className="class-info">
							<div className="info-item">
								<strong>Maestro:</strong> {classItem.maestroName}
							</div>
							<div className="info-item">
								<strong>Creada:</strong> {formatDate(classItem.fechaCreacion)}
							</div>
							<div className="info-item">
								<strong>Alumnos:</strong> {classItem.alumnos?.length || 0}
							</div>
						</div>
					</div>
					
											<div className="class-card-footer">
							<button className="btn-view-class">
								{userRole === "maestro" ? "Gestionar Clase" : "Ver Clase"}
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Modal para editar clase */}
			{showEditModal && editingClass && (
				<EditClass
					classData={editingClass}
					onClose={() => setShowEditModal(false)}
					onClassUpdated={handleClassUpdated}
				/>
			)}
		</>
	);
}

export default ClassList; 