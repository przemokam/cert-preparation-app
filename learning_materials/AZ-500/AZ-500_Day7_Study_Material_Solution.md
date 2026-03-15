# AZ-500 Exam Preparation: Day 7 — Full Review, Weak Areas & Exam Simulation

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is your final preparation day. Today has three phases: (1) quick checklist review of all four domains, (2) a 50-question exam simulation under timed conditions, (3) targeted review of every wrong answer. If you cannot explain a concept in two sentences — go back to the relevant Day's material and re-read that section.

**Recommended schedule for today (6 hours):**
Block 1 (2 h): Quick Checklist Review (Part 1–4 below). Read each checklist item. If unsure, re-read the linked Day material.
Block 2 (2.5 h): Exam Simulation (Part 6). Set a 90-minute timer. Answer all 50 questions without peeking.
Block 3 (1.5 h): Grade yourself, review every wrong answer, re-read the High-Frequency Exam Traps (Part 5).

## Part 1: Deep Review — Identity & Access (15–20%) [Days 1–2]

### RBAC — Role-Based Access Control

Azure RBAC (Role-Based Access Control) is the system you use to control **who** can do **what** on **which** Azure resources. Every time someone creates a VM, reads a storage blob, or assigns a role to another user, Azure RBAC checks if they have the right permission.

Azure has four critical built-in roles. The exam tests whether you understand the differences between them:

| Role | What it allows you to do | What it does NOT allow |
|------|--------------------|-------------------|
| **Owner** | Full control: create/delete resources, change settings, AND assign roles to other users. The "superadmin" of a scope. | Does NOT give access to data inside resources (e.g. reading a Key Vault secret). You need separate data-plane roles for that. |
| **Contributor** | Same as Owner for managing resources (create VMs, configure networking, deploy apps), BUT **cannot assign roles** to other users. | Cannot grant or revoke access. Cannot read Key Vault secrets or storage blobs without additional data roles. |
| **Reader** | Can view everything (read resource properties, see configurations) but cannot change anything. | Cannot create, modify, or delete resources. Cannot assign roles. |
| **User Access Administrator** | Can **only** manage role assignments (grant and revoke access for other users). Cannot create or manage resources. | Cannot create a VM, configure a VNet, or do anything operational. Only manages who has access. |

**Why this matters on the exam:** Questions often ask "which role should you assign so the user can do X?" The answer depends on whether the task is about managing resources (Contributor), managing access (User Access Administrator), or both (Owner).

**Custom roles** let you define granular permissions beyond the built-in roles. A custom role is a JSON file with four key properties:

- `Actions` — what management-plane operations are allowed (e.g. `Microsoft.Compute/virtualMachines/read`).
- `NotActions` — what operations are excluded from Actions (a "subtract" list).
- `DataActions` — what data-plane operations are allowed (e.g. `Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read`).
- `AssignableScopes` — where the role can be assigned: management group, subscription, or resource group.

**Deny assignments** are special: they override any Allow from RBAC. If a deny assignment blocks an action, even an Owner cannot perform it. Deny assignments are typically created by Azure Blueprints, not manually.

**Test yourself:** User1 has the Owner role on Subscription1. Can User1 read a secret in Key Vault KV1 (in Subscription1)?
*Answer:* Not necessarily. Owner gives control-plane access (manage the Key Vault itself), but reading secrets is a **data-plane** operation. User1 needs either a Key Vault data role (e.g. Key Vault Secrets User) or an access policy granting "Get" on secrets.

### PIM — Privileged Identity Management

PIM solves a fundamental security problem: users who permanently hold powerful roles (like Global Administrator) are a huge risk. If their account is compromised, the attacker immediately has full access. PIM introduces the concept of **just-in-time** access — users do not have the role permanently; they must explicitly **activate** it when needed, and it automatically **deactivates** after a set time.

**Two types of assignments:**

- **Eligible** — the user does not currently have the role. They CAN activate it when needed (goes through an approval workflow). Think of it as "you have a key to the room, but the door is locked until you request entry."
- **Active** — the user has the role right now, all the time. No activation needed. This is the traditional permanent assignment. PIM allows this but discourages it.

**Activation settings** control what happens when a user activates an eligible role:

| Setting | What it controls | Default |
|---------|-----------------|---------|
| Maximum activation duration | How long the role stays active after activation | 8 hours |
| Require MFA on activation | User must verify identity with MFA before the role activates | Configurable |
| Require justification | User must write a reason for activating the role | Configurable |
| Require approval | Another user (approver) must approve the activation request | Configurable |

**Critical exam facts about PIM:**
- PIM requires **Azure AD Premium P2** license. P1 is not enough. If a question says "you have P1" and asks about PIM features, the answer is usually "upgrade to P2."
- A user **cannot approve their own** PIM activation request. If User1 requests activation, User1 cannot also be the approver — even if they are a Global Administrator.
- First-time PIM onboarding requires a **Global Administrator**. No other role can enable PIM for the first time.
- **PIM settings** (duration, MFA, approval) are separate from **PIM assignments** (who gets eligible/active). The exam tests this distinction: "what do you configure in Settings vs. Assignments?"

**Test yourself:** User1 has an eligible Contributor role. They activated it at 10:00 AM. Max duration is 4 hours. At 3:00 PM, can they still create resources?
*Answer:* No. The role deactivated at 2:00 PM (4 hours after activation). They would need to activate again.

### Conditional Access

Conditional Access is Microsoft Entra ID's policy engine that makes **access decisions** based on conditions (signals). It answers the question: "When this user tries to access this app from this location/device/risk level, what should we require?"

A Conditional Access policy has three parts:

**1. Assignments (WHO and WHAT):**
- Which users/groups are targeted (Include) and which are exempted (Exclude).
- Which cloud apps or actions the policy applies to.
- Under which conditions: device platform (iOS, Android, Windows), location (IP ranges), client app (browser, mobile app), sign-in risk level, user risk level.

**2. Grant controls (WHAT TO REQUIRE):**
When the conditions match, what does the user need to do to get access?
- **Block access** — access denied, no way through.
- **Require MFA** — user must complete multi-factor authentication.
- **Require compliant device** — device must meet Intune compliance policies.
- **Require Hybrid Azure AD join** — device must be joined to both on-prem AD and Azure AD.
- **Require app protection policy** — app must have an Intune app protection policy.

**3. Session controls:** Sign-in frequency (how often re-authentication is required), persistent browser session, Conditional Access App Control (for Cloud App Security integration).

**The most important rule for the exam: Exclude takes priority over Include.** If a user is in both the Include group ("All Users") and the Exclude group ("Break Glass Admins"), the policy does NOT apply to them. This is how emergency "break glass" accounts work — they are excluded from all Conditional Access policies so administrators can always access the tenant in emergencies.

**Named locations** are predefined IP address ranges that you can reference in Conditional Access conditions. For example, "If user signs in from outside the corporate network (not in named location 'HeadquartersIPs'), require MFA."

**Identity Protection risk policies** (user risk policy and sign-in risk policy) are special Conditional Access policies that use Microsoft's ML-based risk detection. They require **Azure AD Premium P2**. User risk = the probability that the user's account is compromised. Sign-in risk = the probability that a specific sign-in attempt is malicious.

**Test yourself:** You need to require MFA for all users except emergency admin accounts. How do you set up the policy?
*Answer:* Create a Conditional Access policy. Include = All Users. Exclude = the emergency admin group. Grant control = Require MFA. The emergency admins are excluded and can sign in without MFA.

### App Registrations, Enterprise Apps & Service Principals

These three concepts are closely related but serve different purposes, and the exam frequently tests whether you understand the distinction:

**App registration** — this is the "blueprint" of your application's identity. When you register an app in Azure AD, you define:
- A **client ID** (unique identifier for the app).
- **Client secrets** or **certificates** (credentials the app uses to prove its identity).
- **Redirect URIs** (where Azure AD sends tokens after authentication).
- **API permissions** (what the app can access, e.g. Microsoft Graph).

Think of it as a passport application — it describes who the app is.

**Enterprise application (Service principal)** — this is the "instance" of the app in a specific tenant. When you register an app, Azure automatically creates a service principal in your tenant. The service principal is what actually gets permissions and interacts with resources.

Think of it as the passport itself — the active credential used to cross borders.

**Why two objects?** Because a single app registration can be used across multiple tenants (multi-tenant apps). Each tenant gets its own service principal, with its own consent and access settings.

**Controlling who can register apps:** By default, all users can register apps. To restrict this, set **"Users can register applications" = No** in Azure AD settings. After that, only users with the **Application Developer** role (or Application Administrator, Cloud Application Administrator, or Global Administrator) can register apps. The exam often asks: "How do you prevent non-privileged users from creating service principals?" The answer is: disable app registration for users.

### Managed Identities

Managed identities solve the **credential management** problem. Instead of storing passwords, keys, or certificates in your code or config files, Azure automatically manages the identity for your resource. The resource authenticates to other Azure services (Key Vault, Storage, SQL) using a token — no secrets to rotate, no credentials to leak.

| Type | How it works | When to use | Lifecycle |
|------|------------|-------------|----------|
| **System-assigned** | Azure creates the identity automatically when you enable it on a resource. It is tied 1:1 to that resource. If you delete the VM, the identity is deleted too. | When a single resource needs its own identity. Simplest option. | Created with the resource, deleted with the resource. |
| **User-assigned** | You create the identity yourself as a standalone Azure resource. You then assign it to one or more resources. If you delete a VM, the identity survives. | When multiple resources need the same identity (e.g. 10 VMs accessing the same Key Vault). Or when the identity must outlive the resource. | Independent. You manage its lifecycle. |

**Exam scenario:** "An App Service app needs to read secrets from Key Vault without storing any credentials." The answer is: enable a **system-assigned managed identity** on the App Service, then grant that identity the "Key Vault Secrets User" role (or access policy) on the Key Vault.

### OAuth Permissions — Delegated vs. Application

When an app needs to access an API (like Microsoft Graph), it needs **permissions**. The type of permission depends on whether a user is involved:

**Delegated permissions** — the app acts **on behalf of a signed-in user**. The app can only do what the user is allowed to do. Example: a web app reads the signed-in user's email. The user (or an admin) must consent.

**Application permissions** — the app acts **as itself**, with no user context. Used by background services, daemons, and automation scripts. The app gets its own permissions, independent of any user. **Only an admin can consent** to application permissions (because they are powerful — the app can access data for all users).

**How to decide on the exam:** If the question says "on behalf of users" or "when a user signs in" → delegated. If the question says "background service," "daemon," "no user context," or "runs without user interaction" → application.

**Test yourself:** A background service needs to read all users from Microsoft Graph. Delegated or Application permissions? Who consents?
*Answer:* Application permissions (no user is signed in). An **admin** must consent (application permissions always require admin consent).

## Part 2: Deep Review — Network Security (20–25%) [Days 3–4]

### NSG — Network Security Groups

An NSG is a **firewall at the subnet or NIC level**. It contains rules that allow or deny network traffic based on source/destination IP, port, and protocol. NSGs operate at **Layer 3 (IP) and Layer 4 (TCP/UDP port)** — they cannot inspect domain names, URLs, or application-layer content.

