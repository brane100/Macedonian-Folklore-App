import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Home from './components/Home'; // Your home component
import Profile from './components/Profile'; // Some protected component

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes - redirect to home if already logged in */}
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/registracija" 
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } 
                />
                
                {/* Public home route - accessible to everyone */}
                <Route path="/" element={<Home />} />
                
                {/* Protected routes - require authentication */}
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Add more protected routes as needed */}
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute>
                            <div>Admin Panel</div>
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
