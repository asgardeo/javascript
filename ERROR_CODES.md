# Error Code Convention

## Overview

This document defines the error code convention used throughout the Asgardeo JavaScript SDK to ensure consistency and
maintainability.

## Format

Error codes follow this format:

```
[{packageName}-]{functionName}-{ErrorCategory}-{SequentialNumber}
```

### Components

#### 1. Package Name (Optional)

- Use when the function might exist in multiple packages or when disambiguation is needed
- Use the package identifier (e.g., "javascript", "react", "node")
- Examples: `javascript-`, `react-`, `node-`

#### 2. Function Name

- Use the exact function name as defined in the code
- Use camelCase format matching the function declaration
- Examples: `getUserInfo`, `executeEmbeddedSignUpFlow`, `initializeEmbeddedSignInFlow`

#### 3. Error Category

Categories represent the type of error:

- **ValidationError**: Input validation failures, missing required parameters, invalid parameter values
- **ResponseError**: HTTP response errors, network failures, server errors
- **ConfigurationError**: Configuration-related errors, missing configuration, invalid settings
- **AuthenticationError**: Authentication-specific errors, token issues, credential problems
- **AuthorizationError**: Authorization-specific errors, permission denied, access control
- **NetworkError**: Network connectivity issues, timeout errors
- **ParseError**: JSON parsing errors, response format issues

#### 4. Sequential Number

- Three-digit zero-padded format: `001`, `002`, `003`, etc.
- Start from `001` for each function
- Increment sequentially within each function
- Group by error category for readability

## Numbering Strategy

For each function, allocate number ranges by category:

- **001-099**: ValidationError
- **100-199**: ResponseError
- **200-299**: ConfigurationError
- **300-399**: AuthenticationError
- **400-499**: AuthorizationError
- **500-599**: NetworkError
- **600-699**: ParseError

## Package Prefix Guidelines

Use the package prefix when:

1. **Multi-package scenarios**: When the same function name exists across different packages
2. **Public APIs**: For functions that are part of the public API and might be referenced externally
3. **Complex projects**: In large codebases where disambiguation aids debugging and maintenance

Examples of when to use prefixes:

- `javascript-executeEmbeddedSignUpFlow-ValidationError-001` (public API function)
- `react-useAuth-ConfigurationError-201` (React-specific hook)
- `node-createServer-NetworkError-501` (Node.js-specific function)

## Examples

### With Package Prefix (Recommended for Public APIs)

```typescript
// executeEmbeddedSignUpFlow Function (JavaScript package)
'javascript-executeEmbeddedSignUpFlow-ValidationError-001'; // Missing payload
'javascript-executeEmbeddedSignUpFlow-ValidationError-002'; // Invalid flowType
'javascript-executeEmbeddedSignUpFlow-ResponseError-100'; // HTTP error response
```

### Without Package Prefix (Internal/Simple Functions)

```typescript
// getUserInfo Function (internal utility)
'getUserInfo-ValidationError-001'; // Invalid URL
'getUserInfo-ValidationError-002'; // Missing access token
'getUserInfo-ResponseError-100'; // HTTP error response
'getUserInfo-ResponseError-101'; // Invalid response format
```

## Implementation Guidelines

1. **Consistency**: Always use the exact function name in error codes
2. **Package Prefix**: Use package prefixes for public APIs and when disambiguation is needed
3. **Documentation**: Document each error code with clear description
4. **Categorization**: Choose the most appropriate category for each error
5. **Numbering**: Use the range-based numbering system for better organization
6. **Future-proofing**: Leave gaps in numbering for future error codes

## Current Implementation Status

### Updated Functions (Following New Convention)

- ✅ `executeEmbeddedSignUpFlow` - Uses `javascript-` prefix with range-based numbering

### Functions Needing Updates

- ⏳ `getUserInfo` - Currently uses simple format, needs prefix evaluation
- ⏳ `initializeEmbeddedSignInFlow` - Currently uses simple format, needs prefix evaluation
- ⏳ `executeEmbeddedSignInFlow` - Currently uses simple format, needs prefix evaluation

## Migration Notes

When updating existing error codes:

1. **Evaluate prefix necessity**: Determine if the function needs a package prefix
2. **Update numbering**: Move to range-based numbering (ValidationError: 001-099, ResponseError: 100-199, etc.)
3. **Update tests**: Ensure all tests use the new error codes
4. **Update documentation**: Document the new error codes
5. **Consider backward compatibility**: If codes are exposed in public APIs, plan migration strategy

## Example Migration

### Before (Old Convention)

```typescript
'getUserInfo-ValidationError-001';
'getUserInfo-ResponseError-001';
```

### After (New Convention)

```typescript
// Option 1: With prefix (for public API)
'javascript-getUserInfo-ValidationError-001';
'javascript-getUserInfo-ResponseError-100';

// Option 2: Without prefix (for internal use)
'getUserInfo-ValidationError-001';
'getUserInfo-ResponseError-100';
```

## Current Error Code Registry

### executeEmbeddedSignUpFlow (Updated - New Convention)

- `javascript-executeEmbeddedSignUpFlow-ValidationError-001` - Missing payload
- `javascript-executeEmbeddedSignUpFlow-ValidationError-002` - Invalid flowType
- `javascript-executeEmbeddedSignUpFlow-ResponseError-100` - HTTP error response

### getUserInfo (Legacy Format)

- `getUserInfo-ValidationError-001` - Invalid endpoint URL
- `getUserInfo-ResponseError-001` - Failed to fetch user info

### initializeEmbeddedSignInFlow (Legacy Format)

- `initializeEmbeddedSignInFlow-ValidationError-002` - Missing authorization payload
- `initializeEmbeddedSignInFlow-ResponseError-001` - Authorization request failed

### executeEmbeddedSignInFlow (Legacy Format)

- `executeEmbeddedSignInFlow-ValidationError-002` - Missing required parameter
- `initializeEmbeddedSignInFlow-ResponseError-001` - Response error (Note: incorrect function name reference)

## Recommended Actions

1. **Standardize numbering**: Update legacy functions to use range-based numbering
2. **Fix inconsistencies**: Correct the error code in `executeEmbeddedSignInFlow` that references the wrong function
3. **Add prefixes**: Evaluate which functions need package prefixes based on their public API status
4. **Document usage**: Add inline documentation in each file listing the error codes used
