#!/usr/bin/env python3
"""
Network Scanner Game - A retro-style hacking game interface for simulating network scans
"""
import sys
import random
import time
import os
import nmap
import ipaddress

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    WHITE = '\033[97m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    BLACK_BG = '\033[40m'
    GREEN_BG = '\033[42m'
    BLUE_BG = '\033[44m'

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if sys.platform.lower() == 'windows' else 'clear')

def typewriter_effect(text, delay=0.02):
    """Print text with a typewriter effect"""
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    print()

def hacker_animation(duration=2):
    """Display a fake hacking animation"""
    start_time = time.time()
    while time.time() - start_time < duration:
        line = "".join(random.choice("0123456789ABCDEF") + " " for _ in range(random.randint(50, 80)))
        print(f"{random.choice([Colors.GREEN, Colors.CYAN, Colors.RED])}{line}{Colors.ENDC}", end="\r")
        time.sleep(0.05)
    print(" " * 100, end="\r")

def loading_effect(text, duration=2):
    """Show a loading effect with dots"""
    for _ in range(duration):
        for dots in [".  ", ".. ", "..."]:
            print(f"\r{Colors.YELLOW}{text}{dots}{Colors.ENDC}", end="")
            time.sleep(0.5)
    print()

def loading_bar(total, current, width=50):
    """Display a retro-style loading bar"""
    percent = current / total
    filled_width = int(width * percent)
    bar = f"{Colors.GREEN_BG}{'█' * filled_width}{Colors.BLACK_BG}{' ' * (width - filled_width)}{Colors.ENDC}"
    return f"[{bar}] {int(percent * 100)}%"

def display_banner():
    """Display a fun retro gaming banner with animation"""
    clear_screen()
    banner = f"""
{Colors.CYAN}
  ____  _   _    _    ____ _  __    _    ____  _   _    _    _   _ ____  ____  
 / ___|| | | |  / \\  / ___| |/ /   / \\  |  _ \\| | | |  / \\  | | | |  _ \\/ ___| 
 \\___ \\| |_| | / _ \\| |   | ' /   / _ \\ | |_) | |_| | / _ \\ | | | | |_) \\___ \\ 
  ___) |  _  |/ ___ \\ |___| . \\  / ___ \\|  __/|  _  |/ ___ \\| |_| |  __/ ___) |
 |____/|_| |_/_/   \\_\\____|_|\\_\\/_/   \\_\\_|   |_| |_/_/   \\_\\____/|_|   |____/ 
{Colors.ENDC}
    """
    for _ in range(2):  # Flashes the banner
        typewriter_effect(banner, delay=0.001)
        time.sleep(0.3)
        clear_screen()
        time.sleep(0.2)
    typewriter_effect(banner, delay=0.001)

def get_service_name(port):
    """Get service name for a port number"""
    common_ports = {
        21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "dns",
        80: "http", 110: "pop3", 143: "imap", 443: "https", 445: "smb",
        3306: "mysql", 3389: "rdp", 5432: "postgresql", 8080: "http-proxy"
    }
    return common_ports.get(port, "unknown")

def generate_ip_range(network_str):
    """Generate a list of IP addresses from a network string"""
    try:
        network = ipaddress.ip_network(network_str, strict=False)
        return [str(ip) for ip in network.hosts()]
    except ValueError:
        return [f"192.168.1.{i}" for i in range(1, 11)]  # Fallback range

def scan_network(ip_range, ports):
    """Scan the network and return results"""
    nm = nmap.PortScanner()
    hosts_up = 0
    total_open_ports = 0
    results = []
    total_hosts = len(ip_range)

    for i, ip in enumerate(ip_range):
        progress_bar = loading_bar(total_hosts, i + 1)
        print(f"\r{Colors.BOLD}SCANNING TARGET: {ip} {progress_bar}{Colors.ENDC}", end="")

        open_ports = []
        try:
            nm.scan(ip, arguments='-sP')
            if ip in nm.all_hosts() and nm[ip].state() == 'up':
                hosts_up += 1
                nm.scan(ip, arguments=f'-p {",".join(map(str, ports))} -sS -sV -O')
                for port in ports:
                    if nm[ip].has_tcp(port) and nm[ip]['tcp'][port]['state'] == 'open':
                        open_ports.append(port)
                        results.append((ip, port, get_service_name(port)))
                total_open_ports += len(open_ports)
        except Exception as e:
            print(f"\n{Colors.RED}ERROR SCANNING {ip}: {e}{Colors.ENDC}")

    print("\r" + " " * 100 + "\r", end="")  # Clear progress bar
    return hosts_up, total_open_ports, results

def main():
    display_banner()
    
    while True:
        choice = input(f"\n{Colors.YELLOW}SELECT OPTION: 1. START SCAN  2. EXIT {Colors.ENDC} ")
        if choice == "2":
            typewriter_effect(f"\n{Colors.RED}EXITING SYSTEM...{Colors.ENDC}")
            break

        if choice == "1":
            clear_screen()
            network = input(f"\n{Colors.GREEN}ENTER TARGET NETWORK (e.g., 192.168.1.0/24):{Colors.ENDC} ")
            ip_range = generate_ip_range(network)

            port_range = input(f"\n{Colors.GREEN}ENTER PORT RANGE (e.g., 1-1024) OR 'common':{Colors.ENDC} ")
            ports = [21, 22, 23, 25, 53, 80, 110, 443, 445, 3306, 3389, 8080] if port_range.lower() == 'common' else list(range(*map(int, port_range.split('-'))))

            loading_effect("Initializing scanner", 3)
            hacker_animation(3)
            loading_effect("Bypassing firewalls", 2)

            start_time = time.time()
            hosts_up, total_open_ports, results = scan_network(ip_range, ports)
            duration = time.time() - start_time

            typewriter_effect(f"\n{Colors.GREEN}SCAN COMPLETE!{Colors.ENDC}")

            for ip, port, service in results:
                typewriter_effect(f"{Colors.GREEN}{ip:<17} {Colors.YELLOW}{port:<10} {Colors.CYAN}{service:<15}{Colors.ENDC}", delay=0.01)

            print(f"\n{Colors.GREEN}HOSTS UP: {hosts_up} | TOTAL OPEN PORTS: {total_open_ports} | TIME: {duration:.2f}s{Colors.ENDC}")


            def save_results_to_file(results, filename="IP_reconnaissance.txt"):
                """Save scan results to a file"""
                with open(filename, 'w') as file:
                    file.write("IP Address       Port       Service\n")
                    file.write("="*40 + "\n")
                    for ip, port, service in results:
                        file.write(f"{ip:<17} {port:<10} {service:<15}\n")
                print(f"\n{Colors.GREEN}Results saved to {filename}{Colors.ENDC}")

            # Save results to file after scan
            save_results_to_file(results)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}ABORTED BY USER.{Colors.ENDC}")