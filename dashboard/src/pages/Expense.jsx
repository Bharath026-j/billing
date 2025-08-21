import React, { useState, useEffect } from "react";
import ApiService from "../ApiService";

export default function Expense() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expenseEntries, setExpenseEntries] = useState([
    { type: "", amountPerUnit: "", note: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter states
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedHsn, setSelectedHsn] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    vendors: [],
    hsnCodes: [],
    productNames: []
  });

  const [filteredProducts, setFilteredProducts] = useState([]);

  // Load products and filter options
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load products for expense tracking
      const productsData = await ApiService.getProductsForExpenseTracking();
      setProducts(productsData);

      // Load filter options
      const filters = await ApiService.getExpenseFilterOptions();
      setFilterOptions(filters);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Filter products based on selected filters
  useEffect(() => {
    let filtered = products;

    if (selectedVendor) {
      filtered = filtered.filter(p => p.vendor === selectedVendor);
    }

    if (selectedHsn) {
      filtered = filtered.filter(p => p.hsn === selectedHsn);
    }

    if (selectedProductName) {
      filtered = filtered.filter(p => p.name === selectedProductName);
    }

    setFilteredProducts(filtered);

    // Clear selected product if it's no longer in filtered results
    if (selectedProduct && !filtered.find(p => p.id === selectedProduct.id)) {
      setSelectedProduct(null);
      setExpenseEntries([{ type: "", amountPerUnit: "", note: "" }]);
    }
  }, [products, selectedVendor, selectedHsn, selectedProductName, selectedProduct]);

  // Handle filter changes
  const handleVendorChange = (e) => {
    setSelectedVendor(e.target.value);
    setSelectedProduct(null);
  };

  const handleHsnChange = (e) => {
    setSelectedHsn(e.target.value);
    setSelectedProduct(null);
  };

  const handleProductNameChange = (e) => {
    setSelectedProductName(e.target.value);
    setSelectedProduct(null);
  };

  // // Handle product selection
  // const handleProductSelect = async (e) => {
  //   const productId = e.target.value;
  //   const product = filteredProducts.find((p) => p.id === productId);
    
  //   if (product) {
  //     setSelectedProduct(product);
  //     setExpenseEntries([{ type: "", amountPerUnit: "", note: "" }]);
      
  //     // Try to load existing expense record
  //     try {
  //       const expenseRecord = await ApiService.getProductExpense(
  //         product.purchaseInvoiceId,
  //         product.name,
  //         product.hsn
  //       );
        
  //       if (expenseRecord) {
  //         // If expense record exists, update the selected product with expense data
  //         setSelectedProduct(prev => ({
  //           ...prev,
  //           expenses: expenseRecord.additionalExpenses,
  //           totalCost: expenseRecord.finalTotalCost
  //         }));
  //       }
  //     } catch (err) {
  //       // 404 errors are expected if no expense record exists
  //       if (err.message.includes("404")) {
  //         console.log("No existing expense record found");
  //       } else {
  //         setError(err.message);
  //       }
  //     }
  //   } else {
  //     setSelectedProduct(null);
  //   }
  // };

  // Handle product selection
