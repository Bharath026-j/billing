import React, { useState, useEffect, useRef } from "react";
import ApiService from "../ApiService.js";

export default function PurchaseInvoice({ setActiveTab }) {
  const [invoice, setInvoice] = useState({
    date: new Date().toISOString().split("T")[0],
    vendor: "",
    phone: "",
    products: [],
  });

  const [rows, setRows] = useState([]);
  const [existingVendors, setExistingVendors] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const vendorInputRef = useRef(null);

  // Load existing vendors on component mount
  useEffect(() => {
    loadVendors();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await ApiService.healthCheck();
      setConnectionStatus("connected");
    } catch (error) {
      setConnectionStatus("disconnected");
      console.error('Backend connection failed:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const vendors = await ApiService.getVendors();
      setExistingVendors(vendors);
    } catch (error) {
      console.error('Failed to load vendors:', error);
      setError('Failed to load vendors from database');
      // Fallback to empty array
      setExistingVendors([]);
    }
  };

  // Filter vendors based on input
  useEffect(() => {
    if (invoice.vendor) {
      const filtered = existingVendors.filter(vendor =>
        vendor.name.toLowerCase().includes(invoice.vendor.toLowerCase())
      );
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors(existingVendors);
    }
  }, [invoice.vendor, existingVendors]);

  const handleVendorInputChange = (e) => {
    const value = e.target.value;
    setInvoice({ ...invoice, vendor: value });
    setShowDropdown(true);
    setError(""); // Clear any previous errors
  };

  const selectVendor = (vendor) => {
    setInvoice({ 
      ...invoice, 
      vendor: vendor.name,
      phone: vendor.phone 
    });
    setShowDropdown(false);
  };

  const handleVendorInputFocus = () => {
    setShowDropdown(true);
  };

  const handleVendorInputBlur = () => {
    // Delay hiding dropdown to allow click on dropdown items
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleRowChange = (index, e) => {
    const updatedRows = [...rows];
    updatedRows[index][e.target.name] = e.target.value;

    if (updatedRows[index].quantity && updatedRows[index].cost) {
      updatedRows[index].totalCost =
        updatedRows[index].quantity * updatedRows[index].cost;
    }

    setRows(updatedRows);
  };

  const addProductRow = () => {
    setRows([
      ...rows,
      { name: "", hsn: "", qtyType: "pcs", quantity: "", cost: "", totalCost: 0 }
    ]);
  };

  const removeProductRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
  };

  const saveInvoice = async () => {
    setError("");
    setLoading(true);

    try {
      // Validate phone number
      if (!/^\d{10}$/.test(invoice.phone)) {
        throw new Error("Phone number must be exactly 10 digits");
      }

      const validRows = rows.filter(row => row.name && row.quantity && row.cost);
      if (validRows.length === 0 || !invoice.vendor) {
        throw new Error("Please fill all required fields (HSN optional)");
      }

      // Prepare invoice data for API
      const invoiceData = {
        date: invoice.date,
        vendor: invoice.vendor,
        phone: invoice.phone,
        products: validRows.map(row => ({
          name: row.name,
          hsn: row.hsn || "",
          qtyType: row.qtyType,
          quantity: parseInt(row.quantity),
          cost: parseFloat(row.cost),
          totalCost: parseFloat(row.totalCost),
          purchaseDate: invoice.date,
          expenses: []
        }))
      };

      // Save to database using ApiService
      await ApiService.createInvoice(invoiceData);

      alert("Invoice saved successfully!");

      // Reset form
      setInvoice({
        date: new Date().toISOString().split("T")[0],
        vendor: "",
        phone: "",
        products: []
      });
      setRows([]);

      // Reload vendors list
      await loadVendors();

    } catch (error) {
      console.error('Save error:', error);
      setError(error.message);
      alert(`Failed to save invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Purchase Invoice</h2>

      {/* Connection Status */}
      <div className={`mb-4 p-3 rounded-md ${
        connectionStatus === "connected" 
          ? "bg-green-100 border border-green-400 text-green-700" 
          : connectionStatus === "disconnected"
          ? "bg-red-100 border border-red-400 text-red-700"
          : "bg-yellow-100 border border-yellow-400 text-yellow-700"
      }`}>
        <span className="font-medium">
          {connectionStatus === "connected" && "✓ Connected to Database"}
          {connectionStatus === "disconnected" && "✗ Database Connection Failed"}
          {connectionStatus === "checking" && "⟳ Checking Database Connection..."}
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Invoice Header */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              value={invoice.date}
              onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Searchable Vendor Input with Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Name
            </label>
            <input
              ref={vendorInputRef}
              type="text"
              placeholder="Type to search existing vendors..."
              value={invoice.vendor}
              onChange={handleVendorInputChange}
              onFocus={handleVendorInputFocus}
              onBlur={handleVendorInputBlur}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Dropdown for existing vendors */}
            {showDropdown && filteredVendors.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                {filteredVendors.map((vendor, index) => (
                  <div
                    key={index}
                    onClick={() => selectVendor(vendor)}
                    className="p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm">{vendor.name}</div>
                    <div className="text-xs text-gray-600">{vendor.phone}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="10-digit phone number"
              value={invoice.phone}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Allow only digits
                setInvoice({ ...invoice, phone: value });
              }}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Products</h3>
          <button
            onClick={addProductRow}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Add Product
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products added yet. Click "Add Product" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Product Name</th>
                  <th className="border border-gray-300 p-3 text-left">HSN Code</th>
                  <th className="border border-gray-300 p-3 text-left">Qty Type</th>
                  <th className="border border-gray-300 p-3 text-left">Quantity</th>
                  <th className="border border-gray-300 p-3 text-left">Unit Cost</th>
                  <th className="border border-gray-300 p-3 text-left">Total Cost</th>
                  <th className="border border-gray-300 p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        name="name"
                        value={row.name}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="Product Name"
                        className="w-full border-0 p-2 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        name="hsn"
                        value={row.hsn}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="HSN Code"
                        className="w-full border-0 p-2 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        name="qtyType"
                        value={row.qtyType}
                        onChange={(e) => handleRowChange(index, e)}
                        className="w-full border-0 p-2 focus:ring-2 focus:ring-blue-500 rounded"
                      >
                        <option value="pcs">Nos</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        name="quantity"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="Quantity"
                        min="0"
                        step="1"
                        className="w-full border-0 p-2 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        name="cost"
                        value={row.cost}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="Unit Cost"
                        min="0"
                        step="0.01"
                        className="w-full border-0 p-2 focus:ring-2 focus:ring-blue-500 rounded"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="number"
                        name="totalCost"
                        value={row.totalCost}
                        readOnly
                        className="w-full border-0 p-2 bg-gray-100 rounded"
                        placeholder="Total"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => removeProductRow(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Summary */}
            <div className="mt-4 text-right">
              <p className="text-lg font-semibold">
                Grand Total: ₹{rows.reduce((sum, row) => sum + (row.totalCost || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={saveInvoice}
          disabled={loading || rows.length === 0 || connectionStatus !== "connected"}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Invoice"}
        </button>

        <button
          onClick={() => setActiveTab("vendors")}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          View Purchase History
        </button>

        <button
          onClick={() => setActiveTab("expense")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Manage Expenses
        </button>

        {/* Clear Form Button */}
        <button
          onClick={() => {
            setInvoice({
              date: new Date().toISOString().split("T")[0],
              vendor: "",
              phone: "",
              products: []
            });
            setRows([]);
            setError("");
          }}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Clear Form
        </button>
      </div>

      {/* Connection Status */}
      <div className="mt-8 text-center text-sm text-gray-500">
        {loading ? (
          <span className="text-blue-600">Connecting to database...</span>
        ) : connectionStatus === "connected" ? (
          <span className="text-green-600">✓ Connected to database</span>
        ) : connectionStatus === "disconnected" ? (
          <span className="text-red-600">✗ Database connection failed</span>
        ) : (
          <span className="text-yellow-600">⟳ Checking connection...</span>
        )}
      </div>
    </div>
  );
}
