# CEH Exam Preparation: Day 3 — Network and Perimeter Hacking, Part 1 (Domain 4)

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 3 of your 7-day CEH (Certified Ethical Hacker) preparation. Today begins **Domain 4: Network and Perimeter Hacking**, which carries the **largest exam weight at approximately 24%**. Because of its size, this domain is split across Day 3 (sniffing, social engineering, denial of service) and Day 4 (session hijacking, web server/application hacking, SQL injection). Today's material alone is dense — take your time and master every concept.

**Recommended schedule for today (5-7 hours):**
1. Block 1 (2 h): Read the Sniffing section completely. Practice Wireshark filters on a pcap file if possible.
2. Block 2 (1.5 h): Read the Social Engineering section. This is heavily conceptual — create flashcards for each attack type.
3. Block 3 (1.5-2 h): Read the Denial of Service section. Understand the difference between every attack type.
4. Block 4 (1 h): Work through all exam-style practice questions. Re-read any topic where you get an answer wrong.

---

## Part 1: Sniffing

Sniffing is the process of capturing and analyzing network packets as they traverse a network. An attacker who can sniff network traffic can intercept credentials, session tokens, emails, and other sensitive data transmitted in cleartext.

### 1.1 How Sniffing Works — Network Fundamentals

To understand sniffing, you must understand how switches and hubs handle traffic:

**Hub (legacy):** A hub broadcasts every incoming frame to every port. If Host A sends a frame to Host B through a hub, all other hosts connected to the hub also receive that frame. Sniffing on a hub-based network is trivial — the attacker simply puts their NIC in promiscuous mode and captures everything.

**Switch (modern):** A switch maintains a MAC address table (CAM table — Content Addressable Memory) that maps each MAC address to a physical port. When Host A sends a frame to Host B, the switch looks up Host B's MAC address in the CAM table and forwards the frame only to Host B's port. Other hosts do not see the frame. Sniffing on a switched network requires active techniques to redirect traffic.

**Promiscuous Mode:**
By default, a NIC (Network Interface Card) only accepts frames addressed to its own MAC address (or broadcast/multicast addresses). When a NIC is placed in **promiscuous mode**, it accepts ALL frames regardless of the destination MAC address. This is required for sniffing.

```bash
# Enable promiscuous mode on Linux
sudo ip link set eth0 promisc on

# Check if promiscuous mode is active
ip link show eth0
# Look for: PROMISC in the flags

# Disable promiscuous mode
sudo ip link set eth0 promisc off
```

> Exam trap: On a switched network, simply enabling promiscuous mode is NOT enough to sniff other users' traffic. The switch will only send frames destined for your MAC address to your port. To sniff on a switched network, you must use active sniffing techniques (MAC flooding, ARP poisoning, DHCP starvation, etc.) to redirect traffic to your port.

### 1.2 Passive Sniffing vs. Active Sniffing

| Aspect | Passive Sniffing | Active Sniffing |
|--------|-----------------|-----------------|
| **Network type** | Hub-based networks (or Wi-Fi) | Switched networks |
| **Technique** | Simply capture all frames (promiscuous mode) | Inject packets to manipulate the switch/network (ARP poisoning, MAC flooding, DHCP starvation) |
| **Detectability** | Very hard to detect — no packets are injected | Easier to detect — injected packets can be noticed by IDS/IPS |
| **Traffic affected** | Can see all traffic on the segment | Only traffic that has been redirected to the attacker |
| **Legal/ethical** | Still unauthorized interception if done without permission | More clearly malicious — actively manipulating the network |

### 1.3 Active Sniffing Techniques

#### 1.3.1 MAC Flooding (CAM Table Overflow)

**How it works:**
A switch's CAM table has a limited capacity (typically 8,000 to 128,000 entries depending on the switch model). MAC flooding sends thousands of Ethernet frames, each with a different spoofed source MAC address. This rapidly fills the CAM table. When the CAM table is full, the switch can no longer learn new MAC addresses and enters **fail-open mode** — it starts broadcasting all frames to all ports, effectively acting like a hub. The attacker can then sniff all traffic.

**Tool: macof (part of the dsniff suite)**
```bash
# Flood the switch with random MAC addresses
macof -i eth0

# macof can generate ~155,000 packets per second
# A typical switch CAM table fills in seconds
```

**How the attack works step by step:**
1. Attacker runs `macof` on their machine connected to the switch
2. `macof` sends thousands of Ethernet frames with random source MAC/IP addresses
3. The switch adds each new MAC to the CAM table
4. The CAM table fills to capacity
5. New legitimate MAC addresses cannot be learned
6. The switch broadcasts all frames to all ports (fail-open)
7. The attacker captures all traffic with Wireshark/tcpdump

**Countermeasure: Port Security**
```
! Cisco IOS — configure port security
interface FastEthernet0/1
  switchport mode access
  switchport port-security
  switchport port-security maximum 2
  switchport port-security violation shutdown
  switchport port-security mac-address sticky
```

- `maximum 2`: Only allow 2 MAC addresses on this port
- `violation shutdown`: If a third MAC is seen, shut down the port
- `mac-address sticky`: Learn the first 2 MACs dynamically and save them to the config

**Violation modes:**

| Mode | Action When Violation Occurs | Port Status | Syslog Alert | Violation Counter |
|------|------------------------------|-------------|--------------|-------------------|
| **Shutdown** (default) | Port is err-disabled (shut down) | Down | Yes | Yes |
| **Restrict** | Frames from violating MACs are dropped | Up | Yes | Yes |
| **Protect** | Frames from violating MACs are dropped silently | Up | No | No |

#### 1.3.2 ARP Poisoning (ARP Spoofing)

This is the most important sniffing technique on the CEH exam. Understand it thoroughly.

**How ARP works normally:**
ARP (Address Resolution Protocol) maps IP addresses to MAC addresses on a local network. When Host A wants to communicate with Host B (192.168.1.10), Host A broadcasts an ARP Request: "Who has 192.168.1.10? Tell me your MAC address." Host B responds with an ARP Reply: "192.168.1.10 is at AA:BB:CC:DD:EE:FF." Host A stores this mapping in its ARP cache and sends subsequent frames directly to Host B's MAC address.

**The vulnerability:**
ARP has no authentication. Any host can send an unsolicited ARP Reply (called a "gratuitous ARP") claiming to be any IP address. Hosts accept these replies without verification and update their ARP cache.

**How ARP poisoning works:**
The attacker sends forged ARP Replies to both the victim and the default gateway:

```
Normal state:
  Victim's ARP cache:  Gateway (192.168.1.1) = GW_MAC
  Gateway's ARP cache: Victim (192.168.1.100) = VICTIM_MAC

After ARP poisoning:
  Victim's ARP cache:  Gateway (192.168.1.1) = ATTACKER_MAC  <-- poisoned!
  Gateway's ARP cache: Victim (192.168.1.100) = ATTACKER_MAC  <-- poisoned!
```

Now all traffic between the victim and the gateway flows through the attacker's machine. The attacker forwards the traffic to the correct destination (so the victim does not notice any disruption) while capturing a copy of everything.

```
Before poisoning:
  Victim  <----->  Switch  <----->  Gateway  <----->  Internet

After poisoning:
  Victim  ----->  Attacker  ----->  Gateway  ----->  Internet
  Victim  <-----  Attacker  <-----  Gateway  <-----  Internet
  (Attacker is a Man-in-the-Middle)
```

