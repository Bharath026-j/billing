//import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Product name is required"],
//     trim: true,
//   },
//   hsn: {
//     type: String,
//     default: "",
//     required: [true, "HSN code is required"],
//   },
//   qtyType: {
//     type: String,
//     enum: ["pcs", "kg", "ltr", "box"], // expand if needed
//     default: "pcs",
//   },
//   quantity: {
//     type: Number,
//     required: [true, "Quantity is required"],
//     min: [1, "Quantity must be at least 1"],
//   },
//   cost: {
//     type: Number,
//     required: [true, "Unit cost is required"],
//     min: [0, "Cost cannot be negative"],
//   },
//   totalCost: {
//     type: Number,
//     required: true,
//     min: [0, "Total cost cannot be negative"],
//   },
//   purchaseDate: {
//     type: Date,
//     required: true,
    
//   },
//   expenses: {
//     type: [String], // could be changed later to array of objects if detailed
//     default: [],
//   },
// });

// const purchaseInvoiceSchema = new mongoose.Schema(
//   {
//     date: {
//       type: Date,
//       required: [true, "Purchase date is required"],
//     },
//     vendor: {
//       type: String,
//       required: [true, "Vendor name is required"],
//       trim: true,
//     },
//     phone: {
//       type: String,
//       required: [true, "Vendor phone number is required"],
//       match: [/^\d{10}$/, "Phone number must be 10 digits"],
//     },
//     products: {
//       type: [productSchema],
//       validate: {
//         validator: function (v) {
//           return v.length > 0;
//         },
//         message: "At least one product is required",
//       },
//     },
//   },
//   { timestamps: true } // adds createdAt & updatedAt
// );

// const PurchaseModel = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);

// export default PurchaseModel;



// const vendorSchema = new mongoose.Schema({
//     date:{type:date, required:true},
//     name:{type:String, required:true},
//     phone:{type:Number, required:true, unique:true},

// })

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
