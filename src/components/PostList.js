import React, { useState } from "react";
import { 
	PhotoIcon, 
	DocumentIcon, 
	DocumentTextIcon,
	CalendarIcon,
	UserIcon,
	XMarkIcon,
	ArrowDownTrayIcon,
	PencilIcon,
	TrashIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

function PostList({ posts, userRole, classId, onPostUpdated, onPostDeleted }) {
	const { user } = useAuth();
	const [selectedFile, setSelectedFile] = useState(null);
	const [showFileModal, setShowFileModal] = useState(false);
	const [editingPost, setEditingPost] = useState(null);
	const [editTitle, setEditTitle] = useState("");
	const [editContent, setEditContent] = useState("");
	const [editFiles, setEditFiles] = useState([]);
	const [showEditModal, setShowEditModal] = useState(false);
	const formatDate = (date) => {
		if (!date) return "";
		const d = date.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const canEditPost = (post) => {
		return user && post.maestroId === user.uid;
	};

	const getFileIcon = (file) => {
		if (file.type.startsWith('image/')) return <PhotoIcon className="file-type-icon" />;
		if (file.type === 'application/pdf') return <DocumentIcon className="file-type-icon" />;
		return <DocumentTextIcon className="file-type-icon" />;
	};

	const handleFileClick = (file) => {
		setSelectedFile(file);
		setShowFileModal(true);
	};

	const closeFileModal = () => {
		setShowFileModal(false);
		setSelectedFile(null);
	};

	const downloadFile = (file) => {
		// Si el archivo tiene data (Base64), crear un blob y descargarlo
		if (file.data) {
			const byteString = atob(file.data.split(',')[1]);
			const mimeString = file.data.split(',')[0].split(':')[1].split(';')[0];
			const ab = new ArrayBuffer(byteString.length);
			const ia = new Uint8Array(ab);
			for (let i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}
			const blob = new Blob([ab], { type: mimeString });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = file.name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} else if (file.url) {
			// Fallback para archivos con URL (compatibilidad)
			window.open(file.url, '_blank');
		}
	};

	const handleEditPost = (post) => {
		setEditingPost(post);
		setEditTitle(post.titulo);
		setEditContent(post.contenido);
		setEditFiles(post.archivos || []);
		setShowEditModal(true);
	};

	const handleDeletePost = async (postId) => {
		if (window.confirm("¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.")) {
			try {
				await deleteDoc(doc(db, "clases", classId, "publicaciones", postId));
				if (onPostDeleted) onPostDeleted();
			} catch (error) {
				console.error("Error deleting post:", error);
				alert("Error al eliminar la publicación: " + error.message);
			}
		}
	};

	const handleEditFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		
		// Validar número máximo de archivos
		if (editFiles.length + selectedFiles.length > 5) {
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
		
		setEditFiles(prevFiles => [...prevFiles, ...validFiles]);
	};

	const convertFileToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = error => reject(error);
		});
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		
		if (!editTitle.trim()) {
			alert("Por favor ingresa un título para la publicación.");
			return;
		}
		
		if (!editContent.trim()) {
			alert("Por favor ingresa contenido para la publicación.");
			return;
		}

		try {
			// Convertir archivos nuevos a Base64
			const newFiles = editFiles.filter(file => !file.data && !file.url); // Solo archivos nuevos
			const existingFiles = editFiles.filter(file => file.data || file.url); // Archivos existentes
			
			const fileData = [...existingFiles];
			
			if (newFiles.length > 0) {
				for (let i = 0; i < newFiles.length; i++) {
					try {
						const base64Data = await convertFileToBase64(newFiles[i]);
						fileData.push({
							name: newFiles[i].name,
							data: base64Data,
							type: newFiles[i].type,
							size: newFiles[i].size
						});
					} catch (convertError) {
						console.error(`Error converting ${newFiles[i].name}:`, convertError);
						alert(`Error al procesar ${newFiles[i].name}: ${convertError.message}`);
						return;
					}
				}
			}

			// Actualizar la publicación
			const postRef = doc(db, "clases", classId, "publicaciones", editingPost.id);
			await updateDoc(postRef, {
				titulo: editTitle.trim(),
				contenido: editContent.trim(),
				archivos: fileData,
				fechaEdicion: new Date()
			});
			
			setShowEditModal(false);
			setEditingPost(null);
			setEditTitle("");
			setEditContent("");
			setEditFiles([]);
			
			if (onPostUpdated) onPostUpdated();
		} catch (error) {
			console.error("Error updating post:", error);
			alert("Error al actualizar la publicación: " + error.message);
		}
	};

	const removeEditFile = (index) => {
		setEditFiles(editFiles.filter((_, i) => i !== index));
	};

	const renderFilePreview = (file) => {
		if (file.type.startsWith('image/')) {
			// Mostrar imagen directamente
			return (
				<div className="file-preview image-preview" onClick={() => handleFileClick(file)}>
					<img 
						src={file.data || file.url} 
						alt={file.name}
						className="preview-image"
					/>
					<div className="preview-overlay">
						<span className="preview-filename">{file.name}</span>
					</div>
				</div>
			);
		} else if (file.type === 'application/pdf') {
			// Mostrar preview de PDF
			return (
				<div className="file-preview pdf-preview" onClick={() => handleFileClick(file)}>
					<div className="pdf-preview-content">
						<DocumentIcon className="pdf-preview-icon" />
						<span className="preview-filename">{file.name}</span>
						<span className="preview-size">{(file.size / 1024).toFixed(1)} KB</span>
					</div>
				</div>
			);
		} else {
			// Otros tipos de archivo
			return (
				<div className="file-preview other-preview" onClick={() => handleFileClick(file)}>
					<div className="other-preview-content">
						<DocumentTextIcon className="other-preview-icon" />
						<span className="preview-filename">{file.name}</span>
						<span className="preview-size">{(file.size / 1024).toFixed(1)} KB</span>
					</div>
				</div>
			);
		}
	};

	return (
		<>
			<div className="post-list">
				{posts.map((post) => (
					<div key={post.id} className="post-card">
											<div className="post-header">
						<div className="post-header-top">
							<h3>{post.titulo}</h3>
							{canEditPost(post) && (
								<div className="post-actions">
									<button 
										onClick={() => handleEditPost(post)}
										className="edit-btn"
										title="Editar publicación"
									>
										<PencilIcon className="action-icon" />
									</button>
									<button 
										onClick={() => handleDeletePost(post.id)}
										className="delete-btn"
										title="Eliminar publicación"
									>
										<TrashIcon className="action-icon" />
									</button>
								</div>
							)}
						</div>
						<div className="post-meta">
							<span className="post-author">
								<UserIcon className="meta-icon" />
								{post.maestroName}
							</span>
							<span className="post-date">
								<CalendarIcon className="meta-icon" />
								{formatDate(post.fechaCreacion)}
							</span>
							{post.fechaEdicion && (
								<span className="post-edit-date">
									<CalendarIcon className="meta-icon" />
									Editado: {formatDate(post.fechaEdicion)}
								</span>
							)}
						</div>
					</div>
						
						<div className="post-content">
							<p>{post.contenido}</p>
						</div>
						
						{post.archivos && post.archivos.length > 0 && (
							<div className="post-attachments">
								<h4>Archivos adjuntos:</h4>
								<div className="attachments-grid">
									{post.archivos.map((file, index) => (
										<div key={index} className="attachment-preview">
											{renderFilePreview(file)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Modal para ver archivos */}
			{showFileModal && selectedFile && (
				<div className="modal-overlay" onClick={closeFileModal}>
					<div className="file-modal" onClick={(e) => e.stopPropagation()}>
						<div className="file-modal-header">
							<h3>{selectedFile.name}</h3>
							<div className="file-modal-actions">
								<button 
									onClick={() => downloadFile(selectedFile)}
									className="download-btn"
									title="Descargar archivo"
								>
									<ArrowDownTrayIcon className="download-icon" />
								</button>
								<button onClick={closeFileModal} className="close-btn">
									<XMarkIcon className="close-icon" />
								</button>
							</div>
						</div>
						<div className="file-modal-content">
							{selectedFile.type.startsWith('image/') ? (
								<img 
									src={selectedFile.data || selectedFile.url} 
									alt={selectedFile.name}
									className="modal-image"
								/>
							) : selectedFile.type === 'application/pdf' ? (
								<iframe
									src={selectedFile.data || selectedFile.url}
									title={selectedFile.name}
									className="modal-pdf"
								/>
							) : (
								<div className="modal-other">
									<DocumentTextIcon className="modal-other-icon" />
									<p>Este tipo de archivo no se puede previsualizar</p>
									<button 
										onClick={() => downloadFile(selectedFile)}
										className="btn-primary"
									>
										<ArrowDownTrayIcon className="btn-icon" />
										Descargar archivo
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Modal para editar publicación */}
			{showEditModal && editingPost && (
				<div className="modal-overlay" onClick={() => setShowEditModal(false)}>
					<div className="modal edit-post-modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>
								<PencilIcon className="modal-icon" />
								Editar Publicación
							</h2>
							<button onClick={() => setShowEditModal(false)} className="close-btn">
								<XMarkIcon className="close-icon" />
							</button>
						</div>
						
						<form onSubmit={handleEditSubmit} className="edit-post-form">
							<div className="form-group">
								<label htmlFor="edit-title">Título:</label>
								<input
									type="text"
									id="edit-title"
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
									required
									placeholder="Título de la publicación"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="edit-content">Contenido:</label>
								<textarea
									id="edit-content"
									value={editContent}
									onChange={(e) => setEditContent(e.target.value)}
									placeholder="Escribe el contenido de tu publicación..."
									rows="6"
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="edit-files">Archivos adjuntos:</label>
								<input
									type="file"
									id="edit-files"
									onChange={handleEditFileChange}
									multiple
									accept=".pdf,.jpg,.jpeg,.png,.gif"
								/>
								<small>Puedes agregar nuevos archivos (máximo 5 archivos, 1MB cada uno)</small>
							</div>

							{editFiles.length > 0 && (
								<div className="selected-files">
									<h4>Archivos actuales:</h4>
									{editFiles.map((file, index) => (
										<div key={index} className="file-item">
											<span>{getFileIcon(file)} {file.name}</span>
											<button 
												type="button" 
												onClick={() => removeEditFile(index)}
												className="remove-file-btn"
											>
												<XMarkIcon className="remove-icon" />
											</button>
										</div>
									))}
								</div>
							)}

							<div className="form-actions">
								<button 
									type="button" 
									onClick={() => setShowEditModal(false)}
									className="btn-secondary"
								>
									Cancelar
								</button>
								<button 
									type="submit" 
									className="btn-primary"
								>
									<PencilIcon className="btn-icon" />
									Actualizar Publicación
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

export default PostList; 