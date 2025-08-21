// // const API_BASE = "http://localhost:6768/api"; // just /api

// // const ApiService = {
// //   // Health check
// //   healthCheck: async () => {
// //     const res = await fetch(`${API_BASE}/health`);
// //     if (!res.ok) throw new Error("Health check failed");
// //     return res.json();
// //   },

// //   // Get all vendors (for dropdown)
// //   getVendors: async () => {
// //     const res = await fetch(`${API_BASE}/purchases/vendors/list`);
// //     if (!res.ok) throw new Error("Failed to fetch vendors");
// //     return res.json();
// //   },

// //   // Create a new invoice
// //   createInvoice: async (invoiceData) => {
// //     const res = await fetch(`${API_BASE}/purchases`, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify(invoiceData),
// //     });
// //     if (!res.ok) {
// //       const error = await res.json();
// //       throw new Error(error.error || "Failed to create invoice");
// //     }
// //     return res.json();
// //   },
// // };

// // export default ApiService;


// const API_BASE = "http://localhost:6768/api";

// const ApiService = {
//   // Health check
//   healthCheck: async () => {
//     const res = await fetch(`${API_BASE}/health`);
//     if (!res.ok) throw new Error("Health check failed");
//     return res.json();
//   },

//   // Purchase Invoice APIs
//   getVendors: async () => {
//     const res = await fetch(`${API_BASE}/purchases/vendors/list`);
//     if (!res.ok) throw new Error("Failed to fetch vendors");
//     return res.json();
//   },

//   createInvoice: async (invoiceData) => {
//     const res = await fetch(`${API_BASE}/purchases`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(invoiceData),
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to create invoice");
//     }
//     return res.json();
//   },

//   getAllPurchaseInvoices: async () => {
//     const res = await fetch(`${API_BASE}/purchases`);
//     if (!res.ok) throw new Error("Failed to fetch purchase invoices");
//     return res.json();
//   },

//   // Expense APIs
//   getProductsForExpenseTracking: async () => {
//     const res = await fetch(`${API_BASE}/expenses/products`);
//     if (!res.ok) throw new Error("Failed to fetch products for expense tracking");
//     return res.json();
//   },

//   getExpenseFilterOptions: async () => {
//     const res = await fetch(`${API_BASE}/expenses/filters`);
//     if (!res.ok) throw new Error("Failed to fetch filter options");
//     return res.json();
//   },

//   getAllExpenseRecords: async (filters = {}) => {
//     const queryParams = new URLSearchParams();
//     if (filters.vendor) queryParams.append('vendor', filters.vendor);
//     if (filters.hsn) queryParams.append('hsn', filters.hsn);
//     if (filters.productName) queryParams.append('productName', filters.productName);
    
//     const url = `${API_BASE}/expenses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
//     const res = await fetch(url);
//     if (!res.ok) throw new Error("Failed to fetch expense records");
//     return res.json();
//   },

//   getProductExpense: async (purchaseInvoiceId, productName, hsn) => {
//     const res = await fetch(`${API_BASE}/expenses/product/${purchaseInvoiceId}/${encodeURIComponent(productName)}/${hsn}`);
//     if (!res.ok) {
//       if (res.status === 404) return null; // No expense record exists yet
//       throw new Error("Failed to fetch product expense");
//     }
//     return res.json();
//   },

//   createOrUpdateProductExpense: async (expenseData) => {
//     const res = await fetch(`${API_BASE}/expenses`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(expenseData),
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to create/update product expense");
//     }
//     return res.json();
//   },

//   updateExpenseItem: async (expenseRecordId, expenseItemId, updateData) => {
//     const res = await fetch(`${API_BASE}/expenses/${expenseRecordId}/expense/${expenseItemId}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(updateData),
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to update expense item");
//     }
//     return res.json();
//   },

//   deleteExpenseItem: async (expenseRecordId, expenseItemId) => {
//     const res = await fetch(`${API_BASE}/expenses/${expenseRecordId}/expense/${expenseItemId}`, {
//       method: "DELETE",
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to delete expense item");
//     }
//     return res.json();
//   },

//   deleteExpenseRecord: async (expenseRecordId) => {
//     const res = await fetch(`${API_BASE}/expenses/${expenseRecordId}`, {
//       method: "DELETE",
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to delete expense record");
//     }
//     return res.json();
//   },

