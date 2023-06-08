package com.example.document_manager.scheduled;

import com.example.document_manager.model.DeletedDocument;
import com.example.document_manager.model.DocumentData;
import com.example.document_manager.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DeletedDocumentScheduler {
    private final DeletedDocumentService deletedDocumentService;
    private final DocumentDataService documentDataService;
    private final MetadataService metadataService;
    private final CommentService commentService;
    private final FileService fileService;

    @Value("${document.deletion.time}")
    private int deletionThresholdDays;

    @Scheduled(cron = "${document.deletion.schedule}")
    public void deleteSchedule() {
        List<DeletedDocument> deletableDocumentList = getDeletableDocuments();

        for (DeletedDocument deletableDocument : deletableDocumentList) {
            deleteDocument(deletableDocument);
        }
    }

    private List<DeletedDocument> getDeletableDocuments() {
        List<DeletedDocument> documentList = deletedDocumentService.getAll();
        List<DeletedDocument> deletableDocumentList = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (DeletedDocument document : documentList) {
            long daysDifference = ChronoUnit.DAYS.between(document.getDate(), currentDate);
            if (daysDifference >= deletionThresholdDays) {
                deletableDocumentList.add(document);
            }
        }
        return deletableDocumentList;
    }

    private void deleteDocument(DeletedDocument deletedDocument) {
        deletedDocumentService.delete(deletedDocument.getId());
        metadataService.deleteAllByDocumentId(deletedDocument.getDocumentId());
        commentService.deleteAllByDocumentId(deletedDocument.getDocumentId());
        Optional<DocumentData> documentData = documentDataService.getById(deletedDocument.getDocumentId());
        documentData.ifPresent(data -> fileService.delete(data.getFileId()));
        documentDataService.delete(deletedDocument.getDocumentId());
    }
}
