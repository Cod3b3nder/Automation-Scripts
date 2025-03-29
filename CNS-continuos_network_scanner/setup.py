#!/usr/bin/env python3

import os
import sys
import subprocess
import platform
import shutil
import time
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('setup.log'),
        logging.StreamHandler()
    ]
)

class SetupManager:
    def __init__(self):
        self.os_type = platform.system().lower()
        self.is_admin = self._check_admin()
        self.required_ports = [5000, 5173]
        self.dependencies = {
            'python': '3.8',
            'nmap': '7.0',
            'node': '18.0'
        }
        self.python_packages = [
            'python-nmap>=0.7.1',
            'psutil>=5.9.0',
            'requests>=2.31.0'
        ]

    def _check_admin(self) -> bool:
        """Check if script is running with admin privileges."""
        try:
            if self.os_type == 'windows':
                import ctypes
                return ctypes.windll.shell32.IsUserAnAdmin() != 0
            else:
                return os.geteuid() == 0
        except:
            return False

    def _run_command(self, command: List[str], check_output: bool = False) -> Optional[str]:
        """Execute a command and handle errors."""
        try:
            if check_output:
                return subprocess.check_output(command, stderr=subprocess.STDOUT).decode().strip()
            else:
                subprocess.run(command, check=True)
            return None
        except subprocess.CalledProcessError as e:
            error_msg = f"Command failed: {' '.join(command)}\nError: {e.output.decode() if e.output else str(e)}"
            logging.error(error_msg)
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"Error running command {' '.join(command)}: {str(e)}"
            logging.error(error_msg)
            raise RuntimeError(error_msg)

    def check_port_availability(self) -> List[int]:
        """Check if required ports are available."""
        import socket
        busy_ports = []
        for port in self.required_ports:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                sock.bind(('localhost', port))
            except socket.error:
                busy_ports.append(port)
            finally:
                sock.close()
        return busy_ports

    def check_dependencies(self) -> Dict[str, bool]:
        """Check if required dependencies are installed."""
        status = {}
        
        # Check Python version
        python_version = platform.python_version()
        status['python'] = tuple(map(int, python_version.split('.'))) >= tuple(map(int, self.dependencies['python'].split('.')))

        # Check Node.js version
        try:
            node_version = self._run_command(['node', '--version'], check_output=True)
            if node_version.startswith('v'):
                node_version = node_version[1:]
            status['node'] = tuple(map(int, node_version.split('.'))) >= tuple(map(int, self.dependencies['node'].split('.')))
        except:
            status['node'] = False

        # Check Nmap
        try:
            nmap_version = self._run_command(['nmap', '--version'], check_output=True)
            status['nmap'] = any(self.dependencies['nmap'] in line for line in nmap_version.split('\n'))
        except:
            status['nmap'] = False

        return status

    def install_dependencies(self):
        """Install missing dependencies."""
        deps_status = self.check_dependencies()
        
        if not self.is_admin:
            raise PermissionError("Administrator privileges required to install dependencies")

        # Install Nmap if missing
        if not deps_status['nmap']:
            logging.info("Installing Nmap...")
            if self.os_type == 'linux':
                if shutil.which('apt'):
                    self._run_command(['apt-get', 'update'])
                    self._run_command(['apt-get', 'install', '-y', 'nmap'])
                elif shutil.which('yum'):
                    self._run_command(['yum', 'install', '-y', 'nmap'])
                else:
                    raise RuntimeError("Unsupported Linux distribution")
            elif self.os_type == 'darwin':
                self._run_command(['brew', 'install', 'nmap'])
            else:
                raise RuntimeError("Please install Nmap manually from https://nmap.org/download.html")

        # Install Python packages
        logging.info("Installing Python packages...")
        try:
            self._run_command([sys.executable, '-m', 'pip', 'install'] + self.python_packages)
        except Exception as e:
            raise RuntimeError(f"Failed to install Python packages: {str(e)}")

    def setup(self):
        """Run the complete setup process."""
        try:
            logging.info("Starting setup...")

            # Check admin privileges
            if not self.is_admin:
                raise PermissionError(
                    "This setup requires administrator privileges.\n"
                    "Please run with sudo (Linux/macOS) or as Administrator (Windows)."
                )

            # Check port availability
            busy_ports = self.check_port_availability()
            if busy_ports:
                raise RuntimeError(
                    f"The following ports are in use: {', '.join(map(str, busy_ports))}.\n"
                    "Please free these ports and try again."
                )

            # Check and install dependencies
            deps_status = self.check_dependencies()
            missing_deps = [dep for dep, installed in deps_status.items() if not installed]
            
            if missing_deps:
                logging.info(f"Installing missing dependencies: {', '.join(missing_deps)}")
                self.install_dependencies()

            # Create necessary directories
            os.makedirs('logs', exist_ok=True)

            logging.info("Setup completed successfully!")
            return True

        except Exception as e:
            logging.error(f"Setup failed: {str(e)}")
            print("\nError Details:")
            print(f"- {str(e)}")
            print("\nPlease check setup.log for more details.")
            return False

if __name__ == "__main__":
    try:
        setup_manager = SetupManager()
        if setup_manager.setup():
            print("\n✅ Setup completed successfully!")
            print("\nYou can now start the application with:")
            print("npm run dev")
        else:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
        sys.exit(1)