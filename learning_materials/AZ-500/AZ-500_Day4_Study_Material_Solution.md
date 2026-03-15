# AZ-500 Exam Preparation: Day 4 — Networking Security (Part 2): Private Endpoints, Service Endpoints, WAF, DDoS, Storage

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 4 of your 7-day AZ-500 preparation. Today you continue **Networking Security** (still part of the 20–25% exam weight). Day 3 covered NSGs, ASGs, Azure Firewall, and UDRs. Today you focus on **private access** to Azure resources (Service Endpoints, Private Endpoints, Private DNS zones), **public access** security (WAF, DDoS, Application Gateway, Front Door), and **storage security** (firewall rules, SAS, immutable storage). You will complete LAB 06 and work through exam-style questions with full context.

## Day 4 Official Resources

| Resource | Description | Link |
|----------|-------------|------|
| MS Learn Module 1 | Private access: Service Endpoints, Private Endpoints, Private Link, Private DNS zones, App Service VNet integration, ASE, SQL MI. | [Plan and implement security for private access to Azure resources](https://learn.microsoft.com/en-us/training/modules/security-private-access-azure-resources/) |
| MS Learn Module 2 | Public access: TLS, Azure Firewall Manager, Application Gateway, Front Door, WAF, DDoS Protection. | [Plan and implement security for public access to Azure resources](https://learn.microsoft.com/en-us/training/modules/security-public-access-azure-resources/) |
| Learning Path 2 (full) | The complete "Protect network infrastructure in Azure" path. | [Learning Path 2](https://learn.microsoft.com/en-us/training/paths/implement-platform-protection/) |
| Exam Readiness Video | Microsoft's exam prep for the networking section (covers Day 3 and Day 4 topics). | [Part 2 of 4: Secure networking](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-02-fy25) |
| LAB 06 | Hands-on: storage firewall, Service Endpoints, SAS tokens, blob access levels. ~45 min. | [LAB 06 — Service Endpoints and Securing Storage](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_06_SecuringAzureStorage.html) |
| Lab files (ZIP) | Download all lab instructions and ARM templates. | [Download ZIP](https://github.com/MicrosoftLearning/AZ500-AzureSecurityTechnologies/archive/master.zip) |

**Recommended schedule for today (4–6 hours):**
Block 1 (1.5–2 h): Read this guide + complete both MS Learn modules.
Block 2 (1 h): LAB 06.
Block 3 (1–1.5 h): Work through the exam-style questions embedded in this guide.

## Part 1: Service Endpoints vs. Private Endpoints — The Critical Distinction

Both technologies restrict access to Azure PaaS services (Storage, SQL, Key Vault, etc.), but they work differently. The exam tests whether you understand when to use each.

### Service Endpoints

A **Service Endpoint** extends your VNet's private address space to an Azure service over the **Microsoft backbone**. Traffic from a subnet with a Service Endpoint to that service (e.g. Azure Storage) stays on the Azure network — it never goes over the public internet. However:

- The **resource keeps its public IP**. You still connect using the service's public hostname (e.g. `storage1.blob.core.windows.net`).
- **No DNS changes** — the hostname resolves to the same public IP; routing is handled at the network layer.
- Access is controlled by the **resource's firewall** — you add a VNet rule that allows traffic from the subnet. The subnet must have the Service Endpoint enabled for that service.
- **Both conditions are required:** (1) the subnet has the Service Endpoint enabled, and (2) the resource firewall includes that subnet in the allowed list.

### Private Endpoints

A **Private Endpoint** gives the resource a **private IP address** in your VNet. You connect using that private IP — the resource is effectively inside your network.

- The resource gets a **private IP** in a subnet you choose.
- **Private DNS zone required** — otherwise the hostname still resolves to the public IP. You create a Private DNS zone (e.g. `privatelink.blob.core.windows.net`) and link it to your VNet so that `storage1.blob.core.windows.net` resolves to the private IP.
- Access from **VNet, peered VNets, and on-premises** (via VPN/ExpressRoute) — all use the private IP.
- **Cost** — Private Endpoints are billed per endpoint; Service Endpoints are free.

### Comparison Table

| Feature | Service Endpoint | Private Endpoint |
|---------|-----------------|------------------|
| Resource IP | Keeps public IP | Gets private IP in your VNet |
| Traffic path | Azure backbone (no internet) | Private connection via Private Link |
| DNS | No changes | Requires Private DNS zone |
| Access from | VNet only (subnet with SE) | VNet, peered VNets, on-premises |
| Cost | Free | Charged per endpoint |
| Firewall rule | Subnet in allowed list | Optional; private IP bypasses public access |

> 🚨 **Exam trap:** For storage firewall with "Selected networks": a subnet must have **both** (1) Service Endpoint for Storage enabled on the subnet, and (2) the subnet added to the storage account's allowed virtual networks. If only one is configured, access is denied. Public IP access is independent — if the client's IP is in the allowed IP range, access is granted regardless of VNet rules.

> 📝 **Worked example (exam-style question — Storage firewall with Service Endpoints):**
>
> *Scenario:* Storage account **storage1** has firewall set to "Allow access from Selected networks."
>
> **Storage1 firewall configuration:**
> - Allowed virtual networks: **VNET3\Subnet3**
> - Allowed IP ranges: **52.233.129.0/24**
>
> **VMs and their configuration:**
>
> | VM | VNet | Subnet | Service Endpoint for Storage | Public IP |
> |----|------|--------|------------------------------|-----------|
> | VM1 | VNET1 | Subnet1 | Yes | 203.0.113.10 |
> | VM2 | VNET2 | Subnet2 | No | 52.233.129.50 |
> | VM3 | VNET3 | Subnet3 | No | 10.0.1.5 (private only) |
>
> For each statement, select Yes if true, otherwise No:
>
> | Statement | Answer | Reasoning |
> |-----------|--------|-----------|
> | VM1 can access storage1. | **No** | VNET1\Subnet1 is NOT in the allowed virtual networks list. VM1's public IP (203.0.113.10) is NOT in 52.233.129.0/24. Neither VNet rule nor IP rule allows access. |
> | VM2 can access storage1. | **Yes** | VM2's public IP (52.233.129.50) is in the allowed range 52.233.129.0/24. Public IP access works independently of VNet rules. |
> | VM3 can access storage1. | **No** | VNET3\Subnet3 IS in the allowed virtual networks, but Subnet3 does NOT have a Service Endpoint for Storage. For VNet rules to work, the subnet must have the Service Endpoint enabled. Without it, the VNet rule does not apply. |
>
> **Key takeaway:** VNet rules require **both** conditions: (1) subnet in allowed list, and (2) Service Endpoint enabled on that subnet. Public IP rules work alone — if the IP is allowed, access is granted.

## Part 2: Private DNS Zones — Names to Memorize

When you create a Private Endpoint for an Azure service, you must configure DNS so the hostname resolves to the private IP. Azure provides **Private DNS zones** for each service. You create the zone, add an A record for your resource, and link the zone to your VNet.

| Azure Service | Private DNS Zone Name |
|---------------|----------------------|
| Blob Storage | `privatelink.blob.core.windows.net` |
| File Storage | `privatelink.file.core.windows.net` |
| Queue Storage | `privatelink.queue.core.windows.net` |
| Table Storage | `privatelink.table.core.windows.net` |
| Azure SQL Database | `privatelink.database.windows.net` |
| Azure Cosmos DB | `privatelink.documents.azure.com` |
| Azure Key Vault | `privatelink.vaultcore.azure.net` |
| Web App (App Service) | `privatelink.azurewebsites.net` |

> 🚨 **Exam trap:** Storage has **four** sub-resources — Blob, File, Queue, Table. Each can have its own Private Endpoint. If you need private access to both blob and file, you create two Private Endpoints (or one per sub-resource). The Private DNS zone for blob is `privatelink.blob.core.windows.net`; for file it is `privatelink.file.core.windows.net`.

> 📝 **Worked example (exam-style question — Private Endpoint count):**
>
> *Question:* You have a Data Lake Storage account named sa1. You plan to deploy an app that will access sa1 and perform Read, List, Create Directory, and Delete Directory operations. You need to ensure the app connects securely via a private endpoint. What is the minimum number of private endpoints required?
>
> A. 1
> B. 2
> C. 3
> D. 4
>
> *Correct answer:* **A — 1.** A private endpoint connects you to **one service** (Data Lake Storage). All operations (Read, List, Create, Delete) go through the same endpoint. You need one private endpoint per service you want to access privately, not per operation.

## Part 3: Private Link Services — Expose Your Own Services

**Azure Private Link** is the technology behind Private Endpoints. But Private Link also lets you expose **your own services** to customers via private connection. You create a **Private Link service** backed by an Azure Standard Load Balancer, and your consumer creates a Private Endpoint pointing to your service. Traffic stays on the Microsoft network.

**How it works:**
1. You deploy your service behind an **Azure Standard Load Balancer**.
2. You create a **Private Link service** and associate it with the load balancer's frontend IP.
3. Your consumer creates a **Private Endpoint** in their VNet pointing to your Private Link service.
4. The consumer accesses your service via the private IP of the Private Endpoint.

**Use case:** SaaS providers who want to offer private connectivity to customers without exposing the service publicly.

## Part 4: App Service and Azure Functions — VNet Integration

**VNet integration** allows an App Service Plan (ASP) or Function App to reach resources in your VNet (e.g. a SQL database, storage with private endpoint) using private IPs.

- **Regional VNet integration** — the app connects to a VNet in the same region. You delegate a subnet to the integration. The subnet cannot be used for other resources (e.g. VMs).
- **Each ASP needs its own delegated subnet** — you cannot share the same subnet across multiple App Service Plans.
- **Gateway-required integration** — for cross-region or ExpressRoute connectivity, you use a Point-to-Site VPN and a VNet gateway. This is a different feature.

> 🚨 **Exam trap:** The delegated subnet for VNet integration must have a **minimum size of /28** and must be delegated to `Microsoft.Web/serverFarms`. Do not use the same subnet for VNet integration and for Private Endpoints or VMs.

## Part 5: ASE and SQL Managed Instance — Network Isolation

### App Service Environment (ASE)

An **App Service Environment (ASE)** is a fully isolated, dedicated hosting environment for App Service apps. Unlike standard App Service (which runs on shared infrastructure), ASE runs **inside your VNet**. This gives you full network isolation.

- ASE is deployed into a **dedicated subnet** in your VNet.
- You can configure **NSGs** on the ASE subnet to filter inbound/outbound traffic.
- Internal ASE (ILB ASE) has a private IP only — not exposed to the internet.
- External ASE has a public IP for inbound traffic.
- You can add Service Endpoints and Private Endpoints for secure access to other Azure services.

### SQL Managed Instance Network Config

**Azure SQL Managed Instance** is a PaaS SQL Server that runs inside a **dedicated subnet** in your VNet. It provides near-100% compatibility with on-premises SQL Server.

- Requires a **dedicated subnet** (cannot be shared with other resources).
- The subnet must be delegated to `Microsoft.Sql/managedInstances`.
- Minimum subnet size: **/27** (though /28 may work, /27 is recommended).
- You can configure NSGs on the subnet to control traffic.
- Supports Private Endpoints for inbound connectivity from other VNets.
- Supports **Azure AD authentication** for an additional security layer.

## Part 6: Storage Security — SAS, Immutable Storage, Soft Delete

### Shared Access Signatures (SAS)

A **SAS** grants time-limited, scoped access to storage (blob, file, queue, table) without sharing the account key. You can restrict by resource, permissions (read, write, delete, list), and expiry time.

**Tools that support SAS:**
- **Azure Storage Explorer** — supports SAS for blob containers and file shares.
- **AzCopy** — supports SAS for blob and file operations.
- **Robocopy** — does not support SAS; it works with mapped drives (SMB) and requires different authentication.
- **File Explorer** — can map Azure Files via UNC, but SAS for blob is not supported natively in the same way.

> 📝 **Worked example (exam-style question — SAS and tools):**
>
> *Question:* You have a storage account with a blob container named Container1 and a file share named Share1. You generate a SAS to connect to both. Which tool can you use to access the contents in Container1 and Share1 by using the SAS?
>
> **Options:** Robocopy.exe, Azure Storage Explorer, File Explorer
>
> *Correct answer:* **Azure Storage Explorer.** It supports SAS connections for both blob containers and file shares. Robocopy does not support SAS (it uses SMB with different auth). File Explorer does not natively support SAS for blobs; for file shares, mapping with SAS is possible but Storage Explorer is the standard tool for both.

### Immutable Storage (WORM)

**Immutable storage** prevents blobs from being modified or deleted for a specified retention period. Use cases: regulatory compliance, legal hold.

- **Time-based retention policy** — blobs cannot be modified or deleted until the retention period expires.
- **Legal hold** — blobs cannot be modified or deleted until the hold is removed.
- Configure at the **container** level: Container → Access policy → Add policy.

> 📝 **Worked example (exam-style question — Prevent blob modification):**
>
> *Question:* You have a storage account with a container named container1. You need to prevent the blobs in container1 from being modified. What should you do?
>
> | Option | Text |
> |--------|------|
> | A | From container1, change the access level. |
> | B | From container1, add an access policy. |
> | C | From container1, modify the Access Control (IAM) settings. |
> | D | From storage1, enable soft delete for blobs. |
>
> *Correct answer:* **B — Add an access policy.** An immutable storage access policy (time-based retention or legal hold) on the container creates a WORM (Write Once, Read Many) state — blobs cannot be modified or deleted.
>
> *Why incorrect:*
> - A: Access level (private/blob/container) controls anonymous access, not modification.
> - C: IAM controls who can manage the resource, not blob immutability.
> - D: Soft delete allows recovery of deleted blobs; it does not prevent modification.

### Soft Delete vs. Immutable Storage

| Feature | Soft delete | Immutable storage |
|---------|-------------|-------------------|
| Purpose | Recover deleted blobs | Prevent modification and deletion |
| Effect | Deleted blobs are retained for a period | Blobs cannot be changed or deleted |
| Use case | Accidental deletion recovery | Compliance, legal hold |

## Part 7: Web Application Firewall (WAF) — Complete Guide

A **Web Application Firewall (WAF)** inspects HTTP/HTTPS traffic (Layer 7) and protects against OWASP Top 10 attacks (SQL injection, XSS, etc.). It is **not** the same as Azure Firewall.

| Azure Firewall | Web Application Firewall (WAF) |
|----------------|--------------------------------|
| Layer 3–4 (IP, port, protocol) | Layer 7 (HTTP/HTTPS) |
| Network-level filtering | Application-level (URLs, headers, body) |
| Protects VNets, outbound traffic | Protects web apps from web attacks |
| Standalone or with Firewall Manager | Add-on to Application Gateway, Front Door, or Azure CDN |

### Where WAF Runs

- **Azure Application Gateway** — regional WAF; traffic flows through the gateway.
- **Azure Front Door** — global WAF; traffic flows through Front Door's edge.
- **Azure CDN** — WAF can be enabled on CDN profiles.

### WAF Rule Types

- **Azure-managed Default Rule Set (DRS)** — OWASP protection; read-only; you cannot modify it.
- **Bot Manager** — bot detection and blocking.
- **Custom rules** — you define conditions: rate limiting, geo-filtering, IP allow/deny, request attributes.

> 🚨 **Exam trap:** Rate limiting based on request location (geo) or other custom conditions requires **custom rules**. The Azure-managed DRS is read-only and cannot be modified to add rate limiting.

> 📝 **Worked example (exam-style question — Protect web app with WAF):**
>
> *Question:* You have a web app named WebApp1 and a WAF policy named WAF1. You need to protect WebApp1 by using WAF1. What should you do first?
>
> | Option | Text |
> |--------|------|
> | A | Deploy an Azure Front Door. |
> | B | Add an extension to WebApp1. |
> | C | Deploy Azure Firewall. |
>
> *Correct answer:* **A — Deploy an Azure Front Door.** WAF policies are associated with Application Gateway, Front Door, or Azure CDN. A web app does not have built-in WAF. You must deploy one of these services first, then associate the WAF policy. Front Door provides global protection.
>
> *Why incorrect:*
> - B: Web app extensions are for monitoring, auth, or other app features — not WAF.
> - C: Azure Firewall is a network firewall (L3/L4), not a web application firewall (L7). It does not inspect HTTP traffic for SQL injection or XSS.

> 📝 **Worked example (exam-style question — WAF rate limiting by location):**
>
> *Question:* You have a WAF with Azure-managed DRS and Bot Manager. You need to implement rate limiting rules based on the request location. The solution must minimize administrative effort. What should you do?
>
> | Option | Text |
> |--------|------|
> | A | Create an Azure Policy. |
> | B | Modify the Azure-managed Default Rule Set. |
> | C | Create a custom rule. |
>
> *Correct answer:* **C — Create a custom rule.** The Azure-managed DRS is read-only — you cannot modify it. Rate limiting by geo-location or other conditions is done via **custom rules**. Custom rules support conditions such as request rate, geo, IP, and request attributes.

## Part 8: TLS for App Service and API Management

**TLS (Transport Layer Security)** encrypts communication between clients and your application. Azure enforces TLS for all PaaS services, but you control the version and certificates.

### App Service TLS Configuration

- **Minimum TLS version:** Set to **1.2** (recommended) or 1.3. Older versions (1.0, 1.1) are deprecated.
- **HTTPS Only:** Enable this setting to redirect all HTTP requests to HTTPS automatically. Portal: App Service → TLS/SSL settings → HTTPS Only = On.
- **Certificates:** You can use a **free Azure-managed certificate** (for custom domains) or upload your own certificate. Azure-managed certificates auto-renew.
- **Custom domain + TLS:** To use a custom domain with HTTPS, you bind an SSL certificate to the domain.

### API Management TLS Configuration

- Upload SSL certificates for custom domains (gateway, portal, management).
- Enforce **TLS 1.2 or later** in the API Management service settings.
- API Management supports **mutual TLS (mTLS)** — clients must present a certificate to access the API. Configure this in the **Client certificates** section.

### TLS Termination

**TLS termination** (also called SSL offloading) means the TLS encryption is handled at the gateway (Application Gateway or Front Door), not at the backend. The gateway decrypts the traffic and forwards it to the backend over HTTP (or re-encrypts with HTTPS for end-to-end encryption).

- **Application Gateway:** Supports TLS termination; you upload certificates to the gateway.
- **Front Door:** Handles TLS at the edge (nearest POP to the user).
- **Benefit:** Reduces CPU load on backend servers; centralizes certificate management.

## Part 9: Azure Application Gateway — Complete Guide

**Application Gateway** is a Layer 7 (HTTP/HTTPS) load balancer for web applications. It is **regional** — it runs in a single Azure region.

### Key Features

| Feature | Description |
|---------|-------------|
| **SSL/TLS termination** | Decrypt HTTPS at the gateway; forward to backend over HTTP or HTTPS |
| **URL path-based routing** | Route `/api/*` to backend pool A, `/images/*` to backend pool B |
| **Multi-site hosting** | Host multiple domains on one gateway; route by hostname |
| **Cookie-based session affinity** | Sticky sessions — route a user's requests to the same backend server |
| **WAF integration** | Built-in Web Application Firewall (WAF v2) for OWASP protection |
| **Autoscaling** | Scale based on traffic; WAF v2 tier supports autoscaling |
| **Health probes** | Monitor backend health; remove unhealthy servers from rotation |

### Application Gateway SKUs

| SKU | WAF | Autoscaling | Use case |
|-----|-----|-------------|----------|
| **Standard v2** | No | Yes | Load balancing without WAF |
| **WAF v2** | Yes | Yes | Load balancing + web application firewall |

> 🚨 **Exam trap:** Application Gateway is **regional** (single region). Front Door is **global** (multi-region). If the question asks for a global WAF or global load balancing, the answer is Front Door, not Application Gateway.

## Part 10: DDoS Protection — Basic vs. Standard

| Feature | Basic | Standard |
|---------|-------|----------|
| Cost | Free (always on) | Paid (per protected public IP) |
| Mitigation | Automatic for common network attacks | Automatic + **adaptive tuning** based on your traffic patterns |
| Telemetry | None | Full: attack metrics, flow logs, diagnostic logs |
| Alerting | None | Yes: alerts during active attacks |
| Cost protection | No | Yes: service credits if Azure resources scale up during an attack |
| DDoS Rapid Response | No | Yes: access to DDoS experts during active attacks |
| Integration | — | Defender for Cloud, WAF, Azure Monitor |

**How DDoS Standard works:**
1. **Traffic monitoring** — Azure continuously monitors traffic to your public IPs and learns your normal traffic patterns.
2. **Adaptive tuning** — policies are automatically tuned based on your specific traffic profile.
3. **Scrubbing** — when an attack is detected, malicious traffic is scrubbed (dropped) while legitimate traffic passes through. No manual intervention required.
4. **Cost protection** — if your resources (e.g. VMs, Application Gateway) scale up during an attack, Microsoft provides service credits to offset the cost.

**When to use Standard:** Mission-critical, internet-facing workloads; need for telemetry, alerting, and cost protection during attacks. Apply DDoS Standard to the **VNet** that contains your public-facing resources.

> 🚨 **Exam trap:** DDoS Standard is applied at the **VNet level** (not per resource). It protects all public IPs within the VNet. DDoS Basic is always on for all Azure resources — you cannot disable it. Standard adds telemetry, adaptive tuning, cost protection, and DDoS Rapid Response.

## Part 11: Azure Front Door vs. Application Gateway

| Aspect | Application Gateway | Azure Front Door |
|--------|---------------------|------------------|
| Scope | Regional (single region) | Global (multi-region, anycast) |
| WAF | Regional WAF | Global WAF |
| Private Link to origins | No (Standard) | Yes (**Premium tier** only) |
| SSL termination | Yes | Yes (at edge POP) |
| Routing | URL path, host header, round-robin | Same + geo, latency-based, weighted |
| CDN | No | Yes (content caching at edge) |
| Use case | Regional web app load balancing | Global app delivery, multi-region failover |

**Azure Front Door tiers:**
- **Standard** — global load balancing, CDN, WAF, SSL termination. No Private Link origins.
- **Premium** — everything in Standard + **Private Link to origins** + enhanced WAF.

> 🚨 **Exam trap:** Front Door **Premium** tier supports Private Link to origins — your backend can be reached via private endpoint. Standard tier does not. If the requirement says "connect Front Door to origin via private connection," you need Premium.

## Part 12: Azure Firewall Manager and Firewall Policies

**Azure Firewall Manager** is a centralized management service for Azure Firewall. It allows you to manage **firewall policies** across multiple firewalls, regions, and subscriptions from a single place.

- **Firewall Policy** — a collection of NAT, Network, and Application rules. You create a policy and associate it with one or more Azure Firewall instances. Policies can be shared across firewalls.
- **Policy hierarchy** — child policies can inherit rules from a parent policy and add their own. This is useful for organizations with a central security team (parent policy) and business units (child policies).
- **Secured Virtual Hub** — Azure Firewall deployed inside a Virtual WAN hub. Firewall Manager configures routing and security for the hub.

> 🚨 **Exam trap:** Firewall Manager manages **policies** (not individual firewall rules). If the question asks "centrally manage firewall rules across multiple subscriptions," the answer is Azure Firewall Manager with a shared firewall policy.

## Part 13: 🔬 LAB 06 — Service Endpoints and Securing Storage

**Link:** [LAB 06 — Service Endpoints and Securing Storage](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_06_SecuringAzureStorage.html)
**Duration:** ~45 minutes.

In this lab you will:
1. Create a storage account and configure firewall rules (selected networks).
2. Enable Service Endpoints for Storage on a subnet.
3. Add the subnet to the storage account's allowed virtual networks.
4. Create and test SAS tokens.
5. Configure blob access levels (private, blob, container).

## Part 14: Extra Practice (30 min)

1. Create a storage account → add a Private Endpoint → create Private DNS zone `privatelink.blob.core.windows.net` → link to VNet → verify DNS resolves to private IP from a VM.
2. Enable soft delete and immutable storage (time-based retention) on a blob container.
3. In the portal: explore DDoS Protection plans, Application Gateway WAF, Front Door profiles.

## Part 15: Key Facts to Memorize (Day 4 Quick-Reference Card)

| Concept | Key fact |
|---------|----------|
| Service Endpoint | Azure backbone; resource keeps public IP; subnet + firewall rule both required |
| Private Endpoint | Private IP in VNet; requires Private DNS zone |
| Private Link service | Expose YOUR service behind Standard LB via private connection |
| Storage firewall VNet rule | Subnet in allowed list AND Service Endpoint on subnet — both required |
| Storage firewall IP rule | Works independently of VNet rules |
| Private DNS zones | Blob: `privatelink.blob.core.windows.net`; SQL: `privatelink.database.windows.net`; Key Vault: `privatelink.vaultcore.azure.net`; Web App: `privatelink.azurewebsites.net` |
| VNet integration subnet | /28 minimum, delegated to `Microsoft.Web/serverFarms`, one per ASP |
| ASE | Fully isolated App Service inside your VNet; internal (ILB) or external |
| SQL MI subnet | Dedicated, delegated to `Microsoft.Sql/managedInstances`, /27+ |
| Prevent blob modification | Immutable storage (access policy on container) |
| Soft delete | Recover deleted blobs; does not prevent modification |
| WAF vs. Azure Firewall | WAF = L7 (HTTP); Azure Firewall = L3/L4 (network) |
| WAF deployment | Front Door, Application Gateway, or Azure CDN |
| WAF rate limiting | Custom rules (DRS is read-only) |
| Application Gateway | Regional L7 LB; SSL termination, URL path routing, cookie affinity, WAF v2 |
| Front Door Standard | Global L7 LB; CDN, WAF, no Private Link origins |
| Front Door Premium | + Private Link to origins |
| DDoS Standard | VNet-level; adaptive tuning, telemetry, cost protection, DDoS Rapid Response |
| DDoS Basic | Always on, free, no telemetry |
| TLS minimum | 1.2 for App Service and API Management |
| Firewall Manager | Centralized management of firewall policies across subscriptions |

**Day 4 is complete.** Review any section you found difficult, complete LAB 06, and re-attempt the worked examples. Proceed to Day 5 (Compute, Storage, SQL, Key Vault) when you are confident with every concept above.

**Practice questions (exam dump):** Q16, Q122, Q123, Q146, Q216, Q30, Q393 — these are covered by the concepts and worked examples in this guide.
