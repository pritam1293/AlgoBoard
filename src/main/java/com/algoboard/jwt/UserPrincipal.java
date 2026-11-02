package com.algoboard.jwt;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class UserPrincipal extends User {

    private final long tokenVersion;

    public UserPrincipal(String username, String password, long tokenVersion,
            Collection<? extends GrantedAuthority> authorities) {
        super(username, password, true, true, true, true, authorities);
        this.tokenVersion = tokenVersion;
    }

    public long getTokenVersion() {
        return tokenVersion;
    }
}
