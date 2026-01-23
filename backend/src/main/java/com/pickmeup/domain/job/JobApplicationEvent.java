package com.pickmeup.domain.job;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_application_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class JobApplicationEvent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false)
    private JobApplication jobApplication;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private JobEventType eventType;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(length = 200)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "calendar_event_id")
    private Long calendarEventId;

    public void update(JobEventType eventType, LocalDateTime eventDate, 
                       String location, String notes) {
        this.eventType = eventType;
        this.eventDate = eventDate;
        this.location = location;
        this.notes = notes;
    }

    public void linkCalendarEvent(Long calendarEventId) {
        this.calendarEventId = calendarEventId;
    }
}
