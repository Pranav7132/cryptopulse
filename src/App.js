import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CryptoDashboard from './components/CryptoDashboard';
import CryptoDetails from './components/CryptoDetails';
import './App.css';
import Watchlist from "./components/Watchlist";


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<CryptoDashboard />} />
          <Route path="/crypto/:id" element={<CryptoDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
