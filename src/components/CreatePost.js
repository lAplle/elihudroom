import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { 
	XMarkIcon, 
	DocumentTextIcon, 
	PhotoIcon, 
	DocumentIcon,
	PaperAirplaneIcon
} from "@heroicons/react/24/outline";

function CreatePost({ classId, onClose, onPostCreated }) {
	const { user } = useAuth();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [files, setFiles] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		
		// Validar número máximo de archivos
		if (files.length + selectedFiles.length > 5) {
			alert("Puedes subir máximo 5 archivos por publicación.");
			return;
		}
		
		// Validar tipos de archivo permitidos
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
		const validFiles = selectedFiles.filter(file => {
			if (!allowedTypes.includes(file.type)) {
				alert(`Tipo de archivo no permitido: ${file.name}. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y PDFs.`);
				return false;
			}
			if (file.size > 1024 * 1024) { // 1MB límite para Base64
				alert(`Archivo demasiado grande: ${file.name}. El tamaño máximo es 1MB.`);
				return false;
			}
			return true;
		});
		
		setFiles(prevFiles => [...prevFiles, ...validFiles]);
	};

	const convertFileToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = error => reject(error);
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!title.trim()) {
			alert("Por favor ingresa un título para la publicación.");
			return;
		}
		
		if (!content.trim()) {
			alert("Por favor ingresa contenido para la publicación.");
			return;
		}
		
		setUploading(true);
		setUploadProgress(0);

		try {
			// Convertir archivos a Base64
			const fileData = [];
			if (files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					try {
						const base64Data = await convertFileToBase64(files[i]);
						fileData.push({
							name: files[i].name,
							data: base64Data,
							type: files[i].type,
							size: files[i].size
						});
						setUploadProgress(((i + 1) / files.length) * 100);
					} catch (convertError) {
						console.error(`Error converting ${files[i].name}:`, convertError);
						alert(`Error al procesar ${files[i].name}: ${convertError.message}`);
						setUploading(false);
						setUploadProgress(0);
						return;
					}
				}
			}

			// Crear la publicación
			const postData = {
				titulo: title.trim(),
				contenido: content.trim(),
				archivos: fileData,
				maestroId: user.uid,
				maestroName: user.name,
				fechaCreacion: new Date()
			};

			await addDoc(collection(db, "clases", classId, "publicaciones"), postData);
			
			// Limpiar formulario
			setTitle("");
			setContent("");
			setFiles([]);
			
			onPostCreated();
		} catch (error) {
			console.error("Error creating post:", error);
			alert("Error al crear la publicación: " + error.message);
		} finally {
			setUploading(false);
			setUploadProgress(0);
		}
	};

	const removeFile = (index) => {
		setFiles(files.filter((_, i) => i !== index));
	};

	const getFileIcon = (file) => {
		if (file.type.startsWith('image/')) return <PhotoIcon className="file-type-icon" />;
		if (file.type === 'application/pdf') return <DocumentIcon className="file-type-icon" />;
		return <DocumentTextIcon className="file-type-icon" />;
	};

	return (
		<div className="modal-overlay">
			<div className="modal create-post-modal">
				<div className="modal-header">
					<h2>
						<DocumentTextIcon className="modal-icon" />
						Crear Nueva Publicación
					</h2>
					<button onClick={onClose} className="close-btn">
						<XMarkIcon className="close-icon" />
					</button>
				</div>
				
				<form onSubmit={handleSubmit} className="create-post-form">
					<div className="form-group">
						<label htmlFor="title">Título:</label>
						<input
							type="text"
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							placeholder="Título de la publicación"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="content">Contenido:</label>
						<textarea
							id="content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Escribe el contenido de tu publicación..."
							rows="6"
							required
						/>
						<small className="form-help-text">
							💡 Los enlaces (URLs) y correos electrónicos se convertirán automáticamente en links clickeables para tus alumnos
						</small>
					</div>

					<div className="form-group">
						<label htmlFor="files">Archivos adjuntos:</label>
						<input
							type="file"
							id="files"
							onChange={handleFileChange}
							multiple
							accept=".pdf,.jpg,.jpeg,.png,.gif"
						/>
						<small>Puedes subir PDFs e imágenes (máximo 5 archivos, 1MB cada uno)</small>
					</div>

					{files.length > 0 && (
						<div className="selected-files">
							<h4>Archivos seleccionados:</h4>
							{files.map((file, index) => (
								<div key={index} className="file-item">
									<span>{getFileIcon(file)} {file.name}</span>
									<button 
										type="button" 
										onClick={() => removeFile(index)}
										className="remove-file-btn"
									>
										<XMarkIcon className="remove-icon" />
									</button>
								</div>
							))}
						</div>
					)}

					{uploading && (
						<div className="upload-progress">
							<p>Procesando archivos... {Math.round(uploadProgress)}%</p>
							<div className="progress-bar">
								<div 
									className="progress-fill" 
									style={{ width: `${uploadProgress}%` }}
								></div>
							</div>
						</div>
					)}

					<div className="form-actions">
						<button 
							type="button" 
							onClick={onClose}
							className="btn-secondary"
							disabled={uploading}
						>
							Cancelar
						</button>
						<button 
							type="submit" 
							className="btn-primary"
							disabled={uploading}
						>
							<PaperAirplaneIcon className="btn-icon" />
							{uploading ? "Creando..." : "Crear Publicación"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default CreatePost; 