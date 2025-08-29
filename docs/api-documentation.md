# University Application Tracker API Documentation

## Overview

The University Application Tracker API provides a comprehensive RESTful interface for managing university applications, student profiles, and university data. This API is built with Next.js 14 and Supabase, offering secure authentication, role-based access control, and robust data validation.

## Base URL

```
https://yourdomain.com/api/v1
```

## Authentication

All API endpoints require authentication using Supabase JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": <response_data>,
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Search Operations**: 30 requests per minute
- **Write Operations**: 10 requests per minute

When rate limit is exceeded, the API returns a 429 status code with a `Retry-After` header.

## Endpoints

### Applications

#### Get All Applications
Retrieves all applications for the authenticated student.

```http
GET /applications
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "student_id": "user-uuid",
      "university_id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
      "application_type": "Early Decision",
      "deadline": "2024-01-15",
      "status": "IN_PROGRESS",
      "submitted_date": null,
      "decision_date": null,
      "decision_type": null,
      "notes": "Personal statement completed",
      "created_at": "2024-01-01T00:00:00Z",
      "university": {
        "id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
        "name": "MIT",
        "location": "Cambridge, MA, USA",
        "ranking": 1,
        "acceptance_rate": 7.3
      }
    }
  ],
  "total": 1,
  "pagination": {
    "total": 1,
    "limit": 1,
    "offset": 0,
    "has_more": false
  }
}
```

#### Create Application
Creates a new application for a university.

```http
POST /applications
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "university_id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
  "application_type": "Early Decision",
  "deadline": "2024-01-15",
  "notes": "Personal statement completed"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id": "user-uuid",
    "university_id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
    "application_type": "Early Decision",
    "deadline": "2024-01-15",
    "status": "NOT_STARTED",
    "notes": "Personal statement completed",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Successfully added MIT to your application list"
}
```

#### Get Application by ID
Retrieves detailed information for a specific application.

```http
GET /applications/{id}
```

