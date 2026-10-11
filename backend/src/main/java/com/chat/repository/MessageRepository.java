package com.chat.repository;

import com.chat.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m " +
           "WHERE (m.sender.id = :user1Id AND m.recipient.id = :user2Id) " +
           "   OR (m.sender.id = :user2Id AND m.recipient.id = :user1Id) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findConversationMessages(@Param("user1Id") Long user1Id,
                                          @Param("user2Id") Long user2Id);

    @Query("SELECT m FROM Message m " +
           "WHERE (m.sender.id = :user1Id AND m.recipient.id = :user2Id) " +
           "   OR (m.sender.id = :user2Id AND m.recipient.id = :user1Id) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findConversationMessagesPaged(@Param("user1Id") Long user1Id,
                                               @Param("user2Id") Long user2Id,
                                               Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.id IN (" +
           "  SELECT MAX(m2.id) FROM Message m2 " +
           "  WHERE m2.sender.id = :userId OR m2.recipient.id = :userId " +
           "  GROUP BY CASE " +
           "    WHEN m2.sender.id = :userId THEN m2.recipient.id " +
           "    ELSE m2.sender.id END" +
           ") ORDER BY m.timestamp DESC")
    List<Message> findRecentConversations(@Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender.id = :senderId AND m.recipient.id = :recipientId AND m.isRead = false")
    int markMessagesAsRead(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId);
}
