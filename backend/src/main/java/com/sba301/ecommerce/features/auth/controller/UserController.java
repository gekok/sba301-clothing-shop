package com.sba301.ecommerce.features.auth.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: GET /users/me -> profile user hiện tại (lấy từ SecurityContext -> CustomUserDetails).
@RestController
@RequestMapping("/users")
public class UserController {
}
