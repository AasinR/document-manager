# **Database Plans**
MongoDB database

## **Users collection**
- **Username** ( String )
- Shown Name ( String )
- Email ( String )
- Permission ( String )

## **Groups collection**
- **ID** ( String )
- Name ( String )
- User List ( List )
    - Username ( String )
    - Permission ( String )

## **Documents collection**
If the visibility is set to public, the  location is null

- **ID** ( String )
- File ID ( String )
- Visibility ( String )
- Location ( String )
    - Username ( String )
    - Group ID ( String )
- Metadata Version ( String )
    - Title ( String )
    - Author List ( String List )
    - Description ( String )
    - Publication Date ( Date )
    - Identifier List ( String List )
    - Related Documents ( String List )
    - Tag List ( String List )
    - Other Data ( key-value )

## **Metadata-Versions collection**
- **ID** ( String )
- Document ID ( String )
- Username ( String )
- Modification Date ( Date )
- Tag List ( String List )
- Title ( String )
- Author List ( String List )
- Description ( String )
- Publication Date ( Date )
- Identifier List ( String List )
- Related Documents ( String List )
- Other Data ( key-value )

## **Library-saves collection**
- **ID** ( String )
- Owner ( String )
    - Username ( String )
    - Group ID ( String )
- Document ID ( String )
- Private Tag List ( String List )

## **Comments collection**
If the visibility is set to public, the  location is null

- **ID** ( String )
- Username ( String )
- Document ID ( String )
- Content ( String )
- Date ( Date )
- Visibility ( String )
- Location ( String )
    - Username ( String )
    - Group ID ( String )

## **Deletable-Documents collection**
- **ID** ( String )
- Document ID ( String )
- Date ( Date )

## **File storage**
Files will be stored in the database, using GridFS

## **Document Highlights**
PDF Highlight data storage requires further investigation