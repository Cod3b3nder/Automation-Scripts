#!/usr/bin/env python3
"""
🚀 Retro Local Network Scanner
📌 Ethical hacking tool for pentesters
"""
import sys
import random
import time
import os
import nmap
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
    typewriter_effect(banner, delay=0.001)

# Simulated hacking animation
def hacker_animation(duration=2):
    start_time = time.time()
    while time.time() - start_time < duration:
        line = "".join(random.choice("0123456789ABCDEF") + " " for _ in range(random.randint(50, 80)))
        print(f"{random.choice([Colors.GREEN, Colors.CYAN, Colors.RED])}{line}{Colors.ENDC}", end="\r")
        time.sleep(0.05)
    print(" " * 100, end="\r")

# Progress bar animation
def loading_effect(text, duration=3):
    for _ in range(duration):
        for dots in [".  ", ".. ", "..."]:
            print(f"\r{Colors.YELLOW}{text}{dots}{Colors.ENDC}", end="")
            time.sleep(0.5)
    print()

# Get the local network IP range and router IP
def get_local_network():
    # Create a dummy connection to an external server to get the local IP address
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Use Google's public DNS server to determine the local IP address
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
    except Exception as e:
        print(f"{Colors.RED}Error obtaining local IP address: {e}{Colors.ENDC}")
        sys.exit(1)
    finally:
        s.close()

    base_ip = ".".join(local_ip.split(".")[:-1])  # Get base network (e.g., 192.168.1)
    router_ip = f"{base_ip}.1"  # Assuming the router IP is the first IP in the subnet
    return f"{base_ip}.0/24", router_ip  # Scan full subnet and return router IP

# Get known vulnerabilities based on open ports
def check_vulnerabilities(port):
    vulns = {
        21: "FTP Vulnerable to Anonymous Login",
        22: "SSH Brute Force Attack Risk",
        23: "Telnet Unencrypted Login Risk",
        25: "SMTP Open Relay Exploit",
        53: "DNS Cache Poisoning Risk",
        80: "HTTP Web Server Vulnerabilities",
        110: "POP3 Password Harvesting",
        139: "NetBIOS Exploit",
        443: "HTTPS SSL/TLS Vulnerabilities",
        445: "SMB EternalBlue Exploit",
        3306: "MySQL Weak Authentication",
        3389: "RDP Exploit for Remote Access",
        8080: "Proxy Server Exploit",
    }
    return vulns.get(port, "No known vulnerabilities")

# Scan the local network for active devices
def scan_local_network(network, port_range):
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
            nm.scan(hosts=host, arguments=f'-p {port_range} -sS -T4')
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
    network, router_ip = get_local_network()
    
    # Get port range from user
    while True:
        port_range = input(f"{Colors.YELLOW}Enter port range to scan (e.g., 1-1024): {Colors.ENDC}")
        if '-' in port_range and all(part.isdigit() for part in port_range.split('-')):
            break
        else:
            print(f"{Colors.RED}Invalid port range. Please enter a valid range (e.g., 1-1024).{Colors.ENDC}")
    
    # Start scanning
    results = scan_local_network(network, port_range)

    # Scan the router IP address
    router_results = scan_local_network(router_ip, port_range)
    results.extend(router_results)

    # Display results
    if results:
        typewriter_effect(f"\n{Colors.GREEN}SCAN COMPLETE! DEVICES DISCOVERED:{Colors.ENDC}")
        display_results(results)
        
        # Ask to save results
        save_choice = input(f"\n{Colors.YELLOW}Save results to file? (y/n): {Colors.ENDC}").lower()
        if save_choice == 'y':
            save_results(results)

    else:
        print(f"\n{Colors.RED}No devices found on the network.{Colors.ENDC}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}Scan Aborted by User.{Colors.ENDC}")
    except Exception as e:
        print(f"\n{Colors.RED}An unexpected error occurred: {e}{Colors.ENDC}")