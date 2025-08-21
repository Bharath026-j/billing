// import mongoose from "mongoose";

// const expenseSchema = new mongoose.Schema({
//   // Reference to the original purchase invoice
//   purchaseInvoiceId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'PurchaseInvoice', 
//     required: true 
//   },
  
//   // Product details from the original invoice
//   productDetails: {
//     name: { type: String, required: true },
//     hsn: { type: String, required: true },
//     vendor: { type: String, required: true },
//     originalQuantity: { type: Number, required: true },
//     originalUnitCost: { type: Number, required: true },
//     originalTotalCost: { type: Number, required: true },
//     qtyType: { type: String, enum: ["pcs", "kg", "ltr", "box"], required: true },
//     purchaseDate: { type: Date, required: true }
//   },

//   // Array of additional expenses
//   additionalExpenses: [{
//     type: { type: String, required: true }, // e.g., "Packing", "Transport", "Labor"
//     amountPerUnit: { type: Number, required: true, min: 0 },
//     totalAmount: { type: Number, required: true, min: 0 },
//     note: { type: String, default: "No note provided" },
//     dateAdded: { type: Date, default: Date.now }
//   }],

//   // Calculated totals
//   totalAdditionalExpenses: { type: Number, required: true, default: 0 },
//   finalTotalCost: { type: Number, required: true }, // Original + Additional expenses
//   finalCostPerUnit: { type: Number, required: true },

//   // Metadata
//   createdBy: { type: String, default: "system" }, // Can be user ID later
//   lastUpdated: { type: Date, default: Date.now }

// }, { 
//   timestamps: true,
//   // Add indexes for better query performance
//   indexes: [
//     { purchaseInvoiceId: 1 },
//     { "productDetails.vendor": 1 },
//     { "productDetails.hsn": 1 },
//     { "productDetails.name": 1 }
//   ]
// });

// // Pre-save middleware to calculate totals
// expenseSchema.pre('save', function(next) {
//   // Calculate total additional expenses
//   this.totalAdditionalExpenses = this.additionalExpenses.reduce((sum, expense) => {
//     return sum + expense.totalAmount;
//   }, 0);

//   // Calculate final total cost
//   this.finalTotalCost = this.productDetails.originalTotalCost + this.totalAdditionalExpenses;

//   // Calculate final cost per unit
//   this.finalCostPerUnit = this.finalTotalCost / this.productDetails.originalQuantity;

//   // Update lastUpdated
//   this.lastUpdated = new Date();

//   next();
// });

// // Static methods for common queries
// expenseSchema.statics.findByVendor = function(vendor) {
//   return this.find({ "productDetails.vendor": vendor });
// };

// expenseSchema.statics.findByHSN = function(hsn) {
//   return this.find({ "productDetails.hsn": hsn });
// };

// expenseSchema.statics.findByProductName = function(name) {
//   return this.find({ "productDetails.name": name });
// };

// // Instance methods
// expenseSchema.methods.addExpense = function(expenseData) {
//   const { type, amountPerUnit, note } = expenseData;
//   const totalAmount = amountPerUnit * this.productDetails.originalQuantity;
  
//   this.additionalExpenses.push({
//     type,
//     amountPerUnit,
//     totalAmount,
//     note: note || "No note provided",
//     dateAdded: new Date()
//   });
  
//   return this.save();
// };

// expenseSchema.methods.removeExpense = function(expenseId) {
//   this.additionalExpenses = this.additionalExpenses.filter(
//     expense => expense._id.toString() !== expenseId.toString()
//   );
//   return this.save();
// };

// expenseSchema.methods.updateExpense = function(expenseId, updateData) {
//   const expense = this.additionalExpenses.id(expenseId);
//   if (expense) {
//     Object.assign(expense, updateData);
//     if (updateData.amountPerUnit) {
//       expense.totalAmount = updateData.amountPerUnit * this.productDetails.originalQuantity;
//     }
//   }
//   return this.save();
// };

