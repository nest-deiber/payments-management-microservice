# Payments Management Microservice (`payments-management-microservice`)

## 1. Overview

This project implements a Payments Microservice using **NestJS**, identified as `payments-management-microservice`. It functions as a **hybrid application**, handling both internal **NATS** messages and external **HTTP** requests (primarily for payment provider webhooks). The architecture adheres strictly to **Clean Architecture (Hexagonal)** principles combined with the **Command Query Responsibility Segregation (CQRS)** pattern.

Core responsibilities include:

* **Payment Session Creation:** Receiving requests (via NATS) from other services (e.g., Orders MS) to initiate a payment process with a provider like Stripe.
* **Webhook Handling:** Providing an HTTP endpoint (`/v1/payments/webhook`) to receive and process asynchronous notifications (webhooks) from payment providers regarding payment status changes (e.g., charge succeeded).
* **Event Publishing:** Emitting domain events (e.g., `payment.succeeded`) onto the NATS message bus upon successful processing of relevant webhook events.
* **API Documentation:** Exposing API documentation for its HTTP endpoints via Swagger UI (`/api`).
* **Health Check:** Providing a basic HTTP health check endpoint (`/`).

**Architectural Note on Payment Provider Integration:**

This implementation utilizes a **`MockStripeAdapter`** that simulates interactions with the Stripe payment gateway. **No actual calls to Stripe are made.** This design choice facilitates development, testing, and demonstration without requiring live API keys. The core logic interacts with the `StripeServicePort` abstraction. This adherence to the Ports & Adapters pattern ensures that replacing the mock adapter with a real Stripe (or other payment provider) adapter in the future requires minimal changes to the application's core, enhancing **changeability and scalability**.

The architecture prioritizes **decoupling, testability, maintainability, and clear separation of concerns**.

---

## 2. Architectural Approach

The service combines **Clean Architecture (Hexagonal)** with **CQRS**, tailored for a hybrid HTTP/NATS environment.

### 2.1. Clean Architecture / Hexagonal Architecture

* **Domain Layer (`src/payments/domain`):** Contains core concepts like `PaymentSession`, event payloads (`PaymentSucceededEventPayload`), and Port interfaces defining contracts (`StripeServicePort`, `EventPublisherPort`). It is independent of external frameworks and tools.
* **Application Layer (`src/payments/application`):** Orchestrates use cases using CQRS Commands (`CreatePaymentSessionCommand`, `ProcessStripeEventCommand`, `CompletePaymentCommand`) and their Handlers. Includes DTOs for data transfer and validation. Depends only on the Domain layer.
* **Infrastructure Layer (`src/payments/infrastructure`, `src/health-check`, `src/config`, `src/transports`, `src/shared/infrastructure`):** Contains implementation details:
    * **Adapters (`src/payments/infrastructure/adapters`):** Concrete implementations of Ports (`MockStripeAdapter`, `NatsEventPublisher`).
    * **Controllers (`src/payments/infrastructure/controllers`, `src/health-check`):** Entry points for various payment operations - `WebhookController`, `PaymentCompletionController`, `PaymentCancellationController`, etc.
    * **Framework Setup:** NestJS modules, configuration loading, NATS client setup, shared filters/interceptors.

### 2.2. CQRS (Command Query Responsibility Segregation)

Utilized via `@nestjs/cqrs`, focusing on commands and events:

* **Commands:** `CreatePaymentSessionCommand`, `ProcessStripeEventCommand`, `CompletePaymentCommand`, etc. Represent actions to be performed.
* **Handlers:** Contain the logic to execute commands, interacting with domain ports.
* **Events:** Domain events (`payment.succeeded`, `payment.cancelled`, `payment.refunded`) are published via `EventPublisherPort` after successful operations, allowing other services (like Orders MS) to react.

### 2.3. Hybrid Application (HTTP + NATS)

The service is bootstrapped as a hybrid NestJS application:

* **HTTP Listener:** Handles incoming requests for webhooks, payment operations, redirects, health checks, and Swagger documentation.
* **NATS Listener:** Connects to the NATS broker to receive messages and commands.

---

## 3. Project Structure

```
src/
├── payments/                 # Main Feature Module: Payments
│   ├── application/          # Use Cases, CQRS, DTOs
│   │   ├── commands/         # Write Operations (CreateSession, CompletePayment, etc.)
│   │   └── dto/              # Data Transfer Objects
│   ├── domain/                 # Core Business Logic & Abstractions
│   │   ├── model/            # --> PaymentSession, etc.
│   │   └── ports/            # --> StripeServicePort, EventPublisherPort
│   └── infrastructure/         # Implementation Details
│       ├── adapters/         # --> MockStripeAdapter, NatsEventPublisher
│       └── controllers/      # --> Controllers for various payment operations
├── health-check/             # HTTP Health Check Module & Controller
├── config/                   # Configuration (envs.ts, services.ts)
├── shared/                   # Shared Infrastructure (Filters, Interceptors)
│   └── infrastructure/
├── transports/               # NATS Client Configuration (NatsModule)
├── app.module.ts             # Root Application Module
└── main.ts                   # Application Bootstrap (Hybrid)
```

---

