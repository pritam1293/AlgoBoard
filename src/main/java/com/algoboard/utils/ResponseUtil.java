package com.algoboard.utils;

import java.util.Map;
import java.util.HashMap;

public class ResponseUtil {
    public static <T> Map<String, Object> createSuccessResponse(String message, T data) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", message);
        response.put("data", data);
        return response;
    }
    public static Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", message);
        return response;
    }
}