**How rules are evaluated:** Each rule has a **priority number** (100–4096). Azure evaluates rules starting from the **lowest priority number** (highest priority). The first matching rule wins — all subsequent rules are ignored for that traffic flow.

**Default rules (you cannot delete these):**

| Priority | Rule | What it does |
|----------|------|-------------|
| 65000 | AllowVNetInBound | Allows all traffic between resources within the same VNet |
| 65001 | AllowAzureLoadBalancerInBound | Allows Azure Load Balancer health probes |
| 65500 | **DenyAllInBound** | Blocks all other inbound traffic that was not explicitly allowed by a rule above |

This means: if you do not add any custom Allow rules, **all inbound traffic from the Internet is blocked** by the DenyAllInBound default at priority 65500. This is the most commonly tested concept.

**Two-level NSG evaluation for inbound traffic:**
When traffic comes from the Internet to a VM, it passes through **two** potential NSG checkpoints:
1. **Subnet NSG** — evaluated first. If the subnet has an NSG and it denies the traffic, the traffic is dropped. If it allows, the traffic proceeds to step 2.
2. **NIC NSG** — evaluated second. If the NIC has an NSG and it denies the traffic, the traffic is dropped. If it allows, the traffic reaches the VM.

**Both** must allow the traffic. If either one denies, the traffic is blocked. If only one NSG exists (subnet only, or NIC only), then only that one is evaluated.

For **outbound** traffic, the order is reversed: NIC NSG first, then Subnet NSG.

**Service tags** are predefined labels representing groups of IP addresses. Instead of listing individual IPs, you use a tag in your NSG rules: `Internet` (all public IPs), `VirtualNetwork` (your VNet + peered VNets), `AzureLoadBalancer`, `Storage` (all Azure Storage IPs), `Sql` (all Azure SQL IPs).

**Test yourself:** Subnet1 has NSG-A with Allow TCP 80 from Internet (priority 100). VM1 is in Subnet1 with no NIC NSG. VM2 is in Subnet1 with NIC NSG-B (only default rules). Can Internet HTTP traffic reach VM2?
*Answer:* No. Subnet NSG-A allows TCP 80. But NIC NSG-B has no custom Allow rule for TCP 80 from Internet, and the default DenyAllInBound (65500) blocks it. Both levels must allow.

### ASG — Application Security Groups

ASGs let you **group VMs logically** and use those groups in NSG rules instead of writing rules for individual IP addresses. For example, instead of writing "Allow TCP 443 from 10.0.1.4, 10.0.1.5, 10.0.1.6," you create an ASG called "WebServers," add those VMs to it, and write "Allow TCP 443 from ASG:WebServers."

**The critical constraint:** All NICs in an ASG must be in the **same VNet**. They can be in different subnets within that VNet, but they cannot span across different VNets. This is the most commonly tested ASG fact.

### UDR — User-Defined Routes

By default, Azure routes traffic between subnets, to the Internet, and through VPN gateways using **system routes**. UDRs let you **override** these defaults — for example, forcing all outbound traffic through a Network Virtual Appliance (NVA) for inspection.

You create a **route table**, add routes to it, and associate it with a subnet. Each route specifies:
- **Address prefix** — which destination traffic to match (e.g. 0.0.0.0/0 for all traffic).
- **Next hop type** — where to send it: Virtual appliance (NVA IP), Virtual network gateway (VPN), Internet, VNet (direct), None (drop/blackhole).

**Longest prefix match:** If multiple routes match, Azure picks the most specific one. For example, if you have routes for 10.0.0.0/16 (send to NVA) and 10.0.1.0/24 (send direct), traffic to 10.0.1.5 matches the /24 route because it is more specific. Overlapping prefixes are allowed — only **identical** prefixes (same network and mask) are not.

**Exam scenario:** "You need all traffic from Subnet1 to pass through VM1 (an NVA) for inspection." The answer is: create a UDR with address prefix 0.0.0.0/0, next hop type "Virtual appliance," next hop IP = VM1's private IP. Associate the route table with Subnet1.

### Azure Firewall

Azure Firewall is a **managed, cloud-based network firewall** that provides Layer 3, Layer 4, AND Layer 7 filtering. Unlike NSGs (which only filter by IP/port/protocol), Azure Firewall can filter by **FQDN** (domain names) and supports threat intelligence, TLS inspection, and centralized logging.

**Deployment requirements:**
- Must be deployed in a dedicated subnet named exactly **AzureFirewallSubnet** (minimum /26). Any other name will fail.
- Gets a public IP address for outbound SNAT.

**Rule processing order — DNAT first, then Network, then Application:**

| Rule type | What it filters | OSI layer | Example |
|-----------|----------------|-----------|---------|
| **DNAT** (Destination NAT) | Inbound traffic — translates public IP/port to private IP/port | L3/L4 | Forward port 8080 on firewall's public IP to VM1:80 |
| **Network rules** | Traffic by IP, port, protocol | L3/L4 | Allow TCP 1433 from Subnet1 to SQL server |
| **Application rules** | Outbound traffic by FQDN | **L7** | Allow outbound to *.microsoft.com, block *.gambling.com |

Azure Firewall processes rules in this exact order: DNAT → Network → Application. If a DNAT rule matches, the traffic is translated and **Network and Application rules are not evaluated** for that flow. If no DNAT rule matches, Network rules are checked. If no Network rule matches, Application rules are checked.

### VPN Gateway

VPN Gateway creates encrypted tunnels between Azure VNets and on-premises networks (or other VNets) over the public Internet.

**Two gateway types — this distinction is heavily tested:**

| Type | Tunnels | Use case |
|------|---------|----------|
| **PolicyBased** | Maximum **1 S2S tunnel** only | Legacy devices, simple single-site connectivity |
| **RouteBased** | **Multiple S2S tunnels**, P2S, VNet-to-VNet | Most scenarios. Required for Active-Active, BGP, and coexistence with ExpressRoute |

**Active-Active configuration** provides redundancy by deploying two gateway instances. Requirements:
- SKU must be **VpnGw1 or higher** (Basic SKU does NOT support Active-Active).
- You need **2 public IP addresses** (one per gateway instance).
- Must be **RouteBased** (PolicyBased does not support it).

**S2S VPN** (Site-to-Site) connects your Azure VNet to an on-premises network. It requires a **Local Network Gateway** resource in Azure that represents your on-premises VPN device (specifies the on-prem public IP and address ranges).

### ExpressRoute

ExpressRoute provides **private connectivity** between your on-premises network and Azure through a connectivity provider. Traffic does NOT go over the public Internet.

**Critical fact: ExpressRoute does not encrypt traffic by default.** The connection is private (dedicated circuit) but not encrypted. To add encryption:
- **MACsec** — encrypts traffic on **ExpressRoute Direct** circuits at the data link layer (Layer 2). Only available on Direct circuits.
- **IPsec over ExpressRoute** — creates a VPN tunnel over the private peering, adding IPsec encryption at Layer 3.

### Service Endpoint vs. Private Endpoint — Know the Difference

Both are ways to securely connect your VNet to Azure PaaS services (Storage, SQL, Key Vault). The exam heavily tests which one to use and why.

**Service Endpoint:**
- You enable it on a subnet. Traffic from that subnet to the Azure service now travels over the **Microsoft backbone** instead of the public Internet.
- The service **still has a public IP** — the traffic is just routed internally. From the service's perspective, the source is your VNet's public IP range.
- **Cannot be reached from on-premises** through VPN/ExpressRoute (because the service still uses its public endpoint).
- **Free.** No additional cost.

**Private Endpoint:**
- Creates a **private IP address** in your VNet that maps to the Azure service. The service gets a NIC with a private IP in your subnet.
- Requires a **Private DNS zone** so that the service's FQDN resolves to the private IP instead of the public IP.
- **Accessible from on-premises** through VPN/ExpressRoute (because it is just a private IP in your VNet).
- **Costs money** (per-hour + per-GB processed).

**Private DNS zone names you must memorize:**

| Service | Private DNS zone name |
|---------|--------------------|
| Blob Storage | `privatelink.blob.core.windows.net` |
| Azure SQL | `privatelink.database.windows.net` |
| Key Vault | `privatelink.vaultcore.azure.net` |
| Web App | `privatelink.azurewebsites.net` |
| Cosmos DB | `privatelink.documents.azure.com` |

**Test yourself:** You need on-premises servers to access Azure SQL Database through a private IP via ExpressRoute. Service Endpoint or Private Endpoint?
*Answer:* Private Endpoint. Service Endpoints cannot be reached from on-premises. Private Endpoints create a private IP accessible through ExpressRoute.

### WAF — Web Application Firewall

WAF protects web applications from common attacks (SQL injection, cross-site scripting, etc.). It operates at **Layer 7** (HTTP/HTTPS) and inspects the content of web requests.

WAF can be deployed on two services:
- **Azure Application Gateway** — regional load balancer with WAF. Protects apps in a single region.
- **Azure Front Door** — global CDN/load balancer with WAF. Protects apps globally across regions.

**Two modes:** Detection mode (logs threats but does not block them — use for testing) vs. Prevention mode (actively blocks malicious requests).

### DDoS Protection

Azure provides two tiers of DDoS (Distributed Denial of Service) protection:

| Feature | DDoS Basic | DDoS Standard |
|---------|-----------|--------------|
| Cost | Free (automatic) | Paid (per-VNet) |
| Protection | Platform-level, always on | **Adaptive tuning** — learns your traffic patterns and adjusts thresholds |
| Monitoring | None | Real-time metrics, diagnostic logs, alert integration |
| Cost protection | No | **Yes** — Microsoft reimburses resource costs incurred during a DDoS attack |
| Support | Standard support | **DDoS Rapid Response (DRR)** — dedicated Microsoft team during active attacks |

DDoS Standard is enabled at the **VNet level** — all resources in that VNet are protected.

**Test yourself:** What is the key difference between NSG filtering and Azure Firewall filtering?
*Answer:* NSG filters at Layer 3/4 only (IP, port, protocol). Azure Firewall also filters at Layer 7 (FQDN/domain names in Application rules). NSG cannot inspect domain names; Azure Firewall can.

## Part 3: Deep Review — Compute, Storage, Database (20–25%) [Day 5]

### Azure Bastion — Secure Remote Access Without Public IPs

Azure Bastion provides **RDP and SSH access to VMs directly from the Azure Portal** over HTTPS (port 443). The key benefit: your VMs do **not need a public IP address**. Instead, you connect to Bastion's public IP, and Bastion forwards the session to the VM's private IP internally.

**Deployment requirements:**
- Bastion must be deployed in a dedicated subnet named exactly **AzureBastionSubnet** (minimum /26 — 64 addresses). Any other name will fail.
- Bastion connects to VMs via their private IPs, so VMs do not need public IPs or NSG rules for RDP/SSH from the Internet.

**Cross-VNet support:** Bastion works across **peered VNets**. If you deploy Bastion in VNET1, and VNET1 is peered with VNET2, you can use Bastion to connect to VMs in VNET2. You do NOT need a separate Bastion deployment in each VNet — one Bastion can serve all peered VNets.

