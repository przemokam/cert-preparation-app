# CEH Exam Preparation: Day 7 --- Cloud Computing, Cryptography, and Final Review

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing --- and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 7, the final day of your 7-day CEH preparation. Today covers two domains: **Cloud Computing** (Domain 8, ~5% exam weight) and **Cryptography** (Domain 9, ~5% exam weight). After completing these domains, the guide concludes with a comprehensive **Final Review** section covering all key ports, all key tools, exam strategies, and common traps. This is your last chance to consolidate everything before exam day.

**Recommended schedule for today (7--9 hours):**
Block 1 (2 h): Read through all Cloud Computing material (Parts 1--4). Work through every exam-style question.
Block 2 (2.5 h): Read through all Cryptography material (Parts 5--11). Work through every exam-style question.
Block 3 (2.5 h): Study the Final Review section (Parts 12--15). Memorize ports, tools, and exam traps.
Block 4 (1 h): Do a final self-assessment. For every concept where you hesitate, go back to the relevant Day's material.

---

## DOMAIN 8: CLOUD COMPUTING (5% Exam Weight)

---

## Part 1: Cloud Service and Deployment Models

### Cloud Service Models

The three classic cloud service models define who manages what. Think of it as a stack: the cloud provider manages from the bottom up, and the customer manages from the top down.

| Model | Full Name | What the Provider Manages | What the Customer Manages | Examples |
|-------|-----------|--------------------------|--------------------------|----------|
| **IaaS** | Infrastructure as a Service | Physical hardware, networking, storage, virtualization (hypervisor). | Operating system, middleware, runtime, applications, data. | AWS EC2, Azure VMs, Google Compute Engine |
| **PaaS** | Platform as a Service | Everything in IaaS + operating system, middleware, runtime. | Applications and data only. | AWS Elastic Beanstalk, Azure App Service, Google App Engine, Heroku |
| **SaaS** | Software as a Service | Everything. The entire stack is managed by the provider. | Nothing (just uses the application). Configuration and user data only. | Microsoft 365, Salesforce, Gmail, Dropbox |
| **FaaS** | Function as a Service (Serverless) | Everything including the application runtime. Executes individual functions on demand. | Individual functions (code snippets). No server management at all. | AWS Lambda, Azure Functions, Google Cloud Functions |

**How to remember the models:**
- **IaaS** = "I manage Almost everything" (you manage OS and up)
- **PaaS** = "Platform manages the Platform" (you only write apps)
- **SaaS** = "Someone else manages All of it" (you just use it)
- **FaaS** = "Functions only" (you write functions, everything else is invisible)

> Exam tip: The exam frequently asks "which model gives the customer the MOST control?" Answer: **IaaS**. "Which gives the LEAST control?" Answer: **SaaS**. FaaS is even less control than SaaS in terms of infrastructure, but the customer writes the code.

### Cloud Deployment Models

| Model | Description | Use Case |
|-------|-------------|----------|
| **Public Cloud** | Infrastructure owned and operated by a third-party provider. Shared among multiple tenants. Resources are provisioned on demand over the internet. | Startups, web applications, development/testing. Cost-effective, highly scalable. |
| **Private Cloud** | Infrastructure dedicated to a single organization. Can be on-premises or hosted by a third party. Not shared with other tenants. | Government, financial services, healthcare --- organizations with strict compliance requirements. |
| **Hybrid Cloud** | Combination of public and private clouds. Workloads can move between them. Connected through encrypted VPNs or dedicated links. | Organizations that want to keep sensitive data on-premises (private) while using public cloud for burst capacity or non-sensitive workloads. |
| **Community Cloud** | Shared infrastructure for a specific community of organizations with shared concerns (security, compliance, jurisdiction). | Government agencies, healthcare consortiums, financial industry groups. |
| **Multi-Cloud** | Using services from multiple public cloud providers simultaneously (e.g., AWS + Azure + GCP). Not the same as hybrid cloud (which mixes public and private). | Avoiding vendor lock-in, best-of-breed services from each provider, disaster recovery across providers. |

> Exam trap: **Hybrid cloud** is NOT the same as **multi-cloud**. Hybrid = public + private. Multi-cloud = multiple public providers. A hybrid cloud could also be multi-cloud if it uses multiple public providers alongside a private cloud.

### NIST Cloud Reference Architecture (SP 500-292)

NIST defines five key roles in cloud computing. The exam tests these roles and their responsibilities.

| Role | Responsibility |
|------|---------------|
| **Cloud Consumer** | The person or organization that uses cloud services. Browses the service catalog, requests services, sets up service contracts, uses the services. |
| **Cloud Provider** | The entity that makes cloud services available. Responsible for service deployment, service orchestration, cloud service management, security, and privacy. |
| **Cloud Carrier** | The intermediary that provides connectivity and transport of cloud services between provider and consumer. Think of it as the "network pipe" --- ISPs, network operators, telecommunications companies. |
| **Cloud Broker** | An entity that manages the use, performance, and delivery of cloud services. Negotiates between consumer and provider. Three types: service intermediation (enhancing a service), service aggregation (combining multiple services), service arbitrage (choosing the best provider). |
| **Cloud Auditor** | An independent entity that assesses cloud services --- security, privacy, performance, and compliance. Conducts audits and produces reports. |

> Worked example (exam-style question --- NIST roles):
>
> *Question:* An organization uses a third-party company that combines services from AWS and Azure into a single unified interface and manages the relationship with both providers. What NIST cloud role does this third-party company fulfill?
>
> | Option | Text |
> |--------|------|
> | A | Cloud Carrier |
> | B | Cloud Broker |
> | C | Cloud Auditor |
> | D | Cloud Provider |
>
> *Correct answer:* **B --- Cloud Broker.** The third party is aggregating services from multiple providers and managing the relationship --- this is the definition of a cloud broker (specifically service aggregation). A carrier provides network connectivity, an auditor assesses security/compliance, and a provider offers the actual cloud services.

---

## Part 2: Cloud Threats and Attacks

### Major Cloud-Specific Threats

| Threat/Attack | Description | Key Details |
|--------------|-------------|-------------|
| **Cloud Hopper** | A sophisticated APT campaign (attributed to APT10/Stone Panda) that targeted **Managed Service Providers (MSPs)**. By compromising MSPs, the attackers gained access to the MSPs' clients --- potentially hundreds of organizations. | The attackers did not attack the cloud directly. They attacked the companies that manage cloud services for others. The lesson: your security is only as strong as your MSP's security. |
| **Cloudborne** | A hardware-level vulnerability in bare-metal cloud servers. When a tenant finishes using a bare-metal server, the server is returned to the pool. If the firmware is not properly sanitized, the next tenant could inherit a server with a **malicious firmware implant** left by the previous tenant. | Affects bare-metal (not virtualized) cloud instances. The implant survives OS reinstallation because it lives in the BMC (Baseboard Management Controller) firmware. |
| **Man-in-the-Cloud (MITC)** | Exploits cloud file synchronization services (Dropbox, OneDrive, Google Drive). The attacker steals the **OAuth synchronization token** from the victim's machine. With this token, the attacker can access the victim's cloud files without needing their password. The token replaces the need for credentials. | No password change will help because the attacker has the OAuth token, not the password. The victim must revoke the token. |
| **Cryptojacking** | Unauthorized use of cloud computing resources to mine cryptocurrency. The attacker compromises cloud instances (or uses stolen credentials) and runs mining software. The victim pays the cloud bill while the attacker earns cryptocurrency. | Often detected through unexpectedly high cloud bills or CPU usage. Serverless functions (Lambda) have also been targeted. |
| **Golden SAML** | The attacker forges SAML authentication tokens by stealing the SAML token-signing certificate. With a forged token, the attacker can authenticate as any user to any service that trusts the SAML identity provider. | Used in the SolarWinds attack. Extremely dangerous because it bypasses MFA and all normal authentication. |

### Other Cloud Risks

| Risk | Description |
|------|-------------|
| **Vendor Lock-in** | Becoming dependent on a specific cloud provider's proprietary tools, APIs, and services. Migrating to another provider becomes extremely difficult and expensive. |
| **Data Residency/Sovereignty** | Cloud data may be stored in different countries, subject to different laws. Some regulations (GDPR) require data to stay within specific geographic boundaries. |
| **Shared Responsibility Model** | The provider secures "of the cloud" (physical infrastructure, hypervisor). The customer secures "in the cloud" (data, access management, application security). Misconfigured customer resources are the number one cause of cloud breaches. |
| **Insecure APIs** | Cloud services are managed through APIs. Poorly secured APIs (weak authentication, no rate limiting, excessive permissions) are a major attack vector. |
| **Account Hijacking** | Attacker gains access to cloud management console credentials (phishing, credential stuffing). With admin access, they can exfiltrate data, deploy resources, or delete everything. |

