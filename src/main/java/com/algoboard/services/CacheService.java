package com.algoboard.services;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class CacheService {

    private final CacheManager cacheManager;

    public CacheService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    // Automatically refresh contest list cache every 30 minutes
    @CacheEvict(value = "contestList", allEntries = true)
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    public void refreshContestListCache() {
        // Cache will be automatically refreshed on next access
    }

    // Automatically refresh LeetCode profile cache every 1 hour
    @CacheEvict(value = "leetcodeProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshLeetcodeProfileCache() {
        // Cache will be automatically refreshed on next access
    }

    // Automatically refresh Codeforces profile cache every 1 hour
    @CacheEvict(value = "codeforcesProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshCodeforcesProfileCache() {
        // Cache will be automatically refreshed on next access
    }

    // Automatically refresh AtCoder profile cache every 1 hour
    @CacheEvict(value = "atcoderProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshAtcoderProfileCache() {
        // Cache will be automatically refreshed on next access
    }

    // Automatically refresh CodeChef profile cache every 1 hour
    @CacheEvict(value = "codechefProfile", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void refreshCodechefProfileCache() {
        // Cache will be automatically refreshed on next access
    }

    // Selective cache eviction methods for individual users
    public void evictCodeforcesCache(String key) {
        if (cacheManager.getCache("codeforcesProfile") != null) {
            cacheManager.getCache("codeforcesProfile").evict(key);
        }
    }

    public void evictAtcoderCache(String key) {
        if (cacheManager.getCache("atcoderProfile") != null) {
            cacheManager.getCache("atcoderProfile").evict(key);
        }
    }

    public void evictLeetcodeCache(String key) {
        if (cacheManager.getCache("leetcodeProfile") != null) {
            cacheManager.getCache("leetcodeProfile").evict(key);
        }
    }

    public void evictCodechefCache(String key) {
        if (cacheManager.getCache("codechefProfile") != null) {
            cacheManager.getCache("codechefProfile").evict(key);
        }
    }

    // Utility method to clear all profile caches for a user
    public void evictAllProfileCaches(String key) {
        evictCodeforcesCache(key);
        evictAtcoderCache(key);
        evictLeetcodeCache(key);
        evictCodechefCache(key);
    }

    // Utility method to clear all caches
    public void evictAllCaches() {
        if (cacheManager.getCache("contestList") != null) {
            cacheManager.getCache("contestList").clear();
        }
        if (cacheManager.getCache("codeforcesProfile") != null) {
            cacheManager.getCache("codeforcesProfile").clear();
        }
        if (cacheManager.getCache("atcoderProfile") != null) {
            cacheManager.getCache("atcoderProfile").clear();
        }
        if (cacheManager.getCache("codechefProfile") != null) {
            cacheManager.getCache("codechefProfile").clear();
        }
        if (cacheManager.getCache("leetcodeProfile") != null) {
            cacheManager.getCache("leetcodeProfile").clear();
        }
    }
}
