import nmap

# Create a PortScanner object
nm = nmap.PortScanner()

# Display scan options
def main_menu():
    print("\n[1] Scan my Localhost")
    print("[2] Scan a Remote Host")
    
    while True:
        try:
            choice = int(input("Select an option: "))
            if choice == 1:
                scan_localhost()
                break
            elif choice == 2:
                scan_remote_host()
                break
            else:
                print("Invalid selection. Please enter 1 or 2.")
        except ValueError:
            print("Invalid input. Please enter a number.")

# Display service selection options
def service_selection():
    print("\nSelect a scan type:")
    options = {
        1: "Scan a range of IP addresses",
        2: "Scan a subnet",
        3: "Scan a range of ports",
        4: "Scan all ports",
        5: "OS detection",
        6: "Version detection",
        7: "Script scanning",
        8: "Traceroute",
        9: "Firewall evasion",
        10: "Service info",
        11: "Service version info",
        12: "Service detection",
        13: "Service script scanning",
        14: "Service traceroute",
        15: "Use ALL Protocols"
    }

    for key, value in options.items():
        print(f"[{key}] {value}")

    while True:
        try:
            selection = int(input("Choose an option: "))
            if selection in options:
                return selection
            else:
                print("Invalid selection. Try again.")
        except ValueError:
            print("Invalid input. Enter a number.")

# Scan localhost
def scan_localhost():
    scan_type = service_selection()

    scan_options = {
        1: ("localhost", input("Enter IP address range (192.168.1.1-192.168.1.255 or ENTER for default): ") or "0.0.0.0/0" ) ,
        2: ("localhost", "192.168.1.0/24"),
        3: ("localhost", input("Enter port range (e.g., 1-1024 or ENTER for default): ") or "1-65535"),
        4: ("localhost", "1-65535"),
        5: ("localhost", "1-1024", "-O"),
        6: ("localhost", "1-1024", "-sV"),
        7: ("localhost", "1-1024", "-sC"),
        8: ("localhost", "1-1024", "--traceroute"),
        9: ("localhost", "1-1024", "-f"),
        10: ("localhost", "1-1024", "-sV"),
        11: ("localhost", "1-1024", "-sV"),
        12: ("localhost", "1-1024", "-A"),
        13: ("localhost", "1-1024", "-sC"),
        14: ("localhost", "1-1024", "--traceroute"),
        15: ("localhost", "1-1024", "-sO", "-O", "-sV", "-sC", "-f", "-sV", "-A"),
    }

    target, ports, *args = scan_options[scan_type]

    print(f"\nScanning {target} on ports {ports}...")
    nm.scan(target, ports, arguments=" ".join(args) if args else "")

    print_scan_results()

# Scan remote host
def scan_remote_host():
    ip = input("Enter the IP address of the remote host: ")
    scan_type = service_selection()

    scan_options = {
        1: (ip, input("Enter IP address range: ")),
        2: (ip, "192.168.1.0/24"),
        3: (ip, input("Enter port range (e.g., 1-1024): ")),
        4: (ip, "1-65535"),
        5: (ip, "1-1024", "-O"),
        6: (ip, "1-1024", "-sV"),
        7: (ip, "1-1024", "-sC"),
        8: (ip, "1-1024", "--traceroute"),
        9: (ip, "1-1024", "-f"),
        10: (ip, "1-1024", "-sV"),
        11: (ip, "1-1024", "-sV"),
        12: (ip, "1-1024", "-A"),
        13: (ip, "1-1024", "-sC"),
        14: (ip, "1-1024", "--traceroute"),
        15: (ip, "1-1024", "-sO"),
    }

    target, ports, *args = scan_options[scan_type]

    print(f"\nScanning {target} on ports {ports}...")
    nm.scan(target, ports, arguments=" ".join(args) if args else "")

    print_scan_results()

# Print scan results
def print_scan_results():
    for host in nm.all_hosts():
        print(f"\nHost: {host} ({nm[host].hostname()})")
        print(f"State: {nm[host].state()}")
        
        for proto in nm[host].all_protocols():
            print(f"\nProtocol: {proto}")
            ports = nm[host][proto].keys()
            for port in sorted(ports):
                print(f"Port: {port} | State: {nm[host][proto][port]['state']} | Service: {nm[host][proto][port].get('name', 'Unknown')}")

# Run the script
if __name__ == "__main__":
    main_menu()

# End of script. Script created by OoxLab - Cod3B3nder