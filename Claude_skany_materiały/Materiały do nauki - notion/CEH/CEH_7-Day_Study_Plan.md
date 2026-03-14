# CEH v13 -- 7-Day Intensive Study Plan

## Exam Blueprint v5.0 -- Quick Reference

| # | Domain | Exam Weight | Study Day |
|---|--------|-------------|-----------|
| 1 | Information Security and Ethical Hacking Overview | 6% | Day 1 |
| 2 | Reconnaissance Techniques | 17% | Day 1 |
| 3 | System Hacking Phases and Attack Techniques | 15% | Day 2 |
| 4 | Network and Perimeter Hacking | 23% | Days 3-4 |
| 5 | Web Application Hacking | 14% | Day 5 |
| 6 | Wireless Network Hacking | 5% | Day 6 |
| 7 | Mobile Platform, IoT, and OT Hacking | 10% | Day 6 |
| 8 | Cloud Computing | 5% | Day 7 |
| 9 | Cryptography | 5% | Day 7 |
| | **Total** | **100%** | |

> **Exam format:** 125 multiple-choice questions, 4 hours, passing score ~60-85% (scaled).

---

## Day 1 -- Domains 1 & 2 (23% of exam)

**Topics:** Information Security Overview (6%) + Reconnaissance Techniques (17%)

### Key Focus Areas

- CIA triad, AAA, non-repudiation
- Hacking phases (Reconnaissance -> Scanning -> Gaining Access -> Maintaining Access -> Clearing Tracks)
- Cyber Kill Chain (Lockheed Martin) and MITRE ATT&CK framework
- Ethical hacking concepts, scope, and legal frameworks (HIPAA, SOX, PCI-DSS, GDPR, DMCA, CFAA)
- Footprinting: passive vs. active techniques
- OSINT tools: Maltego, theHarvester, Shodan, Recon-ng, FOCA
- Google dorking operators (site:, intitle:, inurl:, filetype:, cache:)
- Whois, DNS enumeration (zone transfers, DNS record types)
- Nmap scanning: SYN scan, TCP connect, FIN/XMAS/NULL, UDP, version detection, OS fingerprinting
- Port scanning concepts: well-known ports, service identification
- Enumeration techniques: NetBIOS, SNMP, LDAP, NTP, SMTP, DNS
- TTL values for OS fingerprinting (Linux=64, Windows=128, Solaris=255)
- Banner grabbing (Netcat, Telnet)

### Study Targets

- [ ] Read and review Domain 1 material (1.5 hours)
- [ ] Read and review Domain 2 material (3.5 hours)
- [ ] Complete practice questions covering Domains 1-2 (1 hour)
- [ ] Review and memorize key ports and Nmap flags (1 hour)

---

## Day 2 -- Domain 3 (15% of exam)

**Topics:** System Hacking Phases and Attack Techniques

### Key Focus Areas

- Password cracking: dictionary, brute-force, rainbow tables, hybrid attacks
- Password tools: John the Ripper, Hashcat, ophcrack, L0phtCrack, RainbowCrack
- Microsoft authentication: NTLM, NTLMv2, Kerberos (TGT/TGS flow)
- Kerberos attacks: Kerberoasting, AS-REP Roasting, Golden Ticket, Silver Ticket, Pass-the-Hash, Pass-the-Ticket
- Privilege escalation: horizontal vs. vertical, DLL hijacking, unquoted service paths, kernel exploits
- Maintaining access: backdoors, trojans, rootkits (kernel-level, user-level, hypervisor-level)
- Trojans: types (RAT, backdoor, botnet), wrappers/binders, crypters, and packers
- Rootkit detection: chkrootkit, rkhunter
- Steganography: LSB insertion, tools (OpenStego, Snow, Steghide, Coagula)
- Covering tracks: clearing logs, disabling auditing, NTFS Alternate Data Streams (ADS)
- Malware analysis: static vs. dynamic, sandboxing
- Living-off-the-Land Binaries (LOLBins): PowerShell, certutil, mshta, rundll32
- Fileless malware concepts