const handleProductSelect = async (e) => {
  const productId = e.target.value;
  const product = filteredProducts.find((p) => p.id === productId);
  
  if (product) {
    setSelectedProduct(product);
    setExpenseEntries([{ type: "", amountPerUnit: "", note: "" }]);
    
    // Try to load existing expense record - with error handling
    try {
      // Check if the function exists before calling it
      if (ApiService.getProductExpense) {
        const expenseRecord = await ApiService.getProductExpense(
          product.purchaseInvoiceId,
          product.name,
          product.hsn
        );
        
        if (expenseRecord) {
          setSelectedProduct(prev => ({
            ...prev,
            expenses: expenseRecord.additionalExpenses,
            totalCost: expenseRecord.finalTotalCost
          }));
        }
      }
    } catch (err) {
      console.log("Error loading expense record:", err.message);
      // Continue without expense data
    }
  } else {
    setSelectedProduct(null);
  }
};


  // Clear all filters
  const clearAllFilters = () => {
    setSelectedVendor("");
    setSelectedHsn("");
    setSelectedProductName("");
    setSelectedProduct(null);
    setExpenseEntries([{ type: "", amountPerUnit: "", note: "" }]);
  };

  // Add new expense entry row
  const addExpenseEntry = () => {
    setExpenseEntries([...expenseEntries, { type: "", amountPerUnit: "", note: "" }]);
  };

  // Remove expense entry row
  const removeExpenseEntry = (index) => {
    if (expenseEntries.length > 1) {
      setExpenseEntries(expenseEntries.filter((_, i) => i !== index));
    }
  };

  // Handle expense entry change
  const handleExpenseEntryChange = (index, field, value) => {
    const updated = [...expenseEntries];
    updated[index][field] = value;
    setExpenseEntries(updated);
  };

  // Handle saving multiple expenses
  const handleSaveExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const validEntries = expenseEntries.filter(entry => 
        entry.type.trim() && entry.amountPerUnit && parseFloat(entry.amountPerUnit) > 0
      );

      if (!selectedProduct || validEntries.length === 0) {
        setError("Please select a product and add at least one valid expense!");
        return;
      }

      const newExpenses = validEntries.map(entry => ({
        type: entry.type.trim(),
        amountPerUnit: parseFloat(entry.amountPerUnit),
        totalAmount: parseFloat(entry.amountPerUnit) * selectedProduct.quantity,
        note: entry.note.trim() || "No note provided"
      }));

      const expenseData = {
        purchaseInvoiceId: selectedProduct.purchaseInvoiceId,
        productIndex: selectedProduct.productIndex,
        productDetails: {
          name: selectedProduct.name,
          hsn: selectedProduct.hsn,
          vendor: selectedProduct.vendor,
          originalQuantity: selectedProduct.quantity,
          originalUnitCost: selectedProduct.unitCost,
          originalTotalCost: selectedProduct.originalTotalCost,
          qtyType: selectedProduct.qtyType,
          purchaseDate: selectedProduct.purchaseDate
        },
        newExpenses
      };

      const savedExpense = await ApiService.createOrUpdateProductExpense(expenseData);
      
      // Update local state with the saved data
      setSelectedProduct(prev => ({
        ...prev,
        expenses: savedExpense.additionalExpenses,
        totalCost: savedExpense.finalTotalCost
      }));

      setSuccess(`${validEntries.length} expense(s) added successfully!`);
      setExpenseEntries([{ type: "", amountPerUnit: "", note: "" }]);
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleEdit = (index) => {
    const updatedExpenses = [...selectedProduct.expenses];
    updatedExpenses[index].isEditing = !updatedExpenses[index].isEditing;
    setSelectedProduct({ ...selectedProduct, expenses: updatedExpenses });
  };

  const handleEditChange = (index, field, value) => {
    const updatedExpenses = [...selectedProduct.expenses];
    if (field === "amountPerUnit") {
      updatedExpenses[index][field] = Number(value);
      updatedExpenses[index].totalAmount = Number(value) * selectedProduct.originalQuantity;
    } else {
      updatedExpenses[index][field] = value;
    }
    setSelectedProduct({ ...selectedProduct, expenses: updatedExpenses });
  };

  const saveEdit = async (index) => {
    try {
      setLoading(true);
      setError("");
      
      const expenseToUpdate = selectedProduct.expenses[index];
      const updateData = {
        type: expenseToUpdate.type,
        amountPerUnit: expenseToUpdate.amountPerUnit,
        note: expenseToUpdate.note
      };
  
      console.log("Saving edit:", {
        expenseRecordId: selectedProduct.expenseRecordId,
        expenseItemId: expenseToUpdate._id,
        updateData
      });
  
      // Update database FIRST
      if (selectedProduct.expenseRecordId) {
        const updatedRecord = await ApiService.updateExpenseItem(
          selectedProduct.expenseRecordId,
          expenseToUpdate._id,
          updateData
        );
        
        // Update local state with data from database
        setSelectedProduct(prev => ({
          ...prev,
          expenses: updatedRecord.additionalExpenses,
          totalCost: updatedRecord.finalTotalCost
        }));
      }
  
      setSuccess("Expense updated successfully in database!");
      setLoading(false);
  
    } catch (err) {
      console.error("Error in saveEdit:", err);
      setError("Failed to update in database: " + err.message);
      setLoading(false);
    }
  };


  const deleteExpense = async (index) => {
    if (!confirm("Are you sure you want to delete this expense from database?")) {
      return;
    }
  
    try {
      setLoading(true);
      setError("");
      
      const expenseToDelete = selectedProduct.expenses[index];
  
      console.log("Deleting expense:", {
        expenseRecordId: selectedProduct.expenseRecordId,
        expenseItemId: expenseToDelete._id
      });
  
      // Delete from database FIRST
      if (selectedProduct.expenseRecordId) {
        const updatedRecord = await ApiService.deleteExpenseItem(
          selectedProduct.expenseRecordId,
          expenseToDelete._id
        );
        
        // Update local state with data from database
        setSelectedProduct(prev => ({
          ...prev,
          expenses: updatedRecord.additionalExpenses,
          totalCost: updatedRecord.finalTotalCost
        }));
      }
  
      setSuccess("Expense deleted successfully from database!");
      setLoading(false);
  
    } catch (err) {
      console.error("Error in deleteExpense:", err);
      setError("Failed to delete from database: " + err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Add Extra Expenses to Existing Products
      </h2>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {/* Filter Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Filter Products</h3>
            <button
              onClick={clearAllFilters}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Clear All Filters
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Vendor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Vendor ({filterOptions.vendors.length} vendors)
              </label>
              <select
                value={selectedVendor}
                onChange={handleVendorChange}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- All Vendors --</option>
                {filterOptions.vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>

            {/* HSN Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by HSN Code ({filterOptions.hsnCodes.length} codes)
              </label>
              <select
                value={selectedHsn}
                onChange={handleHsnChange}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- All HSN Codes --</option>
                {filterOptions.hsnCodes.map((hsn) => (
                  <option key={hsn} value={hsn}>
                    {hsn}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Product Name ({filterOptions.productNames.length} products)
              </label>
              <select
                value={selectedProductName}
                onChange={handleProductNameChange}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- All Product Names --</option>
                {filterOptions.productNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedVendor || selectedHsn || selectedProductName) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {selectedVendor && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Vendor: {selectedVendor}
                </span>
              )}
              {selectedHsn && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  HSN: {selectedHsn}
                </span>
              )}
              {selectedProductName && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  Product: {selectedProductName}
                </span>
              )}
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {filteredProducts.length} products found
              </span>
            </div>
          )}
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Product from Filtered Results ({filteredProducts.length} available)
          </label>
          <select
            onChange={handleProductSelect}
            value={selectedProduct?.id || ""}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
            disabled={filteredProducts.length === 0}
          >
            <option value="">
              {filteredProducts.length === 0 
                ? "-- No products match current filters --" 
                : "-- Select Product --"}
            </option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.vendor} - HSN: {p.hsn} (₹{p.unitCost}/{p.qtyType})
              </option>
            ))}
          </select>
          {filteredProducts.length === 0 && (selectedVendor || selectedHsn || selectedProductName) && (
            <p className="text-sm text-orange-600 mt-1">
              No products match your current filter selection. Try adjusting the filters above.
            </p>
          )}
        </div>

        {/* Product Details */}
        {selectedProduct && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3">Product Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Product Name:</strong> {selectedProduct.name}</p>
                <p><strong>Vendor:</strong> {selectedProduct.vendor}</p>
                <p><strong>HSN Code:</strong> {selectedProduct.hsn || "N/A"}</p>
                <p><strong>Purchase Date:</strong> {new Date(selectedProduct.purchaseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Quantity:</strong> {selectedProduct.quantity} {selectedProduct.qtyType}</p>
                <p><strong>Per Unit Cost:</strong> ₹{selectedProduct.unitCost}</p>
                <p><strong>Original Total:</strong> ₹{selectedProduct.originalTotalCost}</p>
                <p><strong>Current Total Cost:</strong> ₹{selectedProduct.totalCost || selectedProduct.originalTotalCost}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Multiple Expenses Section */}
        {selectedProduct && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3 text-blue-800">Add Multiple Expenses</h3>
            
            <div className="bg-white rounded-lg border overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 bg-gray-100 p-3 font-medium text-gray-700">
                <div className="col-span-3">Expense Type</div>
                <div className="col-span-3">Amount Per Unit (₹)</div>
                <div className="col-span-2">Total Amount (₹)</div>
                <div className="col-span-3">Note (Optional)</div>
                <div className="col-span-1">Action</div>
              </div>

              {/* Expense Entries */}
              {expenseEntries.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 border-b border-gray-200 items-center">
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={entry.type}
                      onChange={(e) => handleExpenseEntryChange(index, "type", e.target.value)}
                      className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="e.g., Packing, Transport"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      value={entry.amountPerUnit}
                      onChange={(e) => handleExpenseEntryChange(index, "amountPerUnit", e.target.value)}
                      className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-gray-700 p-2 bg-gray-50 rounded">
                      ₹{entry.amountPerUnit ? (parseFloat(entry.amountPerUnit) * selectedProduct.quantity).toFixed(2) : "0.00"}
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={entry.note}
                      onChange={(e) => handleExpenseEntryChange(index, "note", e.target.value)}
                      className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="Details"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    {expenseEntries.length > 1 && (
                      <button
                        onClick={() => removeExpenseEntry(index)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 w-full text-xs"
                        title="Remove this expense"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Expense Button */}
            <div className="flex gap-3 mt-4 mb-4">
              <button
                onClick={addExpenseEntry}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 text-sm"
              >
                + Add Another Expense
              </button>
            </div>

            {/* Total Preview */}
            {expenseEntries.some(entry => entry.amountPerUnit) && (
              <div className="bg-white p-4 rounded-md border-2 border-blue-200 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Additional Expenses:</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ₹{expenseEntries.reduce((sum, entry) => 
                        sum + (parseFloat(entry.amountPerUnit || 0) * selectedProduct.quantity), 0
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">New Total Cost:</p>
                    <p className="text-xl font-bold text-blue-800">
                      ₹{(selectedProduct.totalCost +
                        expenseEntries.reduce((sum, entry) => 
                          sum + (parseFloat(entry.amountPerUnit || 0) * selectedProduct.quantity), 0
                        )).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Save All Expenses Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveExpenses}
                disabled={!expenseEntries.some(entry => entry.type.trim() && entry.amountPerUnit) || loading}
                className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1"
              >
                {loading ? "Saving..." : "Save All Expenses"}
              </button>
              
              <button
                onClick={() => setExpenseEntries([{ type: "", amountPerUnit: "", note: "" }])}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                disabled={loading}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expense History */}
      {selectedProduct && selectedProduct.expenses?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">
            Expense History for {selectedProduct.name}
          </h3>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Date Added</th>
                  <th className="border border-gray-300 p-3 text-left">Type</th>
                  <th className="border border-gray-300 p-3 text-right">Per Unit (₹)</th>
                  <th className="border border-gray-300 p-3 text-right">Total Amount (₹)</th>
                  <th className="border border-gray-300 p-3 text-left">Note</th>
                  <th className="border border-gray-300 p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedProduct.expenses.map((exp, idx) => {
                  const isEditing = exp.isEditing || false;

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">
                        {isEditing ? (
                          <input
                            type="date"
                            value={new Date(exp.dateAdded).toISOString().split('T')[0]}
                            onChange={(e) =>
                              handleEditChange(idx, "dateAdded", e.target.value)
                            }
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          new Date(exp.dateAdded).toLocaleDateString()
                        )}
                      </td>

                      <td className="border border-gray-300 p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={exp.type || ""}
                            onChange={(e) =>
                              handleEditChange(idx, "type", e.target.value)
                            }
                            className="border p-1 rounded w-full"
                            placeholder="Expense type"
                          />
                        ) : (
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {exp.type || "General"}
                          </span>
                        )}
                      </td>

                      <td className="border border-gray-300 p-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={exp.amountPerUnit}
                            onChange={(e) =>
                              handleEditChange(
                                idx,
                                "amountPerUnit",
                                e.target.value
                              )
                            }
                            className="border p-1 rounded w-full text-right"
                          />
                        ) : (
                          `₹${exp.amountPerUnit}`
                        )}
                      </td>

                      <td className="border border-gray-300 p-3 text-right font-medium">
                        ₹{exp.totalAmount}
                      </td>

                      <td className="border border-gray-300 p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={exp.note}
                            onChange={(e) =>
                              handleEditChange(idx, "note", e.target.value)
                            }
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          exp.note
                        )}
                      </td>

                      <td className="border border-gray-300 p-3 text-center">
                        <div className="flex gap-1 justify-center">
                          {isEditing ? (
                            <button
                              onClick={() => saveEdit(idx)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                              disabled={loading}
                            >
                              {loading ? "Saving..." : "Save"}
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleEdit(idx)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => deleteExpense(idx)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total Summary */}
          <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-200">
            <h4 className="text-lg font-medium mb-3 text-green-800">Cost Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Original Cost</p>
                <p className="text-lg font-semibold">
                  ₹{selectedProduct.originalTotalCost}
                </p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Total Extra Expenses</p>
                <p className="text-lg font-semibold text-orange-600">
                  ₹{selectedProduct.expenses.reduce(
                    (sum, exp) => sum + exp.totalAmount,
                    0
                  )}
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-green-400">
                <p className="text-sm text-gray-600">Final Total Cost</p>
                <p className="text-xl font-bold text-green-700">
                  ₹{selectedProduct.totalCost}
                </p>
                <p className="text-xs text-gray-500">
                  ₹{(selectedProduct.totalCost / selectedProduct.quantity).toFixed(2)} per unit
                </p>
              </div>
            </div>

            {/* Expense Breakdown */}
            {selectedProduct.expenses.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-green-800 mb-2">Expense Breakdown:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.expenses.map((exp, idx) => (
                    <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm border">
                      <strong>{exp.type || "General"}:</strong> ₹{exp.totalAmount}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProduct && selectedProduct.expenses?.length === 0 && (
        <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No additional expenses added yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Use the form above to add expenses like packing, transport, etc.
          </p>
        </div>
      )}
    </div>
  );
}