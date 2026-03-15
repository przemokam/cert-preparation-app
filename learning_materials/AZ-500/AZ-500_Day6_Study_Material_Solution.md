# AZ-500 Exam Preparation: Day 6 — Defender for Cloud, Azure Policy, Monitoring & Sentinel

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 6 of your 7-day AZ-500 preparation. Today's focus is **Security Operations**, which accounts for **30–35%** of the exam — the single biggest section. You will learn Azure Policy, Key Vault governance, Defender for Cloud (Secure Score, workload protection, compliance), Azure Monitor, workflow automation, and Microsoft Sentinel (data connectors, analytics rules, playbooks, KQL). This is a critical day — four MS Learn modules and four labs.

## Day 6 Official Resources

| Resource | Description | Link |
|----------|-------------|------|
| MS Learn Module 1 | Azure Policy, Key Vault governance, key rotation, backup/recovery. | [Implement and manage enforcement of cloud governance policies](https://learn.microsoft.com/en-us/training/modules/implement-manage-enforcement-cloud-governance-policies/) |
| MS Learn Module 2 | Defender for Cloud: Secure Score, compliance, CSPM, multi-cloud, EASM. | [Manage security posture by using Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/training/modules/microsoft-defender-cloud-security-posture/) |
| MS Learn Module 3 | Defender for Cloud: workload protection (Servers, Databases, Storage), agentless scanning, DevOps security. | [Configure and manage threat protection by using Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/training/modules/microsoft-defender-cloud-threat-protection/) |
| MS Learn Module 4 | Security alerts, workflow automation, Azure Monitor, DCRs, Microsoft Sentinel. | [Configure and manage security monitoring and automation solutions](https://learn.microsoft.com/en-us/training/modules/security-monitoring-automation-solutions/) |
| Exam Readiness Video | Microsoft's exam prep for Defender for Cloud and Sentinel. | [Part 4 of 4: Defender for Cloud and Sentinel](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-04-fy25) |
| LAB 08 | Log Analytics workspace, Storage account, Data Collection Rules. ~30 min. | [LAB 08 — Log Analytics + DCR](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_08_CreateaLogAnalyticsworkspaceAzureStorageAccountDataCollectionRule(DCR).html) |
| LAB 09 | Defender for Cloud: enable enhanced security for Servers. ~30 min. | [LAB 09 — Defender for Cloud](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_09_ConfiguringMicrosoftDefenderforCloudEnhancedSecurityFeaturesforServers.html) |
| LAB 10 | Just-In-Time VM Access in Defender for Cloud. ~30 min. | [LAB 10 — JIT VM Access](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_10_Enable%20just-in-time%20access%20on%20VMs.html) |
| LAB 11 | Microsoft Sentinel: data connectors, analytics rules, playbooks. ~60 min. | [LAB 11 — Microsoft Sentinel](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_11_Microsoft%20Sentinel.html) |
| Lab files (ZIP) | Download all lab instructions and ARM templates. | [Download ZIP](https://github.com/MicrosoftLearning/AZ500-AzureSecurityTechnologies/archive/master.zip) |

**Recommended schedule for today (6–8 hours):**
Block 1 (2–2.5 h): Read this guide + complete the four MS Learn modules.
Block 2 (2.5 h): LAB 08 + LAB 09 + LAB 10 + LAB 11.
Block 3 (1.5 h): Work through the exam-style questions embedded in this guide.

## Part 1: Azure Policy — Complete Guide

### What Azure Policy Is

**Azure Policy** is a governance service that enforces rules on Azure resources. You define **what** is allowed (or required) and Azure Policy ensures compliance — at resource creation time (prevent) or after the fact (audit/remediate).

### Policy Components

| Component | What it is | Example |
|-----------|-----------|---------|
| **Policy definition** | A single rule. Written in JSON. Defines the condition and the effect. | "All VMs must use managed disks" |
| **Initiative (policy set)** | A group of related policy definitions bundled together. | "CIS Benchmark" = 150+ policies |
| **Assignment** | Applying a policy/initiative to a specific scope. | Assign "CIS Benchmark" to Subscription1 |

### Policy Effects — Critical for the Exam

When a policy condition matches, Azure applies an **effect**. You must know all six effects and when each is used:

| Effect | When it triggers | What it does | Use case |
|--------|-----------------|-------------|----------|
| **Deny** | At resource creation/update | **Blocks** the operation. Resource is not created. | Prevent VMs with unmanaged disks |
| **Audit** | After resource exists | **Logs** non-compliance. Resource is created. No blocking. | Report VMs without encryption |
| **AuditIfNotExists** | After resource exists | Audits if a **related** resource does not exist. | Flag VMs without anti-malware extension |
| **DeployIfNotExists** | After resource exists | **Deploys** a related resource if it does not exist. Requires **managed identity**. | Auto-install monitoring extension on VMs |
| **Modify** | At resource creation/update | **Changes** properties on the resource. Requires **managed identity**. | Add a tag to all resources |
| **Append** | At resource creation/update | **Adds** properties (e.g. tags, fields) to the resource. | Add an IP rule to a storage account |

> 🚨 **Exam trap:** **DeployIfNotExists** and **Modify** require a **managed identity** on the policy assignment because they need permissions to create or change resources. Deny, Audit, and AuditIfNotExists do not need managed identity — they only evaluate or block.

> 📝 **Worked example (exam-style question — Azure Policy for managed disks):**
>
> *Question:* A new company policy states that all Azure VMs must use managed disks. You need to prevent users from creating VMs with unmanaged disks. What should you use?
>
> | Option | Text |
> |--------|------|
> | A | Azure Monitor |
> | B | Azure Policy |
> | C | Azure Security Center |
> | D | Azure Service Health |
>
> *Correct answer:* **B — Azure Policy.** The built-in policy "Audit VMs that do not use managed disks" can be used with the **Deny** effect to block creation. Azure Monitor alerts but does not prevent. Security Center recommends but does not enforce at creation time. Service Health is unrelated.

### Policy Scope and Management Groups

Policies can be assigned at different scopes:

| Scope | Applies to | Use case |
|-------|-----------|----------|
| **Management group** | All subscriptions in the group | Enterprise-wide governance |
| **Subscription** | All resource groups in the subscription | Subscription-level standards |
| **Resource group** | All resources in the RG | RG-specific rules |

**Management groups** are critical for multi-subscription governance. If you need to apply a policy across **multiple subscriptions**, you must create a management group, place the subscriptions in it, and assign the policy at the management group level.

> 📝 **Worked example (exam-style question — Deploy policy across subscriptions):**
>
> *Scenario:* You manage three Azure subscriptions using Azure Security Center. You need to deploy policy definitions **as a group** to all three subscriptions.
>
> Multiple questions test this with different proposed solutions:
>
> | Proposed solution | Meets the goal? | Why |
> |-------------------|----------------|-----|
> | Policy definition scoped to resource groups | **No** | RG scope covers only one RG, not three subscriptions. |
> | Policy initiative scoped to resource groups | **No** | Initiative is correct for "as a group," but RG scope is too narrow. |
> | **Policy initiative scoped to management group** | **Yes** | Initiative = group of policies. Management group = covers all three subscriptions. Both requirements met. |
>
> **Key rule:** "Deploy as a group" = **initiative**. "Across multiple subscriptions" = **management group** scope.

### DeployIfNotExists — Auto-Remediation

**DeployIfNotExists** is the most complex effect. It checks if a related resource exists (e.g. a monitoring extension on a VM). If it does not exist, Azure **automatically deploys** it. This requires:

1. A **managed identity** on the policy assignment (to create the resource).
2. A **remediation task** — for existing resources that are already non-compliant, you create a remediation task that triggers the deployment.

> 📝 **Worked example (exam-style question — Auto-install extension):**
>
> *Question:* You assign a DeployIfNotExists policy to auto-install a monitoring extension on all VMs. Existing VMs do not have the extension. New VMs get the extension automatically. How do you fix existing VMs?
>
> *Answer:* Create a **remediation task** for the policy assignment. The remediation task evaluates existing non-compliant resources and deploys the extension. New VMs are handled at creation time; existing VMs need the remediation task.

## Part 2: Key Vault Governance — Network, Access, Rotation

Key Vault governance was partially covered in Day 5 (data plane access, Soft Delete, Purge Protection). Today you focus on **governance and operational** aspects.

### Control Plane vs. Data Plane — Critical Distinction

This is one of the most commonly tested Key Vault concepts:

| Plane | What it controls | Who has access | How to grant |
|-------|-----------------|---------------|-------------|
| **Control plane** (management) | Create/delete Key Vaults, manage access policies, configure firewall, set tags | **Owner** and **Contributor** roles | Azure RBAC |
| **Data plane** (operations) | Read/write keys, secrets, certificates | **Key Vault data roles** or **access policies** | Azure RBAC data roles (e.g. Key Vault Secrets Officer) or vault access policies |

> 🚨 **Exam trap:** A user with **Owner** or **Contributor** role on a Key Vault does **NOT** automatically get access to the data (keys, secrets, certificates). They can manage the vault itself (control plane) but to read a secret, they need a **data plane** role (e.g. Key Vault Secrets User) or an explicit access policy. This is the most common Key Vault exam mistake.

### Key Vault Access Models

Key Vault supports two access models for the data plane:

| Model | How it works | When to use |
|-------|------------|-------------|
| **Vault access policy** | Per-vault policies granting specific permissions (get, list, create, delete) to specific principals | Legacy model; still widely used |
| **Azure RBAC** | Standard Azure RBAC roles for data plane operations (Key Vault Secrets Officer, Key Vault Crypto User, etc.) | Recommended; centralized; supports Conditional Access |

You choose the model when creating the vault (Permission model setting). You can switch later, but only one model is active at a time.

### Key Vault Firewall (Network Settings)

Key Vault supports a firewall similar to storage accounts:
- **Allow access from all networks** (default) — any client can reach the Key Vault.
- **Allow access from selected networks** — only specified VNets/subnets and IP addresses. You can enable **Service Endpoints** for Key Vault on a subnet, then add that subnet to the allowed list.
- **Private Endpoint** — Key Vault gets a private IP in your VNet (Private DNS zone: `privatelink.vaultcore.azure.net`).

### Key Rotation

Azure supports **automatic key rotation** for keys in Key Vault:
- Configure a rotation policy on the key (e.g. rotate every 90 days).
- Event Grid integration: when a key is about to expire, an event is fired. You can trigger an Azure Function or Logic App to update applications.
- For storage account CMK: Azure can auto-rotate the key if you configure the storage account to use the **latest key version** (not a pinned version).

### Key Vault Backup and Restore (Revisited)

- Backup: Export a key/secret/certificate as an encrypted blob.
- Restore: Import back to a Key Vault in the **same Azure geography** (e.g. US includes East US, Central US, West US).
- Cross-geography restore is **not** supported.

## Part 3: Microsoft Defender for Cloud — Complete Guide

### CSPM vs. CWPP

Defender for Cloud has two main capabilities:

| Capability | Name | What it does | Cost |
|-----------|------|-------------|------|
| **CSPM** | Cloud Security Posture Management | Secure Score, recommendations, compliance dashboards, security benchmarks | Free (foundational) or Paid (enhanced) |
| **CWPP** | Cloud Workload Protection Platform | Threat detection, alerts, vulnerability scanning for workloads (VMs, SQL, Storage, Containers, etc.) | Paid per workload plan |

### Secure Score

**Secure Score** is a percentage (0–100%) representing your security posture. Each recommendation has a score impact — fixing it increases your Secure Score. The score is calculated at the **subscription** level.

- Recommendations are grouped by **security controls** (e.g. "Enable MFA," "Encrypt data at rest").
- Each control has a max score. Fixing all recommendations in a control gives you the full max score for that control.
- You can **exempt** resources from a recommendation (e.g. a test VM that does not need encryption).

### Workload Protection Plans (CWPP)

Each plan protects a specific resource type:

| Plan | Protects | Key features |
|------|---------|-------------|
| **Defender for Servers** | VMs (Azure + on-premises + multi-cloud) | Vulnerability scanning (Qualys/MDVM), adaptive application controls, JIT, file integrity monitoring |
| **Defender for Storage** | Storage accounts | Malware scanning on uploads, anomalous access detection |
| **Defender for SQL** | Azure SQL, SQL on VMs, SQL MI | SQL injection detection, anomalous access, vulnerability assessment |
| **Defender for Containers** | AKS, ACR, Kubernetes | Container image scanning, runtime threat detection |
| **Defender for Key Vault** | Key Vaults | Anomalous access (unusual IP, unusual operations) |
| **Defender for App Service** | App Service apps | Dangling DNS detection, anomalous requests |
| **Defender for Resource Manager** | ARM operations | Suspicious management operations |

### Compliance Frameworks

Defender for Cloud evaluates your environment against **compliance standards**:

- **Microsoft Cloud Security Benchmark (MCSB)** — enabled by default. Microsoft's own best practices.
- **NIST SP 800-53** — US government standard.
- **SOC 2 Type 2** — service organization controls.
- **ISO 27001** — international information security standard.
- **PCI DSS** — payment card industry.

You can add standards from the **Regulatory compliance** dashboard. Custom standards can be created using Azure Policy initiatives.

> 🚨 **Exam trap:** The default standard is **MCSB** (Microsoft Cloud Security Benchmark), not NIST or ISO. You can add additional standards, but MCSB is always present.

### Multi-Cloud Support

Defender for Cloud supports:
- **AWS** — via AWS connector. Supports CSPM and CWPP for AWS resources.
- **GCP** — via GCP connector. Same capabilities.
- **Alibaba** — **NOT supported**.

> 🚨 **Exam trap:** If the question asks "Which cloud providers does Defender for Cloud support for workload protection?" the answer includes Azure, AWS, and GCP. Alibaba is NOT supported.

### Defender EASM (External Attack Surface Management)

**EASM** discovers and maps your organization's external-facing assets:
- IP addresses, ASNs (Autonomous System Numbers)
- Hostnames and domains
- SSL certificates
- Web applications

EASM scans the internet for assets linked to your organization and identifies exposures (e.g. expired certificates, open ports, vulnerable services).

### Agentless Scanning

Defender for Cloud supports **agentless scanning** for VMs. Instead of installing an agent, Azure takes a snapshot of the VM disk and analyzes it outside the VM. Benefits:
- No agent to deploy or manage.
- No performance impact on the VM.
- Discovers vulnerabilities, installed software, secrets stored on disk.

Agentless scanning requires the **Defender for Servers Plan 2** or **Defender CSPM** plan.

### DevOps Security

Defender for Cloud integrates with DevOps platforms to scan code repositories:
- **GitHub** — scan repositories for secrets, vulnerabilities, IaC misconfigurations.
- **Azure DevOps** — same capabilities for Azure Repos.
- **GitLab** — supported as well.

DevOps security provides a **DevOps Security dashboard** in Defender for Cloud showing findings across all connected repositories. It uses tools like **GitHub Advanced Security** and **Microsoft Security DevOps** (a CLI extension).

> 📝 **Worked example (exam-style question — Defender for Cloud protection scope):**
>
> *Question:* You have an Azure subscription that contains VM1, VNET1, storage1, and Vault1. You plan to enable Azure Defender for the subscription. Which resources can be protected?
>
> | Option | Text |
> |--------|------|
> | A | VM1, VNET1, storage1, and Vault1 |
> | B | VM1, VNET1, and storage1 only |
> | C | VM1, storage1, and Vault1 only |
> | D | VM1 and storage1 only |
>
> *Correct answer:* **A — All four resources.** Defender for Servers protects VM1. Defender for Storage protects storage1. Defender for Key Vault protects Vault1. Virtual networks benefit from network-level threat detection (Defender for Resource Manager monitors management operations, and network analytics detect anomalous traffic patterns).

## Part 4: Workflow Automation — Logic Apps and Defender for Cloud

### How Workflow Automation Works

**Workflow automation** in Defender for Cloud triggers a **Logic App** when a security alert or recommendation occurs. The pipeline:

1. Defender for Cloud generates an **alert** or **recommendation**.
2. A **workflow automation** rule matches the trigger condition.
3. The rule triggers a **Logic App** (the playbook).
4. The Logic App performs actions: send email, create ticket, block IP, etc.

### Prerequisites

- The **Logic App must be created first** — you cannot create it during workflow automation setup.
- To modify a workflow automation, you need the **Logic App Contributor** role (to edit the Logic App).
- The Logic App runs with its own identity — configure the Logic App's managed identity or connection credentials.

> 📝 **Worked example (exam-style question — Workflow automation prerequisites):**
>
> *Question:* You need to create a workflow automation in Defender for Cloud that sends an email when a high-severity alert is generated. What must you create first?
>
> | Option | Text |
> |--------|------|
> | A | An Azure Automation runbook |
> | B | An Azure Function |
> | C | A Logic App |
> | D | A Data Collection Rule |
>
> *Correct answer:* **C — A Logic App.** Workflow automations in Defender for Cloud are backed by Logic Apps. You must create the Logic App first, then reference it in the workflow automation. Runbooks and Functions are for other automation scenarios, not Defender for Cloud workflow automation.

> 📝 **Worked example (exam-style question — Modify workflow automation):**
>
> *Question:* You have a workflow automation named WF1 that sends email notifications. You need to change the email recipient. What should you use?
>
> *Correct answer:* **Azure Logic Apps Designer.** The email recipient is configured inside the Logic App, not in Defender for Cloud. Open the Logic App in the Logic Apps Designer and modify the "Send email" action.

## Part 5: Azure Monitor and Data Collection Rules (DCRs)

### Azure Monitor Overview

**Azure Monitor** is the centralized monitoring platform for Azure. It collects, analyzes, and acts on telemetry data.

**Data sources:**
- **Platform metrics** — automatically collected from Azure resources (CPU, memory, network).
- **Resource logs** (formerly diagnostic logs) — detailed operational logs from Azure resources. Must be enabled and routed to a destination.
- **Guest OS logs** — from inside VMs (Windows Event Logs, syslog, performance counters). Require an agent.
- **Application logs** — from Application Insights (code-level telemetry).

### Diagnostic Settings

To collect **resource logs** from an Azure resource, you configure **diagnostic settings** that route logs to a destination:

| Destination | Use case |
|-------------|----------|
| **Log Analytics workspace** | Query with KQL, create alerts, integrate with Sentinel |
| **Storage account** | Long-term archival, compliance |
| **Event Hub** | Stream to third-party SIEM or external tools |

### Data Collection Rules (DCRs)

**DCRs** define what data to collect from VMs and where to send it. They replace the old agent-based configuration.

- DCR specifies: which logs/counters to collect (e.g. Windows Security events, syslog), filtering rules, and destination (Log Analytics workspace).
- DCRs are associated with VMs via **Data Collection Rule Associations** — you can associate one DCR with multiple VMs.
- DCRs work with the **Azure Monitor Agent** (AMA) — the modern agent replacing the legacy Log Analytics agent (MMA).

### Log Analytics Workspace

**Log Analytics workspace** is the central store for log data. You write **KQL (Kusto Query Language)** queries to analyze the data. Both Azure Monitor and Microsoft Sentinel use Log Analytics workspaces.

**Retention:**
- Default: 30 days (free tier) or 90 days (paid).
- Maximum: Up to 730 days (2 years) for specific tables.
- For longer retention: archive to storage account.

> 📝 **Worked example (exam-style question — Diagnostic logs + KQL + retention):**
>
> *Question:* You need to store Azure AD diagnostic logs and query them using KQL. Logs must be retained for 2 years. What should you use as the destination?
>
> *Correct answer:* **Log Analytics workspace.** KQL queries run against Log Analytics. Storage accounts support long-term retention but do not support KQL. Event Hubs are for streaming, not querying. Log Analytics supports up to 730 days (2 years) retention for specific tables.

## Part 6: Microsoft Sentinel — Complete Guide

### What Microsoft Sentinel Is

**Microsoft Sentinel** is a cloud-native **SIEM** (Security Information and Event Management) and **SOAR** (Security Orchestration, Automated Response). It collects security data from across your environment, detects threats, investigates incidents, and automates responses.

Sentinel runs on top of a **Log Analytics workspace**. All data ingested by Sentinel is stored in Log Analytics tables and queried with KQL.

### The Sentinel Pipeline

The full pipeline from data to response:

```
Data sources → Data connectors → Log Analytics tables → Analytics rules → Incidents → Playbooks (automation)
```

1. **Data connectors** ingest data from Azure services, Microsoft 365, third-party sources.
2. **Analytics rules** detect threats and create **incidents**.
3. **Incidents** group related alerts for investigation.
4. **Playbooks** (Logic Apps) automate the response.

### Data Connectors

Data connectors bring data into Sentinel. Common connectors:

| Connector | Data source | Log table |
|-----------|------------|-----------|
| **Azure Activity** | Azure management operations | AzureActivity |
| **Azure AD** | Sign-in logs, audit logs | SigninLogs, AuditLogs |
| **Microsoft Defender for Cloud** | Security alerts | SecurityAlert |
| **Microsoft 365 Defender** | Incidents from Defender suite | SecurityIncident |
| **CEF (Common Event Format)** | Third-party firewalls, IDS/IPS | CommonSecurityLog |
| **Syslog** | Linux devices, network appliances | Syslog |
| **Azure Firewall** | Firewall logs | AzureDiagnostics |
| **Windows Security Events** | Windows Event Logs | SecurityEvent |

### CEF Ingestion — How It Works

**CEF (Common Event Format)** is a standard log format used by many third-party security devices (Palo Alto, Fortinet, Check Point). To ingest CEF into Sentinel:

1. Deploy a **Linux VM** as a syslog forwarder.
2. Install the **Log Analytics agent** on the Linux VM.
3. Configure the NVA/firewall to send CEF messages to the Linux VM (syslog port 514).
4. The agent parses CEF messages and forwards them to the Log Analytics workspace.
5. Data appears in the **CommonSecurityLog** table.

> 🚨 **Exam trap:** CEF ingestion requires a **Log Analytics agent on a Linux VM** as a syslog forwarder. It does NOT use Event Hubs, Event Grid, or Azure Functions. The Linux VM must be network-accessible from the devices sending CEF messages.

### Sentinel Log Tables — Know Which Table for Which Data

| Data source | Sentinel table |
|-------------|---------------|
| Azure AD Identity Protection alerts | **SecurityAlert** |
| CEF from firewalls/NVAs | **CommonSecurityLog** |
| Azure Firewall logs | **AzureDiagnostics** |
| Windows Security events | **SecurityEvent** |
| Azure Activity logs | **AzureActivity** |
| Custom logs | **Custom_CL** |

### Analytics Rules — Threat Detection

Analytics rules run queries against Sentinel data to detect threats and create incidents. There are four types:

| Rule type | How it works | Customizable? | Frequency |
|-----------|------------|---------------|-----------|
| **Fusion** | Machine learning correlates low-fidelity alerts from multiple sources into high-fidelity incidents | No (Microsoft-managed) | Continuous |
| **Microsoft Security** | Creates incidents directly from Microsoft security product alerts (Defender for Cloud, Defender for Identity, etc.) | Limited (filter by severity) | Real-time |
| **Scheduled** | Runs a **KQL query** on a schedule. You write the query, set the frequency, and define the threshold. | **Fully customizable** | You define (e.g. every 5 min, every hour) |
| **NRT (Near-Real-Time)** | Like Scheduled but runs **every minute**. Uses KQL. Faster detection but higher cost. | Fully customizable | Every ~1 minute |

> 🚨 **Exam trap:** If you need a rule based on a **custom KQL query**, the answer is **Scheduled** (or NRT for faster detection). Fusion and Microsoft Security rules do NOT support custom KQL queries. Fusion uses ML correlation. Microsoft Security creates incidents from existing product alerts.

> 📝 **Worked example (exam-style question — Analytics rule type):**
>
> *Scenario:* You have an Azure Sentinel workspace with an Azure AD connector. You create a KQL query named Query1 that returns security events from Azure AD. You plan to create an analytic rule based on Query1 that will trigger Playbook1.
>
> *Question:* What type of analytic rule should you create?
>
> *Correct answer:* **Scheduled.** Only Scheduled (and NRT) rules support custom KQL queries. Fusion uses ML (no custom queries). Microsoft Security creates incidents from product alerts (no custom queries). Since Query1 is a custom KQL query, Scheduled is the correct rule type.

### Playbooks — Automated Response

**Sentinel playbooks** are **Logic Apps** with Sentinel-specific triggers and connectors. When an incident is created, the playbook can:
- Send email notifications.
- Create a ticket in ServiceNow, Jira, or other ITSM.
- Block an IP address on the firewall.
- Isolate a VM.
- Run an Azure Function (e.g. trigger a firewall script).

> 📝 **Worked example (exam-style question — Sentinel pipeline):**
>
> *Scenario:* You have Sentinel, Security Center standard tier, 30 VMs, an NVA with firewall software, and an Azure Function with a firewall rule script. When a high-priority alert is generated for a VM, you need: (1) incident created in Sentinel, (2) firewall rule script triggered.
>
> *Question:* Which Sentinel components do you configure?
>
> | Requirement | Component |
> |-------------|-----------|
> | Ingest Security Center alerts into Sentinel | **Microsoft Defender for Cloud data connector** |
> | Create incident from alert | **Analytics rule** (Microsoft Security type or Scheduled) |
> | Trigger firewall script | **Playbook** (Logic App that calls the Azure Function) |
>
> **Key rule:** Full Sentinel pipeline: **Data connector** (ingests data) → **Analytics rule** (detects and creates incidents) → **Playbook** (automates response). Each component has a distinct role.

> 📝 **Worked example (exam-style question — Sentinel VM connectivity):**
>
> *Scenario:* You have two Log Analytics workspaces: Workspace1 and Workspace2. You deploy Sentinel on Workspace1. You have four VMs:
>
> | VM | Connected to workspace |
> |----|----------------------|
> | VM1 | Workspace1 |
> | VM2 | Workspace1 |
> | VM3 | Workspace2 |
> | VM4 | Workspace2 |
>
> You plan to use Sentinel to monitor Windows Defender Firewall on the VMs. Which VMs can you connect to Sentinel?
>
> *Correct answer:* **All four — VM1, VM2, VM3, and VM4.** Sentinel can collect data from VMs connected to **any** Log Analytics workspace, not just the workspace where Sentinel is deployed. The Windows Firewall data connector works with the Log Analytics agent installed on the VMs. VMs can report to different workspaces and Sentinel can ingest from any of them.
>
> 🚨 **Exam trap:** A common mistake is thinking VMs must be in the same workspace as Sentinel. They do not. Sentinel can connect to VMs across different workspaces.

### Workbooks — Visualization

**Sentinel Workbooks** are interactive dashboards built on Azure Monitor Workbooks. They visualize data from Sentinel tables using KQL queries, charts, and grids. Used for threat hunting dashboards, SOC overviews, and investigation reports.

### Bookmarks — Investigation Aids

When hunting for threats in Sentinel logs, you can **bookmark** interesting events. Bookmarks preserve the query results and allow you to annotate them with notes. They are used during investigations to mark evidence.

> 📝 **Worked example (exam-style question — Annotate event for investigation):**
>
> *Question:* While investigating a security incident in Sentinel, you find a suspicious log event. You need to annotate this event for later review by your team. What should you use?
>
> *Correct answer:* **Bookmark.** Bookmarks in Sentinel let you save and annotate log events during threat hunting or investigation. They persist and can be shared with the investigation team.

### Sentinel Notebooks

**Sentinel notebooks** are Jupyter notebooks that run in **Azure Machine Learning**. They allow advanced threat hunting using Python, KQL, and ML libraries. Requirements:
- **1 Azure Machine Learning workspace** (minimum).
- **0 Azure Container Registries** — notebooks do not require a container registry.

> 📝 **Worked example (exam-style question — Sentinel notebooks):**
>
> *Question:* You need to configure support for Azure Sentinel notebooks. What is the minimum number of Azure Container Registries and Azure Machine Learning workspaces required?
>
> | Component | Minimum required |
> |-----------|-----------------|
> | Azure Container Registries | **0** |
> | Azure Machine Learning workspaces | **1** |
>
> *Reasoning:* Sentinel notebooks are Jupyter notebooks running in Azure Machine Learning compute. You need **1 ML workspace**. Container registries are not required — notebooks use pre-built environments provided by the ML workspace.

### Custom Security Policies in Defender for Cloud

You can deploy custom security policies through Defender for Cloud. These are **Azure Policy definitions** assigned at a scope that Defender for Cloud monitors. To deploy a custom policy across subscriptions:

1. Create the policy definition (or initiative).
2. Ensure the **management group hierarchy** is in place.
3. Assign the policy at the management group level.

> 📝 **Worked example (exam-style question — Deploy custom policy in Security Center):**
>
> *Question:* From Azure Security Center, you need to deploy a custom security policy named SecPol1. What should you do first?
>
> | Option | Text |
> |--------|------|
> | A | Enable Azure Defender |
> | B | Create an Azure Management group |
> | C | Create an initiative |
> | D | Configure continuous export |
>
> *Correct answer:* **B — Create an Azure Management group.** Custom security policies are deployed through Azure Policy. To apply them across multiple subscriptions, you first need the management group structure. Enable Azure Defender is for threat protection. Initiatives may be needed later but the first step is the management group. Continuous export is for exporting data, not deploying policies.

## Part 7: Auto-Provisioning and Agent Deployment

### Auto-Provisioning in Defender for Cloud

When you enable auto-provisioning, Defender for Cloud automatically installs the monitoring agent on **all supported Azure VMs** (existing and new). The agent sends data to a Log Analytics workspace.

- **Azure Monitor Agent (AMA)** — the modern agent. Uses Data Collection Rules (DCRs) for configuration.
- **Legacy: Microsoft Monitoring Agent (MMA) / Log Analytics agent** — older agent. Still referenced in exam dumps. Being deprecated.

> 🚨 **Exam trap:** Auto-provisioning installs the agent on **ALL** supported VMs in the subscription — not just new ones. You can exclude VMs by configuring exclusion rules.

## Part 8: 🔬 LAB 08 — Log Analytics + DCR

**Link:** [LAB 08 — Log Analytics + DCR](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_08_CreateaLogAnalyticsworkspaceAzureStorageAccountDataCollectionRule(DCR).html)
**Duration:** ~30 minutes.

In this lab you will:
1. Create a Log Analytics workspace.
2. Create a storage account (for log archival).
3. Create a Data Collection Rule that collects Windows Security events from VMs.
4. Associate the DCR with VMs.

## Part 9: 🔬 LAB 09 — Defender for Cloud: Enhanced Security

**Link:** [LAB 09 — Defender for Cloud](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_09_ConfiguringMicrosoftDefenderforCloudEnhancedSecurityFeaturesforServers.html)
**Duration:** ~30 minutes.

In this lab you will:
1. Enable Defender for Servers plan.
2. Review Secure Score and recommendations.
3. Explore the security alerts dashboard.

## Part 10: 🔬 LAB 10 — JIT VM Access

**Link:** [LAB 10 — JIT VM Access](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_10_Enable%20just-in-time%20access%20on%20VMs.html)
**Duration:** ~30 minutes.

In this lab you will:
1. Enable JIT VM access on a VM.
2. Request access through the portal.
3. Verify NSG rules are updated temporarily.

## Part 11: 🔬 LAB 11 — Microsoft Sentinel

**Link:** [LAB 11 — Microsoft Sentinel](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_11_Microsoft%20Sentinel.html)
**Duration:** ~60 minutes.

In this lab you will:
1. Deploy Microsoft Sentinel on a Log Analytics workspace.
2. Enable data connectors (Azure Activity, Security Center).
3. Create an analytics rule.
4. Create a playbook (Logic App).
5. Investigate a simulated incident.

## Part 12: Extra Practice (30 min)

1. Create Azure Policy "Allowed VM SKUs" with Deny effect → assign to a resource group → try deploying a blocked VM size.
2. Key Vault: create a key, secret, certificate → delete → recover from soft delete → enable purge protection.
3. Configure Key Vault firewall: allow access only from a specific VNet.

## Part 13: Key Facts to Memorize (Day 6 Quick-Reference Card)

| Concept | Key fact |
|---------|----------|
| Initiative | Group of policy definitions |
| Deny effect | Blocks resource creation/update |
| Audit effect | Logs non-compliance; does not block |
| DeployIfNotExists | Auto-deploys related resource; needs managed identity + remediation task |
| Modify effect | Changes resource properties; needs managed identity |
| Multi-subscription policy | Assign initiative at management group scope |
| Key Vault Owner/Contributor | Control plane only; NO data plane access to keys/secrets |
| Key Vault access models | Vault access policy (legacy) or Azure RBAC (recommended) |
| Key Vault firewall | Service Endpoints or Private Endpoint (privatelink.vaultcore.azure.net) |
| Key Vault backup restore | Same Azure geography only; cross-geography NOT supported |
| Agentless scanning | Disk snapshot analysis; requires Defender for Servers P2 or CSPM |
| DevOps security | GitHub, Azure DevOps, GitLab connectors for code scanning |
| Workflow automation | Logic App created first; Logic App Contributor to modify |
| Defender for Cloud CSPM | Secure Score, recommendations, compliance dashboards |
| Defender CWPP plans | Servers, SQL, Storage, Containers, Key Vault, App Service, Resource Manager |
| Multi-cloud | AWS + GCP supported; Alibaba NOT |
| EASM | Maps external attack surface: IPs, ASNs, hostnames, SSL certs |
| Default compliance standard | MCSB (Microsoft Cloud Security Benchmark) |
| Sentinel pipeline | Data connector → Analytics rule → Incident → Playbook |
| Fusion rule | ML-based; correlates low-fidelity alerts; not customizable |
| Scheduled rule | Custom KQL query; you set frequency and threshold |
| NRT rule | Custom KQL; runs every ~1 minute |
| Microsoft Security rule | Creates incidents from Defender product alerts; limited customization |
| CEF ingestion | Log Analytics agent on Linux VM (syslog forwarder) |
| Sentinel tables | SecurityAlert (Defender alerts), CommonSecurityLog (CEF), AzureDiagnostics (Firewall), SecurityEvent (Windows) |
| Playbook | Logic App with Sentinel trigger; automates response |
| Bookmark | Annotate log events during investigation |
| Sentinel notebooks | Azure ML workspace (1 required); 0 container registries |
| Auto-provisioning | Installs agent on ALL supported VMs (existing + new) |
| DCR | Data Collection Rule; defines what to collect and where to send |
| Log Analytics retention | Default 30/90 days; max 730 days (2 years) |

**Day 6 is complete.** This was the highest-weight section (30–35%). Review any section you found difficult, complete all four labs, and re-attempt the worked examples. Proceed to Day 7 (Full Review and Exam Simulation) when you are confident with every concept above.

**Practice questions (exam dump):** Q20, Q21, Q84, Q85, Q111, Q118, Q126, Q134, Q161, Q178, Q186, Q187, Q201, Q202, Q204, Q207, Q223, Q224, Q225, Q235, Q242, Q244 — these are covered by the concepts and worked examples in this guide.
