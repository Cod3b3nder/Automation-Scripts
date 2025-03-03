#!/usr/bin/env python3
"""
Network Scanner Game - A retro-style hacking game interface for simulating network scans
"""
import sys
import random
import time
import os

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
    BLACK_BG = '\033[40m'
    GREEN_BG = '\033[42m'
    BLUE_BG = '\033[44m'

def clear_screen():
    """Clear the terminal screen"""
    os.system('cls' if sys.platform.lower() == 'windows' else 'clear')

def typewriter_effect(text, delay=0.03):
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
        # Generate random hex-like data
        line = ""
        for _ in range(random.randint(50, 80)):
            if random.random() < 0.1:
                line += random.choice(["0x", "0b", "FF", "00", "ERROR", "ACCESS", "DENIED", "GRANTED"])
            else:
                line += random.choice("0123456789ABCDEF") + " "
        
        color = random.choice([Colors.GREEN, Colors.CYAN, Colors.RED])
        print(f"{color}{line}{Colors.ENDC}", end="\r")
        time.sleep(0.05)
    print(" " * 100, end="\r")  # Clear the line

def loading_bar(total, current, width=50):
    """Display a retro-style loading bar"""
    percent = current / total
    filled_width = int(width * percent)
    bar = f"{Colors.GREEN_BG}{' ' * filled_width}{Colors.BLACK_BG}{' ' * (width - filled_width)}{Colors.ENDC}"
    return f"[{bar}] {int(percent * 100)}%"

def simulate_host_scan(ip):
    """Simulate checking if host is up"""
    # Simulate 80% chance of host being up
    return random.random() < 0.8

def simulate_port_scan(ip, ports):
    """Simulate scanning ports on an IP address"""
    open_ports = []
    # Simulate some open ports
    for port in ports:
        # About 10% chance for a port to be open
        if random.random() < 0.1:
            open_ports.append(port)
    return open_ports

def get_service_name(port):
    """Get service name for a port number"""
    common_ports = {
        21: "ftp",
        22: "ssh",
        23: "telnet",
        25: "smtp",
        53: "dns",
        80: "http",
        110: "pop3",
        143: "imap",
        443: "https",
        445: "smb",
        3306: "mysql",
        3389: "rdp",
        5432: "postgresql",
        8080: "http-proxy"
    }
    return common_ports.get(port, "unknown")

def print_ascii_logo():
    """Print retro ASCII art logo"""
    logo = f"""
{Colors.GREEN}
    ███╗   ██╗███████╗████████╗██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗
    ████╗  ██║██╔════╝╚══██╔══╝██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝
    ██╔██╗ ██║█████╗     ██║   ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ 
    ██║╚██╗██║██╔══╝     ██║   ██║███╗██║██║   ██║██╔══██╗██╔═██╗ 
    ██║ ╚████║███████╗   ██║   ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗
    ╚═╝  ╚═══╝╚══════╝   ╚═╝    ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                                                                  
    ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗               
    ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗              
    ███████║███████║██║     █████╔╝ █████╗  ██████╔╝              
    ██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗              
    ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║              
    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝              
{Colors.ENDC}"""
    print(logo)
    print(f"{Colors.CYAN}╔═════════════════════════════════════════════════════════════════╗{Colors.ENDC}")
    print(f"{Colors.CYAN}║ {Colors.YELLOW}NETWORK HACKER 2025{Colors.CYAN}                                        ║{Colors.ENDC}")
    print(f"{Colors.CYAN}║ {Colors.GREEN}[INFILTRATE ANY NETWORK WITH THIS POWERFUL SCANNING TOOL]{Colors.CYAN}   ║{Colors.ENDC}")
    print(f"{Colors.CYAN}╚═════════════════════════════════════════════════════════════════╝{Colors.ENDC}")

def print_game_menu():
    """Print retro-style game menu"""
    print(f"\n{Colors.BLUE}╔═════════════════════════════════════════════════════════════════╗{Colors.ENDC}")
    print(f"{Colors.BLUE}║ {Colors.YELLOW}[MAIN MENU]{Colors.BLUE}                                                 ║{Colors.ENDC}")
    print(f"{Colors.BLUE}╠═════════════════════════════════════════════════════════════════╣{Colors.ENDC}")
    print(f"{Colors.BLUE}║ {Colors.GREEN}1. START NEW SCAN{Colors.BLUE}                                            ║{Colors.ENDC}")
    print(f"{Colors.BLUE}║ {Colors.GREEN}2. EXIT{Colors.BLUE}                                                      ║{Colors.ENDC}")
    print(f"{Colors.BLUE}╚═════════════════════════════════════════════════════════════════╝{Colors.ENDC}")

