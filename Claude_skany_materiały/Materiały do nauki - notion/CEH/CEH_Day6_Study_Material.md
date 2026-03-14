# CEH Exam Preparation: Day 6 --- Wireless Network Hacking, Mobile Platforms, IoT and OT Hacking

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing --- and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 6 of your 7-day CEH preparation. Today covers two domains: **Wireless Network Hacking** (Domain 6, ~5% exam weight) and **Mobile Platform, IoT and OT Hacking** (Domain 7, ~10% exam weight). Together they account for roughly 15% of the exam. Domain 7 in particular is a higher-weight domain, so pay close attention to IoT/OT attack vectors and mobile-specific attacks --- EC-Council loves testing these.

**Recommended schedule for today (6--8 hours):**
Block 1 (2.5 h): Read through all wireless hacking material (Parts 1--7). Work through every exam-style question.
Block 2 (2.5 h): Read through all mobile, IoT, and OT material (Parts 8--16). Work through every exam-style question.
Block 3 (1.5 h): Review the summary tables at the end. Create flashcards for tools, attack names, and port numbers.

---

## DOMAIN 6: WIRELESS NETWORK HACKING (5% Exam Weight)

---

## Part 1: Wireless Fundamentals --- Standards, Frequencies, and Architecture

### The 802.11 Standards

Wireless networking is governed by the IEEE 802.11 family of standards. Each standard defines a frequency band, maximum throughput, and modulation technique. The exam tests your knowledge of which standard uses which frequency and speed.

| Standard | Frequency | Max Speed | Key Facts |
|----------|-----------|-----------|-----------|
| **802.11a** | 5 GHz | 54 Mbps | First to use 5 GHz. Less interference than 2.4 GHz but shorter range. Uses OFDM modulation. |
| **802.11b** | 2.4 GHz | 11 Mbps | Oldest widely deployed standard. Uses DSSS modulation. Suffers from interference (microwaves, Bluetooth). |
| **802.11g** | 2.4 GHz | 54 Mbps | Backward compatible with 802.11b. Uses OFDM. Same speed as 802.11a but on 2.4 GHz. |
| **802.11n (Wi-Fi 4)** | 2.4 GHz and 5 GHz (dual-band) | 600 Mbps | Introduced MIMO (Multiple Input Multiple Output). Can use channel bonding (40 MHz channels). |
| **802.11ac (Wi-Fi 5)** | 5 GHz only | 6.93 Gbps (theoretical) | Introduced MU-MIMO (Multi-User MIMO). Uses wider channels (80/160 MHz). Beamforming support. |
| **802.11ax (Wi-Fi 6)** | 2.4 GHz and 5 GHz | 9.6 Gbps (theoretical) | Uses OFDMA. Improved efficiency in dense environments. Target Wake Time (TWT) for IoT. |

> Exam trap: 802.11a and 802.11ac both use 5 GHz, but they are different standards. 802.11a is the old standard (54 Mbps), 802.11ac is the modern one (multi-gigabit). Do not confuse them.

### Key Wireless Terminology

| Term | Definition | Why It Matters |
|------|-----------|----------------|
| **SSID** (Service Set Identifier) | The human-readable name of a wireless network (e.g., "CoffeeShop_WiFi"). | Hiding the SSID does not provide real security --- it can still be discovered through probe requests and beacon frames. |
| **BSSID** (Basic Service Set Identifier) | The MAC address of the wireless access point. | Used to uniquely identify an AP. Critical in distinguishing rogue APs from legitimate ones. |
| **ESSID** (Extended Service Set Identifier) | The SSID shared across multiple access points in a roaming environment. | Multiple APs can share the same ESSID to allow seamless roaming (all APs in a corporate network). |
| **Beacon Frame** | Management frame broadcast by an AP to announce its presence. Contains SSID, supported rates, channel, encryption type. | Sent every ~100ms. Attackers sniff beacons to discover networks. |
| **Probe Request/Response** | A client sends a probe request to find available networks; APs respond with probe responses. | Even with SSID hiding, probe requests from clients reveal the SSID they are looking for. |
| **Association** | The process by which a wireless client connects to an AP. | A client must authenticate and then associate before data transfer begins. |

### Frequencies and Channels

**2.4 GHz band:**
- Has 14 channels (only 1--11 usable in the US, 1--13 in Europe, 1--14 in Japan).
- Channels 1, 6, and 11 are the three **non-overlapping channels**. Using other channel combinations causes co-channel interference.
- Each channel is 22 MHz wide with 5 MHz spacing between channel centers.

**5 GHz band:**
- Has many more non-overlapping channels (23+ depending on regulatory domain).
- Less interference because fewer devices use 5 GHz.
- Shorter range than 2.4 GHz (higher frequency = more attenuation through walls).

> Exam tip: If asked "which three channels should be used in a 2.4 GHz multi-AP deployment to avoid interference?" the answer is always **1, 6, and 11**.

### Wireless Network Types

| Type | Description |
|------|-------------|
| **Infrastructure mode** | Clients connect through a central access point (AP). Most common deployment. |
| **Ad-hoc mode** | Clients connect directly to each other (peer-to-peer) without an AP. Also called IBSS (Independent Basic Service Set). |
| **Mesh network** | Multiple APs connected to each other, forming a self-healing network. |
| **Monitor mode** | A special NIC mode that captures all wireless frames on a channel without associating with any AP. Required for packet sniffing and many wireless attacks. |

---

## Part 2: Wireless Encryption --- WEP, WPA, WPA2, WPA3

### WEP (Wired Equivalent Privacy) --- Broken, Do Not Use

WEP was the original 802.11 encryption standard. It is **completely broken** and should never be used. Understanding why it is broken is exam-critical.

**How WEP works:**
- Uses the **RC4** stream cipher for encryption.
- Uses a 24-bit **Initialization Vector (IV)** prepended to the shared key.
- The IV is sent in plaintext in every packet header.
- Key lengths: 64-bit (40-bit key + 24-bit IV) or 128-bit (104-bit key + 24-bit IV).

**Why WEP is broken:**
1. **IV is only 24 bits long** --- only 16.7 million possible values. In a busy network, IVs repeat within hours (IV collision/reuse).
2. **IV is transmitted in cleartext** --- an attacker can see every IV.
3. **CRC-32 integrity check is not cryptographically secure** --- an attacker can modify packets and recalculate the CRC without knowing the key.
4. **Key management is nonexistent** --- all clients share the same static key. No per-session keys.

**WEP cracking process (exam-critical):**
1. Put your wireless adapter into **monitor mode**.
2. Capture a large number of packets (especially IVs) using **airodump-ng**.
3. If traffic is slow, use **aireplay-ng** to inject ARP requests and force the AP to generate new IVs faster.
4. Once you have enough IVs (~40,000--80,000 for 128-bit WEP), run **aircrack-ng** to derive the key using statistical analysis (FMS/KoreK/PTW attacks).