// const Expense = mongoose.model("Expense", expenseSchema);

// export default Expense;


import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  // Reference to the original purchase invoice
  purchaseInvoiceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PurchaseInvoice', 
    required: true 
  },
  
  // Product details from the original invoice
  productDetails: {
    name: { type: String, required: true },
    hsn: { type: String, required: true },
    vendor: { type: String, required: true },
    originalQuantity: { type: Number, required: true },
    originalUnitCost: { type: Number, required: true },
    originalTotalCost: { type: Number, required: true },
    qtyType: { type: String, enum: ["pcs", "kg", "ltr", "box"], required: true },
    purchaseDate: { type: Date, required: true }
  },

  // Array of additional expenses
  additionalExpenses: [{
    type: { type: String, required: true }, // e.g., "Packing", "Transport", "Labor"
    amountPerUnit: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "No note provided" },
    dateAdded: { type: Date, default: Date.now }
  }],

  // Calculated totals - MAKE THESE NOT REQUIRED OR SET DEFAULTS
  totalAdditionalExpenses: { type: Number, default: 0 },
  finalTotalCost: { type: Number, default: 0 }, // Remove required temporarily
  finalCostPerUnit: { type: Number, default: 0 }, // Remove required temporarily

  // Metadata
  createdBy: { type: String, default: "system" },
  lastUpdated: { type: Date, default: Date.now }

}, { 
  timestamps: true,
  indexes: [
    { purchaseInvoiceId: 1 },
    { "productDetails.vendor": 1 },
    { "productDetails.hsn": 1 },
    { "productDetails.name": 1 }
  ]
});

// Pre-save middleware to calculate totals - FIXED VERSION
expenseSchema.pre('save', function(next) {
  try {
    // Calculate total additional expenses
    this.totalAdditionalExpenses = this.additionalExpenses.reduce((sum, expense) => {
      return sum + (expense.totalAmount || 0);
    }, 0);

    // Calculate final total cost
    this.finalTotalCost = (this.productDetails.originalTotalCost || 0) + this.totalAdditionalExpenses;

    // Calculate final cost per unit - handle division by zero
    if (this.productDetails.originalQuantity && this.productDetails.originalQuantity > 0) {
      this.finalCostPerUnit = this.finalTotalCost / this.productDetails.originalQuantity;
    } else {
      this.finalCostPerUnit = 0;
    }

    // Update lastUpdated
    this.lastUpdated = new Date();

    next();
  } catch (error) {
    console.error("Error in pre-save middleware:", error);
    next(error);
  }
});

// Static methods for common queries
expenseSchema.statics.findByVendor = function(vendor) {
  return this.find({ "productDetails.vendor": vendor });
};

expenseSchema.statics.findByHSN = function(hsn) {
  return this.find({ "productDetails.hsn": hsn });
};

expenseSchema.statics.findByProductName = function(name) {
  return this.find({ "productDetails.name": name });
};

// Instance methods
expenseSchema.methods.addExpense = function(expenseData) {
  const { type, amountPerUnit, note } = expenseData;
  const totalAmount = amountPerUnit * this.productDetails.originalQuantity;
  
  this.additionalExpenses.push({
    type,
    amountPerUnit,
    totalAmount,
    note: note || "No note provided",
    dateAdded: new Date()
  });
  
  return this.save();
};

expenseSchema.methods.removeExpense = function(expenseId) {
  this.additionalExpenses = this.additionalExpenses.filter(
    expense => expense._id.toString() !== expenseId.toString()
  );
  return this.save();
};

expenseSchema.methods.updateExpense = function(expenseId, updateData) {
  const expense = this.additionalExpenses.id(expenseId);
  if (expense) {
    Object.assign(expense, updateData);
    if (updateData.amountPerUnit) {
      expense.totalAmount = updateData.amountPerUnit * this.productDetails.originalQuantity;
    }
  }
  return this.save();
};

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;