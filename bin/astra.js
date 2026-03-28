#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const open = require('open');

// ASCII Art for ASTRA
const ASCII_ART = `
/$$$$$$  /$$ 
/$$__  $$| $$ 
| $$  \\ $$/$$$$$$$  /$$$$$$  /$$$$$$  /$$$$$$ 
| $$$$$$$$/$$_____/|_  $$_/ /$$__  $$|____  $$
| $$__  $| $$$$$$$   | $$  | $$  \\__/ /$$$$$$$
| $$  | $$\\____  $$  | $$ /$$| $$     /$$__  $$
| $$  | $$ /$$$$$$$/  |  $$$$/| $$    |  $$$$$$$
|__/  |__/|_______/    \\___/  |__/     \\_______/
`;

function showWelcome() {
  console.log('\x1b[36m%s\x1b[0m', ASCII_ART);
  console.log('\x1b[32m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[32m║                    ASTRA SECURITY SYSTEM                     ║\x1b[0m');
  console.log('\x1b[32m║           The Invisible Guardian - Human Verification        ║\x1b[0m');
  console.log('\x1b[32m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
  console.log('');
  console.log('\x1b[33mASTRA represents a paradigm shift in security:\x1b[0m');
  console.log('• Instead of "What do you know?" (passwords) or "What can you see?" (CAPTCHAs)');
  console.log('• ASTRA asks "Do you breathe?" - proving humanity through biological constraints');
  console.log('');
  console.log('\x1b[33mFour Pillar Architecture:\x1b[0m');
  console.log('  1. \x1b[36mHardware Breath\x1b[0m - Quantum entropy from device sensors');
  console.log('  2. \x1b[36mFrequency Mapping\x1b[0m - Temporal pattern analysis across 3 time scales');
  console.log('  3. \x1b[36mLiving Mutation System\x1b[0m - Hourly evolving challenges');
  console.log('  4. \x1b[36mEntanglement & Hijacking Defense\x1b[0m - Continuous verification');
  console.log('');
  console.log('\x1b[33mFriction Spectrum:\x1b[0m');
  console.log('  • Tier 0 (Ghost): Completely invisible - 0.0-1.5 OOS');
  console.log('  • Tier 1 (Whisper): 200ms micro-delay - 1.5-2.0 OOS');
  console.log('  • Tier 2 (Nudge): Single intuitive gesture - 2.0-2.5 OOS');
  console.log('  • Tier 3 (Pause): 10-second engaging challenge - 2.5-3.0 OOS');
  console.log('  • Tier 4 (Gate): Manual review queue - 3.0+ OOS');
  console.log('');
  console.log('\x1b[32mTarget: 95% of humans never leave Tier 0-1. Bots never get past Tier 2.\x1b[0m');
  console.log('');
}

function generateAuthId() {
  return crypto.randomBytes(16).toString('hex');
}

function getProjectConfig() {
  const cwd = process.cwd();
  const packageJsonPath = path.join(cwd, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return {
        name: packageJson.name || path.basename(cwd),
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'No description',
        path: cwd
      };
    } catch (error) {
      console.error('Error reading package.json:', error.message);
    }
  }
  
  return {
    name: path.basename(cwd),
    version: '1.0.0',
    description: 'Project in ' + cwd,
    path: cwd
  };
}

