// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:6768/api';

// // Create axios instance with default config
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//         headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000, // 10 seconds timeout
// });

// // Request interceptor for logging
// apiClient.interceptors.request.use(
//   (config) => {
//     console.log('API Request:', config.method?.toUpperCase(), config.url);
//     return config;
//   },
//   (error) => {
//     console.error('API Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => {
//     console.log('API Response:', response.status, response.config.url);
//     return response;
//   },
//   (error) => {
//     console.error('API Response Error:', error.response?.status, error.response?.data);
//     return Promise.reject(error);
//   }
// );

// class ApiService {
//   // Purchase Invoice APIs
//   static async createInvoice(invoiceData) {
//     try {
//       const response = await apiClient.post('/invoices', invoiceData);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.error || 'Failed to create invoice');
//     }
//   }

//   static async getInvoices() {
//     try {
//       const response = await apiClient.get('/invoices');
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.error || 'Failed to fetch invoices');
//     }
//   }

//   static async getInvoiceById(id) {
//     try {
//       const response = await apiClient.get(`/invoices/${id}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.error || 'Failed to fetch invoice');
//     }
//   }

//   static async updateInvoice(id, invoiceData) {
//     try {
//       const response = await apiClient.put(`/invoices/${id}`, invoiceData);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.error || 'Failed to update invoice');
//     }
//   }

//   static async deleteInvoice(id) {
//     try {
//       const response = await apiClient.delete(`/invoices/${id}`);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.error || 'Failed to delete invoice');
//     }
//   }

//   // Vendor APIs
//   static async getVendors() {
//     try {
//       const response = await apiClient.get('/invoices/vendors/list');
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.error || 'Failed to fetch vendors');
//     }
//   }

//   // Health check
//   static async healthCheck() {
//     try {
//       const response = await apiClient.get('/');
//       return response.data;
//     } catch (error) {
//       throw new Error('Backend server is not responding');
//     }
//   }
// }

// export default ApiService;


const API_BASE = "http://localhost:6768/api"; // just /api

const ApiService = {
  // Health check
  healthCheck: async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  },

  // Get all vendors (for dropdown)
  getVendors: async () => {
    const res = await fetch(`${API_BASE}/purchases/vendors/list`);
    if (!res.ok) throw new Error("Failed to fetch vendors");
    return res.json();
  },

  // Create a new invoice
  createInvoice: async (invoiceData) => {
    const res = await fetch(`${API_BASE}/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create invoice");
    }
    return res.json();
  },
};

export default ApiService;
