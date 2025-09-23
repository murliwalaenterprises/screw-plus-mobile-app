import * as RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform } from 'react-native';

export const generateInvoicePDF = async (order: any) => {
  const { CustomerName, CustomerEmail, CustomerMobile, deliveryAddress, items, finalTotal, subTotal, taxAmount, discount, platformFee, deliveryFee, orderNumber, paymentMethod } = order;

  const itemRows = items
    .map(
      (item: any, index: number) => `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${index + 1}</td>
        <td style="border:1px solid #ddd; padding:8px;">${item.name}</td>
        <td style="border:1px solid #ddd; padding:8px;">${item.quantity}</td>
        <td style="border:1px solid #ddd; padding:8px;">₹${item.price}</td>
        <td style="border:1px solid #ddd; padding:8px;">₹${item.total}</td>
      </tr>`
    )
    .join('');

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h1 { text-align: center; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .totals { margin-top: 20px; float: right; width: 40%; }
          .totals table { width: 100%; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #555; }
        </style>
      </head>
      <body>
        <h1>Invoice</h1>
        <p><b>Order Number:</b> ${orderNumber}</p>
        <p><b>Customer:</b> ${CustomerName} (${CustomerMobile})</p>
        <p><b>Email:</b> ${CustomerEmail}</p>
        <p><b>Delivery Address:</b> ${deliveryAddress}</p>
        <p><b>Payment Method:</b> ${paymentMethod}</p>

        <table>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
          ${itemRows}
        </table>

        <div class="totals">
          <table>
            <tr><td>Subtotal:</td><td>₹${subTotal}</td></tr>
            <tr><td>Tax:</td><td>₹${taxAmount}</td></tr>
            <tr><td>Platform Fee:</td><td>₹${platformFee}</td></tr>
            <tr><td>Delivery Fee:</td><td>₹${deliveryFee}</td></tr>
            <tr><td>Discount:</td><td>-₹${discount}</td></tr>
            <tr><th>Final Total:</th><th>₹${finalTotal}</th></tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
        </div>
      </body>
    </html>
  `;

  const options = {
    html,
    fileName: `invoice_${order.orderId}`,
    directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
  };

  const file = await RNHTMLtoPDF.convert(options);
  return file.filePath;
};
