#!/usr/bin/env python3
"""
Network Scanner Game - A retro-style hacking game interface for simulating network scans
"""
import sys
import random
import time
import os
import nmap
import ipaddress  # ✅ Added for proper IP range handling

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
        line = "".join(random.choice("0123456789ABCDEF") + " " for _ in range(random.randint(50, 80)))
        print(f"{random.choice([Colors.GREEN, Colors.CYAN, Colors.RED])}{line}{Colors.ENDC}", end="\r")
        time.sleep(0.05)
    print(" " * 100, end="\r")

def loading_bar(total, current, width=50):
    """Display a retro-style loading bar"""
    percent = current / total
    filled_width = int(width * percent)
    bar = f"{Colors.GREEN_BG}{'█' * filled_width}{Colors.BLACK_BG}{' ' * (width - filled_width)}{Colors.ENDC}"
    return f"[{bar}] {int(percent * 100)}%"

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
            if ip in nm.all_hosts() and nm[ip].state() == 'up':  # ✅ Fixed KeyError
                hosts_up += 1
                nm.scan(ip, arguments=f'-p {",".join(map(str, ports))} -sS -sV -O')
                for port in ports:
                    if nm[ip].has_tcp(port) and nm[ip]['tcp'][port]['state'] == 'open':
                        open_ports.append(port)
                        results.append((ip, port, get_service_name(port)))
                total_open_ports += len(open_ports)
        except Exception as e:
            print(f"\n{Colors.RED}ERROR SCANNING {ip}: {e}{Colors.ENDC}")

        if random.random() < 0.1:
            time.sleep(0.2)
            print(f"\r{Colors.RED}FIREWALL DETECTED! BYPASSING...{Colors.ENDC}", end="")
            time.sleep(0.5)

    print("\r" + " " * 100 + "\r", end="")  # Clear progress bar
    return hosts_up, total_open_ports, results

def main():
    clear_screen()
    typewriter_effect(f"{Colors.YELLOW}NETWORK HACKER 2025 - RETRO SCANNER{Colors.ENDC}")

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
            if port_range.lower() == 'common':
                ports = [21, 22, 23, 25, 53, 80, 110, 443, 445, 3306, 3389, 8080]
            else:
                try:
                    start_port, end_port = map(int, port_range.split('-'))
                    ports = list(range(start_port, end_port + 1))
                except ValueError:
                    print(f"{Colors.RED}INVALID PORT RANGE!{Colors.ENDC}")
                    continue

            typewriter_effect(f"\n{Colors.YELLOW}SCANNING NETWORK {network}...{Colors.ENDC}")
            hacker_animation(3)

            start_time = time.time()
            hosts_up, total_open_ports, results = scan_network(ip_range, ports)
            duration = time.time() - start_time

            typewriter_effect(f"\n{Colors.GREEN}SCAN COMPLETE!{Colors.ENDC}")

            if results:
                print(f"\n{Colors.YELLOW}VULNERABILITIES FOUND:{Colors.ENDC}")
                for ip, port, service in results:
                    print(f"{Colors.GREEN}{ip:<17} {Colors.YELLOW}{port:<10} {Colors.CYAN}{service:<15}{Colors.ENDC}")
            else:
                print(f"\n{Colors.RED}NO VULNERABILITIES FOUND.{Colors.ENDC}")

            print(f"\n{Colors.GREEN}HOSTS UP: {hosts_up} | TOTAL OPEN PORTS: {total_open_ports} | TIME: {duration:.2f}s{Colors.ENDC}")

            if input(f"\n{Colors.YELLOW}SAVE RESULTS? (y/n): {Colors.ENDC}").lower() == 'y':
                save_path = input(f"{Colors.GREEN}ENTER FILE PATH:{Colors.ENDC} ")
                try:
                    with open(save_path, 'w') as file:
                        file.write("TARGET IP\tPORT\tSERVICE\n")
                        for ip, port, service in results:
                            file.write(f"{ip}\t{port}\t{service}\n")
                    print(f"{Colors.GREEN}SAVED TO {save_path}{Colors.ENDC}")
                except Exception as e:
                    print(f"{Colors.RED}FAILED TO SAVE: {e}{Colors.ENDC}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}ABORTED BY USER.{Colors.ENDC}")
    except Exception as e:
        print(f"\n{Colors.RED}ERROR: {e}{Colors.ENDC}")