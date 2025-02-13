# Project install (Frontend)

1. npm install in frontend root folder
2. Create .env and copy this environment variable and fill your data

```
REACT_APP_CLIENT_ID="your_client_id"
REACT_APP_CLIENT_SECRET="your_client_secret"
REACT_APP_REDIRECT_URI="http://localhost:3000"
REACT_APP_SCOPE="read,activity:read"
```

3. npm start

# Project install (Backend)

1. npm install in backend root folder
2. npm start
3. http://localhost:5000

### A typical top-level directory layout

    stravapp
    ├── frontend
    │   ├── public             # public files
    │   ├── src
    │   │   ├── api            # API functions
    │   │   ├── auth           # Authorization functions
    │   │   ├── components     # Frontend components
    │   │   ├── hooks          # Hooks functions
    │   │   ├── pages          # Web pages components
    │   │   ├── routes         # Routes settings
    │   │   ├── styles         # Styles with sass
    │   ├── .env               # environment variables
    ├── backend
    │   ├── server.js          # main server
    └── README.md
