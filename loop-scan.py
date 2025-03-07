import nmap
import json
import sqlite3
from flask import Flask, jsonify

app = Flask(__name__)
nm = nmap.PortScanner()

# Database setup
def init_db():
    conn = sqlite3.connect("network.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS devices 
                 (ip TEXT PRIMARY KEY, hostname TEXT, ports TEXT)''')
    conn.commit()
    conn.close()

# Scan the network for new IPs and open ports
def scan_network(network="192.168.1.0/24"):
    nm.scan(hosts=network, arguments="-sP")  # Ping scan for active hosts
    devices = {}

    for host in nm.all_hosts():
        nm.scan(host, arguments="-p 1-65535")  # Scan all ports
        ports = [p for p in nm[host]['tcp'].keys()] if 'tcp' in nm[host] else []
        
        devices[host] = {
            "hostname": nm[host].hostname(),
            "ports": ports
        }
        
        # Store in database
        conn = sqlite3.connect("network.db")
        c = conn.cursor()
        c.execute("INSERT OR REPLACE INTO devices VALUES (?, ?, ?)", 
                  (host, nm[host].hostname(), json.dumps(ports)))
        conn.commit()
        conn.close()

    return devices

@app.route('/scan', methods=['GET'])
def get_scan_results():
    scan_results = scan_network()
    return jsonify(scan_results)

if __name__ == '__main__':
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)