import React, { useEffect, useState } from "react";
import { Printer } from "lucide-react";

export default function Vendors() {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    vendor: "",
    phone: "",
  });

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    setInvoices(savedInvoices);
  }, []);

  // Filtered list with safe checks to avoid crash
  const filteredInvoices = invoices.filter((invoice) => {
    const vendor = (invoice.vendor || "").toString();
    const phone = (invoice.phone || "").toString();
    const date = (invoice.date || "").toString();

    return (
      (filters.date === "" || date.includes(filters.date)) &&
      (filters.vendor === "" || vendor.toLowerCase().includes(filters.vendor.toLowerCase())) &&
      (filters.phone === "" || phone.includes(filters.phone))
    );
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      date: "",
      vendor: "",
      phone: "",
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Purchase History</h2>

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

      {/* Invoice List */}
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
                  <th className="border p-2">Cost</th>
                  <th className="border p-2">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {invoice.products.map((product, pIndex) => (
                  <tr key={pIndex}>
                    <td className="border p-2 text-sm">
                      {product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString() : new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="border p-2">{product.name}</td>
                    <td className="border p-2">{product.hsn || "-"}</td>
                    <td className="border p-2">{product.qtyType}</td>
                    <td className="border p-2">{product.quantity}</td>
                    <td className="border p-2">₹{product.cost}</td>
                    <td className="border p-2">₹{product.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Total Amount Display */}
            <div className="text-right mt-2">
              <p className="text-lg font-semibold">
                <strong>Grand Total: ₹{invoice.products.reduce((sum, product) => sum + (product.totalCost || 0), 0)}</strong>
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}