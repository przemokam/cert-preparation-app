# CEH Day 1 -- Domain 1: Information Security Overview (6%) + Domain 2: Reconnaissance Techniques (17%)

---

# PART A: DOMAIN 1 -- Information Security and Ethical Hacking Overview (6%)

---

## 1.1 Information Security Fundamentals

### The CIA Triad

The three core pillars of information security:

| Principle | Definition | Example Attack | Example Control |
|-----------|-----------|----------------|-----------------|
| **Confidentiality** | Information is accessible only to authorized individuals | Sniffing, shoulder surfing, social engineering | Encryption, access controls, data classification |
| **Integrity** | Information is accurate and unaltered | Man-in-the-middle, data tampering, trojan | Hashing, digital signatures, checksums |
| **Availability** | Information and systems are accessible when needed | DoS/DDoS, ransomware, hardware failure | Redundancy, load balancing, backups, RAID |

### Beyond CIA -- Additional Security Concepts

- **Authenticity** -- Verifying the identity of users, processes, or devices (achieved through authentication mechanisms)
- **Non-repudiation** -- Ensuring a party cannot deny having performed an action (achieved through digital signatures, audit logs, timestamps)
- **AAA Framework:**
  - **Authentication** -- Who are you? (passwords, biometrics, tokens)
  - **Authorization** -- What are you allowed to do? (ACLs, RBAC, ABAC)
  - **Accounting** -- What did you do? (logging, auditing, SIEM)

### Defense in Depth

A layered security strategy. If one layer fails, the next provides protection:

```
Physical Security -> Network Security -> Host Security -> Application Security -> Data Security
      |                    |                  |                   |                    |
  Guards, locks      Firewalls, IDS     Antivirus, patching   Input validation    Encryption
  Fences, CCTV       Segmentation       Hardening             WAF                 DLP, backups
```

### Types of Security Controls

| Category | Preventive | Detective | Corrective |
|----------|-----------|-----------|------------|
| **Administrative** | Security policies, training | Log review, audits | Incident response plan |
| **Technical** | Firewalls, encryption | IDS/IPS, SIEM | Patch management |
| **Physical** | Locks, fences, mantraps | CCTV, motion sensors | Fire suppression |

---

## 1.2 Threat Landscape

### Threat Actors / Hacker Types

| Type | Alias | Motivation | Legal? |
|------|-------|-----------|--------|
| **White Hat** | Ethical hacker | Authorized security testing | Yes |
| **Black Hat** | Cracker | Malicious intent, personal gain | No |
| **Grey Hat** | -- | Tests without permission but no malicious intent | No (unauthorized) |
| **Script Kiddie** | Skiddie | Uses pre-made tools, limited skill | No |
| **Hacktivist** | -- | Political or social motivation | No |
| **State-Sponsored** | APT actor | Espionage, cyberwarfare | Depends on jurisdiction |
| **Suicide Hacker** | -- | No concern about being caught | No |
| **Insider Threat** | -- | Disgruntled employee, negligence | No |
| **Cyber Terrorist** | -- | Create fear, disrupt critical infrastructure | No |

### Attack Vectors and Categories

- **Cloud-based threats** -- misconfigured storage, insecure APIs
- **Supply chain attacks** -- compromising third-party software/updates (e.g., SolarWinds)
- **Advanced Persistent Threats (APTs)** -- prolonged, targeted attacks by well-funded groups
- **Ransomware** -- encrypts data, demands payment
- **Zero-day exploits** -- exploiting previously unknown vulnerabilities
- **IoT-based attacks** -- leveraging insecure connected devices

### Types of Attacks by Category

| Category | Examples |
|----------|---------|
| **Operating System** | Buffer overflow, privilege escalation, unpatched vulnerabilities |
| **Application** | SQL injection, XSS, CSRF, insecure deserialization |
| **Misconfiguration** | Default credentials, open ports, verbose error messages |
| **Shrink-Wrap Code** | Exploiting default settings in off-the-shelf software |

---

## 1.3 Hacking Methodology (CEH Hacking Phases)

EC-Council defines five phases of ethical hacking:

```
Phase 1           Phase 2          Phase 3             Phase 4               Phase 5
Reconnaissance -> Scanning ->  Gaining Access ->  Maintaining Access ->  Clearing Tracks
(Footprinting)   (Enumeration)  (Exploitation)     (Persistence)         (Anti-forensics)
```

| Phase | Description | Example Activities |
|-------|------------|-------------------|
| **1. Reconnaissance** | Gathering information about the target | OSINT, Google dorking, Whois, social media |
| **2. Scanning** | Identifying live hosts, open ports, services | Nmap, Nessus, vulnerability scanning |
| **3. Gaining Access** | Exploiting vulnerabilities to enter systems | Password cracking, exploit frameworks, social engineering |
| **4. Maintaining Access** | Establishing persistence for future access | Backdoors, rootkits, trojans, scheduled tasks |
| **5. Clearing Tracks** | Removing evidence of compromise | Log deletion, timestamp manipulation, steganography |

---

## 1.4 Cyber Kill Chain (Lockheed Martin)

The Cyber Kill Chain describes the stages of a targeted cyberattack. Defenders aim to "break" the chain at the earliest possible stage.

| # | Phase | Description | Defender Action |
|---|-------|-------------|----------------|
| 1 | **Reconnaissance** | Attacker researches the target (email addresses, technologies, org structure) | Monitor for unusual reconnaissance (web logs, OSINT exposure) |
| 2 | **Weaponization** | Attacker creates a deliverable payload (malicious PDF, exploit kit) | Threat intelligence, malware analysis |
| 3 | **Delivery** | Attacker transmits the weapon (phishing email, USB drop, watering hole) | Email filtering, web filtering, user training |
| 4 | **Exploitation** | Attacker exploits a vulnerability to execute code | Patching, DEP, ASLR, application whitelisting |
| 5 | **Installation** | Attacker installs malware/backdoor on victim system | HIDS, antivirus, endpoint detection |
| 6 | **Command & Control (C2)** | Attacker establishes remote control channel | Network monitoring, DNS sinkholing, firewall rules |
| 7 | **Actions on Objectives** | Attacker achieves goals (exfiltration, destruction, encryption) | DLP, network segmentation, incident response |

**Exam tip:** Know all 7 phases in order. A common question: "An attacker has sent a phishing email with a malicious attachment. Which phase of the Cyber Kill Chain is this?" Answer: **Delivery**.

---

## 1.5 MITRE ATT&CK Framework

MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) is a knowledge base of adversary tactics and techniques based on real-world observations.

### Key Concepts

