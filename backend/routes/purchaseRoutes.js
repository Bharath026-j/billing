import express from "express";
import {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  updatePurchaseInvoice,
  deletePurchaseInvoice,
} from "../controllers/purchaseController.js"; // ✅ fixed path
import PurchaseInvoice from "../models/purchaseModel.js"; // ✅ fixed name

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

// GET all vendors (unique vendor names)
router.get("/vendors/list", async (req, res) => {
  try {
    const vendors = await PurchaseInvoice.distinct("vendor");
    const vendorDetails = await Promise.all(
      vendors.map(async (vendorName) => {
        const invoice = await PurchaseInvoice.findOne({ vendor: vendorName });
        return {
          name: vendorName,
          phone: invoice.phone,
        };
      })
    );
    res.json(vendorDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
