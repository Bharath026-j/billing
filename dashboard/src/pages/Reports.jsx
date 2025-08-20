import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [reportType, setReportType] = useState("summary"); // 'summary' or 'detailed'
  const [loading, setLoading] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = () => {
    setLoading(true);
    const purchaseInvoices = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    
    const vendorMap = new Map();
    
    purchaseInvoices.forEach(invoice => {
      if (!vendorMap.has(invoice.vendor)) {
        vendorMap.set(invoice.vendor, {
          name: invoice.vendor,
          totalPurchases: 0,
          totalExpenses: 0,
          products: [],
          transactions: []
        });
      }
      
      const vendor = vendorMap.get(invoice.vendor);
      
      invoice.products.forEach(product => {
        const productExpenses = (product.expenses || []).reduce((sum, exp) => 
          sum + (exp.totalAmount || exp.amountPerUnit * product.quantity), 0);
        
        vendor.totalPurchases += product.quantity * product.unitCost;
        vendor.totalExpenses += productExpenses;
        
        vendor.products.push({
          name: product.name,
          quantity: product.quantity,
          unitCost: product.unitCost,
          totalCost: product.totalCost,
          expenses: product.expenses || [],
          purchaseDate: product.purchaseDate || invoice.date
        });
        
        vendor.transactions.push({
          date: product.purchaseDate || invoice.date,
          type: "Purchase",
          product: product.name,
          amount: product.quantity * product.unitCost,
          note: `Purchased ${product.quantity} ${product.qtyType}`
        });
        
        (product.expenses || []).forEach(exp => {
          vendor.transactions.push({
            date: exp.date,
            type: "Expense - " + exp.type,
            product: product.name,
            amount: exp.totalAmount || exp.amountPerUnit * product.quantity,
            note: exp.note
          });
        });
      });
    });
    
    setVendors(Array.from(vendorMap.values()));
    setLoading(false);
  };

  const handleVendorSelect = (e) => {
    const vendorName = e.target.value;
    const vendor = vendors.find(v => v.name === vendorName);
    setSelectedVendor(vendor || null);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filterTransactions = () => {
    if (!selectedVendor) return [];
    
    let filtered = [...selectedVendor.transactions];
    
    // Apply date filter if dates are provided
    if (dateRange.start) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(dateRange.end));
    }
    
    return filtered;
  };

  const generatePDF = () => {
    // This is a placeholder - in a real app you'd use a PDF library like jsPDF or pdfkit
    alert("PDF generation would be implemented here with a proper library");
  };

  const generateExcel = () => {
    if (!selectedVendor) return;
    
    const wb = XLSX.utils.book_new();
    const transactions = filterTransactions();
    
    // Summary sheet
    const summaryData = [
      ["Vendor Name", selectedVendor.name],
      ["Total Purchases", selectedVendor.totalPurchases],
      ["Total Additional Expenses", selectedVendor.totalExpenses],
      ["Grand Total", selectedVendor.totalPurchases + selectedVendor.totalExpenses],
      ["", ""],
      ["Report Type", reportType === "summary" ? "Summary Report" : "Detailed Report"],
      ["Date Range", `${dateRange.start || "No start date"} to ${dateRange.end || "No end date"}`],
      ["Generated On", new Date().toLocaleString()]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    
    // Detailed transactions sheet
    if (reportType === "detailed" && transactions.length > 0) {
      const headers = ["Date", "Type", "Product", "Amount", "Note"];
      const transactionData = transactions.map(t => [
        t.date,
        t.type,
        t.product,
        t.amount,
        t.note
      ]);
      
      const detailSheet = XLSX.utils.aoa_to_sheet([headers, ...transactionData]);
      XLSX.utils.book_append_sheet(wb, detailSheet, "Transactions");
    }
    
    // Products sheet
    const productHeaders = ["Product", "Quantity", "Unit Cost", "Total Cost", "Purchase Date"];
    const productData = selectedVendor.products.map(p => [
      p.name,
      p.quantity,
      p.unitCost,
      p.totalCost,
      p.purchaseDate
    ]);
    
    const productSheet = XLSX.utils.aoa_to_sheet([productHeaders, ...productData]);
    XLSX.utils.book_append_sheet(wb, productSheet, "Products");
    
    // Generate and save the file
    const fileName = `${selectedVendor.name}_Report_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const calculateTotals = () => {
    const transactions = filterTransactions();
    
    const purchases = transactions
      .filter(t => t.type === "Purchase")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type.includes("Expense"))
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      purchases,
      expenses,
      total: purchases + expenses
    };
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Vendor Expense Reports</h2>
      
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {/* Vendor Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Vendor
            </label>
            <select
              onChange={handleVendorSelect}
              value={selectedVendor?.name || ""}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            >
              <option value="">-- Select Vendor --</option>
              {vendors.map(vendor => (
                <option key={vendor.name} value={vendor.name}>
                  {vendor.name} (₹{(vendor.totalPurchases + vendor.totalExpenses).toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={loadVendorData}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
              title="Refresh data"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
        
        {/* Report Configuration */}
        {selectedVendor && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3 text-blue-800">Report Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
                >
                  <option value="summary">Summary Report</option>
                  <option value="detailed">Detailed Report</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateChange}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={generateExcel}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md flex items-center gap-2"
              >
                <span>Export to Excel</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={generatePDF}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md flex items-center gap-2"
              >
                <span>Export to PDF</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Vendor Summary */}
      {selectedVendor && (
        <div className="mt-6 bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {selectedVendor.name} - {reportType === "summary" ? "Summary" : "Detailed"} Report
            </h3>
            <span className="text-sm text-gray-500">
              {dateRange.start || "No start date"} to {dateRange.end || "No end date"}
            </span>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Total Purchases</p>
              <p className="text-2xl font-bold text-blue-800">
                ₹{calculateTotals().purchases.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Total Additional Expenses</p>
              <p className="text-2xl font-bold text-orange-800">
                ₹{calculateTotals().expenses.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <p className="text-sm text-green-700 font-medium">Grand Total</p>
              <p className="text-2xl font-bold text-green-800">
                ₹{calculateTotals().total.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Detailed Transactions */}
          {reportType === "detailed" && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">Transaction Details</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">Date</th>
                      <th className="border border-gray-300 p-3 text-left">Type</th>
                      <th className="border border-gray-300 p-3 text-left">Product</th>
                      <th className="border border-gray-300 p-3 text-right">Amount (₹)</th>
                      <th className="border border-gray-300 p-3 text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterTransactions().length > 0 ? (
                      filterTransactions().map((t, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="border border-gray-300 p-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              t.type.includes("Expense") 
                                ? "bg-orange-100 text-orange-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3">{t.product}</td>
                          <td className="border border-gray-300 p-3 text-right font-medium">
                            ₹{t.amount.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 p-3">{t.note}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="border border-gray-300 p-4 text-center text-gray-500">
                          No transactions found for the selected date range
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Products List */}
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-3">Products Purchased</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">Product</th>
                    <th className="border border-gray-300 p-3 text-left">Quantity</th>
                    <th className="border border-gray-300 p-3 text-right">Unit Cost</th>
                    <th className="border border-gray-300 p-3 text-right">Total Cost</th>
                    <th className="border border-gray-300 p-3 text-left">Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVendor.products.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">{p.name}</td>
                      <td className="border border-gray-300 p-3">{p.quantity}</td>
                      <td className="border border-gray-300 p-3 text-right">₹{p.unitCost.toLocaleString()}</td>
                      <td className="border border-gray-300 p-3 text-right font-medium">
                        ₹{p.totalCost.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-3">
                        {new Date(p.purchaseDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* No Vendor Selected */}
      {!selectedVendor && !loading && (
        <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600 mt-4">No Vendor Selected</h3>
          <p className="text-gray-500 mt-1">Select a vendor from the dropdown to view reports</p>
        </div>
      )}
    </div>
  );
}