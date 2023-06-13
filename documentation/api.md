# **API Endpoints**
The base URL is: `{host_url}/api/v1/`

## **Authentication**
The api uses LDAP for authentication, then send back a JWT token, that has to be used with every other request. There is no user registration. New users have to be added to the databse by an ADMIN.

`POST` `{base_url}/auth/authenticate`

**Request body**:
```json
// application/json
{
    "username": "username",
    "password": "password"
}
```

**Response**:
```json
// application/json
{
    "token": "jwt token"
}
```

## **User requests**

### **List All**
Lists every user in the database.

`GET` `{base_url}/users/all`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "username": "username",
        "shownName": "shownName",
        "email": "email",
        "permission": "MEMBER / ADMIN"
    }
]
```

### **Get by Username**
Fetch the user by the given username.

`GET` `{base_url}/users/get/{username}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
{
    "username": "username",
    "shownName": "shownName",
    "email": "email",
    "permission": "MEMBER / ADMIN"
}
```

### **Add User ( ADMIN )**
Create a new user.

`POST` `{base_url}/users/admin/add`

**Request body**:
```json
// application/json
{
    "username": "username"
}
```

**Response**:
```json
// application/json
{
    "username": "username",
    "shownName": "shownName",
    "email": "email",
    "permission": "MEMBER / ADMIN"
}
```

### **Update User**
Update the current user. Not sending or setting a property to null removes it.

`PUT` `{base_url}/users/update`

**Request body**:
```json
// application/json
{
    "shownName": "shownName",
    "email": "email"
}
```

**Response**:
```json
none
```

### **Promote User ( ADMIN )**
Promotes a MEMBER to ADMIN. Once a user is promoted it can only be demoted in the database, since ADMINs being able to demote eachother is not a good idea.

`PUT` `{base_url}/users/admin/promote/{username}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

### **Delete User**
Deletes the current user.

`DELETE` `{base_url}/users/delete`

**Request body**:
```json
none
```

**Response**:
```json
none
```

### **Delete User ( ADMIN )**
Deletes the user by the given username.

`DELETE` `{base_url}/users/delete/{username}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

## **Group requests**

### **List All**
Lists every group in the database.

`GET` `{base_url}/groups/all`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "name": "group name",
        "groupMemberList": [
            {
                "username": "username",
                "shownName": "shownName",
                "permission": "MEMBER / ADMIN / OWNER"
            }
        ]
    }
]
```

### **List All by Username**
Lists every group where the given user is a member.

`GET` `{base_url}/groups/all/{username}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "name": "group name",
        "groupMemberList": [
            {
                "username": "username",
                "shownName": "shownName",
                "permission": "MEMBER / ADMIN / OWNER"
            }
        ]
    }
]
```

### **Get by Id**
Fetch the group by the given id.

`GET` `{base_url}/groups/get/{id}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
{
    "id": "id",
    "name": "group name",
    "groupMemberList": [
        {
            "username": "username",
            "shownName": "shownName",
            "permission": "MEMBER / ADMIN / OWNER"
        }
    ]
}
```

### **Get Members by Id**
Fetch the group members by the given id.

`GET` `{base_url}/groups/member/get/{id}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "username": "username",
        "shownName": "shownName",
        "permission": "MEMBER / ADMIN / OWNER"
    }
]
```

### **Add Group**
Create a new group.

`POST` `{base_url}/groups/add`

**Request body**:
```json
// application/json
{
    "groupName": "group name"
}
```

**Response**:
```json
// application/json
{
    "id": "id",
    "name": "group name",
    "groupMemberList": [
        {
            "username": "username",
            "permission": "OWNER"
        }
    ]
}
```

### **Update Group**
Update group by the given id.

`PUT` `{base_url}/groups/update/{id}`

**Request body**:
```json
// application/json
{
    "groupName": "group name"
}
```

**Response**:
```json
none
```

### **Add Group Member**
Adds the user to the group.

`PUT` `{base_url}/groups/member/add/{id}`