> Exam fact: The **FMS attack** (Fluhrer, Mantin, Shamir) was the first practical WEP attack. The **PTW attack** (Pyshkin, Tews, Weinmann) is more efficient and requires fewer packets.

### WPA (Wi-Fi Protected Access) --- Improved but Superseded

WPA was introduced as a stopgap measure while WPA2 was being developed. It addressed WEP's worst flaws but still has weaknesses.

**Key features:**
- Uses **TKIP** (Temporal Key Integrity Protocol) for encryption.
- TKIP still uses RC4 underneath, but adds per-packet key mixing, a 48-bit IV (eliminates IV reuse), and a proper Message Integrity Check (MIC) called **Michael**.
- Supports two authentication modes:
  - **WPA-Personal (WPA-PSK):** Uses a Pre-Shared Key (passphrase). Suitable for home networks.
  - **WPA-Enterprise:** Uses 802.1X authentication with a RADIUS server. Suitable for corporate networks.

**Weaknesses:**
- TKIP is considered deprecated and has known vulnerabilities.
- WPA-PSK is vulnerable to **offline dictionary attacks** if the attacker captures the **4-way handshake**.

### WPA2 --- The Current Standard

WPA2 has been mandatory for Wi-Fi certified devices since 2006 and remains the most widely deployed secure wireless protocol.

**Key features:**
- Uses **AES-CCMP** (Counter Mode with Cipher Block Chaining Message Authentication Code Protocol) for encryption.
- AES is a strong block cipher (128-bit key minimum). CCMP provides both confidentiality and integrity.
- Supports the same two modes: WPA2-Personal (PSK) and WPA2-Enterprise (802.1X/RADIUS).
- Uses the **4-way handshake** to establish session keys without transmitting the PSK.

**The 4-Way Handshake (exam-critical):**

The 4-way handshake is how a client and AP derive session keys. Both sides already know the PSK but never transmit it directly.

1. **AP sends ANonce** (a random number) to the client.
2. **Client generates SNonce**, calculates the PTK (Pairwise Transient Key) using: PSK + ANonce + SNonce + AP MAC + Client MAC. Client sends SNonce + MIC to AP.
3. **AP calculates the same PTK** (it now has all inputs). AP sends the GTK (Group Temporal Key, for broadcast traffic) encrypted with the PTK + MIC.
4. **Client sends acknowledgment**.

> Exam critical: To crack WPA/WPA2-PSK, an attacker must capture the **4-way handshake**. Without it, offline dictionary attacks are impossible. Attackers often use **deauthentication attacks** to force clients to reconnect and re-perform the handshake.

**KRACK Attack (Key Reinstallation Attack):**
- Discovered in 2017 by Mathy Vanhoef.
- Exploits a flaw in the 4-way handshake implementation (not in AES itself).
- The attacker forces the client to reinstall an already-used encryption key by replaying handshake message 3.
- This resets the nonce and replay counter, allowing the attacker to decrypt, replay, and forge packets.
- Affects **all correct implementations of WPA2** (protocol-level flaw, not implementation-specific).
- Mitigated by patching clients and APs.

### WPA3 --- The Next Generation

WPA3 was released in 2018 to address WPA2's remaining weaknesses.

**Key improvements:**

| Feature | What It Does |
|---------|-------------|
| **SAE (Simultaneous Authentication of Equals)** | Replaces PSK-based authentication. Uses the **Dragonfly key exchange** protocol (based on elliptic curve cryptography). Provides forward secrecy --- even if the password is later compromised, past sessions cannot be decrypted. |
| **Protected Management Frames (PMF)** | Mandatory in WPA3. Prevents deauthentication and disassociation attacks by encrypting management frames. |
| **192-bit security suite** | WPA3-Enterprise uses 192-bit equivalent security (CNSA suite) for high-security environments. |
| **Opportunistic Wireless Encryption (OWE)** | Provides encryption on open networks without requiring a password (Enhanced Open). Uses Diffie-Hellman key exchange. |

**Dragonblood Vulnerability:**
- Discovered in 2019 by Mathy Vanhoef and Eyal Ronen.
- A set of vulnerabilities in the WPA3 SAE/Dragonfly handshake.
- Includes **side-channel attacks** (timing-based and cache-based) that leak information about the password.
- Includes a **downgrade attack** that forces WPA3 devices to fall back to WPA2, allowing traditional dictionary attacks.
- Patches have been released, but the vulnerability demonstrated that WPA3's initial implementations had flaws.

> Exam tip: If asked about WPA3's key exchange mechanism, the answer is **SAE (Dragonfly)**. If asked about WPA3 vulnerabilities, the answer is **Dragonblood**.

---

## Part 3: Wireless Attacks

### Evil Twin Attack

An evil twin is a rogue access point set up by an attacker to mimic a legitimate AP.

**How it works:**
1. The attacker sets up an AP with the **same SSID** as a legitimate network (e.g., "Starbucks_WiFi").
2. The attacker may use a stronger signal to attract clients.
3. The attacker may send **deauthentication frames** to disconnect clients from the real AP, forcing them to reconnect --- and they connect to the evil twin instead.
4. All client traffic now flows through the attacker's machine, enabling man-in-the-middle attacks, credential theft, and session hijacking.

**Key distinction:** An evil twin specifically impersonates a real AP. A generic rogue AP is any unauthorized AP connected to the network (it may not impersonate anything).

### Rogue Access Point

A rogue AP is any **unauthorized access point** connected to the corporate network.

**How it gets there:**
- An employee plugs in a personal wireless router to their desk for convenience.
- An attacker physically installs a small, hidden AP inside the building.
- A compromised device acts as a software AP.

**Why it is dangerous:** It bypasses all perimeter security (firewalls, IDS/IPS) because it creates a new entry point directly into the internal network.

### Deauthentication Attack

This is one of the most common and useful wireless attacks. Management frames in 802.11 (including deauthentication frames) are **not authenticated or encrypted** in WPA/WPA2.

