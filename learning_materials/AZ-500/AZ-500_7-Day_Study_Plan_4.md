# AZ-500 — 7-Day Intensive Study & Revision Plan

> **Target:** Microsoft Azure Security Technologies (AZ-500) Certification  
> **Format:** Official MS Learn Modules → Key Concepts → Official Lab → Practice Questions → Review  
> **Daily effort:** ~4–6 hours (adjust to your pace)

---

## Official AZ-500 Learning Resources

### 📚 4 Official Learning Paths (from AZ-500 Course Syllabus)

These are the **official Microsoft Learn training paths** for the AZ-500T00 course. Every module listed below comes directly from these paths.

| # | Learning Path | Exam Weight | Link |
|---|--------------|-------------|------|
| 1 | **Protect identity and access in Azure** | 15–20% | [Learning Path 1](https://learn.microsoft.com/en-us/training/paths/manage-identity-access-new/) |
| 2 | **Protect network infrastructure in Azure** | 20–25% | [Learning Path 2](https://learn.microsoft.com/en-us/training/paths/implement-platform-protection/) |
| 3 | **Protect compute, storage, and databases** | 20–25% | [Learning Path 3](https://learn.microsoft.com/en-us/training/paths/secure-your-data-applications/) |
| 4 | **Strengthen security posture using Defender for Cloud and Sentinel** | 30–35% | [Learning Path 4](https://learn.microsoft.com/en-us/training/paths/secure-azure-using-microsoft-defender-cloud-sentinel/) |

### 🎥 Official Exam Readiness Zone Videos

| Part | Topic | Link |
|------|-------|------|
| 1/4 | Secure identity and access | [Watch](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-01-fy25) |
| 2/4 | Secure networking | [Watch](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-02-fy25) |
| 3/4 | Secure compute, storage, and databases | [Watch](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-secure-compute-storage-and-databases-3-of-4) |
| 4/4 | Defender for Cloud and Sentinel | [Watch](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-04-fy25) |

### 🔬 Official Microsoft Hands-On Labs (GitHub)

📥 **[Download all lab files (ZIP)](https://github.com/MicrosoftLearning/AZ500-AzureSecurityTechnologies/archive/master.zip)**

| Lab # | Title | Link |
|-------|-------|------|
| LAB 01 | Role-Based Access Control | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_01_RBAC.html) |
| LAB 02 | Network Security Groups and Application Security Groups | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_02_NSGs.html) |
| LAB 03 | Azure Firewall | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_03_AzureFirewall.html) |
| LAB 04 | Configuring and Securing ACR and AKS | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_04_ConfiguringandSecuringACRandAKS.html) |
| LAB 05 | Securing Azure SQL Database | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_05_SecuringAzureSQLDatabase.html) |
| LAB 06 | Service Endpoints and Securing Storage | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_06_SecuringAzureStorage.html) |
| LAB 07 | Key Vault — Always Encrypted | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_07_KeyVaultImplementingSecureDatabysettingupAlwaysEncrypted.html) |
| LAB 08 | Log Analytics, Storage & Data Collection Rule (DCR) | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_08_CreateaLogAnalyticsworkspaceAzureStorageAccountDataCollectionRule(DCR).html) |
| LAB 09 | Defender for Cloud — Enhanced Security for Servers | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_09_ConfiguringMicrosoftDefenderforCloudEnhancedSecurityFeaturesforServers.html) |
| LAB 10 | Just-In-Time Access on VMs | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_10_Enable%20just-in-time%20access%20on%20VMs.html) |
| LAB 11 | Microsoft Sentinel | [Open Lab](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_11_Microsoft%20Sentinel.html) |

---

## How to Use This Plan

| Symbol | Meaning |
|--------|---------|
| 📖 | Official MS Learn Module — read and complete interactive exercises |
| 🎥 | Exam Readiness Video — watch the official exam prep episode |
| 🧠 | Key Concepts — memorize; these come up on the exam |
| 🔬 | Official Microsoft Lab — hands-on in your Azure subscription |
| 🔬+ | Extra hands-on tasks (supplement the labs) |
| ❓ | Practice Questions — from exam dump |
| 🔁 | Review — go over mistakes |