## 4. Key Technologies & Dependencies

* **Node.js:** Runtime environment.
* **TypeScript:** Primary language.
* **NestJS (`@nestjs/*`):** Core framework, including microservices, CQRS, and Swagger support.
* **NATS (`nats`):** Messaging system for receiving commands and publishing events.
* **Stripe (`stripe`):** Official Node.js library, used here primarily for TypeScript types.
* **Swagger (`@nestjs/swagger`):** Generates OpenAPI documentation for HTTP endpoints.
* **Class Validator / Class Transformer:** For DTO validation and transformation.
* **Dotenv / Joi:** Environment variable loading and validation.

---

## 5. Setup and Running

### 5.1. Prerequisites

* Node.js (v16.13 or later recommended)
* NPM or Yarn
* NATS Server instance running.

### 5.2. Installation

```bash
npm install
# or
yarn install
```

### 5.3. Environment Configuration

Create a `.env` file in the project root. Required variables are defined in `src/config/envs.ts`:

```dotenv
# .env example
PORT=3003 # HTTP port

# NATS Configuration
NATS_SERVERS=nats://localhost:4222

# Stripe Configuration (Required even for mock for structure/types)
STRIPE_SECRET=sk_test_MOCK_REPLACE_ME_WITH_REAL_OR_TEST_KEY
STRIPE_SUCCESS_URL=http://localhost:3003/v1/payments/success # Or your frontend URL
STRIPE_CANCEL_URL=http://localhost:3003/v1/payments/cancel   # Or your frontend URL
STRIPE_ENDPOINT_SECRET=whsec_mock_REPLACE_ME_WITH_REAL_SECRET # For webhook verification
```
* **Important:** While using the mock adapter, real secrets are not strictly necessary for API calls, but `STRIPE_ENDPOINT_SECRET` *would* be required for actual webhook signature verification if the mock adapter's `constructWebhookEvent` method performed it. Use real test keys/secrets if switching to a real adapter.

### 5.4. Running the Service

* **Development (with hot-reloading):**
    ```bash
    # Ensure NATS server is running
    npm run start:dev
    ```
* **Production:**
    ```bash
    npm run build
    npm run start:prod
    ```

The service starts both the HTTP server on `PORT` and the NATS listener.

---

## 6. API

### 6.1. NATS API

The service handles several NATS message patterns including:

* **`create.payment.session`:** Initiates payment session creation.
* **`complete.payment`:** Completes a payment for a specific order.
* **Published Events:** `payment.succeeded`, `payment.cancelled`, `payment.failed`, `payment.refunded`.

### 6.2. HTTP API

The service exposes several versioned HTTP endpoints (/v1/payments/*):

* **`GET /`:** Health check endpoint.
* **`POST /v1/payments/webhook`:** Webhook endpoint for payment providers.
* **`POST /v1/payments/complete/order/:orderId`:** Completes payment for an order.
* **`POST /v1/payments/cancel/order/:orderId`:** Cancels payment for an order.
* **`POST /v1/payments/refund/order`:** Processes a refund.
* **`GET /v1/payments/success`:** Success redirect endpoint.
* **`GET /v1/payments/cancel`:** Cancellation redirect endpoint.
* **`GET /api`:** Swagger UI for API documentation.

For detailed API documentation, see the API-DOCS.md file.

---

## 7. Error Handling

* **Hybrid Filtering:** `AllHttpExceptionsFilter` for HTTP, `AllRpcExceptionsFilter` for NATS.
* **Standardized Errors:** Consistent JSON error responses for both interfaces.
* **Input Validation:** Global `ValidationPipe` on DTOs.
* **Webhook Handling:** Basic error handling within the webhook endpoint. Real implementation would require robust signature verification and error management.

---

## 8. Best Practices Employed

* **Dependency Injection:** Core to NestJS and used throughout.
* **Separation of Concerns:** Clean Architecture layers & CQRS.
* **Ports & Adapters:** Abstraction for external dependencies (Payment Provider, Event Bus), enabling the mock strategy.
* **Configuration Management:** Centralized and validated environment variables.
* **Type Safety:** Via TypeScript and interfaces.
* **DTOs & Validation:** Clear data contracts and boundary validation.
* **Event-Driven Architecture:** Publishing events for other services to react to.
* **Controller Refactoring:** Separated controllers by functionality (webhook, completion, cancellation, etc.).
* **Command Delegation:** Moved business logic from controllers to command handlers.

---

## 9. Future Considerations & Scalability

* **Real Payment Provider Integration:** Replace `MockStripeAdapter` with a production-ready adapter, implement proper webhook signature verification.
* **Database Persistence:** Introduce database storage if payment transaction details or logs need to be persisted within this service.
* **Webhook Idempotency & Reliability:** Implement mechanisms to handle duplicate webhook events and ensure critical events (like payment success) are processed reliably (e.g., retries, dead-letter queues for event publishing).
* **Multi-Provider Support:** Abstract `StripeServicePort` further if support for other providers (PayPal, etc.) is required.
* **Observability:** Add distributed tracing, metrics, and enhanced logging.

For detailed API documentation and examples, please refer to the [API Documentation](./API-DOCS.md).