- **Tactics** -- The "why" -- the adversary's objective (e.g., Initial Access, Persistence, Lateral Movement)
- **Techniques** -- The "how" -- the method used to achieve the tactic (e.g., Phishing, Scheduled Task)
- **Sub-techniques** -- More specific variations of a technique
- **Procedures** -- Specific implementation by a threat group

### ATT&CK Tactics (Enterprise Matrix -- 14 tactics)

1. Reconnaissance
2. Resource Development
3. Initial Access
4. Execution
5. Persistence
6. Privilege Escalation
7. Defense Evasion
8. Credential Access
9. Discovery
10. Lateral Movement
11. Collection
12. Command and Control
13. Exfiltration
14. Impact

**Difference from Cyber Kill Chain:** ATT&CK is more granular, non-linear, and based on observed adversary behavior. The Kill Chain is a linear, high-level model.

---

## 1.6 Ethical Hacking Concepts

### What Makes Hacking "Ethical"?

1. **Written authorization** (Rules of Engagement / scope document / penetration testing agreement)
2. **Defined scope** -- what systems, networks, and methods are permitted
3. **Non-disclosure** -- findings are reported only to the client
4. **No damage** -- testing should not cause harm to systems or data
5. **Report all findings** -- including vulnerabilities found, even if not exploited

### Penetration Testing Types

| Type | Knowledge Level | Also Called |
|------|----------------|-------------|
| **Black Box** | No prior knowledge of the target | External testing |
| **White Box** | Full knowledge (source code, architecture, credentials) | Clear box, glass box |
| **Grey Box** | Partial knowledge (some credentials, limited documentation) | Translucent box |

### Penetration Testing Phases (EC-Council)

1. Pre-engagement (scope, RoE, legal agreements)
2. Reconnaissance / Information Gathering
3. Scanning / Threat Modeling
4. Vulnerability Assessment
5. Exploitation
6. Post-Exploitation
7. Reporting

### Vulnerability Assessment vs. Penetration Testing

| Aspect | Vulnerability Assessment | Penetration Testing |
|--------|------------------------|-------------------|
| **Goal** | Identify vulnerabilities | Exploit vulnerabilities |
| **Depth** | Broad, shallow | Narrow, deep |
| **Risk** | Low risk | Higher risk |
| **Output** | List of vulnerabilities with severity | Proof of exploitation, business impact |
| **Tools** | Nessus, Qualys, OpenVAS | Metasploit, Burp Suite, custom exploits |

---

## 1.7 Information Security Laws, Standards, and Regulations

### Key Laws and Regulations (Exam Favorites)

