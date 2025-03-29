import http.server
import socketserver
import json
import os
import socket
import struct
import threading
import time
import logging
import platform
import nmap
from pathlib import Path
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('network_monitor.log'),
        logging.StreamHandler()
    ]
)

class NetworkScanner:
    def __init__(self):
        self.last_scan = 0
        self.scan_interval = 30  # seconds
        self.rate_limit = 100  # requests per scan
        self._lock = threading.Lock()
        self._cache = {}
        self.nm = nmap.PortScanner()

    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system metrics."""
        try:
            with os.popen('wmic cpu get loadpercentage') as p:
                cpu = int(p.read().split('\n')[1]) if platform.system() == 'Windows' else 0
            
            mem = os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES')
            mem_free = os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_AVPHYS_PAGES')
            mem_used = mem - mem_free
            
            return {
                'cpu_usage': cpu,
                'memory_total': mem,
                'memory_used': mem_used,
                'memory_free': mem_free
            }
        except Exception as e:
            logging.error(f"Error getting system metrics: {e}")
            return {}

    def perform_nmap_scan(self, target: str) -> Dict[str, Any]:
        """Perform detailed Nmap scan on a target."""
        try:
            # Perform OS and version detection
            self.nm.scan(target, arguments='-sS -sV -O --version-intensity 5')
            
            if target not in self.nm.all_hosts():
                return None

            host_info = self.nm[target]
            
            # Extract OS details
            os_info = {
                'name': 'Unknown',
                'accuracy': 0,
                'family': 'Unknown'
            }
            
            if 'osmatch' in host_info:
                best_match = host_info['osmatch'][0]
                os_info = {
                    'name': best_match['name'],
                    'accuracy': best_match['accuracy'],
                    'family': best_match['osclass'][0]['osfamily']
                }

            # Extract port and service information
            ports_info = []
            if 'tcp' in host_info:
                for port, data in host_info['tcp'].items():
                    ports_info.append({
                        'port': port,
                        'state': data['state'],
                        'service': data['name'],
                        'version': data['version'],
                        'product': data['product']
                    })

            return {
                'os': os_info,
                'ports': ports_info,
                'status': host_info['status']['state']
            }
            
        except Exception as e:
            logging.error(f"Error during Nmap scan of {target}: {e}")
            return None

    def scan_network(self) -> Dict[str, Any]:
        """Perform network scan."""
        current_time = time.time()
        
        # Rate limiting
        if current_time - self.last_scan < self.scan_interval:
            return self._cache
            
        with self._lock:
            try:
                devices = []
                
                # Get local network information
                hostname = socket.gethostname()
                local_ip = socket.gethostbyname(hostname)
                network_prefix = '.'.join(local_ip.split('.')[:-1])
                
                # Perform initial fast ping scan
                self.nm.scan(f"{network_prefix}.0/24", arguments='-sn')
                hosts = self.nm.all_hosts()
                
                # Detailed scan of discovered hosts
                for host in hosts[:self.rate_limit]:
                    try:
                        # Try to resolve hostname
                        try:
                            hostname = socket.gethostbyaddr(host)[0]
                        except socket.herror:
                            hostname = "Unknown"
                        
                        # Perform detailed scan
                        scan_result = self.perform_nmap_scan(host)
                        if scan_result:
                            devices.append({
                                'ip': host,
                                'hostname': hostname,
                                'os': scan_result['os'],
                                'ports': scan_result['ports'],
                                'status': scan_result['status'],
                                'last_seen': time.time()
                            })
                            
                    except Exception as e:
                        logging.error(f"Error scanning host {host}: {e}")
                        continue
                
                self._cache = {
                    'devices': devices,
                    'metrics': self.get_system_metrics(),
                    'timestamp': current_time
                }
                self.last_scan = current_time
                
                return self._cache
                
            except Exception as e:
                logging.error(f"Error during network scan: {e}")
                return self._cache

class NetworkMonitorHandler(http.server.SimpleHTTPRequestHandler):
    scanner = NetworkScanner()
    
    def send_cors_headers(self):
        """Send CORS headers."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        """Handle OPTIONS request."""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET request."""
        if self.path == '/api/network':
            try:
                data = self.scanner.scan_network()
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
            except Exception as e:
                logging.error(f"Error handling request: {e}")
                self.send_error(500, "Internal Server Error")
        else:
            self.send_error(404, "Not Found")

def run_server(port: int = 5000):
    """Run the network monitoring server."""
    try:
        with socketserver.TCPServer(("", port), NetworkMonitorHandler) as httpd:
            logging.info(f"Server running on port {port}")
            httpd.serve_forever()
    except Exception as e:
        logging.error(f"Server error: {e}")
        raise

if __name__ == "__main__":
    run_server()