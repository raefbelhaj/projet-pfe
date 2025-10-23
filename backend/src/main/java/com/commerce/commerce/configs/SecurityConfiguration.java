package com.commerce.commerce.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfiguration {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider
    ) {
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 🔹 Désactive CSRF (utile pour API stateless)
                .csrf(AbstractHttpConfigurer::disable)
                // 🔹 Active CORS avec la config ci-dessous
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 🔹 Autorisations
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**", "/auth/**", "/ws/**", "/topic/**").permitAll()
                        .requestMatchers("/api/patients/**").hasAuthority("ROLE_DOCTOR")
                        .anyRequest().authenticated()
                )
                // 🔹 Mode stateless (JWT)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 🔹 Ajoute ton filtre JWT
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 🔹 Autorise Angular en dev
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        // 🔹 Autorise les méthodes HTTP
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // 🔹 Autorise les en-têtes courants (sinon les requêtes preflight échouent)
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        // 🔹 Autorise les cookies/tokens si besoin
        configuration.setAllowCredentials(true);

        // 🔹 Applique la config à toutes les routes
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
