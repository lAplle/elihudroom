import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { XMarkIcon, UserPlusIcon } from "@heroicons/react/24/outline";

function JoinClass({ onClose, onClassJoined }) {
	const { user } = useAuth();
	const [classCode, setClassCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Buscar la clase por código
			const classQuery = query(collection(db, "clases"), where("codigo", "==", classCode.toUpperCase()));
			const classSnapshot = await getDocs(classQuery);

			if (classSnapshot.empty) {
				setError("No se encontró una clase con ese código.");
				return;
			}

			const classDoc = classSnapshot.docs[0];
			const classData = classDoc.data();

			// Verificar si el alumno ya está inscrito
			const enrollmentQuery = query(
				collection(db, "inscripciones"), 
				where("claseId", "==", classDoc.id),
				where("alumnoId", "==", user.uid)
			);
			const enrollmentSnapshot = await getDocs(enrollmentQuery);

			if (!enrollmentSnapshot.empty) {
				setError("Ya estás inscrito en esta clase.");
				return;
			}

			// Crear la inscripción
			await addDoc(collection(db, "inscripciones"), {
				claseId: classDoc.id,
				alumnoId: user.uid,
				alumnoEmail: user.email,
				fechaInscripcion: new Date()
			});

			// Actualizar la lista de alumnos en la clase
			await updateDoc(doc(db, "clases", classDoc.id), {
				alumnos: arrayUnion({
					id: user.uid,
					email: user.email,
					fechaInscripcion: new Date()
				})
			});

			// Llamar al callback con la clase unida
			onClassJoined({ id: classDoc.id, ...classData });
			
		} catch (error) {
			console.error("Error joining class:", error);
			setError("Error al unirse a la clase: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal">
				<div className="modal-header">
					<h2>
						<UserPlusIcon className="modal-icon" />
						Unirse a una Clase
					</h2>
					<button onClick={onClose} className="close-btn">
						<XMarkIcon className="close-icon" />
					</button>
				</div>
				
				<form onSubmit={handleSubmit} className="join-class-form">
					<div className="form-group">
						<label htmlFor="classCode">Código de la clase:</label>
						<input
							type="text"
							id="classCode"
							value={classCode}
							onChange={(e) => setClassCode(e.target.value)}
							required
							placeholder="Ingresa el código de la clase"
							maxLength="6"
							style={{ textTransform: 'uppercase' }}
						/>
						<small>El código debe tener 6 caracteres</small>
					</div>

					{error && <div className="error-message">{error}</div>}

					<div className="form-actions">
						<button 
							type="button" 
							onClick={onClose}
							className="btn-secondary"
							disabled={loading}
						>
							Cancelar
						</button>
						<button 
							type="submit" 
							className="btn-primary"
							disabled={loading}
						>
							{loading ? "Uniéndose..." : "Unirse a la Clase"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default JoinClass; 