**Request body**:
```json
// application/json
{
    "username": "username"
}
```

**Response**:
```json
none
```

### **Remove Group Member**
Removes the user from the group.

`PUT` `{base_url}/groups/member/remove/{id}`

**Request body**:
```json
// application/json
{
    "username": "username"
}
```

**Response**:
```json
none
```

### **Quit Group**
Removes the current user from the group. The owner of the group cannot leave.

`PUT` `{base_url}/groups/member/quit/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

### **Promote Group Member**
Promotes the given member to a higher rank.

`PUT` `{base_url}/groups/member/promote/{id}`

**Request body**:
```json
// application/json
{
    "username": "username"
}
```

**Response**:
```json
none
```

### **Demote Group Member**
Demotes the given member to a lower rank.

`PUT` `{base_url}/groups/member/demote/{id}`

**Request body**:
```json
// application/json
{
    "username": "username"
}
```

**Response**:
```json
none
```

### **Delete Group**
Deletes group by the given id.

`DELETE` `{base_url}/groups/delete/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

### **Delete Group ( ADMIN )**
Deletes group by the given id. The admin can delete every group.

`DELETE` `{base_url}/groups/admin/delete/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

## **Tag requests**

### **List All Public**
Lists every tag with public visibility.

`GET` `{base_url}/tags/all/public`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "name": "tag name",
        "ownerId": null
    }
]
```

### **List All by Owner**
Lists every tag by the given owner id. Without the `groupId` param, it lists the user's tags.

`GET` `{base_url}/tags/all/private`

**Request param**:  
`groupId` (optional)

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "name": "tag name",
        "ownerId": "user / group id"
    }
]
```

### **List All by Owner ( ADMIN )**
Lists every tag by the given owner id.

`GET` `{base_url}/tags/admin/all/private/{ownerId}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "name": "tag name",
        "ownerId": "user / group id"
    }
]
```

### **Get by Id**
Fetch tag by the given id.

`GET` `{base_url}/tags/get/{id}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
{
    "id": "id",
    "name": "tag name",
    "ownerId": "user / group id"
}
```

### **Add Public Tag**
Creates new public tag.

`POST` `{base_url}/tags/add/public`

**Request body**:
```json
// application/json
{
    "name": "tag name"
}
```

**Response**:
```json
// application/json
{
    "id": "id",
    "name": "tag name",
    "ownerId": null
}
```

### **Add Private Tag**
Creates new private tag. Without the groupId param, the owner is the current user.

`POST` `{base_url}/tags/add/private`

**Request param**:  
`groupId` (optional)

**Request body**:
```json
// application/json
{
    "name": "tag name"
}
```

**Response**:
```json
// application/json
{
    "id": "id",
    "name": "tag name",
    "ownerId": null
}
```

### **Update Tag**
Update tag by the given id.

`PUT` `{base_url}/tags/update/{id}`

**Request body**:
```json
// application/json
{
    "name": "tag name"
}
```

**Response**:
```json
none
```

### **Delete Tag**
Delete tag by the given id.

`DELETE` `{base_url}/tags/delete/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

### **Delete Tag ( ADMIN )**
Delete tag by the given id. Can delete every private tag.

`DELETE` `{base_url}/tags/admin/delete/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

## **Save requests**

### **List All**
Lists every save by the given ownerId. Without the groupId param, the owner is the current user.

`GET` `{base_url}/saved/all`

**Request param**:  
`groupId` (optional)

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "ownerId": "user / group id",
        "documentId": "documentId",
        "tagList": [
            {
                "id": "id",
                "name": "tag name",
                "ownerId": "user / group id"
            }
        ]
    }
]
```

### **List All ( ADMIN )**
Lists every save by the given ownerId.

`GET` `{base_url}/saved/admin/all/{ownerId}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "ownerId": "user / group id",
        "documentId": "documentId",
        "tagList": [
            {
                "id": "id",
                "name": "tag name",
                "ownerId": "user / group id"
            }
        ]
    }
]
```

