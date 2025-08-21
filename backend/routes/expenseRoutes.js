// import express from "express";
// import {
//   getProductsForExpenseTracking,
//   getFilterOptions,
//   createOrUpdateProductExpense,
//   getProductExpense,
//   getAllExpenseRecords,
//   updateExpenseItem,
//   deleteExpenseItem,
//   deleteExpenseRecord,
//   getExpenseSummary
// } from "../controllers/expenseController.js";

// const router = express.Router();

// // GET all products available for expense tracking
// router.get("/products", getProductsForExpenseTracking);

// // GET filter options (vendors, HSN codes, product names)
// router.get("/filters", getFilterOptions);

// // GET all expense records with optional filters
// router.get("/", getAllExpenseRecords);

// // GET expense summary/analytics
// router.get("/summary", getExpenseSummary);

// // GET expense record for a specific product
// router.get("/product/:purchaseInvoiceId/:productName/:hsn", getProductExpense);

// // POST create or update product expense
// router.post("/", createOrUpdateProductExpense);

// // PUT update a specific expense item
// router.put("/:expenseRecordId/expense/:expenseItemId", updateExpenseItem);

// // DELETE a specific expense item
// router.delete("/:expenseRecordId/expense/:expenseItemId", deleteExpenseItem);

// // DELETE entire expense record
// router.delete("/:expenseRecordId", deleteExpenseRecord);

// export default router;


import express from "express";
import {
  getProductsForExpenseTracking,
  getFilterOptions,
  createOrUpdateProductExpense,
  getProductExpense,
  getAllExpenseRecords,
  updateExpenseItem,
  deleteExpenseItem,
  deleteExpenseRecord,
  getExpenseSummary
} from "../controllers/expenseController.js";

const router = express.Router();

// GET all products available for expense tracking
router.get("/products", getProductsForExpenseTracking);

// GET filter options (vendors, HSN codes, product names)
router.get("/filters", getFilterOptions);

// GET all expense records with optional filters
router.get("/", getAllExpenseRecords);

// GET expense summary/analytics
router.get("/summary", getExpenseSummary);

// GET expense record for a specific product
router.get("/product/:purchaseInvoiceId/:productName/:hsn", getProductExpense);

// POST create or update product expense
router.post("/", createOrUpdateProductExpense);

// PUT update a specific expense item
router.put("/:expenseRecordId/expense/:expenseItemId", updateExpenseItem);

// DELETE a specific expense item
router.delete("/:expenseRecordId/expense/:expenseItemId", deleteExpenseItem);

// DELETE entire expense record
router.delete("/:expenseRecordId", deleteExpenseRecord);

router.put("/expense/:expenseRecordId/item/:expenseItemId", updateExpenseItem);
router.delete("/expense/:expenseRecordId/item/:expenseItemId", deleteExpenseItem);

export default router;