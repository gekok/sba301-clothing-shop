package com.sba301.ecommerce.config;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class VNPayConfig {
    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String vnp_TmnCode = "OWBZLJR8";
    public static final String vnp_HashSecret = "OOV71FUQL5VBFDON8N90WFPOEJK5OO0V";
    public static final String vnp_ReturnUrl = "http://localhost:5173/checkout/vnpay-return";

    public static String getPaymentUrl(String orderCode, String amountStr, String clientIp) {
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", amountStr); 
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", orderCode);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderCode);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        String finalIp = clientIp;
        if (finalIp == null || finalIp.equals("0:0:0:0:0:0:0:1") || finalIp.equals("::1") || finalIp.contains("unknown")) {
            finalIp = "127.0.0.1";
        } else if (finalIp.contains(",")) {
            finalIp = finalIp.split(",")[0].trim();
        }
        vnp_Params.put("vnp_IpAddr", finalIp);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT-7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        
        List<String> hashParts = new ArrayList<>();
        List<String> queryParts = new ArrayList<>();
        
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    String encName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString());
                    String encValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());
                    
                    // hashData uses unencoded fieldName and standard URL-encoded fieldValue (spaces as +)
                    hashParts.add(fieldName + "=" + encValue);

                    // query string uses URL encoded parameter values
                    queryParts.add(encName + "=" + encValue);
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
        
        String hashData = String.join("&", hashParts);
        String queryUrl = String.join("&", queryParts);
        
        System.out.println(">>> VNPAY HASH DATA: [" + hashData + "]");
        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData);
        System.out.println(">>> VNPAY SECURE HASH: [" + vnp_SecureHash + "]");
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnp_PayUrl + "?" + queryUrl;
    }

    public static boolean verifySignature(Map<String, String> fields, String secureHash) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        
        List<String> hashParts = new ArrayList<>();
        for (String fieldName : fieldNames) {
            if (fieldName.equals("vnp_SecureHash") || fieldName.equals("vnp_SecureHashType")) {
                continue;
            }
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && fieldValue.length() > 0) {
                try {
                    String encValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());
                    hashParts.add(fieldName + "=" + encValue);
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
        String rawData = String.join("&", hashParts);
        String calculatedHash = hmacSHA512(vnp_HashSecret, rawData);
        return calculatedHash.equalsIgnoreCase(secureHash);
    }

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }
}
