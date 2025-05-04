# Payment Management Microservice API Documentation

This microservice manages all payment-related operations, integrating with payment gateways (like Stripe) and providing endpoints for creating payment sessions, checking status, completing payments, cancelling payments, and processing refunds.

## HTTP Endpoints

### 1. Payment Session Creation

**Endpoint:** `POST /v1/payments/session`

Creates a new payment session for an order.

**Request Body:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "currency": "usd",
  "items": [
    {
      "name": "Premium T-shirt",
      "price": 25.99,
      "quantity": 2
    }
  ]
}
```

**Success Response:**
```json
{
  "paymentSessionId": "sess_mock_abcdef123456",
  "paymentUrl": "https://example.com/checkout/sess_mock_abcdef123456",
  "expiresAt": "2025-05-02T10:00:00Z"
}
```

### 2. Complete Payment for an Order

**Endpoint:** `POST /v1/payments/complete/order/:orderId`

Marks a payment as completed for a specific order.

**Path Parameters:**
- `orderId`: ID of the order to mark as paid

**Success Response:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentId": "payment_123e4567",
  "status": "completed",
  "completedAt": "2025-05-01T10:38:14Z",
  "amount": 100.00,
  "currency": "usd"
}
```

### 3. Cancel Payment for an Order

**Endpoint:** `POST /v1/payments/cancel/order/:orderId`

Cancels a payment in process for a specific order.

**Path Parameters:**
- `orderId`: ID of the order for which to cancel payment

**Success Response:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentId": "payment_123e4567",
  "cancelled": true,
  "cancelledAt": "2025-05-01T10:42:03Z",
  "reason": "user_requested"
}
```

### 4. Process Refund for an Order

**Endpoint:** `POST /v1/payments/refund/order`

Processes a refund for a specific order.

**Request Body:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 50.0,
  "reason": "customer_request"
}
```

**Success Response:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentId": "payment_123e4567",
  "refundId": "refund_1683048503",
  "amount": 50.0,
  "currency": "usd",
  "status": "succeeded",
  "createdAt": "2025-05-01T10:48:23Z",
  "reason": "customer_request"
}
```

### 5. Payment Redirect Endpoints

- **Success:** `GET /v1/payments/success`
- **Cancel:** `GET /v1/payments/cancel`

### 6. Stripe Webhook

**Endpoint:** `POST /v1/payments/webhook`

Webhook for receiving events from Stripe.

**Required Headers:**
- `stripe-signature`: Signature for validating webhook authenticity

**Success Response:**
```json
{
  "received": true
}
```

## NATS Messages

The microservice also handles the following NATS message patterns:

### 1. Create Payment Session

**Pattern:** `create.payment.session`

**Payload:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "currency": "usd",
  "items": [
    {
      "name": "Premium T-shirt",
      "price": 25.99,
      "quantity": 2
    }
  ]
}
```

### 2. Complete Payment

**Pattern:** `complete.payment`

**Payload:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 3. Process Refund

**Pattern:** `process.refund.by.order`

**Payload:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 50.0,
  "reason": "requested_by_customer"
}
```

## Events Published

The microservice publishes the following events:

### 1. Payment Succeeded

**Event:** `payment.succeeded`

**Payload:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentId": "payment_123e4567",
  "amount": 100.00,
  "paidAt": "2025-05-01T10:38:14Z",
  "stripeChargeId": "ch_1234567890"
}
```

### 2. Payment Cancelled

**Event:** `payment.cancelled`

**Payload:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentId": "payment_123e4567",
  "cancelledAt": "2025-05-01T10:42:03Z",
  "reason": "user_requested"
}
```

### 3. Payment Failed

**Event:** `payment.failed`

**Payload:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentId": "payment_123e4567",
  "failureReason": "insufficient_funds"
}
```

### 4. Payment Refunded

**Event:** `payment.refunded`

**Payload:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentId": "payment_123e4567",
  "refundId": "refund_1683048503",
  "amount": 50.0,
  "refundedAt": "2025-05-01T10:48:23Z",
  "reason": "customer_request"
}
```

## HTTP Status Codes

- `200 OK`: Operation successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Implementation Notes

- This microservice uses a mock implementation of Stripe for development and testing
- All endpoints that modify data require authentication in production
- Recent changes include improved event communication between microservices and order status updates 