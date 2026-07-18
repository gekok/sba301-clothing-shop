package com.sba301.ecommerce.config;

import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.category.repository.CategoryRepository;
import com.sba301.ecommerce.features.cart.repository.CartRepository;
import com.sba301.ecommerce.features.cart.repository.CartItemRepository;
import com.sba301.ecommerce.features.entities.*;
import com.sba301.ecommerce.features.entities.enums.ProductStatus;
import com.sba301.ecommerce.features.entities.enums.Role;
import com.sba301.ecommerce.features.product.repository.ProductRepository;
import com.sba301.ecommerce.features.address.repository.AddressRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;

    public DatabaseSeeder(CategoryRepository categoryRepository,
                          ProductRepository productRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          CartRepository cartRepository,
                          CartItemRepository cartItemRepository,
                          AddressRepository addressRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.addressRepository = addressRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Category and Product first
        Product savedProduct;
        if (productRepository.count() == 0) {
            Category category = new Category();
            category.setName("Áo thun");
            category.setSlug("ao-thun");
            category.setDisplayOrder(1);
            category.setIsActive(true);
            Category savedCat = categoryRepository.save(category);

            Product product = new Product();
            product.setCategory(savedCat);
            product.setName("Áo Thun Minimalist Retro");
            product.setSlug("ao-thun-minimalist-retro");
            product.setDescription("Chất liệu 100% Cotton thoáng mát, phong cách tối giản thanh lịch.");
            product.setBrand("SBA Shop");
            product.setBasePrice(new BigDecimal("250000.00"));
            product.setStatus(ProductStatus.ACTIVE);
            product.setImages(new ArrayList<>());
            product.setVariants(new ArrayList<>());

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setUrl("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80");
            image.setDisplayOrder(1);
            image.setIsPrimary(true);
            product.getImages().add(image);

            ProductVariant var1 = new ProductVariant();
            var1.setProduct(product);
            var1.setSize("M");
            var1.setColor("Đen");
            var1.setSku("TSHIRT-MIN-BLK-M");
            var1.setPrice(new BigDecimal("250000.00"));
            var1.setStockQuantity(50);
            product.getVariants().add(var1);

            ProductVariant var2 = new ProductVariant();
            var2.setProduct(product);
            var2.setSize("L");
            var2.setColor("Đen");
            var2.setSku("TSHIRT-MIN-BLK-L");
            var2.setPrice(new BigDecimal("250000.00"));
            var2.setStockQuantity(30);
            product.getVariants().add(var2);

            ProductVariant var3 = new ProductVariant();
            var3.setProduct(product);
            var3.setSize("S");
            var3.setColor("Trắng");
            var3.setSku("TSHIRT-MIN-WHT-S");
            var3.setPrice(new BigDecimal("220000.00"));
            var3.setStockQuantity(20);
            product.getVariants().add(var3);

            savedProduct = productRepository.save(product);
            System.out.println(">>> Database seeded successfully with a test product.");
        } else {
            savedProduct = productRepository.findAll().get(0);
        }

        // 2. Seed Test User
        User user = userRepository.findByEmail("customer@sba301.local").orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail("customer@sba301.local");
            user.setPasswordHash(passwordEncoder.encode("password123"));
            user.setFullName("Khách hàng thử nghiệm");
            user.setRole(Role.CUSTOMER);
            user.setStatus("ACTIVE");
            user.setFailedLoginAttempts(0);
            user.setEmailVerified(false);
            user = userRepository.save(user);
            System.out.println(">>> Test User customer@sba301.local seeded.");
        }

        // 3. Seed Cart and CartItem
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setItems(new ArrayList<>());
            cart = cartRepository.save(cart);
        }

        if (cart.getItems().isEmpty()) {
            ProductVariant variantToSeed = savedProduct.getVariants().isEmpty() ? 
                productRepository.findAll().get(0).getVariants().get(0) : savedProduct.getVariants().get(0); // M / Đen
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setVariant(variantToSeed);
            item.setQuantity(2);
            cart.getItems().add(item);
            cartRepository.save(cart);
            System.out.println(">>> Pre-added TSHIRT-MIN-BLK-M (x2) to customer@sba301.local cart.");
        }

        // 4. Seed Address
        if (addressRepository.findByUserId(user.getId()).isEmpty()) {
            Address address = new Address();
            address.setUser(user);
            address.setRecipientName("Khách hàng thử nghiệm");
            address.setPhone("0987654321");
            address.setProvince("Thành phố Hà Nội");
            address.setDistrict("Quận Ba Đình");
            address.setWard("Phường Cống Vị");
            address.setStreet("123 Đường Liễu Giai");
            address.setIsDefault(true);
            addressRepository.save(address);
            System.out.println(">>> Default Address seeded for customer@sba301.local.");
        }
        
        // 5. Seed Admin User and Cart
        User adminUser = userRepository.findByEmail("admin@sba301.local").orElse(null);
        if (adminUser == null) {
            adminUser = new User();
            adminUser.setEmail("admin@sba301.local");
            adminUser.setPasswordHash(passwordEncoder.encode("admin123"));
            adminUser.setFullName("Admin Test");
            adminUser.setRole(Role.ADMIN);
            adminUser.setStatus("ACTIVE");
            adminUser.setFailedLoginAttempts(0);
            adminUser.setEmailVerified(true);
            adminUser = userRepository.save(adminUser);
            System.out.println(">>> Test User admin@sba301.local seeded.");
        }

        Cart adminCart = cartRepository.findByUserId(adminUser.getId()).orElse(null);
        if (adminCart == null) {
            adminCart = new Cart();
            adminCart.setUser(adminUser);
            adminCart.setItems(new ArrayList<>());
            adminCart = cartRepository.save(adminCart);
        }

        if (adminCart.getItems().isEmpty()) {
            ProductVariant variantToSeed = savedProduct.getVariants().get(0); // M / Đen
            CartItem item = new CartItem();
            item.setCart(adminCart);
            item.setVariant(variantToSeed);
            item.setQuantity(50);
            adminCart.getItems().add(item);
            cartRepository.save(adminCart);
            System.out.println(">>> Pre-added TSHIRT-MIN-BLK-M (x50) to admin@sba301.local cart.");
        }
    }
}
