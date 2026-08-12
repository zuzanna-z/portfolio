# To Do List: A full API router 

A Node.js-based API router built to power a simple to-do list web application. It provides the core backend functionality for managing tasks, including creating, updating, and deleting items, while also featuring an integrated authentication system for secure user access.

## Router structure: 

**Client → Router → Middleware → Model → Database**


**Routes** — Receive and direct API requests.
**Middleware** — Authentication and **validation.
**Models** — Handle database operations.
**Database** — Persist the application data.
**Response** — Return the operation result/error to the client.

## Router purpose & functionality: 

The purpose of the API router is to provide the backend functionality required for a collaborative to-do list application. It is designed to manage users, tasks, groups, and authentication through a secure and structured API.

The main objectives are to:

1. **Manage user accounts** — Allow users to create accounts and log in while ensuring their data is stored persistently.
2. **Manage tasks** — Allow users to retrieve, create, delete, and mark tasks as completed through a simple to-do list system.
3. **Support collaboration** — Allow users to create or join groups where tasks can be managed and shared with other users.
4. **Provide secure authentication and authorization** — Implement a complete authentication system that manages user login, access permissions, and group ownership to ensure users can only access and modify resources they are authorized to use.

## Authentication: 

### 1. User Registration

Users can create an account by providing a username and password. The password is securely hashed using `bcrypt.hashSync()` before being stored, ensuring that the original password is never stored directly. A unique user ID is automatically generated based on the current state of the user database.

### 2. Login / Logout

To log in, the user provides their username and password. The provided password is securely compared against the stored password hash. If the credentials are valid, a JWT is generated and returned to the client for use in subsequent authenticated API requests. Authentication middleware verifies the JWT and grants the user access to their own content and available functionality as long as a valid JWT is included in the API request header. Logging out is handled by removing the JWT from the client, preventing it from being used for further authenticated requests.

### 3. Group Permissions

Groups are stored as separate entities containing a list of members identified by their unique user IDs. Each member is assigned a specific role within the group, with the user who creates the group automatically being assigned the **Admin** role. The group admin has full access to group functionality, including adding and removing members and managing the group itself. Regular members can view and modify tasks within the group but do not have permission to manage group members or modify the group settings.

### 4. Protected Endpoints

All API endpoints, with the exception of user account creation and log in, require authentication. A valid JWT must be included in the request header to access protected functionality and resources.

### 5. Authentication Errors

Authentication and authorization errors are handled by the API and returned with appropriate error messages. This provides clear feedback when requests contain invalid, missing, or unauthorized authentication credentials.

# Data Handling

### 1. Data Storage

All application data is stored in an external database hosted on a server. This allows user, group, and task data to be persisted and accessed independently of the API application.

### 2. Data Relationships

All database entities — **members, groups, and tasks** — are assigned unique IDs, which are used as the primary references between entities. IDs are used to establish relationships and maintain consistency between the different types of data.

Each task contains the **member ID** of its author/owner and, when applicable, the **group ID** of the group it belongs to. Groups maintain a list of their members using their unique member IDs, with each member having an assigned role within the group. Groups also maintain references to the tasks associated with them.

Using unique IDs as the key between entities allows the API to efficiently identify, retrieve, and manage related users, groups, and tasks while maintaining clear ownership and permission relationships.

### 3. CRUD Operations and Persistence

Each CRUD operation is handled through a dedicated API route. Before any database operation is performed, the request must successfully pass both authentication and content validation. If either process fails, the operation is immediately aborted and an appropriate error message is returned to the requesting client.

Once authentication and validation are successful, the router establishes a connection to the external database. The requested operation is then passed to the appropriate data model, which handles the creation, retrieval, modification, or deletion of the requested data. After the operation is completed, the database connection is closed.

The router then constructs an appropriate response containing the result of the operation and sends it back to the requesting client. This process ensures that all database operations are authenticated, validated, and handled through the appropriate model while maintaining persistent data between requests.


# Error Handling

The API uses error handling throughout the request process to prevent invalid or unauthorized operations from being executed. Authentication and request validation are performed before any database operation takes place. If either check fails, the request is immediately aborted and an appropriate error message is returned to the client.

Errors can also occur during database operations or when requested resources cannot be found. These cases are handled by the API and returned to the requesting client with an appropriate response message, allowing the client to identify and respond to the issue.


# Scope

The scope of the project is the development of a Node.js-based API router that provides the backend functionality for a collaborative to-do list application. The API is responsible for user account management, authentication, task management, group management, authorization, and communication with the external database.

The router supports the creation and management of user accounts, CRUD operations for tasks, and the creation and management of groups where users can collaborate on shared tasks. It also provides authentication and role-based authorization to ensure that users can only access and modify resources they are permitted to use.

The scope of the project is limited to the API and its interaction with the database. The frontend user interface and client-side presentation of the application are outside the scope of the router.


