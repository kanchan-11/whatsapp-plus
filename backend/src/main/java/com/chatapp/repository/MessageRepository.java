package com.chatapp.repository;

import com.chatapp.model.Message;
import com.chatapp.model.enums.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByChatIdOrderByCreatedAtAsc(Long chatId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.sender.id != :userId AND m.status != com.chatapp.model.enums.MessageStatus.READ")
    long countUnreadMessages(@Param("chatId") Long chatId, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.status = :status WHERE m.chat.id = :chatId AND m.sender.id != :currentUserId AND m.status != com.chatapp.model.enums.MessageStatus.READ")
    int updateMessagesStatusForChat(@Param("chatId") Long chatId, @Param("currentUserId") Long currentUserId, @Param("status") MessageStatus status);

    @Query("SELECT m.id FROM Message m WHERE m.chat.id = :chatId AND m.sender.id != :currentUserId AND m.status != com.chatapp.model.enums.MessageStatus.READ")
    List<Long> findUnreadMessageIdsForChat(@Param("chatId") Long chatId, @Param("currentUserId") Long currentUserId);
}
