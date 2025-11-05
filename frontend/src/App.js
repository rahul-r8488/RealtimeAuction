import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuctionPage from './pages/AuctionPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auctions/:id" element={<AuctionPage />} />
            <Route path="/create" element={<CreateAuctionPage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;