def print_table_header():
    """Print the results table header"""
    print(f"\n{Colors.BLUE}╔═══════════════════╦═══════════════╦═══════════════════════╗{Colors.ENDC}")
    print(f"{Colors.BLUE}║ {Colors.CYAN}TARGET IP        {Colors.BLUE}║ {Colors.CYAN}OPEN PORT      {Colors.BLUE}║ {Colors.CYAN}SERVICE              {Colors.BLUE}║{Colors.ENDC}")
    print(f"{Colors.BLUE}╠═══════════════════╬═══════════════╬═══════════════════════╣{Colors.ENDC}")

def print_table_footer():
    """Print the results table footer"""
    print(f"{Colors.BLUE}╚═══════════════════╩═══════════════╩═══════════════════════╝{Colors.ENDC}\n")

def print_result_row(ip, port, service):
    """Print a row in the results table"""
    print(f"{Colors.BLUE}║ {Colors.GREEN}{ip:<17}{Colors.BLUE} ║ {Colors.YELLOW}{port:<15}{Colors.BLUE} ║ {Colors.CYAN}{service:<21}{Colors.BLUE} ║{Colors.ENDC}")

def print_mission_complete(hosts_up, total_open_ports, duration):
    """Print mission complete screen"""
    print(f"\n{Colors.GREEN}╔═════════════════════════════════════════════════════════════════╗{Colors.ENDC}")
    print(f"{Colors.GREEN}║ {Colors.YELLOW}MISSION COMPLETE!{Colors.GREEN}                                          ║{Colors.ENDC}")
    print(f"{Colors.GREEN}╠═════════════════════════════════════════════════════════════════╣{Colors.ENDC}")
    print(f"{Colors.GREEN}║ {Colors.CYAN}SCAN STATISTICS:{Colors.GREEN}                                             ║{Colors.ENDC}")
    print(f"{Colors.GREEN}║ {Colors.WHITE}TIME ELAPSED: {duration:.2f} SECONDS{Colors.GREEN}                                 ║{Colors.ENDC}")
    print(f"{Colors.GREEN}║ {Colors.WHITE}HOSTS DISCOVERED: {hosts_up}{Colors.GREEN}                                         ║{Colors.ENDC}")
    print(f"{Colors.GREEN}║ {Colors.WHITE}VULNERABILITIES FOUND: {total_open_ports}{Colors.GREEN}                                   ║{Colors.ENDC}")
    print(f"{Colors.GREEN}║ {Colors.WHITE}HACKING SKILL INCREASED: +{random.randint(10, 50)} XP{Colors.GREEN}                         ║{Colors.ENDC}")
    print(f"{Colors.GREEN}╚═════════════════════════════════════════════════════════════════╝{Colors.ENDC}")

def generate_ip_range(network_str):
    """Generate a list of IP addresses from a network string"""
    try:
        # Simple parsing for CIDR notation like 192.168.1.0/24
        network, prefix = network_str.split('/')
        prefix = int(prefix)
        
        if prefix < 24 or prefix > 30:
            # Limit to reasonable ranges to avoid generating too many IPs
            prefix = 24
            
        # Get the base network
        base_ip = network.split('.')
        base_ip = [int(octet) for octet in base_ip]
        
        # Calculate how many hosts in this network
        host_bits = 32 - prefix
        host_count = min(2 ** host_bits - 2, 254)  # Exclude network and broadcast
        
        # Generate IPs
        ips = []
        for i in range(1, host_count + 1):
            last_octet = (base_ip[3] & (256 - 2**host_bits)) + i
            ip = f"{base_ip[0]}.{base_ip[1]}.{base_ip[2]}.{last_octet}"
            ips.append(ip)
            
        return ips
    except Exception:
        # Fallback to a small range if parsing fails
        return [f"192.168.1.{i}" for i in range(1, 11)]

