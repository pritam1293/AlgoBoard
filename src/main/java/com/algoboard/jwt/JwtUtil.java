package com.algoboard.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    //Validate JWT token and return appropriate error message
    public String validateToken(String token, JwtService jwtService) {
        try {
            jwtService.extractUsername(token);
            return "valid";
        } catch (SignatureException e) {
            return "Invalid JWT signature";
        } catch (MalformedJwtException e) {
            return "Invalid JWT token";
        } catch (ExpiredJwtException e) {
            return "JWT token is expired";
        } catch (UnsupportedJwtException e) {
            return "JWT token is unsupported";
        } catch (IllegalArgumentException e) {
            return "JWT claims string is empty";
        }
    }

    //Extract token from Authorization header
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    //Check if token format is valid
    public boolean isValidTokenFormat(String authHeader) {
        return authHeader != null && authHeader.startsWith("Bearer ") && authHeader.length() > 7;
    }

    //Create Bearer token string
    public String createBearerToken(String token) {
        return "Bearer " + token;
    }
}
