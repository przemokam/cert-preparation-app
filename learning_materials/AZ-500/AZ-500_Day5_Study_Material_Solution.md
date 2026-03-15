# AZ-500 Exam Preparation: Day 5 — Compute, Database & Key Vault Security

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 5 of your 7-day AZ-500 preparation. Today's focus is **Compute, Storage, and Database Security**, which accounts for **20–25%** of the exam. This is the heaviest day — three MS Learn modules and three official labs. You will learn how to secure VMs (Bastion, JIT, ADE), containers (ACR, AKS), storage (BYOK, encryption), and databases (TDE, Always Encrypted, Dynamic Data Masking, auditing).

## Day 5 Official Resources

| Resource | Description | Link |
|----------|-------------|------|
| MS Learn Module 1 | Compute: Bastion, JIT, AKS, ACR, Disk Encryption, API Management. | [Plan and implement advanced security for compute](https://learn.microsoft.com/en-us/training/modules/advanced-security-compute/) |
| MS Learn Module 2 | Storage: access keys, SAS, BYOK, double encryption, soft delete, immutable storage. | [Plan and implement security for storage](https://learn.microsoft.com/en-us/training/modules/security-storage/) |
| MS Learn Module 3 | SQL: Entra authentication, auditing, Dynamic Data Masking, TDE, Always Encrypted. | [Plan and implement security for Azure SQL Database and Azure SQL Managed Instance](https://learn.microsoft.com/en-us/training/modules/security-azure-sql-database-azure-sql-managed-instance/) |
| Exam Readiness Video | Microsoft's exam prep for compute, storage, databases. | [Part 3 of 4: Secure compute, storage, and databases](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-secure-compute-storage-and-databases-3-of-4) |
| LAB 04 | ACR and AKS: build Docker image, push to ACR, deploy to AKS. ~60 min. | [LAB 04 — ACR and AKS](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_04_ConfiguringandSecuringACRandAKS.html) |
| LAB 05 | Azure SQL: deploy via ARM, enable Defender for SQL, data classification, auditing. ~45 min. | [LAB 05 — Securing Azure SQL Database](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_05_SecuringAzureSQLDatabase.html) |
| LAB 07 | Key Vault + Always Encrypted: create Key Vault, implement Always Encrypted. ~60 min. | [LAB 07 — Key Vault + Always Encrypted](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_07_KeyVaultImplementingSecureDatabysettingupAlwaysEncrypted.html) |
| Lab files (ZIP) | Download all lab instructions and ARM templates. | [Download ZIP](https://github.com/MicrosoftLearning/AZ500-AzureSecurityTechnologies/archive/master.zip) |

**Recommended schedule for today (6–8 hours):**
Block 1 (2–2.5 h): Read this guide + complete the three MS Learn modules.
Block 2 (3 h): LAB 04 + LAB 05 + LAB 07.
Block 3 (1–1.5 h): Work through the exam-style questions embedded in this guide.

## Part 1: Azure Bastion — Secure Remote Access

### What Azure Bastion Is

Azure Bastion provides **secure RDP/SSH connectivity** to your VMs directly from the Azure portal over TLS (HTTPS, port 443). The VM does not need a public IP. Bastion is deployed inside your VNet and acts as a jump host.

### Deployment Requirements

- **Subnet name:** Must be named exactly **AzureBastionSubnet** (case-sensitive).
- **Subnet size:** Minimum **/26** (64 addresses). Microsoft recommends /26.
- **No NSG on AzureBastionSubnet** is required — but if you do attach one, it must allow specific ports (443 inbound from Internet, 3389/22 outbound to VirtualNetwork).
- The VM being accessed does NOT need a public IP.

### Bastion Across Peered VNets

Azure Bastion deployed in one VNet can connect to VMs in **peered VNets**. If VNET1 has Bastion and VNET1 is peered with VNET2 and VNET3, Bastion can access VMs in all three VNets.

> 🚨 **Exam trap:** Bastion subnet requirements are similar to Azure Firewall (both need a dedicated subnet with a specific name and minimum /26), but they are **different subnets** with **different names**: `AzureBastionSubnet` vs. `AzureFirewallSubnet`. Never confuse them.

## Part 2: Just-In-Time (JIT) VM Access — Complete Guide

### What JIT Is

**JIT VM access** is a Defender for Cloud feature that keeps management ports (RDP 3389, SSH 22) **closed** by default using NSG deny rules. When an authorized user needs access, they **request it** through the portal. Defender for Cloud temporarily opens the port for a specified time and IP, then closes it automatically.

### JIT Requirements

1. VM must be deployed via **Azure Resource Manager** (ARM) — not Classic.
2. VM must have an **NSG** on its NIC or subnet (JIT modifies NSG rules to allow/deny).
3. **Defender for Cloud** must have the Defender for Servers plan enabled.

### How to Request JIT Access

1. In the Azure Portal, navigate to the VM → **Connect**.
2. Select **Request access**.
3. Specify the port, source IP, and duration (e.g. 3 hours).
4. Defender for Cloud adds a temporary Allow rule to the NSG.
5. After the duration expires, the rule is automatically removed.

> 📝 **Worked example (exam-style question — JIT VM access):**
>
> *Question:* You have VMs in RG1. You need to ensure the Remote Desktop port is closed until an authorized user requests access. What should you use?
>
> | Option | Text |
> |--------|------|
> | A | Azure AD PIM |
> | B | An application security group |
> | C | Azure AD Conditional Access |
> | D | Just in time (JIT) VM access |
>
> *Correct answer:* **D — Just in time (JIT) VM access.** JIT locks down inbound ports with NSG deny rules and temporarily opens them when access is requested. PIM manages Azure AD role activations (not VM ports). ASGs group VMs for NSG rules (don't provide on-demand opening). Conditional Access controls cloud app access (not VM network ports).
>
> **Key rule:** "Port closed until requested" = **JIT**. "Prevent unauthorized applications" = **Adaptive application controls**. "Encrypt disks" = **ADE**.

> 📝 **Worked example (exam-style question — JIT requirements):**
>
> *Scenario:* Fabrikam has VMs in Subscription1:
>
> | VM | OS | Location | VNet/Subnet | NSG |
> |----|-----|----------|-------------|-----|
> | VM1 | Windows Server 2019 | West US | VNET1/Subnet1 | None |
> | VM2 | CentOS 8.2 | West US | VNET1/Subnet2 | NSG2 |
> | VM3 | Windows Server 2016 | Central US | VNET2/Subnet1 | NSG3 |
> | VM4 | Ubuntu 18.04 | West US | VNET3/Subnet1 | NSG4 |
>
> *Question:* You plan to implement JIT VM access. Which VMs will be supported?
>
> A. VM1 and VM3 only
> B. VM1, VM2, VM3, and VM4
> C. VM2, VM3, and VM4 only
> D. VM1 only
>
> *Correct answer:* **A — VM1 and VM3 only.** JIT requires an NSG or Azure Firewall. VM1 has no NIC NSG but its subnet may have one (depends on the full scenario). The exam dump answer is A. The key principle: JIT works on both Windows and Linux, but **requires NSG association**. Always check the NSG column.

## Part 3: Azure Disk Encryption (ADE) — Complete Guide

### What ADE Does

**Azure Disk Encryption (ADE)** encrypts VM disks (OS and data) using **BitLocker** (Windows) or **DM-Crypt** (Linux). The encryption keys are stored in **Azure Key Vault**. ADE encrypts the virtual disk files at rest — if someone copies the VHD, they cannot read the data without the Key Vault keys.

### ADE Key Vault Requirements — Critical for the Exam

The Key Vault used for ADE must be:

1. In the **same region** as the VM.
2. In the **same subscription** as the VM.
3. Have **Azure Disk Encryption for volume encryption** access policy enabled (or use RBAC).

The **resource group does not matter** — the Key Vault can be in a different resource group, as long as region and subscription match.

> 📝 **Worked example (exam-style question — ADE Key Vault selection):**
>
> *Scenario:* You have two subscriptions (Sub1, Sub2) with the following Key Vaults:
>
> | Key Vault | Region | Subscription | Resource Group |
> |-----------|--------|-------------|----------------|
> | KV1 | West US | Sub1 | RG1 |
> | KV2 | Central US | Sub1 | RG1 |
> | KV3 | West US | Sub1 | RG2 |
> | KV4 | West US | Sub2 | RG3 |
>
> You create VM1 in Sub1, RG1, **West US**. You plan to enable Azure Disk Encryption. In which Key Vaults can you store the encryption key?
>
> | Key Vault | Region | Same region? | Same subscription? | Can use? |
> |-----------|--------|-------------|-------------------|---------|
> | KV1 | West US | Yes | Yes (Sub1) | **Yes** |
> | KV2 | Central US | **No** | Yes (Sub1) | **No** — wrong region |
> | KV3 | West US | Yes | Yes (Sub1) | **Yes** — different RG is OK |
> | KV4 | West US | Yes | **No** (Sub2) | **No** — wrong subscription |
>
> *Correct answer:* **KV1 and KV3.** ADE requires same region + same subscription. The resource group does NOT matter. KV2 fails the region check. KV4 fails the subscription check. Both KV1 (RG1) and KV3 (RG2) meet the criteria — different resource groups within the same subscription and region are fine.

### ADE vs. Storage BYOK — The Exam Tests This Distinction

| Encryption type | Key Vault must be in... | Example |
|----------------|------------------------|---------|
| **ADE** (VM disk) | Same **region** + same **subscription** | VM in West US, Sub1 → Key Vault in West US, Sub1 |
| **Storage BYOK** (customer-managed key for storage) | Same **region** + same **tenant** (different subscription OK) | Storage in West US, Sub1 → Key Vault in West US, Sub2 (same tenant) |

> 🚨 **Exam trap:** ADE = same region + same **subscription**. Storage BYOK = same region + same **tenant**. If you mix these up, you will get the question wrong. The exam tests this distinction repeatedly.

### Other Disk Encryption Options

| Method | What it encrypts | Key management |
|--------|-----------------|----------------|
| **ADE** | OS + data disks via BitLocker/DM-Crypt | Key Vault (customer controls) |
| **SSE (Server-Side Encryption)** | All managed disks at rest | Microsoft-managed or customer-managed key |
| **Encryption at host** | Temp disks + disk caches | All data encrypted before reaching storage |
| **Confidential disk encryption** | OS disk encrypted with VMM key (confidential VMs) | Platform-managed or customer-managed |

## Part 4: Azure Container Registry (ACR) — Roles and Security

### ACR Built-In Roles

| Role | Pull images | Push images | Delete images | Sign images | Manage registry |
|------|------------|------------|--------------|-------------|----------------|
| **Reader** | No (metadata only) | No | No | No | No |
| **AcrPull** | **Yes** | No | No | No | No |
| **AcrPush** | **Yes** | **Yes** | No | No | No |
| **AcrImageSigner** | No | No | No | **Yes** | No |
| **Contributor** | Yes | Yes | Yes | No | Yes |
| **Owner** | Yes | Yes | Yes | No | Yes + permissions |

> 📝 **Worked example (exam-style question — ACR roles):**
>
> *Scenario:* You have AKS cluster AKS1 and user-assigned managed identity ID1. Technical requirements:
> - AKS1 must only be able to **pull images** from Registry1.
> - ID1 must be able to **push images to and pull images** from Registry1.
> - Follow the principle of least privilege.
>
> *Question:* Which role should you assign to each identity?
>
> | Identity | Requirement | Correct role |
> |----------|------------|-------------|
> | AKS1 | Pull only | **AcrPull** |
> | ID1 | Push and pull | **AcrPush** |
>
> *Reasoning:*
> - `AcrPull` is the least privilege for pull-only. `Reader` cannot pull images (only metadata).
> - `AcrPush` includes both push and pull. You do NOT need both `AcrPull` and `AcrPush` — `AcrPush` alone is sufficient.
> - `Contributor` includes push + pull + delete + management — too broad for least privilege.

### Content Trust in ACR

**Content trust** ensures that pushed images are **signed**. Only signed images can be pulled when content trust is enabled. To push signed images, you need both **AcrPush** and **AcrImageSigner** roles. Content trust must be enabled on both the registry and the client (Docker CLI).

### Defender for Containers

- Scans container images in ACR for vulnerabilities.
- Currently scans **Linux images only** — Windows container images are not scanned.
- Requires **Defender paid tier** (not free tier).

## Part 5: Azure Kubernetes Service (AKS) Security

### AKS + Azure AD Integration

AKS can integrate with Azure AD for authentication. Users authenticate via Azure AD, and Kubernetes RBAC uses Azure AD groups for authorization.

- Azure AD integration must be configured **at cluster creation**. If you did not enable it at creation, you must **recreate the cluster**.
- Set the app manifest property **groupMembershipClaims** to **"All"** so that group information is included in tokens for Kubernetes RBAC.

### AKS Network Policies

AKS supports **Kubernetes network policies** to control traffic between pods. This is similar to NSGs but for pod-to-pod traffic within the cluster.

### AKS and ACR Integration

To pull images from ACR, the AKS managed identity needs the **AcrPull** role on the registry. You can attach ACR to AKS:

```bash
az aks update -n myAKSCluster -g myResourceGroup --attach-acr myACR
```

This command automatically assigns AcrPull to the AKS kubelet managed identity.

## Part 6: Managed Identities — System-Assigned vs. User-Assigned (Revisited for Compute)

You learned about managed identities in Day 2. Today you apply them to compute scenarios.

| Feature | System-assigned | User-assigned |
|---------|----------------|---------------|
| **Lifecycle** | Tied to the resource; deleted when resource is deleted | Independent; persists after resource deletion |
| **Sharing** | One identity per resource | Can be shared across multiple resources |
| **Permissions cleanup** | Automatic when resource is deleted | Manual — must remove role assignments yourself |
| **Use case** | VM that needs storage access; auto-cleanup on deletion | Shared identity for multiple VMs or function apps |

> 📝 **Worked example (exam-style question — Managed identity choice):**
>
> *Scenario:* You have VM1 that needs to read data from storage1. Technical requirement: if VM1 is deleted, the permissions for VM1 must be removed automatically. What should you do first?
>
> | Option | Text |
> |--------|------|
> | A | Configure a system-assigned managed identity on VM1. |
> | B | Configure federated identity credentials for ID1. |
> | C | Assign the Storage Blob Data Reader role to storage1. |
> | D | Assign ID1 (user-assigned) to VM1. |
>
> *Correct answer:* **A — Configure a system-assigned managed identity on VM1.** System-assigned identities are deleted with the resource, so all role assignments are automatically cleaned up. User-assigned identities (D) have an independent lifecycle and would NOT be removed when VM1 is deleted.
>
> **Key rule:** "Permissions removed automatically when resource is deleted" = **system-assigned managed identity**. "Shared across multiple resources" = **user-assigned managed identity**.

## Part 7: Storage Security — Access Keys, BYOK, Double Encryption

### Storage Access Keys

Every storage account has **two access keys** (key1, key2). These keys grant **full access** to all data in the account. They are equivalent to root passwords.

**Key rotation:** Rotate keys regularly. Use key2 while regenerating key1, then switch to key1 and regenerate key2. This ensures zero downtime.

**Revoking SAS access:** If you discover unauthorized access via SAS tokens, **regenerate the access keys**. This invalidates ALL SAS tokens signed with the old key. This is the only way to revoke all SAS access in a single operation.

> 📝 **Worked example (exam-style question — Revoke SAS access):**
>
> *Scenario:* You have storage account Sa1. Users and applications access blob and file services via several SAS tokens and stored access policies. You discover unauthorized access. You need to revoke **all** access to Sa1.
>
> Multiple questions test this with different proposed solutions:
>
> | Proposed solution | Meets the goal? | Why |
> |-------------------|----------------|-----|
> | Generate new SAS tokens | **No** | Old SAS tokens remain valid. |
> | Create a new stored access policy | **No** | Only affects future SAS; existing SAS still valid. |
> | Create a resource lock on Sa1 | **No** | Locks prevent deletion/modification of the resource, not data access. |
> | **Regenerate the access keys** | **Yes** | Invalidates **every** SAS signed with the old key. Nuclear option. |

### Customer-Managed Keys (BYOK) for Storage

By default, Azure encrypts storage data with **Microsoft-managed keys** (SSE). For compliance, you can use **customer-managed keys (CMK)** stored in Azure Key Vault (Bring Your Own Key — BYOK).

**Requirements for BYOK:**
- Key Vault must be in the **same region** as the storage account.
- Key Vault must be in the **same Azure AD tenant** as the storage account (different subscription is OK).
- The key must be **RSA** or **RSA-HSM** type.
- Key Vault must have **Soft Delete** enabled (required since 2021).

**Which storage services support CMK:**
- **Blob** and **Files** — fully support CMK encryption.
- **Table** and **Queue** — support CMK via **encryption scopes** (additional configuration).

### Setup Sequence for Storage CMK

The exam tests the correct order:

1. **Create the storage account** (New-AzStorageAccount).
2. **Grant the storage account access to Key Vault** (Set-AzKeyVaultAccessPolicy — the storage account's identity needs Get, Wrap, Unwrap on keys).
3. **Configure the storage account to use CMK** (Set-AzStorageAccount — specify Key Vault URI and key name).

### Double Encryption (Infrastructure Encryption)

**Double encryption** adds a second layer of encryption at the infrastructure level. Data is encrypted twice: once with service-level encryption (SSE) and once with infrastructure encryption, using **different keys and algorithms**.

- Enabled at **storage account creation** — cannot be enabled later.
- Use case: high compliance requirements where a single layer of encryption is not sufficient.

## Part 8: Azure SQL Database Security — Complete Guide

### SQL Authentication Methods

| Method | How it works | MFA prompts |
|--------|-------------|-------------|
| **SQL Login** | SQL username + password (local to DB) | None |
| **Active Directory – Password** | Azure AD username + password typed in SSMS | 1 prompt |
| **Active Directory – Integrated** | Uses current Windows Kerberos credentials (seamless SSO) | **None** (zero prompts) |
| **Active Directory – Universal with MFA** | Azure AD credentials + MFA challenge | 2+ prompts |

> 🚨 **Exam trap:** "Minimize authentication prompts" + hybrid Azure AD joined devices + on-premises AD credentials = **Active Directory – Integrated** (zero prompts via Kerberos). Only works when the user is logged into Windows with domain credentials on a hybrid-joined device.

### Transparent Data Encryption (TDE)

**TDE** encrypts the database **at rest** — the data files, log files, and backups are encrypted on disk. TDE is **transparent** to applications: the database engine handles encryption/decryption automatically. Applications do not need any changes.

**TDE key options:**

| Key management | Description |
|---------------|-------------|
| **Service-managed key** | Microsoft manages the key. Default for new databases. No setup needed. |
| **Customer-managed key (BYOK)** | You provide the key from your Key Vault. More control. |

**Requirements for TDE with customer-managed key:**
- Key Vault must have **Soft Delete** AND **Purge Protection** enabled.
- Key type: **RSA** or **RSA-HSM**.
- Grant the SQL Server identity **Get, Wrap Key, Unwrap Key** permissions on the Key Vault.

### Always Encrypted — Client-Side Column Encryption

**Always Encrypted** encrypts **specific columns** in the database. Unlike TDE (which encrypts the entire database transparently), Always Encrypted works at the **column level** and encryption/decryption happens in the **client application** — the database engine never sees the plaintext data. This means DBAs cannot read encrypted columns.

**Two-key architecture:**

| Key | Purpose | Stored where |
|-----|---------|-------------|
| **Column Encryption Key (CEK)** | Directly encrypts the data in encrypted columns | Inside the database (encrypted form) |
| **Column Master Key (CMK)** | Encrypts the CEK (key-protecting key) | Outside the database: Key Vault, Windows Certificate Store, or HSM |

To **decrypt data**, the client application needs access to the **CMK** (which decrypts the CEK, which then decrypts the data). The database engine only stores the encrypted CEK — it never touches the CMK.

> 📝 **Worked example (exam-style question — Always Encrypted keys):**
>
> *Question:* You have an Azure SQL database with Always Encrypted implemented. You need to ensure application developers can retrieve and decrypt data. What information should you provide? (Pick 2)
>
> | Option | Text |
> |--------|------|
> | A | A stored access policy |
> | B | A shared access signature (SAS) |
> | C | The column encryption key |
> | D | User credentials |
> | E | The column master key |
>
> *Correct answers:* **C and E — The column encryption key (CEK) and the column master key (CMK).**
>
> *Reasoning:* Always Encrypted uses client-side decryption. The application needs the CMK to decrypt the CEK, and the CEK to decrypt the data. SAS/stored access policies are for Azure Storage (not SQL). User credentials authenticate to the database but do not provide decryption keys — Always Encrypted decryption happens in the client driver.

### TDE vs. Always Encrypted — Comparison

| Feature | TDE | Always Encrypted |
|---------|-----|-----------------|
| **What it encrypts** | Entire database (files, logs, backups) | Specific columns |
| **Encryption location** | Database engine (server-side) | Client application (client-side) |
| **Transparent to apps?** | Yes — no app changes needed | No — app must use AE-enabled driver |
| **DBAs can read data?** | Yes (TDE is transparent to all DB users) | **No** (DBA sees ciphertext) |
| **Protects against** | Stolen disk/backup | Unauthorized DB users, even DBAs |
| **Key storage** | Service-managed or Key Vault | Key Vault or Certificate Store |

> 🚨 **Exam trap:** "Encrypt data so that DBAs cannot see it" = **Always Encrypted**. "Encrypt database at rest transparently" = **TDE**. If the question mentions "column-level encryption" or "client-side encryption," the answer is Always Encrypted.

### Dynamic Data Masking

**Dynamic Data Masking** hides sensitive data in query results. The data is NOT encrypted — it is **masked on display**. The actual data in the database remains unchanged. Any user with direct database access and sufficient permissions can still see the unmasked data.

**Masking functions:**

| Function | Effect | Example |
|----------|--------|---------|
| **Default** | Full masking: xxxx or 0 | `email@contoso.com` → `xxxx` |
| **Email** | Shows first letter + domain | `email@contoso.com` → `eXXX@XXXX.com` |
| **Custom string** | Shows first/last N characters, mask middle | `555-123-4567` → `555-XXX-XXXX` |
| **Random number** | Replaces numeric value with random in range | `42` → `17` (random) |

> 🚨 **Exam trap:** Dynamic Data Masking does NOT encrypt data. It only masks the display. It does not protect against users who have direct access to query the underlying data. For true encryption at rest or column-level encryption, use TDE or Always Encrypted.

### SQL Auditing

**Auditing** records database events (queries, logins, schema changes) to an audit log. You configure the destination:

| Destination | Region requirement | Notes |
|-------------|-------------------|-------|
| **Azure Storage account** | Must be in the **same region** as the SQL server | Most common for compliance |
| **Log Analytics workspace** | **Any region** | Enables KQL queries and alerting |
| **Event Hub** | Same region | For streaming to external SIEM |

> 🚨 **Exam trap:** SQL auditing storage account = **same region** as SQL server. Log Analytics workspace = **any region**. The exam tests this distinction.

### SQL Injection Detection

**Microsoft Defender for SQL** (part of Defender for Cloud) detects SQL injection attacks, anomalous database access patterns, and brute-force login attempts. It requires the Defender paid tier — the free tier does not include SQL threat detection.

## Part 9: Key Vault Security — Access Control and Backup

### Key Vault Access Models

**Two access models** — you choose one:

| Model | How permissions work |
|-------|---------------------|
| **Vault access policy** | Classic model: define per-identity permissions (Get, List, Create, Delete, Wrap, Unwrap) for keys, secrets, certificates |
| **Azure RBAC** | Modern model: assign Azure RBAC roles (Key Vault Administrator, Key Vault Secrets User, etc.) |

> 🚨 **Exam trap:** Having **Owner** or **Contributor** on a Key Vault does NOT give you access to keys, secrets, or certificates. Those are **management plane** roles — they let you manage the Key Vault resource (create, delete, configure). To access the **data plane** (read/write keys, secrets, certificates), you need either vault access policies or data-plane RBAC roles (e.g. Key Vault Secrets User).

### Key Vault Soft Delete and Purge Protection

| Feature | Effect |
|---------|--------|
| **Soft Delete** | Deleted items are retained for a recovery period (7–90 days). You can recover them. Enabled by default since 2021. |
| **Purge Protection** | When enabled, deleted items CANNOT be permanently purged until the retention period expires. Nobody — not even admins — can force-delete them early. |

**For TDE with customer-managed key**, Key Vault must have **both Soft Delete and Purge Protection** enabled. If the key is accidentally deleted and purge protection is on, you can recover it before the retention expires — preventing permanent data loss.

### Key Vault Backup and Restore

Key Vault backups can be restored to a Key Vault in the **same Azure geography** (e.g. "United States" includes East US, Central US, West US, etc.). Cross-geography restore is not supported.

> 📝 **Worked example (exam-style question — Key Vault restore):**
>
> *Scenario:* AKV1 is in **East US**, in Subscription1 (RG1). You deploy:
>
> | Key Vault | Region | Subscription | Resource Group |
> |-----------|--------|-------------|----------------|
> | AKV2 | West Europe | Sub1 | RG1 |
> | AKV3 | Central US | Sub1 | RG1 |
> | AKV4 | East US | Sub1 | RG1 |
> | AKV5 | East US | Sub2 | RG2 |
>
> *Question:* To which Key Vaults can you restore AKV1 backups?
>
> | Key Vault | Geography | Same geography as AKV1 (US)? | Can restore? |
> |-----------|-----------|-------------------------------|-------------|
> | AKV2 | Europe | No (Europe ≠ US) | **No** |
> | AKV3 | US (Central US) | Yes | **Yes** |
> | AKV4 | US (East US) | Yes | **Yes** |
> | AKV5 | US (East US) | Yes | **Yes** |
>
> *Correct answer:* **AKV4 and AKV5** (dump answer) or AKV3, AKV4, and AKV5 (based on geography rule). The key principle: Key Vault restore requires the **same Azure geography**.

## Part 10: ARM Templates — Dynamic Key Vault References

When deploying VMs with ADE via ARM templates, you may need to reference different Key Vaults per deployment. The exam tests how to do this.

- **Static reference** — Key Vault resource ID is hardcoded in the template. Works for single deployments.
- **Dynamic reference** — Key Vault resource ID is constructed from parameters. Use a **parameters file** to pass vault name and secret name as inline parameters.

> 📝 **Worked example (exam-style question — ARM + Key Vault):**
>
> *Question:* You use ARM templates for multiple deployments of identically configured VMs. The admin password for each deployment is stored as a secret in different Azure Key Vaults. You need to dynamically construct the resource ID of the appropriate Key Vault during each deployment. What should you use?
>
> | Option | Text |
> |--------|------|
> | A | A Key Vault access policy |
> | B | A linked template |
> | C | A parameters file |
> | D | An automation account |
>
> *Correct answer:* **C — A parameters file.** The parameters file can construct the Key Vault resource ID dynamically using the `reference` function. Access policies control permissions (not ID construction). Linked templates are for modular template composition. Automation accounts are for runbooks.

## Part 11: VM Configuration — Desired State Configuration (DSC)

To automatically configure VMs at provisioning time (e.g. disable unused Windows features, install roles), use **Azure Desired State Configuration (DSC) VM extension**. DSC defines the desired state in PowerShell and enforces it on the VM.

- **DSC VM extension** — push-based: deployed via ARM template at provisioning.
- **Azure Automation State Configuration** — pull-based: VMs pull their configuration from Azure Automation.

Both use PowerShell DSC under the hood. The exam tests both variants.

## Part 12: 🔬 LAB 04 — ACR and AKS

**Link:** [LAB 04 — ACR and AKS](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_04_ConfiguringandSecuringACRandAKS.html)
**Duration:** ~60 minutes.

In this lab you will:
1. Create an Azure Container Registry.
2. Build a Docker image and push it to ACR.
3. Create an AKS cluster and grant it AcrPull on the registry.
4. Deploy a container from ACR to AKS.
5. Configure Kubernetes network policies.

## Part 13: 🔬 LAB 05 — Securing Azure SQL Database

**Link:** [LAB 05 — Securing Azure SQL Database](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_05_SecuringAzureSQLDatabase.html)
**Duration:** ~45 minutes.

In this lab you will:
1. Deploy Azure SQL Database via ARM template.
2. Enable Microsoft Defender for SQL.
3. Configure Data Classification (label sensitive columns).
4. Enable SQL Auditing and review audit logs.

## Part 14: 🔬 LAB 07 — Key Vault + Always Encrypted

**Link:** [LAB 07 — Key Vault + Always Encrypted](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_07_KeyVaultImplementingSecureDatabysettingupAlwaysEncrypted.html)
**Duration:** ~60 minutes.

In this lab you will:
1. Create a Key Vault and configure access policies.
2. Create a Column Master Key (CMK) in Key Vault.
3. Configure Always Encrypted on a SQL database table using SSMS.
4. Verify that encrypted columns show ciphertext to unauthenticated clients.

## Part 15: Key Facts to Memorize (Day 5 Quick-Reference Card)

| Concept | Key fact |
|---------|----------|
| Bastion subnet | `AzureBastionSubnet`, /26 minimum |
| JIT requirements | ARM VM + NSG + Defender for Servers plan |
| JIT = | "Port closed until requested" |
| ADE Key Vault | Same **region** + same **subscription** as VM |
| Storage BYOK Key Vault | Same **region** + same **tenant** (different subscription OK) |
| ACR: pull only | AcrPull |
| ACR: push + pull | AcrPush (includes pull) |
| ACR: Reader | Metadata only — cannot pull images |
| AKS + Azure AD | Must be configured at cluster creation |
| Revoke all SAS | Regenerate access keys |
| Storage CMK setup | Create account → Grant KV access → Configure CMK |
| Double encryption | Enabled at storage account creation only |
| TDE | Entire database, server-side, transparent to apps, DBAs can read |
| Always Encrypted | Column-level, client-side, DBAs CANNOT read |
| AE decryption | App needs CEK + CMK |
| Dynamic Data Masking | Display masking only — NOT encryption |
| SQL audit storage | Same region as SQL server |
| SQL audit Log Analytics | Any region |
| Key Vault Owner/Contributor | Management plane only — no data plane access |
| Key Vault for TDE BYOK | Soft Delete + Purge Protection required; RSA/RSA-HSM key |
| Key Vault restore | Same Azure geography |
| System-assigned MI | Auto-deleted with resource (permissions cleaned up) |
| User-assigned MI | Independent lifecycle (persists after resource deletion) |
| DSC VM extension | Auto-configure VMs at provisioning via ARM template |

**Day 5 is complete.** This was the heaviest day. Review any section you found difficult, complete all three labs, and re-attempt the worked examples. Proceed to Day 6 (Defender for Cloud, Azure Policy, Sentinel) when you are confident with every concept above.

**Practice questions (exam dump):** Q22, Q24, Q26, Q46, Q74, Q75, Q94, Q96, Q101, Q112, Q211, Q28/Q29 (Fabrikam2) — these are covered by the concepts and worked examples in this guide.
