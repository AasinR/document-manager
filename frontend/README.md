# **Frontend Server**

## **How to Run**
Build the docker image:
```shell
docker build -t app-image-name
```

Run docker container:
```shell
docker run -p 80:80 app-image-name
```

## **Environment File**
The environment variables can be assigned in the `.env` [file](.env).  
For development, it's better to use `.env.local` file instead of `.env`.

```env
REACT_APP_API_URL=
```
- `REACT_APP_API_URL`: {backend_url}/api/{api_version}
