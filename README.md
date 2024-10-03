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

## Useful Information

### IDP objects

Object from Authorization Code Flow

```json
{
  "token_type": "Bearer",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoib2F1dGgiLCJncmFudFR5cGUiOiJBVVRIT1JJWkFMASKEDX0NPREUiLCJjbGllbnRJZCI6ImNlZHQtZnJpZGF5LWFjdGl2aXR5IiwidXMASKEDczdzZXdhcjU2YXRwaXh3ZHNrbTZ3b2tsIiwidXNlclR5MASKEDRURUX1NUVURFTlQiLCJzdHVkZW50SWQiOiI2NjMzMTg5MjIxIiwiam9iQ29kZSI6IjY2MzMxODkyMjEiLCJzY29wZXMiOlsicHJvZmlsZSJdLCJpYXQiOjMASKEDNTUsImV4cCI6MTcyODAzNzE1NSwiaXNzIjoiMASKEDRFAifQ.Jlq_s_XmfI35rLGQmT5Bm2_5by8Fv98gF3EHewclQPI",
  "refresh_token": "uj9f5la8cwca742w1m72d04p",
  "expires_in": 86400,
  "scope": "profile"
}
```

Deconstructed Body of the above:

```json
{
  "role": "oauth",
  "grantType": "AUTHORIZATION_CODE",
  "clientId": "cedt-friday-activity",
  "userId": "s7sewar56aMASKEDskm6wokl",
  "userType": "CEDT_STUDENT",
  "studentId": "663MASKED1",
  "jobCode": "663MASKED1",
  "scopes": [
    "profile"
  ],
  "iat": 1727950755,
  "exp": 1728037155,
  "iss": "CEDT IDP"
}
```

Object from using the above token to get user information from <https://cedtintern.cp.eng.chula.ac.th/api/oauth/v1/profile>

```json
{
  "userId": "s7sewar56aMASKEDskm6wokl",
  "userType": "CEDT_STUDENT",
  "studentId": "663MASKED1",
  "firstNameTh": "ชื่อ",
  "firstNameEn": "Name",
  "lastNameTh": "นามสกุล",
  "lastNameEn": "Surname",
  "admissionYear": 2023,
  "profileImageUrl": "https://cedtintern.cp.eng.chula.ac.th/api/public/files/student/profile-picture/cedt-friday-activity/MASKED",
  "program": {
    "programId": 1,
    "programName": "วิศวกรรมคอมพิวเตอร์และเทคโนโลยีดิจิทัล"
  },
  "department": {
    "departmentId": 1,
    "departmentName": "วิศวกรรมคอมพิวเตอร์"
  },
  "faculty": {
    "facultyId": 1,
    "facultyName": "วิศวกรรมศาสตร์"
  },
  "university": {
    "universityId": 1,
    "universityName": "จุฬาลงกรณ์มหาวิทยาลัย"
  },
  "isInternPortalAdmin": false
}
```
