# **Backend Server**

## **How to Run**
Build the docker image:
```shell
docker build -t app-image-name
```

When running the image, the `application.properties` file should be mounted from the local machine to the docker container.
This way, we can modify the environment variables easier:
```shell
docker run -p 8080:8080 -v $(pwd)/application.properties:/config/application.properties app-image-name
```

## **Properties file**
An `application.properties` file have to be created, following the shown example in the [application.properties.example](src/main/resources/application.properties.example) file.

```properties
# MongoDB properties
spring.data.mongodb.uri=
spring.data.mongodb.database=

# LDAP properties
spring.ldap.urls=
spring.ldap.username=
spring.ldap.password=
spring.ldap.base=

# Allowed max API request and file size
spring.servlet.multipart.max-file-size=
spring.servlet.multipart.max-request-size=

# Document deletion schedule properties
document.deletion.time=
document.deletion.schedule=

# JWT token secret
jwt.secret.key=

# Allowed CORS Origins
cors.origins=
```

### **Document deletion schedule properties**
- `document.deletion.time`: number of days before deleting a document
- `document.deletion.schedule`: cron schedule

**cron schedule syntax:**  
`second (0-59)`  
`minute (0 - 59)`  
`hour (0 - 23)`  
`day of the month (1 - 31)`  
`month (1 - 12) (or JAN-DEC)`  
`day of the week (0 - 7) (or MON-SUN -- 0 or 7 is Sunday)`

**example:** `0 0 4 * * ?` means it will run every day at `04:00`

### **CORS Origins property**
- `cors.origins`: list of urls, separated by `;`