---

## Part 3: Container Technology --- Docker and Kubernetes

### Docker

Docker is a platform for developing, shipping, and running applications in **containers**. A container is a lightweight, standalone, executable package that includes everything needed to run a piece of software: code, runtime, libraries, and settings.

**Docker Architecture:**

| Component | Role |
|-----------|------|
| **Docker Daemon (dockerd)** | The background service that manages Docker objects (images, containers, networks, volumes). Listens for Docker API requests. Runs on the host machine. |
| **Docker Client (docker)** | The command-line tool that users interact with. Sends commands to the Docker daemon via the Docker API. Can communicate with remote daemons. |
| **Docker Registry** | A repository for Docker images. **Docker Hub** is the default public registry. Organizations can run private registries. Images are pulled from registries and pushed to registries. |
| **Docker Objects** | The building blocks: **Images** (read-only templates for creating containers), **Containers** (running instances of images), **Networks** (communication between containers), **Volumes** (persistent data storage). |

**Docker Security Concerns:**
- The Docker daemon runs as **root** --- if an attacker gains access to the daemon, they have root access to the host.
- **Container escape:** An attacker breaks out of a container and gains access to the host OS. Caused by kernel vulnerabilities, misconfigured privileges, or mounting the host filesystem into the container.
- **Image vulnerabilities:** Base images may contain known vulnerabilities. Always use official images and scan images for CVEs.
- **Exposed Docker API:** If the Docker daemon API is exposed to the network without authentication, anyone can create, delete, and manage containers.

### Kubernetes (K8s)

Kubernetes is an open-source platform for **orchestrating** (deploying, scaling, and managing) containerized applications across multiple hosts.

**Kubernetes Architecture:**

| Component | Role |
|-----------|------|
| **API Server (kube-apiserver)** | The front door to Kubernetes. All communication goes through the API server. Handles RESTful requests, validates them, and updates the cluster state in etcd. |
| **etcd** | A distributed key-value store that holds the **entire cluster state** --- configuration, secrets, service discovery data. If etcd is compromised, the entire cluster is compromised. Must be encrypted and access-controlled. |
| **Scheduler (kube-scheduler)** | Decides **which node** a new pod (container group) should run on. Considers resource requirements, affinity/anti-affinity rules, taints, and tolerations. |
| **Controller Manager (kube-controller-manager)** | Runs control loops that monitor the cluster state and make changes to move toward the desired state. Examples: node controller (detects node failures), replication controller (ensures the right number of pod replicas), endpoint controller. |
| **kubelet** | An agent that runs on each worker node. Ensures containers described in pod specifications are running and healthy. Reports node status to the API server. |
| **kube-proxy** | Network proxy that runs on each node. Maintains network rules that allow pods to communicate with each other and with external traffic. |

**Kubernetes Security Concerns:**
- **Exposed API server:** If the Kubernetes API server is accessible without authentication, attackers can deploy malicious pods, access secrets, or destroy workloads.
- **etcd exposure:** etcd stores secrets in base64 encoding (not encryption by default). If etcd is accessible, all secrets are compromised.
- **Pod security:** Pods running as root, with host network access, or with excessive capabilities can be exploited to escape to the host.
- **RBAC misconfiguration:** Overly permissive RBAC roles can give users or service accounts unintended access to cluster resources.

### 5-Tier Container Architecture

The CEH exam references a 5-tier container architecture model:

| Tier | Layer | Description |
|------|-------|-------------|
| **Tier 1** | Developer Machines | Where developers write code and build container images. Security concern: compromised developer machines can inject malicious code into images. |
| **Tier 2** | Testing and Accreditation | CI/CD pipeline where images are tested, scanned for vulnerabilities, and approved. Security concern: if the pipeline is compromised, malicious images pass through. |
| **Tier 3** | Registries | Where approved images are stored (Docker Hub, private registry). Security concern: image tampering, unauthorized image pushes, supply chain attacks. |
| **Tier 4** | Orchestrators | Kubernetes, Docker Swarm, or other orchestration platforms that deploy and manage containers. Security concern: API exposure, RBAC misconfiguration, secret management. |
| **Tier 5** | Host Machines | The physical or virtual servers that run the containers. Security concern: kernel vulnerabilities, container escapes, host-level misconfigurations. |

---

## Part 4: Cloud Security Controls and Tools

### CASB (Cloud Access Security Broker)

A CASB is a **security policy enforcement point** positioned between cloud users and cloud services. It provides visibility into cloud usage and enforces security policies.

**Four pillars of CASB:**

| Pillar | What It Does |
|--------|-------------|
| **Visibility** | Discovers all cloud services being used (including shadow IT --- unauthorized cloud services employees use without IT approval). |
| **Compliance** | Ensures cloud usage meets regulatory requirements (GDPR, HIPAA, PCI-DSS). Monitors data residency and classification. |
| **Data Security** | Enforces data loss prevention (DLP), encryption, and tokenization. Prevents sensitive data from being uploaded to unauthorized cloud services. |
| **Threat Protection** | Detects and prevents cloud-specific threats: account hijacking, malware in cloud storage, insider threats, anomalous behavior. |

**CASB deployment modes:**
- **Forward Proxy:** Intercepts traffic from users to cloud services. Requires agent or network configuration on endpoints.
- **Reverse Proxy:** Sits in front of the cloud service. No agent needed on endpoints. Works with any device.
- **API-based:** Connects directly to cloud service APIs. No inline traffic inspection. Scans data at rest in cloud storage.

**Popular CASB solutions:** Microsoft Defender for Cloud Apps (formerly MCAS), Netskope, Zscaler, Palo Alto Prisma.

### Zero Trust Network

Zero Trust is a security model based on the principle: **"Never trust, always verify."** No user or device is trusted by default, regardless of whether they are inside or outside the network perimeter.

**Core principles:**
1. **Verify explicitly:** Always authenticate and authorize based on all available data points (user identity, device health, location, service, data classification).
2. **Least privilege access:** Limit user access with just-in-time and just-enough-access (JIT/JEA). Use risk-based adaptive policies.
3. **Assume breach:** Minimize blast radius. Segment access. Verify end-to-end encryption. Use analytics for threat detection.

### Other Cloud Security Concepts

| Concept | Description |
|---------|-------------|
| **Client-Side Encryption** | Data is encrypted on the client before being uploaded to the cloud. The cloud provider never sees the plaintext data. The customer manages the encryption keys. Provides maximum data protection but adds complexity. |
| **Server-Side Encryption** | Data is encrypted by the cloud provider after upload. The provider may manage the keys (SSE-S3 in AWS) or the customer can provide keys (SSE-C). Easier to implement but the provider has access to keys (in provider-managed mode). |
| **Key Management** | Critical for cloud encryption. Options: provider-managed keys (easiest, least control), customer-managed keys in provider's KMS (AWS KMS, Azure Key Vault), or customer-managed keys in external HSM (BYOK --- Bring Your Own Key). |
| **Vendor Lock-in Risk** | Using proprietary cloud services makes migration difficult. Mitigation: use open standards, containerize workloads, abstract cloud-specific APIs, use multi-cloud strategies. |
| **Data Remanence** | Data remnants left on cloud storage after deletion. In multi-tenant environments, improper sanitization could expose data to other tenants. Mitigated by encryption (if keys are destroyed, data is unreadable even if remnants exist). |

### Cloud Security Tools

| Tool | Purpose |
|------|---------|
| **NeuVector** | Full-lifecycle container security platform. Provides runtime scanning, network segmentation, vulnerability management, and compliance for Kubernetes and Docker environments. Open-source (acquired by SUSE). Features include container firewall and deep packet inspection. |
| **Lacework** | Cloud security platform that provides workload protection, configuration compliance, and threat detection across AWS, Azure, and GCP. Uses machine learning to build a baseline of normal cloud behavior and detects anomalies. Also provides container and Kubernetes security. |
| **Prowler** | Open-source AWS security auditing tool. Checks for CIS benchmarks, GDPR, HIPAA, and other compliance frameworks. |
| **ScoutSuite** | Multi-cloud security auditing tool (AWS, Azure, GCP, Oracle). Gathers configuration data and highlights security risks. |