//   getExpenseSummary: async (filters = {}) => {
//     const queryParams = new URLSearchParams();
//     if (filters.vendor) queryParams.append('vendor', filters.vendor);
//     if (filters.hsn) queryParams.append('hsn', filters.hsn);
//     if (filters.startDate) queryParams.append('startDate', filters.startDate);
//     if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
//     const url = `${API_BASE}/expenses/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
//     const res = await fetch(url);
//     if (!res.ok) throw new Error("Failed to fetch expense summary");
//     return res.json();
//   },
// };

// export default ApiService;


// const API_BASE = "http://localhost:6768/api";

// const ApiService = {
//   // Health check
//   healthCheck: async () => {
//     const res = await fetch(`${API_BASE}/health`);
//     if (!res.ok) throw new Error("Health check failed");
//     return res.json();
//   },

//   // Purchase Invoice APIs
//   getVendors: async () => {
//     const res = await fetch(`${API_BASE}/purchases/vendors/list`);
//     if (!res.ok) throw new Error("Failed to fetch vendors");
//     return res.json();
//   },

//   createInvoice: async (invoiceData) => {
//     const res = await fetch(`${API_BASE}/purchases`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(invoiceData),
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to create invoice");
//     }
//     return res.json();
//   },

//   getAllPurchaseInvoices: async () => {
//     const res = await fetch(`${API_BASE}/purchases`);
//     if (!res.ok) throw new Error("Failed to fetch purchase invoices");
//     return res.json();
//   },

//   // Expense APIs - TEMPORARY ROUTES under purchases
//   getProductsForExpenseTracking: async () => {
//     const res = await fetch(`${API_BASE}/purchases/expense/products`);
//     if (!res.ok) throw new Error("Failed to fetch products for expense tracking");
//     return res.json();
//   },

//   getExpenseFilterOptions: async () => {
//     const res = await fetch(`${API_BASE}/purchases/expense/filters`);
//     if (!res.ok) throw new Error("Failed to fetch filter options");
//     return res.json();
//   },

//   createOrUpdateProductExpense: async (expenseData) => {
//     const res = await fetch(`${API_BASE}/purchases/expense`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(expenseData),
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to create/update product expense");
//     }
//     return res.json();
//   },

//   // Other expense APIs can be added later once basic functionality works
// };

// export default ApiService;


// const API_BASE = "http://localhost:6768/api";

// const ApiService = {
//   // Health check
//   healthCheck: async () => {
//     const res = await fetch(`${API_BASE}/health`);
//     if (!res.ok) throw new Error("Health check failed");
//     return res.json();
//   },

//   // Purchase Invoice APIs
//   getVendors: async () => {
//     const res = await fetch(`${API_BASE}/purchases/vendors/list`);
//     if (!res.ok) throw new Error("Failed to fetch vendors");
//     return res.json();
//   },

//   createInvoice: async (invoiceData) => {
//     const res = await fetch(`${API_BASE}/purchases`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(invoiceData),
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to create invoice");
//     }
//     return res.json();
//   },

//   getAllPurchaseInvoices: async () => {
//     const res = await fetch(`${API_BASE}/purchases`);
//     if (!res.ok) throw new Error("Failed to fetch purchase invoices");
//     return res.json();
//   },

//   // Expense APIs - TEMPORARY ROUTES under purchases
//   getProductsForExpenseTracking: async () => {
//     const res = await fetch(`${API_BASE}/purchases/expense/products`);
//     if (!res.ok) throw new Error("Failed to fetch products for expense tracking");
//     return res.json();
//   },

//   getExpenseFilterOptions: async () => {
//     const res = await fetch(`${API_BASE}/purchases/expense/filters`);
//     if (!res.ok) throw new Error("Failed to fetch filter options");
//     return res.json();
//   },

//   createOrUpdateProductExpense: async (expenseData) => {
//     const res = await fetch(`${API_BASE}/purchases/expense`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(expenseData),
//     });
//     if (!res.ok) {
//       const error = await res.json();
//       throw new Error(error.error || "Failed to create/update product expense");
//     }
//     return res.json();
//   },

//   // ADD THE MISSING FUNCTION
//   getProductExpense: async (purchaseInvoiceId, productName, hsn) => {
//     try {
//       const res = await fetch(`${API_BASE}/purchases/expense/product/${purchaseInvoiceId}/${encodeURIComponent(productName)}/${hsn}`);
//       if (!res.ok) {
//         if (res.status === 404) return null;
//         throw new Error("Failed to fetch product expense");
//       }
//       return res.json();
//     } catch (error) {
//       console.error("Error fetching product expense:", error);
//       return null; // Return null if there's any error
//     }
//   },

