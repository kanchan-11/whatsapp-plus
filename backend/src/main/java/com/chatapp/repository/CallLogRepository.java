package com.chatapp.repository;

import com.chatapp.model.CallLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CallLogRepository extends JpaRepository<CallLog, Long> {

    @Query("SELECT c FROM CallLog c WHERE c.caller.id = :userId OR c.receiver.id = :userId ORDER BY c.startedAt DESC")
    List<CallLog> findCallHistoryByUserId(@Param("userId") Long userId);
}