> Worked example (exam-style question --- cloud security):
>
> *Question:* An organization wants to ensure that employees cannot upload sensitive files to unauthorized cloud storage services like personal Dropbox accounts. Which security control should they implement?
>
> | Option | Text |
> |--------|------|
> | A | Web Application Firewall (WAF) |
> | B | Cloud Access Security Broker (CASB) |
> | C | Virtual Private Network (VPN) |
> | D | Intrusion Detection System (IDS) |
>
> *Correct answer:* **B --- CASB.** A CASB provides visibility into cloud usage (detecting shadow IT) and enforces data security policies (DLP) to prevent sensitive data from being uploaded to unauthorized cloud services. A WAF protects web applications, a VPN encrypts traffic but does not control cloud usage, and an IDS detects intrusions but does not enforce cloud policies.

---

## DOMAIN 9: CRYPTOGRAPHY (5% Exam Weight)

---

## Part 5: Symmetric Encryption Algorithms

Symmetric encryption uses **the same key** for both encryption and decryption. Both parties must share the secret key securely before communicating. Symmetric algorithms are fast and efficient, making them suitable for encrypting large amounts of data.

### Key Symmetric Algorithms

| Algorithm | Key Size | Block Size | Rounds | Key Facts |
|-----------|----------|------------|--------|-----------|
| **DES** (Data Encryption Standard) | 56-bit | 64-bit | 16 | Adopted by NIST in 1977. Uses a Feistel cipher structure. Considered **insecure** today due to the short 56-bit key (brute-forced in 1999 in 22 hours). |
| **3DES** (Triple DES) | 168-bit effective (3 x 56-bit keys) | 64-bit | 48 (16 x 3) | Applies DES three times with three different keys: Encrypt-Decrypt-Encrypt (EDE). Slower than AES. Being phased out. NIST deprecated 3DES after 2023. |
| **AES** (Advanced Encryption Standard) | 128, 192, or 256-bit | 128-bit | 10/12/14 | The current standard. Replaced DES. Based on the Rijndael algorithm. Uses substitution-permutation network (NOT Feistel). 10 rounds for 128-bit key, 12 for 192-bit, 14 for 256-bit. Used in WPA2 (AES-CCMP), TLS, disk encryption. |
| **Blowfish** | Variable: 32 to 448-bit | 64-bit | 16 | Designed by Bruce Schneier. Fast and free (unpatented). Feistel cipher. 64-bit block size is a limitation (vulnerable to birthday attacks on large data). |
| **Twofish** | Up to 256-bit key | 128-bit | 16 | Successor to Blowfish. Also by Bruce Schneier. Was a finalist in the AES competition (lost to Rijndael). Feistel-like structure. 128-bit block size. Free and unpatented. |
| **CAST-128** (CAST5) | 40 to 128-bit | 64-bit | 12 or 16 | Feistel cipher. Uses 12 rounds for keys up to 80 bits, 16 rounds for longer keys. Used in PGP and GPG. Named after its creators (Carlisle Adams, Stafford Tavares). |
| **RC5** | Variable: 0 to 2040-bit | 32, 64, or 128-bit | 0 to 255 | Designed by Ron Rivest (the "R" in RSA). Highly flexible: variable block size, key size, and number of rounds. Simple and fast. |
| **IDEA** (International Data Encryption Algorithm) | 128-bit | 64-bit | 8.5 | Used in early versions of PGP. Patented (patent expired 2012). Uses a mix of operations from different algebraic groups. |
| **Serpent** | 128, 192, or 256-bit | 128-bit | 32 | Was an AES finalist. More conservative design than Rijndael (32 rounds vs. 10-14). Considered very secure but slower than AES. Substitution-permutation network. |

**Feistel Cipher vs. Substitution-Permutation Network (SPN):**
- **Feistel cipher:** Splits the block into two halves. Each round applies a function to one half and XORs the result with the other half. Then the halves are swapped. DES, 3DES, Blowfish, Twofish, and CAST-128 all use Feistel. The advantage: encryption and decryption use the same structure (just reverse the round keys).
- **SPN (Substitution-Permutation Network):** Applies substitution (S-boxes) and permutation (P-boxes) to the entire block in each round. AES and Serpent use SPN. Generally considered more parallelizable and efficient in hardware.

> Exam trap: DES has a 64-bit key, but 8 bits are used for parity checking, making the **effective key length 56 bits**. If the exam says "DES key length," the answer is 56-bit (not 64-bit).

> Exam trap: 3DES uses three 56-bit keys (168 bits total), but due to meet-in-the-middle attacks, the effective security is closer to 112 bits. However, for exam purposes, the answer is **168-bit** (3 x 56 = 168).

---

## Part 6: Asymmetric Encryption Algorithms

Asymmetric encryption uses **two mathematically related keys**: a public key (shared openly) and a private key (kept secret). Data encrypted with the public key can only be decrypted with the corresponding private key, and vice versa.

**Asymmetric encryption is slow** compared to symmetric encryption. In practice, asymmetric encryption is used to:
1. **Exchange symmetric keys** securely (key exchange).
2. **Create digital signatures** (authentication and non-repudiation).
3. **Encrypt small amounts of data** (not suitable for bulk data).

### Key Asymmetric Algorithms

| Algorithm | Key Size | Based On | Use Case |
|-----------|----------|----------|----------|
| **RSA** (Rivest-Shamir-Adleman) | 1024, 2048, 4096-bit (2048+ recommended) | Factoring large prime numbers | Encryption, digital signatures, key exchange. The most widely used asymmetric algorithm. Slower with larger keys but more secure. 2048-bit minimum for modern security. |
| **Diffie-Hellman (DH)** | Variable (2048+ recommended) | Discrete logarithm problem | **Key exchange only** --- NOT for encryption or signing. Allows two parties to establish a shared secret over an insecure channel. Used in TLS, IPsec, VPNs. Vulnerable to man-in-the-middle attacks without authentication. |
| **ECC** (Elliptic Curve Cryptography) | 256-bit ECC = 3072-bit RSA equivalent | Elliptic curve discrete logarithm problem | Same capabilities as RSA (encryption, signing, key exchange) but with **much smaller key sizes** for equivalent security. Used in mobile devices, IoT, and modern TLS. ECDH = key exchange, ECDSA = digital signature. |
| **DSA** (Digital Signature Algorithm) | 1024 to 3072-bit | Discrete logarithm problem | **Digital signatures only** --- cannot be used for encryption. Part of the Digital Signature Standard (DSS). Being replaced by ECDSA. |
| **ElGamal** | Variable | Discrete logarithm problem | Encryption and digital signatures. Used in PGP. Produces ciphertext that is twice the size of the plaintext. |

> Exam critical: **Diffie-Hellman is for key exchange ONLY. It does NOT encrypt data and does NOT create digital signatures.** If a question asks about encrypting data, DH is never the answer. If a question asks about secure key exchange, DH (or ECDH) is usually the answer.

> Exam critical: **DSA is for digital signatures ONLY. It does NOT encrypt data.** RSA can do both (encrypt and sign). DSA can only sign.

### How Asymmetric Encryption Works

**For confidentiality (encryption):**
- Encrypt with the **recipient's public key**.
- Decrypt with the **recipient's private key**.
- Only the recipient can decrypt because only they have the private key.

**For digital signatures (authentication/non-repudiation):**
- Sign (encrypt the hash) with the **sender's private key**.
- Verify with the **sender's public key**.
- Anyone can verify, but only the sender could have created the signature.

---

## Part 7: Hash Functions

A hash function takes input of any size and produces a **fixed-size output** (hash, digest, fingerprint). Hash functions are **one-way** --- you cannot reverse the hash to recover the original input.

**Properties of a good cryptographic hash function:**
1. **Deterministic:** Same input always produces the same hash.
2. **Fixed output length:** Regardless of input size.
3. **Pre-image resistance:** Given a hash, it is computationally infeasible to find the original input.
4. **Second pre-image resistance:** Given an input, it is infeasible to find a different input that produces the same hash.
5. **Collision resistance:** It is infeasible to find any two different inputs that produce the same hash.
6. **Avalanche effect:** A small change in input produces a drastically different hash.

### Key Hash Algorithms

