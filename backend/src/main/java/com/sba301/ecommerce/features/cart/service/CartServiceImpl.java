package com.sba301.ecommerce.features.cart.service;

import org.springframework.stereotype.Service;

// TODO: implements CartService. @RequiredArgsConstructor deps: CartRepository, CartItemRepository, UserRepository.
//   Lấy user hiện tại từ SecurityContext -> CustomUserDetails.getUser().getId().
//   getMyCart(): @Transactional READ-WRITE (get-or-create -> có INSERT, readOnly sẽ rollback). Map entity->DTO TRONG tx.
//   updateItemQuantity: fetch-join; ownership check (item.cart.user.id == current, không thì 404); stock check (qty>stock -> BadRequest); set qty.
//   removeItem: ownership check -> delete.
@Service
public class CartServiceImpl implements CartService {
}
