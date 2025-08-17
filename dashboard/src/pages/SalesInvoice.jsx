import React, { useState } from "react";

export default function SalesInvoice() {
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  const [products, setProducts] = useState([
    { productName: "", quantity: "", qtyType: "pcs", unitPrice: "", totalAmount: "" }
  ]);

  // Example product list from purchase/products invoice
  const productList = [
    "Product A",
    "Product B",
    "Product C",
    "Product D"
  ];

  const qtyTypes = ["pcs", "box", "kg"];

  const maxDate = new Date().toISOString().split("T")[0];

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;

    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(updatedProducts[index].quantity) || 0;
      const price = parseFloat(updatedProducts[index].unitPrice) || 0;
      updatedProducts[index].totalAmount = (qty * price).toFixed(2);
    }

    setProducts(updatedProducts);
  };

  const addProductRow = () => {
    setProducts([...products, { productName: "", quantity: "", qtyType: "pcs", unitPrice: "", totalAmount: "" }]);
  };

  const removeLastProductRow = () => {
    if (products.length > 1) {
      setProducts(products.slice(0, -1));
    }
  };

  const handleSaveInvoice = (e) => {
    e.preventDefault();

    const filledProducts = products.filter(
      (p) => p.productName && p.quantity && p.unitPrice
    );

    if (!customerName || !customerAddress || filledProducts.length === 0) {
      alert("Please fill in all required fields and at least one product.");
      return;
    }

    const invoiceData = {
      customerName,
      customerAddress,
      date,
      products: filledProducts
    };

    console.log("Invoice Saved:", invoiceData);
    alert("Invoice saved successfully!");

    setCustomerName("");
    setCustomerAddress("");
    setDate(maxDate);
    setProducts([{ productName: "", quantity: "", qtyType: "pcs", unitPrice: "", totalAmount: "" }]);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create Sales Invoice</h2>
      <form
        onSubmit={handleSaveInvoice}
        className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* Customer Details */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              placeholder="Enter customer name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              placeholder="Enter customer address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={maxDate}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              required
            />
          </div>
        </div>

        {/* Product List */}
        <div>
          <h3 className="text-lg font-medium mb-2">Products</h3>
          {products.map((product, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 mb-2">
              {/* Product Search */}
              <select
                value={product.productName}
                onChange={(e) => handleProductChange(index, "productName", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Select Product</option>
                {productList.map((prod, i) => (
                  <option key={i} value={prod}>{prod}</option>
                ))}
              </select>

              {/* Quantity */}
              <input
                type="number"
                value={product.quantity}
                onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                placeholder="Qty"
                className="border p-2 rounded"
              />

              {/* Quantity Type */}
              <select
                value={product.qtyType}
                onChange={(e) => handleProductChange(index, "qtyType", e.target.value)}
                className="border p-2 rounded"
              >
                {qtyTypes.map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))}
              </select>

              {/* Unit Price */}
              <input
                type="number"
                value={product.unitPrice}
                onChange={(e) => handleProductChange(index, "unitPrice", e.target.value)}
                placeholder="Unit Price"
                className="border p-2 rounded"
              />

              {/* Total */}
              <input
                type="number"
                value={product.totalAmount}
                readOnly
                placeholder="Total"
                className="border p-2 rounded bg-gray-100"
              />

              {/* Hidden Remove in Row */}
              <div></div>
            </div>
          ))}

          {/* Buttons Below */}
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={addProductRow}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              + Add Product
            </button>
            <button
              type="button"
              onClick={removeLastProductRow}
              className="bg-red-500 text-white px-4 py-1 rounded"
            >
              X Remove Last
            </button>
          </div>
        </div>

        {/* Save Invoice */}
        <div className="pt-4">
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