| Algorithm | Output Size | Status | Key Facts |
|-----------|-------------|--------|-----------|
| **MD5** (Message Digest 5) | 128-bit (32 hex characters) | **Broken** --- collision attacks demonstrated. Do NOT use for security. | Designed by Ron Rivest. Fast but insecure. Still used for non-security checksums (file integrity verification where attacks are not a concern). |
| **SHA-1** (Secure Hash Algorithm 1) | 160-bit (40 hex characters) | **Deprecated** --- collision demonstrated by Google in 2017 (SHAttered attack). | Designed by NSA. Was widely used in SSL/TLS certificates and Git. Being replaced by SHA-256. |
| **SHA-256** | 256-bit (64 hex characters) | **Secure** --- current standard. | Part of the SHA-2 family. Used in Bitcoin, TLS 1.2+, code signing. Recommended minimum for new implementations. |
| **SHA-384** | 384-bit | **Secure** | Part of the SHA-2 family. Truncated version of SHA-512. Used in some government applications. |
| **SHA-512** | 512-bit (128 hex characters) | **Secure** | Part of the SHA-2 family. Larger output provides higher security margin. Faster than SHA-256 on 64-bit processors. |
| **HMAC** (Hash-based Message Authentication Code) | Depends on underlying hash | **Secure** (when used with a secure hash) | NOT a hash algorithm itself. Combines a hash function with a **secret key** to provide both integrity AND authentication. HMAC-SHA256 = SHA-256 + secret key. Used in API authentication, JWT tokens, IPsec. |

> Exam trap: **HMAC is not a hash function.** It is a **MAC** (Message Authentication Code) that uses a hash function internally. HMAC requires a secret key. A regular hash does not use a key. If asked "which provides both integrity AND authentication?" the answer is HMAC (not SHA-256 alone, which provides integrity only).

> Worked example (exam-style question --- hashing):
>
> *Question:* A security engineer needs to verify that a file has not been modified during transfer AND confirm that it came from the expected sender. Which should they use?
>
> | Option | Text |
> |--------|------|
> | A | MD5 hash |
> | B | SHA-256 hash |
> | C | HMAC-SHA256 |
> | D | CRC-32 checksum |
>
> *Correct answer:* **C --- HMAC-SHA256.** The question requires both integrity (not modified) AND authentication (from the expected sender). A regular hash (MD5, SHA-256) provides integrity but NOT authentication --- anyone can compute a hash. HMAC uses a shared secret key, so only someone with the key can produce a valid HMAC --- this proves the sender's identity. CRC-32 is not cryptographic.

---

## Part 8: PKI, Digital Certificates, and Digital Signatures

### Public Key Infrastructure (PKI)

PKI is the framework that manages digital certificates and public-key encryption. It provides the trust infrastructure for secure communication on the internet.

**PKI Components:**

| Component | Role |
|-----------|------|
| **Certificate Authority (CA)** | The trusted entity that issues and signs digital certificates. The CA verifies the identity of the certificate requestor before issuing the certificate. Examples: DigiCert, Let's Encrypt, Comodo. |
| **Registration Authority (RA)** | Handles the verification of certificate requests on behalf of the CA. The RA validates identities but does not issue certificates --- it forwards approved requests to the CA. |
| **Digital Certificate (X.509)** | An electronic document that binds a public key to an identity (person, organization, or server). Contains: subject name, public key, issuer (CA), validity period, serial number, and the CA's digital signature. |
| **Certificate Revocation List (CRL)** | A list maintained by the CA of certificates that have been revoked before their expiration date (due to key compromise, CA compromise, or change of affiliation). |
| **OCSP (Online Certificate Status Protocol)** | A real-time alternative to CRLs. A client queries an OCSP responder to check if a specific certificate has been revoked. Faster than downloading an entire CRL. |

### Digital Signatures --- How They Work

A digital signature provides three security properties:
1. **Authentication:** Proves the signer's identity.
2. **Integrity:** Proves the message has not been modified.
3. **Non-repudiation:** The signer cannot deny signing the message.

**The signing process (exam-critical):**
1. The sender computes a **hash** of the message (e.g., SHA-256).
2. The sender encrypts the hash using their **private key**. This encrypted hash IS the digital signature.
3. The sender sends the message + the digital signature to the recipient.

**The verification process:**
1. The recipient computes a hash of the received message using the same hash algorithm.
2. The recipient decrypts the digital signature using the **sender's public key**, recovering the original hash.
3. The recipient compares the two hashes. If they match, the signature is valid (message is authentic and unmodified).

> Exam critical: **Private key signs. Public key verifies.** This is the opposite of encryption (public key encrypts, private key decrypts). This distinction is the most frequently tested concept in CEH cryptography questions.

### Web of Trust vs. PKI

| Model | How Trust Is Established |
|-------|------------------------|
| **PKI (Certificate Authority model)** | Trust flows from a central authority (CA). The CA is trusted by default (its root certificate is pre-installed in browsers/OS). Any certificate signed by the CA is trusted. Hierarchical trust model. |
| **Web of Trust** | Used by PGP/GPG. Trust is decentralized. Users sign each other's keys to vouch for their authenticity. No central authority. Trust is established by chains of individual endorsements. If Alice trusts Bob, and Bob signs Carol's key, Alice may trust Carol. |

---

## Part 9: Email and Disk Encryption

### Email Encryption

| Technology | Description | Key Facts |
|-----------|-------------|-----------|
| **PGP** (Pretty Good Privacy) | Provides email encryption, digital signatures, and file encryption. Uses a hybrid approach: asymmetric encryption (RSA or ECC) for key exchange, symmetric encryption (AES, CAST-128, 3DES) for message encryption. Uses the **Web of Trust** model. | Commercial product (now owned by Symantec/Broadcom). Original creator: Phil Zimmermann. |
| **GPG** (GNU Privacy Guard) | Free, open-source implementation of the OpenPGP standard. Functionally equivalent to PGP. | Used on Linux systems. Compatible with PGP. |
| **S/MIME** (Secure/Multipurpose Internet Mail Extensions) | Email encryption standard that uses **X.509 certificates** issued by a CA (PKI model). Provides encryption and digital signatures for email. Built into most email clients (Outlook, Apple Mail). | Uses the PKI/CA trust model (NOT Web of Trust). Requires a certificate from a CA. |
| **STARTTLS** | An extension that upgrades an existing plaintext email connection (SMTP, IMAP, POP3) to an encrypted TLS connection. NOT a separate protocol --- it adds encryption to existing protocols. | **Opportunistic encryption:** if the server does not support STARTTLS, the connection falls back to plaintext. This makes it vulnerable to downgrade attacks. |

> Exam trap: **PGP uses Web of Trust. S/MIME uses PKI (Certificate Authority).** This is a frequently tested distinction. If the question mentions certificates issued by a CA, the answer is S/MIME. If it mentions users signing each other's keys, the answer is PGP.

### Disk Encryption

| Technology | Description | Key Facts |
|-----------|-------------|-----------|
| **BitLocker** | Microsoft's full-disk encryption for Windows. Encrypts the entire volume, including the OS. | Uses **AES** encryption (128-bit or 256-bit). Stores the encryption key in the **TPM (Trusted Platform Module)** chip on the motherboard. Can also use a USB startup key or PIN. Recovery key should be stored in Active Directory or Azure AD. |
| **VeraCrypt** | Open-source disk encryption software. Successor to TrueCrypt (which was discontinued in 2014). | Supports full-disk encryption, partition encryption, and encrypted containers (virtual encrypted disks stored as files). Supports AES, Twofish, Serpent, and cascaded combinations. Supports **hidden volumes** --- a plausible deniability feature where a hidden volume exists inside a regular encrypted volume. |
| **FileVault** | Apple's full-disk encryption for macOS. | Uses AES-XTS 128-bit. Recovery key can be stored in iCloud or kept locally. |

> Exam tip: If a question mentions TPM, the answer is almost always **BitLocker**. TPM is the hardware chip that securely stores BitLocker's encryption key.

---

## Part 10: Cryptanalysis --- Attack Types

Cryptanalysis is the study of breaking cryptographic systems. The exam tests your knowledge of various attack types against encryption.

