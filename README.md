# cURL Parser API

This API provides cURL command parsing functionality and sample CRUD operations with various content type handling.

## Setup and Running

```bash
# Install dependencies
npm install

# Start the server
node index.js
```

The server runs on http://localhost:5000 by default.

## Technical Details

- Built with Node.js and Express
- Uses ES modules (import/export) syntax
- Includes validation with Joi
- Handles various content types (JSON, form data, binary, XML)

## Available Endpoints

### cURL Parser

- **POST /parse-curl**: Converts a cURL command to Postman collection format
  - Body: `{ "curlCommand": "curl https://example.com" }`

### User CRUD Operations

- **GET /api/users**: Get all users
- **GET /api/users/:id**: Get user by ID
- **POST /api/users**: Create a new user
  - Body: `{ "name": "User Name", "email": "user@example.com" }`
- **PUT /api/users/:id**: Update a user
  - Body: `{ "name": "Updated Name", "email": "updated@example.com" }`
- **DELETE /api/users/:id**: Delete a user

### Content Type Examples

#### Form Data (x-www-form-urlencoded)

- **POST /api/form-data**: Accepts and echoes form data
  - Content-Type: `application/x-www-form-urlencoded`
  - Example: `field1=value1&field2=value2`

#### Binary Data

- **POST /api/binary**: Accepts and processes binary files
  - Content-Type: `multipart/form-data`
  - Form field name: `file`

#### XML Data

- **POST /api/xml**: Accepts XML data and returns XML response
  - Content-Type: `application/xml`
  - Example request:
    ```xml
    <request>
      <item>
        <name>Test Item</name>
        <quantity>5</quantity>
      </item>
    </request>
    ```

## Example Usage

### Parse a cURL command

```bash
curl -X POST http://localhost:5000/parse-curl \
  -H "Content-Type: application/json" \
  -d '{"curlCommand": "curl -X GET https://api.example.com -H \"Accept: application/json\""}'
```

### Create a new user

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Smith", "email": "john@example.com"}'
```

### Submit XML data

```bash
curl -X POST http://localhost:5000/api/xml \
  -H "Content-Type: application/xml" \
  -d '<request><name>Test</name><value>123</value></request>'
``` 