**Parameters:**
- `id` (string, required): Application UUID

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_id": "user-uuid",
    "university_id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
    "application_type": "Early Decision",
    "deadline": "2024-01-15",
    "status": "IN_PROGRESS",
    "submitted_date": "2024-01-10",
    "decision_date": null,
    "decision_type": null,
    "notes": "Personal statement completed",
    "created_at": "2024-01-01T00:00:00Z",
    "university": {
      "id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
      "name": "MIT",
      "location": "Cambridge, MA, USA",
      "ranking": 1,
      "acceptance_rate": 7.3,
      "tuition_fees": 55000,
      "programs": ["Computer Science", "Engineering"]
    }
  }
}
```

#### Update Application
Updates an existing application.

```http
PUT /applications/{id}
```

**Parameters:**
- `id` (string, required): Application UUID

**Request Body:**
```json
{
  "status": "SUBMITTED",
  "submitted_date": "2024-01-10",
  "notes": "Application submitted successfully"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "SUBMITTED",
    "submitted_date": "2024-01-10",
    "notes": "Application submitted successfully",
    "university": {
      "id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
      "name": "MIT",
      "location": "Cambridge, MA, USA"
    }
  },
  "message": "Application updated successfully"
}
```

### Universities

#### Search Universities
Searches and filters universities with pagination and sorting.

```http
GET /universities
```

**Query Parameters:**
- `q` (string, optional): Search query for university name
- `country` (string, optional): Filter by country
- `ranking_min` (number, optional): Minimum ranking
- `ranking_max` (number, optional): Maximum ranking
- `acceptance_rate_min` (number, optional): Minimum acceptance rate
- `acceptance_rate_max` (number, optional): Maximum acceptance rate
- `tuition_min` (number, optional): Minimum tuition fees
- `tuition_max` (number, optional): Maximum tuition fees
- `limit` (number, optional): Number of results (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)
- `sort_by` (string, optional): Sort field (default: 'name')
- `sort_order` (string, optional): Sort order - 'asc' or 'desc' (default: 'asc')

**Example:**
```http
GET /universities?q=MIT&country=USA&ranking_max=50&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
      "name": "Massachusetts Institute of Technology",
      "location": "Cambridge, MA, USA",
      "country": "USA",
      "ranking": 1,
      "acceptance_rate": 7.3,
      "tuition_fees": 55000,
      "programs": ["Computer Science", "Engineering", "Physics"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "has_more": false
  }
}
```

#### Get University by ID
Retrieves detailed information for a specific university.

```http
GET /universities/{id}
```

**Parameters:**
- `id` (string, required): University UUID

**Response:**
```json
{
  "data": {
    "id": "508d46ce-c832-4aa2-879d-d9ed1cfd58b1",
    "name": "Massachusetts Institute of Technology",
    "location": "Cambridge, MA, USA",
    "country": "USA",
    "ranking": 1,
    "acceptance_rate": 7.3,
    "tuition_fees": 55000,
    "programs": ["Computer Science", "Engineering", "Physics"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Student Profiles

#### Create/Update Profile
Creates or updates a student profile.

```http
POST /student/profiles
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "role": "student",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "data": {
    "user_id": "user-uuid",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Profile created/updated successfully"
}
```

### Parent Notes

#### Create Note
Creates a new note for an application (Parent only).

```http
POST /parent/notes
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "application_id": "123e4567-e89b-12d3-a456-426614174000",
  "note": "Student has completed all requirements. Ready for submission."
}
```

**Response:**
```json
{
  "data": {
    "id": "note-uuid",
    "application_id": "123e4567-e89b-12d3-a456-426614174000",
    "parent_user_id": "parent-uuid",
    "note": "Student has completed all requirements. Ready for submission.",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Note created successfully"
}
```

## Data Models

### Application Status
- `NOT_STARTED` - Application not yet started
- `IN_PROGRESS` - Application in progress
- `SUBMITTED` - Application submitted
- `UNDER_REVIEW` - Application under review
- `ACCEPTED` - Application accepted
- `REJECTED` - Application rejected
- `WAITLISTED` - Application waitlisted
- `DEFERRED` - Application deferred

### Application Type
- `Early Decision`
- `Early Action`
- `Regular Decision`
- `Rolling Admission`

### Decision Type
- `ACCEPTED` - Accepted
- `REJECTED` - Rejected
- `WAITLISTED` - Waitlisted
- `DEFERRED` - Deferred

### User Roles
- `student` - Student user
- `parent` - Parent user

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | User not authenticated |
| `FORBIDDEN` | User not authorized for this action |
| `PROFILE_NOT_FOUND` | User profile not found |
| `INVALID_UUID` | Invalid UUID format |
| `UNIVERSITY_NOT_FOUND` | University not found |
| `APPLICATION_NOT_FOUND` | Application not found |
| `APPLICATION_EXISTS` | Application already exists |
| `ACCESS_DENIED` | Access denied to resource |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `VALIDATION_ERROR` | Request validation failed |

## Validation Rules

### UUID Validation
All UUID fields must follow the standard UUID v4 format:
```
^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$
```

### String Validation
- Maximum length: 1000 characters (configurable per field)
- Required fields cannot be empty

### Number Validation
- Must be a valid number
- Can have minimum and maximum constraints
- Ranking: 1-1000
- Acceptance rate: 0-100
- Tuition fees: 0-1000000

### Date Validation
- Must be in ISO 8601 format (YYYY-MM-DD)
- Cannot be in the past for deadlines

## Security

### Authentication
- JWT-based authentication using Supabase
- Tokens expire after 24 hours
- Automatic token refresh

### Authorization
- Role-based access control (RBAC)
- Students can only access their own applications
- Parents can only access linked student applications
- University data is publicly accessible to authenticated users

### Input Validation
- All inputs are validated and sanitized
- SQL injection protection
- XSS protection through input validation

### Rate Limiting
- Prevents API abuse
- Different limits for different operation types
- Automatic cleanup of expired rate limit records

## CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS) with the following configuration:

- **Allowed Origins**: Configurable via `ALLOWED_ORIGINS` environment variable
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With
- **Credentials**: Supported
- **Max Age**: 24 hours

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | `100` |
| `RATE_LIMIT_AUTH_MAX_REQUESTS` | Max auth requests per window | `5` |
| `RATE_LIMIT_SEARCH_MAX_REQUESTS` | Max search requests per window | `30` |
| `RATE_LIMIT_WRITE_MAX_REQUESTS` | Max write requests per window | `10` |

## SDK Examples

### JavaScript/TypeScript

```typescript
class UniversityAppTrackerAPI {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  async getApplications() {
    return this.request('/applications');
  }

  async createApplication(data: any) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchUniversities(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/universities?${queryString}`);
  }
}

// Usage
const api = new UniversityAppTrackerAPI('https://api.example.com/v1', 'your-jwt-token');
const applications = await api.getApplications();
```

### Python

```python
import requests
from typing import Dict, Any

class UniversityAppTrackerAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def _request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = requests.request(method, url, headers=self.headers, json=data)
        
        if not response.ok:
            error = response.json()
            raise Exception(error.get('error', 'API request failed'))
        
        return response.json()

    def get_applications(self) -> Dict[str, Any]:
        return self._request('/applications')

    def create_application(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return self._request('/applications', method='POST', data=data)

    def search_universities(self, params: Dict[str, Any]) -> Dict[str, Any]:
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return self._request(f'/universities?{query_string}')

# Usage
api = UniversityAppTrackerAPI('https://api.example.com/v1', 'your-jwt-token')
applications = api.get_applications()
```

## Support

For API support and questions:

- **Documentation**: [https://docs.example.com](https://docs.example.com)
- **Status Page**: [https://status.example.com](https://status.example.com)
- **Support Email**: api-support@example.com

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Basic CRUD operations for applications
- University search and filtering
- Student profile management
- Parent notes functionality
- Rate limiting and security features