| Attack | Description | Key Details |
|--------|-------------|-------------|
| **Brute Force** | Trying every possible key until the correct one is found. | Always works given enough time. Defeated by using long keys (AES-256 = 2^256 possible keys, computationally infeasible). |
| **Birthday Attack** | Exploits the mathematics of the birthday paradox to find **hash collisions**. In a group of 23 people, there is a 50% chance two share a birthday. Similarly, finding two messages with the same hash requires far fewer attempts than expected. | For an n-bit hash, a collision can be found in approximately 2^(n/2) attempts. MD5 (128-bit) can be attacked in 2^64 attempts. This is why longer hashes (SHA-256+) are preferred. |
| **Meet-in-the-Middle** | Attacks double encryption schemes. Instead of brute-forcing 2^(k1+k2) combinations, the attacker encrypts from one side and decrypts from the other, meeting in the middle. | This is why **2DES** was never adopted --- a meet-in-the-middle attack reduces it to roughly the same security as single DES. 3DES was created to resist this attack. |
| **Collision Attack** | Finding any two different inputs that produce the same hash output. More general than a pre-image attack. | MD5 and SHA-1 are vulnerable. SHA-256 is not (as of current knowledge). |
| **Rubber-Hose Attack** | Coercing or torturing a person to reveal their encryption key or password. Named metaphorically (beating someone with a rubber hose). | Not a technical attack. The countermeasure is plausible deniability (VeraCrypt hidden volumes) or legal protections (5th Amendment in the US, depending on jurisdiction). |
| **DROWN** (Decrypting RSA with Obsolete and Weakened eNcryption) | Exploits servers that support SSLv2. Even if the server uses TLS for normal connections, supporting SSLv2 on the same certificate allows an attacker to decrypt TLS connections. | Mitigation: disable SSLv2 on all servers. Affected ~33% of HTTPS servers when discovered in 2016. |
| **Side-Channel Attack** | Extracts cryptographic keys by analyzing physical implementation characteristics: timing (how long operations take), power consumption, electromagnetic emissions, cache access patterns. | Not an attack on the algorithm itself, but on how it is implemented in hardware/software. Protected by constant-time implementations, power analysis countermeasures, and noise injection. |
| **Known-Plaintext Attack** | The attacker has access to both the plaintext and corresponding ciphertext. Uses this to deduce the key. | WEP is vulnerable to this attack. Modern algorithms (AES) are designed to resist it. |
| **Chosen-Plaintext Attack** | The attacker can choose plaintext messages and obtain their ciphertext. Analyzes the relationship to determine the key. | Stronger attack model than known-plaintext. Modern algorithms must resist this. |
| **Ciphertext-Only Attack** | The attacker only has ciphertext. Must deduce the plaintext or key from ciphertext alone. | The hardest attack scenario for the attacker. Frequency analysis against simple ciphers. Modern algorithms are designed to produce ciphertext indistinguishable from random data. |
| **Downgrade Attack** | Forces a system to use a weaker cryptographic protocol or cipher suite. | Example: POODLE attack forces TLS to fall back to SSLv3. Mitigation: disable support for weak protocols. |

> Worked example (exam-style question --- cryptanalysis):
>
> *Question:* An attacker discovers that a web server supports both TLS 1.2 and SSLv2 using the same RSA certificate. The attacker uses the SSLv2 vulnerability to decrypt TLS 1.2 connections. What type of attack is this?
>
> | Option | Text |
> |--------|------|
> | A | Birthday attack |
> | B | DROWN attack |
> | C | Meet-in-the-middle attack |
> | D | Brute force attack |
>
> *Correct answer:* **B --- DROWN attack.** DROWN specifically exploits SSLv2 support to decrypt TLS connections when the same RSA key is used. The scenario matches exactly: SSLv2 + TLS on the same certificate.

---

## Part 11: Key Concepts in Cryptography

### Key Stretching

Key stretching transforms a weak password into a stronger key by applying a computationally expensive function. This makes brute-force attacks much slower.

**Key stretching algorithms:**
- **PBKDF2** (Password-Based Key Derivation Function 2): Applies HMAC-SHA1 (or another hash) thousands or millions of times iteratively. Used in WPA2 (8192 iterations), Wi-Fi, and many applications.
- **bcrypt**: Based on the Blowfish cipher. Includes a configurable cost factor (number of rounds). Widely used for password hashing.
- **scrypt**: Designed to be memory-hard (requires large amounts of RAM), making it resistant to GPU and ASIC attacks. Used in some cryptocurrency systems.
- **Argon2**: Winner of the Password Hashing Competition (2015). Considered the current best practice for password hashing. Configurable in time, memory, and parallelism.

### Key Escrow

Key escrow is a system where a copy of the encryption key is held by a **trusted third party** (escrow agent). This allows authorized parties (law enforcement with a warrant, or organization administrators) to access encrypted data if the key holder is unavailable or uncooperative.

**Controversy:** Key escrow weakens security because it introduces additional points of compromise. If the escrow agent is breached, all escrowed keys are exposed. Many cryptographers oppose government key escrow mandates.

### Key Derivation Function (KDF)

A KDF derives one or more cryptographic keys from a source of key material (a password, a shared secret, or a master key).

**Purpose:** Converts a password (which has low entropy) into a cryptographic key (which needs high entropy and a specific length). Key stretching algorithms (PBKDF2, bcrypt, scrypt, Argon2) are types of KDFs.

### Password Salting

A salt is a **random value** added to a password before hashing. Each user gets a unique salt.

**Why it matters:**
- Without salt: Two users with the same password produce the same hash. An attacker can use **rainbow tables** (precomputed hash lookup tables) to instantly look up passwords.
- With salt: Even identical passwords produce different hashes because each has a different salt. Rainbow tables become useless because the attacker would need a separate rainbow table for every possible salt value.

**Salt storage:** The salt is stored in plaintext alongside the hash (it does not need to be secret --- its purpose is to make precomputation infeasible).

### Non-Repudiation

Non-repudiation ensures that a party cannot deny having performed an action (sending a message, signing a document, making a transaction).

**How it is achieved:**
- **Digital signatures** provide non-repudiation. The sender signs with their private key. Since only the sender has their private key, they cannot deny creating the signature.
- **Symmetric encryption does NOT provide non-repudiation** because both parties share the same key --- either party could have created the message.

> Exam critical: "Which provides non-repudiation?" Answer: **Digital signatures** (asymmetric cryptography). NOT symmetric encryption, NOT HMAC (both parties share the key), NOT hashing alone (no authentication).

---

## FINAL REVIEW

---

## Part 12: Quick Reference --- All Key Ports and Services

This is a comprehensive list of ports that appear on the CEH exam. Memorize all of them.

### Standard Network Ports