### **Get by Id**
Fetch save by the given id.

`GET` `{base_url}/saved/get/{id}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
{
    "id": "id",
    "ownerId": "user / group id",
    "documentId": "documentId",
    "tagList": [
        {
            "id": "id",
            "name": "tag name",
            "ownerId": "user / group id"
        }
    ]
}
```

### **Add Save**
Add a new document to the database and save it.

`POST` `{base_url}/saved/add`

**Request param**:  
`groupId` (optional)

**Request body**:
```json
// multipart/form-data
{
    "file": "uploaded file",
    "metadata": {
        "title": "title",
        "authorList": [
            "authors..."
        ],
        "description": "description",
        "publicationDate": "2023.06.13",
        "identifierList": {
            "key": "value"
        },
        "otherData": {
            "key": "value"
        }
    }
}
```

**Response**:
```json
// application/json
{
    "id": "id",
    "ownerId": "user / group id",
    "documentId": "documentId",
    "tagList": []
}
```

### **Save Document**
Save existing document.

`POST` `{base_url}/saved/save/{documentId}`

**Request param**:  
`groupId` (optional)

**Request body**:
```json
none
```

**Response**:
```json
// application/json
{
    "id": "id",
    "ownerId": "user / group id",
    "documentId": "documentId",
    "tagList": []
}
```

### **Add Tag To Save**
Add private tag to save.

`PUT` `{base_url}/saved/tag/add/{id}`

**Request body**:
```json
// application/json
{
    "tagId": "tag id"
}
```

**Response**:
```json
none
```

### **Remove Tag From Save**
Remove private tag from save.

`PUT` `{base_url}/saved/tag/remove/{id}`

**Request body**:
```json
// application/json
{
    "tagId": "tag id"
}
```

**Response**:
```json
none
```

### **Delete Save**
Delete save by the given id.

`DELETE` `{base_url}/saved/delete/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

### **Delete Save ( ADMIN )**
Delete save by the given id. Can delete private saves.

`DELETE` `{base_url}/saved/admin/delete/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

## **Document requests**

### **List All**
Lists every document.