### JIT VM Access — Temporary, On-Demand Port Opening

JIT (Just-In-Time) VM Access is a Defender for Cloud feature that keeps management ports (RDP 3389, SSH 22) **closed by default** and opens them only when needed, for a limited time, for a specific IP address.

**How it works step by step:**
1. Defender for Cloud creates NSG rules that **deny** inbound traffic on management ports.
2. When an admin needs access, they **request** JIT access through the portal (specifying which port, how long, from which IP).
3. Defender for Cloud **temporarily modifies the NSG** to add an Allow rule for that specific IP and port.
4. After the time expires, the temporary NSG rule is **automatically removed**, closing the port again.

**Requirements:** JIT requires **Defender for Servers** plan (paid). It works through ARM and makes changes at the NSG level — it does not install any agent on the VM.

**Why this matters:** JIT reduces the attack surface. Instead of leaving RDP/SSH open 24/7 (where attackers can brute-force), the port is only open for the exact duration needed by the exact person who requested it.

### Azure Disk Encryption (ADE) — Encrypting VM Disks

ADE encrypts VM OS and data disks using industry-standard encryption: **BitLocker** (Windows) or **DM-Crypt** (Linux). The encryption keys are stored in **Azure Key Vault**.

**Key Vault requirements for ADE — the most tested fact:**
- Key Vault must be in the **same region** as the VM. If your VM is in West US, the Key Vault must be in West US.
- Key Vault must be in the **same subscription** as the VM.
- The **resource group does NOT matter** — the Key Vault can be in a different resource group than the VM, as long as region and subscription match.
- Key Vault must have **Soft Delete** enabled (so encryption keys are not permanently lost if accidentally deleted).
- Key Vault access policy must have **Azure Disk Encryption for volume encryption** enabled.

**VMs that do NOT support ADE:**
- **Basic-tier VMs** (e.g. Basic_A1) — ADE requires Standard tier or higher.
- **Daily-build Linux images** — custom or preview Linux builds are not supported.

**Test yourself:** VM1 is in West US, Subscription1, RG1. KV1 is in West US, Subscription1, RG2. KV2 is in East US, Subscription1, RG1. Which Key Vault can you use for ADE?
*Answer:* KV1. It matches region (West US) and subscription (Sub1). The resource group (RG2 vs RG1) does not matter. KV2 fails because it is in East US (wrong region).

### Storage Security — Access Keys, SAS, and Revocation

Azure Storage accounts have **two access keys** (key1 and key2). These keys provide **full access** to the entire storage account — anyone with a key can read, write, and delete all data. This is why you should minimize key usage and prefer Azure AD RBAC or SAS tokens.

**SAS (Shared Access Signature)** tokens provide **limited, time-scoped access** to storage resources. There are three types:

| SAS type | Signed with | Security level |
|----------|------------|---------------|
| **Account SAS** | Storage access key | Lower — key compromise revokes all SAS |
| **Service SAS** | Storage access key | Lower — same risk |
| **User Delegation SAS** | **Azure AD credentials** | **Highest** — no key involved; recommended |

**How to revoke SAS access — this is the most commonly tested storage question:**
Creating new SAS tokens does **NOT** revoke existing ones. Old SAS tokens remain valid until they expire. The only way to immediately revoke all SAS tokens signed with a specific key is to **regenerate that access key**. When you regenerate key1, every SAS token that was signed with key1 becomes invalid instantly.

**Immutable storage** enforces WORM (Write Once, Read Many) policies on blob containers. Two types of policies:
- **Time-based retention** — blobs cannot be modified or deleted for a specified period (e.g. 90 days, 7 years).
- **Legal Hold** — blobs cannot be modified or deleted until the legal hold is explicitly removed (no time limit).

### BYOK — Customer-Managed Keys (CMK) for Storage Encryption

By default, Azure encrypts all storage data with Microsoft-managed keys. With BYOK (Bring Your Own Key), you use your own key stored in Key Vault to encrypt storage data.

**Key Vault requirements for BYOK — different from ADE:**
- Key Vault must be in the **same region** as the storage account (same as ADE).
- Key Vault must be in the **same tenant** (Azure AD tenant), but a **different subscription is OK** (unlike ADE, which requires same subscription).
- Key Vault must have **Soft Delete** and **Purge Protection** enabled.
- For **automatic key rotation**: configure the storage account to use the key without specifying a version. Azure will automatically use the latest key version when it rotates.

**Comparison for the exam:**

| Requirement | ADE (disk encryption) | BYOK (storage encryption) |
|-------------|----------------------|--------------------------|
| Same region | Yes | Yes |
| Same subscription | **Yes** | No (same tenant is enough) |
| Same tenant | Yes (implicit) | **Yes** |
| Soft Delete | Yes | Yes |
| Purge Protection | Recommended | **Required** |

### SQL Security — Four Features You Must Distinguish

The exam frequently presents scenarios where you must choose the correct SQL security feature. All four protect data differently:

**TDE (Transparent Data Encryption):**
- Encrypts the **entire database file** on disk (data files, log files, tempdb).
- Works at the **server side** — the database engine encrypts/decrypts automatically. Your application does not need any code changes.
- Protects against someone stealing the physical disk or backup files. They cannot read the data without the encryption key.
- **Does NOT protect data in transit** (use TLS for that) or from authorized database users who query the data.

**Always Encrypted:**
- Encrypts **specific columns** (e.g. Social Security Numbers, credit card numbers).
- Works at the **client side** — the application (or ODBC/OLEDB driver) encrypts data before sending it to the database and decrypts it after receiving it. The database engine never sees the plaintext.
- The encryption key (Column Master Key) is stored in the **client's key store** (Key Vault, Windows Certificate Store, etc.).
- Protects data from **database administrators** — even a DBA cannot read the encrypted columns because the server does not have the key.

**Dynamic Data Masking (DDM):**
- Masks the **display** of sensitive data in query results (e.g. shows "XXXX" instead of the full credit card number).
- **Is NOT encryption.** The actual data is stored unmasked in the database. DDM only changes how the data appears to non-privileged users.
- Users with UNMASK permission see the real data. DDM is a convenience feature, not a security boundary.

**SQL Auditing:**
- Logs **database operations** (who accessed what, when, what query was executed).
- Logs can be sent to Log Analytics workspace (for KQL queries), Storage account (for archival), or Event Hub (for streaming to SIEM).

**Test yourself:** A DBA should not be able to read patients' Social Security Numbers in an Azure SQL Database. Which feature do you use?
*Answer:* Always Encrypted. It encrypts specific columns client-side. The DBA (server-side) never has the decryption key, so they see only ciphertext. TDE would not help here because TDE decrypts data transparently for anyone who queries the database.

### ACR & AKS — Container Security

**Azure Container Registry (ACR)** stores Docker images. Access is controlled by roles:

| Role | What it allows | Use case |
|------|---------------|----------|
| **AcrPull** | Pull (download) images only | AKS clusters, CI/CD pipelines that deploy |
| **AcrPush** | Push (upload) and pull images | CI/CD pipelines that build and publish |
| **AcrImageSigner** | Sign images with Content Trust | Ensuring image integrity (notary) |

**AKS + ACR integration:** To allow your AKS cluster to pull images from your ACR, run `az aks update --attach-acr <acr-name>`. This grants the **AcrPull** role to the AKS cluster's managed identity — the cluster can pull images, but cannot push or delete them (least privilege).

**AKS + Azure AD integration** enables Kubernetes RBAC with Azure AD identities. Instead of managing separate Kubernetes service accounts, you use Azure AD users and groups for cluster authentication.

## Part 4: Deep Review — Security Operations (30–35%) [Day 6]

This is the **largest exam section** (30–35% of questions). Master every concept here.

### Azure Policy — Enforcing Governance Rules

Azure Policy ensures that Azure resources comply with your organization's rules. You define rules ("all VMs must use managed disks," "all storage accounts must use HTTPS"), and Azure Policy enforces them — either preventing non-compliant resources from being created, or flagging/fixing them after creation.

**Policy building blocks:**
- A **policy definition** is a single rule, written in JSON. It specifies a condition (e.g. "if VM does not use managed disks") and an effect (e.g. "deny creation").
- An **initiative** (also called a policy set) is a **group** of related policy definitions bundled together. Example: the "CIS Benchmark" initiative contains 150+ individual policy definitions. When the exam says "deploy policies as a group," the answer is "initiative."
- An **assignment** applies a policy or initiative to a **scope** (management group, subscription, or resource group).

**Policy effects — what happens when a resource matches the policy condition:**

| Effect | What it does | When it triggers | Needs managed identity? |
|--------|-------------|-----------------|----------------------|
| **Deny** | **Blocks** the resource from being created or updated. The user gets an error. | At resource creation/update time | No |
| **Audit** | **Logs** the resource as non-compliant in the compliance dashboard. The resource is still created. | After resource exists (evaluation cycle) | No |
| **AuditIfNotExists** | Checks if a **related** resource exists (e.g. does this VM have an anti-malware extension?). If not, logs non-compliance. | After resource exists | No |
| **DeployIfNotExists** | Checks if a related resource exists. If not, **automatically deploys** it (e.g. installs a monitoring extension). | After resource exists | **Yes** — the policy needs a managed identity to create the related resource |
| **Modify** | **Changes properties** on the resource (e.g. adds a required tag, changes a network setting). | At resource creation/update time | **Yes** — the policy needs a managed identity to modify the resource |
| **Append** | **Adds** a property to the resource without changing existing ones (e.g. adds an IP rule to a storage firewall). | At resource creation/update time | No |

**Why DeployIfNotExists and Modify need a managed identity:** These effects create or change resources on your behalf. To do that, they need permissions — which are provided through a managed identity attached to the policy assignment. Deny, Audit, and AuditIfNotExists only evaluate or block; they do not create anything.

**Remediation tasks:** When you assign a DeployIfNotExists policy, it affects **new** resources automatically. But what about resources that **already exist** and are non-compliant? You create a **remediation task** — a one-time operation that evaluates all existing resources and deploys the missing related resources (e.g. installs the monitoring extension on all existing VMs that lack it).

**Scoping for multiple subscriptions:** If you need to apply a policy across **multiple subscriptions**, you must assign it at a **management group** scope. A management group is a container above subscriptions — you place your subscriptions in a management group, then assign the policy at that level. Assigning at individual resource groups would require repeating the assignment for every RG in every subscription — not scalable and often the wrong answer on the exam.

**Test yourself:** You need to auto-install a monitoring extension on all VMs across three subscriptions, including VMs that already exist. What do you need?
*Answer:* (1) A DeployIfNotExists policy definition. (2) An initiative if grouping with other policies. (3) A managed identity on the assignment. (4) Assign at management group scope (covering all three subscriptions). (5) A remediation task for existing VMs.

### Key Vault Governance — Control Plane vs. Data Plane

Key Vault has a **two-layer access model** that the exam tests heavily:

