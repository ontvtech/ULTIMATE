**SaaSWPP AI**

Complete Implementation Documentation

Technical Reference Guide v1.0

Multi-tenant WhatsApp SaaS Platform with AI Integration

Next.js 15 \| TypeScript \| Prisma \| Tailwind CSS \| Meta WhatsApp API

March 17, 2026

1\. Project Overview 1

> 1.1 System Architecture 1
>
> 1.2 Technology Stack 2

2\. Project Configuration 3

> 2.1 Environment Variables 3
>
> 2.2 Package Configuration 4

3\. Database Schema 5

> 3.1 Core Multi-tenant Schema 5

4\. Core Libraries 20

> 4.1 Prisma Client 20
>
> 4.2 Authentication Configuration 21
>
> 4.3 Rate Limiting 24

5\. AI Pool with Failover 26

> 5.1 Pool Manager 26

6\. WhatsApp Integration 35

> 6.1 WhatsApp Provider Interface 35

7\. Billing Integration 42

> 7.1 Iugu Integration 42

8\. API Routes 48

> 8.1 Authentication Routes 48
>
> 8.2 WhatsApp Webhook Route 48
>
> 8.3 Billing Webhook Route 49
>
> 8.4 Conversations API 49

9\. Deployment Configuration 51

> 9.1 Docker Configuration 51
>
> 9.2 Docker Compose 52

*Note: This Table of Contents is generated via field codes. To ensure
page number accuracy after editing, please right-click the TOC and
select \'Update Field.\'*

**1. Project Overview**

**1.1 System Architecture**

SaaSWPP AI is a multi-tenant SaaS platform for WhatsApp commercial
operations with AI integration. The system follows a layered
architecture with clear separation of concerns, implementing three
distinct panels: Admin (platform governance), Revendedor (reseller
management), and Lojista (merchant operations). The platform integrates
with Meta\'s official WhatsApp Business API and supports multiple AI
providers with automatic failover capabilities.

The architecture emphasizes security, scalability, and maintainability
through modular design patterns. Each tenant operates in isolation with
dedicated data partitions, while shared services optimize resource
utilization across the platform. The AI layer implements a pool-based
approach with configurable fallback chains, ensuring continuous service
availability even when primary providers experience quota exhaustion or
downtime.

**1.2 Technology Stack**

The platform is built on modern, production-ready technologies selected
for reliability, performance, and developer experience:

  ----------------------- -----------------------------------------------
  **Component**           **Technology**

  Frontend Framework      Next.js 15 (App Router)

  Language                TypeScript 5+

  Database ORM            Prisma 5+ with PostgreSQL

  Styling                 Tailwind CSS 3+ with shadcn/ui

  Authentication          NextAuth.js (Auth.js)

  Payment Gateway         Iugu API with webhook integration

  WhatsApp Integration    Meta Cloud API + Evolution API (dual driver)

  AI Providers            OpenAI, Anthropic, Google Gemini, OpenRouter
  ----------------------- -----------------------------------------------

════════════════════════════════════════════════════════════════════════════════

**2. Project Configuration**

**2.1 Environment Variables**

The application requires comprehensive environment configuration for all
integrated services. Create a .env.local file in the project root with
the following variables:

**File: .env.example**

> \# Database Configuration
>
> DATABASE_URL=\"postgresql://user:password@localhost:5432/saaswpp?schema=public\"
>
> \# NextAuth Configuration
>
> NEXTAUTH_URL=\"http://localhost:3000\"
>
> NEXTAUTH_SECRET=\"your-super-secret-key-min-32-chars\"
>
> \# Iugu Payment Gateway
>
> IUGU_API_KEY=\"your-iugu-api-key\"
>
> IUGU_ACCOUNT_ID=\"your-iugu-account-id\"
>
> IUGU_WEBHOOK_SECRET=\"your-webhook-secret\"
>
> \# Meta WhatsApp Business API
>
> META_APP_ID=\"your-meta-app-id\"
>
> META_APP_SECRET=\"your-meta-app-secret\"
>
> META_PHONE_NUMBER_ID=\"your-phone-number-id\"
>
> META_BUSINESS_ACCOUNT_ID=\"your-business-account-id\"
>
> META_WEBHOOK_VERIFY_TOKEN=\"your-verify-token\"
>
> META_ACCESS_TOKEN=\"your-permanent-access-token\"
>
> \# Evolution API (Optional Secondary Driver)
>
> EVOLUTION_API_URL=\"https://your-evolution-instance.com\"
>
> EVOLUTION_API_KEY=\"your-evolution-api-key\"
>
> \# AI Provider Configurations
>
> OPENAI_API_KEY=\"sk-your-openai-key\"
>
> ANTHROPIC_API_KEY=\"sk-ant-your-anthropic-key\"
>
> GOOGLE_AI_API_KEY=\"your-google-ai-key\"
>
> OPENROUTER_API_KEY=\"sk-or-your-openrouter-key\"
>
> \# Redis Configuration (Rate Limiting & Caching)
>
> REDIS_URL=\"redis://localhost:6379\"
>
> \# Application Settings
>
> APP_URL=\"https://saaswpp.work\"
>
> APP_NAME=\"SaaSWPP AI\"
>
> SUPPORT_EMAIL=\"support@saaswpp.work\"

**2.2 Package Configuration**

**File: package.json**

> {
>
> \"name\": \"saaswpp-ai\",
>
> \"version\": \"1.0.0\",
>
> \"private\": true,
>
> \"scripts\": {
>
> \"dev\": \"next dev\",
>
> \"build\": \"next build\",
>
> \"start\": \"next start\",
>
> \"lint\": \"next lint\",
>
> \"db:generate\": \"prisma generate\",
>
> \"db:push\": \"prisma db push\",
>
> \"db:migrate\": \"prisma migrate dev\",
>
> \"db:seed\": \"tsx prisma/seed.ts\",
>
> \"db:studio\": \"prisma studio\"
>
> },
>
> \"dependencies\": {
>
> \"next\": \"15.0.0\",
>
> \"react\": \"18.3.0\",
>
> \"react-dom\": \"18.3.0\",
>
> \"@prisma/client\": \"5.15.0\",
>
> \"next-auth\": \"4.24.0\",
>
> \"zod\": \"3.23.0\",
>
> \"react-hook-form\": \"7.51.0\",
>
> \"@hookform/resolvers\": \"3.3.0\",
>
> \"@tanstack/react-query\": \"5.36.0\",
>
> \"axios\": \"1.7.0\",
>
> \"bcryptjs\": \"2.4.3\",
>
> \"date-fns\": \"3.6.0\",
>
> \"lodash\": \"4.17.21\",
>
> \"ioredis\": \"5.4.0\",
>
> \"uuid\": \"9.0.0\",
>
> \"class-variance-authority\": \"0.7.0\",
>
> \"clsx\": \"2.1.0\",
>
> \"tailwind-merge\": \"2.3.0\",
>
> \"@radix-ui/react-dialog\": \"1.0.5\",
>
> \"@radix-ui/react-dropdown-menu\": \"2.0.6\",
>
> \"@radix-ui/react-select\": \"2.0.0\",
>
> \"@radix-ui/react-tabs\": \"1.0.4\",
>
> \"@radix-ui/react-toast\": \"1.1.5\",
>
> \"@radix-ui/react-tooltip\": \"1.0.7\",
>
> \"lucide-react\": \"0.378.0\",
>
> \"openai\": \"4.47.0\",
>
> \"@anthropic-ai/sdk\": \"0.27.0\",
>
> \"@google/generative-ai\": \"0.10.0\"
>
> },
>
> \"devDependencies\": {
>
> \"typescript\": \"5.4.0\",
>
> \"@types/node\": \"20.12.0\",
>
> \"@types/react\": \"18.3.0\",
>
> \"@types/bcryptjs\": \"2.4.6\",
>
> \"prisma\": \"5.15.0\",
>
> \"tailwindcss\": \"3.4.0\",
>
> \"postcss\": \"8.4.0\",
>
> \"autoprefixer\": \"10.4.0\",
>
> \"eslint\": \"8.57.0\",
>
> \"eslint-config-next\": \"15.0.0\",
>
> \"tsx\": \"4.10.0\"
>
> }
>
> }

════════════════════════════════════════════════════════════════════════════════

**3. Database Schema**

**3.1 Core Multi-tenant Schema**

The database implements a comprehensive multi-tenant architecture with
proper isolation, RBAC, and audit trails. The schema is organized into
logical modules: authentication, billing, operations, and AI management.

**File: prisma/schema.prisma**

