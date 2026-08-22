package com.chatapp.config;

import com.chatapp.model.CallLog;
import com.chatapp.model.Chat;
import com.chatapp.model.GroupMember;
import com.chatapp.model.Message;
import com.chatapp.model.User;
import com.chatapp.model.enums.CallStatus;
import com.chatapp.model.enums.CallType;
import com.chatapp.model.enums.ChatType;
import com.chatapp.model.enums.GroupRole;
import com.chatapp.model.enums.MessageStatus;
import com.chatapp.model.enums.MessageType;
import com.chatapp.repository.CallLogRepository;
import com.chatapp.repository.ChatRepository;
import com.chatapp.repository.GroupMemberRepository;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MessageRepository messageRepository;
    private final CallLogRepository callLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            ChatRepository chatRepository,
            GroupMemberRepository groupMemberRepository,
            MessageRepository messageRepository,
            CallLogRepository callLogRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.chatRepository = chatRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.messageRepository = messageRepository;
        this.callLogRepository = callLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Create Demo Users
        User alice = new User();
        alice.setUsername("alice");
        alice.setEmail("alice@example.com");
        alice.setPassword(passwordEncoder.encode("password123"));
        alice.setDisplayName("Alice Walker");
        alice.setAvatarUrl("https://api.dicebear.com/7.x/lorelei/svg?seed=Coco");
        alice.setStatusBio("Exploring new places & tech ✨");
        alice.setOnline(true);
        alice.setLastSeen(LocalDateTime.now());
        alice = userRepository.save(alice);

        User bob = new User();
        bob.setUsername("bob");
        bob.setEmail("bob@example.com");
        bob.setPassword(passwordEncoder.encode("password123"));
        bob.setDisplayName("Bob Miller");
        bob.setAvatarUrl("https://api.dicebear.com/7.x/adventurer/svg?seed=Gizmo");
        bob.setStatusBio("Coding React & Spring Boot 💻");
        bob.setOnline(true);
        bob.setLastSeen(LocalDateTime.now());
        bob = userRepository.save(bob);

        User charlie = new User();
        charlie.setUsername("charlie");
        charlie.setEmail("charlie@example.com");
        charlie.setPassword(passwordEncoder.encode("password123"));
        charlie.setDisplayName("Charlie Davis");
        charlie.setAvatarUrl("https://api.dicebear.com/7.x/micah/svg?seed=Jack");
        charlie.setStatusBio("Available for calls 📞");
        charlie.setOnline(false);
        charlie.setLastSeen(LocalDateTime.now().minusMinutes(15));
        charlie = userRepository.save(charlie);

        User demoUser = new User();
        demoUser.setUsername("user");
        demoUser.setEmail("user@example.com");
        demoUser.setPassword(passwordEncoder.encode("password123"));
        demoUser.setDisplayName("Demo User");
        demoUser.setAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Felix");
        demoUser.setStatusBio("Welcome to WhatsApp Clone! 👋");
        demoUser.setOnline(true);
        demoUser.setLastSeen(LocalDateTime.now());
        demoUser = userRepository.save(demoUser);

        // 2. Create Direct Chat between Demo User and Alice
        Chat directChat1 = new Chat(ChatType.DIRECT, null, demoUser);
        directChat1 = chatRepository.save(directChat1);

        GroupMember dm1 = new GroupMember(directChat1, demoUser, GroupRole.MEMBER);
        GroupMember dm2 = new GroupMember(directChat1, alice, GroupRole.MEMBER);
        groupMemberRepository.saveAll(List.of(dm1, dm2));
        directChat1.getMembers().addAll(List.of(dm1, dm2));

        Message msg1 = new Message(directChat1, alice, "Hey there! Welcome to the new WhatsApp Clone app! 🚀", MessageType.TEXT);
        msg1.setStatus(MessageStatus.READ);
        msg1.setCreatedAt(LocalDateTime.now().minusMinutes(20));
        msg1 = messageRepository.save(msg1);

        Message msg2 = new Message(directChat1, demoUser, "Hi Alice! It looks fantastic. Audio and Video calling work so fast!", MessageType.TEXT);
        msg2.setStatus(MessageStatus.READ);
        msg2.setCreatedAt(LocalDateTime.now().minusMinutes(18));
        msg2 = messageRepository.save(msg2);

        Message msg3 = new Message(directChat1, alice, "Feel free to test out sending photos, videos, or starting a call! 🎥📞", MessageType.TEXT);
        msg3.setStatus(MessageStatus.DELIVERED);
        msg3.setCreatedAt(LocalDateTime.now().minusMinutes(5));
        msg3 = messageRepository.save(msg3);

        directChat1.setLastMessage(msg3);
        directChat1.setUpdatedAt(msg3.getCreatedAt());
        chatRepository.save(directChat1);

        // 3. Create Direct Chat between Demo User and Bob
        Chat directChat2 = new Chat(ChatType.DIRECT, null, demoUser);
        directChat2 = chatRepository.save(directChat2);

        GroupMember dm3 = new GroupMember(directChat2, demoUser, GroupRole.MEMBER);
        GroupMember dm4 = new GroupMember(directChat2, bob, GroupRole.MEMBER);
        groupMemberRepository.saveAll(List.of(dm3, dm4));
        directChat2.getMembers().addAll(List.of(dm3, dm4));

        Message bMsg = new Message(directChat2, bob, "Hey, let's test a voice call when you're free!", MessageType.TEXT);
        bMsg.setStatus(MessageStatus.SENT);
        bMsg.setCreatedAt(LocalDateTime.now().minusMinutes(10));
        bMsg = messageRepository.save(bMsg);

        directChat2.setLastMessage(bMsg);
        directChat2.setUpdatedAt(bMsg.getCreatedAt());
        chatRepository.save(directChat2);

        // 4. Create Group Chat: "Developers & Creators Hub"
        Chat groupChat = new Chat(ChatType.GROUP, "Developers Hub 🚀", demoUser);
        groupChat.setDescription("Official team group for development and media sharing.");
        groupChat.setImage("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80");
        groupChat = chatRepository.save(groupChat);

        GroupMember gm1 = new GroupMember(groupChat, demoUser, GroupRole.ADMIN);
        GroupMember gm2 = new GroupMember(groupChat, alice, GroupRole.MEMBER);
        GroupMember gm3 = new GroupMember(groupChat, bob, GroupRole.MEMBER);
        GroupMember gm4 = new GroupMember(groupChat, charlie, GroupRole.MEMBER);
        groupMemberRepository.saveAll(List.of(gm1, gm2, gm3, gm4));
        groupChat.getMembers().addAll(List.of(gm1, gm2, gm3, gm4));

        Message gMsg1 = new Message(groupChat, demoUser, "Welcome everyone to the Developers Hub group! 🎉", MessageType.TEXT);
        gMsg1.setStatus(MessageStatus.READ);
        gMsg1.setCreatedAt(LocalDateTime.now().minusHours(1));
        gMsg1 = messageRepository.save(gMsg1);

        Message gMsg2 = new Message(groupChat, bob, "Awesome! We can share code snippets, images, and videos here.", MessageType.TEXT);
        gMsg2.setStatus(MessageStatus.READ);
        gMsg2.setCreatedAt(LocalDateTime.now().minusMinutes(40));
        gMsg2 = messageRepository.save(gMsg2);

        groupChat.setLastMessage(gMsg2);
        groupChat.setUpdatedAt(gMsg2.getCreatedAt());
        chatRepository.save(groupChat);

        // 5. Seed Initial Call Logs
        CallLog call1 = new CallLog(alice, demoUser, CallType.VIDEO, CallStatus.COMPLETED, LocalDateTime.now().minusHours(2));
        call1.setEndedAt(LocalDateTime.now().minusHours(2).plusMinutes(14));
        call1.setDurationSeconds(840);

        CallLog call2 = new CallLog(bob, demoUser, CallType.AUDIO, CallStatus.MISSED, LocalDateTime.now().minusMinutes(35));
        call2.setEndedAt(LocalDateTime.now().minusMinutes(35));
        call2.setDurationSeconds(0);

        CallLog call3 = new CallLog(demoUser, alice, CallType.AUDIO, CallStatus.COMPLETED, LocalDateTime.now().minusMinutes(12));
        call3.setEndedAt(LocalDateTime.now().minusMinutes(8));
        call3.setDurationSeconds(240);

        callLogRepository.saveAll(List.of(call1, call2, call3));

        System.out.println(">>> Demo users, chats, and call logs initialized successfully! <<<");
    }
}
