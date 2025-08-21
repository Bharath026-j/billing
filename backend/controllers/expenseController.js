import Expense from "../models/expenseModel.js";
import PurchaseInvoice from "../models/purchaseModel.js";

// Get all products from purchase invoices for expense tracking
export const getProductsForExpenseTracking = async (req, res) => {
  try {
    const purchaseInvoices = await PurchaseInvoice.find().sort({ createdAt: -1 });
    
    const allProducts = [];
    
    purchaseInvoices.forEach((invoice) => {
      invoice.products.forEach((product, index) => {
        allProducts.push({
          id: `${invoice._id}-${index}`, // Unique identifier
          purchaseInvoiceId: invoice._id,
          productIndex: index,
          name: product.name,
          vendor: invoice.vendor,
          phone: invoice.phone,
          hsn: product.hsn,
          qtyType: product.qtyType,
          quantity: product.quantity,
          unitCost: product.cost,
          originalTotalCost: product.totalCost,
          purchaseDate: product.purchaseDate || invoice.date,
          invoiceDate: invoice.date
        });
      });
    });

    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unique filter options
export const getFilterOptions = async (req, res) => {
  try {
    const purchaseInvoices = await PurchaseInvoice.find();
    
    const vendors = new Set();
    const hsnCodes = new Set();
    const productNames = new Set();
    
    purchaseInvoices.forEach((invoice) => {
      vendors.add(invoice.vendor);
      invoice.products.forEach((product) => {
        hsnCodes.add(product.hsn);
        productNames.add(product.name);
      });
    });

    res.status(200).json({
      vendors: Array.from(vendors).sort(),
      hsnCodes: Array.from(hsnCodes).sort(),
      productNames: Array.from(productNames).sort()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update expense record for a product
export const createOrUpdateProductExpense = async (req, res) => {
  try {
    const { 
      purchaseInvoiceId, 
      productIndex, 
      productDetails, 
      newExpenses 
    } = req.body;

    // Validate that the purchase invoice and product exist
    const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId);
    if (!purchaseInvoice) {
      return res.status(404).json({ error: "Purchase invoice not found" });
    }

    if (!purchaseInvoice.products[productIndex]) {
      return res.status(404).json({ error: "Product not found in invoice" });
    }

    // Check if expense record already exists for this product
    let expenseRecord = await Expense.findOne({
      purchaseInvoiceId,
      "productDetails.name": productDetails.name,
      "productDetails.hsn": productDetails.hsn
    });

    if (expenseRecord) {
      // Add new expenses to existing record
      newExpenses.forEach(expense => {
        expenseRecord.additionalExpenses.push({
          type: expense.type,
          amountPerUnit: expense.amountPerUnit,
          totalAmount: expense.totalAmount,
          note: expense.note,
          dateAdded: new Date()
        });
      });
    } else {
      // Create new expense record
      expenseRecord = new Expense({
        purchaseInvoiceId,
        productDetails,
        additionalExpenses: newExpenses.map(expense => ({
          ...expense,
          dateAdded: new Date()
        }))
      });
    }

    const savedExpense = await expenseRecord.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get expense record for a specific product
// export const getProductExpense = async (req, res) => {
//   try {
//     const { purchaseInvoiceId, productName, hsn } = req.params;
    
//     const expenseRecord = await Expense.findOne({
//       purchaseInvoiceId,
//       "productDetails.name": productName,
//       "productDetails.hsn": hsn
//     }).populate('purchaseInvoiceId');

//     if (!expenseRecord) {
//       return res.status(404).json({ error: "Expense record not found" });
//     }

//     res.status(200).json(expenseRecord);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// In expenseController.js
export const getProductExpense = async (req, res) => {
    try {
      const { purchaseInvoiceId, productName, hsn } = req.params;
      
      const expenseRecord = await Expense.findOne({
        purchaseInvoiceId,
        "productDetails.name": productName,
        "productDetails.hsn": hsn
      }).populate('purchaseInvoiceId');
  
      if (!expenseRecord) {
        return res.status(404).json({ error: "Expense record not found" });
      }
  
      res.status(200).json(expenseRecord);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


// Get all expense records
export const getAllExpenseRecords = async (req, res) => {
  try {
    const { vendor, hsn, productName } = req.query;
    
    let filter = {};
    
    if (vendor) filter["productDetails.vendor"] = vendor;
    if (hsn) filter["productDetails.hsn"] = hsn;
    if (productName) filter["productDetails.name"] = productName;

    const expenseRecords = await Expense.find(filter)
      .populate('purchaseInvoiceId')
      .sort({ createdAt: -1 });

    res.status(200).json(expenseRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a specific expense in a record
export const updateExpenseItem = async (req, res) => {
    try {
      const { expenseRecordId, expenseItemId } = req.params;
      const updateData = req.body;
  
      console.log("UPDATE - Expense Record ID:", expenseRecordId);
      console.log("UPDATE - Expense Item ID:", expenseItemId);
      console.log("UPDATE - Data:", updateData);
  
      // Find the expense record
      const expenseRecord = await Expense.findById(expenseRecordId);
      if (!expenseRecord) {
        console.log("UPDATE - Expense record not found");
        return res.status(404).json({ error: "Expense record not found" });
      }
  
      // Find the specific expense item using id() method
      const expenseItem = expenseRecord.additionalExpenses.id(expenseItemId);
      if (!expenseItem) {
        console.log("UPDATE - Expense item not found");
        return res.status(404).json({ error: "Expense item not found" });
      }
  
      // Update the expense item fields
      if (updateData.type !== undefined) expenseItem.type = updateData.type;
      if (updateData.amountPerUnit !== undefined) {
        expenseItem.amountPerUnit = updateData.amountPerUnit;
        expenseItem.totalAmount = updateData.amountPerUnit * expenseRecord.productDetails.originalQuantity;
      }
      if (updateData.note !== undefined) expenseItem.note = updateData.note;
  
      // Mark the array as modified
      expenseRecord.markModified('additionalExpenses');
  
      // Save the updated document
      const updatedRecord = await expenseRecord.save();
      
      console.log("UPDATE - Successfully updated");
      res.status(200).json(updatedRecord);
  
    } catch (error) {
      console.error("UPDATE - Error:", error);
      res.status(400).json({ error: error.message });
    }
  };

// Delete a specific expense from a record
export const deleteExpenseItem = async (req, res) => {
    try {
      const { expenseRecordId, expenseItemId } = req.params;
  
      console.log("DELETE - Expense Record ID:", expenseRecordId);
      console.log("DELETE - Expense Item ID:", expenseItemId);
  
      // Find the expense record
      const expenseRecord = await Expense.findById(expenseRecordId);
      if (!expenseRecord) {
        console.log("DELETE - Expense record not found");
        return res.status(404).json({ error: "Expense record not found" });
      }
  
      // Check if the expense item exists
      const expenseItem = expenseRecord.additionalExpenses.id(expenseItemId);
      if (!expenseItem) {
        console.log("DELETE - Expense item not found");
        return res.status(404).json({ error: "Expense item not found" });
      }
  
      // Remove the expense item using pull()
      expenseRecord.additionalExpenses.pull(expenseItemId);
  
      // Save the updated document
      const updatedRecord = await expenseRecord.save();
      
      console.log("DELETE - Successfully deleted");
      res.status(200).json(updatedRecord);
  
    } catch (error) {
      console.error("DELETE - Error:", error);
      res.status(500).json({ error: error.message });
    }
  };

// Delete entire expense record
export const deleteExpenseRecord = async (req, res) => {
  try {
    const { expenseRecordId } = req.params;
    
    const deletedRecord = await Expense.findByIdAndDelete(expenseRecordId);
    if (!deletedRecord) {
      return res.status(404).json({ error: "Expense record not found" });
    }

    res.status(200).json({ message: "Expense record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expense summary/analytics
export const getExpenseSummary = async (req, res) => {
  try {
    const { vendor, hsn, startDate, endDate } = req.query;
    
    let matchFilter = {};
    if (vendor) matchFilter["productDetails.vendor"] = vendor;
    if (hsn) matchFilter["productDetails.hsn"] = hsn;
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    const summary = await Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalOriginalCost: { $sum: "$productDetails.originalTotalCost" },
          totalAdditionalExpenses: { $sum: "$totalAdditionalExpenses" },
          totalFinalCost: { $sum: "$finalTotalCost" },
          avgAdditionalExpensePercentage: {
            $avg: {
              $multiply: [
                { $divide: ["$totalAdditionalExpenses", "$productDetails.originalTotalCost"] },
                100
              ]
            }
          }
        }
      }
    ]);

    const vendorSummary = await Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$productDetails.vendor",
          totalRecords: { $sum: 1 },
          totalOriginalCost: { $sum: "$productDetails.originalTotalCost" },
          totalAdditionalExpenses: { $sum: "$totalAdditionalExpenses" },
          totalFinalCost: { $sum: "$finalTotalCost" }
        }
      },
      { $sort: { totalFinalCost: -1 } }
    ]);

    res.status(200).json({
      overall: summary[0] || {
        totalRecords: 0,
        totalOriginalCost: 0,
        totalAdditionalExpenses: 0,
        totalFinalCost: 0,
        avgAdditionalExpensePercentage: 0
      },
      byVendor: vendorSummary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};