# AZ-500 Exam Preparation: Day 1 — Identity & Access (Part 1): RBAC, PIM, MFA, Conditional Access, Identity Protection

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 1 of your 7-day AZ-500 preparation. Today's focus is Identity and Access, which accounts for 15–20% of the exam. This is not a summary or a list of talking points but also complete, self-contained study guide. If you read every word, work through every example, and complete the lab and Microsoft Learn materials, you will be ready for every identity-related question on the exam.

## Day 1 Official Resources

Before you begin reading, open these links in your browser. You will use them today.

| Resource | Description | Link |
|----------|-------------|------|
| MS Learn Module (Day 1) | The official interactive module covering RBAC, PIM, MFA, Conditional Access, Identity Protection. Complete all units. | [Manage security controls for identity and access](https://learn.microsoft.com/en-us/training/modules/manage-security-controls-identity-access/) |
| Learning Path 1 (full) | The complete "Protect identity and access in Azure" path. Day 1 covers the first module; Day 2 continues with the second. | [Learning Path 1](https://learn.microsoft.com/en-us/training/paths/manage-identity-access-new/) |
| Exam Readiness Video | Microsoft's own 30-minute exam prep video for the identity section. Watch after reading this guide. | [Part 1 of 4: Secure identity and access](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-01-fy25) |
| LAB 01 | Hands-on lab in your Azure subscription: create users/groups, assign RBAC roles, verify access. ~45 minutes. | [LAB 01 — Role-Based Access Control](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_01_RBAC.html) |
| Lab files (ZIP) | Download all lab instructions and ARM templates. | [Download ZIP](https://github.com/MicrosoftLearning/AZ500-AzureSecurityTechnologies/archive/master.zip) |
| AZ-500 certification page | Exam registration, skills measured, and scheduling. | [Azure Security Engineer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/) |

**Recommended schedule for today (4–6 hours):**
1. Block 1 (1.5–2 h): Read this guide + watch the Exam Readiness Video. 
2. Block 2 (1.5–2 h): Complete LAB 01 + extra practice exercises. 
3. Block 3 (1–1.5 h): Work through the exam-style questions embedded in this guide (and any you got wrong, re-read the relevant section).

## Part 1: Two Separate Authorization Systems

Before you touch a single Azure role, you must understand that Azure has **two completely independent authorization systems**. The exam constantly tests whether you can tell them apart.

**Microsoft Entra ID roles** (formerly called Azure AD roles) control access to the **directory** — the identity platform itself. These roles determine who can create users, reset passwords, manage group memberships, configure Conditional Access policies, and handle billing for Microsoft 365. Examples include Global Administrator, User Administrator, Security Administrator, and Privileged Role Administrator. These roles have absolutely nothing to do with Azure VMs, storage accounts, or virtual networks.

**Azure RBAC roles** (resource roles) control access to **Azure resources** deployed inside subscriptions. These roles determine who can create a Virtual Machine, read the configuration of a storage account, delete a virtual network, or manage a Key Vault. Examples include Owner, Contributor, Reader, and User Access Administrator. These roles have nothing to do with resetting passwords or managing Azure AD groups.

> 🚨 **Exam trap:** An Azure subscription **Owner** cannot reset a user's password in Entra ID. They have full control over Azure resources, but the directory is a separate system. Conversely, a **Global Administrator** does not automatically have access to manage Azure resources. There is a special toggle in Entra ID called **"Access management for Azure resources"** (found under Properties of the Entra tenant) that a Global Administrator can enable to grant themselves the **User Access Administrator** role at the root scope of all subscriptions in the tenant. The exam may test whether you know this toggle exists and what it does.

**Why this matters on the exam:** Questions will describe a user with a specific role and ask whether they can perform a specific action. If the question says "User1 has the Contributor role on Subscription1" and asks "Can User1 reset another user's password?", the answer is no — Contributor is an Azure RBAC role and has no authority over directory operations. If the question says "User1 is a User Administrator" and asks "Can User1 create a Virtual Machine?", the answer is again no — User Administrator is a directory role.

## Part 2: Azure Role-Based Access Control (RBAC) — Complete Guide

### What RBAC Is and How It Works

Azure RBAC is the authorization system that governs who can do what with which Azure resources. Every time you click a button in the Azure Portal, run an Azure CLI command, or call the Azure Resource Manager (ARM) REST API, Azure checks your RBAC permissions to decide whether to allow or deny the operation.

Every RBAC assignment consists of exactly three components:

**1. Security principal (who):** This is the identity requesting access. It can be a **user** (a human with an Entra ID account), a **group** (a collection of users — assigning a role to a group gives every member that role), a **service principal** (an identity used by an application or automation script), or a **managed identity** (a special type of service principal that Azure creates and manages automatically for you — you will learn more about this on Day 2).

**2. Role definition (what):** This is the set of permissions being granted. A role definition is a JSON object that lists all the operations the role is allowed to perform. Azure has over 100 built-in role definitions (like Owner, Contributor, Reader), and you can also create custom ones.

**3. Scope (where):** This is the boundary where the permissions apply. Scopes in Azure are organized in a strict hierarchy, and this hierarchy is fundamental to understanding RBAC.

### The Scope Hierarchy and Inheritance

Azure organizes resources into four levels, from broadest to narrowest:

| Level | What it is | Example |
|-------|-----------|---------|
| **Management group** | A container that groups multiple subscriptions. Used by large organizations to manage policies and access across many subscriptions at once. | "Contoso-MG" containing Production and Development subscriptions |
| **Subscription** | A billing and resource boundary. All resources you create belong to a subscription. | "Sub-Production" |
| **Resource group** | A logical container within a subscription. Groups related resources together (e.g. all resources for a web application). | "RG-WebApp" containing a VM, a storage account, and a database |
| **Resource** | A single Azure service instance. | "StorageAccount1" or "VM-Web01" |

**The inheritance rule:** When you assign a role at a higher scope, that permission automatically flows down to all child scopes below it. For example, if you assign User1 the **Contributor** role at the **Subscription** level, User1 automatically has Contributor access to every resource group and every individual resource inside that subscription. You do not need to assign the role again at each resource group.

This is powerful but also dangerous. If you assign Owner at the Management Group level, that user becomes Owner of every subscription, every resource group, and every resource underneath. Always follow the principle of least privilege: assign roles at the narrowest scope that makes sense.

**Important:** Standard Azure RBAC is an "additive" (allow-only) model. There is no built-in "Deny assignment" that you can manually create to block inherited permissions. (Azure Blueprints can create Deny assignments, but you cannot create them yourself through the Portal or CLI.) If you need to limit what an inherited role can do, the correct approach is to assign the role at a narrower scope in the first place, or to use resource locks.

### The Four Built-in Roles You Must Memorize

The exam tests your ability to instantly recognize the boundaries of these roles:

| Role | Can manage resources? | Can assign roles to others? | Real-world analogy |
|------|----------------------|----------------------------|-------------------|
| **Owner** | Yes — full control (create, read, update, delete) | **Yes** — can grant/revoke access for other users | The landlord: owns the building and decides who gets keys |
| **Contributor** | Yes — full control (create, read, update, delete) | **No** — cannot change who has access | The building manager: can renovate rooms but cannot hand out keys |
| **Reader** | **Read only** — can view resources but cannot change anything | No | A visitor with a window: can look but cannot touch |
| **User Access Administrator** | **No** — cannot create, modify, or delete resources | **Yes** — can manage role assignments | The security guard: cannot renovate, but decides who enters |

> 🚨 **Exam trap:** Many questions test the difference between **Owner** and **Contributor**. The only difference is that Owner can assign roles (manage access), while Contributor cannot. Both can create, modify, and delete resources. If a question asks "Which role can create a VM and also grant another user access to it?", the answer is Owner. If it asks "Which role can create a VM but cannot grant access to others?", the answer is Contributor.

### Resource Locks: The Forgotten Restriction

Resource locks are not RBAC roles, but they interact with RBAC in ways the exam tests. A resource lock overrides the permissions granted by RBAC roles — even for Owners.

**Delete lock (CanNotDelete):** Users can read and modify the resource normally, but nobody — not even an Owner — can delete it. You must remove the lock first, then delete the resource.

**ReadOnly lock:** This is far more restrictive than most students expect. A ReadOnly lock effectively reduces every user to **Reader-level access** on that resource, regardless of their actual RBAC role. This means:
- You **cannot** delete, modify, resize, or reconfigure the resource.
- You **cannot** start, stop, or restart a Virtual Machine (because starting a VM is a POST operation, which counts as a write).
- You **can** read the resource's properties and configuration.

> 🚨 **Exam trap:** Students often assume "ReadOnly lock means I can't delete it." That is true, but it goes much further. Even **starting a VM** is blocked by a ReadOnly lock. If the exam describes a VM with a ReadOnly lock and asks "Can User1 (Owner) start this VM?", the answer is **no**.

> 🎯 **Exam scenario:**
> *Scenario:* You have a resource group with a ReadOnly lock. Inside the resource group there is a Virtual Machine. User1 has the Owner role on the resource group.
> *Statement 1:* "You can create a VM in this resource group." — **No.** Creating a resource is a write operation, and the ReadOnly lock blocks all writes.
> *Statement 2:* "You can start the existing VM." — **No.** Starting a VM sends a POST request (a write operation). The ReadOnly lock blocks it.
> *Statement 3:* "You can resize the existing VM." — **No.** Resizing is a PATCH/PUT operation (a write). Blocked.
> The lesson: ReadOnly locks are the strictest form of protection. You can only *view* the resource.

### Custom Roles: When Built-in Roles Are Not Enough

Sometimes none of the 100+ built-in roles match what you need. For example, you want a user who can restart VMs but not delete them, or a user who can manage Application Security Groups but not Virtual Networks. In these cases, you create a **custom role**.

**How to create a custom role in the Azure Portal:**
1. Navigate to the Subscription (or Resource Group) where you want the role to be assignable.
2. Click **Access control (IAM)** in the left menu.
3. Click the **Roles** tab, then click **+ Add → Add custom role**.
4. Choose your starting point: **Start from scratch**, **Clone an existing role** (recommended — pick a similar built-in role and modify it), or **Start from JSON** (upload a prepared JSON file).
5. On the **Permissions** tab, add the specific Actions and/or DataActions you want to allow, and add NotActions/NotDataActions for anything you want to explicitly exclude.
6. On the **Assignable scopes** tab, specify where this custom role can be assigned (e.g. a specific subscription or resource group).
7. Review and click **Create**.

**How to create a custom role with PowerShell:**

```powershell
New-AzRoleDefinition -InputFile "C:\Roles\custom-vm-operator.json"
```

**How to create a custom role with Azure CLI:**

```bash
az role definition create --role-definition "custom-vm-operator.json"
```

### Understanding the Custom Role JSON: Actions, DataActions, and Scopes

The JSON file (or the Portal form) contains these critical arrays:

**`Actions[]` — Management plane permissions.**
These control operations on the Azure resource itself, through the Azure Resource Manager (ARM) API. Think of the management plane as "the Azure Portal view" of a resource — its name, its configuration, its tags, its firewall rules, its SKU. When you read a storage account's properties, create a VM, or change a virtual network's address space, you are operating on the management plane.

Example Actions:
- `Microsoft.Compute/virtualMachines/read` — view VM properties
- `Microsoft.Compute/virtualMachines/start/action` — start a VM
- `Microsoft.Storage/storageAccounts/read` — view storage account config
- `Microsoft.Network/networkSecurityGroups/write` — create or modify an NSG

**`DataActions[]` — Data plane permissions.**
These control operations on the *data inside* the resource. The data plane is the actual content — the blobs inside a storage container, the rows inside a SQL table, the messages in a Service Bus queue, the secrets inside a Key Vault. Management plane access does NOT grant data plane access, and vice versa. They are completely independent.

Example DataActions:
- `Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read` — read blob data
- `Microsoft.KeyVault/vaults/secrets/getSecret/action` — retrieve a secret from Key Vault

**`NotActions[]` and `NotDataActions[]`** — These subtract permissions. If you grant `Microsoft.Compute/*/read` in Actions (which allows reading everything under Compute), but add `Microsoft.Compute/virtualMachines/delete` to NotActions, the user can read everything but cannot delete VMs.

**`AssignableScopes[]`** — This array defines where the custom role can be assigned. It does NOT grant permissions by itself — it only makes the role visible and available for assignment at those scopes. For example, if you set `"/subscriptions/abc123"`, this custom role will only appear in the role-picker for that specific subscription.

> 🚨 **Exam trap:** The exam loves testing whether you understand the distinction between Actions and DataActions. Here is how they test it:
>
> 📝 **Worked example (exam-style question):**
> *Question:* You plan to create a custom RBAC role that will provide permission to **read the Azure Storage account**. Which property should you configure?
> A. `NotActions[]`
> B. `DataActions[]`
> C. `AssignableScopes[]`
> D. `Actions[]`
>
> *Correct answer:* **D — `Actions[]`**
> *Explanation:* "Read the Azure Storage account" means viewing the account's properties (its name, its region, its replication type, its firewall settings). This is a management plane operation, so it belongs in `Actions`. If the question had said "read the data stored in the blobs within the storage account," the answer would be `DataActions`. Option A (`NotActions`) is for *subtracting* permissions, not granting them. Option C (`AssignableScopes`) controls *where* the role can be assigned, not what it can do.

## Part 3: Privileged Identity Management (PIM) — Complete Guide

### Why PIM Exists

In any organization, some users need powerful roles like Global Administrator, Owner, or Contributor to do their jobs. The problem is that if these roles are permanently assigned ("always on"), the risk is enormous: if an attacker compromises one of these accounts, they instantly have full admin access 24 hours a day, 7 days a week.

PIM solves this by implementing **just-in-time (JIT) privileged access**. Instead of permanently holding a powerful role, a user receives an "eligible" assignment. They can *request* activation of the role when they actually need it, and the role automatically deactivates after a set time (e.g., 1–8 hours). This dramatically reduces the window of exposure.

### PIM Prerequisites

**Licensing:** PIM requires **Azure AD Premium P2** licenses. If your organization has only P1 (or Free/Basic), PIM is not available. The exam tests this — if a question describes a P1 tenant and asks about PIM, the answer likely involves upgrading to P2.

**Who can enable PIM for the first time:** The initial onboarding of PIM (turning it on in a tenant for the very first time) can only be done by a **Global Administrator**. No other role — not even Privileged Role Administrator — can perform the initial enablement. After PIM is enabled, a Privileged Role Administrator can manage it day-to-day (assign eligible roles, configure settings), but they cannot do the first onboarding.

> 🚨 **Exam trap:** If the question asks "Which users can **enable** PIM?" and the user table shows users with Global Administrator, Privileged Role Administrator, and Security Administrator roles, the answer is **only the Global Administrators**. Privileged Role Administrator sounds like the right answer, but it can only manage PIM *after* someone else enables it.
>
> 📝 **Worked example (exam-style question):**
> *Question:* Your tenant has: User1 (Global Administrator), User2 (Global Administrator), User3 (Privileged Role Administrator). Which users can enable PIM?
> A. User2 and User3 only
> B. User1 and User2 only
> C. User2 only
> D. User1 only
>
> *Correct answer:* **B — User1 and User2 only.** Both are Global Administrators, so both can enable PIM. User3, despite the impressive title, cannot perform the initial enablement.

### The PIM Activation Sequence

When a Global Administrator enables PIM for the first time, the portal walks them through three steps in a specific order. The exam tests this as a drag-and-drop (ordering) question:

**Step 1: Consent to PIM.** When you first navigate to the PIM blade in the Azure Portal, you must accept the terms and consent to enable PIM for your directory.

**Step 2: Verify your identity using Multi-Factor Authentication (MFA).** After consenting, Azure requires you to prove your identity with MFA. Even if MFA is not currently configured for the user, they will be forced to set it up right then and there. This is a mandatory security step.

**Step 3: Sign up PIM for Azure AD roles.** After consent and MFA verification, you enroll PIM to manage Azure AD roles. This activates the service.

Note that **"Sign in as a Global Administrator"** is a prerequisite (you must already be signed in as one), but it is not one of the three ordered steps. If the exam gives you five possible actions and asks you to pick three and order them, the answer is always: **Consent → MFA → Sign up**.

### Eligible vs. Active Assignments

When you assign a privileged role to a user through PIM, you choose one of two assignment types:

| Assignment type | What happens | When to use |
|----------------|-------------|-------------|
| **Eligible** | The user does **not** hold the role by default. They see it listed as "eligible" in the PIM blade. To actually get the permissions, they must click **Activate**, satisfy any requirements (MFA, approval, justification), and then the role becomes active for a limited duration (e.g. 2 hours). After the duration expires, the role deactivates automatically. | This is the recommended, secure approach for all privileged roles. |
| **Active** | The user holds the role **permanently and constantly**. No activation step is required. They have the permissions the moment they sign in. | Use only for emergency "break-glass" accounts or very specific scenarios where JIT is impractical. |

A subtle detail: an assignment can be "Eligible + Permanent" or "Eligible + Time-limited." "Permanent" here means the user has the **right to request activation** indefinitely (they can always go activate it). "Time-limited" means the eligibility itself expires on a specific date (e.g. the user can only request activation until December 31). The **activation duration** (e.g. 2 hours) is separate — it controls how long the role stays active after the user clicks Activate.

### PIM Activation Requirements

When you configure a role's settings in PIM, you can enforce several conditions that a user must satisfy every time they activate:

**1. Require MFA for activation.**
If enabled, the user must complete MFA before the role activates. Here is the critical detail: even if the user's MFA status in the directory is "Disabled" (meaning they have never registered for MFA), **PIM overrides this and forces them to register for MFA on the spot during the activation process.** The user's MFA "Disabled" status does not prevent PIM from requiring MFA — PIM simply forces them through the MFA setup flow.

**2. Require approval.**
If enabled, the activation request is sent to a designated approver (a specific user or group). The role does not activate until the approver clicks "Approve" in the PIM blade.

> 🚨 **Exam trap: Self-approval is blocked.** If User A requests to activate a role, and User A is a member of the group designated as the approver, **User A cannot approve their own request.** PIM explicitly prevents this. Another member of the approver group must do the approval. This is a security control to prevent a user from bypassing the approval process.

**3. Require justification or ticket number.**
If enabled, the user must type a reason for activation or provide a ticket number from their helpdesk system.

**4. Maximum activation duration.**
This setting controls how long the role stays active after approval. For example, if set to 2 hours, the role automatically deactivates 2 hours after activation, and the user must request activation again if they need more time.

> 🎯 **Exam scenario (multi-statement):**
>
> *Scenario:* You have three users in contoso.com:
>
> | User | Member of | MFA status |
> |------|-----------|------------|
> | User1 | None | Disabled |
> | User2 | Group1 | Disabled |
> | User3 | Group1 | Enforced |
>
> PIM is configured for the Password Administrator role with these settings: Maximum activation = 2 hours, Require MFA = Enabled, Require approval = Enabled, Approver = Group1.
>
> Assignments: User1 = **Active**, User2 = **Eligible**, User3 = **Eligible**.
>
> *Statement 1:* "When User1 signs in, the user is assigned the Password Administrator role automatically."
> **Answer: Yes.** User1 has an Active assignment. Active means the role is permanently assigned — User1 has the Password Administrator role every time they sign in. The PIM activation requirements (MFA, approval) do not apply to Active assignments; those only apply when an Eligible user clicks "Activate."
>
> *Statement 2:* "User2 can request to activate the Password Administrator role."
> **Answer: Yes.** User2 has an Eligible assignment, so they can request activation. The fact that User2's MFA status is "Disabled" does not prevent them from requesting activation. PIM will force User2 to register for MFA during the activation process.
>
> *Statement 3:* "If User3 wants to activate the Password Administrator role, the user can approve their own request."
> **Answer: No.** User3 is a member of Group1 (the designated approver group). However, PIM blocks self-approval. User3 cannot approve their own activation request. User2 (the other member of Group1) must approve it.

### PIM Alerts

PIM continuously monitors your tenant's privileged access and generates alerts for suspicious or misconfigured situations. The exam tests one specific alert:

**"Potential stale accounts in a privileged role"** — This alert fires when users in privileged roles have not signed in or used their role for a period of time (default: 90 days). If your organization's password policy requires changes every 180 days, the 90-day default will generate unnecessary alerts for users who simply haven't used their role recently but whose passwords are still within policy. You can **modify the alert's threshold** (e.g. change it from 90 to 180 days) to match your policy and reduce false positives.

> 📝 **Worked example (exam-style question):**
> *Question:* You enable PIM. Your policy says passwords must change every 180 days. You receive alerts about admins who haven't changed their password in 90 days. You need to minimize the number of generated alerts. Which PIM alert should you modify?
> A. Roles don't require MFA for activation.
> B. Administrators aren't using their privileged roles.
> C. Roles are being assigned outside of PIM.
> D. Potential stale accounts in a privileged role.
>
> *Correct answer:* **D.** The alert about stale accounts has a configurable threshold. Changing it from 90 days to 180 days will stop false positives for users who are within your policy. Option B sounds similar but is about role *usage*, not password changes. Options A and C describe different alert types entirely.

## Part 4: Multi-Factor Authentication (MFA) — Complete Guide

### What MFA Is

Multi-Factor Authentication requires users to provide **two or more forms of proof** when they sign in. The three categories are:
- **Something you know:** A password or PIN.
- **Something you have:** A phone (for SMS or app notification), a hardware token, or a FIDO2 security key.
- **Something you are:** Biometrics (fingerprint, face recognition via Windows Hello).

Even if an attacker steals a user's password, they cannot sign in without the second factor. This is why MFA is considered one of the single most effective security controls.

### MFA User States (Per-User MFA)

When you manage MFA on a per-user basis (the legacy approach — now largely replaced by Conditional Access), each user has one of three states:

| State | What it means |
|-------|--------------|
| **Disabled** | The default. The user only needs a password. MFA is not active. |
| **Enabled** | The user has been flagged for MFA but has not yet completed the MFA registration process. The next time they sign in, they will be prompted to set up their second factor (e.g. install the Authenticator app, register a phone number). |
| **Enforced** | The user has completed MFA registration. MFA is required at every sign-in (unless bypassed by Conditional Access or Trusted IPs). |

### Trusted IPs: Skipping MFA for Corporate Networks

In the legacy MFA settings (Azure Portal → Entra ID → Security → MFA → Additional cloud-based MFA settings), there is a setting called **Trusted IPs**. You enter one or more public IP address ranges (e.g. your headquarters' outgoing NAT IP `173.205.0.0/16`). When a user signs in from an IP address within a Trusted IP range, **MFA is completely skipped** — they only need their password.

This is different from Conditional Access **named locations** (which are used in Conditional Access policies, covered below). Trusted IPs in the legacy MFA settings directly bypass MFA without any policy evaluation.

> 🚨 **Exam trap:** If a user signs in from a Trusted IP, they do **not** get the MFA prompt. If they sign in from any other IP, they do. The exam tests this with scenarios involving two offices where only one office's IP is in the Trusted IPs list.
>
> 🎯 **Exam scenario (multi-statement):**
> *Scenario:* Seattle office public IP: `131.107.0.0/16`. New York office public IP: `173.205.0.0/16`.
> MFA Trusted IPs are configured as: `173.205.0.0/16` (New York only).
> Available MFA verification methods: Call to phone, Text message, App notification, Verification code.
> User1 is in Seattle. User2 is in New York.
>
> *Statement 1:* "When User1 signs in from Seattle, she must perform MFA."
> **Answer: Yes.** Seattle's IP (`131.107.0.0/16`) is not in the Trusted IPs list. MFA is required.
>
> *Statement 2:* "When User1 signs in from Seattle, she must use the Microsoft Authenticator app."
> **Answer: No.** MFA is required, but the user can choose *any* of the configured verification methods (phone call, SMS, app notification, or verification code). The Authenticator app is not the only option.
>
> *Statement 3:* "When User2 signs in from New York, he must perform MFA."
> **Answer: No.** New York's IP (`173.205.0.0/16`) is in the Trusted IPs list. MFA is entirely skipped.

### Other Authentication Methods (Awareness for Day 1)

You should be aware of these methods, which are covered in depth in the MS Learn module:

**Password protection:** Azure AD automatically blocks commonly used weak passwords (e.g. "Password1", "Welcome123"). You can also create a **custom banned password list** to block company-specific passwords (e.g. "Contoso2026!"). This works for both cloud-only users and on-premises users (via Azure AD Password Protection agents on domain controllers).

**Passwordless authentication:** Eliminates the password entirely. Three methods are supported: **Windows Hello for Business** (biometric/PIN tied to the device), **Microsoft Authenticator** (approve a notification on your phone), and **FIDO2 security keys** (physical USB/NFC keys). To enable these, go to Azure Portal → Entra ID → Security → Authentication methods.

**Single Sign-On (SSO):** Allows users to sign in once and access multiple applications without re-entering credentials. Configure in Entra ID → Enterprise applications → select the app → Single sign-on. Azure AD supports SSO via SAML, OpenID Connect/OAuth 2.0, and password-based SSO.

**Modern authentication protocols:** The exam may ask you to recommend OAuth 2.0 and OpenID Connect over legacy protocols like Basic Authentication or NTLM. You can enforce this using Conditional Access policies that block legacy authentication.

## Part 5: Conditional Access — Complete Guide

### What Conditional Access Is

Conditional Access is the **policy engine** that evaluates conditions (signals) and makes access decisions. Think of it as an "if-then" gate that sits between the user and the resource:

- **IF** the user is a member of the "Finance" group **AND** they are signing in from an unknown location, **THEN** require MFA.
- **IF** the user is accessing Azure Management (the portal) **AND** they are on a non-compliant device, **THEN** block access.

**Licensing:** Conditional Access requires at minimum **Azure AD Premium P1**. Risk-based conditions (using Identity Protection signals like sign-in risk or user risk) require **P2**.

### How a Conditional Access Policy Is Built

Every Conditional Access policy has three sections:

**1. Assignments (who and what):**
- **Users and groups:** Which users or groups does this policy apply to? You can include specific groups (e.g. "All Finance Users") and also exclude specific groups (e.g. "Emergency Access Accounts").
- **Cloud apps or actions:** Which applications are targeted? For example, "Microsoft Azure Management" (the portal), "Office 365", or "All cloud apps."

**2. Conditions (when and where):**
- **Sign-in risk level:** Low, Medium, High (requires P2 and Identity Protection).
- **User risk level:** Low, Medium, High (requires P2 and Identity Protection).
- **Device platforms:** iOS, Android, Windows, macOS.
- **Locations:** Named locations (IP ranges you define) or "All locations."
- **Client apps:** Browser, mobile apps, desktop clients, legacy authentication clients.

**3. Access controls (the decision):**
- **Block access:** Deny the sign-in entirely.
- **Grant access:** Allow but require one or more controls: Require MFA, Require device to be marked as compliant, Require Hybrid Azure AD joined device, Require approved client app.

### The Exclude Override Rule

This is one of the most heavily tested Conditional Access concepts on the AZ-500:

> 🚨 **Exam trap:** **Exclude always takes priority over Include.** If a Conditional Access policy includes "All Users" but excludes "Group A," then anyone who is a member of Group A is **completely exempt** from the policy, even though they are also part of "All Users." Exclude wins. Always.

This is critical for emergency "break-glass" accounts. You should always exclude your break-glass accounts from restrictive Conditional Access policies (like "Block all sign-ins from untrusted locations") to ensure you never lock yourself out of the tenant.

### Named Locations and Trusted IPs (in Conditional Access)

In Conditional Access, you define **named locations** — named IP address ranges or countries/regions. For example, you might create a named location called "Corporate HQ" with IP range `10.0.0.0/8` and another called "Trusted Countries" containing "United States" and "Canada."

You can then use these named locations as conditions in your policies: "If the user is signing in from outside 'Corporate HQ,' require MFA." Or: "If the user is signing in from a country not in 'Trusted Countries,' block access."

Named locations in Conditional Access are different from Trusted IPs in the legacy MFA settings. They serve a similar purpose (identifying safe origins) but are managed in different places and used by different systems.

## Part 6: Microsoft Entra Identity Protection — Complete Guide

### What Identity Protection Is

Identity Protection uses Microsoft's massive threat intelligence network (analyzing billions of sign-ins daily) to automatically detect and respond to identity-based attacks. It assigns **risk scores** to users and sign-ins, and you can create policies that automatically respond to those risks (e.g. force MFA when risk is medium, force password change when risk is high).

**Licensing:** Identity Protection requires **Azure AD Premium P2**. This is a hard requirement. If the exam describes a P1 tenant that wants to configure "user risk policies" or "sign-in risk policies," the correct first step is always to **purchase P2 licenses.**

> 📝 **Worked example (exam-style question):**
> *Question:* You have a tenant linked to Azure AD Premium Plan 1. You plan to implement Identity Protection user risk policies and sign-in risk policies. What should you do first?
> A. Purchase Azure AD Premium Plan 2 licenses.
> B. Register all users for MFA.
> C. Enable security defaults.
> D. Upgrade Azure Security Center to Standard tier.
>
> *Correct answer:* **A.** Identity Protection risk policies require P2. Without P2, you cannot configure them. Options B, C, and D do not enable Identity Protection.

### Sign-in Risk vs. User Risk

These are two fundamentally different types of risk:

| Type | What it measures | Example |
|------|-----------------|---------|
| **Sign-in risk** | The probability that a **specific sign-in attempt** was not made by the legitimate account owner. | A sign-in from an anonymous IP address (Tor), or a sign-in from a location that is "impossible" to reach (e.g. New York and Tokyo within 5 minutes). |
| **User risk** | The probability that the **user's identity has been compromised** overall, regardless of the current sign-in. | Microsoft found this user's email and password pair in a leaked credential database on the dark web. |

**Typical remediation:**
- When **sign-in risk** is elevated: require MFA to verify the person's identity.
- When **user risk** is elevated: force a **password change** immediately, because the old password may be known to attackers.

### The Risk Level Table — You Must Memorize This

Microsoft classifies each type of risky activity into a specific risk level. The exam tests this classification explicitly, and it contains a deliberate cognitive trap.

| Risk event | Risk category | Risk level |
|------------|--------------|------------|
| Users with **leaked credentials** | User risk | **High** |
| Sign-ins from **anonymous IP addresses** (Tor, VPNs) | Sign-in risk | **Medium** |
| **Impossible travel** to atypical locations | Sign-in risk | **Medium** |
| Sign-ins from **infected devices** | Sign-in risk | **Medium** |
| Sign-ins from **unfamiliar locations** | Sign-in risk | **Medium** |
| Sign-ins from IP addresses with **suspicious activity** (malware, botnets) | Sign-in risk | **Low** |

> 🚨 **Exam trap:** This is one of the most common mistakes on the AZ-500, and Microsoft intentionally exploits it. When students read "malware communicating with bot servers" or "suspicious IP activity," their instinct tells them this is a severe threat — surely High or Medium risk. **It is classified as Low risk.** Only leaked credentials are High. Everything else that sounds scary (impossible travel, anonymous IPs, infected devices) is Medium. And "suspicious IP activity" (malware/botnets) is Low.
>
> Why does this matter on the exam? Because questions will present Identity Protection policies with a threshold of "Medium and above" and then ask whether a sign-in from a botnet-infected IP triggers the policy. The answer is **no** — it is Low risk, which is below the Medium threshold.

> 🎯 **Exam scenario (multi-statement):**
>
> *Scenario:* You configure an Identity Protection **user risk policy**: Include Group1, Exclude Group2. Conditions: trigger on **Medium and above** risk. Action: allow access, **require password change**.
>
> User1 is in Group1 (not in Group2). User2 is in Group1 AND Group2. User3 is in Group1 (not in Group2).
>
> *Statement 1:* "If User1 signs in from an **unfamiliar location**, he must change his password."
> **Answer: Yes.** User1 is in Group1 (included) and not in Group2 (not excluded). Unfamiliar location = Medium risk. Medium meets the "Medium and above" threshold. The policy triggers and forces a password change.
>
> *Statement 2:* "If User2 signs in from an **anonymous IP address**, she must change her password."
> **Answer: No.** User2 is in Group1 (included) but also in Group2 (excluded). Because **exclude overrides include**, the policy does not apply to User2 at all. Even though an anonymous IP address is Medium risk (which would trigger the policy), the exclusion means User2 is exempt.
>
> *Statement 3:* "If User3 signs in from a **computer containing malware** communicating with bot servers, he must change his password."
> **Answer: No.** User3 is in Group1 and not excluded. However, malware/botnet communication = "suspicious IP activity" = **Low** risk. The policy threshold is Medium and above. Low is below Medium, so the policy does **not** trigger. User3 is not forced to change their password.

### Implementing Identity Protection (Step by Step)

1. Verify you have **Azure AD Premium P2** licenses.
2. Navigate to **Microsoft Entra ID → Security → Identity Protection**.
3. Configure the **User risk policy**: choose which users/groups to include/exclude, set the risk threshold (e.g. "High" or "Medium and above"), and choose the remediation action (require password change, block access, or allow access with MFA).
4. Configure the **Sign-in risk policy**: choose users/groups, set the risk threshold, and choose the action (typically require MFA).
5. Review the **Risky users** and **Risky sign-ins** reports to investigate flagged events.
6. Use the Identity Protection **dashboard** to monitor your tenant's overall risk posture.

## Part 7: Securing Users, Groups, and External Identities

### Secure Users in Entra ID

Securing users involves layering multiple controls:
- **MFA** (as covered in Part 4) to require a second factor.
- **Conditional Access** (Part 5) to enforce context-aware controls.
- **Password policies** to require strong, non-common passwords.
- **Identity Protection** (Part 6) to detect and respond to compromise.
- **PIM** (Part 3) for users with privileged roles.
- **Azure AD Connect Health** to monitor the synchronization between on-premises AD and Entra ID (if you have a hybrid setup).
- **Security reports** in the Entra ID portal: sign-in logs, audit logs, risky users, risky sign-ins.

### Secure Directory Groups

Groups are how you organize users for role assignments and Conditional Access. Best practices:
- Only add necessary members; review membership regularly.
- Use group expiration policies so inactive groups are automatically cleaned up.
- Assign responsible group owners and require owner approval for membership changes.
- Use **Access Reviews** (part of Entra ID Governance) to periodically verify that group members still need their access. In an access review, you create a **program** (a container for reviews), then a **control** (what is being reviewed — e.g. membership in Group A), and then choose **reviewers** (group owners, selected users, or the members themselves for self-review).

### Deleted Objects: What Can Be Restored?

> 🚨 **Exam trap:** Not all deleted objects can be recovered.
>
> | Object type | Restorable? | Window |
> |-------------|------------|--------|
> | Deleted **users** | Yes | Within **30 days** of deletion |
> | Deleted **Microsoft 365 groups** | Yes | Within **30 days** of deletion |
> | Deleted **Security groups** | **No** | Cannot be restored at all |
>
> Many students assume all groups can be restored. **Security groups cannot be recovered after deletion.** Only Microsoft 365 groups have a "soft delete" window. This catches many test-takers.

### External Identities (Azure AD B2B)

Use external identities when you need to collaborate with people outside your organization (partners, vendors, customers). With **Azure AD B2B collaboration**, you invite external users as "guests" into your tenant. They authenticate using their own identity provider (their own company's Azure AD, a Google account, a Microsoft account) — you do not have to create and manage accounts for them.

Secure external identities by:
- Requiring MFA for guest users (via Conditional Access).
- Using access reviews to periodically check whether guests still need access.
- Monitoring guest activity through sign-in and audit logs.
- Following the principle of least privilege when assigning access.

## Part 8: LAB 01 and Extra Practice

### 🔬 LAB 01 — Role-Based Access Control

**Link:** [LAB 01 — Role-Based Access Control](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_01_RBAC.html)
**Duration:** ~45 minutes.

In this lab you will:
1. **Create users and groups** using three different methods: the Azure Portal, Azure PowerShell, and the Azure CLI. This builds familiarity with all three approaches.
2. **Assign the Virtual Machine Contributor role** to a group. You will observe how all members of the group inherit the role.
3. **Verify access** using the **"Check access"** button in the Access Control (IAM) blade. This is the definitive way to determine what a specific user can and cannot do.

### 🔬 Extra Practice (30 minutes)

After completing LAB 01, do these additional exercises:

1. **Create a custom RBAC role** (in the Portal) that allows only the management of Application Security Groups. Navigate to a subscription → Access control (IAM) → Roles → + Add custom role. Clone the "Network Contributor" role and then remove all Actions except those containing `applicationSecurityGroups`. Save the role and try assigning it.

2. **PIM activation lifecycle** (if you have P2 or a trial): Navigate to Entra ID → Identity Governance → Privileged Identity Management → Azure AD roles. Find a role like "Contributor" and create an **Eligible** assignment for yourself at a resource group scope. Then activate it, observe the time limit, and watch it deactivate when the time expires.

3. **PIM settings configuration**: In PIM, click on a role → Settings. Set **maximum activation duration** to 2 hours, enable **Require MFA on activation**, and enable **Require approval** (choose an approver group). This is exactly what the exam tests in scenario questions.

## Part 9: Key Facts to Memorize (Day 1 Quick-Reference Card)

| Concept | Key fact |
|---------|----------|
| Owner vs. Contributor | Owner can assign roles; Contributor cannot. Both can manage resources. |
| User Access Administrator | Can assign roles but cannot manage resources. |
| ReadOnly lock | Blocks all write operations, including starting/stopping VMs. Even Owners are blocked. |
| Actions vs. DataActions | Actions = management plane (resource config). DataActions = data plane (data inside resource). |
| AssignableScopes | Controls where a custom role can be assigned, not what it can do. |
| PIM licensing | Azure AD Premium P2 required. |
| PIM enablement | Global Administrator only (first time). |
| PIM activation order | Consent → MFA → Sign up. |
| Eligible vs. Active | Eligible = must activate; Active = always on. |
| PIM self-approval | Blocked. Cannot approve your own request. |
| PIM MFA override | PIM forces MFA even if user's MFA status is "Disabled." |
| Conditional Access licensing | P1 minimum; risk-based requires P2. |
| Exclude vs. Include | Exclude always wins. |
| Identity Protection licensing | P2 required. |
| Leaked credentials risk | High. |
| Malware/botnet IP risk | **Low** (not Medium or High). |
| Unfamiliar location risk | Medium. |
| Impossible travel risk | Medium. |
| Anonymous IP risk | Medium. |
| Deleted Security groups | Cannot be restored. |
| Deleted users/M365 groups | Restorable within 30 days. |

**Day 1 is complete.** Review any section you found difficult, re-attempt any worked examples you got wrong, and proceed to Day 2 when you are confident with every concept above.
