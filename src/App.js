import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClassView from "./pages/ClassView";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import "./App.css";

// Componente para proteger rutas (usando HashRouter para GitHub Pages)
function PrivateRoute({ children }) {
	const { user, loading } = useAuth();
	
	if (loading) {
		return (
			<div className="loading-container">
				<div className="loading-spinner">
					<div className="spinner-ring"></div>
					<div className="spinner-logo">
						<AcademicCapIcon className="spinner-icon" />
					</div>
				</div>
				<div className="loading-text">Verificando autenticación...</div>
			</div>
		);
	}
	
	return user ? children : <Navigate to="/" />;
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<Routes>
					<Route path="/" element={<Login />} />
					<Route 
						path="/dashboard" 
						element={
							<PrivateRoute>
								<Dashboard />
							</PrivateRoute>
						} 
					/>
					<Route 
						path="/class/:classId" 
						element={
							<PrivateRoute>
								<ClassView />
							</PrivateRoute>
						} 
					/>
				</Routes>
			</Router>
		</AuthProvider>
	);
}

export default App;