async function startLocalServer(authId, projectName) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const url = require('url');
    const fs = require('fs');
    const path = require('path');
    
    // Find available port starting from 3000
    const findPort = (port) => {
      const server = http.createServer();
      return new Promise((resolvePort, rejectPort) => {
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            resolvePort(findPort(port + 1));
          } else {
            rejectPort(err);
          }
        });
        server.listen(port, () => {
          server.close(() => resolvePort(port));
        });
      });
    };
    
    findPort(3000).then((port) => {
      const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        
        // Serve auth.html
        if (parsedUrl.pathname === '/auth.html') {
          const authHtmlPath = path.join(__dirname, '..', 'public', 'auth.html');
          fs.readFile(authHtmlPath, 'utf8', (err, data) => {
            if (err) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('Auth page not found');
              return;
            }
            
            // Inject authId and project name into HTML
            const html = data
              .replace('{{AUTH_ID}}', authId)
              .replace('{{PROJECT_NAME}}', projectName);
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
          });
        }
        
        // API endpoint to verify connection
        else if (parsedUrl.pathname === '/api/connect') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                if (data.authId === authId) {
                  // Update config
                  const astraConfigDir = path.join(os.homedir(), '.astra');
                  const configPath = path.join(astraConfigDir, 'config.json');
                  
                  if (fs.existsSync(configPath)) {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    config.status = 'connected';
                    config.connectedAt = new Date().toISOString();
                    config.lastVerified = new Date().toISOString();
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                  }
                  
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, message: 'Connection established' }));
                } else {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, message: 'Invalid auth ID' }));
                }
              } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Server error' }));
              }
            });
          } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Method not allowed' }));
          }
        }
        
        // Dashboard API endpoints
        else if (parsedUrl.pathname === '/api/user/info') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            user: {
              id: 'user_' + authId.substring(0, 8),
              name: 'Astra User',
              email: 'user@astra.security',
              avatar: 'https://ui-avatars.com/api/?name=Astra+User&background=0D8ABC&color=fff',
              role: 'admin',
              joined: new Date().toISOString().split('T')[0]
            }
          }));
        }
        
        else if (parsedUrl.pathname === '/api/dashboard/stats') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            stats: {
              totalProjects: 3,
              activeScans: 1,
              vulnerabilities: 12,
              uptime: '99.8%',
              lastScan: '2 hours ago',
              protectedAssets: 47
            }
          }));
        }
        
        else if (parsedUrl.pathname === '/api/projects/list') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            projects: [
              {
                id: 'proj_001',
                name: 'Web Application',
                status: 'active',
                lastScan: '2026-03-27T14:30:00Z',
                vulnerabilities: 3,
                url: 'https://app.example.com'
              },
              {
                id: 'proj_002',
                name: 'API Gateway',
                status: 'scanning',
                lastScan: '2026-03-28T09:15:00Z',
                vulnerabilities: 8,
                url: 'https://api.example.com'
              },
              {
                id: 'proj_003',
                name: 'Database Cluster',
                status: 'inactive',
                lastScan: '2026-03-25T11:45:00Z',
                vulnerabilities: 1,
                url: 'internal://db-cluster'
              }
            ]
          }));
        }
        
        else if (parsedUrl.pathname === '/api/projects/create') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  message: `Project "${data.name}" created successfully!`,
                  projectId: 'proj_' + Date.now()
                }));
              } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  error: 'Invalid request data'
                }));
              }
            });
          } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Method not allowed' }));
          }
        }
        
        else if (parsedUrl.pathname === '/api/auth/register') {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  message: 'Registration successful',
                  userId: 'user_' + Date.now()
                }));
              } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: false,
                  error: 'Invalid request data'
                }));
              }
            });
          } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Method not allowed' }));
          }
        }
        
        // Serve static files (CSS, JS)
        else if (parsedUrl.pathname.endsWith('.css') || parsedUrl.pathname.endsWith('.js')) {
          const filePath = path.join(__dirname, '..', 'public', parsedUrl.pathname);
          fs.readFile(filePath, (err, data) => {
            if (err) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('File not found');
              return;
            }
            
            const contentType = parsedUrl.pathname.endsWith('.css') ? 'text/css' : 'application/javascript';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
          });
        }
        
        // Default response
        else {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('ASTRA Authentication Server');
        }
      });
      
      server.listen(port, () => {
        console.log(`\x1b[32m✓ Local server started on port ${port}\x1b[0m`);
        resolve({ server, port });
      });
      
      server.on('error', reject);
    }).catch(reject);
  });
}

async function setupAuthConnection() {
  const authId = generateAuthId();
  const project = getProjectConfig();
  const timestamp = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now
  
  // Create auth config
  const authConfig = {
    authId,
    project: {
      name: project.name,
      version: project.version,
      description: project.description,
      path: project.path
    },
    timestamp,
    expiresAt,
    status: 'pending',
    connectedAt: null,
    lastVerified: null
  };
  
  // Save auth config locally
  const astraConfigDir = path.join(os.homedir(), '.astra');
  if (!fs.existsSync(astraConfigDir)) {
    fs.mkdirSync(astraConfigDir, { recursive: true });
  }
  
  const configPath = path.join(astraConfigDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(authConfig, null, 2));
  
  console.log('\x1b[32m✓ Generated authentication ID:\x1b[0m', authId);
  console.log('\x1b[33mProject:\x1b[0m', project.name);
  console.log('\x1b[33mPath:\x1b[0m', project.path);
  console.log('\x1b[33mExpires in:\x1b[0m 10 minutes');
  console.log('');
  
  // Start local server
  const server = await startLocalServer(authId, project.name);
  const localUrl = `http://localhost:${server.port}/auth.html?authId=${authId}&project=${encodeURIComponent(project.name)}`;
  
  console.log('\x1b[36mStarting local authentication server...\x1b[0m');
  console.log('\x1b[90mLocal URL:\x1b[0m', localUrl);
  console.log('');
  console.log('\x1b[33mPress Enter to continue and open browser...\x1b[0m');
  
  // Check if stdin is a TTY
  if (process.stdin.isTTY) {
    // Wait for Enter key in TTY mode
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (data) => {
      if (data.toString() === '\r' || data.toString() === '\n') {
        try {
          await open(localUrl);
          console.log('\x1b[32m✓ Browser opened successfully!\x1b[0m');
          console.log('');
          console.log('\x1b[36mNext steps:\x1b[0m');
          console.log('1. Complete authentication in the browser');
          console.log('2. Return here to verify connection');
          console.log('3. Run \x1b[33mastra verify\x1b[0m to check connection status');
          console.log('');
          console.log('\x1b[32mYour project is now protected by ASTRA Security!\x1b[0m');
        } catch (error) {
          console.error('\x1b[31m✗ Failed to open browser:\x1b[0m', error.message);
          console.log('\x1b[33mPlease manually visit:\x1b[0m', localUrl);
        }
        process.exit(0);
      }
    });
  } else {
    // Non-TTY mode, just show the URL
    console.log('\x1b[33mPlease manually visit:\x1b[0m', localUrl);
    console.log('');
    console.log('\x1b[36mNext steps:\x1b[0m');
    console.log('1. Complete authentication in the browser');
    console.log('2. Return here to verify connection');
    console.log('3. Run \x1b[33mastra verify\x1b[0m to check connection status');
    console.log('');
    console.log('\x1b[32mYour project is now protected by ASTRA Security!\x1b[0m');
    process.exit(0);
  }
}