> // Prisma Schema - SaaSWPP AI Platform
>
> // PostgreSQL 15+ required
>
> generator client {
>
> provider = \"prisma-client-js\"
>
> }
>
> datasource db {
>
> provider = \"postgresql\"
>
> url = env(\"DATABASE_URL\")
>
> }
>
> // ============================================
>
> // ENUMERATIONS
>
> // ============================================
>
> enum TenantStatus {
>
> ACTIVE
>
> SUSPENDED
>
> CANCELED
>
> TRIALING
>
> GRACE_PERIOD
>
> }
>
> enum TenantType {
>
> ADMIN_PLATFORM
>
> MERCHANT
>
> INTERNAL
>
> }
>
> enum SubscriptionStatus {
>
> trialing
>
> active
>
> past_due
>
> grace_period
>
> suspended
>
> canceled
>
> expired
>
> }
>
> enum UserRole {
>
> ADMIN
>
> REVENDEDOR
>
> LOJISTA
>
> ATENDENTE
>
> GESTOR
>
> }
>
> enum ConversationStatus {
>
> OPEN
>
> CLOSED
>
> PENDING
>
> HANDOFF
>
> }
>
> enum MessageDirection {
>
> INBOUND
>
> OUTBOUND
>
> }
>
> enum LeadStatus {
>
> NEW
>
> CONTACTED
>
> QUALIFIED
>
> PROPOSAL
>
> NEGOTIATION
>
> WON
>
> LOST
>
> }
>
> enum AppointmentStatus {
>
> SCHEDULED
>
> CONFIRMED
>
> CANCELLED
>
> COMPLETED
>
> NO_SHOW
>
> }
>
> enum OrderStatus {
>
> PENDING
>
> CONFIRMED
>
> PROCESSING
>
> SHIPPED
>
> DELIVERED
>
> CANCELED
>
> }
>
> enum ServiceOrderStatus {
>
> OPEN
>
> IN_PROGRESS
>
> WAITING_PARTS
>
> COMPLETED
>
> CANCELED
>
> }
>
> enum AlertType {
>
> CUSTOMER_ANGRY
>
> HOT_LEAD
>
> HANDOFF_PENDING
>
> ORDER_STUCK
>
> OS_STUCK
>
> PAYMENT_FAILED
>
> INTEGRATION_ERROR
>
> }
>
> enum AlertSeverity {
>
> LOW
>
> MEDIUM
>
> HIGH
>
> CRITICAL
>
> }
>
> enum HandoffStatus {
>
> REQUESTED
>
> ACCEPTED
>
> IN_PROGRESS
>
> RESOLVED
>
> REOPENED
>
> TRANSFERRED
>
> }
>
> enum AIProviderType {
>
> OPENAI
>
> ANTHROPIC
>
> GOOGLE
>
> OPENROUTER
>
> CUSTOM
>
> }
>
> enum AIExecutionStatus {
>
> PENDING
>
> SUCCESS
>
> FAILED
>
> SKIPPED
>
> }
>
> // ============================================
>
> // CORE TENANT & AUTH MODULE
>
> // ============================================
>
> model Tenant {
>
> id String \@id \@default(cuid())
>
> name String
>
> slug String \@unique
>
> tradeName String?
>
> document String? // CNPJ/CPF
>
> phone String?
>
> email String?
>
> logoUrl String?
>
> timezone String \@default(\"America/Sao_Paulo\")
>
> status TenantStatus \@default(ACTIVE)
>
> tenantType TenantType \@default(MERCHANT)
>
> // Relations
>
> nicheTemplateId String?
>
> nicheTemplate NicheTemplate? \@relation(fields: \[nicheTemplateId\],
> references: \[id\])
>
> resellerId String?
>
> reseller ResellerProfile? \@relation(fields: \[resellerId\],
> references: \[id\])
>
> settings Json?
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> deletedAt DateTime?
>
> // Relations (children)
>
> users UserTenant\[\]
>
> subscriptions Subscription\[\]
>
> conversations Conversation\[\]
>
> customers Customer\[\]
>
> leads Lead\[\]
>
> appointments Appointment\[\]
>
> orders Order\[\]
>
> serviceOrders ServiceOrder\[\]
>
> cashEntries CashEntry\[\]
>
> aiProfile AiProfile?
>
> knowledgeItems KnowledgeItem\[\]
>
> catalogItems CatalogItem\[\]
>
> campaigns Campaign\[\]
>
> alerts OperationalAlert\[\]
>
> handoffs Handoff\[\]
>
> internalContacts InternalContact\[\]
>
> whatsappInstances WhatsAppInstance\[\]
>
> metaWallet MetaWallet?
>
> usageCounters UsageCounter\[\]
>
> auditLogs AuditLog\[\]
>
> tenantAddons TenantAddon\[\]
>
> @@index(\[status\])
>
> @@index(\[resellerId\])
>
> @@index(\[createdAt\])
>
> }
>
> model User {
>
> id String \@id \@default(cuid())
>
> name String
>
> email String \@unique
>
> passwordHash String
>
> phone String?
>
> avatarUrl String?
>
> status String \@default(\"ACTIVE\")
>
> lastLoginAt DateTime?
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> // Relations
>
> userTenants UserTenant\[\]
>
> auditLogs AuditLog\[\] \@relation(\"ActorUser\")
>
> @@index(\[email\])
>
> }
>
> model UserTenant {
>
> id String \@id \@default(cuid())
>
> userId String
>
> tenantId String
>
> roleId String
>
> isActive Boolean \@default(true)
>
> user User \@relation(fields: \[userId\], references: \[id\], onDelete:
> Cascade)
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> role Role \@relation(fields: \[roleId\], references: \[id\])
>
> createdAt DateTime \@default(now())
>
> @@unique(\[userId, tenantId\])
>
> @@index(\[tenantId\])
>
> }
>
> model Role {
>
> id String \@id \@default(cuid())
>
> name String \@unique
>
> displayName String
>
> description String?
>
> permissions RolePermission\[\]
>
> userTenants UserTenant\[\]
>
> createdAt DateTime \@default(now())
>
> }
>
> model Permission {
>
> id String \@id \@default(cuid())
>
> key String \@unique
>
> name String
>
> module String
>
> description String?
>
> roles RolePermission\[\]
>
> createdAt DateTime \@default(now())
>
> }
>
> model RolePermission {
>
> roleId String
>
> permissionId String
>
> role Role \@relation(fields: \[roleId\], references: \[id\], onDelete:
> Cascade)
>
> permission Permission \@relation(fields: \[permissionId\], references:
> \[id\], onDelete: Cascade)
>
> @@id(\[roleId, permissionId\])
>
> }
>
> // ============================================
>
> // BILLING MODULE
>
> // ============================================
>
> model Plan {
>
> id String \@id \@default(cuid())
>
> name String
>
> slug String \@unique
>
> description String?
>
> priceMonthly Float
>
> priceYearly Float?
>
> trialDays Int \@default(7)
>
> graceDays Int \@default(5)
>
> status String \@default(\"ACTIVE\")
>
> sortOrder Int \@default(0)
>
> // Relations
>
> planModules PlanModule\[\]
>
> planLimits PlanLimit\[\]
>
> subscriptions Subscription\[\]
>
> tenantAddons TenantAddon\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[status\])
>
> }
>
> model FeatureModule {
>
> id String \@id \@default(cuid())
>
> key String \@unique
>
> name String
>
> description String?
>
> type String // NATIVE, ADDON
>
> status String \@default(\"ACTIVE\")
>
> sortOrder Int \@default(0)
>
> planModules PlanModule\[\]
>
> createdAt DateTime \@default(now())
>
> }
>
> model PlanModule {
>
> id String \@id \@default(cuid())
>
> planId String
>
> moduleId String
>
> accessType String \@default(\"INCLUDED\") // INCLUDED, LIMITED,
> DISABLED
>
> plan Plan \@relation(fields: \[planId\], references: \[id\], onDelete:
> Cascade)
>
> module FeatureModule \@relation(fields: \[moduleId\], references:
> \[id\], onDelete: Cascade)
>
> @@unique(\[planId, moduleId\])
>
> }
>
> model PlanLimit {
>
> id String \@id \@default(cuid())
>
> planId String
>
> limitKey String // AI_TOKENS, CONVERSATIONS, USERS, WHATSAPP_NUMBERS
>
> limitValue Int
>
> plan Plan \@relation(fields: \[planId\], references: \[id\], onDelete:
> Cascade)
>
> @@unique(\[planId, limitKey\])
>
> }
>
> model Addon {
>
> id String \@id \@default(cuid())
>
> name String
>
> slug String \@unique
>
> description String?
>
> priceMonthly Float
>
> priceYearly Float?
>
> type String \@default(\"RECURRING\") // RECURRING, ONE_TIME
>
> status String \@default(\"ACTIVE\")
>
> tenantAddons TenantAddon\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }
>
> model TenantAddon {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> addonId String
>
> planId String?
>
> status String \@default(\"ACTIVE\")
>
> startedAt DateTime \@default(now())
>
> expiresAt DateTime?
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> addon Addon \@relation(fields: \[addonId\], references: \[id\])
>
> plan Plan? \@relation(fields: \[planId\], references: \[id\])
>
> @@unique(\[tenantId, addonId\])
>
> }
>
> model Subscription {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> planId String
>
> provider String \@default(\"IUGU\")
>
> providerSubscriptionId String? \@unique
>
> providerCustomerId String?
>
> status SubscriptionStatus \@default(trialing)
>
> startedAt DateTime \@default(now())
>
> currentPeriodStart DateTime?
>
> currentPeriodEnd DateTime?
>
> canceledAt DateTime?
>
> suspendedAt DateTime?
>
> reactivatedAt DateTime?
>
> cancelAtPeriodEnd Boolean \@default(false)
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> plan Plan \@relation(fields: \[planId\], references: \[id\])
>
> invoices Invoice\[\]
>
> commissionLedgers CommissionLedger\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId\])
>
> @@index(\[status\])
>
> }
>
> model Invoice {
>
> id String \@id \@default(cuid())
>
> subscriptionId String
>
> providerInvoiceId String? \@unique
>
> status String \@default(\"PENDING\") // PENDING, PAID, FAILED,
> CANCELED
>
> amount Float
>
> currency String \@default(\"BRL\")
>
> dueDate DateTime
>
> paidAt DateTime?
>
> paymentUrl String?
>
> pdfUrl String?
>
> subscription Subscription \@relation(fields: \[subscriptionId\],
> references: \[id\], onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[subscriptionId, dueDate\])
>
> @@index(\[status\])
>
> }
>
> model TenantBillingStatus {
>
> id String \@id \@default(cuid())
>
> tenantId String \@unique
>
> status String \@default(\"ACTIVE\")
>
> enforcementLevel Int \@default(0) // 0=none, 1=warning, 2=grace,
> 3=suspended
>
> graceEndsAt DateTime?
>
> readOnlyReason String?
>
> blockedModulesJson Json?
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }
>
> // ============================================
>
> // RESELLER MODULE
>
> // ============================================
>
> model ResellerProfile {
>
> id String \@id \@default(cuid())
>
> userId String \@unique
>
> tenantId String?
>
> displayName String
>
> status String \@default(\"ACTIVE\")
>
> // Commission settings
>
> commissionPolicyId String?
>
> // Relations
>
> user User \@relation(fields: \[userId\], references: \[id\])
>
> tenant Tenant? \@relation(fields: \[tenantId\], references: \[id\])
>
> links ResellerLink\[\]
>
> attributedLeads ResellerLeadAttribution\[\]
>
> commissionLedgers CommissionLedger\[\]
>
> tenants Tenant\[\]
>
> commissionPolicy CommissionPolicy? \@relation(fields:
> \[commissionPolicyId\], references: \[id\])
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[status\])
>
> }
>
> model ResellerLink {
>
> id String \@id \@default(cuid())
>
> resellerId String
>
> code String \@unique
>
> mode String \@default(\"GLOBAL\") // GLOBAL, NICHE_FIXED, CAMPAIGN
>
> campaignName String?
>
> fixedNicheId String?
>
> trialDaysOverride Int?
>
> utmSource String?
>
> utmMedium String?
>
> utmCampaign String?
>
> isActive Boolean \@default(true)
>
> reseller ResellerProfile \@relation(fields: \[resellerId\],
> references: \[id\], onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[resellerId\])
>
> @@index(\[code\])
>
> }
>
> model ResellerLeadAttribution {
>
> id String \@id \@default(cuid())
>
> resellerId String
>
> tenantId String \@unique
>
> linkId String?
>
> campaignId String?
>
> attributedAt DateTime \@default(now())
>
> reseller ResellerProfile \@relation(fields: \[resellerId\],
> references: \[id\])
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\])
>
> @@index(\[resellerId\])
>
> }
>
> model CommissionPolicy {
>
> id String \@id \@default(cuid())
>
> name String
>
> basePercent Float \@default(20.0)
>
> isActive Boolean \@default(true)
>
> tiers CommissionTier\[\]
>
> resellers ResellerProfile\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }
>
> model CommissionTier {
>
> id String \@id \@default(cuid())
>
> policyId String
>
> name String
>
> minActiveAccounts Int
>
> minMRR Float?
>
> percent Float
>
> policy CommissionPolicy \@relation(fields: \[policyId\], references:
> \[id\], onDelete: Cascade)
>
> @@index(\[policyId\])
>
> }
>
> model CommissionLedger {
>
> id String \@id \@default(cuid())
>
> resellerId String
>
> subscriptionId String?
>
> competenceMonth String // YYYY-MM
>
> baseAmount Float
>
> percentApplied Float
>
> commissionAmount Float
>
> status String \@default(\"PENDING\") // PENDING, APPROVED, PAID
>
> reseller ResellerProfile \@relation(fields: \[resellerId\],
> references: \[id\])
>
> subscription Subscription? \@relation(fields: \[subscriptionId\],
> references: \[id\])
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[resellerId, competenceMonth\])
>
> }
>
> // ============================================
>
> // WHATSAPP MODULE
>
> // ============================================
>
> model WhatsAppInstance {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> provider String // META, EVOLUTION
>
> providerInstanceId String?
>
> status String \@default(\"DISCONNECTED\") // CONNECTED, DISCONNECTED,
> QRCODE, ERROR
>
> // Meta specific
>
> phoneNumberId String?
>
> wabaId String?
>
> // Evolution specific
>
> instanceName String?
>
> qrCode String?
>
> lastSeenAt DateTime?
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> numbers WhatsAppNumber\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@unique(\[tenantId, provider\])
>
> }
>
> model WhatsAppNumber {
>
> id String \@id \@default(cuid())
>
> instanceId String
>
> phoneE164 String \@unique
>
> displayName String?
>
> status String \@default(\"ACTIVE\")
>
> // Meta specific
>
> qualityRating String?
>
> messagingTier String?
>
> instance WhatsAppInstance \@relation(fields: \[instanceId\],
> references: \[id\], onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }
>
> // ============================================
>
> // CONVERSATION MODULE
>
> // ============================================
>
> model Conversation {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> customerId String
>
> channel String \@default(\"WHATSAPP\")
>
> status ConversationStatus \@default(OPEN)
>
> aiMode Boolean \@default(true)
>
> assignedMode String \@default(\"AI\") // AI, HUMAN
>
> assignedUserId String?
>
> lastMessageAt DateTime \@default(now())
>
> lastMessagePreview String?
>
> unreadCount Int \@default(0)
>
> // AI context
>
> intentDetected String?
>
> sentimentScore Float?
>
> confidenceScore Float?
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> customer Customer \@relation(fields: \[customerId\], references:
> \[id\])
>
> messages Message\[\]
>
> handoffs Handoff\[\]
>
> alerts OperationalAlert\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, lastMessageAt(sort: Desc)\])
>
> @@index(\[tenantId, status\])
>
> }
>
> model Message {
>
> id String \@id \@default(cuid())
>
> conversationId String
>
> direction MessageDirection
>
> contentType String \@default(\"TEXT\") // TEXT, IMAGE, VIDEO,
> DOCUMENT, AUDIO
>
> content String
>
> // Provider info
>
> provider String?
>
> providerMessageId String? \@unique
>
> // AI metadata
>
> aiGenerated Boolean \@default(false)
>
> aiProvider String?
>
> // Status
>
> status String \@default(\"SENT\") // SENT, DELIVERED, READ, FAILED
>
> conversation Conversation \@relation(fields: \[conversationId\],
> references: \[id\], onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> @@index(\[conversationId, createdAt(sort: Asc)\])
>
> }
>
> // ============================================
>
> // CRM MODULE
>
> // ============================================
>
> model Customer {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> name String
>
> phoneE164 String
>
> email String?
>
> status String \@default(\"ACTIVE\")
>
> // Context
>
> totalOrders Int \@default(0)
>
> totalSpent Float \@default(0)
>
> lastOrderAt DateTime?
>
> tags String\[\]
>
> metadata Json?
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> conversations Conversation\[\]
>
> leads Lead\[\]
>
> orders Order\[\]
>
> serviceOrders ServiceOrder\[\]
>
> appointments Appointment\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@unique(\[tenantId, phoneE164\])
>
> @@index(\[tenantId\])
>
> }
>
> model Lead {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> customerId String
>
> status LeadStatus \@default(NEW)
>
> stageId String?
>
> source String?
>
> campaignId String?
>
> score Int \@default(0)
>
> chancePercent Int?
>
> isHot Boolean \@default(false)
>
> notes String?
>
> lastInteractionAt DateTime?
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> customer Customer \@relation(fields: \[customerId\], references:
> \[id\])
>
> followUpTasks FollowUpTask\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, status\])
>
> @@index(\[isHot\])
>
> }
>
> model PipelineStage {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> name String
>
> order Int \@default(0)
>
> color String?
>
> createdAt DateTime \@default(now())
>
> @@index(\[tenantId, order\])
>
> }
>
> model FollowUpTask {
>
> id String \@id \@default(cuid())
>
> leadId String
>
> tenantId String
>
> title String
>
> description String?
>
> dueAt DateTime
>
> status String \@default(\"PENDING\") // PENDING, COMPLETED, CANCELED
>
> completedAt DateTime?
>
> lead Lead \@relation(fields: \[leadId\], references: \[id\], onDelete:
> Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, dueAt\])
>
> @@index(\[status\])
>
> }
>
> // ============================================
>
> // APPOINTMENT MODULE
>
> // ============================================
>
> model Appointment {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> customerId String
>
> conversationId String?
>
> title String?
>
> description String?
>
> startAt DateTime
>
> endAt DateTime
>
> status AppointmentStatus \@default(SCHEDULED)
>
> mode String \@default(\"AUTO\") // AUTO, APPROVAL, ASSISTED
>
> serviceTypeId String?
>
> assignedUserId String?
>
> origin String \@default(\"MANUAL\") // AI, MANUAL, ERP
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> customer Customer \@relation(fields: \[customerId\], references:
> \[id\])
>
> serviceOrder ServiceOrder?
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, startAt\])
>
> @@index(\[tenantId, status\])
>
> }
>
> // ============================================
>
> // ORDER MODULE
>
> // ============================================
>
> model Order {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> customerId String
>
> conversationId String?
>
> externalRef String?
>
> subtotal Float
>
> discount Float \@default(0)
>
> total Float
>
> status OrderStatus \@default(PENDING)
>
> paymentStatus String \@default(\"PENDING\") // PENDING, PAID, PARTIAL,
> REFUNDED
>
> notes String?
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> customer Customer \@relation(fields: \[customerId\], references:
> \[id\])
>
> items OrderItem\[\]
>
> statusLogs OrderStatusLog\[\]
>
> cashEntry CashEntry?
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, status\])
>
> @@index(\[tenantId, createdAt(sort: Desc)\])
>
> }
>
> model OrderItem {
>
> id String \@id \@default(cuid())
>
> orderId String
>
> catalogItemId String?
>
> name String
>
> quantity Int
>
> unitPrice Float
>
> total Float
>
> order Order \@relation(fields: \[orderId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> }
>
> model OrderStatusLog {
>
> id String \@id \@default(cuid())
>
> orderId String
>
> fromStatus String?
>
> toStatus OrderStatus
>
> reason String?
>
> changedBy String?
>
> order Order \@relation(fields: \[orderId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> }
>
> // ============================================
>
> // SERVICE ORDER MODULE
>
> // ============================================
>
> model ServiceOrder {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> customerId String
>
> conversationId String?
>
> appointmentId String? \@unique
>
> orderId String?
>
> title String
>
> description String?
>
> status ServiceOrderStatus \@default(OPEN)
>
> priority String \@default(\"NORMAL\") // LOW, NORMAL, HIGH, URGENT
>
> assignedUserId String?
>
> resolution String?
>
> closedAt DateTime?
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> customer Customer \@relation(fields: \[customerId\], references:
> \[id\])
>
> appointment Appointment? \@relation(fields: \[appointmentId\],
> references: \[id\])
>
> timelineEvents ServiceOrderTimelineEvent\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, status\])
>
> @@index(\[tenantId, customerId\])
>
> }
>
> model ServiceOrderTimelineEvent {
>
> id String \@id \@default(cuid())
>
> serviceOrderId String
>
> eventType String // STATUS_CHANGE, NOTE, ASSIGNMENT, etc.
>
> content String?
>
> serviceOrder ServiceOrder \@relation(fields: \[serviceOrderId\],
> references: \[id\], onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> }
>
> // ============================================
>
> // FINANCE MODULE
>
> // ============================================
>
> model CashEntry {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> type String // INCOME, EXPENSE
>
> amount Float
>
> description String?
>
> entryDate DateTime
>
> // Links
>
> orderId String? \@unique
>
> serviceOrderId String? \@unique
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> order Order? \@relation(fields: \[orderId\], references: \[id\])
>
> createdAt DateTime \@default(now())
>
> @@index(\[tenantId, entryDate(sort: Desc)\])
>
> }
>
> // ============================================
>
> // KNOWLEDGE BASE MODULE
>
> // ============================================
>
> model KnowledgeItem {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> title String
>
> category String // FAQ, CATALOG, POLICY, PROMO, OPERATIONAL
>
> status String \@default(\"PENDING\") // PENDING, APPROVED, ARCHIVED
>
> rawContent String? \@db.Text
>
> normalizedContent String? \@db.Text
>
> summary String?
>
> sourceType String // MANUAL, UPLOAD, CHANNEL_TRAINING
>
> sourceUrl String?
>
> approvedBy String?
>
> approvedAt DateTime?
>
> embeddingRef String?
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, category\])
>
> @@index(\[tenantId, status\])
>
> }
>
> // ============================================
>
> // CATALOG MODULE
>
> // ============================================
>
> model CatalogCategory {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> name String
>
> parentId String?
>
> createdAt DateTime \@default(now())
>
> @@index(\[tenantId\])
>
> }
>
> model CatalogItem {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> categoryId String?
>
> name String
>
> sku String?
>
> description String?
>
> type String \@default(\"PRODUCT\") // PRODUCT, SERVICE
>
> defaultPrice Float?
>
> availabilityStatus String \@default(\"AVAILABLE\")
>
> stockQty Int?
>
> mediaUrls String\[\]
>
> tags String\[\]
>
> active Boolean \@default(true)
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, active\])
>
> }
>
> // ============================================
>
> // CAMPAIGN MODULE
>
> // ============================================
>
> model Campaign {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> name String
>
> type String // ACQUISITION, REACTIVATION, POST_SALE, PROMOTION
>
> status String \@default(\"DRAFT\") // DRAFT, SCHEDULED, RUNNING,
> PAUSED, COMPLETED
>
> segmentFilter Json?
>
> templateText String?
>
> scheduledAt DateTime?
>
> completedAt DateTime?
>
> resultStats Json?
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, status\])
>
> }
>
> // ============================================
>
> // ALERT MODULE
>
> // ============================================
>
> model OperationalAlert {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> type AlertType
>
> severity AlertSeverity \@default(MEDIUM)
>
> status String \@default(\"OPEN\") // OPEN, ACKNOWLEDGED, RESOLVED
>
> conversationId String?
>
> customerId String?
>
> sourceModule String?
>
> sourceEntityId String?
>
> title String
>
> description String?
>
> assignedTo String?
>
> slaAt DateTime?
>
> resolvedAt DateTime?
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> conversation Conversation? \@relation(fields: \[conversationId\],
> references: \[id\])
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, status, severity\])
>
> @@index(\[tenantId, type\])
>
> }
>
> // ============================================
>
> // HANDOFF MODULE
>
> // ============================================
>
> model Handoff {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> conversationId String
>
> reason String
>
> status HandoffStatus \@default(REQUESTED)
>
> priority String \@default(\"NORMAL\")
>
> requestedBy String? // AI or USER
>
> assignedTo String?
>
> notes String?
>
> acceptedAt DateTime?
>
> resolvedAt DateTime?
>
> reopenedAt DateTime?
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> conversation Conversation \@relation(fields: \[conversationId\],
> references: \[id\])
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[tenantId, status\])
>
> }
>
> // ============================================
>
> // INTERNAL CONTACT MODULE
>
> // ============================================
>
> model InternalContact {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> name String
>
> phoneE164 String
>
> email String?
>
> role String?
>
> sector String?
>
> receivesHandoff Boolean \@default(false)
>
> receivesApprovals Boolean \@default(false)
>
> receivesAlerts Boolean \@default(false)
>
> alertMinSeverity String?
>
> priority Int \@default(0)
>
> active Boolean \@default(true)
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@unique(\[tenantId, phoneE164\])
>
> }
>
> // ============================================
>
> // NICHE TEMPLATE MODULE
>
> // ============================================
>
> model NicheTemplate {
>
> id String \@id \@default(cuid())
>
> name String
>
> slug String \@unique
>
> description String?
>
> status String \@default(\"ACTIVE\")
>
> // Configuration
>
> languageStyle String? // FORMAL, CASUAL, TECHNICAL
>
> promptBase String? \@db.Text
>
> objectionsJson Json?
>
> recommendedModules String\[\]
>
> automationsJson Json?
>
> // UI Customization
>
> uiSchemaJson Json?
>
> tenants Tenant\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[status\])
>
> }
>
> // ============================================
>
> // AI MODULE
>
> // ============================================
>
> model AiProfile {
>
> id String \@id \@default(cuid())
>
> tenantId String \@unique
>
> // Behavior settings
>
> tone String \@default(\"PROFESSIONAL\") // PROFESSIONAL, CASUAL,
> FRIENDLY
>
> formalityLevel Int \@default(50) // 0-100
>
> autonomyLevel Int \@default(70) // 0-100
>
> // Scope control
>
> scopeMode String \@default(\"FULL\") // FULL, LIMITED, ASSISTED
>
> restrictedTopics String\[\]
>
> // Handoff policy
>
> handoffPolicy String \@default(\"CONFIDENCE\") // CONFIDENCE, KEYWORD,
> ALWAYS
>
> handoffKeywords String\[\]
>
> confidenceThreshold Float \@default(0.7)
>
> // Business rules
>
> businessRulesJson Json?
>
> // Working hours
>
> workingHoursStart Int?
>
> workingHoursEnd Int?
>
> workingDays String\[\] \@default(\[\"MON\", \"TUE\", \"WED\", \"THU\",
> \"FRI\"\])
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> promptBlocks AiPromptBlock\[\]
>
> pool AITenantPool?
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }
>
> model AiPromptBlock {
>
> id String \@id \@default(cuid())
>
> aiProfileId String
>
> blockType String // SYSTEM, ATTENDANT, SELLER, SCHEDULER, SUPPORT
>
> name String
>
> content String \@db.Text
>
> isActive Boolean \@default(true)
>
> sortOrder Int \@default(0)
>
> aiProfile AiProfile \@relation(fields: \[aiProfileId\], references:
> \[id\], onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[aiProfileId, sortOrder\])
>
> }
>
> model AIProviderAccount {
>
> id String \@id \@default(cuid())
>
> tenantId String? // null = global provider
>
> provider AIProviderType
>
> displayName String
>
> apiKeyRef String // encrypted reference
>
> status String \@default(\"ACTIVE\")
>
> healthStatus String \@default(\"UNKNOWN\") // HEALTHY, DEGRADED,
> UNHEALTHY, UNKNOWN
>
> // Limits
>
> dailyLimitRequests Int?
>
> dailyLimitTokens Int?
>
> dailyLimitCost Float?
>
> lastHealthCheck DateTime?
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@index(\[provider\])
>
> @@index(\[tenantId\])
>
> }
>
> model AITenantPool {
>
> id String \@id \@default(cuid())
>
> tenantId String \@unique
>
> aiProfileId String
>
> name String \@default(\"Default Pool\")
>
> status String \@default(\"ACTIVE\")
>
> fallbackEnabled Boolean \@default(true)
>
> strategy String \@default(\"PRIORITY\") // PRIORITY, CHEAPEST,
> FASTEST, BALANCED
>
> aiProfile AiProfile \@relation(fields: \[aiProfileId\], references:
> \[id\])
>
> items AITenantPoolItem\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }
>
> model AITenantPoolItem {
>
> id String \@id \@default(cuid())
>
> poolId String
>
> providerAccountId String
>
> modelKey String
>
> priorityOrder Int \@default(0)
>
> isPrimary Boolean \@default(false)
>
> enabled Boolean \@default(true)
>
> maxRetries Int \@default(2)
>
> timeoutMs Int \@default(30000)
>
> skipWhenQuotaExhausted Boolean \@default(true)
>
> skipWhenUnhealthy Boolean \@default(true)
>
> pool AITenantPool \@relation(fields: \[poolId\], references: \[id\],
> onDelete: Cascade)
>
> @@index(\[poolId, priorityOrder\])
>
> }
>
> model AiExecution {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> conversationId String?
>
> executionGroupId String?
>
> poolId String?
>
> providerAccountId String?
>
> modelKey String?
>
> attemptOrder Int \@default(1)
>
> status AIExecutionStatus \@default(PENDING)
>
> failureType String?
>
> startedAt DateTime \@default(now())
>
> finishedAt DateTime?
>
> latencyMs Int?
>
> tokensIn Int?
>
> tokensOut Int?
>
> costAmount Float?
>
> responseValid Boolean?
>
> createdAt DateTime \@default(now())
>
> @@index(\[tenantId, createdAt(sort: Desc)\])
>
> @@index(\[conversationId\])
>
> }
>
> model AIFailoverEvent {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> conversationId String?
>
> fromProvider String?
>
> fromModel String?
>
> toProvider String?
>
> toModel String?
>
> reason String
>
> createdAt DateTime \@default(now())
>
> @@index(\[tenantId, createdAt(sort: Desc)\])
>
> }
>
> // ============================================
>
> // META WALLET MODULE
>
> // ============================================
>
> model MetaWallet {
>
> id String \@id \@default(cuid())
>
> tenantId String \@unique
>
> balance Float \@default(0)
>
> currency String \@default(\"BRL\")
>
> lowBalanceThreshold Float?
>
> markupPercent Float?
>
> lastTopupAt DateTime?
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> entries MetaCreditEntry\[\]
>
> usageEvents MetaUsageEvent\[\]
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> }
>
> model MetaCreditEntry {
>
> id String \@id \@default(cuid())
>
> walletId String
>
> type String // TOPUP, USAGE, REFUND
>
> amount Float
>
> description String?
>
> wallet MetaWallet \@relation(fields: \[walletId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> }
>
> model MetaUsageEvent {
>
> id String \@id \@default(cuid())
>
> walletId String
>
> tenantId String
>
> providerUsageId String? \@unique
>
> messageType String // TEMPLATE, SESSION
>
> direction String // OUTBOUND
>
> cost Float
>
> conversationId String?
>
> wallet MetaWallet \@relation(fields: \[walletId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> @@index(\[walletId, createdAt(sort: Desc)\])
>
> }
>
> // ============================================
>
> // USAGE COUNTER MODULE
>
> // ============================================
>
> model UsageCounter {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> metricKey String // AI_TOKENS, CONVERSATIONS, MESSAGES_SENT
>
> currentValue Int \@default(0)
>
> limitValue Int?
>
> periodStart DateTime?
>
> periodEnd DateTime?
>
> warningAtPercent Float?
>
> lastBlockedAt DateTime?
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> createdAt DateTime \@default(now())
>
> updatedAt DateTime \@updatedAt
>
> @@unique(\[tenantId, metricKey\])
>
> }
>
> // ============================================
>
> // AUDIT LOG MODULE
>
> // ============================================
>
> model AuditLog {
>
> id String \@id \@default(cuid())
>
> tenantId String
>
> actorType String // USER, SYSTEM, AI
>
> actorUserId String?
>
> action String
>
> entityType String
>
> entityId String?
>
> beforeJson Json?
>
> afterJson Json?
>
> ipAddress String?
>
> requestId String?
>
> // Relations
>
> tenant Tenant \@relation(fields: \[tenantId\], references: \[id\],
> onDelete: Cascade)
>
> actorUser User? \@relation(\"ActorUser\", fields: \[actorUserId\],
> references: \[id\])
>
> createdAt DateTime \@default(now())
>
> @@index(\[tenantId, createdAt(sort: Desc)\])
>
> @@index(\[entityType, entityId\])
>
> }
>
> // ============================================
>
> // ONBOARDING MODULE
>
> // ============================================
>
> model SignupSession {
>
> id String \@id \@default(cuid())
>
> token String \@unique
>
> status String \@default(\"STARTED\") // STARTED, COMPLETED, ABANDONED
>
> companyName String?
>
> ownerName String?
>
> phone String?
>
> email String?
>
> selectedPlanId String?
>
> selectedNicheId String?
>
> resellerId String?
>
> linkId String?
>
> utmJson Json?
>
> createdAt DateTime \@default(now())
>
> completedAt DateTime?
>
> @@index(\[token\])
>
> @@index(\[resellerId\])
>
> }

════════════════════════════════════════════════════════════════════════════════

**4. Core Libraries**

**4.1 Prisma Client**

The Prisma client provides type-safe database access with automatic
TypeScript inference. Initialize the client as a singleton to prevent
connection pool exhaustion in development environments.

**File: src/lib/prisma.ts**

> import { PrismaClient } from \'@prisma/client\';
>
> const globalForPrisma = globalThis as unknown as {
>
> prisma: PrismaClient \| undefined;
>
> };
>
> export const prisma =
>
> globalForPrisma.prisma ??
>
> new PrismaClient({
>
> log: process.env.NODE_ENV === \'development\'
>
> ? \[\'query\', \'error\', \'warn\'\]
>
> : \[\'error\'\],
>
> });
>
> if (process.env.NODE_ENV !== \'production\') {
>
> globalForPrisma.prisma = prisma;
>
> }
>
> export default prisma;

**4.2 Authentication Configuration**

NextAuth.js handles authentication with support for credentials
(email/password), OAuth providers, and session management. The
configuration includes JWT strategy, custom pages, and role-based
callbacks.

**File: src/lib/auth.ts**

> import { NextAuthOptions } from \'next-auth\';
>
> import CredentialsProvider from \'next-auth/providers/credentials\';
>
> import { prisma } from \'./prisma\';
>
> import bcrypt from \'bcryptjs\';
>
> import { Role, Permission } from \'@prisma/client\';
>
> declare module \'next-auth\' {
>
> interface Session {
>
> user: {
>
> id: string;
>
> email: string;
>
> name: string;
>
> tenants: Array\<{
>
> id: string;
>
> name: string;
>
> slug: string;
>
> role: string;
>
> }\>;
>
> activeTenantId: string \| null;
>
> };
>
> }
>
> interface User {
>
> id: string;
>
> email: string;
>
> name: string;
>
> }
>
> }
>
> declare module \'next-auth/jwt\' {
>
> interface JWT {
>
> id: string;
>
> email: string;
>
> name: string;
>
> tenants: Array\<{
>
> id: string;
>
> name: string;
>
> slug: string;
>
> role: string;
>
> }\>;
>
> activeTenantId: string \| null;
>
> }
>
> }
>
> export const authOptions: NextAuthOptions = {
>
> providers: \[
>
> CredentialsProvider({
>
> name: \'credentials\',
>
> credentials: {
>
> email: { label: \'Email\', type: \'email\' },
>
> password: { label: \'Password\', type: \'password\' },
>
> },
>
> async authorize(credentials) {
>
> if (!credentials?.email \|\| !credentials?.password) {
>
> return null;
>
> }
>
> const user = await prisma.user.findUnique({
>
> where: { email: credentials.email },
>
> include: {
>
> userTenants: {
>
> include: {
>
> tenant: true,
>
> role: {
>
> include: {
>
> permissions: {
>
> include: { permission: true }
>
> }
>
> }
>
> }
>
> }
>
> }
>
> }
>
> });
>
> if (!user \|\| !user.passwordHash) {
>
> return null;
>
> }
>
> const isValid = await bcrypt.compare(
>
> credentials.password,
>
> user.passwordHash
>
> );
>
> if (!isValid) {
>
> return null;
>
> }
>
> // Update last login
>
> await prisma.user.update({
>
> where: { id: user.id },
>
> data: { lastLoginAt: new Date() }
>
> });
>
> return {
>
> id: user.id,
>
> email: user.email,
>
> name: user.name,
>
> };
>
> }
>
> })
>
> \],
>
> callbacks: {
>
> async jwt({ token, user, trigger, session }) {
>
> if (user) {
>
> token.id = user.id;
>
> token.email = user.email!;
>
> token.name = user.name!;
>
> // Load tenant associations
>
> const userTenants = await prisma.userTenant.findMany({
>
> where: { userId: user.id, isActive: true },
>
> include: { tenant: true, role: true }
>
> });
>
> token.tenants = userTenants.map(ut =\> ({
>
> id: ut.tenant.id,
>
> name: ut.tenant.name,
>
> slug: ut.tenant.slug,
>
> role: ut.role.name
>
> }));
>
> token.activeTenantId = userTenants\[0\]?.tenantId \|\| null;
>
> }
>
> // Handle tenant switch
>
> if (trigger === \'update\' && session?.activeTenantId) {
>
> token.activeTenantId = session.activeTenantId;
>
> }
>
> return token;
>
> },
>
> async session({ session, token }) {
>
> session.user.id = token.id;
>
> session.user.email = token.email;
>
> session.user.name = token.name;
>
> session.user.tenants = token.tenants;
>
> session.user.activeTenantId = token.activeTenantId;
>
> return session;
>
> }
>
> },
>
> pages: {
>
> signIn: \'/login\',
>
> error: \'/auth/error\',
>
> },
>
> session: {
>
> strategy: \'jwt\',
>
> maxAge: 30 \* 24 \* 60 \* 60, // 30 days
>
> },
>
> secret: process.env.NEXTAUTH_SECRET,
>
> };

**4.3 Rate Limiting**

Implement rate limiting to protect API endpoints from abuse. The rate
limiter uses Redis for distributed rate limiting across multiple server
instances.

**File: src/lib/security/rateLimit.ts**

> import Redis from \'ioredis\';
>
> interface RateLimitConfig {
>
> windowMs: number;
>
> maxRequests: number;
>
> keyPrefix: string;
>
> }
>
> interface RateLimitResult {
>
> success: boolean;
>
> remaining: number;
>
> resetAt: Date;
>
> retryAfter?: number;
>
> }
>
> class RateLimiter {
>
> private redis: Redis;
>
> constructor() {
>
> this.redis = new Redis(process.env.REDIS_URL \|\|
> \'redis://localhost:6379\');
>
> }
>
> async checkLimit(
>
> identifier: string,
>
> config: RateLimitConfig
>
> ): Promise\<RateLimitResult\> {
>
> const key = \`\${config.keyPrefix}:\${identifier}\`;
>
> const now = Date.now();
>
> const windowStart = now - config.windowMs;
>
> try {
>
> // Use Redis sorted sets for sliding window
>
> const pipe = this.redis.pipeline();
>
> // Remove old entries
>
> pipe.zremrangebyscore(key, 0, windowStart);
>
> // Get current count
>
> pipe.zcard(key);
>
> // Add current request
>
> pipe.zadd(key, now,
> \`\${now}:\${Math.random().toString(36).slice(2)}\`);
>
> // Set expiry
>
> pipe.expire(key, Math.ceil(config.windowMs / 1000));
>
> const results = await pipe.exec();
>
> const currentCount = results?.\[1\]?.\[1\] as number \|\| 0;
>
> const remaining = Math.max(0, config.maxRequests - currentCount - 1);
>
> const resetAt = new Date(now + config.windowMs);
>
> if (currentCount \>= config.maxRequests) {
>
> return {
>
> success: false,
>
> remaining: 0,
>
> resetAt,
>
> retryAfter: Math.ceil(config.windowMs / 1000)
>
> };
>
> }
>
> return {
>
> success: true,
>
> remaining,
>
> resetAt
>
> };
>
> } catch (error) {
>
> console.error(\'Rate limit check failed:\', error);
>
> // Fail open - allow request if Redis is unavailable
>
> return {
>
> success: true,
>
> remaining: config.maxRequests,
>
> resetAt: new Date(now + config.windowMs)
>
> };
>
> }
>
> }
>
> async reset(identifier: string, keyPrefix: string): Promise\<void\> {
>
> const key = \`\${keyPrefix}:\${identifier}\`;
>
> await this.redis.del(key);
>
> }
>
> }
>
> export const rateLimiter = new RateLimiter();
>
> // Predefined rate limit configurations
>
> export const rateLimitConfigs = {
>
> api: { windowMs: 60 \* 1000, maxRequests: 100, keyPrefix: \'api\' },
>
> auth: { windowMs: 15 \* 60 \* 1000, maxRequests: 5, keyPrefix:
> \'auth\' },
>
> webhook: { windowMs: 60 \* 1000, maxRequests: 1000, keyPrefix:
> \'webhook\' },
>
> ai: { windowMs: 60 \* 1000, maxRequests: 30, keyPrefix: \'ai\' },
>
> messageSend: { windowMs: 60 \* 1000, maxRequests: 60, keyPrefix:
> \'msg\' }
>
> };

════════════════════════════════════════════════════════════════════════════════

**5. AI Pool with Failover**

**5.1 Pool Manager**

The AI Pool Manager implements a sophisticated failover system that
automatically switches between AI providers when quotas are exhausted,
timeouts occur, or providers become unavailable. This ensures continuous
AI service availability for all tenant conversations.

**File: src/lib/ai/pool.ts**

> import { prisma } from \'../prisma\';
>
> import OpenAI from \'openai\';
>
> import Anthropic from \'@anthropic-ai/sdk\';
>
> import { GoogleGenerativeAI } from \'@google/generative-ai\';
>
> // Types
>
> interface AIProvider {
>
> name: string;
>
> client: any;
>
> execute: (prompt: string, options: ExecuteOptions) =\>
> Promise\<AIResult\>;
>
> checkQuota: () =\> Promise\<boolean\>;
>
> }
>
> interface ExecuteOptions {
>
> maxTokens?: number;
>
> temperature?: number;
>
> systemPrompt?: string;
>
> conversationHistory?: Array\<{ role: string; content: string }\>;
>
> }
>
> interface AIResult {
>
> content: string;
>
> tokensIn: number;
>
> tokensOut: number;
>
> latencyMs: number;
>
> provider: string;
>
> model: string;
>
> confidence?: number;
>
> }
>
> interface PoolExecutionResult {
>
> success: boolean;
>
> result?: AIResult;
>
> attempts: Array\<{
>
> provider: string;
>
> model: string;
>
> status: \'SUCCESS\' \| \'FAILED\' \| \'SKIPPED\';
>
> error?: string;
>
> latencyMs?: number;
>
> }\>;
>
> failoverEvents: Array\<{
>
> from: string;
>
> to: string;
>
> reason: string;
>
> }\>;
>
> }
>
> // Provider Implementations
>
> class OpenAIProvider implements AIProvider {
>
> name = \'OPENAI\';
>
> private client: OpenAI;
>
> constructor(apiKey: string) {
>
> this.client = new OpenAI({ apiKey });
>
> }
>
> async execute(prompt: string, options: ExecuteOptions):
> Promise\<AIResult\> {
>
> const start = Date.now();
>
> const messages: Array\<{ role: \'system\' \| \'user\' \|
> \'assistant\'; content: string }\> = \[\];
>
> if (options.systemPrompt) {
>
> messages.push({ role: \'system\', content: options.systemPrompt });
>
> }
>
> if (options.conversationHistory) {
>
> messages.push(\...options.conversationHistory.map(m =\> ({
>
> role: m.role as \'user\' \| \'assistant\',
>
> content: m.content
>
> })));
>
> }
>
> messages.push({ role: \'user\', content: prompt });
>
> const response = await this.client.chat.completions.create({
>
> model: \'gpt-4-turbo-preview\',
>
> messages,
>
> max_tokens: options.maxTokens \|\| 1000,
>
> temperature: options.temperature ?? 0.7,
>
> });
>
> const choice = response.choices\[0\];
>
> const usage = response.usage;
>
> return {
>
> content: choice.message.content \|\| \'\',
>
> tokensIn: usage?.prompt_tokens \|\| 0,
>
> tokensOut: usage?.completion_tokens \|\| 0,
>
> latencyMs: Date.now() - start,
>
> provider: \'OPENAI\',
>
> model: \'gpt-4-turbo-preview\',
>
> };
>
> }
>
> async checkQuota(): Promise\<boolean\> {
>
> // OpenAI doesn\'t provide quota API, assume available
>
> return true;
>
> }
>
> }
>
> class AnthropicProvider implements AIProvider {
>
> name = \'ANTHROPIC\';
>
> private client: Anthropic;
>
> constructor(apiKey: string) {
>
> this.client = new Anthropic({ apiKey });
>
> }
>
> async execute(prompt: string, options: ExecuteOptions):
> Promise\<AIResult\> {
>
> const start = Date.now();
>
> const response = await this.client.messages.create({
>
> model: \'claude-3-opus-20240229\',
>
> max_tokens: options.maxTokens \|\| 1000,
>
> system: options.systemPrompt,
>
> messages: \[
>
> \...(options.conversationHistory \|\| \[\]).map(m =\> ({
>
> role: m.role as \'user\' \| \'assistant\',
>
> content: m.content
>
> })),
>
> { role: \'user\' as const, content: prompt }
>
> \],
>
> });
>
> const content = response.content
>
> .filter(block =\> block.type === \'text\')
>
> .map(block =\> (block as any).text)
>
> .join(\'\');
>
> return {
>
> content,
>
> tokensIn: response.usage.input_tokens,
>
> tokensOut: response.usage.output_tokens,
>
> latencyMs: Date.now() - start,
>
> provider: \'ANTHROPIC\',
>
> model: \'claude-3-opus-20240229\',
>
> };
>
> }
>
> async checkQuota(): Promise\<boolean\> {
>
> return true;
>
> }
>
> }
>
> class GeminiProvider implements AIProvider {
>
> name = \'GOOGLE\';
>
> private client: GoogleGenerativeAI;
>
> constructor(apiKey: string) {
>
> this.client = new GoogleGenerativeAI(apiKey);
>
> }
>
> async execute(prompt: string, options: ExecuteOptions):
> Promise\<AIResult\> {
>
> const start = Date.now();
>
> const model = this.client.getGenerativeModel({
>
> model: \'gemini-pro\',
>
> generationConfig: {
>
> maxOutputTokens: options.maxTokens \|\| 1000,
>
> temperature: options.temperature ?? 0.7,
>
> }
>
> });
>
> const fullPrompt = options.systemPrompt
>
> ? \`\${options.systemPrompt}\\n\\n\${prompt}\`
>
> : prompt;
>
> const result = await model.generateContent(fullPrompt);
>
> const response = await result.response;
>
> return {
>
> content: response.text(),
>
> tokensIn: 0, // Gemini doesn\'t provide token counts
>
> tokensOut: 0,
>
> latencyMs: Date.now() - start,
>
> provider: \'GOOGLE\',
>
> model: \'gemini-pro\',
>
> };
>
> }
>
> async checkQuota(): Promise\<boolean\> {
>
> return true;
>
> }
>
> }
>
> // Pool Manager
>
> export class AIPoolManager {
>
> private providers: Map\<string, AIProvider\> = new Map();
>
> private healthStatus: Map\<string, \'HEALTHY\' \| \'DEGRADED\' \|
> \'UNHEALTHY\'\> = new Map();
>
> constructor() {
>
> this.initializeProviders();
>
> }
>
> private initializeProviders() {
>
> // Initialize providers from environment
>
> if (process.env.OPENAI_API_KEY) {
>
> this.providers.set(\'OPENAI\', new
> OpenAIProvider(process.env.OPENAI_API_KEY));
>
> this.healthStatus.set(\'OPENAI\', \'HEALTHY\');
>
> }
>
> if (process.env.ANTHROPIC_API_KEY) {
>
> this.providers.set(\'ANTHROPIC\', new
> AnthropicProvider(process.env.ANTHROPIC_API_KEY));
>
> this.healthStatus.set(\'ANTHROPIC\', \'HEALTHY\');
>
> }
>
> if (process.env.GOOGLE_AI_API_KEY) {
>
> this.providers.set(\'GOOGLE\', new
> GeminiProvider(process.env.GOOGLE_AI_API_KEY));
>
> this.healthStatus.set(\'GOOGLE\', \'HEALTHY\');
>
> }
>
> }
>
> async executeWithFailover(
>
> tenantId: string,
>
> prompt: string,
>
> options: ExecuteOptions = {}
>
> ): Promise\<PoolExecutionResult\> {
>
> const attempts: PoolExecutionResult\[\'attempts\'\] = \[\];
>
> const failoverEvents: PoolExecutionResult\[\'failoverEvents\'\] =
> \[\];
>
> // Load tenant pool configuration
>
> const pool = await this.getTenantPool(tenantId);
>
> if (!pool \|\| pool.items.length === 0) {
>
> // Use default order
>
> return this.executeWithDefaultOrder(prompt, options, attempts,
> failoverEvents);
>
> }
>
> // Try each pool item in order
>
> for (const item of pool.items) {
>
> const provider = this.providers.get(item.providerAccountId);
>
> if (!provider) {
>
> attempts.push({
>
> provider: item.providerAccountId,
>
> model: item.modelKey,
>
> status: \'SKIPPED\',
>
> error: \'Provider not configured\'
>
> });
>
> continue;
>
> }
>
> // Check if should skip
>
> const health = this.healthStatus.get(item.providerAccountId);
>
> if (item.skipWhenUnhealthy && health === \'UNHEALTHY\') {
>
> attempts.push({
>
> provider: item.providerAccountId,
>
> model: item.modelKey,
>
> status: \'SKIPPED\',
>
> error: \'Provider unhealthy\'
>
> });
>
> continue;
>
> }
>
> // Check quota
>
> if (item.skipWhenQuotaExhausted) {
>
> const hasQuota = await provider.checkQuota();
>
> if (!hasQuota) {
>
> attempts.push({
>
> provider: item.providerAccountId,
>
> model: item.modelKey,
>
> status: \'SKIPPED\',
>
> error: \'Quota exhausted\'
>
> });
>
> continue;
>
> }
>
> }
>
> // Attempt execution
>
> try {
>
> const startTime = Date.now();
>
> const result = await this.executeWithTimeout(
>
> provider,
>
> prompt,
>
> options,
>
> item.timeoutMs \|\| 30000
>
> );
>
> attempts.push({
>
> provider: item.providerAccountId,
>
> model: item.modelKey,
>
> status: \'SUCCESS\',
>
> latencyMs: Date.now() - startTime
>
> });
>
> // Log execution
>
> await this.logExecution(tenantId, result, attempts.length);
>
> return {
>
> success: true,
>
> result,
>
> attempts,
>
> failoverEvents
>
> };
>
> } catch (error: any) {
>
> const errorMsg = error.message \|\| \'Unknown error\';
>
> attempts.push({
>
> provider: item.providerAccountId,
>
> model: item.modelKey,
>
> status: \'FAILED\',
>
> error: errorMsg,
>
> latencyMs: item.timeoutMs
>
> });
>
> // Update health status
>
> this.healthStatus.set(item.providerAccountId, \'DEGRADED\');
>
> // Record failover event
>
> if (attempts.length \> 0) {
>
> failoverEvents.push({
>
> from: attempts\[attempts.length - 1\].provider,
>
> to: item.providerAccountId,
>
> reason: errorMsg
>
> });
>
> }
>
> // Log failover
>
> await this.logFailover(tenantId, errorMsg);
>
> continue;
>
> }
>
> }
>
> // All providers failed - apply fallback
>
> return {
>
> success: false,
>
> attempts,
>
> failoverEvents
>
> };
>
> }
>
> private async executeWithTimeout(
>
> provider: AIProvider,
>
> prompt: string,
>
> options: ExecuteOptions,
>
> timeoutMs: number
>
> ): Promise\<AIResult\> {
>
> return new Promise((resolve, reject) =\> {
>
> const timeout = setTimeout(() =\> {
>
> reject(new Error(\'Timeout\'));
>
> }, timeoutMs);
>
> provider.execute(prompt, options)
>
> .then(result =\> {
>
> clearTimeout(timeout);
>
> resolve(result);
>
> })
>
> .catch(error =\> {
>
> clearTimeout(timeout);
>
> reject(error);
>
> });
>
> });
>
> }
>
> private async getTenantPool(tenantId: string) {
>
> return prisma.aITenantPool.findUnique({
>
> where: { tenantId },
>
> include: {
>
> items: {
>
> orderBy: { priorityOrder: \'asc\' }
>
> }
>
> }
>
> });
>
> }
>
> private async executeWithDefaultOrder(
>
> prompt: string,
>
> options: ExecuteOptions,
>
> attempts: PoolExecutionResult\[\'attempts\'\],
>
> failoverEvents: PoolExecutionResult\[\'failoverEvents\'\]
>
> ): Promise\<PoolExecutionResult\> {
>
> const defaultOrder = \[\'OPENAI\', \'ANTHROPIC\', \'GOOGLE\'\];
>
> for (const providerName of defaultOrder) {
>
> const provider = this.providers.get(providerName);
>
> if (!provider) continue;
>
> try {
>
> const result = await provider.execute(prompt, options);
>
> attempts.push({
>
> provider: providerName,
>
> model: \'default\',
>
> status: \'SUCCESS\',
>
> latencyMs: result.latencyMs
>
> });
>
> return { success: true, result, attempts, failoverEvents };
>
> } catch (error: any) {
>
> attempts.push({
>
> provider: providerName,
>
> model: \'default\',
>
> status: \'FAILED\',
>
> error: error.message
>
> });
>
> }
>
> }
>
> return { success: false, attempts, failoverEvents };
>
> }
>
> private async logExecution(
>
> tenantId: string,
>
> result: AIResult,
>
> attemptOrder: number
>
> ) {
>
> await prisma.aiExecution.create({
>
> data: {
>
> tenantId,
>
> status: \'SUCCESS\',
>
> providerAccountId: result.provider,
>
> modelKey: result.model,
>
> attemptOrder,
>
> tokensIn: result.tokensIn,
>
> tokensOut: result.tokensOut,
>
> costAmount: this.calculateCost(result),
>
> latencyMs: result.latencyMs,
>
> responseValid: true,
>
> }
>
> });
>
> }
>
> private async logFailover(tenantId: string, reason: string) {
>
> await prisma.aIFailoverEvent.create({
>
> data: {
>
> tenantId,
>
> reason,
>
> }
>
> });
>
> }
>
> private calculateCost(result: AIResult): number {
>
> // Simplified cost calculation
>
> const costs: Record\<string, { input: number; output: number }\> = {
>
> \'OPENAI\': { input: 0.01 / 1000, output: 0.03 / 1000 },
>
> \'ANTHROPIC\': { input: 0.015 / 1000, output: 0.075 / 1000 },
>
> \'GOOGLE\': { input: 0.001 / 1000, output: 0.002 / 1000 },
>
> };
>
> const pricing = costs\[result.provider\];
>
> if (!pricing) return 0;
>
> return (result.tokensIn \* pricing.input) + (result.tokensOut \*
> pricing.output);
>
> }
>
> getHealthStatus(): Map\<string, string\> {
>
> return new Map(this.healthStatus);
>
> }
>
> }
>
> export const aiPool = new AIPoolManager();

════════════════════════════════════════════════════════════════════════════════

**6. WhatsApp Integration**

**6.1 WhatsApp Provider Interface**

The WhatsApp integration implements a dual-driver architecture
supporting both Meta\'s official Cloud API and Evolution API. This
provides flexibility for different use cases - Meta for official
business messaging with template support, Evolution for more flexible
unofficial communication.

**File: src/lib/whatsapp/types.ts**

> export interface WhatsAppMessage {
>
> to: string;
>
> type: \'text\' \| \'template\' \| \'image\' \| \'document\' \|
> \'audio\';
>
> content: string \| WhatsAppMediaContent \| WhatsAppTemplateContent;
>
> previewUrl?: boolean;
>
> }
>
> export interface WhatsAppMediaContent {
>
> url?: string;
>
> id?: string;
>
> caption?: string;
>
> filename?: string;
>
> }
>
> export interface WhatsAppTemplateContent {
>
> name: string;
>
> language: { code: string };
>
> components?: Array\<{
>
> type: \'header\' \| \'body\' \| \'button\';
>
> parameters: Array\<{ type: string; text?: string }\>;
>
> }\>;
>
> }
>
> export interface WhatsAppInboundMessage {
>
> from: string;
>
> id: string;
>
> timestamp: string;
>
> type: string;
>
> text?: { body: string };
>
> image?: { id: string; mime_type: string };
>
> document?: { id: string; mime_type: string; filename?: string };
>
> audio?: { id: string; mime_type: string };
>
> context?: { id: string; forward?: boolean };
>
> }
>
> export interface WhatsAppWebhookEntry {
>
> id: string;
>
> changes: Array\<{
>
> value: {
>
> messaging_product: string;
>
> metadata: {
>
> display_phone_number: string;
>
> phone_number_id: string;
>
> };
>
> contacts?: Array\<{
>
> profile: { name?: string };
>
> wa_id: string;
>
> }\>;
>
> messages?: WhatsAppInboundMessage\[\];
>
> statuses?: Array\<{
>
> id: string;
>
> status: string;
>
> timestamp: string;
>
> recipient_id: string;
>
> }\>;
>
> };
>
> field: string;
>
> }\>;
>
> }
>
> export interface SendResult {
>
> success: boolean;
>
> messageId?: string;
>
> error?: string;
>
> }
>
> export interface WhatsAppProvider {
>
> name: string;
>
> sendMessage(message: WhatsAppMessage): Promise\<SendResult\>;
>
> markAsRead(messageId: string): Promise\<boolean\>;
>
> getQRCode?(): Promise\<string \| null\>;
>
> getConnectionStatus(): Promise\<\'CONNECTED\' \| \'DISCONNECTED\' \|
> \'QRCODE\' \| \'ERROR\'\>;
>
> }

**File: src/lib/whatsapp/metaProvider.ts**

> import { WhatsAppProvider, WhatsAppMessage, SendResult,
> WhatsAppWebhookEntry } from \'./types\';
>
> export class MetaWhatsAppProvider implements WhatsAppProvider {
>
> name = \'META\';
>
> private phoneNumberId: string;
>
> private accessToken: string;
>
> private apiVersion = \'v18.0\';
>
> private baseUrl = \'https://graph.facebook.com\';
>
> constructor(phoneNumberId: string, accessToken: string) {
>
> this.phoneNumberId = phoneNumberId;
>
> this.accessToken = accessToken;
>
> }
>
> async sendMessage(message: WhatsAppMessage): Promise\<SendResult\> {
>
> const url =
> \`\${this.baseUrl}/\${this.apiVersion}/\${this.phoneNumberId}/messages\`;
>
> const body: any = {
>
> messaging_product: \'whatsapp\',
>
> recipient_type: \'individual\',
>
> to: message.to,
>
> type: message.type,
>
> };
>
> switch (message.type) {
>
> case \'text\':
>
> body.text = { body: message.content, preview_url: message.previewUrl
> };
>
> break;
>
> case \'template\':
>
> body.template = message.content;
>
> break;
>
> case \'image\':
>
> case \'document\':
>
> case \'audio\':
>
> body\[message.type\] = message.content;
>
> break;
>
> }
>
> try {
>
> const response = await fetch(url, {
>
> method: \'POST\',
>
> headers: {
>
> \'Authorization\': \`Bearer \${this.accessToken}\`,
>
> \'Content-Type\': \'application/json\',
>
> },
>
> body: JSON.stringify(body),
>
> });
>
> const data = await response.json();
>
> if (!response.ok) {
>
> return {
>
> success: false,
>
> error: data.error?.message \|\| \'Unknown error\'
>
> };
>
> }
>
> return {
>
> success: true,
>
> messageId: data.messages?.\[0\]?.id
>
> };
>
> } catch (error: any) {
>
> return {
>
> success: false,
>
> error: error.message
>
> };
>
> }
>
> }
>
> async markAsRead(messageId: string): Promise\<boolean\> {
>
> const url =
> \`\${this.baseUrl}/\${this.apiVersion}/\${this.phoneNumberId}/messages\`;
>
> try {
>
> const response = await fetch(url, {
>
> method: \'POST\',
>
> headers: {
>
> \'Authorization\': \`Bearer \${this.accessToken}\`,
>
> \'Content-Type\': \'application/json\',
>
> },
>
> body: JSON.stringify({
>
> messaging_product: \'whatsapp\',
>
> status: \'read\',
>
> message_id: messageId,
>
> }),
>
> });
>
> return response.ok;
>
> } catch {
>
> return false;
>
> }
>
> }
>
> async getConnectionStatus(): Promise\<\'CONNECTED\' \|
> \'DISCONNECTED\' \| \'QRCODE\' \| \'ERROR\'\> {
>
> // Meta API is always \"connected\" if credentials are valid
>
> try {
>
> const url =
> \`\${this.baseUrl}/\${this.apiVersion}/\${this.phoneNumberId}\`;
>
> const response = await fetch(url, {
>
> headers: {
>
> \'Authorization\': \`Bearer \${this.accessToken}\`,
>
> },
>
> });
>
> return response.ok ? \'CONNECTED\' : \'ERROR\';
>
> } catch {
>
> return \'ERROR\';
>
> }
>
> }
>
> async downloadMedia(mediaId: string): Promise\<Buffer \| null\> {
>
> try {
>
> // First get the media URL
>
> const mediaUrl = \`\${this.baseUrl}/\${this.apiVersion}/\${mediaId}\`;
>
> const mediaResponse = await fetch(mediaUrl, {
>
> headers: {
>
> \'Authorization\': \`Bearer \${this.accessToken}\`,
>
> },
>
> });
>
> const mediaData = await mediaResponse.json();
>
> const downloadUrl = mediaData.url;
>
> if (!downloadUrl) return null;
>
> // Download the actual media
>
> const downloadResponse = await fetch(downloadUrl, {
>
> headers: {
>
> \'Authorization\': \`Bearer \${this.accessToken}\`,
>
> },
>
> });
>
> const arrayBuffer = await downloadResponse.arrayBuffer();
>
> return Buffer.from(arrayBuffer);
>
> } catch (error) {
>
> console.error(\'Failed to download media:\', error);
>
> return null;
>
> }
>
> }
>
> }

**File: src/lib/whatsapp/webhookHandler.ts**

> import { NextRequest, NextResponse } from \'next/server\';
>
> import { prisma } from \'../prisma\';
>
> import { WhatsAppWebhookEntry, WhatsAppInboundMessage } from
> \'./types\';
>
> export class WebhookHandler {
>
> private verifyToken: string;
>
> constructor(verifyToken: string) {
>
> this.verifyToken = verifyToken;
>
> }
>
> verifyWebhook(request: NextRequest): NextResponse {
>
> const mode = request.nextUrl.searchParams.get(\'hub.mode\');
>
> const token = request.nextUrl.searchParams.get(\'hub.verify_token\');
>
> const challenge = request.nextUrl.searchParams.get(\'hub.challenge\');
>
> if (mode === \'subscribe\' && token === this.verifyToken) {
>
> return new NextResponse(challenge, { status: 200 });
>
> }
>
> return new NextResponse(\'Verification failed\', { status: 403 });
>
> }
>
> async processWebhook(body: { entry: WhatsAppWebhookEntry\[\] }):
> Promise\<void\> {
>
> for (const entry of body.entry) {
>
> for (const change of entry.changes) {
>
> if (change.field === \'messages\') {
>
> await this.processMessagesChange(change.value);
>
> }
>
> }
>
> }
>
> }
>
> private async processMessagesChange(value: any): Promise\<void\> {
>
> const { messages, contacts, metadata, statuses } = value;
>
> // Process incoming messages
>
> if (messages && messages.length \> 0) {
>
> for (const message of messages) {
>
> await this.processIncomingMessage(message, contacts, metadata);
>
> }
>
> }
>
> // Process status updates
>
> if (statuses && statuses.length \> 0) {
>
> for (const status of statuses) {
>
> await this.processStatusUpdate(status);
>
> }
>
> }
>
> }
>
> private async processIncomingMessage(
>
> message: WhatsAppInboundMessage,
>
> contacts: any\[\],
>
> metadata: any
>
> ): Promise\<void\> {
>
> // Find tenant by phone number ID
>
> const instance = await prisma.whatsAppInstance.findFirst({
>
> where: {
>
> provider: \'META\',
>
> phoneNumberId: metadata.phone_number_id,
>
> },
>
> include: { tenant: true }
>
> });
>
> if (!instance) {
>
> console.error(\'No tenant found for phone number:\',
> metadata.phone_number_id);
>
> return;
>
> }
>
> const tenantId = instance.tenantId;
>
> const customerPhone = message.from;
>
> // Find or create customer
>
> let customer = await prisma.customer.findUnique({
>
> where: {
>
> tenantId_phoneE164: {
>
> tenantId,
>
> phoneE164: customerPhone
>
> }
>
> }
>
> });
>
> const contactInfo = contacts?.find(c =\> c.wa_id === customerPhone);
>
> if (!customer) {
>
> customer = await prisma.customer.create({
>
> data: {
>
> tenantId,
>
> name: contactInfo?.profile?.name \|\| \'Unknown\',
>
> phoneE164: customerPhone,
>
> }
>
> });
>
> }
>
> // Find or create conversation
>
> let conversation = await prisma.conversation.findFirst({
>
> where: {
>
> tenantId,
>
> customerId: customer.id,
>
> status: { in: \[\'OPEN\', \'PENDING\'\] }
>
> },
>
> orderBy: { lastMessageAt: \'desc\' }
>
> });
>
> if (!conversation) {
>
> conversation = await prisma.conversation.create({
>
> data: {
>
> tenantId,
>
> customerId: customer.id,
>
> channel: \'WHATSAPP\',
>
> status: \'OPEN\',
>
> }
>
> });
>
> }
>
> // Extract message content
>
> let content = \'\';
>
> let contentType = \'TEXT\';
>
> if (message.text) {
>
> content = message.text.body;
>
> contentType = \'TEXT\';
>
> } else if (message.image) {
>
> content = \`\[Image: \${message.image.id}\]\`;
>
> contentType = \'IMAGE\';
>
> } else if (message.document) {
>
> content = \`\[Document: \${message.document.filename \|\|
> message.document.id}\]\`;
>
> contentType = \'DOCUMENT\';
>
> } else if (message.audio) {
>
> content = \`\[Audio: \${message.audio.id}\]\`;
>
> contentType = \'AUDIO\';
>
> }
>
> // Save message
>
> await prisma.message.create({
>
> data: {
>
> conversationId: conversation.id,
>
> direction: \'INBOUND\',
>
> contentType,
>
> content,
>
> provider: \'META\',
>
> providerMessageId: message.id,
>
> status: \'SENT\',
>
> }
>
> });
>
> // Update conversation
>
> await prisma.conversation.update({
>
> where: { id: conversation.id },
>
> data: {
>
> lastMessageAt: new Date(),
>
> lastMessagePreview: content.substring(0, 100),
>
> unreadCount: { increment: 1 }
>
> }
>
> });
>
> // Trigger AI response if AI mode is active
>
> if (conversation.aiMode && contentType === \'TEXT\') {
>
> await this.triggerAIResponse(conversation.id, tenantId, content);
>
> }
>
> }
>
> private async processStatusUpdate(status: any): Promise\<void\> {
>
> await prisma.message.updateMany({
>
> where: { providerMessageId: status.id },
>
> data: { status: status.status.toUpperCase() }
>
> });
>
> }
>
> private async triggerAIResponse(
>
> conversationId: string,
>
> tenantId: string,
>
> userMessage: string
>
> ): Promise\<void\> {
>
> // This will be handled by a separate worker/job
>
> // For now, we\'ll create an AI execution request
>
> const { aiPool } = await import(\'../ai/pool\');
>
> // Get conversation history
>
> const messages = await prisma.message.findMany({
>
> where: { conversationId },
>
> orderBy: { createdAt: \'asc\' },
>
> take: 20
>
> });
>
> const conversationHistory = messages.map(m =\> ({
>
> role: m.direction === \'INBOUND\' ? \'user\' : \'assistant\',
>
> content: m.content
>
> }));
>
> // Get AI profile for tenant
>
> const aiProfile = await prisma.aiProfile.findUnique({
>
> where: { tenantId },
>
> include: {
>
> promptBlocks: {
>
> where: { isActive: true },
>
> orderBy: { sortOrder: \'asc\' }
>
> }
>
> }
>
> });
>
> // Build system prompt
>
> const systemPrompt = aiProfile?.promptBlocks
>
> .filter(b =\> b.blockType === \'SYSTEM\' \|\| b.blockType ===
> \'ATTENDANT\')
>
> .map(b =\> b.content)
>
> .join(\'\\n\\n\') \|\| \'You are a helpful assistant.\';
>
> // Execute AI with failover
>
> const result = await aiPool.executeWithFailover(
>
> tenantId,
>
> userMessage,
>
> {
>
> systemPrompt,
>
> conversationHistory,
>
> temperature: (aiProfile?.formalityLevel \|\| 50) / 100
>
> }
>
> );
>
> if (result.success && result.result) {
>
> // Get WhatsApp instance for this tenant
>
> const instance = await prisma.whatsAppInstance.findFirst({
>
> where: { tenantId, provider: \'META\' }
>
> });
>
> if (instance) {
>
> // Get conversation to get customer phone
>
> const conversation = await prisma.conversation.findUnique({
>
> where: { id: conversationId },
>
> include: { customer: true }
>
> });
>
> if (conversation?.customer.phoneE164) {
>
> // Import Meta provider and send response
>
> const { MetaWhatsAppProvider } = await import(\'./metaProvider\');
>
> const metaProvider = new MetaWhatsAppProvider(
>
> instance.phoneNumberId!,
>
> process.env.META_ACCESS_TOKEN!
>
> );
>
> const sendResult = await metaProvider.sendMessage({
>
> to: conversation.customer.phoneE164,
>
> type: \'text\',
>
> content: result.result.content
>
> });
>
> // Save outgoing message
>
> await prisma.message.create({
>
> data: {
>
> conversationId,
>
> direction: \'OUTBOUND\',
>
> contentType: \'TEXT\',
>
> content: result.result.content,
>
> provider: \'META\',
>
> providerMessageId: sendResult.messageId,
>
> aiGenerated: true,
>
> aiProvider: result.result.provider,
>
> status: sendResult.success ? \'SENT\' : \'FAILED\'
>
> }
>
> });
>
> }
>
> }
>
> }
>
> }
>
> }
>
> export const webhookHandler = new WebhookHandler(
>
> process.env.META_WEBHOOK_VERIFY_TOKEN \|\| \'\'
>
> );

════════════════════════════════════════════════════════════════════════════════

**7. Billing Integration**

**7.1 Iugu Integration**

The billing module integrates with Iugu for subscription management,
invoice generation, and payment processing. Webhooks handle automatic
status updates for subscription lifecycle events.

**File: src/lib/billing/iugu.ts**

> import { prisma } from \'../prisma\';
>
> interface IuguCustomer {
>
> id: string;
>
> name: string;
>
> email: string;
>
> phone?: string;
>
> cpf_cnpj?: string;
>
> }
>
> interface IuguSubscription {
>
> id: string;
>
> customer_id: string;
>
> plan_identifier?: string;
>
> expires_at: string;
>
> suspended: boolean;
>
> active: boolean;
>
> price_cents: number;
>
> credits_cycle: number;
>
> credits_min: number;
>
> subitems?: Array\<{
>
> id: string;
>
> description: string;
>
> price_cents: number;
>
> quantity: number;
>
> }\>;
>
> }
>
> interface IuguInvoice {
>
> id: string;
>
> customer_id: string;
>
> subscription_id?: string;
>
> total_cents: number;
>
> status: \'pending\' \| \'paid\' \| \'canceled\' \| \'partially_paid\'
> \| \'refunded\' \| \'expired\';
>
> due_date: string;
>
> secure_url: string;
>
> pdf_url?: string;
>
> }
>
> export class IuguClient {
>
> private apiKey: string;
>
> private baseUrl = \'https://api.iugu.com/v1\';
>
> constructor(apiKey: string) {
>
> this.apiKey = apiKey;
>
> }
>
> private async request(
>
> endpoint: string,
>
> method: \'GET\' \| \'POST\' \| \'PUT\' \| \'DELETE\' = \'GET\',
>
> body?: any
>
> ): Promise\<any\> {
>
> const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
>
> method,
>
> headers: {
>
> \'Authorization\': \`Basic \${Buffer.from(this.apiKey +
> \':\').toString(\'base64\')}\`,
>
> \'Content-Type\': \'application/json\',
>
> \'Accept\': \'application/json\',
>
> },
>
> body: body ? JSON.stringify(body) : undefined,
>
> });
>
> const data = await response.json();
>
> if (!response.ok) {
>
> throw new Error(data.errors?.join(\', \') \|\| \'Iugu API error\');
>
> }
>
> return data;
>
> }
>
> async createCustomer(data: {
>
> name: string;
>
> email: string;
>
> phone?: string;
>
> cpf_cnpj?: string;
>
> }): Promise\<IuguCustomer\> {
>
> return this.request(\'/customers\', \'POST\', data);
>
> }
>
> async createSubscription(data: {
>
> customer_id: string;
>
> plan_identifier: string;
>
> expires_at?: string;
>
> subitems?: Array\<{
>
> description: string;
>
> price_cents: number;
>
> quantity: number;
>
> }\>;
>
> }): Promise\<IuguSubscription\> {
>
> return this.request(\'/subscriptions\', \'POST\', data);
>
> }
>
> async getSubscription(subscriptionId: string):
> Promise\<IuguSubscription\> {
>
> return this.request(\`/subscriptions/\${subscriptionId}\`);
>
> }
>
> async suspendSubscription(subscriptionId: string):
> Promise\<IuguSubscription\> {
>
> return this.request(\`/subscriptions/\${subscriptionId}/suspend\`,
> \'POST\');
>
> }
>
> async activateSubscription(subscriptionId: string):
> Promise\<IuguSubscription\> {
>
> return this.request(\`/subscriptions/\${subscriptionId}/activate\`,
> \'POST\');
>
> }
>
> async cancelSubscription(subscriptionId: string): Promise\<void\> {
>
> await this.request(\`/subscriptions/\${subscriptionId}\`, \'DELETE\');
>
> }
>
> async getInvoice(invoiceId: string): Promise\<IuguInvoice\> {
>
> return this.request(\`/invoices/\${invoiceId}\`);
>
> }
>
> async createInvoice(data: {
>
> customer_id: string;
>
> subscription_id?: string;
>
> email: string;
>
> due_date: string;
>
> items: Array\<{
>
> description: string;
>
> quantity: number;
>
> price_cents: number;
>
> }\>;
>
> }): Promise\<IuguInvoice\> {
>
> return this.request(\'/invoices\', \'POST\', data);
>
> }
>
> }
>
> export class BillingService {
>
> private iugu: IuguClient;
>
> constructor() {
>
> this.iugu = new IuguClient(process.env.IUGU_API_KEY!);
>
> }
>
> async createTenantSubscription(
>
> tenantId: string,
>
> planId: string,
>
> customerData: { name: string; email: string; phone?: string }
>
> ): Promise\<{ subscriptionId: string; customerId: string }\> {
>
> // Get plan details
>
> const plan = await prisma.plan.findUnique({ where: { id: planId } });
>
> if (!plan) throw new Error(\'Plan not found\');
>
> // Create customer in Iugu
>
> const customer = await this.iugu.createCustomer({
>
> name: customerData.name,
>
> email: customerData.email,
>
> phone: customerData.phone
>
> });
>
> // Create subscription in Iugu
>
> const subscription = await this.iugu.createSubscription({
>
> customer_id: customer.id,
>
> plan_identifier: plan.slug,
>
> expires_at: plan.trialDays
>
> ? new Date(Date.now() + plan.trialDays \* 24 \* 60 \* 60 \*
> 1000).toISOString().split(\'T\')\[0\]
>
> : undefined
>
> });
>
> // Create subscription in database
>
> const dbSubscription = await prisma.subscription.create({
>
> data: {
>
> tenantId,
>
> planId,
>
> provider: \'IUGU\',
>
> providerSubscriptionId: subscription.id,
>
> providerCustomerId: customer.id,
>
> status: subscription.active ? \'active\' : \'trialing\',
>
> startedAt: new Date(),
>
> currentPeriodStart: new Date(),
>
> currentPeriodEnd: subscription.expires_at
>
> ? new Date(subscription.expires_at)
>
> : undefined
>
> }
>
> });
>
> // Create billing status record
>
> await prisma.tenantBillingStatus.create({
>
> data: {
>
> tenantId,
>
> status: subscription.active ? \'ACTIVE\' : \'TRIALING\'
>
> }
>
> });
>
> return {
>
> subscriptionId: dbSubscription.id,
>
> customerId: customer.id
>
> };
>
> }
>
> async processWebhook(event: {
>
> event: string;
>
> data: { id: string; \[key: string\]: any };
>
> }): Promise\<void\> {
>
> switch (event) {
>
> case \'invoice.status_changed\':
>
> await this.handleInvoiceStatusChange(event.data);
>
> break;
>
> case \'subscription.status_changed\':
>
> await this.handleSubscriptionStatusChange(event.data);
>
> break;
>
> }
>
> }
>
> private async handleInvoiceStatusChange(data: { id: string; status:
> string }): Promise\<void\> {
>
> const invoice = await this.iugu.getInvoice(data.id);
>
> // Update local invoice record
>
> await prisma.invoice.updateMany({
>
> where: { providerInvoiceId: data.id },
>
> data: {
>
> status: invoice.status.toUpperCase(),
>
> paidAt: invoice.status === \'paid\' ? new Date() : undefined
>
> }
>
> });
>
> // If paid, update subscription status
>
> if (invoice.status === \'paid\') {
>
> const subscription = await prisma.subscription.findFirst({
>
> where: { providerSubscriptionId: invoice.subscription_id }
>
> });
>
> if (subscription) {
>
> await prisma.subscription.update({
>
> where: { id: subscription.id },
>
> data: {
>
> status: \'active\',
>
> reactivatedAt: subscription.status === \'suspended\' ? new Date() :
> undefined
>
> }
>
> });
>
> await prisma.tenantBillingStatus.update({
>
> where: { tenantId: subscription.tenantId },
>
> data: {
>
> status: \'ACTIVE\',
>
> enforcementLevel: 0,
>
> graceEndsAt: null
>
> }
>
> });
>
> // Re-enable tenant
>
> await prisma.tenant.update({
>
> where: { id: subscription.tenantId },
>
> data: { status: \'ACTIVE\' }
>
> });
>
> }
>
> }
>
> }
>
> private async handleSubscriptionStatusChange(data: { id: string;
> status: string }): Promise\<void\> {
>
> const subscription = await prisma.subscription.findFirst({
>
> where: { providerSubscriptionId: data.id }
>
> });
>
> if (!subscription) return;
>
> const plan = await prisma.plan.findUnique({ where: { id:
> subscription.planId } });
>
> const graceDays = plan?.graceDays \|\| 5;
>
> switch (data.status) {
>
> case \'suspended\':
>
> // Enter grace period
>
> await prisma.subscription.update({
>
> where: { id: subscription.id },
>
> data: { status: \'past_due\' }
>
> });
>
> await prisma.tenantBillingStatus.update({
>
> where: { tenantId: subscription.tenantId },
>
> data: {
>
> status: \'GRACE_PERIOD\',
>
> enforcementLevel: 2,
>
> graceEndsAt: new Date(Date.now() + graceDays \* 24 \* 60 \* 60 \*
> 1000)
>
> }
>
> });
>
> break;
>
> case \'active\':
>
> await prisma.subscription.update({
>
> where: { id: subscription.id },
>
> data: { status: \'active\' }
>
> });
>
> await prisma.tenantBillingStatus.update({
>
> where: { tenantId: subscription.tenantId },
>
> data: {
>
> status: \'ACTIVE\',
>
> enforcementLevel: 0,
>
> graceEndsAt: null
>
> }
>
> });
>
> break;
>
> }
>
> }
>
> async checkGracePeriodExpirations(): Promise\<void\> {
>
> const expiredTenants = await prisma.tenantBillingStatus.findMany({
>
> where: {
>
> status: \'GRACE_PERIOD\',
>
> graceEndsAt: { lte: new Date() }
>
> }
>
> });
>
> for (const billing of expiredTenants) {
>
> // Suspend tenant
>
> await prisma.tenant.update({
>
> where: { id: billing.tenantId },
>
> data: { status: \'SUSPENDED\' }
>
> });
>
> await prisma.tenantBillingStatus.update({
>
> where: { id: billing.id },
>
> data: {
>
> status: \'SUSPENDED\',
>
> enforcementLevel: 3
>
> }
>
> });
>
> // Update subscription
>
> await prisma.subscription.updateMany({
>
> where: { tenantId: billing.tenantId },
>
> data: { status: \'suspended\', suspendedAt: new Date() }
>
> });
>
> // Create alert
>
> await prisma.operationalAlert.create({
>
> data: {
>
> tenantId: billing.tenantId,
>
> type: \'PAYMENT_FAILED\',
>
> severity: \'CRITICAL\',
>
> title: \'Account Suspended\',
>
> description: \'Account suspended due to payment failure and expired
> grace period\'
>
> }
>
> });
>
> }
>
> }
>
> }
>
> export const billingService = new BillingService();

════════════════════════════════════════════════════════════════════════════════

**8. API Routes**

**8.1 Authentication Routes**

**File: src/app/api/auth/\[\...nextauth\]/route.ts**

> import NextAuth from \'next-auth\';
>
> import { authOptions } from \'@/lib/auth\';
>
> const handler = NextAuth(authOptions);
>
> export { handler as GET, handler as POST };

**8.2 WhatsApp Webhook Route**

**File: src/app/api/webhooks/whatsapp/route.ts**

> import { NextRequest, NextResponse } from \'next/server\';
>
> import { webhookHandler } from \'@/lib/whatsapp/webhookHandler\';
>
> export async function GET(request: NextRequest) {
>
> return webhookHandler.verifyWebhook(request);
>
> }
>
> export async function POST(request: NextRequest) {
>
> try {
>
> const body = await request.json();
>
> await webhookHandler.processWebhook(body);
>
> return NextResponse.json({ status: \'ok\' });
>
> } catch (error) {
>
> console.error(\'Webhook processing error:\', error);
>
> return NextResponse.json(
>
> { error: \'Processing failed\' },
>
> { status: 500 }
>
> );
>
> }
>
> }

**8.3 Billing Webhook Route**

**File: src/app/api/webhooks/billing/route.ts**

> import { NextRequest, NextResponse } from \'next/server\';
>
> import { billingService } from \'@/lib/billing/iugu\';
>
> export async function POST(request: NextRequest) {
>
> try {
>
> const body = await request.json();
>
> // Verify webhook signature (Iugu specific)
>
> const signature = request.headers.get(\'x-iugu-event\');
>
> if (!signature) {
>
> return NextResponse.json(
>
> { error: \'Invalid signature\' },
>
> { status: 401 }
>
> );
>
> }
>
> await billingService.processWebhook({
>
> event: body.event,
>
> data: body.data
>
> });
>
> return NextResponse.json({ status: \'ok\' });
>
> } catch (error) {
>
> console.error(\'Billing webhook error:\', error);
>
> return NextResponse.json(
>
> { error: \'Processing failed\' },
>
> { status: 500 }
>
> );
>
> }
>
> }

**8.4 Conversations API**

**File: src/app/api/conversations/route.ts**

> import { NextRequest, NextResponse } from \'next/server\';
>
> import { getServerSession } from \'next-auth\';
>
> import { authOptions } from \'@/lib/auth\';
>
> import { prisma } from \'@/lib/prisma\';
>
> export async function GET(request: NextRequest) {
>
> const session = await getServerSession(authOptions);
>
> if (!session?.user?.activeTenantId) {
>
> return NextResponse.json({ error: \'Unauthorized\' }, { status: 401
> });
>
> }
>
> const tenantId = session.user.activeTenantId;
>
> const { searchParams } = new URL(request.url);
>
> const status = searchParams.get(\'status\');
>
> const assignedMode = searchParams.get(\'assignedMode\');
>
> const limit = parseInt(searchParams.get(\'limit\') \|\| \'50\');
>
> const offset = parseInt(searchParams.get(\'offset\') \|\| \'0\');
>
> const where: any = { tenantId };
>
> if (status) where.status = status;
>
> if (assignedMode) where.assignedMode = assignedMode;
>
> const conversations = await prisma.conversation.findMany({
>
> where,
>
> include: {
>
> customer: true,
>
> messages: {
>
> orderBy: { createdAt: \'desc\' },
>
> take: 1
>
> },
>
> \_count: {
>
> select: { messages: true }
>
> }
>
> },
>
> orderBy: { lastMessageAt: \'desc\' },
>
> take: limit,
>
> skip: offset
>
> });
>
> return NextResponse.json({ conversations });
>
> }
>
> export async function POST(request: NextRequest) {
>
> const session = await getServerSession(authOptions);
>
> if (!session?.user?.activeTenantId) {
>
> return NextResponse.json({ error: \'Unauthorized\' }, { status: 401
> });
>
> }
>
> const tenantId = session.user.activeTenantId;
>
> const body = await request.json();
>
> // Create or find customer
>
> let customer = await prisma.customer.findUnique({
>
> where: {
>
> tenantId_phoneE164: {
>
> tenantId,
>
> phoneE164: body.customerPhone
>
> }
>
> }
>
> });
>
> if (!customer) {
>
> customer = await prisma.customer.create({
>
> data: {
>
> tenantId,
>
> name: body.customerName \|\| \'Unknown\',
>
> phoneE164: body.customerPhone
>
> }
>
> });
>
> }
>
> // Create conversation
>
> const conversation = await prisma.conversation.create({
>
> data: {
>
> tenantId,
>
> customerId: customer.id,
>
> channel: body.channel \|\| \'WHATSAPP\',
>
> status: \'OPEN\',
>
> aiMode: body.aiMode ?? true
>
> },
>
> include: { customer: true }
>
> });
>
> return NextResponse.json({ conversation });
>
> }

════════════════════════════════════════════════════════════════════════════════

**9. Deployment Configuration**

**9.1 Docker Configuration**

**File: Dockerfile**

> FROM node:20-alpine AS base
>
> \# Install dependencies only when needed
>
> FROM base AS deps
>
> RUN apk add \--no-cache libc6-compat
>
> WORKDIR /app
>
> \# Install dependencies
>
> COPY package.json bun.lockb ./
>
> RUN npm install -g bun && bun install \--frozen-lockfile
>
> \# Rebuild the source code only when needed
>
> FROM base AS builder
>
> WORKDIR /app
>
> COPY \--from=deps /app/node_modules ./node_modules
>
> COPY . .
>
> \# Generate Prisma Client
>
> RUN npx prisma generate
>
> \# Build the application
>
> ENV NEXT_TELEMETRY_DISABLED 1
>
> RUN npm run build
>
> \# Production image
>
> FROM base AS runner
>
> WORKDIR /app
>
> ENV NODE_ENV production
>
> ENV NEXT_TELEMETRY_DISABLED 1
>
> RUN addgroup \--system \--gid 1001 nodejs
>
> RUN adduser \--system \--uid 1001 nextjs
>
> COPY \--from=builder /app/public ./public
>
> COPY \--from=builder /app/.next/standalone ./
>
> COPY \--from=builder /app/.next/static ./.next/static
>
> COPY \--from=builder /app/prisma ./prisma
>
> USER nextjs
>
> EXPOSE 3000
>
> ENV PORT 3000
>
> ENV HOSTNAME \"0.0.0.0\"
>
> CMD \[\"node\", \"server.js\"\]

**9.2 Docker Compose**

**File: docker-compose.yml**

> version: \'3.8\'
>
> services:
>
> app:
>
> build: .
>
> ports:
>
> \- \"3000:3000\"
>
> environment:
>
> \- DATABASE_URL=postgresql://postgres:password@db:5432/saaswpp
>
> \- REDIS_URL=redis://redis:6379
>
> \- NEXTAUTH_URL=http://localhost:3000
>
> \- NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
>
> \- IUGU_API_KEY=\${IUGU_API_KEY}
>
> \- META_APP_ID=\${META_APP_ID}
>
> \- META_APP_SECRET=\${META_APP_SECRET}
>
> \- OPENAI_API_KEY=\${OPENAI_API_KEY}
>
> \- ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}
>
> depends_on:
>
> \- db
>
> \- redis
>
> restart: unless-stopped
>
> db:
>
> image: postgres:15-alpine
>
> environment:
>
> \- POSTGRES_USER=postgres
>
> \- POSTGRES_PASSWORD=password
>
> \- POSTGRES_DB=saaswpp
>
> volumes:
>
> \- postgres_data:/var/lib/postgresql/data
>
> ports:
>
> \- \"5432:5432\"
>
> restart: unless-stopped
>
> redis:
>
> image: redis:7-alpine
>
> volumes:
>
> \- redis_data:/data
>
> ports:
>
> \- \"6379:6379\"
>
> restart: unless-stopped
>
> volumes:
>
> postgres_data:
>
> redis_data:

This document provides the complete implementation foundation for the
SaaSWPP AI platform. Additional modules and components follow similar
patterns established in the core libraries. The architecture emphasizes
modularity, type safety, and resilience through failover mechanisms and
comprehensive error handling.
