import React from "react";
import { useNavigate } from "react-router-dom";

function ClassList({ classes, userRole }) {
	const navigate = useNavigate();

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

	return (
		<div className="class-list">
			{classes.map((classItem) => (
				<div key={classItem.id} className="class-card" onClick={() => handleClassClick(classItem.id)}>
					<div className="class-card-header">
						<h3>{classItem.nombre}</h3>
						<span className="class-code">{classItem.codigo}</span>
					</div>
					
					<div className="class-card-content">
						<p className="class-description">
							{classItem.descripcion || "Sin descripción"}
						</p>
						
						<div className="class-info">
							<div className="info-item">
								<strong>Maestro:</strong> {classItem.maestroEmail}
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
	);
}

export default ClassList; 