### Study Targets

- [ ] Understand each hacking phase in detail (2 hours)
- [ ] Master password attack types and tools (1.5 hours)
- [ ] Review privilege escalation techniques (1 hour)
- [ ] Study steganography and anti-forensics (1 hour)
- [ ] Complete practice questions for Domain 3 (1.5 hours)

---

## Day 3 -- Domain 4, Part 1 (portion of 23%)

**Topics:** Sniffing + Social Engineering + Denial of Service (DoS/DDoS)

### Key Focus Areas

**Sniffing:**
- Active vs. passive sniffing
- MAC flooding, ARP poisoning/spoofing, DHCP starvation, DNS poisoning
- Switch port mirroring (SPAN), promiscuous mode
- Tools: Wireshark, tcpdump, Ettercap, Cain & Abel, macof
- Countermeasures: Dynamic ARP Inspection (DAI), DHCP snooping, port security

**Social Engineering:**
- Types: phishing, spear phishing, whaling, vishing, smishing, pharming, pretexting, tailgating, piggybacking, shoulder surfing, dumpster diving, baiting, quid pro quo, watering hole
- Social engineering lifecycle: Research -> Target Selection -> Relationship Building -> Exploitation
- Tools: Social Engineering Toolkit (SET)
- Countermeasures: awareness training, policies, verification procedures

**Denial of Service:**
- DoS vs. DDoS, volumetric vs. protocol vs. application-layer attacks
- Attack types: SYN flood, ICMP flood, Ping of Death, Smurf, Fraggle, Slowloris, HTTP flood, amplification/reflection
- Botnets and command-and-control (C2)
- Tools: LOIC, HOIC, hping3
- Countermeasures: rate limiting, SYN cookies, CDNs, scrubbing centers

### Study Targets

- [ ] Master sniffing attacks and defenses (2 hours)
- [ ] Learn all social engineering types -- exam loves these (2 hours)
- [ ] Study DoS/DDoS attack vectors and defenses (1.5 hours)
- [ ] Complete practice questions (1.5 hours)

---

## Day 4 -- Domain 4, Part 2 (remainder of 23%)

**Topics:** Session Hijacking + IDS/Firewall/Honeypot Evasion

### Key Focus Areas

**Session Hijacking:**
- Application-level vs. network-level hijacking
- TCP session hijacking (sequence number prediction)
- Session fixation, session sidejacking, cookie replay, CRIME/BEAST attacks
- Tools: Burp Suite, OWASP ZAP, Ettercap, Hamster & Ferret
- Countermeasures: HTTPS everywhere, secure cookie attributes (HttpOnly, Secure, SameSite), token rotation

**IDS/IPS/Firewall Evasion:**
- IDS types: NIDS vs. HIDS, signature-based vs. anomaly-based vs. stateful protocol analysis
- IDS placement in network architecture
- IDS evasion: fragmentation, TTL manipulation, polymorphic shellcode, protocol-level evasion, insertion attacks, session splicing
- Firewall types: packet-filtering, stateful, application-level proxy, next-gen (NGFW)
- Firewall evasion: IP spoofing, source routing, tiny fragments, HTTP tunneling, SSH tunneling, proxy chains
- Firewall identification: firewalk, banner grabbing, port scanning responses
- Honeypots: low-interaction vs. high-interaction, honeynets
- Tools: Snort (IDS), pfSense, iptables, Nmap evasion flags (-f, -D, --data-length, --ttl, -T0)

### Study Targets

- [ ] Study session hijacking techniques in depth (2 hours)
- [ ] Master IDS/IPS/firewall types and evasion (2.5 hours)
- [ ] Understand honeypot concepts (0.5 hours)
- [ ] Complete practice questions (2 hours)

---

## Day 5 -- Domain 5 (14% of exam)

**Topics:** Web Application Hacking

### Key Focus Areas