def main():
    clear_screen()
    print_ascii_logo()
    time.sleep(1)
    
    while True:
        print_game_menu()
        choice = input(f"\n{Colors.YELLOW}SELECT OPTION [1-2]:{Colors.ENDC} ")
        
        if choice == "2":
            typewriter_effect(f"\n{Colors.RED}EXITING SYSTEM... GOODBYE HACKER!{Colors.ENDC}")
            break
        
        if choice == "1":
            clear_screen()
            print_ascii_logo()
            
            # Get network range from user
            while True:
                try:
                    typewriter_effect(f"\n{Colors.CYAN}[MISSION BRIEFING]{Colors.ENDC}")
                    network = input(f"\n{Colors.GREEN}ENTER TARGET NETWORK (e.g., 192.168.1.0/24):{Colors.ENDC} ")
                    # Simple validation
                    if '/' in network and network.count('.') == 3:
                        ip_range = generate_ip_range(network)
                        break
                    else:
                        raise ValueError("Invalid format")
                except ValueError:
                    print(f"{Colors.RED}INVALID TARGET! TRY AGAIN, HACKER.{Colors.ENDC}")
            
            # Get port range from user
            while True:
                try:
                    port_range = input(f"\n{Colors.GREEN}ENTER PORT RANGE (e.g., 1-1024) OR 'common' FOR COMMON PORTS:{Colors.ENDC} ")
                    
                    if port_range.lower() == 'common':
                        # Common ports to scan
                        ports = [21, 22, 23, 25, 53, 80, 110, 115, 135, 139, 143, 194, 443, 445, 1433, 3306, 3389, 5632, 5900, 8080]
                    else:
                        start_port, end_port = map(int, port_range.split('-'))
                        if start_port < 1 or end_port > 65535 or start_port > end_port:
                            raise ValueError
                        ports = list(range(start_port, end_port + 1))
                    break
                except ValueError:
                    print(f"{Colors.RED}INVALID PORT CONFIGURATION! TRY AGAIN, HACKER.{Colors.ENDC}")
            
            typewriter_effect(f"\n{Colors.YELLOW}[MISSION ACCEPTED] PREPARING TO INFILTRATE NETWORK {network}...{Colors.ENDC}")
            time.sleep(1)
            
            typewriter_effect(f"\n{Colors.CYAN}INITIALIZING ATTACK VECTORS...{Colors.ENDC}")
            hacker_animation(3)
            
            typewriter_effect(f"\n{Colors.GREEN}BYPASSING FIREWALL...{Colors.ENDC}")
            hacker_animation(2)
            
            typewriter_effect(f"\n{Colors.YELLOW}LAUNCHING SCAN ON {len(ports)} PORTS...{Colors.ENDC}")
            
            # Track statistics
            start_time = time.time()
            hosts_up = 0
            total_open_ports = 0
            
            # Store results for table display
            results = []
            
            # Scan each host in the network
            total_hosts = len(ip_range)
            for i, ip in enumerate(ip_range):
                # Show progress
                progress = (i + 1) / total_hosts
                bar = loading_bar(total_hosts, i + 1)
                print(f"\r{Colors.BOLD}SCANNING TARGET: {ip} {bar}{Colors.ENDC}", end="")
                
                if simulate_host_scan(ip):
                    hosts_up += 1
                    open_ports = simulate_port_scan(ip, ports)
                    total_open_ports += len(open_ports)
                    
                    for port in open_ports:
                        service = get_service_name(port)
                        results.append((str(ip), port, service))
                
                # Add some randomness to make it look more "hacky"
                if random.random() < 0.1:
                    time.sleep(0.2)
                    print(f"\r{Colors.RED}FIREWALL DETECTED! BYPASSING...{Colors.ENDC}", end="")
                    time.sleep(0.5)
                
                # Slow down the scan a bit to make it more dramatic
                time.sleep(0.05)
            
            # Clear progress line
            print("\r" + " " * 100 + "\r", end="")
            
            typewriter_effect(f"\n{Colors.GREEN}SCAN COMPLETE! ANALYZING RESULTS...{Colors.ENDC}")
            hacker_animation(1)
            
            # Print results in a table
            if results:
                typewriter_effect(f"\n{Colors.YELLOW}[VULNERABILITIES DETECTED]{Colors.ENDC}")
                print_table_header()
                for ip, port, service in results:
                    print_result_row(ip, port, service)
                    # Add slight delay for dramatic effect
                    time.sleep(0.05)
                print_table_footer()
            else:
                typewriter_effect(f"\n{Colors.RED}[NO VULNERABILITIES FOUND] TARGET NETWORK IS SECURE.{Colors.ENDC}")
            
            # Print mission complete
            duration = time.time() - start_time
            print_mission_complete(hosts_up, total_open_ports, duration)
            
            input(f"\n{Colors.YELLOW}PRESS ENTER TO RETURN TO MAIN MENU...{Colors.ENDC}")
            clear_screen()
            print_ascii_logo()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}MISSION ABORTED BY USER.{Colors.ENDC}")
    except Exception as e:
        print(f"\n{Colors.RED}CRITICAL ERROR: {e}{Colors.ENDC}")
        print(f"{Colors.RED}SYSTEM FAILURE. REBOOTING...{Colors.ENDC}")