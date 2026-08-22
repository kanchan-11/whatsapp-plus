package com.chatapp.service;

import com.chatapp.dto.AttachmentDto;
import com.chatapp.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage folder: " + e.getMessage(), e);
        }
    }

    public AttachmentDto storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String storedFileName = UUID.randomUUID().toString() + extension;
        Path destinationFile = this.rootLocation.resolve(storedFileName).normalize();

        if (!destinationFile.getParent().equals(this.rootLocation)) {
            throw new BadRequestException("Cannot store file outside current directory.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + originalFilename, e);
        }

        String fileUrl = "/uploads/" + storedFileName;
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        return new AttachmentDto(
                null,
                originalFilename,
                contentType,
                fileUrl,
                file.getSize(),
                null
        );
    }

    public Path getFilePath(String fileName) {
        return this.rootLocation.resolve(fileName).normalize();
    }
}
