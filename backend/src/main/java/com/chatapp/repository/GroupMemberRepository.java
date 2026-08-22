package com.chatapp.repository;

import com.chatapp.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    Optional<GroupMember> findByChatIdAndUserId(Long chatId, Long userId);

    List<GroupMember> findByChatId(Long chatId);

    List<GroupMember> findByUserId(Long userId);

    boolean existsByChatIdAndUserId(Long chatId, Long userId);

    void deleteByChatIdAndUserId(Long chatId, Long userId);
}
