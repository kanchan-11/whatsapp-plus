package com.chatapp.repository;

import com.chatapp.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {

    List<MessageReaction> findByMessageId(Long messageId);

    Optional<MessageReaction> findByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);

    @Modifying
    @Transactional
    @Query("DELETE FROM MessageReaction r WHERE r.message.id = :messageId AND r.user.id = :userId AND r.emoji = :emoji")
    void deleteByMessageIdAndUserIdAndEmoji(@Param("messageId") Long messageId, @Param("userId") Long userId, @Param("emoji") String emoji);

    boolean existsByMessageIdAndUserIdAndEmoji(Long messageId, Long userId, String emoji);
}
