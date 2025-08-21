import PurchaseInvoice from "../models/purchaseModel.js";

// Create a new purchase invoice
export const createPurchaseInvoice = async (req, res) => {
  try {
    const { date, vendor, phone, products } = req.body;

    // Calculate totalCost for each product if not passed
    const updatedProducts = products.map((p) => ({
      ...p,
      totalCost: p.quantity * p.cost,
    }));

    const newInvoice = new PurchaseInvoice({
      date,
      vendor,
      phone,
      products: updatedProducts,
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all purchase invoices
export const getAllPurchaseInvoices = async (req, res) => {
  try {
    const invoices = await PurchaseInvoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single purchase invoice by ID
export const getPurchaseInvoiceById = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Purchase invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update purchase invoice by ID
export const updatePurchaseInvoice = async (req, res) => {
  try {
    const { date, vendor, phone, products } = req.body;

    const updatedProducts = products?.map((p) => ({
      ...p,
      totalCost: p.quantity * p.cost,
    }));

    const updatedInvoice = await PurchaseInvoice.findByIdAndUpdate(
      req.params.id,
      { date, vendor, phone, products: updatedProducts },
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ error: "Purchase invoice not found" });
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete purchase invoice by ID
export const deletePurchaseInvoice = async (req, res) => {
  try {
    const deletedInvoice = await PurchaseInvoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(404).json({ error: "Purchase invoice not found" });
    }
    res.status(200).json({ message: "Purchase invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getVendorsList = async (req, res) => {
  try {
    const vendors = await PurchaseInvoice.distinct('vendor');
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
