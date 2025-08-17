import React from "react";

const menuItems = [
  { id: "products", label: "Products" },
  { id: "productInvoice", label: "Purchase Invoice" },
  { id: "expense", label: "Expense" },
  { id: "salesInvoice", label: "Sales Invoice" },
  { id: "customers", label: "Customers" },
  { id: "vendors", label: "Vendors" },
  { id: "reports", label: "Reports" },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-60 bg-gray-100 h-screen p-4 shadow-sm">
      <h1 className="text-lg font-bold mb-4">Billing</h1>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`cursor-pointer px-3 py-2 rounded-md hover:bg-blue-100 ${
              activeTab === item.id ? "bg-blue-200" : ""
            }`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
