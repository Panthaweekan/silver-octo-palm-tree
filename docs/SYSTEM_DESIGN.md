# 🏗️ FitJourney - System Design Document

## 1. High-Level Architecture

### 1.1 Architecture Pattern
**Microservices Architecture with Event-Driven Components**

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)    │    Mobile App (React Native)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (Kong/NGINX)                   │
│              Load Balancer + Rate Limiting                   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Auth       │    │   Core API   │    │   AI/ML      │
│   Service    │    │   Service    │    │   Service    │
│  (Node.js)   │    │  (FastAPI)   │    │  (Python)    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │   S3/Blob    │
│   Database   │    │    Cache     │    │   Storage    │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 1.2 System Components

#### **Frontend Layer**
- **Web Application**: Next.js 14 (App Router)
  - Server-Side Rendering (SSR) for SEO
  - Progressive Web App (PWA) support
  - Responsive design for desktop/tablet
  
- **Mobile Application**: React Native + Expo
  - Native iOS & Android support
  - Offline-first architecture
  - Background sync capabilities

#### **API Gateway**
- **Kong Gateway** or **NGINX**
  - Rate limiting (100 req/min per user)
  - Request authentication & validation
  - Load balancing across services
  - API versioning support

#### **Backend Services**

**1. Authentication Service** (Node.js + Express)
- JWT-based authentication
- OAuth 2.0 (Google, Apple, Facebook)
- Session management
- Role-based access control (RBAC)

**2. Core API Service** (FastAPI + Python)
- User profile management
- Workout tracking CRUD
- Food logging & calorie calculation
- Weight & body metrics
- Habit tracking
- Daily journal entries

**3. AI/ML Service** (Python + TensorFlow/PyTorch)
- Food image recognition (MobileNetV3 + Custom Dataset)
- Calorie estimation from workouts
- Progress trend analysis
- Personalized recommendations
- Natural language insights generation (OpenAI GPT-4)

**4. Analytics Service** (Python + Pandas)
- Data aggregation & processing
- Trend calculation
- Report generation
- Dashboard metrics

#### **Data Layer**

**Primary Database**: PostgreSQL 15+
- ACID compliance
- Complex queries support
- Time-series data optimization
- Row-level security (RLS)

**Caching Layer**: Redis
- Session storage
- API response caching
- Real-time data (current day stats)
- Rate limiting counters

**Object Storage**: AWS S3 / Azure Blob
- User profile images
- Food images for AI processing
- Generated reports & exports

**Message Queue**: RabbitMQ / Apache Kafka
- Async task processing
- Event-driven communication
- AI model inference queue

---

## 2. Data Flow Architecture

### 2.1 User Authentication Flow
```
User → Frontend → API Gateway → Auth Service
                                      ↓
                            Validate Credentials
                                      ↓
                        Generate JWT Token + Refresh Token
                                      ↓
                              Store in Redis
                                      ↓
                            Return to Frontend
                                      ↓
                        Store in Secure Storage
```

### 2.2 Workout Logging Flow
```
User Input → Frontend → API Gateway → Core API
                                          ↓
                              Validate & Save to DB
                                          ↓
                              Publish Event (workout.created)
                                          ↓
                              AI Service (Calculate Calories)
                                          ↓
                              Update Workout Record
                                          ↓
                              Invalidate Cache
                                          ↓
                              Return Success Response
```

### 2.3 Food Image Recognition Flow
```
User Uploads Image → Frontend → API Gateway → Core API
                                                  ↓
                                        Upload to S3
                                                  ↓
                                    Queue AI Processing Job
                                                  ↓
                              AI Service → Load Model
                                                  ↓
                              Run Image Classification
                                                  ↓
                              Estimate Macronutrients
                                                  ↓
                              Save Results to DB
                                                  ↓
                              Notify User (WebSocket/Push)
```

---

## 3. Scalability Strategy

### 3.1 Horizontal Scaling
- **Stateless Services**: All API services are stateless
- **Load Balancing**: Round-robin across multiple instances
- **Auto-scaling**: Kubernetes HPA (Horizontal Pod Autoscaler)
  - CPU threshold: 70%
  - Memory threshold: 80%
  - Min replicas: 2, Max replicas: 10

### 3.2 Database Optimization
- **Read Replicas**: 2-3 read replicas for query distribution
- **Connection Pooling**: PgBouncer (max 100 connections)
- **Partitioning**: Time-series tables partitioned by month
- **Indexing Strategy**:
  - B-tree indexes on foreign keys
  - GiST indexes for time-range queries
  - Partial indexes on active records

### 3.3 Caching Strategy
- **Multi-Level Caching**:
  - L1: Client-side (Service Worker, LocalStorage)
  - L2: CDN (CloudFlare, CloudFront)
  - L3: Application cache (Redis)
  - L4: Database query cache

- **Cache Invalidation**:
  - Write-through cache for critical data
  - TTL-based expiration (5-60 minutes)
  - Event-driven invalidation

---

## 4. Security Architecture

### 4.1 Authentication & Authorization
- **JWT Tokens**: 
  - Access token: 15 minutes expiry
  - Refresh token: 7 days expiry
  - Secure, httpOnly cookies
- **Password Security**:
  - bcrypt hashing (cost factor: 12)
  - Password policy enforcement
  - Account lockout after 5 failed attempts