- OWASP Top 10 (current version) -- know every item
- SQL Injection: in-band (error-based, UNION-based), blind (Boolean, time-based), out-of-band
- SQL Injection tools: sqlmap, Havij
- Cross-Site Scripting (XSS): reflected, stored, DOM-based
- Cross-Site Request Forgery (CSRF)
- Server-Side Request Forgery (SSRF)
- Command injection, file inclusion (LFI/RFI), directory traversal
- Insecure deserialization
- Broken authentication and session management
- XML External Entity (XXE) injection
- Web application architecture: HTTP methods, status codes, cookies, sessions
- HTTP response splitting, HTTP parameter pollution
- Web servers: Apache, IIS, Nginx misconfigurations
- Web application firewalls (WAF) and WAF evasion
- Tools: Burp Suite, OWASP ZAP, Nikto, DirBuster/Gobuster, WPScan, w3af
- API security: REST, SOAP, GraphQL vulnerabilities

### Study Targets

- [ ] Master OWASP Top 10 (2 hours)
- [ ] Deep dive on SQL injection and XSS (2 hours)
- [ ] Study remaining web attack vectors (1.5 hours)
- [ ] Review web tools and their usage (1 hour)
- [ ] Complete practice questions (1.5 hours)

---

## Day 6 -- Domains 6 & 7 (15% of exam)

**Topics:** Wireless Network Hacking (5%) + Mobile/IoT/OT Hacking (10%)

### Key Focus Areas

**Wireless:**
- Wireless standards: 802.11a/b/g/n/ac/ax, frequency bands (2.4 GHz, 5 GHz)
- Wireless encryption: WEP (RC4, weak IVs), WPA (TKIP), WPA2 (AES-CCMP), WPA3 (SAE/Dragonfly)
- Wireless attacks: evil twin, rogue AP, deauthentication, WPA handshake capture, KRACK, PMKID, karma attack
- Tools: Aircrack-ng suite (airmon-ng, airodump-ng, aireplay-ng, aircrack-ng), Kismet, Wifite, Fern WiFi Cracker
- Bluetooth attacks: bluejacking, bluesnarfing, bluebugging, KNOB attack

**Mobile:**
- Android vs. iOS architecture and security models
- Android: APK structure, rooting, ADB, OWASP Mobile Top 10
- iOS: jailbreaking, sandboxing, keychain
- Mobile attack vectors: malicious apps, SMiShing, SS7 exploitation
- MDM (Mobile Device Management) and BYOD policies
- Tools: Drozer, Frida, MobSF, APKTool

**IoT & OT:**
- IoT architecture: edge, gateway, cloud layers
- IoT protocols: MQTT, CoAP, Zigbee, Z-Wave, BLE, LoRaWAN
- IoT attacks: firmware analysis, default credentials, HVAC exploitation, Mirai botnet
- OT/ICS/SCADA: Modbus, DNP3, OPC, Purdue model, air-gapped networks
- Shodan for IoT reconnaissance
- ICS-specific attacks: Stuxnet, TRITON/TRISIS

### Study Targets

- [ ] Master wireless encryption differences and attacks (2 hours)
- [ ] Study mobile platform security (1.5 hours)
- [ ] Learn IoT/OT concepts and protocols (2 hours)
- [ ] Complete practice questions (1.5 hours)

---

## Day 7 -- Domains 8 & 9 + Final Review (10% of exam + review)

**Topics:** Cloud Computing (5%) + Cryptography (5%) + Full Review

### Key Focus Areas

**Cloud Computing:**
- Service models: IaaS, PaaS, SaaS -- know responsibilities in shared responsibility model
- Deployment models: public, private, hybrid, community, multi-cloud
- Cloud threats: data breaches, insecure APIs, misconfiguration, account hijacking, side-channel attacks
- Containers and serverless: Docker security, Kubernetes, Lambda
- Cloud-specific attacks: metadata service exploitation (169.254.169.254), S3 bucket misconfiguration
- Tools: ScoutSuite, Prowler, Pacu, CloudGoat
- CASB (Cloud Access Security Broker)

