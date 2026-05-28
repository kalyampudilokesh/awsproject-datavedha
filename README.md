# Datavedha Analytics — AWS DevOps Apprenticeship
## Cloud-Native E-Commerce Platform

[![CI](https://github.com/YOUR_ORG/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/YOUR_REPO/actions)

A production-grade e-commerce platform built as part of the Datavedha Analytics AWS DevOps apprenticeship under **Poornachand Kalyampudi**.

---

## Architecture

```
CloudFront → ALB → ECS Fargate (products-service :3000)
                → ECS Fargate (orders-service   :8000)
                          ↓
                   RDS PostgreSQL (private subnet)

Frontend → S3 → CloudFront → HTTPS
```

---

## Services

| Service | Language | Port | Description |
|---|---|---|---|
| `products-service` | Node.js 20 / Express | 3000 | Product catalogue CRUD, stock management |
| `orders-service` | Python 3.12 / FastAPI | 8000 | Order lifecycle, calls products-service for validation |
| `frontend` | React 18 / Vite | 80 | Storefront SPA served via nginx |

---

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 20 (for products-service dev)
- Python 3.12 (for orders-service dev)

### Run everything with Docker Compose

```bash
docker compose up --build
```

| URL | Service |
|---|---|
| http://localhost | Frontend |
| http://localhost:3000/api/products | Products API |
| http://localhost:8000/api/orders | Orders API |
| http://localhost:8000/docs | Orders API docs (Swagger) |

### Run services individually

**Products service**
```bash
cd products-service
cp .env.example .env        # edit DB credentials
npm install
npm run dev
```

**Orders service**
```bash
cd orders-service
cp .env.example .env        # edit DB credentials
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

---

## Testing

```bash
# Products service
cd products-service && npm test

# Orders service
cd orders-service && pytest tests/ -v

# Frontend build check
cd frontend && npm run build
```

---

## AWS Deployment (Week 2+)

See the project plan document and the `terraform/` directory (added in Week 2).

Key environment variables injected from **AWS Secrets Manager** in ECS task definitions:

| Variable | Secret |
|---|---|
| `DB_HOST` | `ecommerce/db/host` |
| `DB_PASSWORD` | `ecommerce/db/password` |
| `DB_USER` | `ecommerce/db/user` |

Set `ENABLE_XRAY=true` in ECS task definitions to enable AWS X-Ray tracing.

---

## Project Structure

```
.
├── products-service/       # Node.js microservice
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── db/
│   │   └── middleware/
│   ├── tests/
│   └── Dockerfile
├── orders-service/         # Python FastAPI microservice
│   ├── main.py
│   ├── app/
│   │   ├── config.py
│   │   ├── models.py
│   │   ├── routes/
│   │   ├── db/
│   │   └── middleware/
│   ├── tests/
│   └── Dockerfile
├── frontend/               # React SPA
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   ├── Dockerfile
│   └── nginx.conf
├── terraform/              # Added Week 2
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Mentor

**Poornachand Kalyampudi** — Datavedha Analytics  
*Apprenticeship project, 2026*
