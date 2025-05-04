# Payments Microservice API

This document describes the versioned REST API for the Payments Microservice.

## Versioning

The API uses URI versioning. All API calls must include the version number in the path:

```
/v1/payments/...
```

Currently available versions:
- **v1**: Initial version of the payments API

## Swagger Documentation

Full API documentation is available in Swagger UI format, accessible at:

```
http://localhost:{PORT}/api
```

Where `{PORT}` is the configured service port.

## Available Endpoints (v1)

### Successful Payment Redirection

```
GET /v1/payments/success
```

Redirection endpoint that Stripe sends the user to after completing a successful payment.

**Response**:
```json
{
  "ok": true,
  "message": "Payment successful redirection endpoint."
}
```

### Cancelled Payment Redirection

```
GET /v1/payments/cancel
```

Redirection endpoint that Stripe sends the user to after cancelling a payment.

**Response**:
```json
{
  "ok": false,
  "message": "Payment cancelled redirection endpoint."
}
```

### Stripe Webhook

```
POST /v1/payments/webhook
```

Endpoint that receives event notifications from Stripe, such as confirmed payments, failed payments, or disputes.

**Required Headers**:
- `stripe-signature`: Signature provided by Stripe to verify the webhook authenticity.

**Successful Response**:
```json
{
  "received": true
}
```

## Internal Communication Endpoints (NATS)

### Create Payment Session

**Message Pattern**: `create.payment.session`

**Payload**:
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "currency": "usd",
  "items": [
    {
      "name": "Example product",
      "price": 29.99,
      "quantity": 2
    }
  ]
}
```

**Response**:
```json
{
  "id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6g7h8i9j0",
  "cancelUrl": "https://myapp.com/payments/cancel",
  "successUrl": "https://myapp.com/payments/success"
}
```

### Get Payment Status

**Message Pattern**: `get.payment.status`

**Payload**:
```json
"pay_123456789"
```

**Response**:
```json
{
  "paymentId": "pay_123456789",
  "status": "completed",
  "updatedAt": "2023-09-25T15:30:45.123Z",
  "amount": 100.00,
  "currency": "usd"
}
```

### Cancel Payment

**Message Pattern**: `cancel.payment`

**Payload**:
```json
"pay_123456789"
```

**Response**:
```json
{
  "paymentId": "pay_123456789",
  "cancelled": true,
  "cancelledAt": "2023-09-25T15:30:45.123Z",
  "reason": "user_requested",
  "refundId": "re_mock_abc123def"
}
```

### List User Payments

**Message Pattern**: `list.user.payments`

**Payload**:
```json
{
  "userId": "usr_123456789",
  "limit": 10,
  "offset": 0
}
```

**Response**:
```json
{
  "userId": "usr_123456789",
  "payments": [
    {
      "id": "pay_mock_abc123def",
      "amount": 39.99,
      "currency": "usd",
      "status": "completed",
      "createdAt": "2023-09-24T12:30:45.123Z",
      "orderId": "123e4567-e89b-12d3-a456-426614174000"
    },
    {
      "id": "pay_mock_ghi456jkl",
      "amount": 129.50,
      "currency": "usd",
      "status": "completed",
      "createdAt": "2023-09-20T10:15:30.456Z",
      "orderId": "223e4567-e89b-12d3-a456-426614174001"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

### Process Refund

**Message Pattern**: `process.refund`

**Payload**:
```json
{
  "paymentId": "pay_123456789",
  "amount": 50.00,
  "reason": "requested_by_customer"
}
```

**Response**:
```json
{
  "paymentId": "pay_123456789",
  "refundId": "re_mock_abc123def",
  "amount": 50.00,
  "currency": "usd",
  "status": "succeeded",
  "createdAt": "2023-09-25T15:30:45.123Z",
  "reason": "requested_by_customer"
}
``` 