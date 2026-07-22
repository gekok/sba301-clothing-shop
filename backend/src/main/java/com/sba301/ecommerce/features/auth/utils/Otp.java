package com.sba301.ecommerce.features.auth.utils;

import java.util.concurrent.ThreadLocalRandom;

public class Otp {
    public String generateOtp() {
        return String.format(
                "%06d",
                ThreadLocalRandom.current()
                        .nextInt(1000000)
        );
    }
}
