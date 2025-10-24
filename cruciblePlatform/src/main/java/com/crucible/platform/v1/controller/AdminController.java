package com.crucible.platform.v1.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import com.crucible.platform.v1.dto.ResponseEntity;
import com.crucible.platform.v1.dto.admin.AlterAdminDto;
import com.crucible.platform.v1.service.AdminService;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    
    @PostMapping("")
    public Mono<ResponseEntity<Void>> createAdmin(@RequestBody AlterAdminDto dto, WebSession session) {
        return adminService.createAdmin(session, dto);
    }

    @DeleteMapping("")
    public Mono<ResponseEntity<Void>> deleteAdmin(@RequestBody AlterAdminDto dto, WebSession session) {
        return adminService.deleteAdmin(session, dto);
    }
}