**Cryptography:**
- Symmetric encryption: DES (56-bit), 3DES (168-bit), AES (128/192/256-bit), Blowfish, Twofish, RC4, RC5, RC6
- Asymmetric encryption: RSA, Diffie-Hellman, ECC, ElGamal, DSA
- Hashing: MD5 (128-bit), SHA-1 (160-bit), SHA-256, SHA-512, HMAC
- Digital signatures, digital certificates, X.509, PKI, CA hierarchy
- Cipher types: block vs. stream, ECB vs. CBC modes
- Cryptanalysis: brute force, frequency analysis, known-plaintext, chosen-plaintext, birthday attack, meet-in-the-middle
- Disk encryption: BitLocker, FileVault, VeraCrypt
- Email encryption: PGP, S/MIME, GPG
- SSL/TLS handshake, perfect forward secrecy
- Quantum cryptography basics, post-quantum algorithms
- Blockchain concepts

**Final Review:**
- [ ] Quick review of all 9 domains (2 hours)
- [ ] Focus on high-weight domains: Reconnaissance (17%), Network/Perimeter (23%), System Hacking (15%), Web App (14%)
- [ ] Complete a full-length practice exam (2.5 hours)
- [ ] Review incorrect answers and weak areas (1.5 hours)
- [ ] Re-memorize ports, tools, protocols tables (1 hour)

---

## General Study Tips for the CEH Exam

### Exam Strategy

1. **Know the tools.** The exam tests which tool performs which function. Build a mental map: attack type -> tool name. Many questions boil down to "which tool would you use?"
2. **Memorize port numbers.** At minimum: FTP (21), SSH (22), Telnet (23), SMTP (25), DNS (53), HTTP (80), POP3 (110), IMAP (143), SNMP (161/162), LDAP (389), HTTPS (443), SMB (445), RDP (3389).
3. **Know the difference between similar attacks.** The exam tests whether you can distinguish phishing from spear phishing, ARP poisoning from DNS poisoning, SYN scan from TCP connect scan, etc.
4. **Think like EC-Council.** CEH tends to follow a specific methodology. When in doubt, choose the answer that aligns with the structured hacking phases.
5. **Countermeasures matter.** For every attack type, know at least one primary defense. Many questions ask "what prevents X?"
6. **Read questions carefully.** Look for keywords like "first step," "best," "most likely," and "passive" vs. "active."
7. **Process of elimination.** If two answers seem correct, look for the one that is most specific to the scenario described.

### High-Yield Topics (Most Tested)

| Topic | Why It Matters |
|-------|---------------|
| Nmap scan types & flags | Appears repeatedly; know -sS, -sT, -sU, -sV, -O, -A, -sN, -sF, -sX |
| Social engineering types | Multiple questions distinguish between similar techniques |
| OWASP Top 10 | Foundation for all web application questions |
| Encryption algorithms | Must know key sizes, symmetric vs. asymmetric, block vs. stream |
| Wireless encryption | WEP/WPA/WPA2/WPA3 differences are heavily tested |
| IDS evasion techniques | Frequently tested with Nmap-specific flags |
| Incident response phases | Know the order: Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned |
| Cyber Kill Chain | All 7 phases in order |
| Kerberos attacks | Golden Ticket vs. Silver Ticket, Kerberoasting |

### Study Resources

- EC-Council official courseware (CEH v13)
- Matt Walker CEH All-in-One Exam Guide
- Boson CEH practice exams
- TryHackMe CEH-aligned rooms
- Packet analysis practice with Wireshark sample captures
- CyberQ by EC-Council (official practice environment)

---

## Daily Schedule Template

| Time Block | Activity |
|------------|----------|
| Morning (2-3 hours) | Read and study new material |
| Afternoon (2-3 hours) | Hands-on practice / deeper review |
| Evening (1-2 hours) | Practice questions + review mistakes |

**Total daily study time: 5-8 hours**

---

*This study plan is aligned with the CEH Exam Blueprint v5.0 (9 domains). Adjust pacing based on your existing knowledge -- spend more time on weaker areas and high-weight domains.*
