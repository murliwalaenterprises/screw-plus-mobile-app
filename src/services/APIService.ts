
import AxiosService from './AxiosService';

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

const APIService = {
  createOrder: async (body: {
    amount: number; // amount in rupees
    currency?: string;
    receipt?: string;
    notes?: Record<string, any>;
  }): Promise<RazorpayOrderResponse> => {
    return AxiosService.post<RazorpayOrderResponse>(`/orders`, {
      amount: body.amount * 100, 
      currency: body.currency || 'INR',
      receipt: body.receipt || `rcpt_${Date.now()}`,
      notes: body.notes || {},
    });
  },
};

export default APIService;