import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if a command exists
async function checkCommand(command) {
  try {
    const proc = spawn(command, ['--version'], { stdio: 'ignore' });
    return new Promise((resolve) => {
      proc.on('error', () => resolve(false));
      proc.on('close', (code) => resolve(code === 0));
    });
  } catch {
    return false;
  }
}

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { ...options, stdio: ['inherit', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    proc.on('error', (err) => {
      reject(new Error(`Failed to start ${command}: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`${command} failed with code ${code}\n${stderr}`));
      }
    });
  });
}

// Function to check if a port is in use
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Function to check system requirements
async function checkRequirements() {
  const requirements = [
    {
      name: 'Python',
      check: async () => await checkCommand('python') || await checkCommand('python3'),
      message: 'Python is not installed. Please install Python 3.8 or higher.',
    },
    {
      name: 'Nmap',
      check: async () => await checkCommand('nmap'),
      message: 'Nmap is not installed. Please install Nmap using your system package manager.',
      installInstructions: {
        windows: 'Download and install from https://nmap.org/download.html',
        linux: 'sudo apt-get install nmap  # For Debian/Ubuntu\nsudo yum install nmap  # For RHEL/CentOS',
        darwin: 'brew install nmap',
      },
    },
    {
      name: 'pip',
      check: async () => await checkCommand('pip') || await checkCommand('pip3'),
      message: 'pip is not installed. Please install pip (Python package manager).',
    },
  ];

  const failedRequirements = [];
  
  for (const req of requirements) {
    const isAvailable = await req.check();
    if (!isAvailable) {
      failedRequirements.push(req);
    }
  }

  return failedRequirements;
}

async function startPythonServer() {
  return new Promise((resolve, reject) => {
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    const server = spawn(pythonCommand, ['server/app.py'], {
      stdio: 'inherit',
      detached: true,
    });

    server.on('error', (err) => {
      reject(new Error(`Failed to start Python server: ${err.message}`));
    });

    // Wait for server to start
    setTimeout(() => {
      if (server.pid) {
        resolve(server);
      } else {
        reject(new Error('Failed to start Python server'));
      }
    }, 2000);
  });
}

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

async function main() {
  try {
    console.log('🔍 Checking system requirements...');
    
    const failedRequirements = await checkRequirements();
    if (failedRequirements.length > 0) {
      console.error('\n❌ Missing requirements:');
      failedRequirements.forEach(req => {
        console.error(`\n${req.name}:`);
        console.error(req.message);
        if (req.installInstructions) {
          console.error('\nInstallation instructions:');
          const platform = process.platform;
          console.error(req.installInstructions[platform] || req.installInstructions.linux);
        }
      });
      process.exit(1);
    }

    console.log('✅ All system requirements met');

    // Check if ports are available
    console.log('\n🔍 Checking port availability...');
    const ports = [
      { port: 5000, service: 'Python API' },
      { port: 5173, service: 'Development server' },
    ];

    for (const { port, service } of ports) {
      const inUse = await isPortInUse(port);
      if (inUse) {
        throw new Error(`Port ${port} is already in use. Please free up the port for ${service} and try again.`);
      }
    }

    console.log('✅ Required ports are available');

    // Install Python dependencies
    console.log('\n📦 Installing Python dependencies...');
    try {
      await runCommand('pip', ['install', '-r', 'server/requirements.txt']);
      console.log('✅ Python dependencies installed successfully');
    } catch (error) {
      throw new Error(`Failed to install Python dependencies: ${error.message}`);
    }

    // Start Python server
    console.log('\n🖥️  Starting Python server...');
    const pythonServer = await startPythonServer();

    if (!pythonServer.pid) {
      throw new Error('Failed to get Python server PID');
    }

    // Keep track of the server PID
    fs.writeFileSync('.server-pid', pythonServer.pid.toString());
    console.log('✅ Python server started successfully');

    console.log('\n🌐 Starting development server...');
    console.log('\nApplication will be available at:');
    console.log('- Local server: http://localhost:5173');
    console.log('\nPython API running at: http://localhost:5000');
    
    // Start the development server
    await runCommand('npm', ['run', 'dev']);

  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    if (error.message.includes('EACCES') || error.message.includes('permission denied')) {
      console.error('\nThis error might be due to insufficient permissions.');
      console.error('Try running the command with sudo (Linux/macOS) or as Administrator (Windows).');
    }
    process.exit(1);
  }
}

main();