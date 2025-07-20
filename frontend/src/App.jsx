import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";
import './styles/main.css';

function App() {
  const isLoggedIn = !!localStorage.getItem("token"); // Simple auth check

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/transactions" element={isLoggedIn ? <TransactionsPage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;