**The attacker must enable IP forwarding so traffic is relayed (otherwise it dies at the attacker's machine):**

```bash
# Enable IP forwarding on Linux
echo 1 > /proc/sys/net/ipv4/ip_forward

# or
sysctl -w net.ipv4.ip_forward=1
```

**Tool: Ettercap**
```bash
# ARP poisoning MITM with Ettercap (text mode)
sudo ettercap -T -q -i eth0 -M arp:remote /192.168.1.1// /192.168.1.100//

# Explanation:
# -T        = text mode
# -q        = quiet (suppress packet content)
# -i eth0   = interface
# -M arp:remote = ARP poisoning MITM mode
# /192.168.1.1//    = Target 1 (gateway)
# /192.168.1.100//  = Target 2 (victim)

# Ettercap GUI mode
sudo ettercap -G
```

**Tool: BetterCAP (modern replacement for Ettercap)**
```bash
# Start BetterCAP
sudo bettercap -iface eth0

# Inside BetterCAP interactive shell:

# Discover hosts on the network
net.probe on

# Show discovered hosts
net.show

# Start ARP spoofing against a specific target
set arp.spoof.targets 192.168.1.100
arp.spoof on

# Start an HTTP proxy to capture/modify HTTP traffic
set http.proxy.sslstrip true
http.proxy on

# Enable network sniffing
net.sniff on

# Capture credentials
set net.sniff.verbose true
```

**Tool: arpspoof (from dsniff suite)**
```bash
# Poison the victim's ARP cache (pretend to be the gateway)
sudo arpspoof -i eth0 -t 192.168.1.100 192.168.1.1

# In a second terminal, poison the gateway's ARP cache (pretend to be the victim)
sudo arpspoof -i eth0 -t 192.168.1.1 192.168.1.100

# Enable IP forwarding
sudo echo 1 > /proc/sys/net/ipv4/ip_forward
```

**Countermeasure: Dynamic ARP Inspection (DAI)**
DAI is a switch security feature that validates ARP packets against the DHCP Snooping binding table. If an ARP Reply does not match a legitimate DHCP binding (IP-to-MAC mapping), the switch drops the packet.

```
! Cisco IOS — enable DAI
ip arp inspection vlan 10

! Configure trusted ports (uplinks, DHCP servers)
interface GigabitEthernet0/1
  ip arp inspection trust

! Untrusted ports (user ports) — DAI validates ARP packets
interface FastEthernet0/1
  ! No command needed — untrusted by default
```

**DAI requires DHCP Snooping to be enabled first** (DAI uses the DHCP Snooping binding table to validate ARP packets).

#### 1.3.3 DHCP Starvation

**How it works:**
The attacker broadcasts thousands of DHCP Discover messages, each with a different spoofed MAC address. The DHCP server assigns an IP address to each request, exhausting its entire address pool. Legitimate clients cannot obtain IP addresses and lose network connectivity.

**Why attackers use it:**
After exhausting the legitimate DHCP server's pool, the attacker sets up a **rogue DHCP server** that responds to new DHCP requests. The rogue server assigns IP addresses with a malicious default gateway (the attacker's machine) and a malicious DNS server. Now all traffic from new clients flows through the attacker (MITM), and DNS queries can be redirected (DNS poisoning).

**Tool: Yersinia**
```bash
# DHCP starvation attack using Yersinia
sudo yersinia dhcp -attack 1 -interface eth0

# Attack types in Yersinia:
# 1 = DHCP Discover flood (starvation)
# 2 = DHCP rogue server
```

**Tool: dhcpstarv**
```bash
# Simple DHCP starvation
dhcpstarv -i eth0
```

**Countermeasure: DHCP Snooping**
DHCP Snooping is a switch feature that filters untrusted DHCP messages. It distinguishes between trusted ports (where the DHCP server is connected) and untrusted ports (where clients are connected).

```
! Cisco IOS — enable DHCP Snooping
ip dhcp snooping
ip dhcp snooping vlan 10

! Configure trusted port (DHCP server uplink)
interface GigabitEthernet0/1
  ip dhcp snooping trust

! Untrusted ports (client-facing) — only DHCP Discover and Request are allowed
! DHCP Offer and Ack are blocked (prevents rogue DHCP servers)
interface FastEthernet0/1
  ip dhcp snooping limit rate 10
  ! Limits DHCP messages to 10 per second (prevents starvation flood)
```

**DHCP Snooping builds a binding table:**
| MAC Address | IP Address | Lease Time | VLAN | Port |
|-------------|-----------|------------|------|------|
| AA:BB:CC:DD:EE:01 | 192.168.1.100 | 86400 | 10 | Fa0/1 |
| AA:BB:CC:DD:EE:02 | 192.168.1.101 | 86400 | 10 | Fa0/2 |

This binding table is used by DAI (Dynamic ARP Inspection) and IP Source Guard for additional validation.

#### 1.3.4 DNS Poisoning

**DNS Cache Poisoning (remote):**
The attacker sends forged DNS responses to a DNS resolver before the legitimate response arrives. If the attacker's forged response has the correct transaction ID and arrives first, the resolver caches the forged mapping. All clients using that resolver will be directed to the attacker's IP address when they look up the poisoned domain.

```
Normal DNS resolution:
  Client --> "What is the IP of bank.com?" --> DNS Resolver
  DNS Resolver --> Queries authoritative DNS server --> Gets "bank.com = 93.184.216.34"
  DNS Resolver --> Returns "93.184.216.34" to Client

After DNS cache poisoning:
  DNS Resolver's cache now has: "bank.com = 10.0.0.99" (attacker's IP)
  Client --> "What is the IP of bank.com?" --> DNS Resolver
  DNS Resolver --> Returns "10.0.0.99" (from poisoned cache)
  Client --> Connects to attacker's fake banking site at 10.0.0.99
```

**DNS Spoofing (local — via MITM):**
If the attacker is already performing a MITM attack (e.g., via ARP poisoning), they can intercept DNS queries and respond with forged answers before the real DNS server responds.

```bash
# DNS spoofing with Ettercap
# Create etter.dns file with forged entries:
# bank.com      A   10.0.0.99
# *.bank.com    A   10.0.0.99

# Run Ettercap with DNS spoofing plugin
sudo ettercap -T -q -i eth0 -P dns_spoof -M arp:remote /192.168.1.1// /192.168.1.100//

# BetterCAP DNS spoofing
sudo bettercap -iface eth0
set dns.spoof.domains bank.com
set dns.spoof.address 10.0.0.99
dns.spoof on
arp.spoof on
```

**Countermeasures:**
- DNSSEC (DNS Security Extensions): digitally signs DNS records so resolvers can verify authenticity
- Use encrypted DNS: DNS over HTTPS (DoH) or DNS over TLS (DoT)
- Randomize source ports and transaction IDs in DNS queries (makes spoofing harder)
- Reduce DNS TTL to limit the impact of cached poison
- Monitor for unusual DNS activity

#### 1.3.5 SPAN Port (Port Mirroring)

A SPAN (Switched Port Analyzer) port is a switch feature that copies all traffic from one or more source ports (or VLANs) to a destination port where a network analyzer is connected. This is the legitimate, authorized way to sniff traffic on a switched network.

```
! Cisco IOS — configure SPAN
monitor session 1 source interface FastEthernet0/1
monitor session 1 destination interface FastEthernet0/24

! This copies all traffic from port Fa0/1 to Fa0/24
! Connect Wireshark to port Fa0/24
```

**RSPAN (Remote SPAN):** Extends SPAN across switches using a dedicated VLAN. Traffic from a source port on Switch A is sent over the RSPAN VLAN to a destination port on Switch B.

**ERSPAN (Encapsulated Remote SPAN):** Encapsulates mirrored traffic in GRE (Generic Routing Encapsulation) and routes it across the network. Works across Layer 3 boundaries (different subnets/VLANs).

> Exam note: The exam may ask "What is the legitimate method to sniff traffic on a switched network?" The answer is SPAN port / port mirroring.

### 1.4 Sniffing Tools

**Wireshark:**
- The world's most widely used network protocol analyzer
- Captures live traffic and reads pcap files
- GUI-based with powerful display filters
- Supports 3,000+ protocols
- Can reassemble TCP streams, export objects (files from HTTP traffic), and decode encrypted traffic (if you have the key)

**Essential Wireshark Display Filters:**

```
# Filter by IP address
ip.addr == 192.168.1.100          # Source OR destination
ip.src == 192.168.1.100           # Source only
ip.dst == 192.168.1.100           # Destination only

# Filter by protocol
tcp                                # All TCP traffic
udp                                # All UDP traffic
http                               # HTTP traffic
dns                                # DNS traffic
arp                                # ARP traffic
icmp                               # ICMP traffic
ftp                                # FTP traffic
ssh                                # SSH traffic
tls                                # TLS/SSL traffic

# Filter by port
tcp.port == 80                     # Source OR destination port 80
tcp.dstport == 443                 # Destination port 443
tcp.srcport == 22                  # Source port 22
udp.port == 53                     # DNS port

# Filter by TCP flags
tcp.flags.syn == 1                 # SYN packets
tcp.flags.syn == 1 && tcp.flags.ack == 0   # SYN only (no ACK) — connection initiations
tcp.flags.fin == 1                 # FIN packets
tcp.flags.reset == 1               # RST packets

# HTTP filters
http.request.method == "GET"       # HTTP GET requests
http.request.method == "POST"      # HTTP POST requests
http.response.code == 200          # HTTP 200 OK responses
http.response.code == 404          # HTTP 404 Not Found
http.host contains "bank.com"      # Requests to domains containing "bank.com"

# Find passwords in cleartext protocols
http.request.method == "POST" && http contains "password"
ftp.request.command == "PASS"      # FTP password commands

# Combine filters
ip.addr == 192.168.1.100 && tcp.port == 80
(http || dns) && ip.src == 192.168.1.100
```

