/**
 * ASTRA Security Gateway Server
 * 
 * Express server that provides API endpoints for the ASTRA system
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const AstraCore = require('../core');
const HumanityVerification = require('../verification');
const AstraGateway = require('../gateway');
const AstraUIComponents = require('../ui/components');

class AstraServer {
  constructor(config = {}) {
    this.app = express();
    this.config = {
      port: config.port || 3000,
      corsOrigins: config.corsOrigins || ['*'],
      ...config
    };
    
    // Initialize ASTRA systems
    this.astraCore = new AstraCore();
    this.humanityVerification = new HumanityVerification();
    this.gateway = new AstraGateway();
    this.uiComponents = new AstraUIComponents();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigins,
      credentials: true
    }));
    
    // JSON parsing
    this.app.use(express.json());
    
    // Static files for UI
    this.app.use('/astra-ui', express.static(path.join(__dirname, '../ui')));
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'ASTRA Security Gateway',
        version: '1.0.0',
        timestamp: Date.now()
      });
    });

    // Gateway check (when user opens a site)
    this.app.post('/api/gateway/check', async (req, res) => {
      try {
        const result = await this.gateway.performGatewayCheck(req.body);
        
        // If verification required, include UI data
        if (result.verificationRequired) {
          result.ui = this.uiComponents.generateGatewayCheckUI(result);
        }
        
        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: 'Gateway check failed',
          message: error.message
        });
      }
    });

    // Get gateway session status
    this.app.get('/api/gateway/session/:sessionId', (req, res) => {
      const status = this.gateway.getSessionStatus(req.params.sessionId);
      if (!status) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(status);
    });

    // Get gateway statistics
    this.app.get('/api/gateway/stats', (req, res) => {
      res.json(this.gateway.getGatewayStats());
    });

    // Process security request
    this.app.post('/api/astra/process', async (req, res) => {
      try {
        const result = await this.astraCore.processRequest(req.body);
        
        // Check if OOS > 3, trigger humanity verification
        if (result.oosScore > 3 && !req.body.verificationCompleted) {
          const verification = this.humanityVerification.triggerVerification(
            req.body.sessionId,
            result.oosScore,
            req.body.userContext || {}
          );
          
          if (verification.required) {
            // Generate UI for verification
            verification.ui = this.uiComponents.generateHumanityVerificationUI(verification);
            
            res.json({
              ...result,
              verificationRequired: true,
              verification
            });
            return;
          }
        }
        
        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: 'Processing failed',
          message: error.message
        });
      }
    });

    // Submit verification response
    this.app.post('/api/verification/submit', (req, res) => {
      try {
        const { sessionId, challengeId, response } = req.body;
        const result = this.humanityVerification.submitResponse(sessionId, {
          challengeId,
          ...response
        });
        
        res.json(result);
      } catch (error) {
        res.status(500).json({
          error: 'Verification failed',
          message: error.message
        });
      }
    });

    // Get verification session status
    this.app.get('/api/verification/session/:sessionId', (req, res) => {
      const status = this.humanityVerification.getSessionStatus(req.params.sessionId);
      if (!status) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(status);
    });

    // Get verification statistics
    this.app.get('/api/verification/stats', (req, res) => {
      res.json(this.humanityVerification.getStatistics());
    });

    // Get ASTRA metrics
    this.app.get('/api/astra/metrics', (req, res) => {
      res.json(this.astraCore.getMetrics());
    });

    // Get UI component (for client-side rendering)
    this.app.post('/api/ui/humanity-verification', (req, res) => {
      const { challengeData, theme = 'light' } = req.body;
      const ui = this.uiComponents.generateHumanityVerificationUI(challengeData, theme);
      res.json(ui);
    });

    this.app.post('/api/ui/gateway-check', (req, res) => {
      const { checkData, theme = 'light' } = req.body;
      const ui = this.uiComponents.generateGatewayCheckUI(checkData, theme);
      res.json(ui);
    });

    // Documentation endpoint
    this.app.get('/api/docs', (req, res) => {
      res.json({
        name: 'ASTRA Security API',
        version: '1.0.0',
        endpoints: [
          {
            path: '/health',
            method: 'GET',
            description: 'Health check'
          },
          {
            path: '/api/gateway/check',
            method: 'POST',
            description: 'Perform gateway security check'
          },
          {
            path: '/api/astra/process',
            method: 'POST',
            description: 'Process security request'
          },
          {
            path: '/api/verification/submit',
            method: 'POST',
            description: 'Submit verification response'
          }
        ]
      });
    });
  }

  /**
   * Start the server
   */
  start() {
    this.server = this.app.listen(this.config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🛡️  ASTRA Security Gateway Server                        ║
║                                                              ║
║     The Invisible Guardian - Security that feels helpful     ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Status:        ✅ Running                                   ║
║  Port:          ${this.config.port.toString().padEnd(46)}║
║  Environment:   ${process.env.NODE_ENV || 'development'}${''.padEnd(46 - (process.env.NODE_ENV || 'development').length)}║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  API Endpoints:                                              ║
║    • POST   /api/gateway/check                               ║
║    • POST   /api/astra/process                               ║
║    • POST   /api/verification/submit                        ║
║    • GET    /health                                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
    
    return this.server;
  }

  /**
   * Stop the server
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('ASTRA Server stopped');
    }
  }
}

module.exports = AstraServer;

// If run directly, start the server
if (require.main === module) {
  const server = new AstraServer({
    port: process.env.PORT || 3000,
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*']
  });
  
  server.start();
  
  // Graceful shutdown
  process.on('SIGTERM', () => server.stop());
  process.on('SIGINT', () => server.stop());
}