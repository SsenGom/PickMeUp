package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "languages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Language extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "test_name", length = 50)
    private String testName;

    @Column(length = 20)
    private String score;

    @Column(name = "acquired_date", length = 20)
    private String acquiredDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "speaking_level", length = 20)
    private LanguageLevel speakingLevel;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
