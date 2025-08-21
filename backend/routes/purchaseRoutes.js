import express from "express";
import {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  updatePurchaseInvoice,
  deletePurchaseInvoice,
} from "../controllers/purchaseController.js";
import PurchaseInvoice from "../models/purchaseModel.js";

// Import expense controller functions
import {
  getProductsForExpenseTracking,
  getFilterOptions,
  createOrUpdateProductExpense,
  getProductExpense,
  updateExpenseItem,
  deleteExpenseItem
} from "../controllers/expenseController.js";

const router = express.Router();

// GET all purchase invoices
router.get("/", getAllPurchaseInvoices);

// GET invoice by ID
router.get("/:id", getPurchaseInvoiceById);

// POST a new purchase invoice
router.post("/", createPurchaseInvoice);

// PUT update invoice
router.put("/:id", updatePurchaseInvoice);

// DELETE invoice
router.delete("/:id", deletePurchaseInvoice);

// GET all vendors (unique vendor names) - UPDATED VERSION
router.get("/vendors/list", async (req, res) => {
  try {
    const vendors = await PurchaseInvoice.distinct("vendor");
    const vendorDetails = await Promise.all(
      vendors.map(async (vendorName) => {
        const invoice = await PurchaseInvoice.findOne({ vendor: vendorName });
        return {
          name: vendorName,
          phone: invoice ? invoice.phone : "N/A",
        };
      })
    );
    res.json(vendorDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expense routes
router.get("/expense/products", getProductsForExpenseTracking);
router.get("/expense/filters", getFilterOptions);
router.post("/expense", createOrUpdateProductExpense);
router.get("/expense/product/:purchaseInvoiceId/:productName/:hsn", getProductExpense);
router.put("/expense/:expenseRecordId/item/:expenseItemId", updateExpenseItem);
router.delete("/expense/:expenseRecordId/item/:expenseItemId", deleteExpenseItem);

export default router;