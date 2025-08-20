import React, { useState, useEffect } from "react";

export default function Expense() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expenseEntries, setExpenseEntries] = useState([
    { name: "", amount: "", note: "" }
  ]);

  // Load products from purchase invoices
  useEffect(() => {
    const purchaseInvoices =
      JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    const allProducts = [];

    purchaseInvoices.forEach((invoice) => {
      invoice.products.forEach((product, index) => {
        allProducts.push({
          id: `${invoice.vendor}-${index}-${product.name}`, // Unique ID
          name: product.name,
          vendor: invoice.vendor,
          hsn: product.hsn,
          qtyType: product.qtyType,
          quantity: product.quantity,
          unitCost: product.cost,
          totalCost: product.totalCost,
          purchaseDate: product.purchaseDate || invoice.date,
          expenses: product.expenses || []
        });
      });
    });

    setProducts(allProducts);
  }, []);

  // Handle product selection
  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
    // Reset form when product changes
    setExpenseEntries([{ name: "", amount: "", note: "" }]);
  };

  // Add new expense entry row
  const addExpenseEntry = () => {
    setExpenseEntries([...expenseEntries, { name: "", amount: "", note: "" }]);
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
  const handleSaveExpenses = () => {
    // Validate entries
    const validEntries = expenseEntries.filter(entry => 
      entry.name.trim() && entry.amount && parseFloat(entry.amount) > 0
    );

    if (!selectedProduct || validEntries.length === 0) {
      alert("Please select a product and add at least one valid expense!");
      return;
    }

    const newExpenses = validEntries.map(entry => {
      const perUnit = parseFloat(entry.amount);
      const totalAmount = perUnit * selectedProduct.quantity;

      return {
        type: entry.name.trim(),
        amountPerUnit: perUnit,
        totalAmount: totalAmount,
        note: entry.note.trim() || "No note provided",
        date: new Date().toISOString().split("T")[0]
      };
    });

    const totalExpenseAmount = newExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);

    // Update the product with new expenses
    const updatedProducts = products.map((p) =>
      p.id === selectedProduct.id
        ? {
            ...p,
            totalCost: p.totalCost + totalExpenseAmount,
            expenses: [...(p.expenses || []), ...newExpenses]
          }
        : p
    );

    // Update localStorage
    const purchaseInvoices =
      JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    const updatedInvoices = purchaseInvoices.map((invoice) => ({
      ...invoice,
      products: invoice.products.map((product, index) => {
        const productId = `${invoice.vendor}-${index}-${product.name}`;
        const updatedProduct = updatedProducts.find((p) => p.id === productId);
        return updatedProduct
          ? {
              ...product,
              totalCost: updatedProduct.totalCost,
              expenses: updatedProduct.expenses
            }
          : product;
      })
    }));

    localStorage.setItem("purchaseInvoices", JSON.stringify(updatedInvoices));
    setProducts(updatedProducts);

    // Update selected product state
    const updatedSelected = updatedProducts.find(
      (p) => p.id === selectedProduct.id
    );
    setSelectedProduct(updatedSelected);

    alert(`${validEntries.length} expense(s) added successfully!`);

    // Reset form
    setExpenseEntries([{ name: "", amount: "", note: "" }]);
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
      updatedExpenses[index].totalAmount = Number(value) * selectedProduct.quantity;
    } else {
      updatedExpenses[index][field] = value;
    }
    setSelectedProduct({ ...selectedProduct, expenses: updatedExpenses });
  };

  const saveEdit = (index) => {
    const updatedExpenses = [...selectedProduct.expenses];
    updatedExpenses[index].isEditing = false;

    // Recalculate total cost from original + all expense totals
    const totalExtra = updatedExpenses.reduce(
      (sum, exp) => sum + (exp.totalAmount || exp.amountPerUnit * selectedProduct.quantity),
      0
    );
    const newTotalCost =
      selectedProduct.quantity * selectedProduct.unitCost + totalExtra;

    // Update products state
    const updatedProducts = products.map((p) =>
      p.id === selectedProduct.id
        ? { ...p, expenses: updatedExpenses, totalCost: newTotalCost }
        : p
    );

    setProducts(updatedProducts);
    setSelectedProduct({
      ...selectedProduct,
      expenses: updatedExpenses,
      totalCost: newTotalCost
    });

    // Update localStorage
    const purchaseInvoices =
      JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    const updatedInvoices = purchaseInvoices.map((invoice) => ({
      ...invoice,
      products: invoice.products.map((product, idx) => {
        const productId = `${invoice.vendor}-${idx}-${product.name}`;
        return productId === selectedProduct.id
          ? {
              ...product,
              expenses: updatedExpenses,
              totalCost: newTotalCost
            }
          : product;
      })
    }));

    localStorage.setItem("purchaseInvoices", JSON.stringify(updatedInvoices));
  };

  const deleteExpense = (index) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    const updatedExpenses = selectedProduct.expenses.filter((_, i) => i !== index);

    // Recalculate total cost after deletion
    const totalExtra = updatedExpenses.reduce(
      (sum, exp) => sum + (exp.totalAmount || exp.amountPerUnit * selectedProduct.quantity),
      0
    );
    const newTotalCost =
      selectedProduct.quantity * selectedProduct.unitCost + totalExtra;

    const updatedProduct = {
      ...selectedProduct,
      expenses: updatedExpenses,
      totalCost: newTotalCost
    };

    const updatedProducts = products.map((p) =>
      p.id === selectedProduct.id ? updatedProduct : p
    );

    setProducts(updatedProducts);
    setSelectedProduct(updatedProduct);

    // Update localStorage
    const purchaseInvoices =
      JSON.parse(localStorage.getItem("purchaseInvoices")) || [];
    const updatedInvoices = purchaseInvoices.map((invoice) => ({
      ...invoice,
      products: invoice.products.map((product, idx) => {
        const productId = `${invoice.vendor}-${idx}-${product.name}`;
        return productId === selectedProduct.id
          ? {
              ...product,
              expenses: updatedExpenses,
              totalCost: newTotalCost
            }
          : product;
      })
    }));

    localStorage.setItem("purchaseInvoices", JSON.stringify(updatedInvoices));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Add Extra Expenses to Existing Products
      </h2>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Product
          </label>
          <select
            onChange={handleProductSelect}
            value={selectedProduct?.id || ""}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.vendor} (₹{p.unitCost}/{p.qtyType})
              </option>
            ))}
          </select>
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
                <p><strong>Original Total:</strong> ₹{selectedProduct.quantity * selectedProduct.unitCost}</p>
                <p><strong>Current Total Cost:</strong> ₹{selectedProduct.totalCost}</p>
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
                <div className="col-span-3">Expense Name</div>
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
                      value={entry.name}
                      onChange={(e) => handleExpenseEntryChange(index, "name", e.target.value)}
                      className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="e.g., Packing"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      value={entry.amount}
                      onChange={(e) => handleExpenseEntryChange(index, "amount", e.target.value)}
                      className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-gray-700 p-2 bg-gray-50 rounded">
                      ₹{entry.amount ? (parseFloat(entry.amount) * selectedProduct.quantity).toFixed(2) : "0.00"}
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
            {expenseEntries.some(entry => entry.amount) && (
              <div className="bg-white p-4 rounded-md border-2 border-blue-200 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Additional Expenses:</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ₹{expenseEntries.reduce((sum, entry) => 
                        sum + (parseFloat(entry.amount || 0) * selectedProduct.quantity), 0
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">New Total Cost:</p>
                    <p className="text-xl font-bold text-blue-800">
                      ₹{(selectedProduct.totalCost +
                        expenseEntries.reduce((sum, entry) => 
                          sum + (parseFloat(entry.amount || 0) * selectedProduct.quantity), 0
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
                disabled={!expenseEntries.some(entry => entry.name.trim() && entry.amount)}
                className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1"
              >
                Save All Expenses
              </button>
              
              <button
                onClick={() => setExpenseEntries([{ name: "", amount: "", note: "" }])}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
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
                  <th className="border border-gray-300 p-3 text-left">Date</th>
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
                            value={exp.date}
                            onChange={(e) =>
                              handleEditChange(idx, "date", e.target.value)
                            }
                            className="border p-1 rounded w-full"
                          />
                        ) : (
                          new Date(exp.date).toLocaleDateString()
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
                            placeholder="Expense name"
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
                            >
                              Save
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
                  ₹{selectedProduct.quantity * selectedProduct.unitCost}
                </p>
              </div>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">Total Extra Expenses</p>
                <p className="text-lg font-semibold text-orange-600">
                  ₹{selectedProduct.expenses.reduce(
                    (sum, exp) =>
                      sum + (exp.totalAmount || exp.amountPerUnit * selectedProduct.quantity),
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