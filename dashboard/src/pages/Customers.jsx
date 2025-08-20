import React, { useState, useEffect } from "react";
import ApiService from "../ApiService";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Load customers from backend
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async () => {
    if (!name.trim()) return alert("Enter customer name");
    try {
      await ApiService.createCustomer({ name });
      setName("");
      await loadCustomers();
    } catch (err) {
      alert("Failed to add customer: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Customers</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-64"
          placeholder="Customer name"
        />
        <button
          onClick={addCustomer}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      {loading ? (
        <p>Loading customers...</p>
      ) : (
        <ul className="list-disc pl-5">
          {customers.map((c, i) => (
            <li key={i}>{c.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Customers;
