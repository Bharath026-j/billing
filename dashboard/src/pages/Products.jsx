import React, { useState } from "react";

export default function Products() {
  const [product, setProduct] = useState({
    name: "",
    hsn: "",
    cost: "",
    totalUnit: "",
    totalCost: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => {
      let updated = { ...prev, [name]: value };

      // Auto-calculate total cost
      if (name === "cost" || name === "totalUnit") {
        const cost = parseFloat(name === "cost" ? value : updated.cost) || 0;
        const units = parseFloat(name === "totalUnit" ? value : updated.totalUnit) || 0;
        updated.totalCost = (cost * units).toFixed(2);
      }

      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product Data:", product);
    alert(`Product Saved!\nTotal Cost: ₹${product.totalCost}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add Product</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* Horizontal Layout */}
        <div className="grid grid-cols-5 gap-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
              placeholder="Product name"
            />
          </div>

          {/* HSN Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              HSN Code
            </label>
            <input
              type="text"
              name="hsn"
              value={product.hsn}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
              placeholder="HSN code"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost
            </label>
            <input
              type="number"
              name="cost"
              value={product.cost}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
              placeholder="Cost"
            />
          </div>

          {/* Total Units */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Units
            </label>
            <input
              type="number"
              name="totalUnit"
              value={product.totalUnit}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-2 focus:ring-blue-400"
              placeholder="Units"
            />
          </div>

          {/* Total Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Cost
            </label>
            <input
              type="number"
              name="totalCost"
              value={product.totalCost}
              readOnly
              className="mt-1 block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm p-2 border"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
