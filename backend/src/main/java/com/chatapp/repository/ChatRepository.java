package com.chatapp.repository;

import com.chatapp.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT DISTINCT c FROM Chat c JOIN c.members m WHERE m.user.id = :userId ORDER BY c.updatedAt DESC")
    List<Chat> findChatsByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Chat c WHERE c.type = com.chatapp.model.enums.ChatType.DIRECT AND c.id IN " +
           "(SELECT m1.chat.id FROM GroupMember m1 JOIN GroupMember m2 ON m1.chat.id = m2.chat.id " +
           "WHERE m1.user.id = :user1Id AND m2.user.id = :user2Id)")
    Optional<Chat> findDirectChatBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}