**How it works:**
1. The attacker sends forged **deauthentication frames** to a client, pretending to be the AP (spoofing the AP's BSSID).
2. The client disconnects from the AP.
3. The client automatically tries to reconnect, performing a new 4-way handshake.
4. The attacker captures this handshake for offline cracking.

**Tool:** `aireplay-ng --deauth` is the standard tool for this attack.

> Exam fact: WPA3 mitigates deauthentication attacks through mandatory **Protected Management Frames (PMF)**, also known as 802.11w.

### Jamming (RF Interference)

Jamming is a denial-of-service attack that floods the wireless frequency band with noise, preventing legitimate communication.

**Types:**
- **Constant jamming:** Continuously emits radio signals on the target frequency.
- **Deceptive jamming:** Sends seemingly legitimate frames to keep the channel busy.
- **Random jamming:** Alternates between jamming and sleeping to save energy.
- **Reactive jamming:** Only jams when it detects transmission on the channel.

Jamming is illegal in most jurisdictions and is difficult to defend against (requires physical location of the jammer).

### Downgrade Attacks

A downgrade attack forces a wireless device to use a weaker security protocol than it supports.

**Examples:**
- Forcing a WPA3-capable device to connect using WPA2 (part of the Dragonblood attack).
- Forcing a device to use TKIP instead of AES-CCMP.
- Setting up a rogue AP that only offers WEP, hoping clients will connect anyway.

### Wardriving and Warchalking

**Wardriving:** The practice of driving around with a laptop, wireless adapter, and GPS to discover and map wireless networks. Tools used include Kismet, NetStumbler, inSSIDer, and GPS logging software. The data is often uploaded to databases like WiGLE (Wireless Geographic Logging Engine).

**Warchalking:** A system of symbols drawn in chalk on sidewalks and buildings to indicate the presence and type of nearby wireless networks. The symbols indicate open networks, closed (encrypted) networks, and WEP-protected networks. This is a legacy concept but still appears on the CEH exam.

| Symbol | Meaning |
|--------|---------|
| Two half-circles (back to back) | Open network |
| Circle | Closed network (encrypted) |
| Circle with "W" | WEP-protected network |

### WPS (Wi-Fi Protected Setup) Attacks

WPS was designed to simplify wireless setup by allowing users to connect via a PIN instead of entering a passphrase.

**Vulnerability:**
- The 8-digit WPS PIN is validated in two halves (first 4 digits, then last 4 digits).
- The last digit is a checksum.
- This reduces the brute-force space from 10^8 (100 million) to 10^4 + 10^3 = **11,000 combinations**.
- The **Reaver** tool can brute-force the WPS PIN in hours.
- The **Wash** tool is used to detect WPS-enabled access points.

> Exam tip: If a question mentions WPS, the answer almost always involves the PIN brute-force vulnerability or the Reaver tool.

---

## Part 4: Wireless Hacking Tools

| Tool | Category | What It Does |
|------|----------|-------------|
| **Aircrack-ng** (suite) | Cracking | Complete suite for wireless auditing. Includes: airodump-ng (capture), aireplay-ng (injection), aircrack-ng (cracking), airmon-ng (monitor mode). The go-to tool for WEP/WPA cracking. |
| **Kismet** | Discovery/Sniffing | Passive wireless network detector, sniffer, and IDS. Works in monitor mode. Detects hidden SSIDs, rogue APs, and supports GPS logging. |
| **Wireshark + AirPcap** | Sniffing/Analysis | Wireshark is the packet analyzer; AirPcap is a specialized USB adapter that allows Wireshark to capture raw 802.11 frames on Windows. On Linux, a standard adapter in monitor mode works with Wireshark directly. |
| **Wash** | WPS Detection | Identifies access points with WPS enabled. Used as a precursor to Reaver attacks. Part of the Reaver package. |
| **Reaver** | WPS Cracking | Brute-forces WPS PINs to recover WPA/WPA2 passphrases. |
| **WiFi Pineapple** | Rogue AP/MitM | A hardware device by Hak5 designed for wireless penetration testing. Can perform evil twin attacks, MitM, credential harvesting. Has a web-based interface and modules. |
| **inSSIDer** | Discovery | Windows/macOS tool for discovering and analyzing wireless networks. Shows signal strength, channel usage, encryption type. Useful for site surveys. |
| **NetStumbler** | Discovery | Legacy Windows tool for wardriving and wireless network discovery. Replaced by inSSIDer on modern systems. Active scanner (sends probe requests). |
| **Wifite** | Automated Cracking | Automated wireless attack tool. Automates WEP, WPA, and WPS attacks. Wraps around Aircrack-ng, Reaver, and other tools. |
| **Fern WiFi Cracker** | Cracking (GUI) | GUI-based wireless security auditing tool. Can crack WEP/WPA keys and perform MitM attacks. |

**Aircrack-ng Suite Breakdown (exam-critical):**

| Component | Function |
|-----------|----------|
| `airmon-ng` | Enables/disables monitor mode on a wireless interface. |
| `airodump-ng` | Captures raw 802.11 frames. Displays nearby APs, clients, channels, encryption. Saves capture files (.cap). |
| `aireplay-ng` | Injects packets. Used for deauthentication attacks, ARP replay (to generate WEP IVs), and fake authentication. |
| `aircrack-ng` | Cracks WEP keys (statistical analysis of IVs) and WPA/WPA2 keys (dictionary attack against captured handshake). |
| `airdecap-ng` | Decrypts WEP/WPA capture files once the key is known. |

> Worked example (exam-style question --- wireless attack):
>
> *Question:* An attacker wants to crack a WPA2-PSK network. They have positioned themselves near the target AP but no clients are currently connected. What should the attacker do first?
>
> | Option | Text |
> |--------|------|
> | A | Run aircrack-ng with a dictionary file |
> | B | Wait for a client to connect and capture the 4-way handshake |
> | C | Use aireplay-ng to send deauthentication frames |
> | D | Use Reaver to brute-force the WPS PIN |
>
> *Correct answer:* **B --- Wait for a client to connect and capture the 4-way handshake.** You cannot crack WPA2-PSK without the 4-way handshake. Option C would work if clients were already connected (to force them to reconnect), but the question says no clients are connected. Option A is premature --- you need the handshake first. Option D is only relevant if WPS is enabled.

---

## Part 5: Bluetooth Hacking

### Bluetooth Fundamentals

Bluetooth operates in the **2.4 GHz ISM band** (same as Wi-Fi 802.11b/g/n) and uses frequency hopping spread spectrum (FHSS) across 79 channels. Bluetooth range varies by power class:

| Class | Range | Power |
|-------|-------|-------|
| Class 1 | ~100 meters | 100 mW |
| Class 2 | ~10 meters | 2.5 mW (most common in phones/headsets) |
| Class 3 | ~1 meter | 1 mW |

**Bluetooth Low Energy (BLE):** A separate protocol optimized for IoT devices, wearables, and sensors. Uses less power but has different security characteristics.

### Bluetooth Attacks

| Attack | What It Does | Severity |
|--------|-------------|----------|
| **Bluejacking** | Sends unsolicited messages to a Bluetooth-enabled device (via OBEX Push). No data is stolen --- it is essentially wireless spam. The attacker sends a contact card or message that appears on the victim's screen. | Low (annoyance only) |
| **Bluesnarfing** | Unauthorized access to data on a Bluetooth device (contacts, calendar, emails, SMS). Exploits OBEX protocol vulnerabilities to **read** data from the device without pairing. | High (data theft) |
| **Bluebugging** | Takes full control of a Bluetooth device. The attacker can make calls, send messages, access the internet, and eavesdrop on conversations --- all without the device owner's knowledge. | Critical (full device control) |
| **Bluesmacking** | A Bluetooth denial-of-service attack. Sends oversized L2CAP (Logical Link Control and Adaptation Protocol) packets to crash the target device. Similar concept to a ping-of-death. | Medium (DoS) |
| **Btlejacking** | Targets Bluetooth Low Energy (BLE) connections. The attacker sniffs the BLE connection, jams it, and takes over the connection by impersonating one of the paired devices. Uses the **Btlejack** tool and a micro:bit device. | High (connection hijack) |

> Exam trap: Students often confuse Bluejacking and Bluesnarfing. **Bluejacking = sending messages (harmless spam)**. **Bluesnarfing = stealing data (serious attack)**. The "snarf" in Bluesnarfing means "to steal."

> Worked example (exam-style question --- Bluetooth):
>
> *Question:* A security consultant discovers that an attacker gained unauthorized access to contacts and calendar data from an employee's smartphone via Bluetooth, without any user interaction. Which attack was used?
>
> | Option | Text |
> |--------|------|
> | A | Bluejacking |
> | B | Bluesnarfing |
> | C | Bluebugging |
> | D | Bluesmacking |
>
> *Correct answer:* **B --- Bluesnarfing.** The key indicators are: unauthorized access to data (contacts, calendar), no user interaction, and via Bluetooth. Bluejacking only sends messages, Bluebugging would imply full control (making calls, etc.), and Bluesmacking is DoS.

---

## Part 6: Wireless Antenna Types

The type of antenna determines the **coverage pattern** and **range** of a wireless signal. The exam tests your knowledge of which antenna type is used for which purpose.

| Antenna Type | Pattern | Range | Use Case |
|-------------|---------|-------|----------|
| **Omnidirectional** | Radiates signal equally in all directions (360 degrees horizontal). | Short to medium | General-purpose coverage. Used in standard home/office APs. Good for covering an entire floor or room. |
| **Dipole** | A type of omnidirectional antenna. Consists of two elements. Radiates in a doughnut-shaped pattern. | Short to medium | The default antenna on most wireless routers. Provides 360-degree horizontal coverage. |
| **Directional (Yagi)** | Focuses signal in one direction (narrow beam). | Long range | Point-to-point links. Wardrivers use Yagi antennas to pick up distant signals. Shaped like a TV antenna. |
| **Parabolic Grid** | Highly directional, dish-shaped. Focuses signal into a very narrow beam. | Very long range (miles) | Long-distance point-to-point links. Used in wardriving for extreme range. Also used for building-to-building wireless bridges. |
| **Patch/Panel** | Semi-directional. Flat panel that radiates in a half-sphere pattern. | Medium | Wall-mounted in offices and warehouses. Provides coverage in one direction (e.g., down a hallway). |

> Exam tip: If the question asks about an antenna for "maximum range" or "long-distance," the answer is **parabolic grid**. If it asks about general coverage in all directions, the answer is **omnidirectional** or **dipole**.

---

## Part 7: Wireless Countermeasures

### Detection and Prevention

| Countermeasure | What It Does |
|---------------|-------------|
| **WIPS (Wireless Intrusion Prevention System)** | Monitors the wireless environment for rogue APs, evil twins, and unauthorized clients. Can actively block (contain) rogue devices by sending deauthentication frames to clients connecting to them. |
| **Wireless IDS** | Detects wireless attacks (deauthentication floods, rogue APs, injection attacks) but does not actively block them. Passive monitoring only. |
| **MAC Filtering** | Only allows devices with pre-approved MAC addresses to connect. Easily bypassed by MAC spoofing --- should not be relied upon as a sole security measure. |
| **SSID Hiding** | Disables SSID broadcast in beacon frames. The AP still responds to directed probe requests, and the SSID is visible in association frames. Provides no real security --- only "security through obscurity." |

### Best Practices

1. **Use WPA3 or WPA2-Enterprise** (with RADIUS and 802.1X). Never use WEP or WPA with TKIP.
2. **Disable WPS** on all access points. The PIN vulnerability cannot be fully mitigated.
3. **Use strong passphrases** for WPA2/WPA3-Personal (20+ characters, random).
4. **Enable 802.11w (Protected Management Frames)** to prevent deauthentication attacks.
5. **Segment wireless traffic** from the wired network using VLANs and firewalls.
6. **Regularly scan for rogue APs** using WIPS or manual site surveys.
7. **Use WPA2/WPA3-Enterprise with EAP-TLS** (certificate-based) for the strongest authentication.
8. **Physically secure APs** to prevent tampering or replacement.
9. **Reduce AP power** to limit signal leakage outside the building.
10. **Monitor and log** all wireless events for forensic analysis.

---

## DOMAIN 7: MOBILE PLATFORM, IoT AND OT HACKING (10% Exam Weight)

---

## Part 8: Mobile Attack Vectors

### SMS-Based Attacks

| Attack | Description |
|--------|-------------|
| **Smishing (SMS Phishing)** | Phishing via SMS text messages. The attacker sends a text with a malicious link or a message urging the victim to call a fake number. Example: "Your bank account has been locked. Click here to verify." |
| **Advanced SMS Phishing (OTA --- Over-The-Air)** | Exploits OTA provisioning messages that carriers use to configure phone settings. The attacker sends a specially crafted OTA message that tricks the phone into changing its network settings (APN, proxy) to route traffic through the attacker's server. |

### Advanced Mobile Attacks

| Attack | Description | Key Details |
|--------|-------------|-------------|
| **Spearphone Attack** | Exploits the accelerometer in smartphones to eavesdrop on phone calls. The accelerometer picks up speech vibrations from the phone's loudspeaker. No microphone permission needed --- the accelerometer is accessible without special permissions on most mobile OS versions. | Proof-of-concept attack. Works when the phone is on speaker mode. |
| **Agent Smith Attack** | Malware that replaces legitimate apps with malicious versions without the user's knowledge. The malware exploits the Janus vulnerability (Android) to inject malicious code into APKs while keeping the original signature valid. Named after the Matrix character who replaces people. | Spread through third-party app stores. Affected millions of devices primarily in India and Southeast Asia. |
| **Man-in-the-Disk** | Exploits Android's External Storage (SD card) which is shared and accessible by all apps. A malicious app monitors and modifies files that other apps write to external storage. When the legitimate app reads back those files, it loads the attacker's modified version. | Android-specific. Exploits the fact that external storage has no per-app sandboxing. |
| **iOS Trustjacking** | Exploits the iTunes Wi-Fi Sync feature. When a user connects their iPhone to a computer and clicks "Trust," the computer gets persistent access to the device --- even over Wi-Fi after the physical connection is removed. The attacker can read data, install apps, and take screenshots. | Requires the user to initially click "Trust" on the device. Once trusted, access persists indefinitely. |

> Worked example (exam-style question --- mobile attack):
>
> *Question:* A researcher demonstrates that an Android app without microphone permissions can still eavesdrop on phone calls by reading data from the phone's motion sensors while the phone is on speaker. What type of attack is this?
>
> | Option | Text |
> |--------|------|
> | A | Man-in-the-Disk |
> | B | Agent Smith |
> | C | Spearphone |
> | D | Smishing |
>
> *Correct answer:* **C --- Spearphone.** The key indicators are: eavesdropping on calls, using motion sensors (accelerometer), no microphone permission needed, and speaker mode.

---

## Part 9: iOS Jailbreaking

Jailbreaking is the process of removing software restrictions (sandbox, code signing) imposed by Apple on iOS devices. It grants root access and allows installing apps from outside the App Store (typically via Cydia).

### Jailbreaking Types

| Type | Survives Reboot? | Description |
|------|-------------------|-------------|
| **Untethered** | Yes, fully | The most desirable jailbreak. The device remains jailbroken after every reboot. No computer needed to re-jailbreak. The exploit patches the kernel during boot automatically. |
| **Tethered** | No | The device must be connected to a computer and re-jailbroken every time it reboots. If it reboots without a computer, it gets stuck in a partially booted state. Very inconvenient. |
| **Semi-tethered** | Partially | The device can reboot on its own and function normally (make calls, etc.), but the jailbreak features are not available until the device is connected to a computer to re-apply the jailbreak. |
| **Semi-untethered** | Partially | The device can reboot on its own, and the jailbreak can be re-applied by running an app on the device itself (no computer needed). However, the jailbreak is not persistent --- the app must be run after each reboot. |

> Exam trap: The distinction between semi-tethered and semi-untethered is subtle. **Semi-tethered** needs a computer to re-jailbreak. **Semi-untethered** uses an on-device app to re-jailbreak. Both lose jailbreak on reboot, but semi-untethered is more convenient.

### Jailbreaking Risks

- Voids Apple warranty.
- Removes iOS security protections (sandboxing, code signing).
- Makes the device vulnerable to malware (unsigned apps can be installed).
- May cause instability and bricking.
- Updates may remove the jailbreak or brick the device.

---

## Part 10: Android Rooting and Mobile Reverse Engineering

### Android Rooting

Rooting is the Android equivalent of jailbreaking. It grants root (superuser) access to the Android operating system.

**Methods:**
- **Exploiting kernel vulnerabilities** to escalate privileges.
- **Unlocking the bootloader** and flashing a custom recovery (e.g., TWRP) and rooting package (e.g., Magisk, SuperSU).
- **Using rooting apps** (e.g., KingRoot, OneClickRoot) that automate exploitation of known vulnerabilities.

**Risks:**
- Voids warranty on most devices.
- Bypasses Android's security model (SELinux, verified boot).
- Banking and enterprise apps may refuse to run on rooted devices (SafetyNet/Play Integrity check).
- Malware with root access has complete control over the device.

### Reverse Engineering Mobile Apps

**Android reverse engineering:**
1. **APK extraction:** Pull the APK from the device using ADB (`adb pull`).
2. **Decompilation:** Use **JADX** or **apktool** to decompile the APK back to Java/Smali code.
3. **Analysis:** Examine the decompiled code for hardcoded credentials, API keys, insecure data storage, and vulnerability patterns.
4. **Dynamic analysis:** Use **Frida** or **Drozer** to hook into running apps and modify behavior at runtime.

**iOS reverse engineering:**
1. More difficult because iOS apps are encrypted (FairPlay DRM).
2. Tools like **Clutch** or **dumpdecrypted** can decrypt app binaries on jailbroken devices.
3. **class-dump** extracts Objective-C class information.
4. **Hopper** or **IDA Pro** for disassembly and analysis.

---

## Part 11: Mobile Device Management (MDM) and BYOD

### MDM (Mobile Device Management)

MDM solutions allow organizations to **manage, monitor, and secure** employee mobile devices. This is critical for protecting corporate data on both company-owned and personal devices.

**Key MDM capabilities:**
- **Remote wipe:** Erase all data on a lost or stolen device.
- **Remote lock:** Lock the device remotely.
- **Password enforcement:** Require strong passwords/PINs.
- **App management:** Whitelist/blacklist apps. Push corporate apps. Remove unauthorized apps.
- **Encryption enforcement:** Require device encryption.
- **Geofencing:** Restrict device capabilities based on physical location.
- **Jailbreak/root detection:** Detect and respond to compromised devices.
- **VPN configuration:** Push VPN profiles for secure access to corporate resources.
- **Certificate management:** Deploy certificates for authentication.

**Popular MDM solutions:** Microsoft Intune, VMware Workspace ONE (AirWatch), MobileIron, Jamf (iOS/macOS).

### App Sandboxing

Both iOS and Android isolate apps from each other using sandboxing:
- **iOS:** Each app runs in its own sandbox and cannot access other apps' data or system files. Apps communicate through controlled APIs (URL schemes, App Extensions).
- **Android:** Each app gets its own Linux user ID and runs in its own process. Apps cannot access other apps' data unless explicitly granted permissions.

### BYOD (Bring Your Own Device) Policies

| Policy Type | Description |
|-------------|-------------|
| **BYOD** | Employees use their own personal devices for work. Organization has limited control. MDM enrollment is typically required. |
| **COPE (Corporate-Owned, Personally Enabled)** | Organization owns the device but allows personal use. More control than BYOD. |
| **CYOD (Choose Your Own Device)** | Employee chooses from a list of approved devices. Organization owns and manages the device. |
| **COBO (Corporate-Owned, Business Only)** | Organization owns the device, and it is used strictly for business. Maximum control. |

---

## Part 12: Mobile Hacking Tools

| Tool | Platform | What It Does |
|------|----------|-------------|
| **DroidSheep** | Android | Session hijacking tool. Captures session cookies on shared Wi-Fi networks. Similar to Firesheep but for Android. |
| **FaceNiff** | Android | Sniffs and intercepts web session profiles on Wi-Fi. Can hijack sessions of Facebook, Twitter, and other sites. Requires a rooted Android device. |
| **zANTI** | Android | Comprehensive mobile penetration testing toolkit by Zimperium. Performs network scanning, MitM attacks, password auditing, and vulnerability scanning from an Android device. |
| **AndroRAT** | Android | Remote Administration Tool (RAT) for Android. Allows an attacker to remotely control an Android device --- read SMS, access contacts, record audio, take photos, track GPS location. |
| **Trident / Pegasus** | iOS | Pegasus is spyware developed by NSO Group. Trident refers to the three zero-day vulnerabilities it exploited to jailbreak and infect iOS devices silently. Used for targeted surveillance of journalists and activists. |

---

## Part 13: IoT (Internet of Things) Concepts and Architecture

### IoT Architecture

The IoT architecture is typically described in layers:

| Layer | Also Called | Function | Examples |
|-------|-----------|----------|----------|
| **Edge/Perception Layer** | Device Layer | Physical sensors and actuators that collect data from the environment. | Temperature sensors, cameras, RFID readers, smart locks. |
| **Gateway/Network Layer** | Transport Layer | Transmits data from edge devices to the cloud/processing layer. Handles protocol conversion. | Wi-Fi routers, Zigbee coordinators, cellular gateways, LoRa gateways. |
| **Processing/Middleware Layer** | Fog Layer | Processes, filters, and aggregates data before sending it to the cloud. Edge computing happens here. | Edge servers, fog nodes, local analytics. |
| **Application Layer** | Business Layer | Provides user-facing services and interfaces. Where the data becomes useful. | Smart home apps, industrial dashboards, fleet management portals. |
| **Cloud Layer** | Enterprise Layer | Stores, processes, and analyzes large volumes of IoT data. Machine learning and big data analytics. | AWS IoT, Azure IoT Hub, Google Cloud IoT. |

### IoT Protocols

| Protocol | Full Name | Key Facts |
|----------|-----------|-----------|
| **MQTT** | Message Queuing Telemetry Transport | Lightweight publish/subscribe messaging protocol. Runs over TCP. Uses port **1883** (unencrypted) or **8883** (TLS). Designed for constrained devices and low-bandwidth networks. Has a broker architecture (clients publish/subscribe to topics). Three QoS levels (0, 1, 2). |
| **Zigbee** | --- | Low-power, low-data-rate wireless protocol. Uses IEEE 802.15.4 standard. Operates on 2.4 GHz. Supports mesh networking. Used in home automation (smart lights, thermostats). Range: 10--100 meters. Supports up to 65,000 nodes in a network. |
| **BLE** | Bluetooth Low Energy | Low-power variant of Bluetooth. Used in wearables, beacons, health devices. Range: ~100 meters (Class 1). Supports broadcasting (beacons) and connection-based communication. |
| **LPWAN** | Low-Power Wide-Area Network | Category of protocols designed for long-range, low-power IoT communication. Examples: LoRa/LoRaWAN (up to 15 km range), Sigfox, NB-IoT. |
| **NB-IoT** | Narrowband IoT | Cellular IoT standard (3GPP). Uses licensed spectrum. Range: up to 10 km. Very low power and low data rate. Used for smart meters, asset tracking. |
| **CoAP** | Constrained Application Protocol | Lightweight RESTful protocol for constrained devices. Runs over UDP. Similar to HTTP but much lighter. Used in sensor networks. |

### Mirai Botnet and Port 48101

**Mirai** is the most infamous IoT botnet. It was responsible for massive DDoS attacks in 2016, including taking down DNS provider Dyn and disrupting major websites.

**How Mirai works:**
1. Scans the internet for IoT devices with open **Telnet** (port 23) or **SSH** (port 22).
2. Attempts to log in using a table of **61 default username/password combinations** (e.g., admin/admin, root/root).
3. Once logged in, downloads and installs the Mirai malware.
4. Infected devices report to a **command-and-control (C2) server** on **port 48101**.
5. The botnet operator can command thousands of infected devices to launch DDoS attacks.

> Exam fact: **Port 48101** is associated with the Mirai botnet C2 communication. If a question mentions port 48101, think Mirai.

---

## Part 14: IoT Attacks

| Attack | Description | Details |
|--------|-------------|---------|
| **Replay Attack** | The attacker captures legitimate IoT communication (e.g., a "door unlock" command) and replays it later to trigger the same action. | Mitigated by using timestamps, nonces, and sequence numbers in messages. |
| **Side-Channel Attack** | Extracts secret information by analyzing physical characteristics of the device --- power consumption, electromagnetic emissions, timing, sound. Does not attack the algorithm directly; attacks the implementation. | Types: timing attack, power analysis (SPA/DPA), electromagnetic analysis, acoustic analysis. |
| **Fault Injection** | Deliberately introduces faults into a device to make it behave abnormally, potentially leaking secrets or bypassing security checks. | Three main types detailed below. |
| **DDoS via IoT Botnets** | Compromised IoT devices (cameras, routers, DVRs) are used as a botnet to flood targets with traffic. | Mirai, Reaper/IoTroop, Mozi are major IoT botnets. |
| **HVAC Attack** | Targets building automation systems (HVAC, lighting) to cause physical damage or discomfort. | Entry point into corporate networks (the Target breach started through an HVAC vendor). |
| **Rolling Code Attack** | Targets wireless key fobs (cars, garage doors). The attacker jams the signal while capturing the rolling code, then replays it. | Specific to devices using rolling/hopping codes for authentication. |

### Fault Injection --- Deep Dive

Fault injection is a hardware-level attack that the CEH exam specifically tests. The three main types are:

| Technique | How It Works | What It Achieves |
|-----------|-------------|-----------------|
| **Power Glitching (Voltage Fault Injection)** | Momentarily drops or spikes the supply voltage to the chip during a critical operation (e.g., during a password check or encryption). | The processor skips instructions or produces incorrect results. Can bypass secure boot, skip authentication checks, or cause the chip to output secret keys. |
| **Clock Glitching** | Momentarily changes the clock signal to the processor (adding an extra clock edge or shortening a cycle). | The processor executes instructions incorrectly. Can cause conditional jumps to take the wrong branch (e.g., bypassing "if password correct" checks). |
| **EMFI (Electromagnetic Fault Injection)** | Uses a focused electromagnetic pulse directed at the chip to induce faults in specific transistors. | More targeted than voltage/clock glitching. Can affect specific regions of the chip. Used to bypass secure elements and extract cryptographic keys. |

---

## Part 15: IoT Hacking Tools

| Tool | Purpose | Key Details |
|------|---------|-------------|
| **Shodan** | IoT Search Engine | Searches for internet-connected devices (webcams, routers, SCADA, databases). Indexes banners, open ports, services, and device types. Can find devices with default credentials, known vulnerabilities, and exposed admin interfaces. "The search engine for the Internet of Things." |
| **Censys** | IoT/Internet Search Engine | Similar to Shodan. Scans the entire IPv4 address space. Provides detailed information about hosts, certificates, and services. Often used for research and asset discovery. |
| **IoTSeeker** | Default Credential Scanner | Scans a network for IoT devices using **default credentials**. Checks common IoT devices (IP cameras, routers, printers) against known default username/password combinations. |
| **FCC ID Search** | Hardware Research | The FCC (Federal Communications Commission) requires all wireless devices sold in the US to have an FCC ID. Searching the FCC database (fcc.gov/oet/ea/fccid) reveals: internal photos, schematics, test reports, user manuals, and operating frequencies. Valuable for hardware reverse engineering. |
| **Foren6** | 6LoWPAN/IoT Sniffer | Captures and visualizes 6LoWPAN (IPv6 over Low-Power Wireless Personal Area Networks) traffic. Used for analyzing IoT network topology and communication. |
| **HackRF One** | SDR (Software Defined Radio) | Hardware device for capturing and transmitting radio signals across a wide frequency range. Used for analyzing IoT wireless protocols (Zigbee, Z-Wave, LoRa, garage door openers). |
| **Attify Badge** | IoT Hardware Hacking | A hardware tool for interfacing with IoT device debug ports (UART, SPI, I2C, JTAG). Used for extracting firmware, debugging, and hardware-level analysis. |

> Worked example (exam-style question --- IoT):
>
> *Question:* A penetration tester wants to find internet-connected SCADA systems that are using default credentials. Which tools should they use?
>
> | Option | Text |
> |--------|------|
> | A | Nmap and Metasploit |
> | B | Shodan and IoTSeeker |
> | C | Wireshark and Burp Suite |
> | D | Nessus and OpenVAS |
>
> *Correct answer:* **B --- Shodan and IoTSeeker.** Shodan finds internet-connected devices (including SCADA systems), and IoTSeeker specifically scans for default credentials on IoT devices. While other tools can perform parts of this task, the combination of Shodan + IoTSeeker is the most direct match for the described scenario.

---

## Part 16: OT/ICS/SCADA Concepts and Attacks

### Terminology

| Term | Full Name | Definition |
|------|-----------|-----------|
| **OT** | Operational Technology | Hardware and software that monitors and controls physical devices, processes, and events in industrial environments. |
| **ICS** | Industrial Control System | A general term for systems that control industrial processes. ICS includes SCADA, DCS, and PLCs. |
| **SCADA** | Supervisory Control and Data Acquisition | A system that collects data from remote sensors and controllers (RTUs) and provides centralized monitoring and control. Used in power grids, water treatment, oil/gas pipelines. |
| **DCS** | Distributed Control System | Controls processes within a single facility (e.g., a chemical plant). More localized than SCADA. |
| **PLC** | Programmable Logic Controller | A ruggedized computer that controls physical processes (opening valves, controlling motors). Programmed with ladder logic. |
| **RTU** | Remote Terminal Unit | A field device that interfaces between physical equipment and the SCADA system. Collects data from sensors and sends it to the SCADA master. |
| **HMI** | Human-Machine Interface | The screen/panel that operators use to monitor and control the industrial process. Displays process data, alarms, and controls. |

### OT vs. IT

| Aspect | IT (Information Technology) | OT (Operational Technology) |
|--------|---------------------------|---------------------------|
| **Priority** | Confidentiality > Integrity > Availability (CIA) | Availability > Integrity > Confidentiality (AIC) --- uptime is everything |
| **Patching** | Regular, automated patching | Very slow patching --- systems cannot be taken offline easily. Many systems run decades-old software. |
| **Lifecycle** | 3--5 years | 15--25+ years |
| **Protocols** | TCP/IP, HTTP, DNS | Modbus, DNP3, OPC, BACnet, EtherNet/IP |
| **Impact of breach** | Data loss, financial loss | Physical damage, environmental disaster, loss of human life |

### OT/ICS Protocols

| Protocol | Use | Key Facts |
|----------|-----|-----------|
| **Modbus** | Industrial communication | One of the oldest ICS protocols (1979). Master-slave architecture. **No built-in authentication or encryption**. Runs on TCP port **502**. |
| **DNP3** (Distributed Network Protocol) | SCADA communication | Used in electric utilities and water systems. Runs on TCP/UDP port **20000**. Has some security features in newer versions (Secure Authentication). |
| **OPC UA** | Industrial data exchange | Modern protocol for secure ICS communication. Supports encryption and authentication. Replacing older OPC DA. |
| **BACnet** | Building automation | Controls HVAC, lighting, fire systems. Port **47808** (UDP). |
| **EtherNet/IP** | Industrial Ethernet | Uses TCP port **44818**. Common in manufacturing. |

### OT/ICS Attacks

| Attack Type | Description | Example |
|------------|-------------|---------|
| **HMI-Based Attack** | Exploiting vulnerabilities in the Human-Machine Interface software. Many HMIs run on Windows with outdated software, making them vulnerable to standard Windows exploits. | Attacker gains access to HMI and manipulates process controls (changes set points, disables alarms). |
| **Spear Phishing on ICS** | Targeted phishing emails sent to ICS operators/engineers. Because ICS networks are often air-gapped, the initial compromise usually targets the IT network or engineering workstations. | The Stuxnet attack initially spread via USB drives and spear phishing before reaching the air-gapped ICS network. |
| **Man-in-the-Middle on ICS Protocols** | ICS protocols like Modbus have no encryption. Attackers on the network can intercept and modify commands in transit. | Modifying a Modbus command to change a valve position or temperature setpoint. |
| **Supply Chain Attack** | Compromising software or hardware before it reaches the ICS environment. | SolarWinds-style attacks targeting ICS vendor software updates. |

### Notable ICS Attacks in History

| Attack | Year | Target | Method |
|--------|------|--------|--------|
| **Stuxnet** | 2010 | Iran's nuclear centrifuges (Natanz) | Worm that targeted Siemens PLCs. Modified centrifuge speeds while reporting normal readings to operators. Spread via USB drives. First known cyberweapon. |
| **BlackEnergy/CrashOverride** | 2015--2016 | Ukraine power grid | Caused power outages affecting hundreds of thousands. Used spear phishing + custom ICS malware. |
| **Triton/TRISIS** | 2017 | Saudi petrochemical plant | Targeted Triconex Safety Instrumented Systems (SIS). Attempted to disable safety systems that prevent explosions. First malware designed to cause physical harm by disabling safety controls. |

### OT Security Tools

| Tool | Purpose |
|------|---------|
| **Flowmon** | Network monitoring and anomaly detection for OT/ICS networks. Uses flow-based analysis (NetFlow, IPFIX) to detect unusual communication patterns. Can identify scanning, lateral movement, and protocol abuse in ICS environments. |
| **Claroty** | OT security platform. Provides asset inventory, vulnerability management, and threat detection for ICS/SCADA networks. |
| **Dragos** | ICS/OT cybersecurity platform. Provides threat intelligence, asset visibility, and incident response for industrial environments. |
| **Nozomi Networks** | OT/IoT security. Real-time monitoring and anomaly detection for industrial networks. |

---

## Day 6 Summary: Key Facts for Quick Review

### Wireless Quick Reference

| Topic | Key Fact |
|-------|---------|
| WEP weakness | 24-bit IV, RC4, CRC-32 --- all broken |
| WPA encryption | TKIP (RC4-based, with improvements) |
| WPA2 encryption | AES-CCMP |
| WPA3 key exchange | SAE (Dragonfly) |
| WPA3 vulnerability | Dragonblood |
| WPA2 vulnerability | KRACK (Key Reinstallation Attack) |
| Non-overlapping 2.4 GHz channels | 1, 6, 11 |
| Deauth prevention | 802.11w / PMF (Protected Management Frames) |
| WPS brute-force combinations | 11,000 (not 100 million) |
| WPS attack tool | Reaver |
| WPS detection tool | Wash |
| Long-range antenna | Parabolic grid |
| All-direction antenna | Omnidirectional / Dipole |

### Bluetooth Quick Reference

| Attack | Effect |
|--------|--------|
| Bluejacking | Sends messages (harmless spam) |
| Bluesnarfing | Steals data |
| Bluebugging | Full device control |
| Bluesmacking | DoS (oversized L2CAP packets) |
| Btlejacking | BLE connection hijack |

### Mobile Quick Reference

| Topic | Key Fact |
|-------|---------|
| Spearphone | Eavesdrop via accelerometer |
| Agent Smith | Replaces legitimate apps with malicious copies |
| Man-in-the-Disk | Exploits Android external storage |
| iOS Trustjacking | Exploits iTunes Wi-Fi Sync trust |
| Untethered jailbreak | Survives reboot, no computer needed |
| Semi-untethered jailbreak | Needs on-device app after reboot |

### IoT/OT Quick Reference

| Topic | Key Fact |
|-------|---------|
| MQTT ports | 1883 (unencrypted), 8883 (TLS) |
| Mirai C2 port | 48101 |
| Mirai method | Default credentials via Telnet (port 23) |
| Modbus port | 502 (TCP) |
| DNP3 port | 20000 (TCP/UDP) |
| BACnet port | 47808 (UDP) |
| OT priority order | Availability > Integrity > Confidentiality |
| Stuxnet target | Siemens PLCs (Iranian centrifuges) |
| Triton target | Safety Instrumented Systems (SIS) |
| Fault injection types | Power glitching, clock glitching, EMFI |

---

## Day 6 Practice Questions

**Question 1:** An attacker captures wireless traffic and discovers that the Initialization Vectors are being reused, allowing statistical analysis to recover the encryption key. Which encryption protocol is being used?

| Option | Text |
|--------|------|
| A | WPA2-AES |
| B | WPA-TKIP |
| C | WEP |
| D | WPA3-SAE |

*Correct answer:* **C --- WEP.** WEP uses a 24-bit IV that frequently repeats, enabling key recovery through statistical analysis. WPA uses a 48-bit IV that does not repeat in practice. WPA2 uses AES-CCMP (no IV reuse issue). WPA3 uses SAE.

---

**Question 2:** A security team discovers that employees' phones are automatically connecting to an access point in the parking lot that has the same SSID as the corporate Wi-Fi. What type of attack is this?

| Option | Text |
|--------|------|
| A | Rogue access point |
| B | Evil twin |
| C | Jamming |
| D | Wardriving |

*Correct answer:* **B --- Evil twin.** An evil twin specifically impersonates a legitimate AP by using the same SSID. A rogue AP is unauthorized but does not necessarily impersonate another AP. The attacker likely uses a stronger signal to lure clients.

---

**Question 3:** Which WPA3 feature prevents offline dictionary attacks against the pre-shared key?

| Option | Text |
|--------|------|
| A | AES-CCMP |
| B | TKIP |
| C | SAE (Simultaneous Authentication of Equals) |
| D | WPS |

*Correct answer:* **C --- SAE.** SAE uses the Dragonfly key exchange, which provides resistance to offline dictionary attacks because the handshake does not expose enough information for offline cracking. It also provides forward secrecy.

---

**Question 4:** An attacker sends specially crafted OTA provisioning messages to a victim's phone, causing it to change its APN settings and route all traffic through the attacker's proxy server. What type of attack is this?

| Option | Text |
|--------|------|
| A | Smishing |
| B | Advanced SMS Phishing (OTA) |
| C | Man-in-the-Disk |
| D | Spearphone |

*Correct answer:* **B --- Advanced SMS Phishing (OTA).** The key indicator is the OTA provisioning message that modifies phone settings (APN). Regular smishing uses social engineering links/calls. This attack exploits the phone's trust in carrier-style OTA configuration messages.

---

**Question 5:** A penetration tester deliberately introduces a momentary voltage drop to a microcontroller during its boot process, causing it to skip the firmware signature verification. What type of attack is this?

| Option | Text |
|--------|------|
| A | Side-channel attack |
| B | Replay attack |
| C | Fault injection (power glitching) |
| D | Buffer overflow |

*Correct answer:* **C --- Fault injection (power glitching).** The key indicators are: deliberate voltage manipulation during boot, causing the processor to skip a security check. This is power glitching, a form of fault injection. A side-channel attack observes (does not interfere with) the device's operation.

---

**Question 6:** Which port is associated with the Mirai botnet's command-and-control communication?

| Option | Text |
|--------|------|
| A | Port 23 |
| B | Port 443 |
| C | Port 48101 |
| D | Port 8883 |

*Correct answer:* **C --- Port 48101.** Mirai uses port 48101 for C2 communication. Port 23 (Telnet) is used by Mirai to scan for and compromise new devices, but the C2 channel is on 48101. Port 443 is HTTPS. Port 8883 is MQTT over TLS.

---

**Question 7:** An organization's SCADA system uses the Modbus protocol for communication between the master station and field devices. A penetration tester warns that commands can be intercepted and modified in transit. What is the primary reason for this vulnerability?

| Option | Text |
|--------|------|
| A | Modbus uses weak encryption |
| B | Modbus has no built-in authentication or encryption |
| C | Modbus uses outdated TLS versions |
| D | Modbus requires plain-text passwords |

*Correct answer:* **B --- Modbus has no built-in authentication or encryption.** Modbus was designed in 1979 when security was not a concern. It transmits commands and data in plaintext with no authentication, making it trivially vulnerable to interception and modification.

---

**Question 8:** Which type of iOS jailbreak allows the device to reboot normally but requires running an app on the device itself to re-apply the jailbreak?

| Option | Text |
|--------|------|
| A | Tethered |
| B | Untethered |
| C | Semi-tethered |
| D | Semi-untethered |

*Correct answer:* **D --- Semi-untethered.** Semi-untethered jailbreaks allow normal reboots and use an on-device app to re-jailbreak (no computer needed). Semi-tethered requires a computer. Untethered survives reboot automatically. Tethered gets stuck without a computer.
