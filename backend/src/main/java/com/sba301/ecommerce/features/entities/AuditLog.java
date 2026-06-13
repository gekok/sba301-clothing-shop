package com.sba301.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs",
        indexes = {
                @Index(name = "ix_audit_target", columnList = "target_type, target_id"),
                @Index(name = "ix_audit_actor", columnList = "actor_user_id"),
                @Index(name = "ix_audit_created_at", columnList = "created_at")
        })
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nullable — system jobs may produce audit rows without an actor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id",
            foreignKey = @ForeignKey(name = "fk_audit_actor"))
    private User actor;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    // JSON dump of before/after fields
    @Column(length = 4000)
    private String changes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
