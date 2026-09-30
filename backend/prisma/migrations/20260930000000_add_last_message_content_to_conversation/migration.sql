-- Store a conversation preview without requiring a message lookup.
ALTER TABLE "conversations"
ADD COLUMN "last_message_content" TEXT;
