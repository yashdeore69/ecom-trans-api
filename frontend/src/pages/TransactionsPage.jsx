import React, { useEffect, useState } from "react";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("payment");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");

  // Fetch transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:8000/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch transactions");
        setTransactions(await res.json());
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTransactions();
  }, [token, success]);

  // Handle new transaction submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          description,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Transaction added!");
        setAmount("");
        setType("payment");
        setDescription("");
      } else {
        setError(data.detail || "Failed to add transaction");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div>
      <h2>Transactions</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="payment">Payment</option>
          <option value="refund">Refund</option>
        </select>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Transaction</button>
      </form>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.id}>
            {tx.type} - ${tx.amount} - {tx.status} ({tx.description})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionsPage;