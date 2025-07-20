import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, txRes, logRes] = await Promise.all([
          fetch("http://localhost:8000/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/transactions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/logs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!meRes.ok) throw new Error("Failed to fetch profile");
        if (!txRes.ok) throw new Error("Failed to fetch transactions");
        if (!logRes.ok) throw new Error("Failed to fetch logs");
        setProfile(await meRes.json());
        setTransactions(await txRes.json());
        setLogs(await logRes.json());
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome, {profile.username}</h2>
      <button onClick={handleLogout}>Logout</button>
      <h3>Balance: ${profile.balance}</h3>
      <h3>
      <Link to="/transactions" style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
        Transactions
      </Link>
    </h3>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.id}>
            {tx.type} - ${tx.amount} - {tx.status} ({tx.description})
          </li>
        ))}
      </ul>
      <h3>Logs</h3>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            [{log.timestamp}] {log.action} - {log.detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;