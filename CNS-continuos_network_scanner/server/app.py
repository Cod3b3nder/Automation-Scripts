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
import psutil
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
        self.scanning = False

    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system metrics."""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            return {
                'cpu_usage': cpu_percent,
                'memory_total': memory.total,
                'memory_used': memory.used,
                'memory_free': memory.available
            }
        except Exception as e:
            logging.error(f"Error getting system metrics: {e}")
            return {}

    def get_network_devices(self) -> List[Dict[str, Any]]:
        """Get network devices information."""
        try:
            devices = []
            network_interfaces = psutil.net_if_addrs()
            
            for interface, addrs in network_interfaces.items():
                for addr in addrs:
                    if addr.family == socket.AF_INET:
                        devices.append({
                            'ip': addr.address,
                            'hostname': socket.gethostbyaddr(addr.address)[0],
                            'os': {
                                'name': platform.system(),
                                'accuracy': 100,
                                'family': platform.system()
                            },
                            'ports': [80, 443],  # Example ports
                            'status': 'up',
                            'last_seen': time.time()
                        })
            
            return devices
        except Exception as e:
            logging.error(f"Error getting network devices: {e}")
            return []

    def scan_network(self) -> Dict[str, Any]:
        """Perform network scan."""
        if not self.scanning:
            return {
                'devices': [],
                'metrics': self.get_system_metrics(),
                'timestamp': time.time(),
                'scanning': False
            }

        current_time = time.time()
        
        # Rate limiting
        if current_time - self.last_scan < self.scan_interval:
            return self._cache
            
        with self._lock:
            try:
                devices = self.get_network_devices()
                
                self._cache = {
                    'devices': devices,
                    'metrics': self.get_system_metrics(),
                    'timestamp': current_time,
                    'scanning': self.scanning
                }
                self.last_scan = current_time
                
                return self._cache
                
            except Exception as e:
                logging.error(f"Error during network scan: {e}")
                return self._cache

    def start_scanning(self):
        """Start network scanning."""
        self.scanning = True
        logging.info("Network scanning started")

    def stop_scanning(self):
        """Stop network scanning."""
        self.scanning = False
        logging.info("Network scanning stopped")

class NetworkMonitorHandler(http.server.SimpleHTTPRequestHandler):
    scanner = NetworkScanner()
    
    def send_cors_headers(self):
        """Send CORS headers."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
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

    def do_POST(self):
        """Handle POST request."""
        if self.path == '/api/network/start':
            self.scanner.start_scanning()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'scanning_started'}).encode())
        elif self.path == '/api/network/stop':
            self.scanner.stop_scanning()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'scanning_stopped'}).encode())
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