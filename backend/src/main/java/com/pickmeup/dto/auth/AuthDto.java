package com.pickmeup.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

public class AuthDto {
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignUpRequest {
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        private String email;
        
        @NotBlank(message = "비밀번호는 필수입니다")
        @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다")
        private String password;
        
        @NotBlank(message = "이름은 필수입니다")
        private String name;
        
        // 헤드헌터용 추가 필드 (선택)
        private String userType;        // "JOB_SEEKER" or "RECRUITER"
        private String companyName;     // 헤드헌터일 때만
        private String position;        // 헤드헌터일 때만
        private String department;      // 헤드헌터일 때만
        private String businessEmail;   // 헤드헌터일 때만
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "이메일은 필수입니다")
        @Email
        private String email;
        
        @NotBlank(message = "비밀번호는 필수입니다")
        private String password;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;
        private Long expiresIn;
        private UserInfo user;
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Long id;
        private String email;
        private String name;
        private String profileImageUrl;
        private String userType;         // 사용자 타입
        private String companyName;      // 헤드헌터일 때
    }
    
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }
}
