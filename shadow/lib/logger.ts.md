# Logger (logger.ts)

## Overview
Provides configurable logging functionality with different verbosity levels for debugging template processing and other operations.

## Log Levels
- `off`: No logging (except errors)
- `simple`: Basic operational logs and warnings
- `verbose`: Detailed debug information

## Usage

```typescript
import { logger } from './lib/logger'

// Set log level
logger.setLevel('verbose')

// Log at different levels
logger.debug('Processing template', { template, values })
logger.info('Template processed successfully')
logger.warn('Missing optional field')
logger.error('Failed to process template', error)
```

## Features
- Singleton pattern ensures consistent logging state
- Pretty-prints objects and arrays
- Configurable verbosity levels
- Always logs errors regardless of level
- Context objects for detailed debugging

## Methods

### `setLevel(level: LogLevel)`
Sets the current logging level.

### `getLevel(): LogLevel`
Gets the current logging level.

### `debug(message: string, context?: any)`
Logs debug information (verbose only).

### `info(message: string, context?: any)`
Logs general information (simple and verbose).

### `warn(message: string, context?: any)`
Logs warnings (simple and verbose).

### `error(message: string, context?: any)`
Logs errors (all levels).

## Notes
- Use debug for detailed processing information
- Use info for important state changes
- Use warn for recoverable issues
- Use error for critical failures
