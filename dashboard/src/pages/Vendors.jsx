import React, { useEffect, useState } from "react";
import { Printer, Download, RefreshCw } from "lucide-react";
import ApiService from "../ApiService";

export default function Vendors() {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    vendor: "",
    phone: "",
    month: "",
    hsn: "",
  });
  const [reportView, setReportView] = useState("invoices");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load invoices from API
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching invoices from database...");
      const purchaseInvoices = await ApiService.getAllPurchaseInvoices();
      console.log("Invoices loaded:", purchaseInvoices.length);
      
      // Normalize the data from database
      const normalizedInvoices = purchaseInvoices.map(invoice => ({
        ...invoice,
        products: invoice.products.map(product => ({
          ...product,
          expenses: product.expenses || [],
          totalCost: product.totalCost || (product.quantity * product.cost),
          purchaseDate: product.purchaseDate || invoice.date

         

        }))
      }));
      // normalized invoices stored in invoices state
      setInvoices(normalizedInvoices);
      setLoading(false);
      
    } catch (err) {
      console.error("Error loading invoices:", err);
      setError("Failed to load purchase invoices from database. " + err.message);
      setLoading(false);
      
      // Fallback to localStorage if API fails
      try {
        const savedInvoices = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
        setInvoices(savedInvoices);
        console.log("Using localStorage fallback:", savedInvoices.length, "invoices");
      } catch (localError) {
        console.error("Local storage fallback also failed:", localError);
      }
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Get unique months from invoices
  const getUniqueMonths = () => {
    const months = new Set();
    invoices.forEach(invoice => {
      if (invoice.date) {
        const monthYear = invoice.date.substring(0, 7); // YYYY-MM format
        months.add(monthYear);
      }
    });
    return Array.from(months).sort().reverse();
  };

  // Get unique HSN codes
  const getUniqueHSN = () => {
    const hsnCodes = new Set();
    invoices.forEach(invoice => {
      invoice.products.forEach(product => {
        if (product.hsn) {
          hsnCodes.add(product.hsn);
        }
      });
    });
    return Array.from(hsnCodes).sort();
  };

  // Filtered list with safe checks
  const filteredInvoices = invoices.filter((invoice) => {
    const vendor = (invoice.vendor || "").toString();
    const phone = (invoice.phone || "").toString();
    const date = (invoice.date || "").toString();

    // Month filter
    const monthMatch = filters.month === "" || date.startsWith(filters.month);
    
    // HSN filter - check if any product in invoice has the HSN
    const hsnMatch = filters.hsn === "" || invoice.products.some(product => 
      (product.hsn || "").toString() === filters.hsn
    );

    return (
      (filters.date === "" || date.includes(filters.date)) &&
      (filters.vendor === "" || vendor.toLowerCase().includes(filters.vendor.toLowerCase())) &&
      (filters.phone === "" || phone.includes(filters.phone)) &&
      monthMatch &&
      hsnMatch
    );
  });

  // Generate month-wise report
  const generateMonthReport = () => {
    const monthData = {};
    
    filteredInvoices.forEach(invoice => {
      const monthYear = invoice.date?.substring(0, 7) || "Unknown";
      if (!monthData[monthYear]) {
        monthData[monthYear] = {
          totalPurchases: 0,
          totalAmount: 0,
          totalExpenses: 0,
          vendors: new Set(),
          products: 0
        };
      }

      monthData[monthYear].totalPurchases += 1;
      monthData[monthYear].vendors.add(invoice.vendor);
      monthData[monthYear].products += invoice.products.length;

      invoice.products.forEach(product => {
        monthData[monthYear].totalAmount += product.totalCost || 0;
        
        // Calculate expenses for this product
        const expenses = product.expenses || [];
        const expenseAmount = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
        monthData[monthYear].totalExpenses += expenseAmount;
      });
    });

    return Object.entries(monthData)
      .map(([month, data]) => ({
        month,
        ...data,
        vendors: data.vendors.size
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  };

  // Generate HSN-wise report
  const generateHSNReport = () => {
    const hsnData = {};
    
    filteredInvoices.forEach(invoice => {
      invoice.products.forEach(product => {
        const hsn = product.hsn || "No HSN";
        if (!hsnData[hsn]) {
          hsnData[hsn] = {
            totalQuantity: 0,
            totalAmount: 0,
            totalExpenses: 0,
            products: [],
            vendors: new Set()
          };
          // console.log(product);
        }

        hsnData[hsn].totalQuantity += product.quantity || 0;
        hsnData[hsn].totalAmount += product.totalCost || 0;
        hsnData[hsn].vendors.add(invoice.vendor);
        
        // Calculate expenses
        const expenses = product.expenses || [];
        const expenseAmount = expenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
        hsnData[hsn].totalExpenses += expenseAmount;

        hsnData[hsn].products.push({
          name: product.name,
          vendor: invoice.vendor,
          date: invoice.date,
          quantity: product.quantity,
          qtyType: product.qtyType,
          totalCost: product.totalCost
        });
      });
    });

    return Object.entries(hsnData)
      .map(([hsn, data]) => ({
        hsn,
        ...data,
        vendors: data.vendors.size,
        avgCostPerUnit: data.totalQuantity > 0 ? data.totalAmount / data.totalQuantity : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      date: "",
      vendor: "",
      phone: "",
      month: "",
      hsn: "",
    });
  };

  // Export to CSV function
  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportMonthReport = () => {
    exportToCSV(monthReport, 'monthly_purchase_report');
  };

  const exportHSNReport = () => {
    exportToCSV(hsnReport, 'hsn_purchase_report');
  };

  // Print individual invoice
  const printInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    
    // Calculate total amount
    const totalAmount = invoice.products.reduce((sum, product) => sum + (product.totalCost || 0), 0);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Invoice - ${invoice.vendor}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .vendor-info { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total-row { background-color: #e8f5e8; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PURCHASE INVOICE</h1>
            <p>Invoice Date: ${new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          
          <div class="vendor-info">
            <h2>Vendor Information</h2>
            <p><strong>Vendor Name:</strong> ${invoice.vendor}</p>
            <p><strong>Phone Number:</strong> ${invoice.phone}</p>
            <p><strong>Invoice Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          
          <h3>Products Purchased</h3>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                <th>Product Name</th>
                <th>HSN Code</th>
                <th>Qty Type</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.products.map((product, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString() : new Date(invoice.date).toLocaleDateString()}</td>
                  <td>${product.name}</td>
                  <td>${product.hsn || '-'}</td>
                  <td>${product.qtyType}</td>
                  <td>${product.quantity}</td>
                  <td>₹${product.cost}</td>
                  <td>₹${product.totalCost}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="7" style="text-align: right;"><strong>Grand Total:</strong></td>
                <td><strong>₹${totalAmount}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>This is a computer-generated invoice</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const monthReport = generateMonthReport();
  const hsnReport = generateHSNReport();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Purchase Management</h2>
        
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <button
            onClick={loadInvoices}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh Data"}
          </button>
          
          {/* View Toggle */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setReportView("invoices")}
              className={`px-4 py-2 rounded-md transition-colors ${
                reportView === "invoices" 
                  ? "bg-blue-500 text-white" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Purchase History
            </button>
            <button
              onClick={() => setReportView("reports")}
              className={`px-4 py-2 rounded-md transition-colors ${
                reportView === "reports" 
                  ? "bg-blue-500 text-white" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Reports & Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading purchase data from database...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <div>
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-800 hover:text-red-900 font-bold text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Filter Section */}
          <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow border items-end">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full md:w-40"
              />
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full md:w-48"
              >
                <option value="">All Months</option>
                {getUniqueMonths().map(month => (
                  <option key={month} value={month}>
                    {new Date(month + "-01").toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
              <select
                value={filters.hsn}
                onChange={(e) => setFilters({ ...filters, hsn: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full md:w-32"
              >
                <option value="">All HSN</option>
                {getUniqueHSN().map(hsn => (
                  <option key={hsn} value={hsn}>{hsn}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
              <input
                type="text"
                placeholder="Search vendor..."
                value={filters.vendor}
                onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full md:w-48"
              />
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="Search phone..."
                value={filters.phone}
                onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                className="border border-gray-300 p-2 rounded w-full md:w-40"
              />
            </div>

            <button
              onClick={resetFilters}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded h-fit transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {/* Reports View */}
          {reportView === "reports" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border">
                  <h3 className="text-sm font-medium text-gray-600">Total Invoices</h3>
                  <p className="text-2xl font-bold text-blue-600">{filteredInvoices.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                  <h3 className="text-sm font-medium text-gray-600">Total Purchase Amount</h3>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{filteredInvoices.reduce((sum, invoice) => 
                      sum + invoice.products.reduce((pSum, product) => pSum + (product.totalCost || 0), 0), 0
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                  <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredInvoices.reduce((sum, invoice) => sum + invoice.products.length, 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                  <h3 className="text-sm font-medium text-gray-600">Unique Vendors</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(filteredInvoices.map(inv => inv.vendor)).size}
                  </p>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={exportMonthReport}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                  disabled={monthReport.length === 0}
                >
                  <Download size={18} />
                  Export Monthly Report
                </button>
                <button
                  onClick={exportHSNReport}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
                  disabled={hsnReport.length === 0}
                >
                  <Download size={18} />
                  Export HSN Report
                </button>
              </div>

              {/* Month-wise Report */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Month-wise Purchase Report</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-3 text-left">Month</th>
                        <th className="border p-3 text-right">Invoices</th>
                        <th className="border p-3 text-right">Products</th>
                        <th className="border p-3 text-right">Vendors</th>
                        <th className="border p-3 text-right">Base Amount (₹)</th>
                        <th className="border p-3 text-right">Extra Expenses (₹)</th>
                        <th className="border p-3 text-right">Final Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthReport.map((month, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border p-3 font-medium">
                            {new Date(month.month + "-01").toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                          </td>
                          <td className="border p-3 text-right">{month.totalPurchases}</td>
                          <td className="border p-3 text-right">{month.products}</td>
                          <td className="border p-3 text-right">{month.vendors}</td>
                          <td className="border p-3 text-right">₹{(month.totalAmount - month.totalExpenses).toLocaleString()}</td>
                          <td className="border p-3 text-right text-orange-600">₹{month.totalExpenses.toLocaleString()}</td>
                          <td className="border p-3 text-right font-bold text-green-600">₹{month.totalAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HSN-wise Report */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">HSN-wise Purchase Report</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-3 text-left">HSN Code</th>
                        <th className="border p-3 text-right">Total Quantity</th>
                        <th className="border p-3 text-right">Vendors</th>
                        <th className="border p-3 text-right">Base Amount (₹)</th>
                        <th className="border p-3 text-right">Extra Expenses (₹)</th>
                        <th className="border p-3 text-right">Total Amount (₹)</th>
                        <th className="border p-3 text-right">Avg Cost/Unit (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hsnReport.map((hsn, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border p-3 font-medium">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {hsn.hsn}
                            </span>
                          </td>
                          <td className="border p-3 text-right">{hsn.totalQuantity}</td>
                          <td className="border p-3 text-right">{hsn.vendors}</td>
                          <td className="border p-3 text-right">₹{(hsn.totalAmount - hsn.totalExpenses).toLocaleString()}</td>
                          <td className="border p-3 text-right text-orange-600">₹{hsn.totalExpenses.toLocaleString()}</td>
                          <td className="border p-3 text-right font-bold text-green-600">₹{hsn.totalAmount.toLocaleString()}</td>
                          <td className="border p-3 text-right">₹{hsn.avgCostPerUnit.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Invoice List View */}
          {reportView === "invoices" && (
            <div>
              {filteredInvoices.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500 text-lg">No matching purchase invoices found.</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check if you have any invoices.</p>
                </div>
              ) : (
                filteredInvoices.map((invoice, index) => (
                  <div key={index} className="border border-gray-200 p-6 rounded-lg mb-6 shadow-sm bg-white">
                    {/* Invoice Header with Print Button */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-800">{invoice.vendor}</p>
                        <p className="text-sm text-gray-600"><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600"><strong>Phone:</strong> {invoice.phone}</p>
                      </div>
                      <button
                        onClick={() => printInvoice(invoice)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                        title="Print this invoice"
                      >
                        <Printer size={18} />
                        Print Invoice
                      </button>
                    </div>

                    <table className="w-full border border-gray-200 mt-4">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-3 text-left text-sm font-medium">Date</th>
                          <th className="border border-gray-300 p-3 text-left text-sm font-medium">Product Name</th>
                          <th className="border border-gray-300 p-3 text-left text-sm font-medium">HSN Code</th>
                          <th className="border border-gray-300 p-3 text-left text-sm font-medium">Qty Type</th>
                          <th className="border border-gray-300 p-3 text-right text-sm font-medium">Quantity</th>
                          <th className="border border-gray-300 p-3 text-right text-sm font-medium">Unit Cost</th>
                          <th className="border border-gray-300 p-3 text-right text-sm font-medium">Base Total</th>
                          <th className="border border-gray-300 p-3 text-right text-sm font-medium">Expenses</th>
                          <th className="border border-gray-300 p-3 text-right text-sm font-medium">Final Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.products.map((product, pIndex) => {
                          // const expenseAmount = (product.expenses || []).reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
                          const expenseAmount = (product.expenses || product.additionalExpenses || []).reduce(
                            (sum, exp) => sum + Number(exp?.totalAmount ?? 0),
                            0
                          );
                          
                          const baseTotal = product.quantity * product.cost;
                          
                          return (
                            <tr key={pIndex} className="hover:bg-gray-50">
                              <td className="border border-gray-200 p-3 text-sm">
                                {product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString() : new Date(invoice.date).toLocaleDateString()}
                              </td>
                              <td className="border border-gray-200 p-3 text-sm font-medium">{product.name}</td>
                              <td className="border border-gray-200 p-3 text-sm">{product.hsn || "-"}</td>
                              <td className="border border-gray-200 p-3 text-sm">{product.qtyType}</td>
                              <td className="border border-gray-200 p-3 text-sm text-right">{product.quantity}</td>
                              <td className="border border-gray-200 p-3 text-sm text-right">₹{product.cost}</td>
                              <td className="border border-gray-200 p-3 text-sm text-right">₹{baseTotal}</td>
                              <td className="border border-gray-200 p-3 text-sm text-right text-orange-600">
                                {/* {expenseAmount > 0 && `₹${expenseAmount}` } */}
                                {expenseAmount}
                              </td>
                              <td className="border border-gray-200 p-3 text-sm text-right font-semibold text-green-700">₹{product.totalCost}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    {/* Total Amount Display */}
                    <div className="text-right mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xl font-bold text-gray-800">
                        <strong>Grand Total: ₹{invoice.products.reduce((sum, product) => sum + (product.totalCost || 0), 0).toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}