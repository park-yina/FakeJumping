package com.parkvina.fakejumping.service;

import com.parkvina.fakejumping.enums.AdminRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Service
public class JwtUtils {

    @Value("${jwt.secret.key}")
    private String secretKey;

    private Key key;
    private final Logger log = LoggerFactory.getLogger(getClass());

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String AUTHORIZATION_KEY = "auth";
    public static final String BEARER_PREFIX = "Bearer ";

    private static final long TOKEN_TIME = 60 * 60 * 1000L;
    private final SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
    public static final String ADMIN_ID_KEY = "adminId";
    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(Long adminId, String username, AdminRole adminRole) {

        Date now = new Date();

        return Jwts.builder()
                .setSubject(username)
                .claim(ADMIN_ID_KEY, adminId)
                .claim(AUTHORIZATION_KEY, adminRole.name())
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + TOKEN_TIME))
                .signWith(key, signatureAlgorithm)
                .compact();
    }

    public boolean isValidToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);

            log.info("expireTime : {}", claims.getExpiration());
            log.info("adminId : {}", claims.get(ADMIN_ID_KEY,Long.class));
            log.info("adminRole : {}", claims.get(AUTHORIZATION_KEY));
            log.info("username : {}", claims.getSubject());

            return true;

        } catch (ExpiredJwtException expiredJwtException) {
            log.error("Token Expired", expiredJwtException);
            return false;

        } catch (JwtException jwtException) {
            log.error("Token Tampered", jwtException);
            return false;

        } catch (NullPointerException npe) {
            log.error("Token is null", npe);
            return false;
        }
    }
    public Authentication getAuthentication(String token) {
        Claims claims = getClaimsFromToken(token);
        String username = claims.getSubject();
        String role=claims.get(AUTHORIZATION_KEY,String.class);
        List<SimpleGrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + role));
        return  new UsernamePasswordAuthenticationToken(username, null, authorities);

    }

        private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    public String getUsername(String token) {
        return getClaimsFromToken(token).getSubject();
    }
    public String getRole(String token) {
        return getClaimsFromToken(token).get(AUTHORIZATION_KEY, String.class);
    }
    public Long getAdminId(String token) {
        return getClaimsFromToken(token).get("adminId", Long.class);
    }
    public String resolveToken(HttpServletRequest request) {

        String bearer = request.getHeader(AUTHORIZATION_HEADER);

        if (bearer != null && bearer.startsWith(BEARER_PREFIX)) {
            return bearer.replace(BEARER_PREFIX, "");
        }

        return null;
    }
}