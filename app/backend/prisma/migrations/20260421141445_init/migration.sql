-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('RULE', 'SKILL', 'WORKFLOW', 'COMMAND', 'ENVIRONMENT_WRAPPER');

-- CreateEnum
CREATE TYPE "AIEnvironment" AS ENUM ('CLAUDE', 'CODEX', 'CURSOR', 'OPENCODE', 'AGENTS', 'ALL');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'DRIFTED', 'NON_COMPLIANT', 'UNKNOWN', 'PENDING');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'SYNC', 'APPLY');

-- CreateTable
CREATE TABLE "GovernanceArtifact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "description" TEXT,
    "filePath" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "environments" "AIEnvironment"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovernanceArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "repoPath" TEXT,
    "repoUrl" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastVerifiedAt" TIMESTAMP(3),
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'UNKNOWN',
    "complianceScore" INTEGER,
    "apiKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectArtifactAssignment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "environments" "AIEnvironment"[],
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "overridePolicy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectArtifactAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCheck" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL,
    "score" INTEGER,
    "summary" TEXT,
    "details" JSONB,
    "triggeredBy" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernanceAuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "userId" TEXT,
    "artifactId" TEXT,
    "projectId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GovernanceAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GovernanceArtifact_filePath_key" ON "GovernanceArtifact"("filePath");

-- CreateIndex
CREATE INDEX "GovernanceArtifact_type_idx" ON "GovernanceArtifact"("type");

-- CreateIndex
CREATE INDEX "GovernanceArtifact_isActive_idx" ON "GovernanceArtifact"("isActive");

-- CreateIndex
CREATE INDEX "GovernanceArtifact_name_idx" ON "GovernanceArtifact"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_apiKey_key" ON "Project"("apiKey");

-- CreateIndex
CREATE INDEX "Project_complianceStatus_idx" ON "Project"("complianceStatus");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "ProjectArtifactAssignment_projectId_idx" ON "ProjectArtifactAssignment"("projectId");

-- CreateIndex
CREATE INDEX "ProjectArtifactAssignment_artifactId_idx" ON "ProjectArtifactAssignment"("artifactId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectArtifactAssignment_projectId_artifactId_key" ON "ProjectArtifactAssignment"("projectId", "artifactId");

-- CreateIndex
CREATE INDEX "ComplianceCheck_projectId_idx" ON "ComplianceCheck"("projectId");

-- CreateIndex
CREATE INDEX "ComplianceCheck_createdAt_idx" ON "ComplianceCheck"("createdAt");

-- CreateIndex
CREATE INDEX "ComplianceCheck_status_idx" ON "ComplianceCheck"("status");

-- CreateIndex
CREATE INDEX "GovernanceAuditLog_createdAt_idx" ON "GovernanceAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "GovernanceAuditLog_action_idx" ON "GovernanceAuditLog"("action");

-- CreateIndex
CREATE INDEX "GovernanceAuditLog_artifactId_idx" ON "GovernanceAuditLog"("artifactId");

-- CreateIndex
CREATE INDEX "GovernanceAuditLog_projectId_idx" ON "GovernanceAuditLog"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- AddForeignKey
ALTER TABLE "ProjectArtifactAssignment" ADD CONSTRAINT "ProjectArtifactAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectArtifactAssignment" ADD CONSTRAINT "ProjectArtifactAssignment_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "GovernanceArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceAuditLog" ADD CONSTRAINT "GovernanceAuditLog_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "GovernanceArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernanceAuditLog" ADD CONSTRAINT "GovernanceAuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
