import React from "react";
import image from "../assets/react.svg";

export default function Header({ activeTab }) {
  // Map tab keys to nice display names
  const tabNames = {
    products: "Products",
    productInvoice: "Purchase Invoice",
    expense: "Expense",
    salesInvoice: "Sales Invoice",
    customers: "Customers",
    vendors: "Vendors",
    reports: "Reports",
  };

  const title = tabNames[activeTab] || "Dashboard";

  return (
    <header className="flex items-center justify-between bg-white shadow-sm px-6 py-3">
      <h1 className="text-lg font-semibold text-gray-700">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="text-gray-600">Profile</span>
        <img
          src={image}
          alt="Profile"
          className="w-10 h-10 rounded-full border"
        />
      </div>
    </header>
  );
}