**Control plane** (management operations): Creating and deleting Key Vaults, configuring firewall settings, managing access policies, setting tags. Controlled by Azure RBAC roles like **Owner** and **Contributor**.

**Data plane** (working with secrets, keys, certificates): Reading a secret, creating a key, importing a certificate. Controlled by **Key Vault data roles** (e.g. Key Vault Secrets User, Key Vault Crypto Officer) or **vault access policies**.

**The critical exam fact:** A user with **Owner** or **Contributor** on a Key Vault has **full control-plane access** (they can delete the vault, change settings, manage policies) but has **zero data-plane access** by default. They cannot read a single secret unless they also have a data role or an access policy granting data permissions. This is the most common Key Vault exam trap.

**Two access models for the data plane:**
- **Vault access policy** (legacy): Per-vault policies that grant specific operations (Get, List, Create, Delete, etc.) to specific users/apps. Configured in the Key Vault's Access policies blade.
- **Azure RBAC** (recommended): Uses standard Azure RBAC roles for data operations (Key Vault Secrets Officer, Key Vault Crypto User, etc.). Supports Conditional Access. Centrally managed with all other RBAC assignments.

**Soft Delete + Purge Protection:**
- **Soft Delete** = when you delete a key/secret/certificate, it is not permanently gone. It moves to a "deleted" state and can be recovered within a retention period (default 90 days).
- **Purge Protection** = when enabled, **nobody** can permanently delete (purge) a soft-deleted item until the retention period expires. Not even an Owner. This prevents malicious or accidental permanent deletion.

**Backup and Restore:** You can export keys/secrets/certificates as encrypted backup blobs. Restoring works only to a Key Vault in the **same Azure geography** (e.g. a backup from East US can be restored to West US — both are in the "United States" geography — but cannot be restored to West Europe).

### Defender for Cloud — Security Posture and Workload Protection

Defender for Cloud is Microsoft's centralized security management platform. It has two core capabilities:

**CSPM (Cloud Security Posture Management):**
This is the "assessment" side. Defender for Cloud evaluates your environment against security best practices and gives you a **Secure Score** (0–100%). Each recommendation has a score impact — fixing recommendations increases your Secure Score.

Recommendations are grouped into **security controls** (e.g. "Enable encryption at rest," "Manage access and permissions"). Each control has a maximum score. The compliance dashboard shows how you measure against standards like **MCSB** (the default), NIST SP 800-53, ISO 27001, SOC 2, and PCI DSS. You can add additional standards from the Regulatory compliance blade.

**CWPP (Cloud Workload Protection Platform):**
This is the "protection" side. You enable workload-specific plans that provide **threat detection, vulnerability scanning, and alerts** for specific resource types:

| Plan | What it protects | Key capability |
|------|-----------------|---------------|
| **Defender for Servers** | VMs (Azure, on-prem, multi-cloud) | Vulnerability scanning, JIT, file integrity monitoring, adaptive application controls |
| **Defender for SQL** | Azure SQL, SQL on VMs | SQL injection detection, vulnerability assessment |
| **Defender for Storage** | Storage accounts | Malware scanning on uploads, anomalous access |
| **Defender for Containers** | AKS, ACR | Image scanning, runtime threat detection |
| **Defender for Key Vault** | Key Vaults | Anomalous access detection (unusual IPs, unusual operations) |
| **Defender for App Service** | Web apps | Dangling DNS, anomalous requests |
| **Defender for Resource Manager** | ARM operations | Suspicious management operations |

**Multi-cloud support:** Defender for Cloud can monitor **AWS** and **GCP** environments through cloud connectors. **Alibaba is NOT supported.** This is a frequently tested fact.

**Adaptive application controls:** A Defender for Servers feature that uses ML to learn which applications normally run on your VMs. It then recommends an allowlist (whitelist) and alerts or blocks when an unknown application tries to run. Use case: "prevent unauthorized apps and malware from running on VMs."

**EASM (External Attack Surface Management):** Discovers and maps your organization's Internet-facing assets (public IPs, hostnames, domains, SSL certificates, ASNs) by scanning the Internet. Identifies exposures like expired certificates or misconfigured services.

### Workflow Automation — Connecting Defender for Cloud to Logic Apps

When Defender for Cloud generates a **security alert** (e.g. "suspicious login detected") or a **recommendation** (e.g. "VM1 lacks disk encryption"), you can automatically trigger an action. This is done through **workflow automation**.

**How it works:**
1. You create a **Logic App** that defines the action (send email, create ServiceNow ticket, block IP, etc.).
2. In Defender for Cloud, you create a **workflow automation** that says: "When alert X occurs, trigger Logic App Y."

**Two critical rules the exam tests:**
- The **Logic App must be created first** — you cannot create it during the workflow automation setup. If the exam asks "what should you create first?", the answer is "Logic App."
- To **modify** a workflow automation's action (e.g. change the email recipient), you open the Logic App in **Azure Logic Apps Designer** and edit the action there. The modification is in the Logic App, not in Defender for Cloud. You need the **Logic App Contributor** role to edit it.

### Microsoft Sentinel — SIEM and SOAR

Microsoft Sentinel is a cloud-native **SIEM** (Security Information and Event Management) that collects security data from across your environment, and a **SOAR** (Security Orchestration, Automated Response) that automates responses to threats.

Sentinel runs on top of a **Log Analytics workspace** — all ingested data is stored in Log Analytics tables and queried using **KQL (Kusto Query Language)**.

**The Sentinel pipeline — how data flows from source to response:**

```
Data sources → Data connectors → Log Analytics tables → Analytics rules → Incidents → Playbooks
```

**Step 1: Data connectors** bring data into Sentinel from Azure services, Microsoft 365, and third-party sources. Each connector writes to a specific Log Analytics table:

| Connector | What it ingests | Target table |
|-----------|----------------|-------------|
| Azure AD | Sign-in and audit logs | SigninLogs, AuditLogs |
| Defender for Cloud | Security alerts | SecurityAlert |
| CEF | Third-party firewall/IDS logs | CommonSecurityLog |
| Windows Security Events | Windows Event Logs | SecurityEvent |
| Azure Firewall | Firewall logs | AzureDiagnostics |

**CEF ingestion deserves special attention** because the exam asks about it frequently. CEF (Common Event Format) is a standard log format used by third-party firewalls (Palo Alto, Fortinet, Check Point). To ingest CEF into Sentinel:
1. Deploy a **Linux VM** as a syslog forwarder.
2. Install the **Log Analytics agent** on the Linux VM.
3. Configure your firewall to send CEF messages to the Linux VM (syslog, port 514).
4. The agent parses the CEF messages and sends them to the Log Analytics workspace.
5. Data appears in the **CommonSecurityLog** table.

The exam trap: CEF does NOT use Event Hubs, Event Grid, or Azure Functions. It requires a Linux VM with the Log Analytics agent.

**Step 2: Analytics rules** detect threats by querying the data and creating **incidents** when a threat is found. There are four rule types, and you must know which to use:

| Rule type | How it detects threats | Can you write custom KQL? | Frequency |
|-----------|----------------------|--------------------------|-----------|
| **Fusion** | Microsoft's ML engine correlates low-fidelity alerts from multiple products into a single high-fidelity incident | **No** — fully managed by Microsoft | Continuous |
| **Microsoft Security** | Creates incidents directly from alerts generated by other Microsoft products (Defender for Cloud, Defender for Identity, etc.) | **No** — limited to filtering by severity | Real-time |
| **Scheduled** | Runs a **KQL query** you write on a schedule you define. If the query returns results above a threshold, an incident is created. | **Yes** — fully customizable | You define (every 5 min, every hour, etc.) |
| **NRT (Near-Real-Time)** | Same as Scheduled, but runs approximately every **1 minute** for faster detection | **Yes** — fully customizable | ~1 minute |

**The exam rule:** If the question involves a **custom KQL query**, the answer is Scheduled (or NRT). Fusion and Microsoft Security do NOT support custom queries.

**Step 3: Playbooks** automate the response when an incident is created. A Sentinel playbook is a **Logic App** with Sentinel-specific triggers and actions. When an incident fires, the playbook can: send an email, create a ticket in ServiceNow, block an IP on the firewall, isolate a VM, or call an Azure Function.

**Other Sentinel components:**
- **Workbooks** — interactive dashboards that visualize Sentinel data using KQL queries, charts, and grids.
- **Bookmarks** — during threat hunting, you can bookmark interesting log events, annotate them with notes, and share them with your investigation team.
- **Sentinel notebooks** — Jupyter notebooks running in **Azure Machine Learning** for advanced threat hunting with Python. Requirements: **1 Azure ML workspace** (minimum), **0 Azure Container Registries** (notebooks use pre-built environments).
- **Sentinel VM connectivity** — Sentinel can collect data from VMs connected to **any** Log Analytics workspace, not just the workspace where Sentinel is deployed.

### Azure Monitor — Collecting and Routing Telemetry

Azure Monitor is the centralized platform for collecting, analyzing, and acting on monitoring data from Azure resources.

**Diagnostic settings** control where resource logs (detailed operational logs from Azure services) are sent. Three destinations:
- **Log Analytics workspace** — for KQL queries, alerts, and Sentinel integration. Supports up to **730 days** (2 years) retention.
- **Storage account** — for long-term archival and compliance. Cheaper but does not support KQL.
- **Event Hub** — for streaming to third-party SIEM or external tools.

**Data Collection Rules (DCRs)** define what data to collect from VMs (which event logs, which performance counters, which syslog levels) and where to send it. DCRs work with the **Azure Monitor Agent (AMA)** — the modern agent replacing the legacy Log Analytics agent (MMA). You create one DCR and associate it with multiple VMs.

**Action groups** define what happens when an alert fires: who gets notified (email, SMS, push notification) and what automated actions to trigger (webhook, Logic App, Azure Function, ITSM integration).

### Resource Locks and Azure Blueprints

**Resource locks** prevent accidental modifications or deletions:
- **Read-only lock** — blocks **ALL write operations** on the resource, including starting/stopping a VM, changing settings, and deleting. Only read operations are allowed. This catches many exam candidates — starting a VM is a write operation.
- **Delete lock** — allows all modifications (start, stop, configure) but blocks deletion.

**Azure Blueprints** package multiple governance artifacts into a single deployable unit. A blueprint can contain:
- RBAC role assignments
- Azure Policy assignments
- ARM templates
- Resource groups

You **publish** a blueprint version, then **assign** it to subscriptions. This ensures every new subscription gets the same governance configuration. Use case: "enforce the same role assignments and policies across multiple new subscriptions."