**Following TCP Streams in Wireshark:**
Right-click on any packet in a TCP connection and select **"Follow > TCP Stream"**. Wireshark reconstructs the entire conversation, showing all data exchanged between client and server. This is invaluable for reading HTTP requests/responses, email content, or any other cleartext protocol.

**tcpdump:**
Command-line packet capture tool. Available on all Unix/Linux systems. The exam tests basic tcpdump usage.

```bash
# Capture all traffic on interface eth0
sudo tcpdump -i eth0

# Capture traffic to/from a specific host
sudo tcpdump -i eth0 host 192.168.1.100

# Capture only TCP traffic on port 80
sudo tcpdump -i eth0 tcp port 80

# Capture only DNS traffic
sudo tcpdump -i eth0 udp port 53

# Save captured packets to a file (pcap format)
sudo tcpdump -i eth0 -w capture.pcap

# Read a previously saved capture file
sudo tcpdump -r capture.pcap

# Capture with verbose output (show packet details)
sudo tcpdump -i eth0 -v

# Capture with full hex dump
sudo tcpdump -i eth0 -XX

# Capture only ARP traffic
sudo tcpdump -i eth0 arp

# Capture only the first 100 packets
sudo tcpdump -i eth0 -c 100

# Capture traffic between two hosts
sudo tcpdump -i eth0 host 192.168.1.100 and host 192.168.1.1

# Capture traffic NOT from a specific host
sudo tcpdump -i eth0 not host 192.168.1.1

# Capture SYN packets only
sudo tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn) != 0'
```

