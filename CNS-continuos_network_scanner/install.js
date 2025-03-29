import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server directory exists
if (!fs.existsSync('server')) {
  fs.mkdirSync('server');
}

// Copy Python files if they don't exist
const serverFiles = ['app.py', 'README.md', 'requirements.txt'];
serverFiles.forEach(file => {
  const sourcePath = path.join(__dirname, 'server', file);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: ${file} not found in server directory`);
    process.exit(1);
  }
});

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { ...options, stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

// Function to check if a port is in use
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

async function startPythonServer() {
  return new Promise((resolve, reject) => {
    // Check if Python is available
    const pythonServer = spawn('python', ['--version']);
    
    pythonServer.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('Python is not installed. Please install Python and try again.'));
      } else {
        reject(err);
      }
    });

    pythonServer.on('close', (code) => {
      if (code === 0) {
        // Python is available, start the server
        const server = spawn('python', ['server/app.py'], {
          stdio: 'inherit',
          detached: true
        });

        server.on('error', (err) => {
          reject(err);
        });

        // Wait a bit to ensure the server starts properly
        setTimeout(() => {
          if (server.pid) {
            resolve(server);
          } else {
            reject(new Error('Failed to start Python server'));
          }
        }, 2000);
      } else {
        reject(new Error('Python check failed'));
      }
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting installation process...');

    // Check if port 5000 is available
    const portInUse = await isPortInUse(5000);
    if (portInUse) {
      throw new Error('Port 5000 is already in use. Please free up the port and try again.');
    }

    // Install Python dependencies from requirements.txt
    console.log('\n📦 Installing Python dependencies...');
    await runCommand('pip', ['install', '-r', 'server/requirements.txt']);

    // Start Python server
    console.log('\n🖥️  Starting Python server...');
    const pythonServer = await startPythonServer();

    if (!pythonServer.pid) {
      throw new Error('Failed to get Python server PID');
    }

    // Keep track of the server PID
    fs.writeFileSync('.server-pid', pythonServer.pid.toString());

    console.log('\n🌐 Starting development server...');
    console.log('\nApplication will be available at:');
    console.log('- Local server: http://localhost:5173');
    console.log('\nPython API running at: http://localhost:5000');
    
    // Start the development server
    await runCommand('npm', ['run', 'dev']);

  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    process.exit(1);
  }
}

main();