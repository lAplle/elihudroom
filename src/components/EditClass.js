import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { XMarkIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

function EditClass({ classData, onClose, onClassUpdated }) {
	const { user } = useAuth();
	const [nombre, setNombre] = useState(classData.nombre);
	const [descripcion, setDescripcion] = useState(classData.descripcion || "");
	const [updating, setUpdating] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!nombre.trim()) {
			alert("Por favor ingresa un nombre para la clase.");
			return;
		}

		setUpdating(true);

		try {
			const classRef = doc(db, "clases", classData.id);
			await updateDoc(classRef, {
				nombre: nombre.trim(),
				descripcion: descripcion.trim(),
				fechaEdicion: new Date()
			});

			onClassUpdated({
				...classData,
				nombre: nombre.trim(),
				descripcion: descripcion.trim(),
				fechaEdicion: new Date()
			});
		} catch (error) {
			console.error("Error updating class:", error);
			alert("Error al actualizar la clase: " + error.message);
		} finally {
			setUpdating(false);
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal edit-class-modal">
				<div className="modal-header">
					<h2>
						<AcademicCapIcon className="modal-icon" />
						Editar Clase
					</h2>
					<button onClick={onClose} className="close-btn">
						<XMarkIcon className="close-icon" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="edit-class-form">
					<div className="form-group">
						<label htmlFor="edit-nombre">Nombre de la clase:</label>
						<input
							type="text"
							id="edit-nombre"
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
							required
							placeholder="Nombre de la clase"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="edit-descripcion">Descripción:</label>
						<textarea
							id="edit-descripcion"
							value={descripcion}
							onChange={(e) => setDescripcion(e.target.value)}
							placeholder="Descripción de la clase (opcional)"
							rows="4"
						/>
					</div>

					<div className="form-group">
						<label>Código de la clase:</label>
						<div className="code-display">
							<span className="class-code">{classData.codigo}</span>
							<small>El código no se puede cambiar</small>
						</div>
					</div>

					<div className="form-actions">
						<button
							type="button"
							onClick={onClose}
							className="btn-secondary"
							disabled={updating}
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="btn-primary"
							disabled={updating}
						>
							{updating ? "Actualizando..." : "Actualizar Clase"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default EditClass; 