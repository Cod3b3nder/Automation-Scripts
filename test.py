#!/usr/bin/env python3
"""
🚀 Retro Local Network Scanner
📌 Ethical hacking tool for pentesters
"""
import sys
import random
import time
import os
try:
    import nmap
except ImportError:
    print(f"{Colors.RED}Error: The 'nmap' module is not installed. Please install it using 'pip install python-nmap'.{Colors.ENDC}")
    sys.exit(1)
import socket

# ANSI color codes for retro aesthetics
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    BLUE = '\033[94m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    ENDC = '\033[0m'

# Clear the terminal screen
def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

# Typewriter animation for text
def typewriter_effect(text, delay=0.02):
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

# Cool ASCII Art Banner
def display_banner():
    clear_screen()
    banner = f"""
{Colors.GREEN}
  ███╗   ██╗███╗   ███╗ █████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗
  ████╗  ██║████╗ ████║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝
  ██╔██╗ ██║██╔████╔██║███████║██████╔╝███████║██║  ██║█████╔╝ 
  ██║╚██╗██║██║╚██╔╝██║██╔══██║██╔═══╝ ██╔══██║██║  ██║██╔═██╗ 
  ██║ ╚████║██║ ╚═╝ ██║██║  ██║██║     ██║  ██║██████╔╝██║  ██╗
  ╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝
  {Colors.YELLOW}ETHICAL HACKER NETWORK SCANNER{Colors.ENDC}
"""
    start_time = time.time()
    choices = "0123456789ABCDEF"
    colors = [Colors.GREEN, Colors.CYAN, Colors.RED]
    while time.time() - start_time < duration:
        length = random.randint(50, 80)
        line = "".join(random.choice(choices) + " " for _ in range(length))
        print(f"{random.choice(colors)}{line}{Colors.ENDC}", end="\r")
        time.sleep(0.05)
    print(" " * 100, end="\r")
    line = "".join(random.choice(choices) + " " for _ in range(length))
    print(f"{random.choice(colors)}{line}{Colors.ENDC}", end="\r")
    time.sleep(0.05)
    print(" " * 100, end="\r")

# Progress bar animation
def loading_effect(text, duration=3):
    for _ in range(duration):
        for dots in [".  ", ".. ", "..."]:
            print(f"\r{Colors.YELLOW}{text}{dots}{Colors.ENDC}", end="")
# Get the local network IP range
def get_local_network():
    hostname = socket.gethostname()
    local_ip = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
    
    ipv4 = None
    ipv6 = None
    
    for info in local_ip:
        if info[0] == socket.AF_INET:
            ipv4 = info[4][0]
        elif info[0] == socket.AF_INET6:
            ipv6 = info[4][0]
    
    if ipv4:
        base_ip = ".".join(ipv4.split(".")[:-1])  # Get base network (e.g., 192.168.1)
        return f"{base_ip}.0/24"  # Scan full subnet
    elif ipv6:
        base_ip = ":".join(ipv6.split(":")[:-1])  # Get base network (e.g., fe80::1)
        return f"{base_ip}::/64"  # Scan full subnet
    else:
        print(f"{Colors.RED}Error: No valid IP address found.{Colors.ENDC}")
        sys.exit(1)
    local_ip = socket.gethostbyname(hostname)
    base_ip = ".".join(local_ip.split(".")[:-1])  # Get base network (e.g., 192.168.1)
    return f"{base_ip}.0/24"  # Scan full subnet

# Get known vulnerabilities based on open ports
def check_vulnerabilities(port):
    vulns = {
        22: "SSH Brute Force Attack Risk",
        23: "Telnet Unencrypted Login Risk",
        25: "SMTP Open Relay Exploit",
        53: "DNS Cache Poisoning Risk",
        80: "HTTP Web Server Vulnerabilities",
        110: "POP3 Password Harvesting",
        443: "HTTPS SSL/TLS Vulnerabilities",
        445: "SMB EternalBlue Exploit",
        3306: "MySQL Weak Authentication",
        3389: "RDP Exploit for Remote Access",
        8080: "Proxy Server Exploit",
    }
    return vulns.get(port, "No known vulnerabilities")

# Scan the local network for active devices
def scan_local_network(network):
    nm = nmap.PortScanner()
    typewriter_effect(f"\n{Colors.YELLOW}SCANNING LOCAL NETWORK: {network}{Colors.ENDC}")
    loading_effect("Deploying Recon Modules", 3)
    hacker_animation(3)

    # First, perform a ping scan to find live hosts
    try:
        nm.scan(hosts=network, arguments='-sn')
    except nmap.PortScannerError as e:
        print(f"{Colors.RED}PortScannerError: {e}{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print(f"{Colors.RED}Unexpected error: {e}{Colors.ENDC}")
        sys.exit(1)

    live_hosts = [host for host in nm.all_hosts() if nm[host].state() == 'up']
    if not live_hosts:
        print(f"{Colors.RED}No live hosts found on the network.{Colors.ENDC}")
        return []

    results = []
    for host in live_hosts:
        try:
            nm.scan(hosts=host, arguments='-p 1-1024 -sS -T4')
            if 'tcp' in nm[host]:
                open_ports = [p for p in nm[host]['tcp'] if nm[host]['tcp'][p]['state'] == 'open']
                results.append((host, open_ports))
        except nmap.PortScannerError as e:
            print(f"{Colors.RED}PortScannerError: {e}{Colors.ENDC}")
        except Exception as e:
            print(f"{Colors.RED}Unexpected error: {e}{Colors.ENDC}")

    return results

# Display scan results
def display_results(results):
    print(f"\n{Colors.CYAN}{'='*50}{Colors.ENDC}")
    print(f"{Colors.BOLD}IP ADDRESS       OPEN PORTS      VULNERABILITIES{Colors.ENDC}")
    print(f"{Colors.CYAN}{'='*50}{Colors.ENDC}")

    for ip, ports in results:
        for port in ports:
            vulnerability = check_vulnerabilities(port)
            print(f"{Colors.GREEN}{ip:<15} {Colors.YELLOW}{port:<10} {Colors.RED}{vulnerability}{Colors.ENDC}")
            time.sleep(0.02)  # Slow reveal effect

    print(f"\n{Colors.CYAN}{'='*50}{Colors.ENDC}")
    network = get_local_network()
    while True:
        port_range = input(f"{Colors.YELLOW}Enter port range to scan (e.g., 1-1024): {Colors.ENDC}")
        if '-' in port_range and all(part.isdigit() for part in port_range.split('-')):
            break
        else:
            print(f"{Colors.RED}Invalid port range. Please enter a valid range (e.g., 1-1024).{Colors.ENDC}")
    results = scan_local_network(network, port_range)
# Save results to a file
def save_results(results, filename="scan_results.txt"):
    if os.path.exists(filename):
        overwrite = input(f"{Colors.YELLOW}File {filename} already exists. Overwrite? (y/n): {Colors.ENDC}").lower()
        if overwrite != 'y':
            print(f"{Colors.RED}Results not saved to avoid overwriting existing file.{Colors.ENDC}")
            return

    with open(filename, 'w') as file:
        file.write("IP Address       Open Ports       Vulnerabilities\n")
        file.write("="*50 + "\n")
        for ip, ports in results:
            for port in ports:
                file.write(f"{ip:<15} {port:<10} {check_vulnerabilities(port)}\n")
    print(f"{Colors.GREEN}Results saved to {filename}{Colors.ENDC}")

# Main function
def main():
    display_banner()
    network = get_local_network()
    
    # Start scanning
    results = scan_local_network(network)

    # Display results
    if results:
        typewriter_effect(f"\n{Colors.GREEN}SCAN COMPLETE! DEVICES DISCOVERED:{Colors.ENDC}")
        display_results(results)
        
        # Ask to save results
        save_choice = input(f"\n{Colors.YELLOW}Save results to file? (y/n): {Colors.ENDC}").lower()
if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}Scan Aborted by User.{Colors.ENDC}")
    except Exception as e:
        print(f"\n{Colors.RED}An unexpected error occurred: {e}{Colors.ENDC}")ors.ENDC}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}Scan Aborted by User.{Colors.ENDC}")