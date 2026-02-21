#!/bin/bash
# ----------------------------------------------------------------------------
# Custom bootstrap script for e2e tests.
# Creates the React SDK Sample app with redirect_uris pointing to
# the Vite dev server on https://localhost:5173.
# ----------------------------------------------------------------------------

set -e

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]:-$0}")"
source "${SCRIPT_DIR}/common.sh"

log_info "Creating e2e test resources..."
echo ""

# ============================================================================
# Create Customers Organization Unit
# ============================================================================

CUSTOMER_OU_HANDLE="customers"

log_info "Creating Customers organization unit..."

read -r -d '' CUSTOMERS_OU_PAYLOAD <<JSON || true
{
  "handle": "${CUSTOMER_OU_HANDLE}",
  "name": "Customers",
  "description": "Organization unit for customer accounts"
}
JSON

RESPONSE=$(thunder_api_call POST "/organization-units" "${CUSTOMERS_OU_PAYLOAD}")
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [[ "$HTTP_CODE" == "201" ]] || [[ "$HTTP_CODE" == "200" ]]; then
    log_success "Customers organization unit created successfully"
    CUSTOMER_OU_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
elif [[ "$HTTP_CODE" == "409" ]]; then
    log_warning "Customers organization unit already exists, retrieving ID..."
    RESPONSE=$(thunder_api_call GET "/organization-units")
    HTTP_CODE="${RESPONSE: -3}"
    BODY="${RESPONSE%???}"

    if [[ "$HTTP_CODE" == "200" ]]; then
        # Extract the OU ID for the customers handle using grep
        CUSTOMER_OU_ID=$(echo "$BODY" | grep -o '"handle":"customers"[^}]*"id":"[^"]*"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [[ -z "$CUSTOMER_OU_ID" ]]; then
            CUSTOMER_OU_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"[^}]*"handle":"customers"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        fi
    else
        log_error "Failed to fetch organization units (HTTP $HTTP_CODE)"
        echo "Response: $BODY"
        exit 1
    fi
else
    log_error "Failed to create Customers organization unit (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi

if [[ -z "$CUSTOMER_OU_ID" ]]; then
    log_error "Could not determine Customers organization unit ID"
    exit 1
fi

log_info "Customers OU ID: $CUSTOMER_OU_ID"
echo ""

# ============================================================================
# Create Customer User Type
# ============================================================================

log_info "Creating Customer user type..."

read -r -d '' CUSTOMER_USER_TYPE_PAYLOAD <<JSON || true
{
  "name": "Customer",
  "ouId": "${CUSTOMER_OU_ID}",
  "allowSelfRegistration": true,
  "schema": {
    "username": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "email": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "given_name": {
      "type": "string",
      "required": false
    },
    "family_name": {
      "type": "string",
      "required": false
    }
  }
}
JSON

RESPONSE=$(thunder_api_call POST "/user-schemas" "${CUSTOMER_USER_TYPE_PAYLOAD}")
HTTP_CODE="${RESPONSE: -3}"

if [[ "$HTTP_CODE" == "201" ]] || [[ "$HTTP_CODE" == "200" ]]; then
    log_success "Customer user type created successfully"
elif [[ "$HTTP_CODE" == "409" ]]; then
    log_warning "Customer user type already exists, skipping"
else
    log_error "Failed to create Customer user type (HTTP $HTTP_CODE)"
    exit 1
fi

echo ""

# ============================================================================
# Look up the default authentication and registration flow IDs
# (created by 01-default-resources.sh)
# ============================================================================

log_info "Looking up default flow IDs..."

RESPONSE=$(thunder_api_call GET "/flows?type=AUTHENTICATION")
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [[ "$HTTP_CODE" != "200" ]]; then
    log_error "Failed to fetch authentication flows (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi

# Extract the default-basic-flow authentication flow ID
# Parse JSON using grep - find the flow entry with handle "default-basic-flow"
# The API returns flows as a JSON array; we extract the id of the matching flow.
AUTH_FLOW_ID=$(echo "$BODY" | grep -o '"handle":"default-basic-flow"[^}]*"id":"[^"]*"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
# If the id comes before handle in the JSON, try the reverse pattern
if [[ -z "$AUTH_FLOW_ID" ]]; then
    AUTH_FLOW_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"[^}]*"handle":"default-basic-flow"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [[ -z "$AUTH_FLOW_ID" ]]; then
    log_error "Could not find default-basic-flow authentication flow"
    exit 1
fi

log_info "Auth flow ID: $AUTH_FLOW_ID"

RESPONSE=$(thunder_api_call GET "/flows?type=REGISTRATION")
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [[ "$HTTP_CODE" != "200" ]]; then
    log_error "Failed to fetch registration flows (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi

# Extract the default-basic-flow registration flow ID
REG_FLOW_ID=$(echo "$BODY" | grep -o '"handle":"default-basic-flow"[^}]*"id":"[^"]*"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [[ -z "$REG_FLOW_ID" ]]; then
    REG_FLOW_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"[^}]*"handle":"default-basic-flow"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

if [[ -z "$REG_FLOW_ID" ]]; then
    log_error "Could not find default-basic-flow registration flow"
    exit 1
fi

log_info "Registration flow ID: $REG_FLOW_ID"
echo ""

# ============================================================================
# Create React SDK Sample Application (with localhost:5173 redirect)
# ============================================================================

PUBLIC_URL="${THUNDER_PUBLIC_URL:-$THUNDER_API_BASE}"

log_info "Creating React SDK Sample App (e2e)..."

RESPONSE=$(thunder_api_call POST "/applications" "{
  \"name\": \"React SDK Sample\",
  \"description\": \"Sample React application for e2e testing\",
  \"url\": \"https://localhost:5173\",
  \"auth_flow_graph_id\": \"${AUTH_FLOW_ID}\",
  \"registration_flow_graph_id\": \"${REG_FLOW_ID}\",
  \"is_registration_flow_enabled\": true,
  \"user_attributes\": [\"given_name\",\"family_name\",\"email\",\"groups\",\"name\"],
  \"allowed_user_types\": [\"Customer\",\"Person\"],
  \"inbound_auth_config\": [{
    \"type\": \"oauth2\",
    \"config\": {
      \"client_id\": \"REACT_SDK_SAMPLE\",
      \"redirect_uris\": [\"https://localhost:5173\",\"https://localhost:5173/dashboard\"],
      \"post_logout_redirect_uris\": [\"https://localhost:5173\"],
      \"grant_types\": [\"authorization_code\"],
      \"response_types\": [\"code\"],
      \"token_endpoint_auth_method\": \"none\",
      \"pkce_required\": true,
      \"public_client\": true,
      \"token\": {
        \"issuer\": \"${PUBLIC_URL}\",
        \"access_token\": {
          \"validity_period\": 3600,
          \"user_attributes\": [\"given_name\",\"family_name\",\"email\",\"groups\",\"name\"]
        },
        \"id_token\": {
          \"validity_period\": 3600,
          \"user_attributes\": [\"given_name\",\"family_name\",\"email\",\"groups\",\"name\"],
          \"scope_claims\": {
            \"email\": [\"email\",\"email_verified\"],
            \"group\": [\"groups\"],
            \"phone\": [\"phone_number\",\"phone_number_verified\"],
            \"profile\": [\"name\",\"given_name\",\"family_name\",\"picture\"]
          }
        }
      }
    }
  }]
}")

HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [[ "$HTTP_CODE" == "201" ]] || [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "202" ]]; then
    log_success "React SDK Sample App created successfully"
elif [[ "$HTTP_CODE" == "409" ]]; then
    log_warning "React SDK Sample App already exists, skipping"
elif [[ "$HTTP_CODE" == "400" ]] && [[ "$BODY" =~ (Application already exists|APP-1022) ]]; then
    log_warning "React SDK Sample App already exists, skipping"
else
    log_error "Failed to create React SDK Sample App (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi

echo ""

log_success "E2E test resources setup completed!"
echo ""
