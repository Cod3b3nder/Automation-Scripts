import os
import re
import subprocess
import json
import tabulate
from collections import defaultdict
from termcolor import colored

def get_wireless_interfaces():
    output = subprocess.check_output("iwgetid -r", shell=True).decode().strip()
    return [iface for iface in output.split() if iface.startswith("wlan")]

def is_monitor_mode(iface):
    output = subprocess.check_output(f"airmon-ng get {iface}", shell=True).decode()
    return "Interface does not support monitoring." not in output

def scan_network(ip_range, iface):
    # Scan for active hosts using Nmap
    nmap_command = f"nmap -sn {ip_range} -oG -"
    nmap_output = subprocess.check_output(nmap_command, shell=True).decode()
    active_hosts = [line.split(" ")[1].strip() for line in nmap_output.split("\n") if "Status: Up" in line]

    # Create a dictionary to store active connections and data transfer
    connections = defaultdict(lambda: {'in': 0, 'out': 0})

    for host in active_hosts:
        print(f"Scanning {host}...")
        # Use Bettercap to capture network traffic and extract active connections
        bettercap_command = f"bettercap -iface {iface} -caplet flowacious 'after.cap' -filter 'arp=={host}' -network -json > output.json"
        subprocess.call(bettercap_command, shell=True)

        with open("output.json") as f:
            data = json.load(f)
            for flow in data["flows"]:
                src_ip = flow["src"]
                dst_ip = flow["dst"]
                if src_ip == host or dst_ip == host:
                    connections[host]['in'] += flow["bytes"]
                    connections[host]['out'] += flow["bytes"]

        # Use Nmap to check for common vulnerabilities
        nmap_vuln_command = f"nmap --script vuln -p- {host}"
        nmap_vuln_output = subprocess.check_output(nmap_vuln_command, shell=True).decode()
        vulnerabilities = re.findall(r"Name: (.+?)\nVuln ID: (.+?)\n", nmap_vuln_output)
        if vulnerabilities:
            connections[host]['vulnerabilities'] = vulnerabilities

    # Print the results in a table
    print("\nNetwork Scan Results:")
    table_data = [["IP", "Incoming Data (bytes)", "Outgoing Data (bytes)", "Vulnerabilities"]]
    for ip, data in connections.items():
        vulns = ", ".join([f"{vuln[0]} (ID: {vuln[1]})" for vuln in data.get('vulnerabilities', [])])
        table_data.append([ip, f"{colored(data['in'], 'blue')}", f"{colored(data['out'], 'red')}", vulns])

    print(tabulate.tabulate(table_data, tablefmt="pipe", missingvalue="N/A"))

if __name__ == "__main__":
    wireless_interfaces = get_wireless_interfaces()
    print("Select a wireless interface:")
    for i, iface in enumerate(wireless_interfaces):
        print(f"{i + 1}. {iface}")
    choice = int(input("Enter your choice: ")) - 1

    selected_iface = wireless_interfaces[choice]
    if not is_monitor_mode(selected_iface):
        print(f"Error: {selected_iface} is not in monitor mode.")
        exit(1)

    scan_network("192.168.1.0/24", selected_iface)