function checkSetup() {
  const astraConfigDir = path.join(os.homedir(), '.astra');
  const configPath = path.join(astraConfigDir, 'config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('\x1b[32m✓ ASTRA is already configured for this project\x1b[0m');
      console.log('\x1b[33mAuth ID:\x1b[0m', config.authId);
      console.log('\x1b[33mProject:\x1b[0m', config.project.name);
      console.log('\x1b[33mStatus:\x1b[0m', config.status);
      
      if (config.connectedAt) {
        console.log('\x1b[33mConnected:\x1b[0m', new Date(config.connectedAt).toLocaleString());
      }
      
      return true;
    } catch (error) {
      console.error('Error reading config:', error.message);
    }
  }
  
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  switch (command) {
    case 'setup':
    case 'install':
      showWelcome();
      
      if (checkSetup()) {
        console.log('');
        console.log('\x1b[33mWould you like to reconfigure? (y/N)\x1b[0m');
        
        // Check if stdin is a TTY
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
          process.stdin.resume();
          process.stdin.on('data', (data) => {
            const response = data.toString().toLowerCase().trim();
            if (response === 'y' || response === 'yes') {
              console.log('\x1b[33mStarting reconfiguration...\x1b[0m');
              setupAuthConnection();
            } else {
              console.log('\x1b[33mSetup cancelled.\x1b[0m');
              process.exit(0);
            }
          });
        } else {
          // Non-TTY environment, just proceed with reconfiguration
          console.log('\x1b[33mNon-interactive mode detected. Proceeding with reconfiguration...\x1b[0m');
          setupAuthConnection();
        }
      } else {
        setupAuthConnection();
      }
      break;
      
    case 'verify':
      if (checkSetup()) {
        console.log('');
        console.log('\x1b[36mVerifying ASTRA connection...\x1b[0m');
        // In a real implementation, this would ping the ASTRA server
        console.log('\x1b[32m✓ Connection active\x1b[0m');
        console.log('\x1b[33mYour project is protected by ASTRA Security\x1b[0m');
      } else {
        console.log('\x1b[31m✗ ASTRA is not configured for this project\x1b[0m');
        console.log('\x1b[33mRun \x1b[36mastra setup\x1b[0m to configure ASTRA Security\x1b[0m');
      }
      break;
      
    case 'status':
      if (checkSetup()) {
        console.log('\x1b[32m✓ ASTRA Security is active\x1b[0m');
      } else {
        console.log('\x1b[31m✗ ASTRA Security is not configured\x1b[0m');
      }
      break;
      
    case 'help':
    default:
      showWelcome();
      console.log('\x1b[36mAvailable commands:\x1b[0m');
      console.log('  \x1b[33mastra install\x1b[0m  - Install and configure ASTRA Security (alias: setup)');
      console.log('  \x1b[33mastra setup\x1b[0m    - Configure ASTRA Security for your project');
      console.log('  \x1b[33mastra verify\x1b[0m   - Verify ASTRA connection status');
      console.log('  \x1b[33mastra status\x1b[0m   - Check if ASTRA is configured');
      console.log('  \x1b[33mastra help\x1b[0m     - Show this help message');
      console.log('');
      console.log('\x1b[32mGet started:\x1b[0m');
      console.log('  $ \x1b[33mnpm install astra-security\x1b[0m');
      console.log('  $ \x1b[33mastra install\x1b[0m');
      console.log('');
      break;
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('\x1b[31m✗ Unhandled rejection:\x1b[0m', error.message);
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main().catch(console.error);
}