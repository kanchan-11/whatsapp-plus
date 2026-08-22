package com.chatapp.controller;

import com.chatapp.dto.AttachmentDto;
import com.chatapp.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<AttachmentDto> uploadFile(@RequestParam("file") MultipartFile file) {
        AttachmentDto attachmentDto = fileStorageService.storeFile(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(attachmentDto);
    }
}
