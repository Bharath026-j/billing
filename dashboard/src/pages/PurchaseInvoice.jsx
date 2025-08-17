import React, { useState, useEffect, useRef } from "react";

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
  const vendorInputRef = useRef(null);

  // Load existing vendors on component mount
  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    const vendors = savedInvoices.map(inv => ({
      name: inv.vendor,
      phone: inv.phone
    }));
    setExistingVendors(vendors);
  }, []);

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

  const saveInvoice = () => {
    // Validate phone number
    if (!/^\d{10}$/.test(invoice.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    const validRows = rows.filter(row => row.name && row.quantity && row.cost);
    if (validRows.length === 0 || !invoice.vendor) {
      alert("Please fill all required fields (HSN optional)");
      return;
    }

    let savedInvoices = JSON.parse(localStorage.getItem("purchaseInvoices")) || [];

    // Check if vendor already exists
    const vendorIndex = savedInvoices.findIndex(
      inv => inv.vendor.toLowerCase() === invoice.vendor.toLowerCase()
    );

    if (vendorIndex !== -1) {
      // Append new products to existing vendor
      savedInvoices[vendorIndex].products.push(...validRows);
    } else {
      // Create new vendor entry
      savedInvoices.push({
        ...invoice,
        products: validRows
      });
    }

    localStorage.setItem("purchaseInvoices", JSON.stringify(savedInvoices));

    alert("Invoice saved!");
    setInvoice({
      date: new Date().toISOString().split("T")[0],
      vendor: "",
      phone: "",
      products: []
    });
    setRows([]);
    
    // Refresh existing vendors list
    const vendors = savedInvoices.map(inv => ({
      name: inv.vendor,
      phone: inv.phone
    }));
    setExistingVendors(vendors);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Purchase Invoice</h2>

      <div className="grid grid-cols-3 gap-4">
        <input
          type="date"
          value={invoice.date}
          onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
          max={new Date().toISOString().split("T")[0]}
          className="border p-2 rounded-md border-gray-300"
        />
        
        {/* Searchable Vendor Input with Dropdown */}
        <div className="relative">
          <input
            ref={vendorInputRef}
            type="text"
            placeholder="Vendor Name (type to search existing)"
            value={invoice.vendor}
            onChange={handleVendorInputChange}
            onFocus={handleVendorInputFocus}
            onBlur={handleVendorInputBlur}
            className="border p-2 rounded-md border-gray-300 w-full"
          />
          
          {/* Dropdown for existing vendors */}
          {showDropdown && filteredVendors.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
              {filteredVendors.map((vendor, index) => (
                <div
                  key={index}
                  onClick={() => selectVendor(vendor)}
                  className="p-2 hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{vendor.name}</div>
                  <div className="text-xs text-gray-600">{vendor.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <input
          type="text"
          placeholder="Phone Number"
          value={invoice.phone}
          maxLength={10}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // Allow only digits
            setInvoice({ ...invoice, phone: value });
          }}
          className="border p-2 rounded-md border-gray-300"
        />
      </div>

      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 mt-4">
          <input
            type="text"
            name="name"
            value={row.name}
            onChange={(e) => handleRowChange(index, e)}
            placeholder="Product Name"
            className="border p-2 rounded-md border-gray-300"
          />
          <input
            type="text"
            name="hsn"
            value={row.hsn}
            onChange={(e) => handleRowChange(index, e)}
            placeholder="HSN Code"
            className="border p-2 rounded-md border-gray-300"
          />
          <select
            name="qtyType"
            value={row.qtyType}
            onChange={(e) => handleRowChange(index, e)}
            className="border p-2 rounded-md border-gray-300"
          >
            <option value="pcs">pcs</option>
            <option value="box">box</option>
            <option value="kg">kg</option>
          </select>
          <input
            type="number"
            name="quantity"
            value={row.quantity}
            onChange={(e) => handleRowChange(index, e)}
            placeholder="Quantity"
            className="border p-2 rounded-md border-gray-300"
          />
          <input
            type="number"
            name="cost"
            value={row.cost}
            onChange={(e) => handleRowChange(index, e)}
            placeholder="Cost"
            className="border p-2 rounded-md border-gray-300"
          />
          <input
            type="number"
            name="totalCost"
            value={row.totalCost}
            readOnly
            className="border p-2 rounded-md bg-gray-100 border-gray-300"
            placeholder="Total"
          />
        </div>
      ))}

      <button
        onClick={addProductRow}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
      >
        Add Product
      </button>

      <button
        onClick={saveInvoice}
        className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 ml-2"
      >
        Save Invoice
      </button>

      <button
        onClick={() => setActiveTab("vendors")}
        className="bg-purple-500 text-white px-4 py-2 rounded-md mt-4 ml-2"
      >
        View Purchase History
      </button>
    </div>
  );
}