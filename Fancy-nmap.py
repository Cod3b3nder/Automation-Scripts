#!/usr/bin/env python3
"""
Network Scanner - A tool to scan networks for hosts and open ports
"""
import socket
import subprocess
import sys
import ipaddress
from concurrent.futures import ThreadPoolExecutor
import time

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def is_host_up(ip):
    """Check if host is up using ping"""
    try:
        # Use ping to check if host is up (platform independent)
        param = '-n' if sys.platform.lower() == 'windows' else '-c'
        command = ['ping', param, '1', '-W', '1', str(ip)]
        return subprocess.call(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0
    except Exception:
        return False

def scan_port(ip, port):
    """Scan a specific port on an IP address"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(0.5)
    result = sock.connect_ex((str(ip), port))
    sock.close()
    return port if result == 0 else None

def scan_ports(ip, ports):
    """Scan multiple ports on an IP address"""
    open_ports = []
    with ThreadPoolExecutor(max_workers=50) as executor:
        results = executor.map(lambda port: scan_port(ip, port), ports)
        for port in results:
            if port:
                open_ports.append(port)
    return open_ports

def get_service_name(port):
    """Get service name for a port number"""
    try:
        return socket.getservbyport(port)
    except:
        return "unknown"

def print_header():
    """Print the scanner header"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}╔═══════════════════════════════════════════════╗{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}║           NETWORK SCANNER TOOL                ║{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}╚═══════════════════════════════════════════════╝{Colors.ENDC}\n")

def print_table_header():
    """Print the results table header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}╔═══════════════════╦═══════════════╦═══════════════════════╗{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}║ {Colors.CYAN}IP Address       {Colors.BLUE}║ {Colors.CYAN}Open Port      {Colors.BLUE}║ {Colors.CYAN}Service              {Colors.BLUE}║{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}╠═══════════════════╬═══════════════╬═══════════════════════╣{Colors.ENDC}")

def print_table_footer():
    """Print the results table footer"""
    print(f"{Colors.BOLD}{Colors.BLUE}╚═══════════════════╩═══════════════╩═══════════════════════╝{Colors.ENDC}\n")

def print_result_row(ip, port, service):
    """Print a row in the results table"""
    print(f"{Colors.BOLD}{Colors.BLUE}║ {Colors.GREEN}{ip:<17}{Colors.BLUE} ║ {Colors.YELLOW}{port:<15}{Colors.BLUE} ║ {Colors.CYAN}{service:<21}{Colors.BLUE} ║{Colors.ENDC}")

def main():
    print_header()
    
    # Get network range from user
    while True:
        try:
            network = input(f"{Colors.BOLD}Enter network range (e.g., 192.168.1.0/24): {Colors.ENDC}")
            network = ipaddress.ip_network(network, strict=False)
            break
        except ValueError:
            print(f"{Colors.RED}Invalid network range. Please try again.{Colors.ENDC}")
    
    # Get port range from user
    while True:
        try:
            port_range = input(f"{Colors.BOLD}Enter port range (e.g., 1-1024) or common for common ports: {Colors.ENDC}")
            
            if port_range.lower() == 'common':
                # Common ports to scan
                ports = [21, 22, 23, 25, 53, 80, 110, 115, 135, 139, 143, 194, 443, 445, 1433, 3306, 3389, 5632, 5900, 8080]
            else:
                start_port, end_port = map(int, port_range.split('-'))
                if start_port < 1 or end_port > 65535 or start_port > end_port:
                    raise ValueError
                ports = range(start_port, end_port + 1)
            break
        except ValueError:
            print(f"{Colors.RED}Invalid port range. Please try again.{Colors.ENDC}")
    
    print(f"\n{Colors.BOLD}Scanning network {network} for {len(list(ports))} ports...{Colors.ENDC}")
    
    # Track statistics
    start_time = time.time()
    hosts_up = 0
    total_open_ports = 0
    
    # Store results for table display
    results = []
    
    # Scan each host in the network
    total_hosts = len(list(network.hosts()))
    for i, ip in enumerate(network.hosts()):
        # Show progress
        progress = (i + 1) / total_hosts * 100
        print(f"\r{Colors.BOLD}Progress: {progress:.1f}% - Scanning {ip}{Colors.ENDC}", end="")
        
        if is_host_up(ip):
            hosts_up += 1
            open_ports = scan_ports(ip, ports)
            total_open_ports += len(open_ports)
            
            for port in open_ports:
                service = get_service_name(port)
                results.append((str(ip), port, service))
    
    # Clear progress line
    print("\r" + " " * 80 + "\r", end="")
    
    # Print results in a table
    if results:
        print_table_header()
        for ip, port, service in results:
            print_result_row(ip, port, service)
        print_table_footer()
    else:
        print(f"\n{Colors.YELLOW}No open ports found.{Colors.ENDC}")
    
    # Print summary
    duration = time.time() - start_time
    print(f"{Colors.BOLD}Scan completed in {duration:.2f} seconds{Colors.ENDC}")
    print(f"{Colors.BOLD}Hosts up: {Colors.GREEN}{hosts_up}{Colors.ENDC}")
    print(f"{Colors.BOLD}Total open ports: {Colors.YELLOW}{total_open_ports}{Colors.ENDC}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}Scan interrupted by user.{Colors.ENDC}")
    except Exception as e:
        print(f"\n{Colors.RED}An error occurred: {e}{Colors.ENDC}")