**tshark (Wireshark's command-line version):**
```bash
# Capture traffic on interface eth0
tshark -i eth0

# Capture with display filter
tshark -i eth0 -Y "http.request.method == GET"

# Read a pcap file with a filter
tshark -r capture.pcap -Y "dns"

# Extract specific fields
tshark -r capture.pcap -T fields -e ip.src -e ip.dst -e http.host

# Capture and save to file
tshark -i eth0 -w output.pcap
```

**Packet Capture Libraries:**

| Library | Platform | Description |
|---------|----------|-------------|
| **libpcap** | Linux/macOS/Unix | The standard packet capture library on Unix-like systems. tcpdump and Wireshark use it. |
| **WinPcap** | Windows (legacy) | Windows port of libpcap. No longer actively developed. |
| **Npcap** | Windows (current) | Modern replacement for WinPcap. Used by current versions of Wireshark and Nmap on Windows. Supports raw packet capture, loopback capture, and monitor mode for Wi-Fi. |
| **AirPcap** | Windows | Specialized USB adapter + driver for wireless packet capture in monitor mode on Windows. Allows capture of 802.11 management and control frames. Paired with Wireshark. |

> Exam trap: AirPcap is a **hardware device** (USB adapter), not just software. It enables wireless sniffing in monitor mode on Windows. On Linux, monitor mode is natively supported by many wireless chipsets without special hardware.

### 1.5 Sniffing Countermeasures — Complete List

| Countermeasure | What It Prevents |
|---------------|-----------------|
| **Port Security** | MAC flooding — limits the number of MAC addresses per switch port |
| **Dynamic ARP Inspection (DAI)** | ARP poisoning — validates ARP packets against DHCP snooping binding table |
| **DHCP Snooping** | DHCP starvation + rogue DHCP servers — filters DHCP messages on untrusted ports |
| **IP Source Guard** | IP spoofing — validates source IP addresses against DHCP snooping binding table |
| **802.1X (Port-Based Network Access Control)** | Unauthorized network access — authenticates devices before granting network access |
| **Encryption (HTTPS, SSH, VPN, IPsec)** | Cleartext interception — even if traffic is sniffed, it cannot be read |
| **Static ARP entries** | ARP poisoning — hardcoded entries cannot be overwritten by forged ARP replies |
| **VLAN segmentation** | Limits sniffing scope — traffic stays within the VLAN |
| **Network monitoring tools (IDS/IPS)** | Detects ARP anomalies, excessive broadcasts, MAC flooding |
| **Switched network (instead of hub)** | Passive sniffing — traffic is only sent to the destination port |
| **DNSSEC** | DNS poisoning — cryptographically signs DNS records |
| **DNS over HTTPS (DoH) / DNS over TLS (DoT)** | DNS interception — encrypts DNS queries |

### 1.6 Protocols Vulnerable to Sniffing

These protocols transmit data in cleartext. If an attacker can sniff the traffic, they can read everything:

| Protocol | Port | What Is Exposed |
|----------|------|----------------|
| **HTTP** | 80 | Web content, form data, session cookies, credentials |
| **FTP** | 21 | Usernames, passwords, file contents |
| **Telnet** | 23 | Entire session including credentials (all keystrokes visible) |
| **SMTP** | 25 | Email content, sender/recipient addresses |
| **POP3** | 110 | Email credentials, email content |
| **IMAP** | 143 | Email credentials, email content |
| **SNMP v1/v2c** | 161/162 | Community strings (effectively passwords), device configuration |
| **LDAP** | 389 | Directory queries, potentially credentials |
| **rlogin/rsh** | 513/514 | Credentials, session content |

**Secure alternatives:** HTTPS (443), SFTP/SCP (22), SSH (22), SMTPS (465/587), POP3S (995), IMAPS (993), SNMPv3 (161 with encryption), LDAPS (636)

---

## Part 2: Social Engineering

Social engineering is the art of manipulating people into divulging confidential information or performing actions that compromise security. It exploits human psychology rather than technical vulnerabilities. The CEH exam dedicates significant coverage to social engineering types and countermeasures.

### 2.1 Why Social Engineering Works — Psychological Principles

Social engineering exploits these fundamental human tendencies:

| Principle | How Attackers Exploit It | Example |
|-----------|------------------------|---------|
| **Authority** | People comply with requests from perceived authority figures | "This is the IT Director. I need your password immediately for a critical security update." |
| **Urgency/Scarcity** | People make hasty decisions under time pressure | "Your account will be suspended in 30 minutes unless you verify your credentials NOW." |
| **Social Proof** | People follow the actions of others | "Everyone in your department has already completed this security form. You are the last one." |
| **Likability** | People are more compliant with people they like | Building rapport before making the request; flattery; common interests |
| **Reciprocity** | People feel obligated to return favors | Attacker does something helpful first, then asks for sensitive information |
| **Fear** | People act irrationally when afraid | "We detected unauthorized access from your account. Click here immediately to secure it." |
| **Trust** | People assume good intent from familiar entities | Spoofing a trusted brand's email address, using official-looking templates |

### 2.2 Social Engineering Attack Types — Complete Classification

#### 2.2.1 Phishing Attacks (Technology-Based)

**Phishing (General/Mass Phishing):**
Sending fraudulent emails to a large number of recipients, impersonating a trusted entity (bank, employer, cloud service). The email contains a malicious link or attachment.
- Broad targeting: sent to thousands or millions of recipients
- Low personalization: generic greeting ("Dear Customer")
- Goal: steal credentials, install malware, or redirect to a fake website
- Example: "Your PayPal account has been limited. Click here to verify your identity."

**Spear Phishing:**
A targeted phishing attack directed at a specific individual or small group. The attacker researches the target (using LinkedIn, company website, social media) and crafts a personalized, convincing email.
- Highly targeted: specific person or small group
- High personalization: uses the target's name, job title, references to real projects or colleagues
- Much higher success rate than mass phishing
- Example: "Hi Sarah, I saw your presentation at the Q3 sales meeting. I have some follow-up data in the attached spreadsheet. — James (VP Sales)"

**Whaling:**
A spear phishing attack specifically targeting senior executives (C-level: CEO, CFO, CTO, CISO). The stakes are higher because executives have access to sensitive data, financial systems, and decision-making authority.
- Targets: CEO, CFO, CTO, board members
- Often impersonates other executives, legal counsel, or regulatory bodies
- Common pretext: legal subpoena, regulatory action, board meeting documents, financial audit
- Example: "Dear CEO, please review the attached legal complaint filed against our company. Immediate response required. — External Counsel"

> Exam trap: The exam distinguishes these three clearly. Mass phishing = untargeted, many recipients. Spear phishing = targeted at a specific person/group. Whaling = spear phishing specifically targeting senior executives. If a question mentions a CEO or CFO as the target, the answer is whaling.

**Vishing (Voice Phishing):**
Social engineering conducted over the phone. The attacker calls the victim and impersonates a trusted entity (tech support, bank representative, IRS agent).
- Uses caller ID spoofing to appear legitimate
- Often creates urgency: "Your bank account has been compromised"
- May use automated IVR (Interactive Voice Response) systems to seem professional
- Example: Automated call saying "Your Social Security number has been suspended. Press 1 to speak with a representative."

**Smishing (SMS Phishing):**
Social engineering via text messages (SMS or messaging apps). The message contains a malicious link or requests the victim to call a number.
- Exploits the trust people place in text messages (higher open rate than email)
- Often impersonates banks, delivery services, or government agencies
- Example: "USPS: Your package cannot be delivered. Update your address: http://malicious-link.com"

**Pharming:**
Redirects users from a legitimate website to a fraudulent one without their knowledge. Unlike phishing (which requires the user to click a link), pharming corrupts the DNS resolution process so users are automatically redirected even if they type the correct URL.
- Techniques: DNS cache poisoning, hosts file modification, rogue DNS server
- More dangerous than phishing because the user sees the correct URL in the browser
- Example: User types "www.bank.com" but is silently redirected to a clone of the banking site at 10.0.0.99

#### 2.2.2 Human-Based Social Engineering (In-Person)

**Impersonation:**
The attacker pretends to be someone they are not — a delivery person, IT technician, new employee, vendor, or building inspector. They use props (uniforms, fake ID badges, clipboard, toolbox) and confident behavior to gain physical access to restricted areas or obtain information.

**Tailgating:**
Following an authorized person through a secured door or gate without using credentials. The attacker waits near a secured entrance and walks in right behind an authorized employee who has used their badge/key.
- The authorized person may not be aware of the attacker
- Exploits the physical gap between the door opening and closing
- Countermeasure: mantraps (airlock-style double doors), turnstiles, security guards

**Piggybacking:**
Similar to tailgating, but with the authorized person's knowledge and (unwitting) consent. The attacker asks the authorized person to hold the door: "I forgot my badge, could you let me in?" The authorized person complies out of politeness.
- The key difference from tailgating: in piggybacking, the authorized person knowingly allows the attacker in
- In tailgating, the authorized person is unaware

> Exam trap: The exam distinguishes tailgating (unauthorized person follows without the authorized person's knowledge) from piggybacking (unauthorized person asks the authorized person to hold the door, and they comply). If the question says "the employee held the door open for the attacker," that is piggybacking. If it says "the attacker followed closely behind without being noticed," that is tailgating.

**Shoulder Surfing:**
Observing someone's screen, keyboard, or documents from behind or beside them to steal sensitive information (passwords, PINs, credit card numbers).
- Can be done from a distance using binoculars, cameras, or zoom lenses
- Common locations: ATMs, airports, coffee shops, open-plan offices
- Countermeasure: privacy screens (polarized filters that narrow the viewing angle)

**Dumpster Diving:**
Searching through an organization's trash for sensitive information: discarded documents, printouts, sticky notes with passwords, old hard drives, CDs/USBs, organizational charts, phone directories.
- Legal in many jurisdictions (trash is considered abandoned property)
- Countermeasure: shredding (cross-cut, not strip-cut), secure disposal policies, locked dumpsters

**Eavesdropping:**
Listening to private conversations, phone calls, or meetings without authorization. Can be done physically (standing nearby) or electronically (wiretapping, bugs).

#### 2.2.3 Motivation-Based Social Engineering

**Pretexting:**
Creating a fabricated scenario (pretext) to trick the victim into providing information or performing an action. The attacker invents a convincing story and assumes a false identity that justifies their request.
- More elaborate than simple impersonation — involves a detailed backstory
- Example: Calling the helpdesk as "John from accounting" claiming to be locked out and needing a password reset. The attacker has researched John's name, employee ID, and department from LinkedIn.

**Baiting:**
Offering something enticing (the "bait") to lure the victim into a trap. The bait could be physical (USB drives left in parking lots) or digital (free software downloads containing malware).
- Physical baiting: Leave a USB drive labeled "Salary Data 2026" or "Confidential - Layoff List" in the company parking lot. Curious employees will plug it into their work computer.
- Digital baiting: "Download this free premium software" (contains a trojan)
- Example: A USB drive labeled "Executive Bonuses Q1" found in the lobby of a target company

**Quid Pro Quo ("Something for Something"):**
The attacker offers a service or favor in exchange for information. The attacker provides something of value (real or perceived) and then requests something in return.
- Classic example: Attacker calls random employees pretending to be IT support: "Hi, I'm from the helpdesk. We're fixing a network issue that may affect your computer. Can you give me your login credentials so I can check your account?"
- The "service" offered: fixing a non-existent IT problem
- What they get: the employee's credentials

**Honey Trap (Romance Scam):**
Using romantic or sexual attraction to manipulate a target. The attacker initiates a relationship (online or in person) with someone who has access to sensitive information or systems, then exploits the relationship to obtain that information.
- Long-term manipulation — may take weeks or months to build trust
- Often targets military, government, or corporate employees with security clearances

**Watering Hole Attack:**
Instead of attacking the target directly, the attacker compromises a website that the target frequently visits (the "watering hole"). When the target visits the compromised site, their system is infected via a drive-by download or exploit kit.

```
Attack flow:
1. Attacker identifies websites frequently visited by target employees
   (industry forums, supply chain portals, news sites, professional associations)
2. Attacker finds a vulnerability in one of those websites
3. Attacker injects malicious code (exploit kit, JavaScript redirect) into the website
4. Target employees visit the website during normal browsing
5. Their browsers are exploited; malware is silently installed
```

- Bypasses security controls that focus on email (phishing) — the traffic appears to be normal web browsing to a legitimate site
- Example: APT groups have compromised industry-specific forums and software download portals to target employees of specific companies

**Evil Twin:**
A rogue Wi-Fi access point that mimics a legitimate one. The attacker creates an access point with the same SSID (network name) as a trusted network (e.g., "Starbucks_WiFi", "Company_Guest", the airport's free Wi-Fi). Victims connect to the evil twin thinking it is the legitimate network. The attacker can then intercept all traffic.

```
Legitimate AP:  SSID "CoffeeShop_Free"  MAC: AA:BB:CC:DD:EE:FF  Signal: -50 dBm
Evil Twin:      SSID "CoffeeShop_Free"  MAC: 11:22:33:44:55:66  Signal: -30 dBm (stronger)

# Clients connect to the stronger signal — the evil twin
# All traffic flows through the attacker
```

```bash
# Creating an evil twin with airbase-ng (Kali Linux)
# Step 1: Put wireless adapter in monitor mode
sudo airmon-ng start wlan0

# Step 2: Create the evil twin AP
sudo airbase-ng --essid "CoffeeShop_Free" -c 6 wlan0mon

# Step 3: Set up IP forwarding and DHCP on the fake AP
# Step 4: Capture all traffic with Wireshark
```

- Clients auto-connect to saved networks with matching SSIDs (most devices do not verify the AP's MAC address or certificate)
- Countermeasure: Use VPNs on public Wi-Fi; verify AP certificates (WPA2-Enterprise with 802.1X); disable auto-connect

**Identity Theft:**
Stealing someone's personal information (Social Security number, date of birth, credit card numbers, bank account details) to impersonate them for financial gain, open fraudulent accounts, or access their existing accounts.
- Methods: phishing, data breaches, dumpster diving, mail theft, social engineering
- Not a technique per se, but a goal/outcome of social engineering

### 2.3 Social Engineering Phases

The exam tests the standard social engineering attack lifecycle:

1. **Research (Reconnaissance):** Gather information about the target organization and individuals (OSINT, social media, company website, LinkedIn, dumpster diving)
2. **Select Target:** Choose the most vulnerable or valuable target (receptionist, new employee, executive, IT helpdesk)
3. **Develop Relationship:** Establish trust with the target through repeated interactions, shared interests, or assumed authority
4. **Exploit Relationship:** Use the established trust to extract information, gain access, or install malware
5. **Exit:** Disengage without raising suspicion; cover tracks; use the obtained information for the actual attack

### 2.4 Social Engineering Countermeasures

The single most effective countermeasure against social engineering is **security awareness training**. No technical control can fully prevent human manipulation.

**Organizational Countermeasures:**

| Countermeasure | What It Addresses |
|---------------|------------------|
| **Security awareness training** | All social engineering — teaches employees to recognize and report attacks |
| **Regular phishing simulations** | Tests employee resistance to phishing; identifies who needs additional training |
| **Clear security policies** | Define procedures for verifying identity, handling sensitive information, reporting incidents |
| **Verification procedures** | Require callback verification before resetting passwords or sharing information by phone |
| **Classification and labeling** | Mark documents with classification levels so employees know what requires special handling |
| **Shredding policies** | Prevents dumpster diving — cross-cut shredders for all sensitive documents |
| **Visitor management** | Sign-in/sign-out, escort requirements, temporary badges for all visitors |
| **Physical access controls** | Badge readers, mantraps, turnstiles, security cameras, security guards |
| **Privacy screens** | Prevents shoulder surfing on monitors and laptops |
| **Clean desk policy** | Employees must clear desks of sensitive documents when they leave |
| **Multi-factor authentication** | Even if credentials are stolen, attacker cannot access accounts without the second factor |
| **Incident reporting process** | Easy, non-punitive way for employees to report suspicious calls, emails, or encounters |
| **Background checks** | Verify new employees and contractors before granting access |
| **Separation of duties** | No single person has enough access to cause major damage alone |

> Exam note: When the exam asks "What is the BEST countermeasure against social engineering?", the answer is almost always **security awareness training**. Technical controls help, but social engineering attacks exploit humans, and the primary defense is educating those humans.

### 2.5 Insider Threats

An insider threat comes from someone within the organization — a current or former employee, contractor, or business partner who has (or had) authorized access.

**Types of insiders:**
- **Malicious insider:** Intentionally causes harm (data theft, sabotage, espionage). Motivated by financial gain, revenge, ideology, or coercion.
- **Negligent insider:** Unintentionally causes harm through carelessness or ignorance (clicking phishing links, mishandling data, losing devices, using weak passwords).
- **Compromised insider:** An authorized user whose credentials have been stolen by an external attacker. The attacker uses the insider's legitimate access.

**Indicators of a malicious insider:**
- Accessing resources outside normal working hours
- Attempting to access data outside their role
- Copying large amounts of data to external devices
- Exhibiting dissatisfaction, discussing resignation, or facing termination
- Unusually high network or database activity
- Installing unauthorized software or tools

**Countermeasures:**
- User behavior analytics (UBA) / User and entity behavior analytics (UEBA)
- Data loss prevention (DLP) systems
- Least privilege access (users only have access to what they need)
- Monitoring and logging of privileged user activity
- Exit procedures: immediately revoke access upon termination
- Separation of duties and mandatory vacations

---

## Part 3: Denial of Service (DoS) and Distributed Denial of Service (DDoS)

### 3.1 DoS vs. DDoS

**Denial of Service (DoS):** An attack from a **single source** that aims to make a service, server, or network unavailable to legitimate users by overwhelming it with traffic or exploiting a vulnerability.

**Distributed Denial of Service (DDoS):** An attack from **multiple sources** (typically a botnet of thousands or millions of compromised machines) that overwhelms the target with traffic from many different IP addresses simultaneously.

| Aspect | DoS | DDoS |
|--------|-----|------|
| **Attack source** | Single machine | Multiple machines (botnet) |
| **Traffic volume** | Limited by single machine's bandwidth | Massive — combined bandwidth of all bots |
| **Blocking** | Easy — block the single source IP | Difficult — thousands of source IPs, blocking one does not help |
| **Attribution** | Easier to trace | Harder — traffic comes from compromised third-party machines |
| **Scale** | Smaller (typically < 1 Gbps) | Massive (can exceed 1 Tbps) |

### 3.2 DDoS Attack Categories

The CEH exam classifies DDoS attacks into three categories based on which OSI layer they target:

#### 3.2.1 Volumetric Attacks (Layer 3/4 — Network/Transport)

**Goal:** Saturate the target's network bandwidth by sending an enormous volume of traffic. The target's internet connection is overwhelmed, and legitimate traffic cannot get through.

**Measured in:** Bits per second (bps) — the higher the bandwidth consumed, the more effective the attack.

**UDP Flood:**
Sends a massive volume of UDP packets to random ports on the target. The target checks for applications listening on each port, finds none, and sends back ICMP "Destination Unreachable" packets. The sheer volume of incoming UDP packets and outgoing ICMP responses overwhelms the target.

```bash
# UDP flood using hping3
sudo hping3 --udp -p 80 --flood target_ip
```

**ICMP Flood (Ping Flood):**
Sends an overwhelming number of ICMP Echo Request (ping) packets to the target. The target must process each request and send an Echo Reply, consuming CPU and bandwidth.

```bash
# ICMP flood using hping3
sudo hping3 --icmp --flood target_ip

# Ping flood using standard ping
sudo ping -f target_ip    # -f = flood mode (Linux, requires root)
```

**Smurf Attack:**
An amplification attack that uses ICMP and IP spoofing. The attacker sends ICMP Echo Requests to a network's broadcast address with the source IP spoofed to be the victim's IP. Every host on the network responds with an ICMP Echo Reply — all directed at the victim.

```
Attack flow:
1. Attacker sends ICMP Echo Request to broadcast address 192.168.1.255
   Source IP is spoofed to: victim_ip (10.0.0.1)
2. Every host on the 192.168.1.0/24 network receives the request
3. All 254 hosts send ICMP Echo Reply to 10.0.0.1 (the victim)
4. Victim receives 254 replies for every 1 packet the attacker sends
   Amplification factor: up to 254x
```

**Countermeasure:** Configure routers to not forward directed broadcast traffic: `no ip directed-broadcast`

**Amplification Attacks:**
The attacker sends small requests to public servers (DNS, NTP, SSDP, Memcached) with the source IP spoofed to the victim's IP. The servers respond with much larger replies — all directed at the victim. The amplification factor is the ratio of response size to request size.

| Protocol | Amplification Factor | Port | Description |
|----------|---------------------|------|-------------|
| **DNS** | 28-54x | 53 | Small DNS query produces a large DNS response (especially with DNSSEC or ANY queries) |
| **NTP** | 556x | 123 | `monlist` command returns a list of last 600 clients — huge response to tiny request |
| **SSDP** | 30x | 1900 | Simple Service Discovery Protocol — used by UPnP devices |
| **Memcached** | 10,000-51,000x | 11211 | The highest amplification factor; a 15-byte request can produce a 750KB response |
| **CLDAP** | 56-70x | 389 | Connectionless LDAP |
| **SNMP** | 6x | 161 | GetBulkRequest returns multiple OID values |
| **Chargen** | Variable | 19 | Character generator — returns a stream of characters |

```bash
# DNS amplification attack concept:
# Attacker sends DNS query for a large record (ANY query for a domain with many records)
# Source IP is spoofed to victim's IP
# DNS server sends a large response (potentially 4096 bytes) to the victim
# For every 60-byte query, the victim receives a 4096-byte response (68x amplification)

# NTP amplification using monlist:
# Attacker sends a small "monlist" request to an NTP server
# Source IP spoofed to victim
# NTP server responds with a list of its last 600 clients
# 234-byte request produces ~100KB response (556x amplification)
```

**Countermeasure for amplification:**
- Configure DNS servers to disable recursion for external queries
- Disable NTP `monlist` command: `restrict default noquery` in ntp.conf
- Block UDP source port 19 (Chargen) at the firewall
- Implement BCP38/BCP84 (network ingress filtering) to prevent IP spoofing
- Use upstream DDoS mitigation services (Cloudflare, Akamai, AWS Shield)

#### 3.2.2 Protocol Attacks (Layer 3/4 — Network/Transport)

**Goal:** Exploit weaknesses in network protocols (TCP, ICMP) to exhaust server resources (connection tables, firewall state tables, load balancer capacity). These attacks do not require massive bandwidth — they consume server resources.

**Measured in:** Packets per second (pps).

**SYN Flood:**
The most common and most tested protocol attack on the CEH exam.

**How the TCP three-way handshake works normally:**
```
Client                    Server
  |--- SYN (seq=x) ------->|      Step 1: Client initiates connection
  |<-- SYN-ACK (seq=y, ack=x+1) --|  Step 2: Server responds, allocates resources
  |--- ACK (ack=y+1) ------>|      Step 3: Client confirms, connection established
```

**How a SYN flood works:**
The attacker sends thousands of SYN packets with spoofed source IPs. The server responds to each with a SYN-ACK and allocates resources (memory for the half-open connection, a slot in the connection table). The final ACK never arrives (because the source IP is fake). The server waits for the ACK to arrive (typically 75 seconds per half-open connection). The server's connection table fills up with half-open connections, and it can no longer accept new legitimate connections.

```
Attacker                   Server
  |--- SYN (spoofed IP 1) --->|   Server allocates resources, sends SYN-ACK to fake IP
  |--- SYN (spoofed IP 2) --->|   Server allocates more resources, sends SYN-ACK to fake IP
  |--- SYN (spoofed IP 3) --->|   Server allocates more resources...
  |--- SYN (spoofed IP 4) --->|   Server's connection table is filling up...
  |--- ...thousands more... ->|   CONNECTION TABLE FULL
                                   Server cannot accept new connections
                                   Legitimate users get "Connection refused"
```

```bash
# SYN flood using hping3
sudo hping3 -S -p 80 --flood --rand-source target_ip

# Explanation:
# -S         = set SYN flag
# -p 80      = target port 80
# --flood    = send packets as fast as possible
# --rand-source = use random spoofed source IP addresses

# SYN flood using Metasploit
msf6 > use auxiliary/dos/tcp/synflood
msf6 auxiliary(dos/tcp/synflood) > set RHOST target_ip
msf6 auxiliary(dos/tcp/synflood) > set RPORT 80
msf6 auxiliary(dos/tcp/synflood) > exploit
```

**SYN Flood Countermeasures:**
- **SYN Cookies:** The server does not allocate resources when receiving a SYN. Instead, it encodes the connection information in the sequence number of the SYN-ACK. Only when the client sends the final ACK (with the correct acknowledgment number derived from the SYN Cookie) does the server allocate resources. This prevents the connection table from filling up.
  ```bash
  # Enable SYN cookies on Linux
  sysctl -w net.ipv4.tcp_syncookies=1
  ```
- **Increase backlog queue:** Allow more half-open connections
  ```bash
  sysctl -w net.ipv4.tcp_max_syn_backlog=4096
  ```
- **Reduce SYN-ACK retries:** Lower the timeout for half-open connections
  ```bash
  sysctl -w net.ipv4.tcp_synack_retries=2
  ```
- **Firewall rate limiting:** Limit the number of SYN packets per second from any single source
- **DDoS mitigation services:** Cloud-based scrubbing centers (Cloudflare, Akamai Prolexic)

**Ping of Death:**
Sends an oversized ICMP packet (larger than the 65,535-byte maximum allowed by the IP protocol). The receiving system may crash or freeze when it tries to reassemble the oversized packet.

- Maximum IP packet size: 65,535 bytes
- Maximum ICMP data: 65,535 - 20 (IP header) - 8 (ICMP header) = 65,507 bytes
- The Ping of Death sends a packet larger than 65,535 bytes by exploiting IP fragmentation
- The individual fragments are legitimate, but when reassembled, they exceed the maximum size
- Largely patched on modern systems but still appears on the exam

```bash
# Ping of Death concept (oversized ping — patched on modern systems)
ping -l 65500 target_ip          # Windows
ping -s 65500 target_ip          # Linux
```

**Teardrop Attack:**
Sends fragmented IP packets with overlapping fragment offsets. When the target system tries to reassemble the fragments, the overlapping offsets cause a buffer overflow or crash.
- Exploits the IP fragment reassembly process
- Largely patched on modern operating systems
- Still tested on the CEH exam

**Christmas Tree (Xmas) Attack:**
Sends TCP packets with all flags set (FIN, URG, PSH — and sometimes SYN, RST, ACK). The name comes from the packet "lighting up like a Christmas tree" when viewed in a protocol analyzer. Can crash some systems or be used for OS fingerprinting and port scanning.

```bash
# Xmas scan/attack using nmap
nmap -sX target_ip

# Xmas attack using hping3
sudo hping3 --fin --urg --push -p 80 target_ip
```

#### 3.2.3 Application Layer Attacks (Layer 7)

**Goal:** Exploit weaknesses in application-layer protocols (HTTP, DNS, SMTP) to crash or overwhelm the application. These attacks require very little bandwidth but are devastating because they target the most resource-intensive part of the server (the application logic).

**Measured in:** Requests per second (rps).

**Slowloris:**
An HTTP attack that opens multiple connections to the target web server and keeps them open as long as possible by sending partial HTTP requests. The attacker periodically sends additional HTTP headers to prevent the server from closing the connection, but never completes the request. The server keeps all these connections open, waiting for the requests to complete, until it reaches its maximum connection limit and cannot serve legitimate users.

```
Normal HTTP request:
  GET / HTTP/1.1\r\n
  Host: target.com\r\n
  \r\n                   <-- Empty line signals end of headers; server processes the request

Slowloris partial request:
  GET / HTTP/1.1\r\n
  Host: target.com\r\n
  X-Custom: value1\r\n   <-- Sends a header every 10-15 seconds
  X-Custom: value2\r\n   <-- Sends another header...
  X-Custom: value3\r\n   <-- Never sends the final \r\n
  (connection stays open indefinitely)
```

```bash
# Slowloris attack concept
# Using the slowloris tool (Python)
slowloris target.com -p 80 -s 200

# -s 200 = open 200 socket connections
# Each connection sends partial headers to keep the connection alive
```

**Key characteristics of Slowloris:**
- Requires very little bandwidth (sends small header fragments)
- Targets connection-limited servers (Apache is vulnerable; Nginx is more resilient)
- Difficult to detect because each individual connection looks legitimate
- Countermeasure: set connection timeouts, limit connections per IP, use Nginx as a reverse proxy (Nginx uses an event-driven model and is not affected by connection-based exhaustion)

**RUDY (R-U-Dead-Yet?):**
An HTTP POST attack that sends very long content-length headers and then transmits the POST body one byte at a time, extremely slowly. The server keeps the connection open waiting for the full POST body to arrive.

```
RUDY attack flow:
1. Attacker sends: POST /login HTTP/1.1
                    Content-Length: 100000000 (100 million bytes)
2. Attacker sends POST body 1 byte every 10 seconds
3. Server keeps the connection open, waiting for the remaining 99,999,999 bytes
4. Multiply by hundreds of connections = server resources exhausted
```

**Key difference from Slowloris:** Slowloris keeps connections open with incomplete headers (before the body). RUDY keeps connections open by slowly sending the POST body (after the headers are complete).

**HTTP Flood:**
Sends a large number of seemingly legitimate HTTP GET or POST requests to a web server. Because each request appears to be a normal web request, it is difficult to distinguish from legitimate traffic.

- GET flood: requests resource-intensive pages (search queries, database-driven pages, large files)
- POST flood: submits form data that triggers expensive server-side processing
- Harder to block than volumetric attacks because the traffic looks legitimate
- Countermeasure: rate limiting, CAPTCHA, WAF (Web Application Firewall), behavioral analysis

**Pulse Wave DDoS:**
A DDoS attack pattern that sends traffic in short, intense bursts (pulses) rather than a continuous stream. The attack alternates between peaks of maximum intensity and periods of near-zero traffic.

```
Traditional DDoS:   ████████████████████████████████████  (continuous high traffic)

Pulse Wave DDoS:    ████    ████    ████    ████    ████  (burst-pause-burst pattern)
                    ^peak   ^pause  ^peak   ^pause  ^peak
```

**Why pulse wave is effective:**
- Overwhelms the target during each pulse (the peak traffic is extremely high)
- During pauses, the target's auto-scaling or DDoS mitigation may scale down
- When the next pulse hits, the mitigation has to scale up again — the transitions are the vulnerability
- Makes it harder for mitigation services to establish a stable filtering policy
- Allows the attacker to attack multiple targets simultaneously by rotating pulses between them

### 3.3 DDoS Attack Tools

**LOIC (Low Orbit Ion Cannon):**
- Open-source DDoS tool with a GUI
- Supports TCP, UDP, and HTTP floods
- Easy to use — requires no technical skill
- No IP spoofing (attacker's real IP is exposed in traffic) — users are easily traced and prosecuted
- "Hivemind" mode: voluntary botnet where users join an IRC channel and the tool automatically attacks the target specified by the channel operator
- Used by Anonymous hacktivist group in several high-profile attacks (Operation Payback)

**HOIC (High Orbit Ion Cannon):**
- Successor to LOIC
- Focused on HTTP floods
- Supports "booster scripts" — customizable scripts that randomize HTTP headers, user agents, and referrers to make traffic harder to filter
- Can target multiple URLs simultaneously
- More effective than LOIC at bypassing simple DDoS mitigation

**hping3:**
```bash
# SYN flood
sudo hping3 -S -p 80 --flood --rand-source target_ip

# UDP flood
sudo hping3 --udp -p 53 --flood target_ip

# ICMP flood
sudo hping3 --icmp --flood target_ip

# SYN flood from a specific spoofed source IP
sudo hping3 -S -p 80 --flood -a spoofed_ip target_ip

# Land attack (source = destination, source port = destination port)
sudo hping3 -S -p 80 -a target_ip --destport 80 target_ip

# Smurf-like attack (ICMP to broadcast address with spoofed source)
sudo hping3 --icmp --flood -a victim_ip broadcast_address
```

**Other tools the exam may reference:**
- **Slowloris:** Python-based HTTP slow-header attack tool
- **HULK (HTTP Unbearable Load King):** HTTP flood tool that generates unique requests to bypass caching
- **Torshammer:** Slow POST attack tool that works through TOR for anonymity
- **GoldenEye:** HTTP/HTTPS DDoS attack tool
- **Xerxes:** Simple C-based DDoS tool

### 3.4 Botnets

A botnet is a network of compromised computers (bots/zombies) controlled by a single attacker (botmaster/bot herder) through a Command and Control (C&C/C2) infrastructure.

**Botnet Architecture:**

**Centralized (Client-Server) Model:**
```
                     Botmaster
                        |
                   C&C Server
                   /    |    \
                Bot1  Bot2  Bot3  ...  BotN
```
- All bots connect to a central C&C server (IRC, HTTP, or custom protocol)
- Easy to manage but has a single point of failure — take down the C&C server and the botnet is disrupted
- Example: traditional IRC-based botnets

**Decentralized (Peer-to-Peer) Model:**
```
                Bot1 --- Bot2
                |   \   / |
                |    Bot3  |
                |   / \    |
                Bot4   Bot5
```
- Bots communicate directly with each other using P2P protocols
- No central C&C server — no single point of failure
- Harder to take down — removing one bot does not affect the rest
- Example: GameOver Zeus (P2P variant), Hajime

**Botnet Lifecycle:**
1. **Infection:** Compromise machines through phishing, exploits, drive-by downloads, brute force
2. **Rallying:** New bots connect to the C&C infrastructure and register themselves
3. **Command:** Botmaster issues commands (DDoS target, spam campaign, data exfiltration)
4. **Attack:** Bots execute the commands simultaneously
5. **Maintenance:** Botmaster updates bot malware, rotates C&C servers, adds new bots

**Mirai Botnet — Deep Dive:**
- Discovered in September 2016
- Targets IoT devices (routers, IP cameras, DVRs, smart home devices)
- Infection method: scans for devices with open Telnet (port 23) and tries 60+ default username/password combinations
- Once infected, the device joins the botnet and begins scanning for new victims
- October 21, 2016: Mirai launched a massive DDoS attack against Dyn DNS, reaching ~1.2 Tbps
  - Dyn DNS is used by major websites (Twitter, Netflix, Reddit, CNN, Spotify, GitHub)
  - The attack caused widespread internet outages across the United States and Europe
- Source code was publicly released by the author ("Anna-senpai") on HackForums
- Led to numerous variants: Okiru, Satori, Masuta, Hakai
- Key lesson: IoT devices with default credentials are one of the largest attack surfaces on the internet

### 3.5 DoS/DDoS Countermeasures

**Network-Level Countermeasures:**

| Countermeasure | What It Mitigates |
|---------------|------------------|
| **Ingress/Egress filtering (BCP38)** | IP spoofing — blocks packets with source IPs that do not belong to the network |
| **Rate limiting** | Floods — limits packets per second from any single source |
| **SYN Cookies** | SYN floods — avoids allocating resources until the handshake is complete |
| **Blackhole routing / RTBH** | All DDoS — routes attack traffic to a null route (drops it), but also drops legitimate traffic to the target |
| **Traffic scrubbing services** | All DDoS — routes traffic through a cloud-based scrubbing center that filters malicious traffic and forwards legitimate traffic |
| **CDN (Content Delivery Network)** | HTTP floods — distributes load across global edge servers (Cloudflare, Akamai, AWS CloudFront) |
| **Anycast** | All DDoS — distributes traffic across multiple geographically dispersed servers |
| **Firewall/IPS rules** | Known attack patterns — block specific attack signatures |
| **Load balancers** | Application-layer attacks — distribute traffic across multiple backend servers |
| **Over-provisioning bandwidth** | Volumetric attacks — having more bandwidth than the attacker can consume (expensive) |

**Application-Level Countermeasures:**

| Countermeasure | What It Mitigates |
|---------------|------------------|
| **Web Application Firewall (WAF)** | HTTP floods, Slowloris, RUDY — inspects HTTP requests and blocks malicious patterns |
| **CAPTCHA** | Bot-driven HTTP floods — requires human verification |
| **Connection timeouts** | Slow attacks (Slowloris, RUDY) — close connections that do not complete within a time limit |
| **Request rate limiting per IP** | HTTP floods — limit requests per second per client |
| **Reverse proxy (Nginx)** | Slowloris — Nginx's event-driven architecture is not affected by slow connections |
| **Geo-blocking** | Region-specific attacks — block traffic from countries where you have no users |

**Organizational Countermeasures:**
- DDoS response plan (documented procedures, escalation contacts, ISP contact information)
- Contracts with DDoS mitigation providers (Cloudflare, Akamai Prolexic, AWS Shield Advanced)
- Redundancy and failover (multiple data centers, failover DNS, hot standby servers)
- Regular DDoS drills and tabletop exercises

---

## Part 4: Exam-Style Practice Questions

**Question 1:**
An attacker sends thousands of Ethernet frames with random source MAC addresses to a switch. The switch's CAM table overflows and the switch begins broadcasting all frames to all ports. What is this attack called?

A. ARP poisoning
B. MAC flooding
C. DHCP starvation
D. VLAN hopping

**Answer: B.** MAC flooding (also called CAM table overflow) sends frames with spoofed MAC addresses to fill the switch's CAM table. When the table is full, the switch enters fail-open mode and broadcasts all frames to all ports, allowing the attacker to sniff all traffic. The tool used is `macof` from the dsniff suite.

---

**Question 2:**
An attacker sends gratuitous ARP replies to both the victim and the default gateway, associating their own MAC address with the other's IP address. All traffic between the victim and gateway now flows through the attacker. What attack is this?

A. DNS poisoning
B. MAC flooding
C. ARP poisoning
D. DHCP starvation

**Answer: C.** ARP poisoning (ARP spoofing) sends forged ARP replies to associate the attacker's MAC address with the IP address of the gateway (in the victim's ARP cache) and with the victim's IP (in the gateway's ARP cache). This creates a Man-in-the-Middle position. Tools include Ettercap, BetterCAP, and arpspoof.

---

**Question 3:**
Which switch security feature validates ARP packets against the DHCP Snooping binding table to prevent ARP poisoning attacks?

A. Port Security
B. DHCP Snooping
C. Dynamic ARP Inspection (DAI)
D. 802.1X

**Answer: C.** Dynamic ARP Inspection (DAI) intercepts ARP packets on untrusted ports and validates them against the DHCP Snooping binding table. If the IP-to-MAC mapping in the ARP packet does not match a legitimate DHCP binding, the packet is dropped. DAI requires DHCP Snooping to be enabled.

---

**Question 4:**
An attacker creates a Wi-Fi access point with the same SSID as the legitimate corporate guest network. Employees connect to the attacker's access point thinking it is the real one. What is this attack called?

A. Watering hole attack
B. Evil twin attack
C. Phishing
D. Pharming

**Answer: B.** An evil twin is a rogue access point that mimics a legitimate one by using the same SSID. Victims connect to it because their devices auto-connect to saved networks or because the evil twin has a stronger signal. The attacker can then intercept all traffic.

---

**Question 5:**
A CEO receives a carefully crafted phishing email that appears to come from the company's legal counsel, referencing a real pending lawsuit. What type of social engineering attack is this?

A. Phishing
B. Spear phishing
C. Whaling
D. Vishing

**Answer: C.** Whaling is a spear phishing attack specifically targeting senior executives (CEO, CFO, CTO). The email is highly personalized and references real events or concerns relevant to the executive's role. While it is technically a type of spear phishing, the specific targeting of a C-level executive makes it whaling.

---

**Question 6:**
An attacker follows an employee through a secured door immediately after the employee uses their access badge. The employee does not notice the attacker. What is this technique called?

A. Piggybacking
B. Tailgating
C. Shoulder surfing
D. Impersonation

**Answer: B.** Tailgating is following an authorized person through a secured door without the person's knowledge. The key distinction: the authorized person is unaware. If the attacker had asked the employee to hold the door, that would be piggybacking (the employee knowingly allows access).

---

**Question 7:**
An attacker sends TCP SYN packets with spoofed source IP addresses to a web server. The server responds with SYN-ACK packets to the spoofed addresses and allocates resources for half-open connections. The server's connection table fills up and it can no longer accept connections. What attack is this?

A. UDP flood
B. SYN flood
C. Ping of Death
D. Slowloris

**Answer: B.** A SYN flood exploits the TCP three-way handshake. The attacker sends SYN packets with spoofed IPs. The server allocates resources for each half-open connection (SYN_RECEIVED state) and waits for the final ACK that never comes. The connection table fills up, preventing new connections. The primary countermeasure is SYN Cookies.

---

**Question 8:**
Which countermeasure prevents SYN flood attacks by encoding connection information in the SYN-ACK sequence number, avoiding resource allocation until the handshake is complete?

A. Rate limiting
B. SYN Cookies
C. Blackhole routing
D. Ingress filtering

**Answer: B.** SYN Cookies are a technique where the server does not allocate memory for a half-open connection when it receives a SYN. Instead, it encodes the connection parameters (timestamp, MSS, source/destination) into the SYN-ACK sequence number. Only when the client sends the final ACK (proving it received the SYN-ACK) does the server allocate resources. This eliminates the half-open connection queue entirely.

---

**Question 9:**
An attacker opens hundreds of HTTP connections to a web server and sends incomplete HTTP headers, periodically sending additional header lines to keep the connections alive without completing the requests. The server reaches its maximum connection limit. What attack is this?

A. SYN flood
B. HTTP flood
C. Slowloris
D. RUDY

**Answer: C.** Slowloris opens multiple connections to a web server and keeps them alive by sending partial HTTP request headers. The server keeps each connection open, waiting for the headers to complete (the final `\r\n\r\n` that signals the end of headers). The server eventually reaches its maximum connection limit. This is different from RUDY, which sends a complete header but slowly sends the POST body.

---

**Question 10:**
An attacker sends a small DNS query with the source IP spoofed to the victim's IP. The DNS server sends a large response to the victim. The response is 50 times larger than the query. What type of DDoS attack is this?

A. SYN flood
B. DNS amplification attack
C. DNS poisoning
D. HTTP flood

**Answer: B.** A DNS amplification attack is a type of volumetric DDoS attack where the attacker sends small DNS queries (often ANY or DNSSEC queries) to open DNS resolvers with the source IP spoofed to the victim's address. The DNS servers respond with large replies directed at the victim. The amplification factor for DNS is typically 28-54x.

---

**Question 11:**
Which DDoS attack pattern alternates between intense traffic bursts and periods of near-zero traffic, making it harder for auto-scaling and mitigation systems to stabilize?

A. Volumetric attack
B. Application layer attack
C. Pulse wave DDoS
D. Amplification attack

**Answer: C.** Pulse wave DDoS sends traffic in short, high-intensity bursts (pulses) separated by pauses. During pauses, mitigation systems may scale down, only to be overwhelmed when the next pulse arrives. The constant scaling up and down creates instability that the attacker exploits.

---

**Question 12:**
The Mirai botnet primarily spreads by:

A. Sending phishing emails with malicious attachments
B. Exploiting web application vulnerabilities
C. Scanning for IoT devices with default Telnet credentials
D. Using zero-day kernel exploits

**Answer: C.** Mirai scans the internet for IoT devices (routers, IP cameras, DVRs) with open Telnet (port 23) and attempts to log in using a list of 60+ factory-default username/password combinations. Once authenticated, it infects the device and adds it to the botnet. There is no exploit involved — only default credentials.

---

**Question 13:**
What is the BEST countermeasure against social engineering attacks?

A. Firewall rules
B. Intrusion Detection Systems
C. Encryption
D. Security awareness training

**Answer: D.** Security awareness training is the most effective countermeasure against social engineering because social engineering targets humans, not technology. No firewall, IDS, or encryption can prevent an employee from being manipulated into revealing their credentials over the phone. Training teaches employees to recognize social engineering tactics and respond appropriately.

---

**Question 14:**
An attacker compromises a popular industry news website that is frequently visited by employees of the target company. When target employees visit the compromised website, malware is silently installed on their systems. What type of attack is this?

A. Spear phishing
B. Drive-by download
C. Watering hole attack
D. Evil twin

**Answer: C.** A watering hole attack compromises a website that the target frequently visits (the "watering hole"). Instead of attacking the target directly (via phishing), the attacker waits for the target to visit the compromised site. While a drive-by download is the mechanism used, the strategic targeting of a website known to be visited by the target makes this a watering hole attack.

---

**Question 15:**
Which Wireshark display filter shows only TCP SYN packets (connection initiations, no SYN-ACK)?

A. `tcp.flags.syn == 1`
B. `tcp.flags.syn == 1 && tcp.flags.ack == 0`
C. `tcp.flags == 0x02`
D. Both B and C

**Answer: D.** Both filters achieve the same result. `tcp.flags.syn == 1 && tcp.flags.ack == 0` explicitly filters for packets where SYN is set and ACK is not set (pure SYN, not SYN-ACK). `tcp.flags == 0x02` filters for the exact TCP flags value 0x02 (only the SYN bit set). Filter A (`tcp.flags.syn == 1`) alone would also match SYN-ACK packets, which is not what was asked.

---

## Part 5: Quick Reference — Tool Cheat Sheet

| Tool | Category | Key Use |
|------|----------|---------|
| **Wireshark** | Packet Analyzer | GUI-based protocol analyzer; capture and analyze network traffic; 3,000+ protocols |
| **tcpdump** | Packet Capture | Command-line packet capture tool; available on all Unix/Linux systems |
| **tshark** | Packet Analyzer | Wireshark's command-line version; scriptable, can extract specific fields |
| **Ettercap** | MITM/Sniffing | ARP poisoning, DNS spoofing, credential sniffing; GUI and text modes |
| **BetterCAP** | MITM/Sniffing | Modern replacement for Ettercap; ARP spoofing, DNS spoofing, SSL stripping, Wi-Fi attacks |
| **macof** | MAC Flooding | Floods switch CAM table with random MAC addresses (part of dsniff suite) |
| **arpspoof** | ARP Poisoning | Sends forged ARP replies to redirect traffic (part of dsniff suite) |
| **Yersinia** | Layer 2 Attacks | DHCP starvation, STP attacks, VLAN hopping, CDP attacks |
| **LOIC** | DDoS | Open-source; TCP/UDP/HTTP floods; no IP spoofing; GUI-based |
| **HOIC** | DDoS | HTTP flood with booster scripts; successor to LOIC |
| **hping3** | Packet Crafting | Custom TCP/UDP/ICMP packets; SYN floods, port scanning, firewall testing |
| **Slowloris** | Application DoS | HTTP slow-header attack; keeps connections open with incomplete headers |
| **WinPcap/Npcap** | Packet Capture Library | Windows packet capture drivers; Npcap is the modern replacement for WinPcap |
| **AirPcap** | Wireless Capture | USB hardware adapter for wireless packet capture in monitor mode on Windows |

---

## Part 6: Key Concepts Summary

1. **Passive vs. Active sniffing:** Passive = capture only (works on hubs/Wi-Fi). Active = inject packets to redirect traffic on switches (MAC flooding, ARP poisoning, DHCP starvation).
2. **MAC flooding** fills the CAM table, causing the switch to fail-open (broadcast mode). Countermeasure: port security.
3. **ARP poisoning** sends forged ARP replies to redirect traffic through the attacker (MITM). Countermeasure: Dynamic ARP Inspection (DAI), which requires DHCP Snooping.
4. **DHCP starvation** exhausts the DHCP server's IP pool, then a rogue DHCP server provides malicious settings. Countermeasure: DHCP Snooping.
5. **DNS poisoning** corrupts DNS cache to redirect users to attacker-controlled servers. Countermeasure: DNSSEC, DoH/DoT.
6. **SPAN port** is the legitimate way to sniff traffic on a switched network (port mirroring).
7. **Wireshark filters:** Know `ip.addr`, `tcp.port`, `http.request.method`, `tcp.flags.syn`, `dns`, `arp`.
8. **Social engineering types:** Phishing (mass), Spear phishing (targeted individual), Whaling (targeted executive), Vishing (phone), Smishing (SMS).
9. **Tailgating vs. Piggybacking:** Tailgating = follows without knowledge. Piggybacking = authorized person knowingly holds the door.
10. **Watering hole:** Compromise a website the target visits regularly, instead of attacking the target directly.
11. **Evil twin:** Rogue Wi-Fi AP with the same SSID as a legitimate network.
12. **Best social engineering countermeasure:** Security awareness training.
13. **DoS vs. DDoS:** DoS = single source. DDoS = multiple sources (botnet).
14. **DDoS categories:** Volumetric (bandwidth saturation), Protocol (resource exhaustion), Application layer (request-based).
15. **SYN flood:** Exploits TCP handshake; fills connection table with half-open connections. Countermeasure: SYN Cookies.
16. **Slowloris:** Sends incomplete HTTP headers to exhaust server connections. Targets Apache; Nginx is resilient.
17. **RUDY:** Sends HTTP POST body one byte at a time to exhaust connections.
18. **Amplification attacks:** DNS (28-54x), NTP (556x), Memcached (10,000-51,000x). Require IP spoofing.
19. **Smurf attack:** ICMP to broadcast address with spoofed source IP. Countermeasure: `no ip directed-broadcast`.
20. **Pulse wave DDoS:** Alternating bursts and pauses; destabilizes auto-scaling and mitigation systems.
21. **Mirai botnet:** Targets IoT devices with default Telnet credentials; caused the Dyn DNS attack (2016).
22. **LOIC vs. HOIC:** LOIC is simpler (TCP/UDP/HTTP floods, no spoofing). HOIC is more advanced (HTTP floods with booster scripts for evasion).
