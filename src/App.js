import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClassView from "./pages/ClassView";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./App.css";

// Componente para proteger rutas
function PrivateRoute({ children }) {
	const { user } = useAuth();
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
