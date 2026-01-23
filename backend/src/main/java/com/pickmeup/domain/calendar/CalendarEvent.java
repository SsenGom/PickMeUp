package com.pickmeup.domain.calendar;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "calendar_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CalendarEvent extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;
    
    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;
    
    @Column(name = "is_all_day")
    @Builder.Default
    private Boolean isAllDay = false;
    
    @Column(length = 50)
    private String location;
    
    @Column(length = 7)
    @Builder.Default
    private String color = "#3B82F6";
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type")
    private RecurrenceType recurrenceType;
    
    @Column(name = "recurrence_interval")
    private Integer recurrenceInterval;
    
    @Column(name = "recurrence_end_at")
    private LocalDateTime recurrenceEndAt;
    
    @Column(name = "parent_event_id")
    private Long parentEventId;
    
    public void update(String title, String description, LocalDateTime startAt, 
                       LocalDateTime endAt, Boolean isAllDay, String location, String color,
                       RecurrenceType recurrenceType) {
        this.title = title;
        this.description = description;
        this.startAt = startAt;
        this.endAt = endAt;
        this.isAllDay = isAllDay;
        this.location = location;
        this.color = color;
        this.recurrenceType = recurrenceType;
    }
    
    public void setRecurrence(RecurrenceType type, Integer interval, LocalDateTime endAt) {
        this.recurrenceType = type;
        this.recurrenceInterval = interval;
        this.recurrenceEndAt = endAt;
    }
}