| Port | Protocol | Service | Notes |
|------|----------|---------|-------|
| 20 | TCP | FTP Data | Active mode data transfer |
| 21 | TCP | FTP Control | FTP command channel |
| 22 | TCP | SSH / SCP / SFTP | Secure remote access, file transfer |
| 23 | TCP | Telnet | Unencrypted remote access. Used by Mirai for IoT scanning. |
| 25 | TCP | SMTP | Email sending (unencrypted) |
| 53 | TCP/UDP | DNS | Domain name resolution. UDP for queries, TCP for zone transfers. |
| 67 | UDP | DHCP Server | Server listens on 67 |
| 68 | UDP | DHCP Client | Client listens on 68 |
| 69 | UDP | TFTP | Trivial File Transfer Protocol. No authentication. |
| 80 | TCP | HTTP | Unencrypted web traffic |
| 88 | TCP/UDP | Kerberos | Authentication protocol (Active Directory) |
| 110 | TCP | POP3 | Email retrieval (unencrypted) |
| 111 | TCP/UDP | RPCBind / Portmapper | Sun RPC. Used in NFS attacks. |
| 119 | TCP | NNTP | Usenet / Network News |
| 123 | UDP | NTP | Time synchronization. Abused for NTP amplification DDoS. |
| 135 | TCP | MS-RPC / DCOM | Windows RPC endpoint mapper |
| 137 | UDP | NetBIOS Name Service | Windows name resolution |
| 138 | UDP | NetBIOS Datagram | Windows datagram distribution |
| 139 | TCP | NetBIOS Session | Windows file/printer sharing (over NetBIOS) |
| 143 | TCP | IMAP | Email retrieval (unencrypted) |
| 161 | UDP | SNMP | Network monitoring (queries). Community strings. |
| 162 | UDP | SNMP Trap | Network monitoring (alerts from agents) |
| 179 | TCP | BGP | Border Gateway Protocol. Internet routing. |
| 389 | TCP/UDP | LDAP | Directory services (Active Directory) |
| 443 | TCP | HTTPS | Encrypted web traffic (TLS/SSL) |
| 445 | TCP | SMB (Direct) | Windows file sharing over TCP. Target of EternalBlue/WannaCry. |
| 465 | TCP | SMTPS | SMTP over SSL (deprecated, but still on exam) |
| 500 | UDP | IKE / ISAKMP | IPsec key exchange |
| 502 | TCP | Modbus | ICS/SCADA protocol (no encryption) |
| 514 | UDP | Syslog | Log forwarding |
| 520 | UDP | RIP | Routing Information Protocol |
| 587 | TCP | SMTP (Submission) | Email submission with STARTTLS |
| 636 | TCP | LDAPS | LDAP over SSL/TLS |
| 993 | TCP | IMAPS | IMAP over SSL/TLS |
| 995 | TCP | POP3S | POP3 over SSL/TLS |
| 1433 | TCP | MS-SQL | Microsoft SQL Server |
| 1434 | UDP | MS-SQL Browser | SQL Server discovery |
| 1521 | TCP | Oracle DB | Oracle database listener |
| 1723 | TCP | PPTP | Point-to-Point Tunneling Protocol (VPN) |
| 1883 | TCP | MQTT | IoT messaging (unencrypted) |
| 2049 | TCP/UDP | NFS | Network File System |
| 3268 | TCP | Global Catalog (LDAP) | Active Directory Global Catalog |
| 3306 | TCP | MySQL | MySQL database |
| 3389 | TCP | RDP | Remote Desktop Protocol |
| 4500 | UDP | IPsec NAT-T | IPsec NAT Traversal |
| 5060 | TCP/UDP | SIP | Session Initiation Protocol (VoIP signaling) |
| 5061 | TCP | SIP-TLS | SIP over TLS |
| 5432 | TCP | PostgreSQL | PostgreSQL database |
| 5900 | TCP | VNC | Virtual Network Computing (remote access) |
| 6379 | TCP | Redis | Redis database/cache |
| 8080 | TCP | HTTP Proxy / Alt HTTP | Alternative HTTP port |
| 8443 | TCP | HTTPS Alt | Alternative HTTPS port |
| 8883 | TCP | MQTT over TLS | IoT messaging (encrypted) |
| 20000 | TCP/UDP | DNP3 | SCADA communication protocol |
| 27017 | TCP | MongoDB | MongoDB database |
| 47808 | UDP | BACnet | Building automation protocol |
| 48101 | TCP | Mirai C2 | Mirai botnet command and control |

### Ports to Know by Category

**Email:** 25 (SMTP), 110 (POP3), 143 (IMAP), 465 (SMTPS), 587 (Submission), 993 (IMAPS), 995 (POP3S)

**Database:** 1433 (MS-SQL), 1521 (Oracle), 3306 (MySQL), 5432 (PostgreSQL), 6379 (Redis), 27017 (MongoDB)

**Remote Access:** 22 (SSH), 23 (Telnet), 3389 (RDP), 5900 (VNC)

**File Transfer:** 20/21 (FTP), 22 (SFTP/SCP), 69 (TFTP), 139/445 (SMB), 2049 (NFS)

**IoT/ICS:** 502 (Modbus), 1883/8883 (MQTT), 20000 (DNP3), 47808 (BACnet), 48101 (Mirai C2)

---

## Part 13: Quick Reference --- All Key Tools by Category

### Reconnaissance and Footprinting

| Tool | Purpose |
|------|---------|
| **Nmap** | Network scanning, port scanning, OS detection, service enumeration, NSE scripts |
| **Shodan** | Search engine for internet-connected devices (IoT, SCADA, webcams) |
| **Censys** | Internet-wide scanning and device discovery |
| **theHarvester** | Email, subdomain, and name harvesting from public sources |
| **Maltego** | OSINT and link analysis. Visual relationship mapping. |
| **Recon-ng** | Web reconnaissance framework. Modular, scriptable. |
| **FOCA** | Metadata extraction from documents (PDF, DOCX, XLSX) |
| **Metagoofil** | Metadata extraction from public documents via Google |
| **Sublist3r** | Subdomain enumeration using search engines |
| **DNSRecon** | DNS enumeration, zone transfer testing |
| **dig / nslookup** | DNS query tools |
| **Whois** | Domain registration information lookup |

### Scanning and Enumeration

| Tool | Purpose |
|------|---------|
| **Nmap** | Port scanning, host discovery, service detection |
| **Hping3** | Custom packet crafting, firewall testing, OS fingerprinting |
| **Masscan** | Ultra-fast port scanner (can scan entire internet) |
| **Nessus** | Vulnerability scanner (commercial, by Tenable) |
| **OpenVAS** | Open-source vulnerability scanner |
| **Nikto** | Web server vulnerability scanner |
| **enum4linux** | SMB/NetBIOS enumeration on Windows/Samba |
| **SNMPWalk** | SNMP enumeration (walk MIB trees) |
| **NBTStat** | Windows NetBIOS information gathering |
| **ldapsearch** | LDAP directory enumeration |
| **RPCScan** | RPC service enumeration |

### Exploitation and System Hacking

| Tool | Purpose |
|------|---------|
| **Metasploit Framework** | Exploitation framework. Modules for exploits, payloads, auxiliaries, post-exploitation. |
| **Meterpreter** | Advanced Metasploit payload. In-memory, encrypted communication. |
| **BeEF** | Browser Exploitation Framework. XSS exploitation and browser control. |
| **Social Engineering Toolkit (SET)** | Phishing campaigns, credential harvesting, payload delivery |
| **Responder** | LLMNR/NBT-NS/MDNS poisoning. Captures NetNTLM hashes on Windows networks. |
| **Mimikatz** | Windows credential extraction. Dumps password hashes, Kerberos tickets from memory. |
| **Hashcat** | GPU-accelerated password cracking. Supports hundreds of hash types. |
| **John the Ripper** | Password cracking (CPU-based). Dictionary, brute-force, rule-based attacks. |
| **Hydra** | Online password brute-forcing against network services (SSH, FTP, HTTP, RDP, etc.) |
| **CeWL** | Custom wordlist generator from a target website |
| **RainbowCrack** | Rainbow table-based password cracking |
| **L0phtCrack** | Windows password auditing tool |
| **pwdump / fgdump** | Windows SAM database hash extraction |

### Sniffing and MitM

| Tool | Purpose |
|------|---------|
| **Wireshark** | Packet capture and analysis (GUI). The gold standard for packet analysis. |
| **tcpdump** | Command-line packet capture |
| **Ettercap** | MitM attacks: ARP poisoning, DNS spoofing, content filtering |
| **Bettercap** | Modern network attack toolkit. Successor to Ettercap. Wi-Fi, BLE, HID attacks. |
| **arpspoof** | ARP spoofing/poisoning |
| **Cain & Abel** | Password recovery, ARP poisoning, sniffing (Windows, legacy) |
| **macof** | MAC address flooding (switch table overflow) |
| **Yersinia** | Layer 2 attacks: STP, CDP, DTP, DHCP, HSRP, VTP |

### Web Application Hacking

| Tool | Purpose |
|------|---------|
| **Burp Suite** | Web application security testing platform. Proxy, scanner, repeater, intruder. |
| **OWASP ZAP** | Open-source web application security scanner |
| **SQLmap** | Automated SQL injection detection and exploitation |
| **Nikto** | Web server vulnerability scanner |
| **DirBuster / Gobuster** | Directory and file brute-forcing on web servers |
| **WPScan** | WordPress vulnerability scanner |
| **w3af** | Web application attack and audit framework |
| **XSSer** | Automated XSS vulnerability detection |
| **Commix** | OS command injection exploitation |

### Wireless Hacking

| Tool | Purpose |
|------|---------|
| **Aircrack-ng** (suite) | WEP/WPA cracking, packet capture, injection, monitor mode |
| **Kismet** | Passive wireless network detector, sniffer, and IDS |
| **Wireshark + AirPcap** | Wireless packet capture on Windows |
| **Reaver** | WPS PIN brute-force |
| **Wash** | WPS-enabled AP detection |
| **WiFi Pineapple** | Hardware for evil twin, MitM, rogue AP attacks |
| **Wifite** | Automated wireless attack tool |
| **Fern WiFi Cracker** | GUI wireless security auditing |
| **inSSIDer** | Wireless network discovery and analysis |
| **NetStumbler** | Legacy wireless network discovery (active) |

### Mobile Hacking

