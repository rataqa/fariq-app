-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repo" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "webUrl" TEXT NOT NULL,
    "projectId" UUID NOT NULL,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" UUID NOT NULL,
    "descriptor" TEXT NOT NULL,
    "uniqueName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "teamId" UUID NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mergeStatus" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL,
    "creationDate" TEXT NOT NULL,
    "closedDate" TEXT,
    "creationDay" INTEGER NOT NULL,
    "createdById" UUID NOT NULL,
    "createdByUniqueName" TEXT NOT NULL,
    "repoId" UUID NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE INDEX "Team_projectId_idx" ON "Team"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Repo_name_key" ON "Repo"("name");

-- CreateIndex
CREATE INDEX "Repo_projectId_idx" ON "Repo"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_descriptor_key" ON "Member"("descriptor");

-- CreateIndex
CREATE UNIQUE INDEX "Member_uniqueName_key" ON "Member"("uniqueName");

-- CreateIndex
CREATE INDEX "Member_teamId_idx" ON "Member"("teamId");

-- CreateIndex
CREATE INDEX "PullRequest_creationDay_idx" ON "PullRequest"("creationDay");

-- CreateIndex
CREATE INDEX "PullRequest_createdById_idx" ON "PullRequest"("createdById");

-- CreateIndex
CREATE INDEX "PullRequest_createdByUniqueName_idx" ON "PullRequest"("createdByUniqueName");

-- CreateIndex
CREATE INDEX "PullRequest_repoId_idx" ON "PullRequest"("repoId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repo" ADD CONSTRAINT "Repo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
