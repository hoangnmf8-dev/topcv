ALTER TABLE "accounts" ADD COLUMN "google_subject" VARCHAR(255);
CREATE UNIQUE INDEX "accounts_google_subject_key" ON "accounts"("google_subject");
