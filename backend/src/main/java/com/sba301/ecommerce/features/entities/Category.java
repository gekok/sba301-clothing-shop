package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories",
        uniqueConstraints = @UniqueConstraint(name = "uk_categories_slug", columnNames = "slug"))
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id",
            foreignKey = @ForeignKey(name = "fk_categories_parent"))
    private Category parent;

    @OneToMany(mappedBy = "parent")
    private List<Category> children = new ArrayList<>();

    @Nationalized
    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 180)
    private String slug;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
