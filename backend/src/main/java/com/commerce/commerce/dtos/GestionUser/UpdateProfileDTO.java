package com.commerce.commerce.dtos.GestionUser;

import lombok.Data;

@Data
public class UpdateProfileDTO {
    private String fullName;
    private String phoneNumber;
    private String address;
}
