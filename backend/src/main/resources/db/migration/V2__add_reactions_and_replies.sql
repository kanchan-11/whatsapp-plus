-- ==============================================================================
-- Flyway Migration V2: Add Message Reactions & Threaded Replies
-- ==============================================================================

-- 1. ADD PARENT MESSAGE ID FOR THREADED REPLIES
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS parent_message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_message_id);

-- 2. CREATE MESSAGE REACTIONS TABLE
CREATE TABLE IF NOT EXISTS message_reactions (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_message_user_emoji UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON message_reactions(user_id);
