package com.pickmeup.domain.notification;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.important.ImportantDate;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "notification_rules")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NotificationRule extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "important_date_id", nullable = false)
    private ImportantDate importantDate;
    
    @Column(name = "days_before", nullable = false)
    private Integer daysBefore;
    
    @Column(name = "notify_time", nullable = false)
    private LocalTime notifyTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    public void deactivate() {
        this.isActive = false;
    }
    
    public void activate() {
        this.isActive = true;
    }
    
    public void update(Integer daysBefore, LocalTime notifyTime, NotificationChannel channel) {
        this.daysBefore = daysBefore;
        this.notifyTime = notifyTime;
        this.channel = channel;
    }
}
