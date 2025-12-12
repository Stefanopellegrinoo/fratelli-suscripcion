# Fratelli - Build Your Box

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/stefano-s-projects-3a853fce/v0-build-your-box)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/gLHAJ2C006D)

## Overview

Fratelli is an artisanal pasta subscription service with a complete frontend built in Next.js and React. The application features role-based authentication, product management, subscription handling, and Mercado Pago payment integration.

This repository stays in sync with your deployed chats on [v0.app](https://v0.app).

## Features

- **Client Dashboard**: Build custom pasta boxes, manage subscriptions, view order history
- **Admin Dashboard**: Production reports, delivery logistics, product & plan management
- **Authentication**: JWT-based auth with role-based routing (CLIENT/ADMIN)
- **Payment Integration**: Mercado Pago payment flow
- **Service Layer**: Complete API integration with Spring Boot backend

## Backend Integration

### Environment Variables

Add the following environment variable in the **Vars section** of the v0 in-chat sidebar:

\`\`\`
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
\`\`\`

For production, update this to your backend URL.

### API Endpoints

The frontend expects the following Spring Boot endpoints:

**Authentication** (`/auth`)
- `POST /auth/login` - Returns JWT token and user object with role
- `POST /auth/register` - User registration

**Products** (`/productos`)
- `GET /productos` - Get all products (public)
- `POST /productos` - Create product (admin)
- `PUT /productos/{id}` - Update product (admin)
- `PATCH /productos/{id}/stock` - Toggle stock (admin)
- `DELETE /productos/{id}` - Delete product (admin)

**Plans** (`/planes`)
- `GET /planes` - Get all subscription plans
- `POST /planes` - Create plan (admin)
- `PUT /planes/{id}` - Update plan (admin)

**Subscriptions** (`/suscripciones`)
- `GET /suscripciones/me` - Get user's subscription
- `POST /suscripciones` - Create subscription
- `PUT /suscripciones/{id}/cancelar` - Cancel subscription
- `PUT /suscripciones/{id}/pausar` - Pause subscription

**Payments** (`/pagos`)
- `POST /pagos/crear/{subscriptionId}` - Create Mercado Pago link
- `GET /pagos/verificar/{subscriptionId}` - Verify payment status

### JWT Token Structure

The backend should return a JWT token with the following payload structure:

\`\`\`json
{
  "id": 1,
  "name": "Mario",
  "lastName": "Rossi",
  "email": "user@example.com",
  "role": "CLIENT" // or "ADMIN"
}
\`\`\`

The frontend automatically attaches the token to all requests via `Authorization: Bearer {token}` header.

## Deployment

Your project is live at:

**[https://vercel.com/stefano-s-projects-3a853fce/v0-build-your-box](https://vercel.com/stefano-s-projects-3a853fce/v0-build-your-box)**

## Development

Continue building your app on:

**[https://v0.app/chat/gLHAJ2C006D](https://v0.app/chat/gLHAJ2C006D)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Testing Authentication

For testing purposes, use:
- **Admin**: `admin@fratelli.com` / any password (6+ chars)
- **Client**: any other email / any password (6+ chars)

Once your Spring Boot backend is connected, these will use real authentication.
