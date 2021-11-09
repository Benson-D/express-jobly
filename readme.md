# Jobly Backend

Jobly is full stack web application. The frontend consist of React and Bootstrap. The backend utilizes Node, Express, and PostgreSQL.

- Mocks a job web application similiar to [Indeed](https://www.indeed.com) or [LinkedIn](https://www.linkedin.com)
- For more details on the frontend documentation please click [here](https://github.com/Benson-D/react-jobly)

## Installation
**Backend Setup**
- `cd` into the project directory 
- `npm install` to install the backend dependencies from the package.json file
- `node server.js` to start the server

```console
npm install
node server.js
 ```
    
**Backend Test**

```console
jest -i
 ```

## Current features 
- Users can view list of companies
- Users can filter through by name or number of employees of a company
- Users can view list of jobs 
- An admin user can retrieve a list of all users 
- Registration is open to all but admin users can create a user 
- An admin user can create, update, and delete a user 
- App utilizes RESTful routing

## Features to add
- Allow users to submit job applications
- Utilize PostgreSQL’s enum types to change the column state in applications
- Add Technologies for Jobs
- Add Technologies for Users


