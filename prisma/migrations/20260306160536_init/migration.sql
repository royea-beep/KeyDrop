-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "business_name" TEXT,
    "logo_url" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "credential_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_email" TEXT,
    "client_phone" TEXT,
    "project_name" TEXT,
    "note" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expires_at" DATETIME NOT NULL,
    "max_views" INTEGER NOT NULL DEFAULT 1,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" DATETIME,
    "retrieved_at" DATETIME,
    "revoked_at" DATETIME,
    "submitter_ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "credential_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "credential_fields" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "request_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL DEFAULT 'TEXT',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "placeholder" TEXT,
    "hint" TEXT,
    "validation_pattern" TEXT,
    "encrypted_value" TEXT,
    "iv" TEXT,
    "auth_tag" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credential_fields_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "credential_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "oauth_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "request_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_label" TEXT NOT NULL,
    "scopes" TEXT,
    "encrypted_token" TEXT,
    "iv" TEXT,
    "auth_tag" TEXT,
    "token_type" TEXT,
    "expires_at" DATETIME,
    "refresh_encrypted" TEXT,
    "refresh_iv" TEXT,
    "refresh_auth_tag" TEXT,
    "connected_at" DATETIME,
    "account_name" TEXT,
    "account_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "oauth_connections_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "credential_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "service_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT NOT NULL,
    "auth_method" TEXT NOT NULL DEFAULT 'MANUAL',
    "oauth_provider" TEXT,
    "oauth_scopes" TEXT,
    "fields" TEXT NOT NULL,
    "guide" TEXT,
    "validation_rules" TEXT,
    "stuck_count" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "avg_completion_sec" REAL,
    "is_built_in" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "request_id" TEXT,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "credential_requests" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "credential_requests_token_key" ON "credential_requests"("token");

-- CreateIndex
CREATE INDEX "credential_requests_token_idx" ON "credential_requests"("token");

-- CreateIndex
CREATE INDEX "credential_requests_user_id_status_idx" ON "credential_requests"("user_id", "status");

-- CreateIndex
CREATE INDEX "credential_requests_expires_at_idx" ON "credential_requests"("expires_at");

-- CreateIndex
CREATE INDEX "credential_fields_request_id_idx" ON "credential_fields"("request_id");

-- CreateIndex
CREATE INDEX "oauth_connections_request_id_idx" ON "oauth_connections"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_templates_slug_key" ON "service_templates"("slug");

-- CreateIndex
CREATE INDEX "service_templates_category_idx" ON "service_templates"("category");

-- CreateIndex
CREATE INDEX "audit_logs_request_id_idx" ON "audit_logs"("request_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
