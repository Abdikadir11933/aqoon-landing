# Tracker API Enhancements - Phase E

This document specifies the new API actions required by Phase C-F of the comprehensive system overhaul.

## Endpoint: family-case-lifecycle-admin

Base URL: `https://qxracwbsyfibcelasxbs.supabase.co/functions/v1/family-case-lifecycle-admin`

All endpoints require:
- `x-tracker-password` header with the operator password
- `Content-Type: application/json`
- POST method

### Existing Actions

- `batch_list`: Fetch lifecycle data for multiple leads (used by crm-lifecycle-data.js)
  - Input: `{ action: 'batch_list', lead_ids: [id1, id2, ...] }`
  - Output: `{ lifecycle: [{ lead_id, plans, events }] }`

### New Actions Required

#### 1. get_call_history
**Used by:** crm-call-history.js  
**Description:** Retrieve call log for a single lead

**Request:**
```json
{
  "action": "get_call_history",
  "lead_id": "uuid"
}
```

**Response:**
```json
{
  "calls": [
    {
      "id": "uuid",
      "lead_id": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "call_outcome": "reached|no_answer|call_later|attempted",
      "duration_seconds": 240,
      "operator_name": "string",
      "assigned_operator_id": "uuid",
      "notes": "string"
    }
  ]
}
```

#### 2. get_timeline
**Used by:** crm-lifecycle-timeline.js  
**Description:** Retrieve complete activity timeline for a lead (interviews, calls, case events, notes)

**Request:**
```json
{
  "action": "get_timeline",
  "lead_id": "uuid",
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "event_type": "first_interview|follow_up_interview|call_completed|call_no_answer|case_plan_created|case_plan_updated|case_status_changed|intake_completed|resolution_submitted|note_added",
      "description": "string",
      "created_by": "uuid",
      "operator_name": "string",
      "metadata": {}
    }
  ]
}
```

#### 3. get_consent
**Used by:** future consent tracking modules  
**Description:** Retrieve consent records for a lead (research consent, communication consent, etc.)

**Request:**
```json
{
  "action": "get_consent",
  "lead_id": "uuid"
}
```

**Response:**
```json
{
  "consents": [
    {
      "id": "uuid",
      "lead_id": "uuid",
      "type": "research|communication|phone|follow_up",
      "granted": true|false,
      "granted_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-02-15T10:30:00Z",
      "granted_by": "operator|family_member",
      "notes": "string"
    }
  ]
}
```

#### 4. get_revisions
**Used by:** interview-follow-up-recap.js  
**Description:** Retrieve interview revision history (changes between first and follow-up interviews)

**Request:**
```json
{
  "action": "get_revisions",
  "lead_id": "uuid",
  "interview_types": "first|follow_up|all"
}
```

**Response:**
```json
{
  "revisions": [
    {
      "id": "uuid",
      "lead_id": "uuid",
      "interview_id": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "field_name": "string",
      "old_value": "any",
      "new_value": "any",
      "changed_by": "uuid",
      "operator_name": "string"
    }
  ]
}
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "string",
  "detail": "string",
  "code": "VALIDATION_ERROR|AUTH_ERROR|NOT_FOUND|SERVER_ERROR"
}
```

HTTP Status Codes:
- 200: Success
- 400: Validation error (invalid input)
- 401: Authentication error (invalid password)
- 403: Forbidden (insufficient permissions)
- 404: Not found (lead doesn't exist)
- 500: Server error

## Caching Strategy

Clients should implement caching with TTL:

- **batch_list**: 60 seconds (moderate refresh for dashboard)
- **get_call_history**: 60 seconds (call logs don't change frequently)
- **get_timeline**: 30 seconds (events can change quickly)
- **get_consent**: 3600 seconds (consent rarely changes)
- **get_revisions**: 300 seconds (interview changes less frequent)

## Security Considerations

- All endpoints require password authentication via header
- All data is operator-scoped (filtered by assigned_operator_id if applicable)
- PII (names, phone numbers) should be masked in production responses where applicable
- Call recording links (if any) should never be returned

## Testing

See `tests/tracker-api.test.js` for test cases covering:
- Valid action requests
- Invalid lead IDs
- Missing password header
- Response format validation
- Pagination with limit/offset
- Consent expiry handling
