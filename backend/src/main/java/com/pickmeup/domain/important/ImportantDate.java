package com.pickmeup.domain.important;

import com.pickmeup.domain.common.BaseEntity;
import com.pickmeup.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "important_dates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ImportantDate extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 100)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImportantDateType type;
    
    @Column(name = "is_recurring")
    @Builder.Default
    private Boolean isRecurring = false;
    
    @Column(length = 7)
    @Builder.Default
    private String color = "#EF4444";
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    public void update(String title, String description, LocalDate targetDate, 
                       ImportantDateType type, Boolean isRecurring, String color) {
        this.title = title;
        this.description = description;
        this.targetDate = targetDate;
        this.type = type;
        this.isRecurring = isRecurring;
        this.color = color;
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    public LocalDate getNextOccurrence() {
        if (!isRecurring) {
            return targetDate;
        }
        LocalDate today = LocalDate.now();
        LocalDate thisYear = targetDate.withYear(today.getYear());
        if (thisYear.isBefore(today)) {
            return thisYear.plusYears(1);
        }
        return thisYear;
    }
}
