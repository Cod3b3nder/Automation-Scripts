# Network Monitor Server

PLEASE ! RUN REQUIREMENTS FIRST AND THEN SUDO NPM INSTALL

This is a Python-based network monitoring server that provides system metrics and advanced network scanning capabilities using Nmap.

## Features

- System metrics collection (CPU, memory usage)
- Advanced network scanning using Nmap:
  - OS detection
  - Service version detection
  - Port state analysis
  - TCP SYN scanning
- Real-time data updates
- Rate limiting and caching
- CORS support for web integration

## Requirements

- Python 3.8 or higher
- Nmap (must be installed on the system)
- python-nmap package

## Installation

1. Install Nmap:
   
   **Windows:**
   - Download and install Nmap from [nmap.org](https://nmap.org/download.html)
   
   **Linux:**
   ```bash
   sudo apt-get install nmap  # Debian/Ubuntu
   sudo yum install nmap      # RHEL/CentOS
   ```
   
   **macOS:**
   ```bash
   brew install nmap
   ```

2. Install python-nmap:
   ```bash
   pip install python-nmap
   ```

3. Clone the repository and navigate to the server directory

## Usage

1. Start the server:
   ```bash
   python app.py
   ```

2. The server will start on port 5000

## API Endpoints

### GET /api/network

Returns network scan results and system metrics:

```json
{
  "devices": [
    {
      "ip": "192.168.1.100",
      "hostname": "device-name",
      "os": {
        "name": "Linux 4.15",
        "accuracy": 95,
        "family": "Linux"
      },
      "ports": [
        {
          "port": 80,
          "state": "open",
          "service": "http",
          "version": "2.4.29",
          "product": "Apache httpd"
        }
      ],
      "status": "up",
      "last_seen": 1647123456.789
    }
  ],
  "metrics": {
    "cpu_usage": 45,
    "memory_total": 16000000000,
    "memory_used": 8000000000,
    "memory_free": 8000000000
  },
  "timestamp": 1647123456.789
}
```

## Security Notes

- The server requires root/administrator privileges for Nmap scanning
- Implements rate limiting to prevent network flooding
- CORS is enabled for web application integration
- Use with caution as network scanning may trigger security systems

## Error Handling

- All operations are wrapped in try-catch blocks
- Errors are logged to `network_monitor.log`
- Failed scans return cached data if available

## Permissions

Nmap requires elevated privileges for certain types of scans. Run the server with appropriate permissions:

**Linux/macOS:**
```bash
npm run setup #Automated installation
sudo python app.py

```

**Windows:**
Run Command Prompt or PowerShell as Administrator, then:
```bash
python app.py
```