**Test yourself:** A resource group has a Read-only lock. Can you start a VM in that resource group?
*Answer:* No. A Read-only lock blocks all write operations, including VM start (which changes the VM's state). You would need to remove the lock first or change it to a Delete lock.

## Part 5: High-Frequency Exam Traps — Master List

These are the concepts that appear repeatedly in exam dumps and where candidates most often select the wrong answer. Study every row in this table.

| # | Trap topic | What to remember |
|---|-----------|-----------------|
| 1 | Key Vault region for ADE | Same region + same subscription as VM. Resource group does NOT matter. |
| 2 | Key Vault for Storage BYOK | Same region + same **tenant**. Different subscription is OK. |
| 3 | Key Vault Owner/Contributor | Control plane only. NO data plane access to secrets/keys/certificates. Need data roles or access policies. |
| 4 | PIM settings vs. assignments | Settings = max duration, MFA, approval. Assignments = who gets eligible/active roles. |
| 5 | PIM self-approval | A user cannot approve their own activation request. |
| 6 | PIM license | Requires Azure AD Premium **P2**. |
| 7 | Identity Protection | Risk policies require Azure AD Premium **P2**. |
| 8 | Conditional Access exclude | Exclude takes priority over Include. Always. |
| 9 | NSG evaluation order | Inbound: Subnet NSG → NIC NSG. Outbound: NIC NSG → Subnet NSG. Both must allow. |
| 10 | NSG vs. ASG vs. Firewall | NSG = L3/L4 filter. ASG = VM grouping for NSG rules. Firewall = L3/L4/L7 + FQDN. |
| 11 | ASG scope | All NICs in an ASG must be in the **same VNet**. Different subnets OK, different VNets NOT. |
| 12 | Service Endpoint vs. Private Endpoint | SE = public IP, backbone route, no on-prem. PE = private IP, DNS change, on-prem accessible. |
| 13 | TDE vs. Always Encrypted | TDE = entire DB on disk, server-side. AE = specific columns, client-side, app has the key. |
| 14 | Dynamic Data Masking | Masking display only. NOT encryption. Data is stored unmasked. |
| 15 | SAS revocation | Creating new SAS does NOT revoke old ones. Must **regenerate the access key** that signed the SAS. |
| 16 | Sentinel rule types | Fusion = ML (no custom KQL). Scheduled = custom KQL. NRT = KQL every 1 min. Microsoft Security = from Defender alerts. |
| 17 | Sentinel playbooks | = Logic Apps. Must be created before workflow automation. |
| 18 | Sentinel notebooks | Need 1 Azure ML workspace. Need 0 container registries. |
| 19 | Sentinel VM connectivity | VMs from ANY workspace can connect to Sentinel, not just the workspace Sentinel is deployed on. |
| 20 | CEF ingestion | Log Analytics agent on Linux VM as syslog forwarder. NOT Event Hub, NOT Event Grid. |
| 21 | Workflow automation | Backed by Logic App. Logic App must exist FIRST. Logic App Contributor to modify. |
| 22 | Defender multi-cloud | AWS + GCP yes. Alibaba NOT supported. |
| 23 | Default compliance standard | MCSB (Microsoft Cloud Security Benchmark). Not NIST, not ISO. |
| 24 | DeployIfNotExists / Modify | Require managed identity on the policy assignment. Other effects do not. |
| 25 | Policy multi-subscription | Initiative + management group scope. Not resource group scope. |
| 26 | Azure Firewall subnet | Must be named **AzureFirewallSubnet**. /26 minimum. |
| 27 | Azure Bastion subnet | Must be named **AzureBastionSubnet**. /26 minimum. Works across peered VNets. |
| 28 | VPN Active-Active | Requires 2 public IPs + VpnGw1 SKU or higher. Basic SKU does NOT support it. |
| 29 | ADE unsupported VMs | Basic-tier VMs and daily-build Linux images do NOT support ADE. |
| 30 | Read-only lock | Blocks ALL write operations, including VM start/stop. Delete lock only blocks delete. |
| 31 | ACR roles | AcrPull = pull. AcrPush = push. AcrImageSigner = Content Trust signing. |
| 32 | App registration disabled | "Users can register applications" = No. Only Application Developer (or higher) can register. |
| 33 | Managed identity for SQL | System-assigned MI + db_datareader/db_datawriter for least privilege. No password needed. |
| 34 | Bastion across peered VNets | Yes — Bastion in VNET1 can connect to VMs in peered VNET2. |
| 35 | Log Analytics workspace region | Workspace can collect data from VMs in **any region** and any resource group. |

## Part 6: Exam Simulation — 50 Questions (90 Minutes)

**Instructions:** Set a 90-minute timer. Answer all questions without looking at the explanations. Write your answers on a separate sheet. When done, grade yourself using the answer key in Part 7.

**Q1.** You have three Azure subscriptions. You need to deploy a group of policy definitions to all three subscriptions. What should you use?

A. A policy definition assigned to each resource group
B. A policy initiative assigned to each resource group
C. A policy definition assigned to a management group
D. A policy initiative assigned to a management group

**Q2.** Your company has a policy that all VMs must use managed disks. You need to prevent users from creating VMs with unmanaged disks. What should you use?

A. Azure Monitor
B. Azure Policy
C. Microsoft Defender for Cloud
D. Azure Service Health

**Q3.** You assign a DeployIfNotExists policy to auto-install a monitoring extension. The policy requires which of the following on the assignment?

A. A custom RBAC role
B. A managed identity
C. A service principal
D. An access key

**Q4.** You have a Key Vault with an Owner role assigned to User1. User1 tries to read a secret and receives "Access Denied." Why?

A. The Key Vault firewall is blocking access
B. Soft Delete is not enabled
C. Owner grants control plane access only, not data plane access
D. The secret has expired

**Q5.** You need to revoke access for all SAS tokens generated for a storage account. What should you do?

A. Create a new stored access policy
B. Generate new SAS tokens
C. Regenerate the storage account access key that signed the SAS tokens
D. Delete and recreate the storage account

**Q6.** A background service (no user context) needs to read all users from Microsoft Graph. What type of permission should you configure?

A. Delegated permissions with user consent
B. Delegated permissions with admin consent
C. Application permissions with admin consent
D. Application permissions with user consent

**Q7.** You have Azure AD Premium P1. You need to configure user risk and sign-in risk policies using Identity Protection. What should you do first?

A. Enable Azure MFA
B. Create a Conditional Access policy
C. Upgrade to Azure AD Premium P2
D. Configure Named Locations

**Q8.** User1 has an eligible Password Administrator role in PIM. User1 submits an activation request. Can User1 approve their own request?

A. Yes, if they are also a Global Administrator
B. Yes, if MFA is configured
C. No, a user cannot approve their own PIM request
D. Yes, if no other approvers are configured

**Q9.** A Conditional Access policy includes "All Users" and excludes "Break Glass Admins." User1 is in both groups. Is the policy applied to User1?

A. Yes, Include takes priority
B. Yes, both apply and the most restrictive wins
C. No, Exclude takes priority over Include
D. No, the policy is invalid and does not apply

**Q10.** User registration is disabled in your tenant. User1 needs to register an application. What is the least-privilege role you should assign?

A. Global Administrator
B. Cloud Application Administrator
C. Application Administrator
D. Application Developer

**Q11.** You have a VNet with Subnet1 (NSG-A) and Subnet2 (no NSG). VM1 is in Subnet1 with no NIC NSG. VM2 is in Subnet2 with NIC NSG-B. NSG-A has a rule allowing TCP 80 from Internet at priority 100. NSG-B has only default rules. Can Internet HTTP traffic reach VM2?

A. Yes, because VM2 has a public IP
B. Yes, because NIC NSG-B default rules allow VirtualNetwork traffic
C. No, because NSG-B default DenyAllInBound (65500) blocks Internet traffic
D. No, because Subnet2 has no NSG

**Q12.** You need all NICs in ASG1 to be usable in NSG rules. NIC1 is in VNet1/Subnet1, NIC2 is in VNet1/Subnet2, NIC3 is in VNet2/Subnet3. Which NICs can be members of ASG1?

A. NIC1, NIC2, and NIC3
B. NIC1 and NIC2 only
C. NIC1 only
D. NIC2 and NIC3 only

**Q13.** You deploy Azure Firewall. What is the required subnet name?

A. FirewallSubnet
B. AzureFirewallSubnet
C. GatewaySubnet
D. Any custom name

**Q14.** What is the rule processing order in Azure Firewall?

A. Application → Network → DNAT
B. Network → Application → DNAT
C. DNAT → Network → Application
D. DNAT → Application → Network

**Q15.** You configure a VPN Gateway with Active-Active. What are the requirements? (Choose two)

A. Basic SKU
B. VpnGw1 SKU or higher
C. 1 public IP address
D. 2 public IP addresses
E. PolicyBased VPN type

**Q16.** An application needs to connect to Azure SQL Database using a private IP address, accessible from on-premises via ExpressRoute. What should you use?

A. Service Endpoint
B. Private Endpoint
C. VNet peering
D. Azure Firewall

**Q17.** You deploy Azure Bastion in VNET1. VNET1 is peered with VNET2 and VNET3. Can you use Bastion to connect to a VM in VNET2?

A. No, Bastion only works within its own VNet
B. Yes, Bastion works across peered VNets
C. Yes, but only if VNET2 has its own Bastion deployment
D. No, unless you configure a VPN between VNET1 and VNET2

**Q18.** You need to encrypt VM1's OS disk using ADE. VM1 is in West US, Subscription1, RG1. Which Key Vault can you use?

A. KV1: West US, Subscription1, RG2
B. KV2: East US, Subscription1, RG1
C. KV3: West US, Subscription2, RG3
D. Both A and B

**Q19.** Which of the following VMs does NOT support Azure Disk Encryption?

A. Standard_D2s_v3 running Windows Server 2019
B. Basic_A1 running Windows Server 2016
C. Standard_E4s_v3 running Ubuntu 20.04 LTS
D. Standard_B2ms running Red Hat Enterprise Linux 8

**Q20.** You need to allow an App Service app to read and write data in Azure SQL Database with no password and least privilege. What should you configure?

A. SQL authentication with a strong password
B. System-assigned managed identity + db_datareader and db_datawriter roles
C. User-assigned managed identity + db_owner role
D. Service principal + storage account key

**Q21.** What does Transparent Data Encryption (TDE) encrypt?

A. Individual columns selected by the application
B. Network traffic between client and server
C. The entire database file at rest on disk
D. Query results returned to the application

**Q22.** What does Always Encrypted protect?

A. The entire database file at rest
B. Specific columns, with encryption/decryption happening client-side
C. Network traffic using TLS
D. Display of sensitive data in query results

**Q23.** An administrator queries a table with Dynamic Data Masking enabled. They see "XXXX" for the email column. Is the actual data encrypted in the database?

A. Yes, DDM encrypts the data at rest
B. No, DDM only masks the display; data is stored unmasked
C. Yes, DDM uses AES-256 encryption
D. No, DDM deletes the original data after masking

**Q24.** You have an ACR. You need AKS to pull images. What is the least-privilege ACR role?

A. AcrPush
B. AcrPull
C. Contributor
D. AcrImageSigner

**Q25.** You need to store ADE encryption keys. The Key Vault must have which settings enabled? (Choose two)

A. Purge Protection
B. Soft Delete
C. RBAC authorization
D. Premium SKU
E. Managed HSM

**Q26.** A storage account uses CMK (Customer-Managed Keys). The Key Vault must be in the:

A. Same region and same subscription
B. Same region and same tenant
C. Same subscription (any region)
D. Same resource group

**Q27.** You configure immutable storage on a blob container with a time-based retention policy of 90 days. A user tries to delete a blob after 30 days. What happens?

A. The blob is deleted
B. The blob is soft-deleted and recoverable
C. The delete operation is blocked
D. The blob is moved to archive tier

**Q28.** You enable Microsoft Defender for Cloud. Which resource types can be protected? (Choose all that apply)

A. Virtual Machines
B. Storage accounts
C. Key Vaults
D. SQL Databases
E. All of the above

**Q29.** What is the default compliance standard in Defender for Cloud?

A. NIST SP 800-53
B. ISO 27001
C. Microsoft Cloud Security Benchmark (MCSB)
D. PCI DSS

**Q30.** Which cloud providers does Defender for Cloud support for workload protection?

A. Azure, AWS, GCP, and Alibaba
B. Azure, AWS, and GCP
C. Azure and AWS only
D. Azure only

**Q31.** You need to create a workflow automation in Defender for Cloud to send an email when a high-severity alert occurs. What must you create first?

A. An Azure Automation runbook
B. An Azure Function
C. A Logic App
D. A Data Collection Rule

**Q32.** You need to modify the email recipient of an existing workflow automation. Where do you make the change?

A. Defender for Cloud settings
B. Azure Policy
C. Azure Logic Apps Designer
D. Azure Monitor action group

**Q33.** You need to prevent unauthorized applications and malware from running on VMs. Which Defender for Cloud feature should you use?

A. Secure Score
B. Adaptive application controls
C. JIT VM access
D. Regulatory compliance

**Q34.** You have on-premises servers that you want to scan for vulnerabilities using Defender for Cloud. What must you install first?

A. Log Analytics agent
B. Azure Monitor Agent
C. Azure Arc Connected Machine agent
D. Microsoft Monitoring Agent

**Q35.** What type of Sentinel analytics rule should you create if you need to run a custom KQL query every 5 minutes?

A. Fusion
B. Microsoft Security
C. Scheduled
D. NRT

**Q36.** What is the difference between a Scheduled and an NRT analytics rule in Sentinel?

A. Scheduled uses KQL; NRT uses machine learning
B. Scheduled runs on a custom schedule; NRT runs approximately every 1 minute
C. Scheduled creates alerts; NRT creates incidents
D. There is no difference

**Q37.** You need to ingest CEF logs from a third-party firewall into Sentinel. What infrastructure do you need?

A. Azure Event Hub
B. Azure Event Grid
C. Log Analytics agent on a Linux VM as syslog forwarder
D. Azure Function with Event Grid trigger

**Q38.** You need to configure Sentinel notebooks for advanced threat hunting. What is the minimum number of Azure Machine Learning workspaces required?

A. 0
B. 1
C. 2
D. 3

**Q39.** During a threat hunting investigation in Sentinel, you find a suspicious log event. You need to annotate it for your team. What should you use?

A. Workbook
B. Watchlist
C. Bookmark
D. Comment

**Q40.** You have Log Analytics workspaces in East US and West Europe. Sentinel is deployed in the East US workspace. You have VMs connected to both workspaces. Which VMs can Sentinel monitor?

A. Only VMs connected to the East US workspace
B. Only VMs in the East US region
C. VMs connected to either workspace
D. No VMs until you deploy Sentinel in both workspaces

**Q41.** You create an alert rule in Sentinel. When a threat is detected, an incident must be created AND a ticket must be logged in ServiceNow. Which components do you need?

A. Analytics rule + Workbook
B. Analytics rule + Playbook
C. Data connector + Workbook
D. Fusion rule + Analytics rule

**Q42.** A resource group has a **Read-only** lock. Which operations can you perform? (Choose all that apply)

A. Read a VM's properties
B. Start a VM
C. Stop a VM
D. Delete a VM
E. None of B, C, or D

**Q43.** You need to enforce the same role assignments and policies across multiple new subscriptions. What should you use?

A. ARM templates
B. Azure Blueprints
C. Azure Policy only
D. Management groups only

**Q44.** You configure diagnostic settings for an Azure SQL Database. You need to query the logs using KQL and retain them for 2 years. Where should you send the logs?

A. Storage account
B. Event Hub
C. Log Analytics workspace
D. Azure Cosmos DB

**Q45.** What does the Azure Monitor action group define?

A. Which logs to collect
B. When an alert fires
C. Who receives the alert and what actions to take
D. How long to retain logs

**Q46.** You need to collect Windows Security events from 50 VMs and send them to a Log Analytics workspace. What should you configure?

A. Diagnostic settings on each VM
B. A Data Collection Rule (DCR)
C. An Azure Policy with Audit effect
D. An Event Hub

**Q47.** You have a PIM eligible assignment for the Contributor role. The activation setting requires MFA and has a maximum duration of 4 hours. User1 activates the role at 9:00 AM. At what time does the role automatically deactivate?

A. 9:00 AM the next day
B. 1:00 PM (after 4 hours)
C. Never, it stays active
D. 5:00 PM (after 8 hours)

**Q48.** You have Azure AD Connect configured with Express Settings. Which two roles are required for the initial setup?

A. Global Administrator + Domain Admins
B. Global Administrator + Enterprise Admins
C. Cloud Application Administrator + Enterprise Admins
D. User Administrator + Schema Admins

**Q49.** You need to ensure that Azure AD Connect passes authentication to on-premises Active Directory so that on-premises password policies apply. Users should have SSO. What should you configure?

A. Password Hash Synchronization + Seamless SSO
B. Pass-Through Authentication + Seamless SSO
C. AD FS
D. Certificate-based authentication

**Q50.** You create a custom RBAC role at the contoso.com tenant level. Where can this role be assigned?

A. Only in the contoso.com tenant
B. In contoso.com and any linked tenants
C. In any Azure subscription worldwide
D. Only at the management group level

## Part 7: Answer Key and Explanations

Grade your answers, then review every wrong answer carefully.

| # | Answer | Explanation |
|---|--------|-------------|
| **Q1** | **D** | "Group of policies" = initiative. "All three subscriptions" = management group scope. |
| **Q2** | **B** | Azure Policy with Deny effect prevents creation. Monitor alerts but does not prevent. Defender recommends but does not block. |
| **Q3** | **B** | DeployIfNotExists and Modify require a **managed identity** on the assignment to create/change resources. |
| **Q4** | **C** | Owner = control plane (manage vault settings). To read secrets, you need a data plane role (Key Vault Secrets User) or an access policy. |
| **Q5** | **C** | Regenerating the access key invalidates ALL SAS tokens signed with that key. New SAS tokens or new policies do NOT revoke existing SAS. |
| **Q6** | **C** | No user context = application permissions. Application permissions require admin consent (no user to consent). |
| **Q7** | **C** | Identity Protection risk policies require Azure AD Premium P2. P1 is not sufficient. |
| **Q8** | **C** | A user cannot approve their own PIM activation request, regardless of other roles. |
| **Q9** | **C** | Exclude always takes priority over Include in Conditional Access. |
| **Q10** | **D** | Application Developer is the least-privilege role for registering apps when self-service registration is disabled. |
| **Q11** | **C** | Subnet2 has no NSG, so no subnet-level filtering. NIC NSG-B has only default rules. The default DenyAllInBound (65500) blocks Internet traffic because there is no explicit Allow rule for Internet/TCP 80. |
| **Q12** | **B** | ASG members must be in the same VNet. NIC1 and NIC2 are in VNet1 (different subnets OK). NIC3 is in VNet2. |
| **Q13** | **B** | Azure Firewall requires the subnet to be named **AzureFirewallSubnet**. |
| **Q14** | **C** | DNAT → Network → Application. DNAT processes inbound NAT first, then network rules, then application (FQDN) rules. |
| **Q15** | **B, D** | Active-Active needs VpnGw1+ (not Basic) and 2 public IPs. |
| **Q16** | **B** | Private Endpoint gives a private IP in your VNet, accessible from on-premises via ExpressRoute/VPN. Service Endpoint uses public IP and is not accessible from on-premises. |
| **Q17** | **B** | Bastion works across peered VNets. No separate Bastion deployment needed in VNET2. |
| **Q18** | **A** | ADE requires Key Vault in same region (West US) + same subscription (Sub1). Resource group does not matter, so RG2 is fine. KV2 fails region. KV3 fails subscription. |
| **Q19** | **B** | Basic-tier VMs do not support ADE. Standard-tier VMs with supported OS versions are fine. |
| **Q20** | **B** | System-assigned managed identity = no password. db_datareader + db_datawriter = least privilege for read/write. db_owner is overprivileged. |
| **Q21** | **C** | TDE encrypts the entire database file at rest on disk. It is transparent to the application. |
| **Q22** | **B** | Always Encrypted protects specific columns. Encryption and decryption happen on the client side; the server never sees plaintext. |
| **Q23** | **B** | DDM only masks the display of data. The actual data is stored unmasked in the database. It is NOT encryption. |
| **Q24** | **B** | AcrPull is the least-privilege role for pulling images from ACR. |
| **Q25** | **A, B** | ADE requires Key Vault with Soft Delete and Purge Protection enabled. RBAC, Premium SKU, and Managed HSM are not required. |
| **Q26** | **B** | Storage CMK (BYOK) requires Key Vault in same region + same tenant. Different subscription is allowed. |
| **Q27** | **C** | Immutable storage with time-based retention blocks deletion until the retention period expires. 30 days < 90 days, so delete is blocked. |
| **Q28** | **E** | Defender for Cloud protects VMs (Servers), Storage, Key Vault, SQL, Containers, App Service, and Resource Manager. All listed resources are covered. |
| **Q29** | **C** | MCSB is the default standard. Additional standards (NIST, ISO, PCI, SOC) can be added. |
| **Q30** | **B** | Azure, AWS, and GCP. Alibaba is NOT supported. |
| **Q31** | **C** | Workflow automation = Logic App. The Logic App must be created first. |
| **Q32** | **C** | Email recipient is configured inside the Logic App. Modify it in Azure Logic Apps Designer. |
| **Q33** | **B** | Adaptive application controls use ML-based whitelisting to block unauthorized apps and malware. |
| **Q34** | **C** | On-premises servers need Azure Arc Connected Machine agent first to be onboarded to Defender for Cloud. |
| **Q35** | **C** | Scheduled rules run custom KQL queries on a user-defined schedule (e.g. every 5 min). Fusion does not support custom KQL. |
| **Q36** | **B** | Both use KQL. Scheduled runs on a custom schedule. NRT runs approximately every 1 minute for faster detection. |
| **Q37** | **C** | CEF ingestion needs a Log Analytics agent on a Linux VM acting as a syslog forwarder. NOT Event Hub, Event Grid, or Azure Functions. |
| **Q38** | **B** | Sentinel notebooks require 1 Azure ML workspace. 0 container registries. |
| **Q39** | **C** | Bookmarks let you save and annotate log events during threat hunting investigations. |
| **Q40** | **C** | Sentinel can monitor VMs from ANY workspace, not just the one Sentinel is deployed on. |
| **Q41** | **B** | Analytics rule detects threat and creates incident. Playbook (Logic App) automates the response (create ServiceNow ticket). |
| **Q42** | **A, E** | Read-only lock blocks ALL write operations (start, stop, delete, modify). Only read operations are allowed. |
| **Q43** | **B** | Azure Blueprints can deploy role assignments + policies + ARM templates as a package across subscriptions. |
| **Q44** | **C** | Log Analytics workspace supports KQL queries. Max retention 730 days (2 years). Storage supports archival but not KQL. |
| **Q45** | **C** | Action group defines notification recipients (email, SMS) and actions (webhook, Logic App, Function) when an alert fires. |
| **Q46** | **B** | Data Collection Rules (DCRs) define what data to collect from VMs. Associate one DCR with multiple VMs. |
| **Q47** | **B** | Maximum duration is 4 hours. Activated at 9:00 AM → deactivates at 1:00 PM. |
| **Q48** | **B** | Express Settings require Global Administrator (Azure AD) + Enterprise Admins (on-prem AD). |
| **Q49** | **B** | Pass-Through Authentication validates against on-prem AD, so on-prem password policies apply. PHS copies password hashes to Azure AD (on-prem policies do NOT apply at sign-in). |
| **Q50** | **A** | Azure AD custom roles at tenant level apply only within that tenant. |

## Part 8: Scoring and Next Steps

**Calculate your score:**

| Score | Assessment | Action |
|-------|-----------|--------|
| **45–50** (90–100%) | Exam ready. Excellent preparation. | Light review of any wrong answers. Take the exam with confidence. |
| **40–44** (80–89%) | Strong. A few weak spots. | Re-study the specific topics you missed. Focus on the exam traps table (Part 5). |
| **35–39** (70–79%) | Borderline pass. Needs targeted review. | Go back to the relevant Day material for each wrong answer. Re-do the worked examples. |
| **30–34** (60–69%) | Below passing. Significant gaps. | Spend an extra day reviewing Days 3–6 material. Focus on the 35 exam traps. |
| **Below 30** (<60%) | Not ready. Major gaps. | Review Days 1–6 material systematically. Complete all labs again. |

**Track your wrong answers by domain:**

| Domain | Questions | Your wrong answers | Review which Day |
|--------|-----------|-------------------|-----------------|
| Identity & Access (15–20%) | Q1, Q4, Q6, Q7, Q8, Q9, Q10, Q47, Q48, Q49, Q50 | _________________ | Days 1–2 |
| Network Security (20–25%) | Q11, Q12, Q13, Q14, Q15, Q16, Q17 | _________________ | Days 3–4 |
| Compute, Storage, DB (20–25%) | Q5, Q18, Q19, Q20, Q21, Q22, Q23, Q24, Q25, Q26, Q27 | _________________ | Day 5 |
| Security Operations (30–35%) | Q2, Q3, Q28, Q29, Q30, Q31, Q32, Q33, Q34, Q35, Q36, Q37, Q38, Q39, Q40, Q41, Q42, Q43, Q44, Q45, Q46 | _________________ | Day 6 |

## Part 9: Master Quick-Reference Card (All Days Combined)

### Identity & Access

| Fact | Value |
|------|-------|
| Owner vs. Contributor | Owner can assign roles; Contributor cannot |
| User Access Administrator | Can assign roles but NOT manage resources |
| PIM license | Azure AD Premium P2 |
| PIM self-approval | Not allowed |
| Identity Protection | Requires P2 |
| Conditional Access exclude | Takes priority over Include |
| Delegated permissions | App acts on behalf of user |
| Application permissions | App runs as service; admin consent required |
| System-assigned MI | 1:1 with resource; deleted when resource deleted |
| User-assigned MI | Independent; shared across resources |
| App Developer role | Least privilege for app registration when disabled |

### Network Security

| Fact | Value |
|------|-------|
| NSG inbound evaluation | Subnet NSG → NIC NSG (both must allow) |
| NSG default deny | DenyAllInBound at priority 65500 |
| ASG scope | Same VNet only |
| Azure Firewall subnet | AzureFirewallSubnet (/26+) |
| Firewall rule order | DNAT → Network → Application |
| VPN Active-Active | VpnGw1+ SKU, 2 public IPs |
| PolicyBased VPN | 1 S2S tunnel only |
| Service Endpoint | Public IP, backbone, no on-prem |
| Private Endpoint | Private IP, DNS change, on-prem OK |
| Bastion subnet | AzureBastionSubnet (/26+); works across peered VNets |
| DDoS Standard | Per-VNet, adaptive tuning, cost protection |
| UDR | Longest prefix match; identical prefixes not allowed |

### Compute, Storage, Database

| Fact | Value |
|------|-------|
| ADE Key Vault | Same region + same subscription; RG does not matter |
| ADE unsupported | Basic-tier VMs, daily-build Linux |
| Storage BYOK Key Vault | Same region + same tenant; different sub OK |
| SAS revocation | Regenerate the access key |
| TDE | Entire DB on disk; server-side; transparent |
| Always Encrypted | Specific columns; client-side; app has key |
| DDM | Masks display only; NOT encryption |
| ACR roles | AcrPull, AcrPush, AcrImageSigner |
| Immutable storage | WORM; blocks delete until retention expires |
| Managed identity for SQL | System-assigned MI + db_datareader/db_datawriter |

### Security Operations

| Fact | Value |
|------|-------|
| Policy initiative | Group of policy definitions |
| DeployIfNotExists / Modify | Need managed identity |
| Multi-sub policy | Initiative + management group scope |
| KV Owner/Contributor | Control plane only; no data access |
| KV access models | Vault access policy (legacy) or Azure RBAC (recommended) |
| KV backup restore | Same Azure geography only |
| Defender multi-cloud | AWS + GCP yes; Alibaba NO |
| Default compliance | MCSB |
| EASM | External attack surface: IPs, ASNs, hostnames, SSL |
| Workflow automation | Logic App first; Logic App Contributor to modify |
| Adaptive app controls | ML-based whitelisting; blocks unauthorized apps |
| Sentinel pipeline | Data connector → Analytics rule → Incident → Playbook |
| Fusion rule | ML; not customizable |
| Scheduled rule | Custom KQL; user-defined schedule |
| NRT rule | Custom KQL; every ~1 minute |
| CEF ingestion | Log Analytics agent on Linux VM (syslog forwarder) |
| Sentinel tables | SecurityAlert, CommonSecurityLog, AzureDiagnostics, SecurityEvent |
| Sentinel notebooks | 1 ML workspace; 0 container registries |
| Sentinel VMs | Any workspace, not just Sentinel's |
| Playbook | = Logic App with Sentinel trigger |
| Bookmark | Annotate events during investigation |
| DCR | Defines data collection; works with Azure Monitor Agent |
| Log Analytics retention | Max 730 days (2 years) |
| Action group | Defines alert recipients and actions |
| Read-only lock | Blocks ALL writes (including VM start/stop) |
| Azure Blueprints | Package: roles + policies + ARM templates |


## Part 10: Final Exam Day Tips

1. **Time management:** AZ-500 has 40–60 questions in approximately 150 minutes. That is roughly 2.5–3.5 minutes per question. Do not spend more than 4 minutes on any single question — flag it and move on.

2. **Read every word:** Many questions hinge on a single word ("minimum," "least privilege," "first," "prevent"). Identify the key verb before choosing.

3. **Eliminate wrong answers:** If you are unsure, eliminate options you know are wrong. With 4 choices, eliminating 2 gives you 50/50.

4. **Scenario-based questions:** Read the entire scenario before looking at the answer options. The scenario often contains constraints that eliminate options (region, subscription, SKU, license tier).

5. **"What should you do first?":** These questions test prerequisite knowledge. Think about dependencies — what must exist before the next step can happen.

6. **Case studies:** Case studies have 4–7 sub-questions. Read the full case study once, then answer questions. You can go back to the case study text while answering.

7. **No penalty for guessing:** Answer every question. There is no penalty for wrong answers.

## Part 11: AZ-500 Glossary — Terms, Abbreviations & Cheatsheet

This glossary covers every term and abbreviation you may encounter on the AZ-500 exam. Use it as a quick lookup before and on exam day.

### A

**ACL (Access Control List)** — a list of rules that define who can access a resource and what operations they can perform. In Azure, NSGs and Key Vault access policies are forms of ACLs.

**ACR (Azure Container Registry)** — a managed Docker registry for storing, building, and managing container images. Roles: AcrPull (download images), AcrPush (upload images), AcrImageSigner (sign images for Content Trust).

**ADE (Azure Disk Encryption)** — encrypts VM OS and data disks using BitLocker (Windows) or DM-Crypt (Linux). Keys stored in Key Vault. Requirements: Key Vault in same region + same subscription as the VM.

**AKS (Azure Kubernetes Service)** — managed Kubernetes cluster for running containerized applications. Integrates with ACR (AcrPull role) and Azure AD (for RBAC-based cluster access).

**AMA (Azure Monitor Agent)** — the modern agent for collecting logs and metrics from VMs. Replaces the legacy MMA/Log Analytics agent. Configured through Data Collection Rules (DCRs).

**ARM (Azure Resource Manager)** — the deployment and management layer for Azure. All Azure Portal operations, CLI commands, and API calls go through ARM. ARM templates are JSON files that define infrastructure as code.

**ASG (Application Security Group)** — a logical grouping of VM NICs that you reference in NSG rules instead of individual IP addresses. All NICs in an ASG must be in the same VNet.

**ASN (Autonomous System Number)** — a unique number identifying a network on the Internet. Used by BGP routing and discovered by Defender EASM.

### B

**Bastion** — a managed PaaS service for secure RDP/SSH access to VMs through the Azure Portal over HTTPS (port 443). Eliminates the need for public IPs on VMs. Deployed in AzureBastionSubnet (/26+). Works across peered VNets.

**BGP (Border Gateway Protocol)** — a routing protocol used for dynamic route exchange between Azure VPN Gateway and on-premises networks. Requires RouteBased VPN type and VpnGw1+ SKU.

**BYOK (Bring Your Own Key)** — using your own encryption key (stored in Key Vault) to encrypt Azure services like Storage. Key Vault must be in the same region + same tenant as the service.

### C

**CA (Conditional Access)** — Microsoft Entra ID's policy engine that makes real-time access decisions based on conditions (user, location, device, risk level). Exclude takes priority over Include.

**CEF (Common Event Format)** — a standardized log format used by third-party security devices (firewalls, IDS/IPS). Ingested into Sentinel via a Log Analytics agent on a Linux VM acting as a syslog forwarder. Stored in CommonSecurityLog table.

**CMK (Customer-Managed Key)** — an encryption key you manage in Key Vault, used to encrypt Azure services instead of the default Microsoft-managed key. Same as BYOK.

**CSPM (Cloud Security Posture Management)** — the assessment capability of Defender for Cloud. Evaluates your environment against security benchmarks, provides Secure Score and recommendations.

**CWPP (Cloud Workload Protection Platform)** — the protection capability of Defender for Cloud. Provides threat detection, vulnerability scanning, and alerts for specific workloads (Servers, SQL, Storage, Containers, Key Vault, etc.).

### D

**DCR (Data Collection Rule)** — defines what data (event logs, performance counters, syslog) to collect from VMs and where to send it (Log Analytics workspace). Works with Azure Monitor Agent (AMA).

**DDM (Dynamic Data Masking)** — a SQL feature that masks the display of sensitive data in query results (e.g. shows "XXXX" for credit card numbers). NOT encryption — the data is stored unmasked. Users with UNMASK permission see real data.

**DDoS (Distributed Denial of Service)** — an attack that floods a service with traffic to make it unavailable. Azure DDoS Basic is free/automatic. DDoS Standard is paid, per-VNet, with adaptive tuning and cost protection.

**DNAT (Destination NAT)** — translates a public IP:port to a private IP:port. Used in Azure Firewall to forward inbound traffic to internal resources. Processed before Network and Application rules.

**DRR (DDoS Rapid Response)** — a dedicated Microsoft team that assists during active DDoS attacks. Available only with DDoS Standard tier.

### E

**EASM (External Attack Surface Management)** — a Defender for Cloud feature that discovers your organization's Internet-facing assets (IPs, hostnames, domains, SSL certificates) by scanning the Internet.

**ExpressRoute** — a private, dedicated connection between your on-premises network and Azure. Does NOT encrypt traffic by default. Use MACsec (on Direct circuits) or IPsec over ExpressRoute for encryption.

### F

**FQDN (Fully Qualified Domain Name)** — a complete domain name (e.g. storage1.blob.core.windows.net). Azure Firewall Application rules can filter by FQDN (Layer 7).

**Fusion** — a Sentinel analytics rule type that uses Microsoft's ML engine to correlate low-fidelity alerts from multiple products into high-fidelity incidents. Not customizable.

### I

**Initiative** — a group of Azure Policy definitions bundled together for assignment as a single unit. Also called a "policy set." Used when you need to enforce multiple related policies at once.

### J

**JIT (Just-In-Time) VM Access** — a Defender for Cloud feature that keeps management ports (RDP/SSH) closed and opens them temporarily on request. Creates temporary NSG rules for a specific IP and duration.

### K

**KQL (Kusto Query Language)** — the query language used in Log Analytics, Azure Monitor, and Microsoft Sentinel. Similar to SQL but optimized for log analytics. Used in Sentinel Scheduled and NRT analytics rules.

**Key Vault** — a managed service for storing secrets (passwords, connection strings), keys (encryption keys), and certificates. Two access models: vault access policies (legacy) or Azure RBAC (recommended). Owner/Contributor roles do NOT give data-plane access.

### L

**Local Network Gateway** — an Azure resource that represents your on-premises VPN device. Specifies the on-prem public IP and address space. Required for S2S VPN connections.

**Logic App** — a serverless workflow service for automating tasks. In the security context, Logic Apps serve as playbooks for Sentinel and workflow automations for Defender for Cloud. Must be created before referencing in automation rules.

### M

**MACsec (Media Access Control Security)** — Layer 2 encryption for ExpressRoute Direct circuits. Encrypts traffic between your router and Microsoft's edge routers.

**MCSB (Microsoft Cloud Security Benchmark)** — the default compliance standard in Defender for Cloud. Microsoft's own security best practices for Azure. Always present; additional standards (NIST, ISO, SOC, PCI) can be added.

**MI (Managed Identity)** — an Azure AD identity automatically managed by Azure. Eliminates credential management. System-assigned (1:1 with resource, deleted with resource) or User-assigned (independent, shared across resources).

**MMA (Microsoft Monitoring Agent)** — the legacy Log Analytics agent. Being deprecated in favor of Azure Monitor Agent (AMA). Still referenced in exam dumps for CEF ingestion and older configurations.

### N

**NRT (Near-Real-Time)** — a Sentinel analytics rule type that runs a custom KQL query approximately every 1 minute. Faster than Scheduled rules but higher cost.

**NSG (Network Security Group)** — a Layer 3/4 firewall that filters traffic by IP, port, and protocol. Attached to subnets or NICs. Rules evaluated by priority (lowest number = highest priority). Default DenyAllInBound at priority 65500.

**NVA (Network Virtual Appliance)** — a third-party firewall or network device running as a VM in Azure (e.g. Palo Alto, Fortinet). Traffic is routed through it using UDRs.

### P

**PIM (Privileged Identity Management)** — provides just-in-time, time-limited access to privileged roles. Users have eligible assignments and must activate when needed. Requires Azure AD Premium P2.

**Private DNS Zone** — a DNS zone hosted in Azure that resolves names within VNets. Used with Private Endpoints to resolve service FQDNs to private IPs (e.g. privatelink.blob.core.windows.net).

**Private Endpoint** — a NIC with a private IP in your VNet that connects to an Azure PaaS service. Requires Private DNS zone. Accessible from on-premises via VPN/ExpressRoute. Costs per-hour + per-GB.

**Purge Protection** — a Key Vault setting that prevents permanent deletion (purging) of soft-deleted items until the retention period expires. Not even an Owner can purge. Required for BYOK storage encryption.

### R

**RBAC (Role-Based Access Control)** — Azure's authorization system. Assigns roles (collections of permissions) to users/groups/service principals at a specific scope (management group, subscription, resource group, resource).

### S

**SAS (Shared Access Signature)** — a token that grants limited, time-scoped access to Azure Storage resources. Three types: Account SAS, Service SAS, User Delegation SAS (Azure AD, most secure). Revoke by regenerating the signing access key.

**Secure Score** — a percentage (0–100%) in Defender for Cloud representing your security posture. Based on how many security recommendations you have implemented. Calculated per subscription.

**Service Endpoint** — routes traffic from a VNet subnet to an Azure PaaS service over the Microsoft backbone. The service still uses its public IP. Free. NOT accessible from on-premises.

**Service Principal** — the identity object an application uses to authenticate and access Azure resources. Created automatically when you register an app in Azure AD.

**Service Tag** — a predefined label representing a group of Azure IP addresses (e.g. Internet, VirtualNetwork, Storage, Sql). Used in NSG and Firewall rules instead of individual IPs.

**SIEM (Security Information and Event Management)** — a platform that collects, correlates, and analyzes security data from across an environment. Microsoft Sentinel is Azure's cloud-native SIEM.

**SOAR (Security Orchestration, Automated Response)** — a platform that automates security operations (incident response, threat remediation). Sentinel provides SOAR through playbooks (Logic Apps).

**Soft Delete** — a recovery feature. When you delete an item (Key Vault secret, storage blob), it is not permanently removed. It enters a "deleted" state and can be recovered within a retention period.

**S2S VPN (Site-to-Site VPN)** — an encrypted IPsec tunnel between your on-premises network and an Azure VNet. Requires a VPN Gateway in Azure and a Local Network Gateway representing on-prem.

### T

**TDE (Transparent Data Encryption)** — encrypts an entire Azure SQL database file at rest. Server-side, transparent to the application. Protects against stolen disks/backups. Does NOT protect individual columns or data in transit.

**TLS (Transport Layer Security)** — encrypts data in transit between client and server. Azure services support TLS 1.2 (minimum recommended). App Service: configure "Minimum TLS version" and "HTTPS Only."

### U

**UDR (User-Defined Route)** — a custom route in a route table that overrides Azure's default system routes. Used to force traffic through an NVA, blackhole traffic, or direct it to a VPN gateway.

### V

**VNet (Virtual Network)** — an isolated network in Azure. Contains subnets, NSGs, route tables. Resources in a VNet can communicate with each other by default.

**VNet Peering** — connects two VNets so resources can communicate across them. Regional (same region) or Global (different regions). Traffic stays on the Microsoft backbone. Non-transitive — if VNet-A peers with VNet-B, and VNet-B peers with VNet-C, VNet-A cannot reach VNet-C unless also peered directly.

**VPN Gateway** — a managed gateway for encrypted connections between Azure VNets and on-premises networks. PolicyBased (1 tunnel) or RouteBased (multiple tunnels). Active-Active requires VpnGw1+ SKU and 2 public IPs.

### W

**WAF (Web Application Firewall)** — a Layer 7 firewall that protects web applications from attacks (SQL injection, XSS). Deployed on Application Gateway (regional) or Front Door (global). Detection mode (log only) or Prevention mode (block).

**WORM (Write Once, Read Many)** — an immutable storage policy. Data can be written once and read many times, but not modified or deleted until the retention period expires.

### Key Comparisons Cheatsheet

| What | vs. What | Key Difference |
|------|---------|---------------|
| Owner | Contributor | Owner can assign roles; Contributor cannot |
| Owner | User Access Admin | Owner manages resources + access; UAA manages access only |
| Eligible (PIM) | Active (PIM) | Eligible must activate first; Active is always on |
| Delegated permissions | Application permissions | Delegated = user context; Application = service/daemon, admin consent |
| System-assigned MI | User-assigned MI | System = 1:1, deleted with resource; User = independent, shareable |
| NSG | Azure Firewall | NSG = L3/L4; Firewall = L3/L4/L7 + FQDN |
| ASG | NSG | ASG = grouping tool; NSG = the actual firewall with rules |
| Service Endpoint | Private Endpoint | SE = public IP, free, no on-prem; PE = private IP, paid, on-prem OK |
| PolicyBased VPN | RouteBased VPN | Policy = 1 tunnel; Route = multiple tunnels, Active-Active, BGP |
| TDE | Always Encrypted | TDE = entire DB, server-side; AE = columns, client-side |
| DDM | Always Encrypted | DDM = display mask only, not encryption; AE = real encryption |
| ADE Key Vault | BYOK Key Vault | ADE = same region + same subscription; BYOK = same region + same tenant |
| Soft Delete | Purge Protection | Soft Delete = recoverable; Purge Protection = cannot permanently delete early |
| Deny (policy) | Audit (policy) | Deny blocks creation; Audit only logs non-compliance |
| DeployIfNotExists | Modify | DINE deploys related resource; Modify changes properties on the resource |
| Fusion rule | Scheduled rule | Fusion = ML, no custom KQL; Scheduled = your KQL, your schedule |
| NRT rule | Scheduled rule | NRT runs every ~1 min; Scheduled runs on your defined schedule |
| Playbook | Workbook | Playbook = automated response (Logic App); Workbook = visualization dashboard |
| Bookmark | Watchlist | Bookmark = annotated event during hunting; Watchlist = reference data (IP lists, user lists) |
| CSPM | CWPP | CSPM = posture assessment (Secure Score); CWPP = threat protection (alerts, scanning) |
| DDoS Basic | DDoS Standard | Basic = free, platform; Standard = paid, adaptive, cost protection |
| Read-only lock | Delete lock | Read-only blocks ALL writes (including start/stop); Delete blocks only deletion |
| Log Analytics | Storage account | Log Analytics supports KQL queries; Storage is for archival only |
| Action group | Alert rule | Alert rule defines when to fire; Action group defines who gets notified |

**Your 7-day preparation is complete.** Review any weak areas identified in the exam simulation, ensure all 11 labs are done, and take the exam with confidence. The AZ-500 passing score is approximately 700/1000.
