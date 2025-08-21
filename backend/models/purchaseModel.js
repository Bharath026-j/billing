import mongoose from "mongoose";

const purchaseInvoiceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  vendor: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Phone number must be 10 digits"],
  },
  products: [
    {
      name: { type: String, required: true },
      hsn: { type: String, required: true },
      qtyType: { type: String, enum: ["pcs", "kg", "ltr", "box"], default: "pcs" },
      quantity: { type: Number, required: true, min: 1 },
      cost: { type: Number, required: true, min: 0 },
      totalCost: { type: Number, required: true, min: 0 },
      purchaseDate: { type: Date, required: true },
      expenses: { type: [String], default: [] },
    },
  ],
}, { timestamps: true });

const PurchaseInvoice = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);

export default PurchaseInvoice;
