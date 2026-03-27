# Astra Security

Advanced security library for AI detection and human verification.

## Installation

```bash
npm install astra-security
```

## Quick Start

```javascript
import Astra from 'astra-security';

// Initialize with your API key
const astra = new Astra({
  apiKey: 'your-api-key-here',
  environment: 'production' // or 'development'
});

// Initialize the SDK
astra.init();

// Verify a request
astra.verifyRequest(requestData)
  .then(result => {
    if (result.isHuman) {
      // Proceed with human request
      console.log('Human detected');
    } else {
      // Handle bot detection
      console.log('Bot detected');
    }
  })
  .catch(error => {
    console.error('Verification failed:', error);
  });
```

## Configuration Options

```javascript
const astra = new Astra({
  apiKey: 'string',           // Required: Your API key
  environment: 'production',   // Optional: 'production' or 'development'
  timeout: 5000,              // Optional: Request timeout in ms
  debug: false,               // Optional: Enable debug logging
  autoBlock: true,            // Optional: Automatically block detected bots
  endpoint: 'https://api.astra.security/v1' // Optional: Custom API endpoint
});
```

## API Reference

### `astra.init()`
Initializes the SDK. Must be called before using other methods.

### `astra.verifyRequest(requestData)`
Verifies if a request is from a human or AI.

**Parameters:**
- `requestData` (Object): Request data including headers, IP, user agent, etc.

**Returns:** Promise resolving to verification result

### `astra.trackEvent(eventName, data)`
Tracks security events for analytics.

### `astra.getAnalytics()`
Retrieves analytics data for your account.

## Browser Usage

```html
<script src="https://cdn.astra.security/v1/astra.min.js"></script>
<script>
  const astra = new Astra({
    apiKey: 'your-api-key-here'
  });
  
  astra.init();
</script>
```

## React Integration

```jsx
import { AstraProvider, useAstra } from 'astra-security/react';

function App() {
  return (
    <AstraProvider apiKey="your-api-key-here">
      <YourApp />
    </AstraProvider>
  );
}

function ProtectedComponent() {
  const { verifyRequest } = useAstra();
  
  const handleRequest = async () => {
    const result = await verifyRequest(requestData);
    if (result.isHuman) {
      // Proceed
    }
  };
  
  return <button onClick={handleRequest}>Submit</button>;
}
```

## Node.js Integration

```javascript
const Astra = require('astra-security');

const astra = new Astra({
  apiKey: 'your-api-key-here'
});

// Express middleware
app.use((req, res, next) => {
  astra.verifyRequest(req)
    .then(result => {
      if (result.isHuman) {
        next();
      } else {
        res.status(403).json({ error: 'Bot detected' });
      }
    })
    .catch(error => {
      console.error('Verification error:', error);
      next(); // Fail open for errors
    });
});
```

## Events

Astra emits events you can listen to:

```javascript
astra.on('verification.success', (result) => {
  console.log('Human verified:', result);
});

astra.on('verification.failure', (result) => {
  console.log('Bot detected:', result);
});

astra.on('error', (error) => {
  console.error('Astra error:', error);
});
```

## Error Handling

```javascript
try {
  const result = await astra.verifyRequest(requestData);
  // Handle result
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Handle network issues
  } else if (error.code === 'INVALID_API_KEY') {
    // Handle invalid API key
  } else {
    // Handle other errors
  }
}
```

## Dashboard

After installation, visit your [Astra Dashboard](https://astra.security/dashboard) to:
- View analytics
- Configure settings
- Manage API keys
- Monitor security events

## Support

- Documentation: [https://astra.security/docs](https://astra.security/docs)
- Dashboard: [https://astra.security/dashboard](https://astra.security/dashboard)
- Email: support@astra.security

## License

MIT © Astra Security