#!/usr/bin/env node

// Simple setup script that can be run after installation
console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    ASTRA SECURITY SYSTEM                     ║
║           The Invisible Guardian - Human Verification        ║
╚══════════════════════════════════════════════════════════════╝

ASTRA Security has been successfully installed!

Next steps:
1. Run \x1b[36mnpm run build\x1b[0m to compile the TypeScript source
2. Run \x1b[36mastra setup\x1b[0m to configure ASTRA for your project
3. Import ASTRA in your project and start protecting your users

Quick start:
  import { Astra } from 'astra-security';
  
  const astra = new Astra({
    apiKey: 'your-api-key',
    mode: 'development'
  });

Documentation: https://github.com/snarsnat/astra-security
Website: https://astra.security

Thank you for choosing ASTRA Security - protecting humans, not punishing them.
`);