### 4.2 Data Protection
- **Encryption at Rest**: AES-256
- **Encryption in Transit**: TLS 1.3
- **Database Security**:
  - Row-level security (RLS)
  - Encrypted connections (SSL)
  - Prepared statements (SQL injection prevention)

### 4.3 API Security
- **Rate Limiting**: 
  - Global: 1000 req/hour
  - Per user: 100 req/minute
  - AI endpoints: 10 req/minute
- **Input Validation**: Pydantic models, JSON schema
- **CORS Policy**: Whitelist trusted domains
- **API Versioning**: `/api/v1`, `/api/v2`

### 4.4 Privacy & Compliance
- **GDPR Compliance**:
  - Right to access data
  - Right to deletion
  - Data portability (export feature)
- **HIPAA Considerations** (if applicable):
  - PHI data encryption
  - Audit logging
  - Access controls

---

## 5. Monitoring & Observability

### 5.1 Logging
- **Structured Logging**: JSON format
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Centralized Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Log Retention**: 30 days (hot), 90 days (cold)

### 5.2 Metrics
- **Application Metrics** (Prometheus):
  - Request rate, latency, error rate
  - Database query performance
  - Cache hit/miss ratio
- **Business Metrics**:
  - Daily active users (DAU)
  - Workout completion rate
  - Food logging frequency

### 5.3 Tracing
- **Distributed Tracing**: Jaeger / OpenTelemetry
- **Request correlation**: Trace ID propagation
- **Performance profiling**: Slow query detection

### 5.4 Alerting
- **Alert Channels**: Slack, PagerDuty, Email
- **Alert Rules**:
  - API error rate > 5%
  - Response time > 2s (p95)
  - Database connection pool > 80%
  - Service downtime > 1 minute

---

## 6. Disaster Recovery & Backup

### 6.1 Backup Strategy
- **Database Backups**:
  - Full backup: Daily (3 AM UTC)
  - Incremental backup: Every 6 hours
  - Retention: 30 days
  - Off-site replication: Different region

### 6.2 Recovery Objectives
- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 15 minutes
- **Failover Strategy**: Active-passive (primary/secondary)

---

## 7. Development & Deployment

### 7.1 CI/CD Pipeline
```
Code Push → GitHub Actions
              ↓
        Run Tests (Jest, Pytest)
              ↓
        Build Docker Images
              ↓
        Push to Container Registry
              ↓
        Deploy to Staging (Auto)
              ↓
        Run E2E Tests
              ↓
        Deploy to Production (Manual Approval)
              ↓
        Health Check & Smoke Tests
```

### 7.2 Environment Strategy
- **Development**: Local Docker Compose
- **Staging**: Kubernetes cluster (AWS EKS / GCP GKE)
- **Production**: Multi-region deployment

### 7.3 Infrastructure as Code
- **Terraform**: Cloud resource provisioning
- **Helm Charts**: Kubernetes application deployment
- **Ansible**: Server configuration management

---

## 8. Technology Decisions & Rationale

| Component | Technology | Reason |
|-----------|-----------|---------|
| Web Frontend | Next.js 14 | SSR, SEO, React ecosystem, TypeScript support |
| Mobile App | React Native | Code sharing, fast development, native performance |
| API Gateway | Kong | Plugin ecosystem, high performance, scalability |
| Auth Service | Node.js | Non-blocking I/O, JWT libraries, fast response time |
| Core API | FastAPI | Type safety, auto docs, async support, Python ML libs |
| AI/ML | Python + TensorFlow | Mature ecosystem, pre-trained models, GPU support |
| Database | PostgreSQL | ACID, complex queries, JSON support, time-series |
| Cache | Redis | In-memory speed, pub/sub, data structures variety |
| Message Queue | RabbitMQ | Reliability, routing flexibility, easy setup |
| Monitoring | Prometheus + Grafana | Open source, powerful queries, beautiful dashboards |
| Logging | ELK Stack | Full-text search, real-time analysis, visualization |

---

## 9. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p50) | < 200ms | Prometheus |
| API Response Time (p95) | < 500ms | Prometheus |
| API Response Time (p99) | < 1s | Prometheus |
| Database Query Time (p95) | < 100ms | pg_stat_statements |
| Page Load Time (Web) | < 2s | Lighthouse |
| App Launch Time (Mobile) | < 1s | Firebase Performance |
| Uptime | 99.9% | Uptime monitoring |
| Error Rate | < 0.1% | Error tracking |

---

## 10. Future Enhancements

### Phase 2 (6-12 months)
- Social features (friends, challenges, leaderboards)
- Wearable device integration (Apple Watch, Fitbit, Garmin)
- Meal planning & recipe suggestions
- Personal trainer marketplace

### Phase 3 (12-18 months)
- AI-powered workout plan generation
- Video exercise library with form analysis
- Community features (forums, groups)
- Premium subscription tiers

### Phase 4 (18-24 months)
- Telehealth integration (nutritionist consultations)
- Advanced analytics (machine learning predictions)
- Corporate wellness programs
- White-label solution for gyms/clinics

---

**Document Version**: 1.0  
**Last Updated**: December 4, 2025  
**Author**: GitHub Copilot  
**Status**: Initial Design
