import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { XMarkIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

function CreateClass({ onClose, onClassCreated }) {
	const { user } = useAuth();
	const [className, setClassName] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const generateClassCode = () => {
		return Math.random().toString(36).substring(2, 8).toUpperCase();
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const classCode = generateClassCode();
			const newClass = {
				nombre: className,
				descripcion: description,
				codigo: classCode,
				maestroId: user.uid,
				maestroName: user.name,
				fechaCreacion: new Date(),
				alumnos: []
			};

			const docRef = await addDoc(collection(db, "clases"), newClass);
			const createdClass = { id: docRef.id, ...newClass };
			
			onClassCreated(createdClass);
		} catch (error) {
			console.error("Error creating class:", error);
			alert("Error al crear la clase: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal fade-in">
				<div className="modal-header">
					<h2>
						<AcademicCapIcon className="modal-icon" />
						Crear Nueva Clase
					</h2>
					<button onClick={onClose} className="close-btn">
						<XMarkIcon className="close-icon" />
					</button>
				</div>
				
				<form onSubmit={handleSubmit} className="create-class-form">
					<div className="form-group">
						<label htmlFor="className">Nombre de la clase:</label>
						<input
							type="text"
							id="className"
							value={className}
							onChange={(e) => setClassName(e.target.value)}
							required
							placeholder="Ej: Matemáticas 101"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="description">Descripción:</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Describe el contenido de la clase..."
							rows="3"
						/>
					</div>

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
							{loading ? "Creando..." : "Crear Clase"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default CreateClass; 