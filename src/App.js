import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CryptoDashboard from './components/CryptoDashboard.jsx';
import CryptoDetails from './components/CryptoDetails.jsx';
import './App.css';
import Watchlist from "./components/Watchlist.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { Navigate } from "react-router-dom";




function App() {
  const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<CryptoDashboard />} />
          <Route path="/crypto/:id" element={<CryptoDetails />} />
          <Route
  path="/watchlist"
  element={
    <ProtectedRoute>
      <Watchlist />
    </ProtectedRoute>
  }
/>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
