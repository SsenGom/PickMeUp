package com.pickmeup.domain.resume;

import com.pickmeup.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "certificates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Certificate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "issuing_organization", length = 100)
    private String issuingOrganization;

    @Column(name = "acquired_date", length = 20)
    private String acquiredDate;

    @Column(length = 50)
    private String grade;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