//   // Add other missing expense functions as needed
//   updateExpenseItem: async (expenseRecordId, expenseItemId, updateData) => {
//     try {
//       const res = await fetch(`${API_BASE}/purchases/expense/${expenseRecordId}/item/${expenseItemId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updateData),
//       });
      
//       return handleApiResponse(res);
//     } catch (error) {
//       console.error("Error updating expense item:", error);
//       throw new Error("Failed to update expense item: " + error.message);
//     }
//   },

//   deleteExpenseItem: async (expenseRecordId, expenseItemId) => {
//     try {
//       const res = await fetch(`${API_BASE}/purchases/expense/${expenseRecordId}/item/${expenseItemId}`, {
//         method: "DELETE",
//       });
      
//       return handleApiResponse(res);
//     } catch (error) {
//       console.error("Error deleting expense item:", error);
//       throw new Error("Failed to delete expense item: " + error.message);
//     }
//   }
// };



// export default ApiService;



// services/ApiService.js
// Update your ApiService.js with these changes
const API_BASE = "http://localhost:6768/api";

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  if (!response.ok) {
    // Check if it's an HTML error page
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      throw new Error(`Server returned HTML error page. Status: ${response.status}`);
    }
    
    // Try to parse as JSON error
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    } catch {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  
  return response.json();
};

const ApiService = {
  // Health check
  healthCheck: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleApiResponse(res);
  },

  // Purchase Invoice APIs
  getVendors: async () => {
    try {
      const res = await fetch(`${API_BASE}/purchases/vendors/list`);
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return [];
    }
  },

  createInvoice: async (invoiceData) => {
    const res = await fetch(`${API_BASE}/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    });
    return handleApiResponse(res);
  },

  getAllPurchaseInvoices: async () => {
    try {
      const res = await fetch(`${API_BASE}/purchases`);
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error; // Re-throw to be handled by the component
    }
  },

  // Expense APIs - Try multiple endpoints if one fails
  getAllExpenses: async () => {
    try {
      // Try the main endpoint first
      const res = await fetch(`${API_BASE}/purchases/expenses`);
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error with /expenses endpoint, trying /expense:", error);
      
      // Fallback to alternative endpoint
      try {
        const res = await fetch(`${API_BASE}/purchases/expense`);
        return handleApiResponse(res);
      } catch (fallbackError) {
        console.error("Error with fallback endpoint too:", fallbackError);
        return []; // Return empty array as final fallback
      }
    }
  },

  getProductsForExpenseTracking: async () => {
    try {
      const res = await fetch(`${API_BASE}/purchases/expense/products`);
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  getExpenseFilterOptions: async () => {
    try {
      const res = await fetch(`${API_BASE}/purchases/expense/filters`);
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error fetching filter options:", error);
      return { vendors: [], hsnCodes: [], productNames: [] };
    }
  },

  createOrUpdateProductExpense: async (expenseData) => {
    try {
      const res = await fetch(`${API_BASE}/purchases/expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error creating/updating expense:", error);
      throw error;
    }
  },

  getProductExpense: async (purchaseInvoiceId, productName, hsn) => {
    try {
      const res = await fetch(`${API_BASE}/purchases/expense/product/${purchaseInvoiceId}/${encodeURIComponent(productName)}/${hsn}`);
      
      if (res.status === 404) return null;
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error fetching product expense:", error);
      return null;
    }
  },

  // UPDATE EXPENSE ITEM
  updateExpenseItem: async (expenseRecordId, expenseItemId, updateData) => {
    try {
      const res = await fetch(`${API_BASE}/purchases/expense/${expenseRecordId}/item/${expenseItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error updating expense item:", error);
      throw new Error("Failed to update expense item: " + error.message);
    }
  },

  // DELETE EXPENSE ITEM
  deleteExpenseItem: async (expenseRecordId, expenseItemId) => {
    try {
      const res = await fetch(`${API_BASE}/purchases/expense/${expenseRecordId}/item/${expenseItemId}`, {
        method: "DELETE",
      });
      return handleApiResponse(res);
    } catch (error) {
      console.error("Error deleting expense item:", error);
      throw new Error("Failed to delete expense item: " + error.message);
    }
  }
};

export default ApiService;