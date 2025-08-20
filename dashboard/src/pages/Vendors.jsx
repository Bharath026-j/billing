import React, { useEffect, useState } from "react";
import { Printer } from "lucide-react";

export default function Vendors() {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    vendor: "",
    phone: "",
    month: "",
    hsn: "",
  });
  const [reportView, setReportView] = useState("invoices"); // "invoices" or "reports"

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    setInvoices(savedInvoices);
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

  // Filtered list with safe checks to avoid crash
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
      const monthYear = invoice.date.substring(0, 7);
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
        avgCostPerUnit: data.totalAmount / data.totalQuantity || 0
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
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .vendor-info {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .total-row {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
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
    
    // Auto-print after content loads
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const monthReport = generateMonthReport();
  const hsnReport = generateHSNReport();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Purchase Management</h2>
        
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

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded shadow items-end">
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Month</label>
          <select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="">All Months</option>
            {getUniqueMonths().map(month => (
              <option key={month} value={month}>
                {new Date(month + "-01").toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">HSN Code</label>
          <select
            value={filters.hsn}
            onChange={(e) => setFilters({ ...filters, hsn: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="">All HSN</option>
            {getUniqueHSN().map(hsn => (
              <option key={hsn} value={hsn}>{hsn}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Vendor Name</label>
          <input
            type="text"
            placeholder="Search vendor..."
            value={filters.vendor}
            onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="text"
            placeholder="Search phone..."
            value={filters.phone}
            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded h-fit"
        >
          Reset
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
                    <th className="border p-3 text-right">Total Amount (₹)</th>
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

          {/* Product Details by HSN (Expandable) */}
          {filters.hsn && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Product Details for HSN: {filters.hsn}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-3 text-left">Date</th>
                      <th className="border p-3 text-left">Product Name</th>
                      <th className="border p-3 text-left">Vendor</th>
                      <th className="border p-3 text-right">Quantity</th>
                      <th className="border p-3 text-right">Total Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hsnReport.find(h => h.hsn === filters.hsn)?.products.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-3">{new Date(product.date).toLocaleDateString()}</td>
                        <td className="border p-3">{product.name}</td>
                        <td className="border p-3">{product.vendor}</td>
                        <td className="border p-3 text-right">{product.quantity} {product.qtyType}</td>
                        <td className="border p-3 text-right">₹{product.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice List View */}
      {reportView === "invoices" && (
        <div>
          {filteredInvoices.length === 0 ? (
            <p className="text-gray-500">No matching purchase invoices found.</p>
          ) : (
            filteredInvoices.map((invoice, index) => (
              <div key={index} className="border p-4 rounded-md mb-4 shadow-sm bg-white">
                {/* Invoice Header with Print Button */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p><strong>Date:</strong> {invoice.date}</p>
                    <p><strong>Vendor:</strong> {invoice.vendor}</p>
                    <p><strong>Phone:</strong> {invoice.phone}</p>
                  </div>
                  <button
                    onClick={() => printInvoice(invoice)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
                    title="Print this invoice"
                  >
                    <Printer size={16} />
                    Print Invoice
                  </button>
                </div>

                <table className="w-full border mt-3">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Product Name</th>
                      <th className="border p-2">HSN Code</th>
                      <th className="border p-2">Qty Type</th>
                      <th className="border p-2">Quantity</th>
                      <th className="border p-2">Unit Cost</th>
                      <th className="border p-2">Base Total</th>
                      <th className="border p-2">Expenses</th>
                      <th className="border p-2">Final Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.products.map((product, pIndex) => {
                      const expenseAmount = (product.expenses || []).reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
                      const baseTotal = product.quantity * product.cost;
                      
                      return (
                        <tr key={pIndex}>
                          <td className="border p-2 text-sm">
                            {product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString() : new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="border p-2">{product.name}</td>
                          <td className="border p-2">{product.hsn || "-"}</td>
                          <td className="border p-2">{product.qtyType}</td>
                          <td className="border p-2">{product.quantity}</td>
                          <td className="border p-2">₹{product.cost}</td>
                          <td className="border p-2">₹{baseTotal}</td>
                          <td className="border p-2 text-orange-600">
                            {expenseAmount > 0 ? `₹${expenseAmount}` : "-"}
                          </td>
                          <td className="border p-2 font-semibold">₹{product.totalCost}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Total Amount Display */}
                <div className="text-right mt-2">
                  <p className="text-lg font-semibold">
                    <strong>Grand Total: ₹{invoice.products.reduce((sum, product) => sum + (product.totalCost || 0), 0).toLocaleString()}</strong>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}