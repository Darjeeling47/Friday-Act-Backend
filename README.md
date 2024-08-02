# Friday-Act_Backend

## Initialization for local running

1. create a `.env` file with these variables

    ```text
    HOST = http://localhost
    PORT = 5000

    DATABASE_HOST = localhost
    DATABASE_HOST_PORT = 12566
    DATABASE_USERNAME = admin
    DATABASE_USER_PASSWORD = admin
    DATABASE_NAME = admin
    DATABASE_POOL_MIN = 2
    DATABASE_POOL_MAX = 10
    ```

2. run `docker compose up` and start the thing
3. run `npm i`
4. run `knex migrate:latest`
5. run `npm run dev`

## References

### commit guideline

- [conventional commit](https://www.conventionalcommits.org)

### database

- [knex.js](https://knexjs.org/)

### security

- [OWASP top 10](https://owasp.org/www-project-top-ten/)

### folder structure

- [Future-proof API versioning with Node.js & Express](https://www.codemzy.com/blog/nodejs-api-versioning)
- [A future-proof Node.js express file/folder structure](https://www.codemzy.com/blog/nodejs-file-folder-structure)