`GET` `{base_url}/documents/all`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "fileId": "file id",
        "metadata": {
            "id": "metadata id",
            "username": "username",
            "documentId": "document id",
            "timestamp": "2023-06-13 01:52:00",
            "relatedDocumentList": [
                "document ids..."
            ],
            "title": "title",
            "authorList": [
                "authors..."
            ],
            "description": "description",
            "publicationDate": "2023.06.13",
            "identifierList": {
                "key": "value"
            },
            "otherData": {
                "key": "value"
            }
        },
        "tagCollection": {
            "tagList": [
                {
                    "id": "tag id",
                    "name": "tag name",
                    "ownerId": null
                }
            ],
            "privateTagList": [
                {
                    "id": "tag id",
                    "name": "tag name",
                    "ownerId": "user id"
                }
            ],
            "groupTagCollectionList": [
                {
                    "groupId": "group id",
                    "groupTagList": [
                        {
                            "id": "tag id",
                            "name": "tag name",
                            "ownerId": "group id"
                        }
                    ]
                }
            ]
        }
    }
]
```

### **List All by Ids**
Lists every document by the given id list.

`GET` `{base_url}/documents/records`

**Request body**:
```json
// application/json
{
    "documentIdList": [
        "document ids..."
    ]
}
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "fileId": "file id",
        "metadata": {
            "id": "metadata id",
            "username": "username",
            "documentId": "document id",
            "timestamp": "2023-06-13 01:52:00",
            "relatedDocumentList": [
                "document ids..."
            ],
            "title": "title",
            "authorList": [
                "authors..."
            ],
            "description": "description",
            "publicationDate": "2023.06.13",
            "identifierList": {
                "key": "value"
            },
            "otherData": {
                "key": "value"
            }
        },
        "tagCollection": {
            "tagList": [
                {
                    "id": "tag id",
                    "name": "tag name",
                    "ownerId": null
                }
            ],
            "privateTagList": [
                {
                    "id": "tag id",
                    "name": "tag name",
                    "ownerId": "user id"
                }
            ],
            "groupTagCollectionList": [
                {
                    "groupId": "group id",
                    "groupTagList": [
                        {
                            "id": "tag id",
                            "name": "tag name",
                            "ownerId": "group id"
                        }
                    ]
                }
            ]
        }
    }
]
```

### **Get by Id**
Fetch document by the given id.

`GET` `{base_url}/documents/get/{id}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
{
    "id": "id",
    "fileId": "file id",
    "metadata": {
        "id": "metadata id",
        "username": "username",
        "documentId": "document id",
        "timestamp": "2023-06-13 01:52:00",
        "relatedDocumentList": [
            "document ids..."
        ],
        "title": "title",
        "authorList": [
            "authors..."
        ],
        "description": "description",
        "publicationDate": "2023.06.13",
        "identifierList": {
            "key": "value"
        },
        "otherData": {
            "key": "value"
        }
    },
    "tagCollection": {
        "tagList": [
            {
                "id": "tag id",
                "name": "tag name",
                "ownerId": null
            }
        ],
        "privateTagList": [
            {
                "id": "tag id",
                "name": "tag name",
                "ownerId": "user id"
            }
        ],
        "groupTagCollectionList": [
            {
                "groupId": "group id",
                "groupTagList": [
                    {
                        "id": "tag id",
                        "name": "tag name",
                        "ownerId": "group id"
                    }
                ]
            }
        ]
    }
}
```

### **List Metadata by Document**
Lists all metadata by the given document id.

`GET` `{base_url}/documents/metadata/all/{id}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "metadata id",
        "user": {
            "username": "username",
            "shownName": "shownName"
        },
        "documentId": "document id",
        "timestamp": "2023-06-13 01:52:00",
        "relatedDocumentList": [
            "document ids..."
        ],
        "title": "title",
        "authorList": [
            "authors..."
        ],
        "description": "description",
        "publicationDate": "2023.06.13",
        "identifierList": {
            "key": "value"
        },
        "otherData": {
            "key": "value"
        }
    }
]
```

### **Get Metadata by Id**
Fetch metadata by the given id.

`GET` `{base_url}/documents/metadata/get/{metadataId}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
{
    "id": "metadata id",
    "user": {
        "username": "username",
        "shownName": "shownName"
    },
    "documentId": "document id",
    "timestamp": "2023-06-13 01:52:00",
    "relatedDocumentList": [
        "document ids..."
    ],
    "title": "title",
    "authorList": [
        "authors..."
    ],
    "description": "description",
    "publicationDate": "2023.06.13",
    "identifierList": {
        "key": "value"
    },
    "otherData": {
        "key": "value"
    }
}
```

### **Update Document**
Creates a new metadata version and adds it to the document.

`POST` `{base_url}/documents/update/{id}`

**Request body**:
```json
// application/json
{
    "title": "title",
    "authorList": [
        "authors..."
    ],
    "description": "description",
    "publicationDate": "2023.06.13",
    "identifierList": {
        "key": "value"
    },
    "otherData": {
        "key": "value"
    }
}
```

**Response**:
```json
none
```

### **Add Document Tag**
Adds a tag to the given document.

`PUT` `{base_url}/documents/tag/add/{id}`

**Request body**:
```json
// application/json
{
    "tagId": "tag id"
}
```

**Response**:
```json
none
```

### **Remove Document Tag**
Removes a tag from the given document.

`PUT` `{base_url}/documents/tag/remove/{id}`

**Request body**:
```json
// application/json
{
    "tagId": "tag id"
}
```

**Response**:
```json
none
```

### **Add Related Document**
Adds the related document to the given document.

`PUT` `{base_url}/documents/related/add`

**Request body**:
```json
// application/json
{
    "documentId": "document id",
    "relatedDocumentId": "document id"
}
```

**Response**:
```json
none
```

### **Remove Related Document**
Remove the related document from the given document.

`PUT` `{base_url}/documents/related/remove`

**Request body**:
```json
// application/json
{
    "documentId": "document id",
    "relatedDocumentId": "document id"
}
```

**Response**:
```json
none
```

### **Delete Duplicate Document ( ADMIN )**
Deletes the duplicate document and replaces it's place with an other existing document.

`DELETE` `{base_url}/documents/admin/duplicate`

**Request body**:
```json
// application/json
{
    "originalId": "document id",
    "duplicateId": "document id"
}
```

**Response**:
```json
none
```

## **File requests**

### **Get File by Id**
Fetch file by the given id.

`GET` `{base_url}/files/get/{fileId}`

**Request body**:
```json
none
```

**Response**:  
`File`

## **Comment requests**

### **List All Public by Document**
Lists every comment by the given document id.

`GET` `{base_url}/comments/all/public/{documentId}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "ownerId": null,
        "documentId": "document id",
        "user": {
            "username": "username",
            "shownName": "shownName"
        },
        "content": "content",
        "timestamp": "2023-06-13 02:37:00"
    }
]
```

### **List All Private by Document**
Lists every private comment by the given document id.

`GET` `{base_url}/comments/all/private/{documentId}`

**Request param**:  
`groupId` (optional)

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "ownerId": "user / group id",
        "documentId": "document id",
        "user": {
            "username": "username",
            "shownName": "shownName"
        },
        "content": "content",
        "timestamp": "2023-06-13 02:37:00"
    }
]
```