| Tool | Purpose |
|------|---------|
| **zANTI** | Mobile penetration testing toolkit (Android) |
| **DroidSheep** | Android session hijacking |
| **FaceNiff** | Android session sniffing |
| **AndroRAT** | Android Remote Administration Tool |
| **Drozer** | Android security assessment framework |
| **Frida** | Dynamic instrumentation for mobile app analysis |
| **apktool / JADX** | Android APK decompilation |
| **Trident/Pegasus** | iOS spyware (NSO Group) |

### IoT and OT

| Tool | Purpose |
|------|---------|
| **Shodan** | IoT device search engine |
| **Censys** | Internet-wide device scanning |
| **IoTSeeker** | Default credential scanning for IoT |
| **FCC ID Search** | Hardware research (internal photos, specs) |
| **Flowmon** | OT/ICS network monitoring |
| **HackRF One** | Software Defined Radio for wireless analysis |
| **Attify Badge** | IoT hardware interface tool (UART, SPI, JTAG) |

### Cloud Security

| Tool | Purpose |
|------|---------|
| **NeuVector** | Container security (Kubernetes/Docker) |
| **Lacework** | Cloud security and compliance (AWS/Azure/GCP) |
| **Prowler** | AWS security auditing |
| **ScoutSuite** | Multi-cloud security auditing |

### Evasion and Anti-Forensics

| Tool | Purpose |
|------|---------|
| **Veil-Evasion** | Antivirus evasion payload generation |
| **Shellter** | Dynamic PE infector (AV evasion) |
| **msfvenom** | Metasploit payload and encoder generation |
| **ProxyChains** | Routes traffic through proxy chains for anonymity |
| **Tor** | Anonymous communication network |
| **ClearLogs / MRU Blaster** | Log clearing and anti-forensics |
| **SteghideX / OpenStego** | Steganography (hiding data in images) |
| **SNOW** | Whitespace steganography (hiding data in spaces/tabs) |
| **Coagula / DeepSound** | Audio steganography |

### Denial of Service

| Tool | Purpose |
|------|---------|
| **LOIC** (Low Orbit Ion Cannon) | Layer 7 DDoS tool (floods HTTP/TCP/UDP) |
| **HOIC** (High Orbit Ion Cannon) | Improved LOIC with boosters |
| **Slowloris** | Slow HTTP DoS (holds connections open) |
| **R-U-Dead-Yet (RUDY)** | Slow HTTP POST DoS |
| **hping3** | Custom packet flooding (SYN flood, ICMP flood) |

---

## Part 14: CEH Exam Tips and Strategies

### Exam Format

| Detail | Value |
|--------|-------|
| Number of questions | 125 |
| Duration | 4 hours |
| Passing score | 60--85% (varies by exam form, typically ~70%) |
| Question types | Multiple choice (single and multiple answer) |
| Exam code | 312-50v12 (current version as of 2024) |

### General Strategies

1. **Read the entire question carefully.** EC-Council questions are often wordy and include irrelevant details designed to distract. Identify what is actually being asked before looking at answers.

2. **Look for the MOST appropriate answer.** Multiple answers may seem correct, but only one is the BEST or MOST appropriate. EC-Council loves "best answer" questions.

3. **Eliminate obviously wrong answers first.** Narrow down to two options, then carefully analyze which one better fits the scenario.

4. **Pay attention to qualifiers.** Words like "FIRST," "BEST," "MOST," "LEAST," "ALWAYS," and "NEVER" change the answer significantly. If the question asks "what should you do FIRST?" the answer is always the initial step, not the final goal.

5. **When in doubt, think like an ethical hacker, not a system administrator.** The CEH exam expects you to think offensively --- what would an attacker do? But also know when to think defensively (countermeasure questions).

6. **Manage your time.** 125 questions in 240 minutes = ~1.9 minutes per question. Flag difficult questions and return to them later. Do not spend 5 minutes on one question.

7. **Tool-specific questions:** If a question describes a specific behavior, match it to the tool that performs exactly that function. EC-Council expects you to know what each tool does.

8. **Port questions:** Memorize the port table. Port-related questions are essentially free points if you know the ports.

9. **Attack methodology:** Remember the CEH hacking phases: Reconnaissance > Scanning > Gaining Access > Maintaining Access > Clearing Tracks. If asked "what phase?" match the activity to the phase.

10. **Legal/ethical questions:** Always choose the answer that involves getting proper authorization, following rules of engagement, and staying within scope.

### How to Handle "What Would the Attacker Do?" Questions

The exam frequently presents a scenario and asks what the attacker is doing or would do next. Use this decision framework:

1. **Has the attacker collected information yet?** If no --- the answer involves reconnaissance or scanning.
2. **Does the attacker have access?** If no --- the answer involves an exploitation technique.
3. **Does the attacker already have access?** If yes --- the answer involves privilege escalation, lateral movement, or maintaining access.
4. **Is the attacker trying to hide?** If yes --- the answer involves log clearing, timestomping, or steganography.

---

## Part 15: Common Exam Traps to Watch Out For

### Trap 1: Confusing Similar Attacks

| Frequently Confused Pair | Difference |
|--------------------------|-----------|
| **Phishing vs. Spear Phishing** | Phishing targets many people with a generic message. Spear phishing targets a specific individual with a personalized message. |
| **Spear Phishing vs. Whaling** | Spear phishing targets any specific individual. Whaling specifically targets high-level executives (CEO, CFO). |
| **XSS (Stored) vs. XSS (Reflected)** | Stored XSS is permanently saved on the server (database). Reflected XSS is reflected off the server in the response to a crafted URL. |
| **SQL Injection vs. Command Injection** | SQL injection targets the database through SQL queries. Command injection targets the OS through system commands. |
| **Bluejacking vs. Bluesnarfing** | Bluejacking sends messages (harmless). Bluesnarfing steals data (harmful). |
| **Active Reconnaissance vs. Passive Reconnaissance** | Active directly interacts with the target (scanning, probing). Passive observes without interaction (OSINT, public records). |
| **IDS vs. IPS** | IDS detects and alerts. IPS detects and blocks. IDS is passive. IPS is inline. |
| **Rogue AP vs. Evil Twin** | Rogue AP is any unauthorized AP. Evil twin specifically impersonates a legitimate AP (same SSID). |
| **Vulnerability Scan vs. Penetration Test** | Vulnerability scan identifies potential weaknesses (automated). Penetration test actively exploits them (manual + automated). |

### Trap 2: Confusing Similar Tools

| Frequently Confused Tools | Difference |
|--------------------------|-----------|
| **Nmap vs. Nessus** | Nmap is a port scanner and host discovery tool. Nessus is a vulnerability scanner. Nmap finds open ports; Nessus finds vulnerabilities. |
| **Metasploit vs. Meterpreter** | Metasploit is the framework. Meterpreter is a payload that runs within Metasploit. |
| **Burp Suite vs. OWASP ZAP** | Both are web application security tools. Burp Suite is commercial (free community edition available). ZAP is fully open-source. Exam questions often use Burp Suite. |
| **Hashcat vs. John the Ripper** | Both crack passwords. Hashcat is GPU-accelerated (faster). John the Ripper is CPU-based but more flexible with custom rules. |
| **Hydra vs. Hashcat** | Hydra does ONLINE brute-forcing (attacks network services directly). Hashcat does OFFLINE cracking (works on captured hashes). |
| **Aircrack-ng vs. Reaver** | Aircrack-ng cracks WEP/WPA keys (dictionary/statistical attack). Reaver brute-forces WPS PINs. |
| **Wireshark vs. tcpdump** | Both capture packets. Wireshark has GUI. tcpdump is command-line. |

### Trap 3: Confusing Encryption Concepts

| Concept | Key Distinction |
|---------|----------------|
| **Symmetric vs. Asymmetric** | Symmetric: one shared key (fast, bulk data). Asymmetric: two keys, public/private pair (slow, key exchange and signing). |
| **Encryption vs. Hashing** | Encryption is reversible (decrypt with key). Hashing is one-way (cannot reverse). |
| **DES key: 56-bit or 64-bit?** | 56-bit effective (8 bits are parity). Exam answer: 56-bit. |
| **3DES key: 112-bit or 168-bit?** | 168-bit (3 x 56). Effective security ~112 bits. Exam answer: 168-bit. |
| **Private key signs vs. public key signs?** | Private key signs. Public key verifies. (This is the opposite of encryption: public key encrypts, private key decrypts.) |
| **PGP vs. S/MIME trust model** | PGP uses Web of Trust. S/MIME uses PKI (Certificate Authority). |
| **HMAC vs. Hash** | Hash provides integrity only. HMAC provides integrity AND authentication (uses a secret key). |

