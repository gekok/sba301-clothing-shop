package com.sba301.ecommerce.security.user;

import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

// Lấy User đang đăng nhập từ SecurityContext.
// Tách ra vì có 2 chỗ cần: ghi nhật ký (ai thao tác) và tạo đơn POS (nhân viên nào bán).
//
// Trả Optional.empty() thay vì ném lỗi khi chưa đăng nhập - cả 2 chỗ dùng đều coi
// "không rõ người thao tác" là hợp lệ (AuditLog.actor và Order.createdByStaff đều nullable).
// Chỗ nào bắt buộc phải có người dùng thì tự orElseThrow lấy.
@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        // Đọc lại từ DB chứ không dùng thẳng User trong token: bản trong token là
        // ảnh chụp lúc đăng nhập, còn bản này gắn với transaction hiện tại nên gán
        // vào entity khác được.
        if (authentication.getPrincipal() instanceof CustomUserDetails details) {
            return userRepository.findById(details.getUser().getId());
        }
        return Optional.empty();
    }
}
