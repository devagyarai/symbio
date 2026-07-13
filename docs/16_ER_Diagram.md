# Entity-Relationship (ER) Diagram

## Overview
This diagram illustrates the conceptual database schema for Symbio, highlighting the relational structure and the pervasive use of `orgId` to ensure tenant data isolation.

## Schema Diagram

```mermaid
erDiagram
    USER ||--o{ ORG_MEMBER : has
    USER ||--o{ COMMENT : writes
    USER ||--o{ ATTACHMENT : uploads
    USER {
        uuid id PK
        string email
        string passwordHash
        string name
        string avatarUrl
        datetime createdAt
    }

    ORGANIZATION ||--o{ ORG_MEMBER : employs
    ORGANIZATION ||--o{ PROJECT : contains
    ORGANIZATION ||--o{ TASK : contains
    ORGANIZATION ||--o{ AUDIT_LOG : tracks
    ORGANIZATION {
        uuid id PK
        string name
        datetime createdAt
    }

    ORG_MEMBER {
        uuid id PK
        uuid userId FK
        uuid orgId FK
        string role
        datetime joinedAt
    }

    PROJECT ||--o{ TASK : includes
    PROJECT {
        uuid id PK
        uuid orgId FK
        string name
        string description
        datetime createdAt
    }

    TASK ||--o{ COMMENT : has
    TASK ||--o{ ATTACHMENT : contains
    TASK {
        uuid id PK
        uuid projectId FK
        uuid orgId FK
        string title
        string status
        uuid assigneeId FK
        datetime dueDate
        datetime createdAt
    }

    COMMENT {
        uuid id PK
        uuid taskId FK
        uuid userId FK
        text content
        datetime createdAt
    }

    ATTACHMENT {
        uuid id PK
        uuid taskId FK
        uuid uploaderId FK
        string fileUrl
        string fileType
        datetime createdAt
    }

    AUDIT_LOG {
        uuid id PK
        uuid orgId FK
        uuid userId FK
        string action
        string entityType
        uuid entityId
        json details
        datetime createdAt
    }
```
