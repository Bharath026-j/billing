import React, { useEffect, useState } from "react";

export default function Reports() {
  const [buyData, setBuyData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [totals, setTotals] = useState({ totalBuy: 0, totalSales: 0, profit: 0 });

  useEffect(() => {
    const buys = JSON.parse(localStorage.getItem("products")) || [];
    const sales = JSON.parse(localStorage.getItem("salesInvoices")) || [];

    setBuyData(buys);
    setSalesData(sales);

    const totalBuy = buys.reduce((sum, item) => sum + parseFloat(item.totalCost || 0), 0);
    const totalSales = sales.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
    const profit = totalSales - totalBuy;

    setTotals({ totalBuy, totalSales, profit });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Buy & Sales Report</h2>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Purchase Records</h3>
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">HSN</th>
                <th className="p-2 border">Cost</th>
                <th className="p-2 border">Units</th>
                <th className="p-2 border">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {buyData.length > 0 ? (
                buyData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.hsn}</td>
                    <td className="p-2 border">₹{item.cost}</td>
                    <td className="p-2 border">{item.totalUnit}</td>
                    <td className="p-2 border">₹{item.totalCost}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-2 border">No purchase records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Sales Records</h3>
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Invoice #</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? (
                salesData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{item.invoiceNumber}</td>
                    <td className="p-2 border">{item.customerName}</td>
                    <td className="p-2 border">{item.productName}</td>
                    <td className="p-2 border">{item.quantity}</td>
                    <td className="p-2 border">₹{item.unitPrice}</td>
                    <td className="p-2 border">₹{item.totalAmount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-2 border">No sales records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <p><strong>Total Purchases:</strong> ₹{totals.totalBuy.toFixed(2)}</p>
          <p><strong>Total Sales:</strong> ₹{totals.totalSales.toFixed(2)}</p>
          <p>
            <strong>Profit/Loss:</strong>{" "}
            <span className={totals.profit >= 0 ? "text-green-600" : "text-red-600"}>
              ₹{totals.profit.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
