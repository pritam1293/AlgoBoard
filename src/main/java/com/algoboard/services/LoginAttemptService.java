package com.algoboard.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_EMAIL_ATTEMPTS = 5;
    private static final int MAX_IP_ATTEMPTS = 20;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000L;

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String scope, String email, String ip) {
        long now = System.currentTimeMillis();
        return isBlocked(key(scope, "email:" + normalize(email) + "|" + normalize(ip)), now)
                || isBlocked(key(scope, "ip:" + normalize(ip)), now);
    }

    public void recordFailure(String scope, String email, String ip) {
        long now = System.currentTimeMillis();
        increment(key(scope, "email:" + normalize(email) + "|" + normalize(ip)), now, MAX_EMAIL_ATTEMPTS);
        increment(key(scope, "ip:" + normalize(ip)), now, MAX_IP_ATTEMPTS);
    }

    public void recordSuccess(String scope, String email, String ip) {
        attempts.remove(key(scope, "email:" + normalize(email) + "|" + normalize(ip)));
    }

    public long retryAfterSeconds(String scope, String email, String ip) {
        long now = System.currentTimeMillis();
        long emailBlocked = remainingSeconds(key(scope, "email:" + normalize(email) + "|" + normalize(ip)), now);
        long ipBlocked = remainingSeconds(key(scope, "ip:" + normalize(ip)), now);
        return Math.max(emailBlocked, ipBlocked);
    }

    @Scheduled(fixedRate = 300000)
    public void cleanupExpiredAttempts() {
        long now = System.currentTimeMillis();
        attempts.entrySet().removeIf(entry -> {
            Attempt attempt = entry.getValue();
            return now - attempt.firstAttempt > WINDOW_MILLIS && now >= attempt.blockedUntil;
        });
    }

    private boolean isBlocked(String key, long now) {
        Attempt attempt = attempts.get(key);
        if (attempt == null) {
            return false;
        }
        if (now - attempt.firstAttempt > WINDOW_MILLIS && now >= attempt.blockedUntil) {
            attempts.remove(key);
            return false;
        }
        return now < attempt.blockedUntil;
    }

    private long remainingSeconds(String key, long now) {
        Attempt attempt = attempts.get(key);
        if (attempt == null || now >= attempt.blockedUntil) {
            return 0L;
        }
        return Math.max(1L, (attempt.blockedUntil - now + 999) / 1000);
    }

    private void increment(String key, long now, int maxAttempts) {
        attempts.compute(key, (ignored, existing) -> {
            if (existing == null || now - existing.firstAttempt > WINDOW_MILLIS) {
                return new Attempt(1, now, maxAttempts <= 1 ? now + WINDOW_MILLIS : 0L);
            }
            int count = existing.count + 1;
            long blockedUntil = count >= maxAttempts ? now + WINDOW_MILLIS : existing.blockedUntil;
            return new Attempt(count, existing.firstAttempt, blockedUntil);
        });
    }

    private String key(String scope, String identity) {
        return scope + ":" + identity;
    }

    private String normalize(String value) {
        return value == null ? "unknown" : value.trim().toLowerCase(Locale.ROOT);
    }

    private record Attempt(int count, long firstAttempt, long blockedUntil) {
    }
}