**Cost Warning:** Some labs create billable resources (VMs, Firewall, AKS). Always run cleanup commands after each lab!

---

## Day 1 — Identity & Access (Part 1): RBAC, PIM, MFA

**Exam weight: Part of 15–20%**

### 📖 Official MS Learn Module

**[Manage security controls for identity and access](https://learn.microsoft.com/en-us/training/modules/manage-security-controls-identity-access/)**
*(Part of Learning Path 1: Protect identity and access in Azure)*

Topics covered:

- Azure RBAC: built-in roles, custom roles, JSON structure
- Microsoft Entra Privileged Identity Management (PIM)
- Multi-Factor Authentication (MFA), Conditional Access
- Identity Protection risk policies

### 🎥 Exam Readiness Video

**[Preparing for AZ-500: Secure identity and access (Part 1 of 4)](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-01-fy25)**

### 🧠 Key Concepts to Memorize

- **Owner** = manage everything + permissions; **Contributor** = everything *except* permissions
- **User Access Administrator** = manage role assignments only
- PIM requires **Azure AD Premium P2**
- Eligible assignment = user *can* activate; Active = already assigned
- Custom roles: `Actions` = control plane; `DataActions` = data plane
- `AssignableScopes` determines where the role can be assigned
- Conditional Access: **P1** minimum; risk-based policies require **P2**
- Identity Protection: leaked credentials = **High** risk level

### 🔬 Official Lab

**➡️ [LAB 01 — Role-Based Access Control](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_01_RBAC.html)** (~45 min)

- Create users/groups (Portal, PowerShell, Azure CLI)
- Assign VM Contributor role to a group
- Verify permissions via "Check access"

### 🔬+ Extra Practice (30 min)

1. Create a custom RBAC role allowing only ASG management
2. In PIM: assign eligible Contributor role → activate → observe time limit
3. Configure PIM: max activation 2h, require MFA, require approval

### ❓ Practice Questions

**Exam dump:** Q23, Q44, Q99, Q143, Q194, Q197, Q198, Q200, Q222, Q292, Q349

---

## Day 2 — Identity & Access (Part 2): App Registrations, Managed Identities, Conditional Access

**Exam weight: Part of 15–20%**

### 📖 Official MS Learn Module

**[Manage Microsoft Entra application access](https://learn.microsoft.com/en-us/training/modules/manage-application-access-microsoft-entra-id/)**
*(Part of Learning Path 1: Protect identity and access in Azure)*

Topics covered:

- Enterprise applications vs. App registrations
- OAuth permission grants (delegated vs. application)
- Admin consent vs. user consent
- Service principals
- Managed identities (system-assigned vs. user-assigned)
- Microsoft Entra Application Proxy

### 🎥 Exam Readiness Video (rewatch identity section)

**[Preparing for AZ-500: Secure identity and access (Part 1 of 4)](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-01-fy25)**

### 🧠 Key Concepts to Memorize

- Registering an app in Azure AD → **service principal** is automatically created
- System-assigned managed identity: tied to one resource, deleted with it
- User-assigned managed identity: independent lifecycle, shared across resources
- Permission scopes: "Expose an API" in app registration
- API permissions: what your app can call
- Conditional Access: exclude takes priority over include
- Named locations + trusted IPs for MFA bypass

### 🔬+ Hands-On Practice (1.5 h)

*(No dedicated official lab — practice in portal)*

1. Create a Conditional Access policy requiring MFA for Azure Management
2. Create a named location for your IP → block access from outside
3. Register an app → observe the service principal in Enterprise Apps
4. Configure delegated permissions (User.Read) → grant admin consent
5. Create Azure Function with system-assigned managed identity → assign Storage Blob Data Reader

### ❓ Practice Questions

**Exam dump:** Q9, Q45, Q100, Q102, Q124, Q142, Q214, Q215, Q256, Q257, Q301, Q303, Q381, Q449, Q450, Q451

---

## Day 3 — Networking Security (Part 1): NSGs, ASGs, Azure Firewall, UDRs

**Exam weight: Part of 20–25%**

### 📖 Official MS Learn Module

**[Plan and implement security for virtual networks](https://learn.microsoft.com/en-us/training/modules/security-virtual-networks/)**
*(Part of Learning Path 2: Protect network infrastructure in Azure)*

Topics covered:

- NSGs: rules, priority, default rules, subnet/NIC association
- ASGs: logical grouping, constraints
- Azure Virtual Network Manager
- UDRs and route tables
- VNet peering, VPN Gateway
- Virtual WAN, secured virtual hub
- ExpressRoute encryption
- Network Watcher

### 🎥 Exam Readiness Video

**[Preparing for AZ-500: Secure Networking (Part 2 of 4)](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-02-fy25)**

### 🧠 Key Concepts to Memorize

- ASGs: all NICs must be in the **same virtual network**
- Azure Firewall requires `AzureFirewallSubnet` (/26 minimum)
- Firewall rule order: **DNAT → Network → Application**
- Rule types: DNAT (inbound), Network (L4), Application (L7/FQDN)
- NSG flow logs need **Network Watcher** + **storage in same region**
- UDR: no duplicate address prefixes; next hops: Virtual Appliance, VNet Gateway, Internet, None
- VPN Gateway: know max S2S connections per SKU (VpnGw1 = 30)
- ExpressRoute encryption: MACsec (private peering) or IPsec VPN over ER

### 🔬 Official Labs (do both today!)

**➡️ [LAB 02 — NSGs and ASGs](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_02_NSGs.html)** (~60 min)

- Create VNet, subnets, ASGs
- Create NSG with rules using ASGs
- Deploy VMs and test network filtering

**➡️ [LAB 03 — Azure Firewall](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_03_AzureFirewall.html)** (~60 min)

- Deploy Azure Firewall
- Create Application + Network rules
- Create UDR routing through firewall
- Test via RDP (jump box → workload VM)

⚠️ Azure Firewall costs ~$1.25/h — **run cleanup immediately after:**

```powershell
Remove-AzResourceGroup -Name "AZ500LAB08" -Force -AsJob
```

### ❓ Practice Questions

**Exam dump:** Q17, Q25, Q113, Q125, Q184, Q289, Q293, Q377, Q439, Q440, Q447, Q491

---

## Day 4 — Networking Security (Part 2): Private Endpoints, Service Endpoints, WAF, DDoS, Storage

**Exam weight: Part of 20–25%**

### 📖 Official MS Learn Modules (two modules today)

**[Plan and implement security for private access to Azure resources](https://learn.microsoft.com/en-us/training/modules/security-private-access-azure-resources/)**
*(Part of Learning Path 2)*

- Service Endpoints vs. Private Endpoints
- Private Link services
- Private DNS zones
- App Service / Functions VNet integration
- ASE and SQL Managed Instance network config

**[Plan and implement security for public access to Azure resources](https://learn.microsoft.com/en-us/training/modules/security-public-access-azure-resources/)**
*(Part of Learning Path 2)*

- TLS for App Service and API Management
- Azure Firewall + Firewall Manager + policies
- Azure Application Gateway
- Azure Front Door + CDN
- Web Application Firewall (WAF)
- DDoS Protection Standard

### 🧠 Key Concepts to Memorize

- **Service Endpoint**: Azure backbone routing, resource still has public IP
- **Private Endpoint**: resource gets private IP in your VNet, requires Private DNS zone
- Private DNS zones (memorize!):
  - Blob: `privatelink.blob.core.windows.net`
  - SQL: `privatelink.database.windows.net`
  - Cosmos DB: `privatelink.documents.azure.com`
  - Key Vault: `privatelink.vaultcore.azure.net`
  - Web App: `privatelink.azurewebsites.net`
- App Service VNet integration: each ASP needs its own delegated subnet
- DDoS Standard: telemetry, alerting, cost protection, adaptive tuning
- Front Door **Premium** = WAF + Private Link origins
- WAF on App Gateway = regional; WAF on Front Door = global

### 🔬 Official Lab

**➡️ [LAB 06 — Service Endpoints and Securing Storage](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_06_SecuringAzureStorage.html)** (~45 min)

- Create storage with firewall rules
- Configure Service Endpoints
- Create and test SAS tokens
- Configure blob access levels

### 🔬+ Extra Practice (30 min)

1. Create storage → add Private Endpoint → verify DNS resolves to private IP
2. Enable soft delete and immutable storage on blob container
3. Explore in portal: DDoS Protection plans, App Gateway WAF, Front Door profiles

### ❓ Practice Questions

**Exam dump:** Q16, Q122, Q123, Q296, Q302, Q305, Q376, Q378, Q379, Q380, Q382, Q442, Q443, Q457, Q458, Q490

---

## Day 5 — Compute, Database & Key Vault Security

**Exam weight: 20–25%**

### 📖 Official MS Learn Modules (three modules today!)

**[Plan and implement advanced security for compute](https://learn.microsoft.com/en-us/training/modules/advanced-security-compute/)**
*(Part of Learning Path 3: Protect compute, storage, and databases)*

- Azure Bastion, JIT VM access
- AKS network isolation, authentication, monitoring
- Container Instances, Container Apps security
- ACR access management
- Disk encryption (ADE, encryption at host, confidential)
- API Management security

**[Plan and implement security for storage](https://learn.microsoft.com/en-us/training/modules/security-storage/)**
*(Part of Learning Path 3)*

- Storage access control, access keys
- Azure Files, Blob Storage access methods
- Soft delete, backups, versioning, immutable storage
- BYOK, double encryption at infrastructure level

**[Plan and implement security for Azure SQL Database and Azure SQL Managed Instance](https://learn.microsoft.com/en-us/training/modules/security-azure-sql-database-azure-sql-managed-instance/)**
*(Part of Learning Path 3)*

- Microsoft Entra database authentication
- Auditing, Dynamic Data Masking
- TDE (service-managed vs. customer-managed key)
- Always Encrypted

### 🎥 Exam Readiness Video

**[Preparing for AZ-500: Secure compute, storage, and databases (Part 3 of 4)](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-secure-compute-storage-and-databases-3-of-4)**

### 🧠 Key Concepts to Memorize

- JIT: only **ARM-deployed** VMs; Bastion: `AzureBastionSubnet` /26+
- ADE Key Vault: **same region + same subscription** as VM
- Storage BYOK: Key Vault **same region + same tenant** (different subscription OK)
- TDE customer key: Key Vault needs **Soft Delete + Purge Protection**; key = **RSA/RSA-HSM**
- **Always Encrypted** vs. **TDE**: AE = client-side column encryption (DBAs can't see); TDE = disk-level
- Dynamic Masking: masks display, does NOT encrypt
- ACR: `acrpull` = pull images; `acrpush` = push

### 🔬 Official Labs (three labs — heavy day!)

**➡️ [LAB 04 — ACR and AKS](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_04_ConfiguringandSecuringACRandAKS.html)** (~60 min)

- Create ACR, build/push Docker image
- Create AKS, grant `acrpull`, deploy container
- Configure network policies

**➡️ [LAB 05 — Securing Azure SQL Database](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_05_SecuringAzureSQLDatabase.html)** (~45 min)

- Deploy SQL via ARM template
- Enable Defender for SQL
- Data Classification, Auditing

**➡️ [LAB 07 — Key Vault + Always Encrypted](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_07_KeyVaultImplementingSecureDatabysettingupAlwaysEncrypted.html)** (~60 min)

- Create Key Vault with access policies
- Implement Always Encrypted with Key Vault as Column Master Key store

### ❓ Practice Questions

**Exam dump:** Q22, Q24, Q26, Q101, Q112, Q211, Q258, Q259, Q290, Q291, Q304, Q350, Q438, Q444

---

## Day 6 — Defender for Cloud, Azure Policy, Monitoring & Sentinel

**Exam weight: 30–35% (the BIGGEST section!)**

### 📖 Official MS Learn Modules (four modules today!)

**[Implement and manage enforcement of cloud governance policies](https://learn.microsoft.com/en-us/training/modules/implement-manage-enforcement-cloud-governance-policies/)**
*(Part of Learning Path 4)*

- Azure Policy: definitions, initiatives, assignments, effects
- Key Vault: network settings, access control, certificates/secrets/keys
- Key rotation, backup/recovery

**[Manage security posture by using Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/training/modules/microsoft-defender-cloud-security-posture/)**
*(Part of Learning Path 4)*

- Secure Score, inventory, recommendations
- Compliance frameworks (MCSB, NIST, SOC 2, ISO 27001)
- Custom standards, AWS/GCP connectors
- Defender EASM

**[Configure and manage threat protection by using Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/training/modules/microsoft-defender-cloud-threat-protection/)**
*(Part of Learning Path 4)*

- Workload protection plans (Servers, Databases, Storage)
- Agentless scanning, vulnerability management
- DevOps Security (GitHub, Azure DevOps, GitLab)

**[Configure and manage security monitoring and automation solutions](https://learn.microsoft.com/en-us/training/modules/security-monitoring-automation-solutions/)**
*(Part of Learning Path 4)*

- Security alerts in Defender for Cloud
- Workflow automation (Logic Apps)
- Azure Monitor, Data Collection Rules (DCRs)
- Microsoft Sentinel: data connectors, analytics rules, automation

### 🎥 Exam Readiness Video

**[Preparing for AZ-500: Defender for Cloud and Sentinel (Part 4 of 4)](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-04-fy25)**

### 🧠 Key Concepts to Memorize

- Initiative = group of policy definitions
- Policy effects: Deny, Audit, DeployIfNotExists, Modify, Append, AuditIfNotExists
- Key Vault: Owner/Contributor ≠ data plane access; need data roles or access policies
- Soft Delete + Purge Protection → items recoverable, nobody can purge early
- Workflow automation requires **Logic App created first**; **Logic App Contributor** role to modify
- Defender: **AWS + GCP** supported; **Alibaba NOT** supported
- EASM: maps ASNs, IPs, hostnames, SSL certs
- Sentinel analytics rules: **Fusion** (ML), **Scheduled** (KQL), **NRT** (every min), **Microsoft Security** (from Defender)
- CEF connector: **Log Analytics agent** + Linux syslog forwarder
- Sentinel playbooks = Logic Apps

### 🔬 Official Labs (four labs!)

**➡️ [LAB 08 — Log Analytics + DCR](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_08_CreateaLogAnalyticsworkspaceAzureStorageAccountDataCollectionRule(DCR).html)** (~30 min)

**➡️ [LAB 09 — Defender for Cloud: Enhanced Security for Servers](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_09_ConfiguringMicrosoftDefenderforCloudEnhancedSecurityFeaturesforServers.html)** (~30 min)

**➡️ [LAB 10 — JIT VM Access](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_10_Enable%20just-in-time%20access%20on%20VMs.html)** (~30 min)

**➡️ [LAB 11 — Microsoft Sentinel](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_11_Microsoft%20Sentinel.html)** (~60 min)

### 🔬+ Extra Practice (30 min)

1. Create Azure Policy "Allowed VM SKUs" → assign → try deploying blocked VM
2. Key Vault: create key, secret, certificate → delete → recover from soft delete
3. Configure Key Vault firewall: allow only your VNet

### ❓ Practice Questions

**Exam dump:** Q20, Q21, Q111, Q126, Q186, Q187, Q201, Q223, Q224, Q225, Q289, Q294, Q295, Q297, Q346, Q347, Q348, Q356, Q358, Q359, Q360, Q361, Q436, Q437, Q441, Q448, Q452, Q453, Q454, Q455, Q456

---

## Day 7 — Full Review, Weak Areas & Exam Simulation

### 🔁 Morning: Quick Checklist Review (2 h)

If you can't explain a concept in 2 sentences — go back to the MS Learn module!

**Identity & Access (15–20%) — [Learning Path 1](https://learn.microsoft.com/en-us/training/paths/manage-identity-access-new/)**

- [ ] RBAC: Owner vs. Contributor vs. Reader vs. User Access Admin
- [ ] Custom roles JSON: `Actions`, `NotActions`, `DataActions`, `AssignableScopes`
- [ ] PIM: eligible vs. active, activation settings, P2 requirement
- [ ] Conditional Access: conditions, controls, named locations, exclude > include
- [ ] App registrations vs. Enterprise apps vs. Service principals
- [ ] Managed identities: system-assigned vs. user-assigned
- [ ] OAuth: delegated vs. application permissions, admin consent

**Networking (20–25%) — [Learning Path 2](https://learn.microsoft.com/en-us/training/paths/implement-platform-protection/)**

- [ ] NSG rule evaluation: priority, default rules
- [ ] ASG: same VNet only
- [ ] Azure Firewall: AzureFirewallSubnet, rule order (DNAT → Network → Application)
- [ ] VPN Gateway SKUs and max S2S connections
- [ ] Service Endpoint vs. Private Endpoint
- [ ] Private DNS zone names: Blob, SQL, Cosmos DB, Key Vault, Web App
- [ ] WAF: App Gateway (regional) vs. Front Door (global)
- [ ] DDoS Basic vs. Standard
- [ ] UDR: next hop types, no duplicate prefixes

**Compute, Storage, Databases (20–25%) — [Learning Path 3](https://learn.microsoft.com/en-us/training/paths/secure-your-data-applications/)**

- [ ] JIT: ARM only, temp NSG rules; Bastion: AzureBastionSubnet /26+
- [ ] ADE: Key Vault same region + same subscription
- [ ] Storage: SAS types, RBAC data roles, shared key
- [ ] Soft delete, versioning, immutable storage
- [ ] BYOK: Key Vault same region + same tenant
- [ ] TDE (disk) vs. Always Encrypted (column, client-side)
- [ ] Dynamic Data Masking: masks display ≠ encryption
- [ ] ACR: `acrpull`, `acrpush`

**Defender, Policy, Sentinel (30–35%) — [Learning Path 4](https://learn.microsoft.com/en-us/training/paths/secure-azure-using-microsoft-defender-cloud-sentinel/)**

- [ ] Policy effects: Deny, Audit, DeployIfNotExists, Modify, Append
- [ ] Initiative = group of policies
- [ ] Key Vault: access policy vs. RBAC, soft delete + purge protection
- [ ] Defender: Secure Score, compliance, workload plans
- [ ] EASM: external attack surface
- [ ] AWS + GCP (NOT Alibaba)
- [ ] Workflow automation = Logic Apps (create first!)
- [ ] Logic App Contributor role
- [ ] Sentinel: Fusion, Scheduled, NRT, Microsoft Security rules
- [ ] CEF = Log Analytics agent + Linux syslog forwarder
- [ ] DCR = Data Collection Rules

### ❓ Afternoon: Exam Simulation (2.5 h)

1. Pick **50–60 questions** from the exam dump (mix all topics)
2. Timer: **90 minutes**
3. Answer without peeking at explanations
4. Grade and mark every wrong answer

### 🔁 Evening: Targeted Review (1.5 h)

For every wrong answer → read explanation → **find it in Azure Portal**

**High-Frequency Exam Traps:**

| Trap | Remember |
|------|----------|
| Key Vault region for ADE | Same region + same subscription as VM |
| Key Vault for Storage BYOK | Same region + same tenant (different sub OK) |
| PIM settings vs. assignments | Settings = max duration, MFA; Assignments = who |
| Conditional Access exclude | Exclude takes priority over include |
| NSG vs. ASG vs. Firewall | NSG = L3/L4; ASG = grouping; Firewall = L7/FQDN |
| Service Endpoint vs. Private Endpoint | SE = backbone, still public IP; PE = private IP |
| TDE vs. Always Encrypted | TDE = disk by engine; AE = column by client |
| Sentinel rule types | Fusion=ML; Scheduled=KQL; NRT=1min; MS Security=Defender |
| Workflow automation | Logic App must exist first |
| Defender cloud connectors | AWS + GCP yes; Alibaba NO |

---

## Lab Completion Tracker

| Day | Lab | Done? |
|-----|-----|-------|
| 1 | LAB 01 — RBAC | ⬜ |
| 3 | LAB 02 — NSGs and ASGs | ⬜ |
| 3 | LAB 03 — Azure Firewall | ⬜ |
| 4 | LAB 06 — Service Endpoints + Storage | ⬜ |
| 5 | LAB 04 — ACR and AKS | ⬜ |
| 5 | LAB 05 — Azure SQL Database | ⬜ |
| 5 | LAB 07 — Key Vault + Always Encrypted | ⬜ |
| 6 | LAB 08 — Log Analytics + DCR | ⬜ |
| 6 | LAB 09 — Defender for Cloud | ⬜ |
| 6 | LAB 10 — JIT VM Access | ⬜ |
| 6 | LAB 11 — Microsoft Sentinel | ⬜ |

---

## MS Learn Module Completion Tracker

| Day | Module | Path | Done? |
|-----|--------|------|-------|
| 1 | Manage security controls for identity and access | Path 1 | ⬜ |
| 2 | Manage Microsoft Entra application access | Path 1 | ⬜ |
| 3 | Plan and implement security for virtual networks | Path 2 | ⬜ |
| 4 | Plan and implement security for private access | Path 2 | ⬜ |
| 4 | Plan and implement security for public access | Path 2 | ⬜ |
| 5 | Plan and implement advanced security for compute | Path 3 | ⬜ |
| 5 | Plan and implement security for storage | Path 3 | ⬜ |
| 5 | Plan and implement security for Azure SQL | Path 3 | ⬜ |
| 6 | Implement and manage cloud governance policies | Path 4 | ⬜ |
| 6 | Manage security posture (Defender for Cloud) | Path 4 | ⬜ |
| 6 | Configure and manage threat protection (Defender) | Path 4 | ⬜ |
| 6 | Configure security monitoring and automation | Path 4 | ⬜ |

---

## Daily Schedule Template

| Time Block | Activity | Duration |
|------------|----------|----------|
| Block 1 | 📖 MS Learn Module(s) + 🎥 Exam Readiness Video | 1.5–2 h |
| Break | — | 15 min |
| Block 2 | 🔬 Official Lab(s) in Azure Portal | 1.5–2 h |
| Break | — | 15 min |
| Block 3 | ❓ Practice questions + 🔁 Review wrong answers | 1–1.5 h |

---

## Quick Reference: All Official Links

| Resource | Link |
|----------|------|
| AZ-500 Course Page | <https://learn.microsoft.com/en-us/training/courses/az-500t00> |
| AZ-500 Certification Page | <https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/> |
| Learning Path 1: Identity & Access | <https://learn.microsoft.com/en-us/training/paths/manage-identity-access-new/> |
| Learning Path 2: Networking | <https://learn.microsoft.com/en-us/training/paths/implement-platform-protection/> |
| Learning Path 3: Compute, Storage, DB | <https://learn.microsoft.com/en-us/training/paths/secure-your-data-applications/> |
| Learning Path 4: Defender + Sentinel | <https://learn.microsoft.com/en-us/training/paths/secure-azure-using-microsoft-defender-cloud-sentinel/> |
| Exam Readiness Videos (all 4) | <https://learn.microsoft.com/en-us/shows/exam-readiness-zone/> |
| All Labs (GitHub) | <https://github.com/MicrosoftLearning/AZ500-AzureSecurityTechnologies/tree/master/Instructions/Labs> |
| Lab Files ZIP | <https://github.com/MicrosoftLearning/AZ500-AzureSecurityTechnologies/archive/master.zip> |

---

> **Final tip:** This plan maps 1:1 to the official AZ-500T00 course syllabus. Every module, every lab, every exam readiness video is from Microsoft's official certification path. Complete all 4 Learning Paths + all 11 Labs + practice questions = you are ready for the exam.

**Good luck! 🎯**
