# PayPal Payment Integration Setup

This document explains how to set up PayPal payment integration for the hotel booking system.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# Frontend URLs for PayPal redirects
FRONTEND_URL=http://localhost:5173
```

## PayPal Developer Account Setup

1. **Create PayPal Developer Account**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Sign up or log in with your PayPal account

2. **Create Application**
   - Click "Create App" in the dashboard
   - Select "Merchant" as the app type
   - Give your app a name (e.g., "Hotel Booking System")
   - Choose "Sandbox" for testing, "Live" for production

3. **Get Credentials**
   - After creating the app, you'll get:
     - Client ID
     - Client Secret
   - Copy these to your `.env` file

## API Endpoints

The PayPal integration provides the following endpoints:

### Create PayPal Order
```
POST /api/payments/paypal/orders/:bookingId
```
- Creates a PayPal order for a booking
- Returns order ID and approval URL

### Capture PayPal Payment
```
POST /api/payments/paypal/capture/:orderId
```
- Captures payment after user approval
- Updates booking status to "Confirmed"

### Get PayPal Order Details
```
GET /api/payments/paypal/orders/:orderId
```
- Retrieves order status and details

### General Payment Processing
```
POST /api/payments/bookings/:bookingId/pay
```
- Supports multiple payment methods including PayPal
- Use `method: "paypal"` with `paypalOrderId` and `payerId`

### Payment History
```
GET /api/payments/history
```
- Get user's payment history with pagination

### Refund Payment
```
POST /api/payments/:paymentId/refund
```
- Process refunds for PayPal payments

### Webhook Handler
```
POST /api/payments/webhook/paypal
```
- Handles PayPal webhook events

## Frontend Integration

### 1. PayPal SDK Integration

Add PayPal JavaScript SDK to your frontend:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD"></script>
```

### 2. PayPal Buttons Implementation

```javascript
paypal.Buttons({
  // Create order on server
  createOrder: async function(data, actions) {
    try {
      const response = await fetch(`/api/payments/paypal/orders/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      return result.data.orderId;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  },

  // Capture payment after approval
  onApprove: async function(data, actions) {
    try {
      const response = await fetch(`/api/payments/paypal/capture/${data.orderID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payerId: data.payerID
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Payment successful, redirect or update UI
        window.location.href = '/payment/success';
      } else {
        // Handle payment failure
        alert('Payment failed: ' + result.message);
      }
    } catch (error) {
      console.error('Error capturing payment:', error);
      alert('Payment processing error');
    }
  },

  // Handle cancellation
  onCancel: function(data) {
    // User cancelled payment
    window.location.href = '/payment/cancel';
  },

  // Handle errors
  onError: function(err) {
    console.error('PayPal error:', err);
    alert('An error occurred with PayPal payment');
  }
}).render('#paypal-button-container');
```

## Payment Flow

1. **User selects PayPal payment**
2. **Frontend calls create order API**
3. **PayPal popup opens for user approval**
4. **User approves payment**
5. **Frontend calls capture payment API**
6. **Backend processes payment and updates booking**
7. **User receives confirmation**

## Testing

### Sandbox Testing
- Use PayPal sandbox credentials for testing
- Create test accounts in PayPal developer dashboard
- Test with sandbox buyer accounts

### Test Scenarios
- Successful payment
- Cancelled payment
- Failed payment
- Refund processing
- Webhook events

## Security Considerations

1. **Environment Variables**: Never commit PayPal credentials to version control
2. **Webhook Verification**: Implement webhook signature verification in production
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: All inputs are validated on the backend
5. **Rate Limiting**: Consider implementing rate limiting for payment endpoints

## Error Handling

The service handles various error scenarios:
- Invalid bookings
- Authentication failures
- PayPal API errors
- Network issues
- Payment failures

All errors include appropriate HTTP status codes and descriptive messages.

## Database Schema Updates

The Payment model includes PayPal-specific fields:
- `paypalOrderId`: PayPal order ID
- `paypalCaptureId`: PayPal capture ID
- `paypalPayerId`: PayPal payer ID
- `method`: Set to "paypal" for PayPal payments

## Production Deployment

1. **Update PayPal App**: Switch from sandbox to live mode
2. **Update Environment Variables**: Use live PayPal credentials
3. **Configure Webhooks**: Set up production webhook URLs in PayPal dashboard
4. **SSL Certificate**: Ensure HTTPS is properly configured
5. **Monitor Transactions**: Set up monitoring for payment failures

## Support

For PayPal API issues, refer to:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal API Reference](https://developer.paypal.com/docs/api/)
- [PayPal Checkout Integration Guide](https://developer.paypal.com/docs/checkout/)
