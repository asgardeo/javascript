# Logger Utility

A universal logging utility that works seamlessly in both browser and Node.js environments with beautiful formatting,
colors, and flexible configuration.

## Features

- 🌐 **Universal**: Works in both browser and Node.js environments
- 🎨 **Beautiful Output**: Colored terminal output (Node.js) and styled console output (browser)
- � **Package-Aware**: Support for package-specific and component-specific loggers
- �📊 **Log Levels**: DEBUG, INFO, WARN, ERROR, SILENT
- 🏷️ **Prefixes**: Customizable prefixes with support for nested component loggers
- ⏰ **Timestamps**: Optional timestamp inclusion
- 🔧 **Configurable**: Flexible configuration options
- 🎯 **Type Safe**: Full TypeScript support

## Basic Usage

```typescript
import logger, {LogLevel} from '@asgardeo/javascript';

// Basic logging with package-specific prefix
logger.info('Application started');
// Output: 🛡️ Asgardeo - @asgardeo/javascript [INFO] Application started

logger.warn('This is a warning');
logger.error('Something went wrong');
logger.debug('Debug information'); // Only shown if level is DEBUG

// Configure log level
logger.setLevel(LogLevel.DEBUG);
logger.debug('Now debug messages will show');

// Set to production level
logger.setLevel(LogLevel.WARN); // Only WARN and ERROR will show
```

## Named Function Exports

```typescript
import {info, warn, error, debug} from '@asgardeo/javascript';

info('Quick info message');
warn('Quick warning');
error('Quick error');
debug('Quick debug');
```

## Package-Specific Loggers

```typescript
import {createPackageLogger, createPackageComponentLogger} from '@asgardeo/javascript';

// Create logger for specific package
const nextjsLogger = createPackageLogger('@asgardeo/nextjs');
nextjsLogger.info('Next.js package message');
// Output: 🛡️ Asgardeo - @asgardeo/nextjs [INFO] Next.js package message

const reactLogger = createPackageLogger('@asgardeo/react');
reactLogger.error('React package error');
// Output: 🛡️ Asgardeo - @asgardeo/react [ERROR] React package error

// Create logger for package + component
const nextAuthLogger = createPackageComponentLogger('@asgardeo/nextjs', 'Authentication');
nextAuthLogger.info('User signed in');
// Output: 🛡️ Asgardeo - @asgardeo/nextjs - Authentication [INFO] User signed in
```

## Custom Logger Configuration

```typescript
import {createLogger, LogLevel} from '@asgardeo/javascript';

const customLogger = createLogger({
  level: LogLevel.DEBUG,
  prefix: '🛡️ Asgardeo - MyCustomApp',
  timestamps: true,
  showLevel: true,
});

customLogger.info('Custom configured message');
// Output: [2025-01-10T10:30:45.123Z] 🛡️ Asgardeo - MyCustomApp [INFO] Custom configured message
```

## Component-Specific Loggers

```typescript
import {createComponentLogger} from '@asgardeo/javascript';

// Create loggers for different components (uses default package prefix)
const authLogger = createComponentLogger('Authentication');
const apiLogger = createComponentLogger('API');
const uiLogger = createComponentLogger('UI');

authLogger.info('User signed in successfully');
// Output: 🛡️ Asgardeo - @asgardeo/javascript - Authentication [INFO] User signed in successfully

apiLogger.error('API request failed');
// Output: 🛡️ Asgardeo - @asgardeo/javascript - API [ERROR] API request failed

uiLogger.debug('Rendering component');
// Output: 🛡️ Asgardeo - @asgardeo/javascript - UI [DEBUG] Rendering component
```

## Real-World Package Examples

### Next.js Package Usage

```typescript
import {createPackageComponentLogger} from '@asgardeo/javascript';

const authLogger = createPackageComponentLogger('@asgardeo/nextjs', 'Authentication');
const sessionLogger = createPackageComponentLogger('@asgardeo/nextjs', 'SessionManager');

export class NextAuthService {
  async signIn(credentials: Credentials): Promise<User> {
    authLogger.info('Starting Next.js sign-in process', {username: credentials.username});

    try {
      sessionLogger.debug('Creating session cookie');
      const user = await this.performSignIn(credentials);
      authLogger.info('Next.js sign-in successful', {userId: user.id});
      return user;
    } catch (error) {
      authLogger.error('Next.js sign-in failed', {error: error.message, username: credentials.username});
      throw error;
    }
  }
}
```

### Multi-Package Application

```typescript
// In @asgardeo/nextjs package
import {createPackageComponentLogger} from '@asgardeo/javascript';
const nextLogger = createPackageComponentLogger('@asgardeo/nextjs', 'Provider');

// In @asgardeo/react package
import {createPackageComponentLogger} from '@asgardeo/javascript';
const reactLogger = createPackageComponentLogger('@asgardeo/react', 'Hook');

// In @asgardeo/node package
import {createPackageComponentLogger} from '@asgardeo/javascript';
const nodeLogger = createPackageComponentLogger('@asgardeo/node', 'Client');

// Each will have distinct, identifiable output:
// 🛡️ Asgardeo - @asgardeo/nextjs - Provider [INFO] ...
// 🛡️ Asgardeo - @asgardeo/react - Hook [INFO] ...
// 🛡️ Asgardeo - @asgardeo/node - Client [INFO] ...
```
