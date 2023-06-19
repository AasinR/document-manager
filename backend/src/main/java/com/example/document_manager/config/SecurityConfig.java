package com.example.document_manager.config;

import com.example.document_manager.enums.UserPermission;
import com.example.document_manager.security.JwtAuthenticationFilter;
import com.example.document_manager.security.LDAPAuthenticationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final LDAPAuthenticationProvider authenticationProvider;

    @Value("#{'${cors.origins}'.split(';')}")
    private List<String> corsOriginsList;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf().disable();

        httpSecurity.cors().and();

        httpSecurity.authorizeHttpRequests()
                .requestMatchers("/api/v1/auth/authenticate").permitAll()
                .requestMatchers(
                        "/api/v1/users/admin/**",
                        "/api/v1/groups/admin/**",
                        "/api/v1/comments/admin/**",
                        "/api/v1/tags/admin/**",
                        "/api/v1/saved/admin/**",
                        "/api/v1/documents/admin/**"
                ).hasAuthority(UserPermission.ADMIN.name())
                .anyRequest().authenticated();

        httpSecurity
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsOriginsList);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
