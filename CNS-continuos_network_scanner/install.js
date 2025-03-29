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
const serverFiles = ['app.py', 'README.md'];
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

async function main() {
  try {
    console.log('🚀 Starting installation process...');

    // Install Python dependencies
    console.log('\n📦 Installing Python dependencies...');
    await runCommand('pip', ['install', 'python-nmap']);

    // Start Python server
    console.log('\n🖥️  Starting Python server...');
    const pythonServer = spawn('python', ['server/app.py'], {
      stdio: 'inherit',
      detached: true
    });

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