### **List All Private by Document ( ADMIN )**
Lists every private comment by the given document id. Can list private comments.

`GET` `{base_url}/comments/admin/all/private/{documentId}`

**Request param**:  
`ownerId` (required)

**Request body**:
```json
none
```

**Response**:
```json
// application/json
[
    {
        "id": "id",
        "ownerId": "user / group id",
        "documentId": "document id",
        "user": {
            "username": "username",
            "shownName": "shownName"
        },
        "content": "content",
        "timestamp": "2023-06-13 02:37:00"
    }
]
```

### **Get by Id**
Fetch comment by the given id.

`GET` `{base_url}/comments/get/{id}`

**Request body**:
```json
none
```

**Response**:
```json
// application/json
{
    "id": "id",
    "ownerId": "user / group id",
    "documentId": "document id",
    "user": {
        "username": "username",
        "shownName": "shownName"
    },
    "content": "content",
    "timestamp": "2023-06-13 02:37:00"
}
```

### **Add Public Comment**
Create new public comment.

`POST` `{base_url}/comments/add/public`

**Request body**:
```json
// application/json
{
    "documentId": "document id",
    "content": "content"
}
```

**Response**:
```json
// application/json
{
    "id": "id",
    "ownerId": null,
    "documentId": "document id",
    "username": "username",
    "content": "content",
    "timestamp": "2023-06-13 02:37:00"
}
```

### **Add Private Comment**
Create new private comment.

`POST` `{base_url}/comments/add/private`

**Request param**:  
`groupId` (optional)

**Request body**:
```json
// application/json
{
    "documentId": "document id",
    "content": "content"
}
```

**Response**:
```json
// application/json
{
    "id": "id",
    "ownerId": "user / group id",
    "documentId": "document id",
    "username": "username",
    "content": "content",
    "timestamp": "2023-06-13 02:37:00"
}
```

### **Update Comment**
Update comment by the given id.

`PUT` `{base_url}/comments/update/{id}`

**Request body**:
```json
// application/json
{
    "content": "content"
}
```

**Response**:
```json
none
```

### **Delete Comment**
Delete comment by the given id.

`DELETE` `{base_url}/comments/delete/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```

### **Delete Comment ( ADMIN )**
Delete comment by the given id. Can delete private comment.

`DELETE` `{base_url}/comments/admin/delete/{id}`

**Request body**:
```json
none
```

**Response**:
```json
none
```