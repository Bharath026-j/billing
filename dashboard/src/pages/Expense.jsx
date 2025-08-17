import React, { useState, useEffect } from "react";

export default function Expense() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [extraExpense, setExtraExpense] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

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
  };

  // Handle saving expense (per-unit)
  const handleSaveExpense = () => {
    if (!selectedProduct || !extraExpense) {
      alert("Please select a product and enter extra expense per unit!");
      return;
    }

    const perUnit = parseFloat(extraExpense);
    const totalAmount = perUnit * selectedProduct.quantity;

    const newExpense = {
      amountPerUnit: perUnit,
      totalAmount: totalAmount,
      note: expenseNote || "No note provided",
      date: new Date().toISOString().split("T")[0]
    };

    // Update the product with new expense
    const updatedProducts = products.map((p) =>
      p.id === selectedProduct.id
        ? {
            ...p,
            totalCost: p.totalCost + totalAmount,
            expenses: [...(p.expenses || []), newExpense]
          }
        : p
    );

    // Update localStorage - restructure back to purchase invoices
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

    alert("Extra expense (per-unit) added successfully!");

    // Reset fields
    setExtraExpense("");
    setExpenseNote("");
  };

  const toggleEdit = (index) => {
    const updatedExpenses = [...selectedProduct.expenses];
    updatedExpenses[index].isEditing = !updatedExpenses[index].isEditing;
    setSelectedProduct({ ...selectedProduct, expenses: updatedExpenses });
  };

  const handleEditChange = (index, field, value) => {
    const updatedExpenses = [...selectedProduct.expenses];
    updatedExpenses[index][field] = value;
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
        Add Extra Expense (Per Unit) to Existing Product
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

        {/* Extra Expense Input */}
        {selectedProduct && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Extra Expense Per Unit (₹)
              </label>
              <input
                type="number"
                value={extraExpense}
                onChange={(e) => setExtraExpense(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
                placeholder="Enter extra cost per unit"
              />
            </div>

            {/* Expense Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expense Note
              </label>
              <input
                type="text"
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
                placeholder="Enter note for this expense"
              />
            </div>
          </>
        )}

        {/* New Total Cost Preview */}
        {selectedProduct && extraExpense && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-lg font-semibold text-blue-800">
              New Total Cost: ₹
              {selectedProduct.totalCost +
                parseFloat(extraExpense || 0) * selectedProduct.quantity}
            </p>
            <p className="text-sm text-blue-600">
              Extra Expense: ₹{extraExpense} × {selectedProduct.quantity} = ₹
              {parseFloat(extraExpense || 0) * selectedProduct.quantity}
            </p>
          </div>
        )}

        {/* Submit Button */}
        {selectedProduct && (
          <div className="pt-4">
            <button
              onClick={handleSaveExpense}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Save Expense
            </button>
          </div>
        )}
      </div>

      {/* Expense History */}
      {selectedProduct && selectedProduct.expenses?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">
            Expense History for {selectedProduct.name}
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Per Unit (₹)</th>
                <th className="border border-gray-300 p-2">Total Amount (₹)</th>
                <th className="border border-gray-300 p-2">Note</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedProduct.expenses.map((exp, idx) => {
                const isEditing = exp.isEditing || false;

                return (
                  <tr key={idx}>
                    <td className="border border-gray-300 p-2">
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

                    <td className="border border-gray-300 p-2">
                      {isEditing ? (
                        <input
                          type="number"
                          value={exp.amountPerUnit}
                          onChange={(e) =>
                            handleEditChange(
                              idx,
                              "amountPerUnit",
                              Number(e.target.value)
                            )
                          }
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        `₹${exp.amountPerUnit}`
                      )}
                    </td>

                    <td className="border border-gray-300 p-2">
                      ₹{exp.totalAmount}
                    </td>

                    <td className="border border-gray-300 p-2">
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

                    <td className="border border-gray-300 p-2">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(idx)}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2 text-sm"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleEdit(idx)}
                          className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteExpense(idx)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Total Summary */}
          <div className="mt-4 bg-green-50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Original Cost:</strong> ₹
                  {selectedProduct.quantity * selectedProduct.unitCost}
                </p>
                <p>
                  <strong>Total Extra Expenses:</strong> ₹
                  {selectedProduct.expenses.reduce(
                    (sum, exp) =>
                      sum + (exp.totalAmount || exp.amountPerUnit * selectedProduct.quantity),
                    0
                  )}
                </p>
              </div>
              <div>
                <p className="text-lg">
                  <strong>Final Total Cost:</strong> ₹{selectedProduct.totalCost}
                </p>
                <p>
                  <strong>Cost Per Unit (with expenses):</strong> ₹
                  {(selectedProduct.totalCost / selectedProduct.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
