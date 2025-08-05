import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

function Login() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("alumno");
	const [isRegister, setIsRegister] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isTransitioning, setIsTransitioning] = useState(false);
	const navigate = useNavigate();
	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (isRegister && password !== confirmPassword) {
			alert("Las contraseñas no coinciden");
			return;
		}

		try {
			if (isRegister) {
				const cred = await createUserWithEmailAndPassword(
					auth,
					email,
					password,
					name
				);
				await setDoc(doc(db, "usuarios", cred.user.uid), {
					email,
					role,
					name,
				});
			} else {
				await signInWithEmailAndPassword(auth, email, password);
			}
		} catch (error) {
			console.error("Error:", error.message);
			alert(error.message);
		}
	};

	const handleToggleForm = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setIsRegister(!isRegister);
			setIsTransitioning(false);
		}, 150); // Tiempo de la animación fadeOut
	};

	return (
		<div className="login-container">
			<div className="login-header">
				<div className="login-header-left">
					<AcademicCapIcon className="login-header-icon" />
					<h1>Elihudroom</h1>
				</div>
			</div>
			<div className={`login-form ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
				<h2>{isRegister ? "Registro" : "Inicio de sesión"}</h2>
				<form onSubmit={handleSubmit}>
					<input
						type="email"
						placeholder="Correo electrónico"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						type="password"
						placeholder="Contraseña"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					{isRegister && (
						<>
							<input
								type="password"
								placeholder="Confirmar contraseña"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
							<select
								value={role}
								onChange={(e) => setRole(e.target.value)}
							>
								<option value="alumno">Alumno</option>
								<option value="maestro">Maestro</option>
							</select>
							<input
								type="text"
								placeholder="Nombre completo"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</>
					)}
					<button type="submit">
						{isRegister ? "Registrarse" : "Iniciar sesión"}
					</button>
				</form>
				<button 
					onClick={handleToggleForm}
					className="toggle-form-btn"
				>
					{isRegister ? "Ya tengo cuenta" : "Quiero registrarme"}
				</button>
			</div>
		</div>
	);
}

export default Login;
