package com.pickmeup.domain.message;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "threads")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Thread extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @Column(name = "sender_name", nullable = false, length = 100)
    private String senderName;
    
    @Column(name = "sender_email", nullable = false, length = 100)
    private String senderEmail;
    
    @Column(length = 200)
    private String subject;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ThreadStatus status = ThreadStatus.UNREAD;
    
    @Column(name = "is_starred")
    @Builder.Default
    private Boolean isStarred = false;
    
    @Column(name = "is_archived")
    @Builder.Default
    private Boolean isArchived = false;
    
    @Column(name = "message_count")
    @Builder.Default
    private Integer messageCount = 0;
    
    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();
    
    public void markAsRead() {
        this.status = ThreadStatus.READ;
    }
    
    public void toggleStar() {
        this.isStarred = !this.isStarred;
    }
    
    public void archive() {
        this.isArchived = true;
    }
    
    public void incrementMessageCount() {
        this.messageCount++;
    }
    
    public void updateStatus(ThreadStatus status) {
        this.status = status;
    }
}
