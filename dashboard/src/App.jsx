import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Products from "./pages/Products";
import ProductInvoice from "./pages/PurchaseInvoice";
import Expense from "./pages/Expense";
import SalesInvoice from "./pages/SalesInvoice";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import Header from "./components/Header";

export default function App() {
  const [activeTab, setActiveTab] = useState("productInvoice");

  const renderPage = () => {
    switch (activeTab) {
      case "products":
        return <Products />;
      case "productInvoice":
        return <ProductInvoice setActiveTab={setActiveTab} />; // ✅ Pass here
      case "expense":
        return <Expense />;
      case "salesInvoice":
        return <SalesInvoice />;
      case "customers":
        return <Customers />;
      case "vendors":
        return <Vendors setActiveTab={setActiveTab} />; // ✅ Pass here
      case "reports":
        return <Reports />;
      default:
        return <SalesInvoice />;
    }
  };
  

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1">
      <Header activeTab={activeTab} />
        <main className="flex-1 p-4 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
