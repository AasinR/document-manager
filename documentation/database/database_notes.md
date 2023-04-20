# **Database Plans**
MongoDB databse

## **Users collection**
- **User Name** ( String )
- Shown Name ( String )
- Email ( String )
- Permission ( String )

## **Documents collection**
- **ID** ( String )
- File ID ( String )
- Visibility ( String )
- Metadata Version ( int )
- Metadata List ( List )
    - User Name ( String )
    - Metadata Version ( int )
    - Modification Date ( Date )
    - Title ( String )
    - Author List ( String List )
    - Description ( String )
    - Publication Date ( Date )
    - Identifier List ( String List )
    - Related Documents ( String List )
    - Tag List ( String List )
- Comment List ( List )
    - ID ( String )
    - User Name ( String )
    - Content ( String )
    - Date ( Date )

## **Libraries collection**
Private and Shared libraries are separated

### **Private Library**
- **ID** ( String )
- Owner ( String )
- Documents ( List )
    - Document ID ( String )
    - Private Tag List ( String List )
    - Comment List ( List )
        - ID ( String )
        - User Name ( String )
        - Content ( String )
        - Date ( Date )

### **Shared Library**
- **ID** ( String )
- User List ( List )
    - User Name ( String )
    - Permission ( String )
- Documents ( List )
    - Document ID ( String )
    - Private Tag List ( String List )
    - Comment List ( List )
        - ID ( String )
        - User Name ( String )
        - Content ( String )
        - Date ( Date )
        - Visibility ( String )

## **Deletable-Documents collection**
- **ID** ( String )
- Document ID ( String )
- Date ( Date )

## **File storage**
Files will be stored in the databse, using GridFS

## **Document Highlights**
PDF Highlight data storage requires further investigation