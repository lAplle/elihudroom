import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("alumno");
	const [isRegister, setIsRegister] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
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
					password
				);
				await setDoc(doc(db, "usuarios", cred.user.uid), {
					email,
					role,
				});
			} else {
				await signInWithEmailAndPassword(auth, email, password);
			}
		} catch (error) {
			console.error("Error:", error.message);
			alert(error.message);
		}
	};

	return (
		<div className="login-container">
			<div className="login-form">
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
						</>
					)}
					<button type="submit">
						{isRegister ? "Registrarse" : "Iniciar sesión"}
					</button>
				</form>
				<button 
					onClick={() => setIsRegister(!isRegister)}
					className="toggle-form-btn"
				>
					{isRegister ? "Ya tengo cuenta" : "Quiero registrarme"}
				</button>
			</div>
		</div>
	);
}

export default Login;