### Trap 4: Methodology and Phase Confusion

| Phase | Activities | Common Traps |
|-------|-----------|-------------|
| **Reconnaissance (Footprinting)** | OSINT, Whois, DNS, social media, Google hacking, email harvesting | Students confuse active recon (scanning) with reconnaissance. Reconnaissance is information gathering. |
| **Scanning** | Port scanning, vulnerability scanning, network mapping, banner grabbing | Banner grabbing can be in reconnaissance OR scanning depending on context. |
| **Gaining Access** | Exploitation, password cracking, social engineering, web app attacks | Students choose "maintaining access" when the attacker is still trying to get in. |
| **Maintaining Access** | Backdoors, rootkits, trojans, RATs, scheduled tasks | Creating a backdoor = maintaining access. Using the backdoor later = still maintaining access. |
| **Clearing Tracks** | Log deletion, timestomping, disabling auditing, steganography for data exfil | Students confuse steganography (hiding data in images) with encryption (scrambling data). |

### Trap 5: Specific Facts That Trip Up Students

1. **Nmap SYN scan (-sS):** Also called "half-open" or "stealth" scan. Sends SYN, receives SYN-ACK, sends RST (never completes the handshake). Requires root privileges.

2. **Nmap Connect scan (-sT):** Completes the full TCP handshake. Does not require root. More detectable than SYN scan.

3. **Nmap Xmas scan (-sX):** Sets FIN, PSH, URG flags. Does not work against Windows (Windows sends RST for all closed and open ports).

4. **TCP flag mnemonic (UAPRSF):** Urgent, Acknowledge, Push, Reset, Synchronize, Finish.

5. **Traceroute:** Uses ICMP (Windows) or UDP (Linux) by default. Increments TTL starting from 1.

6. **ARP works at Layer 2:** ARP spoofing is a Layer 2 attack. ARP does not cross routers (stays within the broadcast domain/subnet).

7. **DNS zone transfer uses TCP port 53:** Regular DNS queries use UDP port 53. Zone transfers (AXFR) use TCP port 53.

8. **SNMP community strings:** "public" (read-only) and "private" (read-write) are the defaults. SNMPv1/v2c transmit community strings in cleartext. SNMPv3 adds encryption and authentication.

9. **The CIA Triad:** Confidentiality (encryption), Integrity (hashing), Availability (redundancy/DDoS protection). For OT/ICS, the priority order is reversed: AIC (Availability first).

10. **Passive vs. Active FTP:** Active FTP: server connects to client (problematic with firewalls). Passive FTP: client connects to server (firewall-friendly). The exam may ask which mode works through a firewall --- answer: **passive**.

---

## Day 7 Practice Questions

**Question 1:** An organization deploys applications on virtual machines in the cloud, managing the operating system, middleware, and applications, while the cloud provider manages the physical infrastructure and virtualization layer. Which cloud model is this?

| Option | Text |
|--------|------|
| A | SaaS |
| B | PaaS |
| C | IaaS |
| D | FaaS |

*Correct answer:* **C --- IaaS.** The customer manages OS, middleware, and applications. The provider manages hardware and virtualization. This is the definition of IaaS. In PaaS, the provider would also manage the OS and middleware. In SaaS, the provider manages everything.

---

**Question 2:** An attacker compromises a Managed Service Provider (MSP) to gain access to the MSP's clients' cloud environments. Which threat does this represent?

| Option | Text |
|--------|------|
| A | Cloudborne |
| B | Cloud Hopper |
| C | Man-in-the-Cloud |
| D | Cryptojacking |

*Correct answer:* **B --- Cloud Hopper.** Cloud Hopper specifically targets MSPs as a vector to reach their clients. Cloudborne is a bare-metal firmware attack. MITC steals OAuth tokens. Cryptojacking uses resources for mining.

---

**Question 3:** Which Kubernetes component stores the entire cluster state, including secrets and configuration data?

| Option | Text |
|--------|------|
| A | kube-scheduler |
| B | kube-apiserver |
| C | etcd |
| D | kube-controller-manager |

*Correct answer:* **C --- etcd.** etcd is the distributed key-value store that holds all cluster state data. The API server is the front-end. The scheduler assigns pods to nodes. The controller manager runs control loops.

---

**Question 4:** A symmetric encryption algorithm uses a 56-bit key, a 64-bit block size, 16 rounds, and a Feistel cipher structure. Which algorithm is this?

| Option | Text |
|--------|------|
| A | AES |
| B | DES |
| C | Blowfish |
| D | 3DES |

*Correct answer:* **B --- DES.** DES has a 56-bit key, 64-bit block, 16 rounds, and uses a Feistel structure. AES uses 128-bit blocks and SPN (not Feistel). Blowfish has a variable key length (up to 448-bit). 3DES has a 168-bit key (3 x 56).

---

**Question 5:** A security architect needs to ensure that a document's sender cannot deny having signed it. Which cryptographic mechanism provides this guarantee?

| Option | Text |
|--------|------|
| A | AES-256 encryption |
| B | HMAC-SHA256 |
| C | Digital signature (RSA) |
| D | SHA-256 hash |

*Correct answer:* **C --- Digital signature.** Only digital signatures provide non-repudiation. The sender signs with their private key --- since only they have it, they cannot deny the signature. AES is symmetric (both parties share the key). HMAC uses a shared secret key (either party could have created it). SHA-256 alone has no key at all.

---

**Question 6:** An attacker discovers that a web server supports SSLv2 alongside TLS 1.2. They exploit the SSLv2 vulnerability to decrypt modern TLS sessions. What attack is this?

| Option | Text |
|--------|------|
| A | POODLE |
| B | BEAST |
| C | DROWN |
| D | Heartbleed |

*Correct answer:* **C --- DROWN (Decrypting RSA with Obsolete and Weakened eNcryption).** DROWN specifically exploits SSLv2 support to decrypt TLS connections. POODLE targets SSLv3. BEAST targets TLS 1.0. Heartbleed is a buffer over-read in OpenSSL.

---

**Question 7:** In the NIST cloud reference architecture, which role is responsible for providing connectivity and transport of cloud services between the provider and the consumer?

| Option | Text |
|--------|------|
| A | Cloud Broker |
| B | Cloud Carrier |
| C | Cloud Auditor |
| D | Cloud Provider |

*Correct answer:* **B --- Cloud Carrier.** The carrier provides the network connectivity ("the pipe") between consumer and provider. The broker manages and negotiates services. The auditor assesses security and compliance. The provider offers the cloud services.

---

**Question 8:** Which key stretching algorithm is considered the current best practice for password hashing, winning the Password Hashing Competition in 2015?

| Option | Text |
|--------|------|
| A | bcrypt |
| B | PBKDF2 |
| C | Argon2 |
| D | scrypt |

*Correct answer:* **C --- Argon2.** Argon2 won the Password Hashing Competition in 2015 and is considered the current best practice. bcrypt is well-established but older. PBKDF2 is widely used (especially in WPA2) but less resistant to GPU attacks. scrypt is memory-hard but Argon2 offers more configurability.

---

**Question 9:** An attacker steals an OAuth synchronization token from a victim's workstation. Using this token, they gain persistent access to the victim's cloud storage files without needing the victim's password. What type of attack is this?

| Option | Text |
|--------|------|
| A | Cloud Hopper |
| B | Cloudborne |
| C | Man-in-the-Cloud (MITC) |
| D | Session hijacking |

*Correct answer:* **C --- Man-in-the-Cloud (MITC).** MITC specifically involves stealing OAuth synchronization tokens for cloud storage services. Changing the password does not help because the attacker has the token. Cloud Hopper targets MSPs. Cloudborne is firmware-based. Session hijacking is a general term --- MITC is more specific and the expected answer.

---

**Question 10:** Which type of cryptanalysis attack is specifically mitigated by using password salting?

| Option | Text |
|--------|------|
| A | Brute force attack |
| B | Rainbow table attack |
| C | Birthday attack |
| D | Meet-in-the-middle attack |

*Correct answer:* **B --- Rainbow table attack.** Password salting adds a unique random value to each password before hashing, making precomputed rainbow tables useless. Brute force is mitigated by key stretching (not salting). Birthday attacks target hash collisions. Meet-in-the-middle targets double encryption.