| Law/Standard | Scope | Key Points |
|-------------|-------|------------|
| **HIPAA** (Health Insurance Portability and Accountability Act) | US healthcare | Protects PHI (Protected Health Information); Privacy Rule, Security Rule, Breach Notification Rule |
| **SOX** (Sarbanes-Oxley Act) | US public companies | Financial reporting integrity; requires internal controls; CEO/CFO must certify financial statements |
| **PCI-DSS** (Payment Card Industry Data Security Standard) | Anyone processing credit cards | 12 requirements for handling cardholder data; not a law but an industry standard; quarterly scans by ASV required |
| **GDPR** (General Data Protection Regulation) | EU citizens' data (global reach) | Right to be forgotten, data portability, 72-hour breach notification, data protection officer (DPO), heavy fines (up to 4% of global revenue) |
| **DMCA** (Digital Millennium Copyright Act) | US digital copyright | Criminalizes circumvention of DRM; safe harbor for ISPs |
| **CFAA** (Computer Fraud and Abuse Act) | US computer crime | Criminalizes unauthorized access to computers; basis for US hacking prosecutions |
| **FISMA** (Federal Information Security Modernization Act) | US federal agencies | Requires cybersecurity programs for federal systems; ties to NIST frameworks |
| **GLBA** (Gramm-Leach-Bliley Act) | US financial institutions | Requires protection of consumers' financial information |
| **DPA** (Data Protection Act 2018) | UK | UK implementation of GDPR post-Brexit |
| **COPPA** (Children's Online Privacy Protection Act) | US websites targeting children | Parental consent required for collecting data from children under 13 |

### Key Standards and Frameworks

| Standard | Purpose |
|----------|---------|
| **ISO/IEC 27001** | Information security management system (ISMS) requirements |
| **ISO/IEC 27002** | Code of practice for information security controls |
| **NIST Cybersecurity Framework** | Identify, Protect, Detect, Respond, Recover |
| **NIST SP 800-53** | Security and privacy controls for federal systems |
| **CIS Controls** | Prioritized set of cybersecurity best practices |
| **OWASP** | Web application security standards and guidelines |
| **COBIT** | IT governance framework |
| **ITIL** | IT service management |

### Incident Response Phases (NIST SP 800-61)

1. **Preparation** -- policies, tools, team training
2. **Detection and Analysis** -- identify and confirm the incident
3. **Containment, Eradication, and Recovery** -- stop the spread, remove the threat, restore systems
4. **Post-Incident Activity** -- lessons learned, documentation, improvement

**Alternative: SANS Incident Response (6 phases):**
1. Preparation
2. Identification
3. Containment
4. Eradication
5. Recovery
6. Lessons Learned

---

## 1.8 Risk Management Concepts

### Risk Formula

```
Risk = Threat x Vulnerability x Impact (Asset Value)
```

- **Threat** -- a potential cause of an unwanted incident
- **Vulnerability** -- a weakness that can be exploited
- **Asset** -- anything of value to the organization
- **Impact** -- the consequence of a threat exploiting a vulnerability
- **Exploit** -- code or technique that takes advantage of a vulnerability

### Risk Treatment Options

| Option | Description |
|--------|------------|
| **Risk Avoidance** | Eliminate the risk by removing the activity |
| **Risk Mitigation** | Reduce the risk with controls |
| **Risk Transfer** | Shift the risk to a third party (insurance, outsourcing) |
| **Risk Acceptance** | Acknowledge the risk and accept potential consequences |

### Threat Intelligence

- **Strategic** -- high-level, non-technical, for executives
- **Tactical** -- TTPs (Tactics, Techniques, Procedures) for defenders
- **Operational** -- specific, actionable details about upcoming attacks
- **Technical** -- IoCs (Indicators of Compromise): IP addresses, hashes, domains

**Threat Intelligence Sources:** STIX/TAXII (structured threat sharing), OSINT feeds, ISACs, dark web monitoring

---

# PART B: DOMAIN 2 -- Reconnaissance Techniques (17%)

---

## 2.1 Footprinting Concepts

Footprinting (reconnaissance) is the first step in ethical hacking. The goal is to collect as much information as possible about the target before any active engagement.

### Passive vs. Active Reconnaissance

| Aspect | Passive Reconnaissance | Active Reconnaissance |
|--------|----------------------|---------------------|
| **Definition** | Gathering information without directly interacting with the target | Directly interacting with the target to gather information |
| **Detection Risk** | Very low -- no direct contact | Higher -- target may detect the activity |
| **Examples** | OSINT, Google dorking, Whois, public records, social media, job postings | Port scanning, ping sweeps, banner grabbing, DNS zone transfers |
| **Legal Risk** | Generally legal | May require authorization |

### Information Gathered During Footprinting

**Organization Information:**
- Employee names, email addresses, phone numbers
- Organizational structure, key personnel
- Physical locations, branch offices
- Technology stack (from job postings, press releases)
- Business relationships, partners, vendors

**Network Information:**
- Domain names, subdomains
- IP address ranges (ARIN, RIPE, APNIC)
- DNS records and zone data
- Network topology
- Autonomous System Numbers (ASN)
- Routing information (BGP)

**System Information:**
- Operating systems (via fingerprinting)
- Running services and versions
- Open ports
- Web server type and version
- Firewall and IDS presence

---

## 2.2 OSINT (Open Source Intelligence)

OSINT is the collection and analysis of information from publicly available sources.

### Key OSINT Sources and Tools

| Source | Tool / Method | Information Gathered |
|--------|-------------|---------------------|
| **Search Engines** | Google, Bing, DuckDuckGo | Cached pages, documents, directories |
| **Social Media** | LinkedIn, Facebook, Twitter/X | Employee names, roles, technologies used |
| **Job Postings** | Indeed, LinkedIn Jobs, Glassdoor | Technology stack, internal tools, team structure |
| **WHOIS** | whois command, ARIN, RIPE | Domain owner, registrar, name servers, contact info |
| **DNS** | nslookup, dig, host, DNSdumpster | IP addresses, MX records, subdomains |
| **Web Archives** | Wayback Machine (archive.org) | Historical website content, removed pages |
| **Code Repositories** | GitHub, GitLab, Bitbucket | Source code, API keys, credentials, internal docs |
| **Financial Records** | SEC EDGAR, annual reports | Business structure, revenue, acquisitions |
| **IoT Search** | Shodan, Censys, ZoomEye | Internet-facing devices, banners, versions |
| **People Search** | Pipl, Spokeo, PeekYou | Personal information, addresses, phone numbers |
| **Metadata** | FOCA, ExifTool, Metagoofil | Document metadata: usernames, software versions, paths |

### Major OSINT Tools

| Tool | Purpose |
|------|---------|
| **Maltego** | Visual link analysis and data mining; maps relationships between entities (people, domains, IPs) |
| **theHarvester** | Collects emails, subdomains, IPs, and URLs from public sources |
| **Recon-ng** | Full-featured reconnaissance framework with modules (similar to Metasploit for recon) |
| **Shodan** | Search engine for Internet-connected devices; reveals services, banners, vulnerabilities |
| **Censys** | Similar to Shodan; scans the Internet and provides data on hosts and certificates |
| **SpiderFoot** | Automated OSINT collection tool; integrates many data sources |
| **FOCA** | Extracts metadata from documents (PDF, DOCX, XLSX) found on target websites |
| **Metagoofil** | Extracts metadata from public documents |
| **OSRFramework** | Username enumeration across platforms |

---

## 2.3 Google Dorking (Google Hacking)

Google dorking uses advanced search operators to find sensitive information indexed by Google.

### Key Google Operators

| Operator | Description | Example |
|----------|------------|---------|
| `site:` | Restrict results to a specific domain | `site:example.com` |
| `intitle:` | Search for words in the page title | `intitle:"index of"` |
| `allintitle:` | All words must be in the title | `allintitle:admin login` |
| `inurl:` | Search for words in the URL | `inurl:admin` |
| `allinurl:` | All words must be in the URL | `allinurl:admin panel` |
| `filetype:` | Search for specific file types | `filetype:pdf site:example.com` |
| `ext:` | Same as filetype | `ext:sql` |
| `intext:` | Search for words in the page body | `intext:"password"` |
| `cache:` | View Google's cached version of a page | `cache:example.com` |
| `link:` | Find pages linking to a URL | `link:example.com` |
| `related:` | Find similar websites | `related:example.com` |
| `info:` | Get information about a URL | `info:example.com` |
| `-` (minus) | Exclude results | `site:example.com -www` |
| `""` (quotes) | Exact phrase match | `"admin login page"` |
| `*` (wildcard) | Matches any word | `"password * admin"` |
| `OR` / `|` | Boolean OR | `site:example.com filetype:pdf OR filetype:doc` |

### Common Google Dorks for Security Testing

```
# Find login pages
intitle:"login" site:example.com

# Find directory listings
intitle:"index of" site:example.com

# Find exposed configuration files
filetype:env site:example.com
filetype:xml inurl:config
filetype:ini inurl:config

# Find SQL files or database dumps
filetype:sql "insert into" site:example.com
filetype:sql "password"

# Find exposed log files
filetype:log site:example.com
filetype:log inurl:password

# Find exposed admin panels
inurl:/admin site:example.com
inurl:"/wp-admin" site:example.com

# Find sensitive documents
filetype:xls inurl:"email" site:example.com
filetype:pdf "confidential" site:example.com

# Find vulnerable web servers
intitle:"Apache2 Ubuntu Default Page"
intitle:"Test Page for the Apache HTTP Server"

# Find open webcams
inurl:"/view.shtml"
intitle:"Live View / - AXIS"

# Find exposed phpinfo pages
inurl:phpinfo.php
```

**Exam tip:** The **Google Hacking Database (GHDB)** at exploit-db.com/google-hacking-database is a repository of known Google dorks. Know that it exists and what it is used for.

---

## 2.4 Whois and DNS Enumeration

### Whois Lookup

Whois provides registration information about domain names and IP addresses.

**Information obtained from Whois:**
- Domain registrar and registration dates
- Registrant name, organization, address, phone, email
- Name servers
- Domain status (clientTransferProhibited, etc.)
- Expiration date
- Administrative and technical contacts

**Command-line usage:**
```bash
# Domain Whois lookup
whois example.com

# IP address Whois lookup
whois 93.184.216.34

# Query specific Whois server
whois -h whois.arin.net 93.184.216.34
```

**Regional Internet Registries (RIRs):**

| RIR | Region |
|-----|--------|
| **ARIN** | North America |
| **RIPE NCC** | Europe, Middle East, Central Asia |
| **APNIC** | Asia-Pacific |
| **LACNIC** | Latin America, Caribbean |
| **AFRINIC** | Africa |

**Exam tip:** Know which RIR covers which region. If asked "Which organization manages IP address allocation in Europe?" the answer is **RIPE NCC**.

### DNS Record Types

| Record Type | Purpose | Example |
|------------|---------|---------|
| **A** | Maps hostname to IPv4 address | `example.com -> 93.184.216.34` |
| **AAAA** | Maps hostname to IPv6 address | `example.com -> 2606:2800:220:1:...` |
| **MX** | Mail exchange server (with priority) | `example.com -> mail.example.com (priority 10)` |
| **NS** | Authoritative name server | `example.com -> ns1.example.com` |
| **CNAME** | Canonical name (alias) | `www.example.com -> example.com` |
| **SOA** | Start of Authority -- primary NS, admin email, serial number, timers | Zone metadata |
| **PTR** | Reverse DNS -- maps IP to hostname | `34.216.184.93 -> example.com` |
| **TXT** | Arbitrary text -- often SPF, DKIM, DMARC | `"v=spf1 include:_spf.google.com ~all"` |
| **SRV** | Service locator (port, priority, weight) | `_sip._tcp.example.com -> sipserver.example.com:5060` |
| **HINFO** | Host information (OS, CPU) | Rarely used; security concern |

### DNS Enumeration Commands

```bash
# nslookup -- interactive DNS query tool
nslookup example.com
nslookup -type=MX example.com
nslookup -type=NS example.com
nslookup -type=SOA example.com
nslookup -type=ANY example.com

# dig -- more detailed DNS queries
dig example.com A
dig example.com MX
dig example.com NS
dig example.com ANY
dig @8.8.8.8 example.com          # Query specific DNS server
dig example.com +short             # Short output
dig -x 93.184.216.34               # Reverse DNS lookup

# host -- simple DNS lookup
host example.com
host -t MX example.com
host -t NS example.com

# DNS zone transfer attempt (AXFR)
dig axfr example.com @ns1.example.com
nslookup -> server ns1.example.com -> set type=any -> ls -d example.com
host -t axfr example.com ns1.example.com
```

### DNS Zone Transfer (AXFR)

A DNS zone transfer replicates the entire DNS zone file from a primary DNS server to a secondary one. If misconfigured, an attacker can retrieve all DNS records for a domain.

**Why it matters for the exam:**
- Zone transfer reveals ALL subdomains, IP addresses, mail servers, and internal hostnames
- It is one of the most valuable pieces of information an attacker can obtain during reconnaissance
- Properly configured DNS servers restrict zone transfers to authorized secondary servers only
- Countermeasure: configure `allow-transfer` to specific IP addresses only

### Subdomain Enumeration Tools

| Tool | Method |
|------|--------|
| **Sublist3r** | Enumerates subdomains using search engines and DNS |
| **Amass** | In-depth attack surface mapping and subdomain discovery |
| **DNSdumpster** | Online DNS recon and research tool |
| **Fierce** | DNS reconnaissance tool for locating non-contiguous IP space |
| **DNSrecon** | DNS enumeration, zone transfer, brute force |
| **Gobuster** (dns mode) | DNS subdomain brute-forcing |

---

## 2.5 Network Scanning with Nmap

Nmap (Network Mapper) is the most important scanning tool on the CEH exam. You must know its scan types, flags, and output interpretation.

### Nmap Scan Types

| Scan Type | Flag | Description | Requires Root? | Stealth? |
|-----------|------|------------|----------------|----------|
| **TCP SYN Scan** | `-sS` | Half-open scan; sends SYN, waits for SYN/ACK or RST; does not complete handshake | Yes | Yes (default for root) |
| **TCP Connect Scan** | `-sT` | Full TCP handshake; uses OS connect() call | No | No (logged) |
| **UDP Scan** | `-sU` | Sends UDP packets; slow because no guaranteed response | Yes | N/A |
| **FIN Scan** | `-sF` | Sends FIN flag; open ports don't respond, closed ports send RST | Yes | Yes |
| **XMAS Scan** | `-sX` | Sends FIN+PSH+URG flags; same logic as FIN scan | Yes | Yes |
| **NULL Scan** | `-sN` | Sends no flags; same logic as FIN scan | Yes | Yes |
| **ACK Scan** | `-sA` | Determines if port is filtered (firewall detection); cannot determine open/closed | Yes | No |
| **Window Scan** | `-sW` | Like ACK scan but examines TCP window field | Yes | No |
| **Idle/Zombie Scan** | `-sI <zombie>` | Uses a third-party "zombie" host; extremely stealthy | Yes | Very high |
| **Ping Scan** | `-sn` | Host discovery only; no port scan | No | N/A |
| **Protocol Scan** | `-sO` | Determines which IP protocols are supported | Yes | N/A |

### How Stealth Scans Work (FIN, XMAS, NULL)

These scans exploit RFC 793 behavior:
- **Open port:** No response (packet is silently dropped)
- **Closed port:** RST/ACK response

**Limitation:** Does NOT work against Windows systems (Windows sends RST regardless of port state). Only reliable against Unix/Linux.

**Exam tip:** If a question asks about a scan that sends no flags, the answer is **NULL scan (-sN)**. If it asks about FIN+PSH+URG, it is **XMAS scan (-sX)**.

### Key Nmap Options and Flags

| Flag | Purpose |
|------|---------|
| `-sV` | Service/version detection |
| `-O` | OS detection |
| `-A` | Aggressive scan (OS detection + version + scripts + traceroute) |
| `-p <ports>` | Specify ports (`-p 80`, `-p 1-1000`, `-p-` for all 65535) |
| `-p-` | Scan all 65535 ports |
| `--top-ports <n>` | Scan top N most common ports |
| `-T0` to `-T5` | Timing templates: Paranoid(0), Sneaky(1), Polite(2), Normal(3), Aggressive(4), Insane(5) |
| `-f` | Fragment packets (evasion) |
| `-D <decoys>` | Use decoy IP addresses (`-D RND:10` for 10 random decoys) |
| `--data-length <n>` | Append random data to packets (evade IDS) |
| `-S <IP>` | Spoof source IP address |
| `-e <iface>` | Specify network interface |
| `-Pn` | Skip host discovery (treat all hosts as online) |
| `-n` | No DNS resolution (faster) |
| `-v` / `-vv` | Verbose / very verbose output |
| `-oN <file>` | Output in normal format |
| `-oX <file>` | Output in XML format |
| `-oG <file>` | Output in grepable format |
| `-oA <file>` | Output in all formats |
| `--script <name>` | Run Nmap Scripting Engine (NSE) scripts |
| `--script=vuln` | Run vulnerability scanning scripts |
| `--open` | Show only open ports |
| `-iL <file>` | Read targets from a file |

### Nmap Scan Examples

```bash
# Basic SYN scan on common ports
nmap -sS 192.168.1.1

# Full scan with version and OS detection
nmap -sS -sV -O 192.168.1.1

# Aggressive scan on all ports
nmap -A -p- 192.168.1.1

# Scan a subnet for live hosts
nmap -sn 192.168.1.0/24

# UDP scan on specific ports
nmap -sU -p 53,161,162,500 192.168.1.1

# Stealth scan with decoys and fragmentation (IDS evasion)
nmap -sS -f -D RND:5 192.168.1.1

# Version detection on specific ports
nmap -sV -p 80,443,8080 192.168.1.1

# Run vulnerability scripts
nmap --script=vuln 192.168.1.1

# Idle/zombie scan
nmap -sI zombie_host 192.168.1.1

# Scan with timing template (paranoid -- very slow, stealthy)
nmap -sS -T0 192.168.1.1
```

### Nmap Port States

| State | Meaning |
|-------|---------|
| **open** | Port is accepting connections |
| **closed** | Port is accessible but no application is listening |
| **filtered** | Nmap cannot determine if port is open (firewall blocking) |
| **unfiltered** | Port is accessible but Nmap can't determine open/closed (ACK scan) |
| **open\|filtered** | Nmap can't determine if open or filtered (UDP, FIN, NULL, XMAS scans) |
| **closed\|filtered** | Nmap can't determine if closed or filtered (IP ID idle scan) |

### TCP Three-Way Handshake (Foundation for Understanding Scans)

```
Client                Server
  |--- SYN ------------>|     Step 1: Client initiates
  |<-- SYN/ACK ---------|     Step 2: Server acknowledges (port OPEN)
  |--- ACK ------------>|     Step 3: Connection established

  |--- SYN ------------>|     If port is CLOSED:
  |<-- RST/ACK ---------|     Server sends RST (reset)
```

- **SYN scan (-sS):** Sends SYN, receives SYN/ACK (open) or RST (closed), then sends RST instead of ACK (never completes handshake)
- **Connect scan (-sT):** Completes the full three-way handshake

---

## 2.6 OS Fingerprinting

### TTL (Time-to-Live) Values by Operating System

This is one of the most commonly tested topics on the CEH exam.

| Operating System | Default TTL |
|-----------------|-------------|
| **Linux/Unix** | 64 |
| **Windows** | 128 |
| **Solaris/AIX** | 254 |
| **Cisco IOS (routers)** | 255 |
| **macOS** | 64 |
| **FreeBSD** | 64 |

**How it works:** When you ping a host and receive a reply, the TTL in the response indicates the OS. Each router hop decrements TTL by 1.

```bash
# Example: Ping a Windows host (3 hops away)
ping 192.168.1.1
# TTL=125 -> Original TTL was 128 (128 - 3 hops = 125) -> Windows

# Example: Ping a Linux host (2 hops away)
ping 10.0.0.5
# TTL=62 -> Original TTL was 64 (64 - 2 hops = 62) -> Linux
```

**Exam tip:** Round UP to the nearest known TTL value. If you see TTL=120, the closest is 128 (Windows). If TTL=58, the closest is 64 (Linux).

### Active vs. Passive OS Fingerprinting

| Type | Method | Tool |
|------|--------|------|
| **Active** | Send packets and analyze responses (TCP/IP stack behavior) | Nmap (`-O`), Xprobe2 |
| **Passive** | Sniff traffic and analyze without sending packets | p0f, NetworkMiner |

**Nmap OS detection** analyzes:
- TCP ISN (Initial Sequence Number) patterns
- TCP options support and ordering
- IP ID generation
- Window size values
- ICMP response characteristics

---

## 2.7 Banner Grabbing

Banner grabbing is the technique of connecting to a service and reading its identification banner to determine the software and version.

### Banner Grabbing Methods

```bash
# Using Netcat
nc -v 192.168.1.1 80
HEAD / HTTP/1.0
# Response reveals: Apache/2.4.41 (Ubuntu) Server

# Using Telnet
telnet 192.168.1.1 25
# Response: 220 mail.example.com ESMTP Postfix (Ubuntu)

telnet 192.168.1.1 80
GET / HTTP/1.0
# Response headers reveal server info

# Using Nmap version detection
nmap -sV -p 80 192.168.1.1

# Using curl (HTTP headers)
curl -I http://192.168.1.1
# Server: Apache/2.4.41
# X-Powered-By: PHP/7.4.3

# Using wget (save headers)
wget --server-response http://192.168.1.1
```

**Countermeasures:**
- Change default banners (customize ServerTokens in Apache, remove X-Powered-By headers)
- Use reverse proxies that mask backend server identity
- Disable unnecessary services

---

## 2.8 Port Scanning Concepts

### Well-Known Ports Table (Must Memorize)

| Port | Protocol | Service | Notes |
|------|----------|---------|-------|
| 20 | TCP | FTP Data | Active mode data transfer |
| 21 | TCP | FTP Control | Authentication and commands |
| 22 | TCP | SSH/SCP/SFTP | Secure remote access |
| 23 | TCP | Telnet | Insecure remote access (cleartext) |
| 25 | TCP | SMTP | Send email |
| 53 | TCP/UDP | DNS | Zone transfers use TCP; queries use UDP |
| 67/68 | UDP | DHCP | Server (67) / Client (68) |
| 69 | UDP | TFTP | Trivial FTP -- no authentication |
| 80 | TCP | HTTP | Web traffic |
| 88 | TCP/UDP | Kerberos | Authentication protocol |
| 110 | TCP | POP3 | Retrieve email (downloads) |
| 111 | TCP/UDP | RPC/Portmapper | Unix remote procedure calls |
| 119 | TCP | NNTP | Usenet news |
| 123 | UDP | NTP | Time synchronization |
| 135 | TCP | MS-RPC | Microsoft RPC endpoint mapper |
| 137-139 | TCP/UDP | NetBIOS | Name(137), Datagram(138), Session(139) |
| 143 | TCP | IMAP | Retrieve email (server-side management) |
| 161/162 | UDP | SNMP | Monitoring (161 agent, 162 trap) |
| 389 | TCP | LDAP | Directory services |
| 443 | TCP | HTTPS | Encrypted web traffic (TLS/SSL) |
| 445 | TCP | SMB/CIFS | Windows file sharing (Direct SMB over TCP) |
| 465 | TCP | SMTPS | SMTP over SSL (legacy) |
| 500 | UDP | IKE/ISAKMP | IPsec key exchange |
| 514 | UDP | Syslog | Centralized logging |
| 520 | UDP | RIP | Routing protocol |
| 587 | TCP | SMTP Submission | Email submission (STARTTLS) |
| 636 | TCP | LDAPS | LDAP over SSL |
| 993 | TCP | IMAPS | IMAP over SSL |
| 995 | TCP | POP3S | POP3 over SSL |
| 1433 | TCP | MS-SQL | Microsoft SQL Server |
| 1521 | TCP | Oracle DB | Oracle database listener |
| 1723 | TCP | PPTP | VPN protocol |
| 2049 | TCP/UDP | NFS | Network File System |
| 3306 | TCP | MySQL | MySQL database |
| 3389 | TCP | RDP | Remote Desktop Protocol |
| 5060/5061 | TCP/UDP | SIP | VoIP signaling (5061=TLS) |
| 5432 | TCP | PostgreSQL | PostgreSQL database |
| 5900 | TCP | VNC | Virtual Network Computing |
| 5985/5986 | TCP | WinRM | Windows Remote Management (5986=HTTPS) |
| 6379 | TCP | Redis | In-memory data store |
| 8080 | TCP | HTTP Proxy | Alternate HTTP / web proxy |
| 8443 | TCP | HTTPS Alt | Alternate HTTPS |
| 27017 | TCP | MongoDB | MongoDB database |

### Port Ranges

| Range | Name | Description |
|-------|------|------------|
| 0-1023 | Well-Known Ports | Assigned by IANA; require root/admin to bind |
| 1024-49151 | Registered Ports | Assigned by IANA on request |
| 49152-65535 | Dynamic/Ephemeral Ports | Used temporarily by client applications |

---

## 2.9 Enumeration Techniques

Enumeration is the process of extracting detailed information from target systems and services, including usernames, shares, groups, and configurations.

### NetBIOS Enumeration (Ports 137-139)

NetBIOS (Network Basic Input/Output System) provides services for Windows networking.

```bash
# NetBIOS name table lookup
nbtstat -a <IP>          # Windows: query by IP
nbtstat -c               # Windows: show local cache
nbtstat -n               # Windows: show local names

# Nmap NetBIOS scripts
nmap -sV -p 137,139,445 --script=nbstat 192.168.1.1
nmap --script=smb-enum-shares 192.168.1.1
nmap --script=smb-enum-users 192.168.1.1

# Linux tools
nmblookup -A 192.168.1.1
enum4linux -a 192.168.1.1    # Comprehensive enumeration
rpcclient -U "" 192.168.1.1  # Null session
smbclient -L //192.168.1.1 -N  # List shares (null session)

# Windows null session (legacy)
net use \\192.168.1.1\IPC$ "" /u:""
```

**NetBIOS Suffix Codes (commonly tested):**

| Code | Type | Description |
|------|------|-------------|
| `<00>` | UNIQUE | Workstation Service (hostname) |
| `<03>` | UNIQUE | Messenger Service (user logged in) |
| `<06>` | UNIQUE | RAS Server Service |
| `<20>` | UNIQUE | Server Service (file sharing enabled) |
| `<1B>` | UNIQUE | Domain Master Browser |
| `<1C>` | GROUP | Domain Controllers |
| `<1D>` | UNIQUE | Master Browser |
| `<1E>` | GROUP | Browser Service Elections |

**Exam tip:** If you see `<20>` in NetBIOS output, the machine has file sharing enabled and is potentially sharing resources.

### SNMP Enumeration (Ports 161/162 UDP)

SNMP (Simple Network Management Protocol) manages and monitors network devices. Versions 1 and 2c transmit community strings in **cleartext**, making them vulnerable.

**SNMP Concepts:**
- **Community strings** act as passwords:
  - `public` -- default read-only community string
  - `private` -- default read-write community string
- **MIB (Management Information Base)** -- hierarchical database of managed objects
- **OID (Object Identifier)** -- unique identifier for each managed object

**SNMP Versions:**

| Version | Authentication | Encryption | Notes |
|---------|---------------|------------|-------|
| SNMPv1 | Community string (cleartext) | None | Highly insecure |
| SNMPv2c | Community string (cleartext) | None | Better performance, still insecure |
| SNMPv3 | Username/password | DES/AES | Recommended; supports integrity and confidentiality |

```bash
# SNMP enumeration with snmpwalk
snmpwalk -v 2c -c public 192.168.1.1

# Enumerate system info
snmpwalk -v 2c -c public 192.168.1.1 1.3.6.1.2.1.1   # System OID

# Enumerate running processes
snmpwalk -v 2c -c public 192.168.1.1 1.3.6.1.2.1.25.4.2.1.2

# Enumerate installed software
snmpwalk -v 2c -c public 192.168.1.1 1.3.6.1.2.1.25.6.3.1.2

# Enumerate network interfaces
snmpwalk -v 2c -c public 192.168.1.1 1.3.6.1.2.1.2.2.1

# Using snmp-check
snmp-check 192.168.1.1 -c public

# Nmap SNMP scripts
nmap -sU -p 161 --script=snmp-brute 192.168.1.1
nmap -sU -p 161 --script=snmp-info 192.168.1.1

# Brute-force community strings with onesixtyone
onesixtyone -c community_list.txt 192.168.1.1
```

**Key SNMP OID Branches:**

| OID | Information |
|-----|------------|
| `1.3.6.1.2.1.1` | System information (sysDescr, sysName, sysLocation) |
| `1.3.6.1.2.1.2` | Network interfaces |
| `1.3.6.1.2.1.25.4` | Running processes |
| `1.3.6.1.2.1.25.6` | Installed software |
| `1.3.6.1.4.1` | Vendor-specific (private enterprise) |

### LDAP Enumeration (Port 389 / 636 for LDAPS)

LDAP (Lightweight Directory Access Protocol) provides access to directory services like Active Directory.

```bash
# Enumerate LDAP with ldapsearch
ldapsearch -x -h 192.168.1.1 -b "dc=example,dc=com"
ldapsearch -x -h 192.168.1.1 -b "dc=example,dc=com" "(objectClass=user)"

# Anonymous bind enumeration
ldapsearch -x -h 192.168.1.1 -b "dc=example,dc=com" -s base namingcontexts

# Nmap LDAP scripts
nmap -p 389 --script=ldap-rootdse 192.168.1.1
nmap -p 389 --script=ldap-search 192.168.1.1

# Tools: JXplorer, Softerra LDAP Administrator, AD Explorer (Sysinternals)
```

**Information from LDAP enumeration:**
- User accounts, groups, organizational units
- Computer names and attributes
- Email addresses
- Password policies
- Group memberships

### NTP Enumeration (Port 123 UDP)

NTP (Network Time Protocol) synchronizes clocks. NTP servers can leak information about clients.

```bash
# List NTP peers (connected hosts)
ntpdc -n -c monlist 192.168.1.1    # monlist command -- reveals client IPs

# Query NTP server
ntpdc -c peers 192.168.1.1
ntpq -p 192.168.1.1

# Nmap NTP scripts
nmap -sU -p 123 --script=ntp-info 192.168.1.1
nmap -sU -p 123 --script=ntp-monlist 192.168.1.1
```

**Exam tip:** The `monlist` command is significant because it returns a list of the last 600 hosts that have connected to the NTP server, and it can be abused for **NTP amplification DDoS attacks** (small request, large response).

### SMTP Enumeration (Port 25)

SMTP (Simple Mail Transfer Protocol) can be used to enumerate valid email addresses/users.

```bash
# Connect to SMTP server
telnet 192.168.1.1 25

# VRFY -- verify if a user exists
VRFY admin
# 250 admin@example.com        <-- User exists
# 550 No such user             <-- User does NOT exist

# EXPN -- expand a mailing list
EXPN admin
# 250 admin@example.com

# RCPT TO -- check if recipient exists
MAIL FROM:test@test.com
RCPT TO:admin@example.com
# 250 OK                       <-- User exists
# 550 Unknown user             <-- User does NOT exist

# Nmap SMTP scripts
nmap -p 25 --script=smtp-enum-users 192.168.1.1
nmap -p 25 --script=smtp-commands 192.168.1.1

# smtp-user-enum tool
smtp-user-enum -M VRFY -u admin -t 192.168.1.1
smtp-user-enum -M VRFY -U users.txt -t 192.168.1.1
```

**SMTP commands to know:**

| Command | Purpose |
|---------|---------|
| HELO/EHLO | Identify client to server |
| MAIL FROM | Specify sender |
| RCPT TO | Specify recipient |
| DATA | Begin message body |
| VRFY | Verify user exists |
| EXPN | Expand mailing list |
| RSET | Reset connection |
| QUIT | End session |

### DNS Enumeration (Port 53)

Beyond basic lookups, DNS can reveal significant infrastructure details.

```bash
# Enumerate DNS records
dig example.com ANY
dig example.com AXFR @ns1.example.com     # Zone transfer

# DNS brute force for subdomains
fierce --domain example.com
dnsrecon -d example.com -t brt -D subdomains.txt

# Nmap DNS scripts
nmap -p 53 --script=dns-brute example.com
nmap -p 53 --script=dns-zone-transfer --script-args dns-zone-transfer.domain=example.com

# DNSrecon comprehensive enumeration
dnsrecon -d example.com -t std     # Standard enumeration
dnsrecon -d example.com -t zonewalk  # DNSSEC zone walking
```

### SMB Enumeration (Ports 139, 445)

```bash
# enum4linux -- all-in-one SMB enumeration
enum4linux -a 192.168.1.1

# Nmap SMB scripts
nmap -p 445 --script=smb-enum-shares,smb-enum-users,smb-os-discovery 192.168.1.1
nmap -p 445 --script=smb-vuln* 192.168.1.1   # Check for SMB vulnerabilities (EternalBlue, etc.)

# smbclient
smbclient -L //192.168.1.1 -N    # List shares anonymously
smbclient //192.168.1.1/share -N  # Connect to a share

# rpcclient
rpcclient -U "" -N 192.168.1.1
  > enumdomusers                   # Enumerate domain users
  > enumdomgroups                  # Enumerate domain groups
  > lookupnames admin              # Look up SID for username

# CrackMapExec
crackmapexec smb 192.168.1.0/24           # Discover SMB hosts
crackmapexec smb 192.168.1.1 --shares     # Enumerate shares
crackmapexec smb 192.168.1.1 --users      # Enumerate users
```

---

## 2.10 Other Scanning and Reconnaissance Tools

### Vulnerability Scanners

| Tool | Type | Notes |
|------|------|-------|
| **Nessus** | Commercial vulnerability scanner | Most widely used; produces detailed reports with CVSS scores |
| **OpenVAS** | Open-source vulnerability scanner | Free alternative to Nessus |
| **Qualys** | Cloud-based vulnerability management | Enterprise-grade; SaaS model |
| **Nexpose** (Rapid7) | Vulnerability scanner | Integrates with Metasploit |
| **Nikto** | Web server scanner | Checks for misconfigurations, default files, outdated software |

### Network Discovery and Mapping

| Tool | Purpose |
|------|---------|
| **Angry IP Scanner** | Fast IP scanner and port scanner (GUI) |
| **Masscan** | Extremely fast port scanner (Internet-scale) |
| **Hping3** | TCP/IP packet assembler/analyzer; useful for firewall testing, OS fingerprinting, port scanning |
| **Zenmap** | GUI frontend for Nmap |
| **Netdiscover** | ARP-based network discovery |
| **arp-scan** | ARP-based host discovery on local network |

### Hping3 Examples (Commonly Tested)

```bash
# SYN scan on port 80
hping3 -S 192.168.1.1 -p 80

# ACK scan to test firewall rules
hping3 -A 192.168.1.1 -p 80

# ICMP ping
hping3 -1 192.168.1.1

# UDP scan
hping3 -2 192.168.1.1 -p 53

# SYN flood (for testing -- never unauthorized)
hping3 -S --flood -V -p 80 192.168.1.1

# Traceroute using TCP
hping3 --traceroute -S -p 80 192.168.1.1

# OS fingerprinting
hping3 -S 192.168.1.1 -p 80 -c 1    # Check TTL in response
```

**Hping3 flags:**

| Flag | Meaning |
|------|---------|
| `-S` | Set SYN flag |
| `-A` | Set ACK flag |
| `-F` | Set FIN flag |
| `-R` | Set RST flag |
| `-P` | Set PUSH flag |
| `-U` | Set URG flag |
| `-X` | Set XMAS (FIN+PSH+URG) |
| `-1` | ICMP mode |
| `-2` | UDP mode |
| `-p` | Destination port |
| `-c` | Packet count |
| `--flood` | Send packets as fast as possible |
| `--traceroute` | Traceroute mode |

---

## 2.11 Countermeasures for Reconnaissance

| Threat | Countermeasure |
|--------|---------------|
| **Google Dorking** | Use robots.txt (but not for security), remove sensitive files, configure web server properly |
| **Whois Exposure** | Use domain privacy/proxy registration services |
| **DNS Zone Transfer** | Restrict AXFR to authorized secondary DNS servers only |
| **Banner Grabbing** | Change default banners, disable version disclosure |
| **Port Scanning** | Firewalls, IDS/IPS, close unnecessary ports, disable unused services |
| **SNMP Enumeration** | Change default community strings, use SNMPv3, restrict SNMP access with ACLs |
| **NetBIOS Enumeration** | Disable NetBIOS over TCP/IP if not needed, use firewall to block ports 137-139 |
| **SMTP Enumeration** | Disable VRFY and EXPN commands |
| **LDAP Enumeration** | Disable anonymous binds, use LDAPS (TLS), restrict query scope |
| **NTP Enumeration** | Disable monlist, use NTP access controls, upgrade to ntpd versions without monlist |
| **Social Media OSINT** | Employee awareness training, social media policies, limit public exposure |
| **Metadata Leakage** | Strip metadata from documents before publishing (ExifTool, document sanitization) |

---

## 2.12 Key Tools Summary Table

| Tool | Category | Primary Use |
|------|----------|-------------|
| **Nmap** | Scanning | Port scanning, OS detection, service enumeration, scripting |
| **Hping3** | Scanning | Packet crafting, firewall testing, OS fingerprinting |
| **Maltego** | OSINT | Visual link analysis, relationship mapping |
| **theHarvester** | OSINT | Email, subdomain, IP harvesting from public sources |
| **Recon-ng** | OSINT | Modular reconnaissance framework |
| **Shodan** | OSINT | Search engine for Internet-connected devices |
| **FOCA** | OSINT | Document metadata extraction |
| **Metagoofil** | OSINT | Document metadata extraction from web |
| **Censys** | OSINT | Internet-wide scan data and certificate search |
| **SpiderFoot** | OSINT | Automated OSINT collection |
| **Netcraft** | OSINT | Website technology and hosting information |
| **Sublist3r** | DNS | Subdomain enumeration |
| **DNSrecon** | DNS | DNS enumeration and zone transfer testing |
| **Fierce** | DNS | DNS reconnaissance and subdomain brute-forcing |
| **Amass** | DNS | Attack surface mapping and subdomain discovery |
| **enum4linux** | Enumeration | Windows/Samba enumeration (SMB, NetBIOS, LDAP, users, shares) |
| **snmpwalk** | Enumeration | SNMP MIB walking and data extraction |
| **onesixtyone** | Enumeration | SNMP community string brute-forcing |
| **ldapsearch** | Enumeration | LDAP directory querying |
| **Wireshark** | Sniffing | Packet capture and protocol analysis |
| **Nessus** | Vulnerability | Vulnerability scanning and assessment |
| **OpenVAS** | Vulnerability | Open-source vulnerability scanning |
| **Nikto** | Web | Web server vulnerability scanning |
| **Masscan** | Scanning | High-speed Internet-scale port scanning |
| **CrackMapExec** | Enumeration | SMB/WinRM/MSSQL enumeration and exploitation |

---

## 2.13 Exam Quick-Fire Review -- Domain 1 & 2

### Must-Know Concepts (Rapid Review)

1. **CIA Triad:** Confidentiality, Integrity, Availability
2. **Hacking Phases:** Recon -> Scanning -> Gaining Access -> Maintaining Access -> Clearing Tracks
3. **Cyber Kill Chain (7 steps):** Reconnaissance, Weaponization, Delivery, Exploitation, Installation, C2, Actions on Objectives
4. **MITRE ATT&CK:** Tactics (14), Techniques, Sub-techniques -- knowledge base of real-world adversary behavior
5. **Pen test types:** Black box (no knowledge), White box (full knowledge), Grey box (partial)
6. **Passive recon:** No direct interaction (OSINT, Google, Whois)
7. **Active recon:** Direct interaction (scanning, banner grabbing, zone transfers)
8. **TTL values:** Linux=64, Windows=128, Solaris=254, Cisco=255
9. **SYN scan (-sS):** Half-open, stealthy, default for root
10. **TCP connect (-sT):** Full handshake, logged, no root needed
11. **XMAS scan (-sX):** FIN+PSH+URG flags set, doesn't work on Windows
12. **NULL scan (-sN):** No flags set, doesn't work on Windows
13. **Idle scan (-sI):** Uses zombie host, very stealthy
14. **Zone transfer (AXFR):** Copies entire DNS zone; should be restricted
15. **SNMP default community strings:** public (read), private (read-write)
16. **SNMPv3:** Only version with encryption and real authentication
17. **NetBIOS suffix `<20>`:** File sharing is enabled
18. **SMTP VRFY/EXPN:** Used to enumerate valid email users
19. **NTP monlist:** Returns list of connected clients; abused for DDoS amplification
20. **Google dork `filetype:`:** Searches for specific file extensions
21. **Google dork `site:`:** Restricts search to a specific domain
22. **Google dork `intitle:"index of"`:** Finds directory listings
23. **GDPR:** 72-hour breach notification, right to be forgotten, up to 4% revenue fines
24. **PCI-DSS:** 12 requirements for credit card data handling
25. **HIPAA:** Protects PHI (Protected Health Information) in healthcare

### Common Exam Traps

- **SYN scan vs. TCP Connect scan:** SYN is stealthy (half-open), TCP Connect completes the handshake and gets logged
- **Passive vs. Active:** Viewing someone's public LinkedIn profile is PASSIVE. Sending them a connection request or message is ACTIVE
- **Footprinting vs. Scanning vs. Enumeration:** Footprinting is broad info gathering, scanning identifies live hosts and ports, enumeration extracts detailed info from services
- **SNMP "public" and "private":** These are default community strings, NOT descriptions of the access level. "public" = read-only, "private" = read-write
- **DNS zone transfer:** Uses TCP port 53 (not UDP). Regular DNS queries use UDP port 53
- **Nmap -A flag:** Does NOT mean "all ports." It means Aggressive (OS detection + version detection + script scanning + traceroute). Use -p- for all ports
- **Nmap timing:** -T0 is the slowest (Paranoid), -T5 is the fastest (Insane). Lower number = more stealthy but slower

---

*End of Day 1 Study Material. Tomorrow: Domain 3 -- System Hacking Phases and Attack Techniques.*
