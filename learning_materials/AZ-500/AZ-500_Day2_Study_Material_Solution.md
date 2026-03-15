# AZ-500 Exam Preparation: Day 2 — Identity & Access (Part 2): App Registrations, Managed Identities, Conditional Access, Application Proxy

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 2 of your 7-day AZ-500 preparation. Today you continue **Identity and Access** (still part of the 15–20% exam weight). Day 1 covered RBAC, PIM, MFA, Conditional Access basics, and Identity Protection. Today you dive into **application identities**: how apps authenticate to Azure and to each other, how to register and secure them, and how managed identities eliminate the need for stored credentials. You will also deepen your understanding of Conditional Access and learn about Microsoft Entra Application Proxy for secure remote access to on-premises applications.

## Day 2 Official Resources

| Resource | Description | Link |
|----------|-------------|------|
| MS Learn Module (Day 2) | The official module covering app registrations, service principals, managed identities, OAuth, consent, and Application Proxy. Complete all units. | [Manage Microsoft Entra application access](https://learn.microsoft.com/en-us/training/modules/manage-application-access-microsoft-entra-id/) |
| Learning Path 1 (full) | The complete "Protect identity and access in Azure" path. Day 2 is the second module. | [Learning Path 1](https://learn.microsoft.com/en-us/training/paths/manage-identity-access-new/) |
| Exam Readiness Video | Rewatch the identity section for reinforcement. | [Part 1 of 4: Secure identity and access](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-01-fy25) |
| AZ-500 certification page | Exam registration and skills measured. | [Azure Security Engineer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/) |

**Note:** Day 2 has no dedicated official lab. The study plan specifies hands-on practice in the portal (Conditional Access policies, app registration, managed identity on Azure Function). Plan 1.5–2 hours for these exercises.

**Recommended schedule for today (4–6 hours):**
Block 1 (1.5–2 h): Read this guide + complete the MS Learn module.
Block 2 (1.5–2 h): Hands-on practice in the Azure Portal (Conditional Access, app registration, managed identity).
Block 3 (1–1.5 h): Work through the exam-style questions embedded in this guide.

## Part 1: App Registrations vs. Enterprise Applications — The Critical Distinction

Before you configure any app permissions or consent, you must understand the difference between these two concepts. The exam tests this repeatedly.

**App registration** is the act of defining an application in your Entra ID tenant. When you register an app, you create an **application object** — a global definition that describes the app (its name, redirect URIs, which APIs it needs, whether it is single-tenant or multi-tenant). The application object lives in the tenant where the app was registered (the "home" tenant). Think of it as the blueprint: "This app exists, it needs these permissions, and it can be used in these ways."

**Enterprise application** (formerly "service app" or "app instance") is the **local representation** of that app in a specific tenant. When an app is used in a tenant (either because it was registered there or because it was consented to as a multi-tenant app), Entra ID creates an **enterprise application** entry. This entry links to the application object and defines what the app is allowed to do *in that tenant*: which users can access it, what permissions it has been granted, and how it is configured for SSO.

**The relationship:** One application object can have multiple enterprise application entries — one per tenant where the app is used. When you register an app in your own tenant, both the application object and the enterprise application are created automatically in that tenant.

**Gallery apps:** When you add an application from the Azure AD gallery (e.g. Salesforce, ServiceNow), you are **not** creating an app registration in your tenant. You are creating an enterprise application that points to the publisher's app (which lives in their tenant). Your tenant gets a service principal so you can assign users and configure SSO, but the app registration stays with the publisher.

🚨 **Exam trap:** The question "When you register an app in Azure AD, what additional resource is created?" — the answer is a **service principal**. The service principal is the local, tenant-specific identity of the application. In the Azure Portal, you see it under **Enterprise applications** (not under App registrations). App registration creates the application object; the service principal (enterprise app) is created automatically so the app can be assigned permissions and used in that tenant.

📝 **Worked example (exam-style question):**
*Question:* You have an Azure subscription linked to an Azure AD tenant. From the Azure portal, you register an enterprise application. Which additional resource will be created in Azure AD?
A. A service principal
B. An X.509 certificate
C. A managed identity
D. A user account

*Correct answer:* **A — A service principal.** Registering an app creates an application object (the app definition) and automatically creates a service principal — the local identity that represents the app in the tenant. The service principal is what you assign permissions to, what appears in Enterprise applications, and what the app uses to authenticate. Certificates, managed identities, and user accounts are separate concepts.

## Part 2: App Registration — Single-Tenant vs. Multi-Tenant

When you create an app registration, you choose the **supported account types**:

**Single-tenant (Accounts in this organizational directory only):** The app can only be used by users and apps in your own tenant. This is the typical choice for internal line-of-business applications. Sign-in is restricted to accounts from your tenant only.

**Multi-tenant (Accounts in any organizational directory):** The app can be used by users from any Azure AD tenant. When a user from another tenant (e.g. fabrikam.com) signs in to your app for the first time, they are prompted for consent. If they (or their admin) consent, a service principal for your app is created in their tenant, and your app can then access resources on their behalf. This is used for SaaS applications that serve multiple customers.

**Multi-tenant + personal Microsoft accounts:** The app can also be used by personal Microsoft accounts (Outlook.com, Hotmail). This is common for consumer-facing apps.

**How to configure:** In the Azure Portal, go to **Microsoft Entra ID → App registrations → New registration**. On the registration form, under "Supported account types," select the appropriate option. You cannot change this after creation — you must create a new registration if you need a different type.

## Part 3: API Permissions — Delegated vs. Application

When your app needs to access Microsoft Graph, Azure Storage, or another API, you must request **permissions**. There are two fundamentally different permission types, and the exam tests whether you understand the difference.

**Delegated permissions** are used when your app runs **on behalf of a signed-in user**. The app acts as the user — it can only do what the user is allowed to do. For example, if you request the delegated permission `User.Read`, your app can read the profile of the user who is currently signed in. The access token will represent that user. Use delegated permissions for interactive apps (web apps where users sign in, mobile apps, desktop apps).

**Application permissions** are used when your app runs **without a user** — as a background service, daemon, or automation script. The app acts on its own behalf. For example, if you request the application permission `User.Read.All`, your app can read *all* users in the directory, not just the signed-in user. Application permissions are powerful and always require **admin consent** — users cannot consent to them. Use application permissions for non-interactive scenarios (scheduled jobs, sync services, backend processes).

| Aspect | Delegated | Application |
|--------|-----------|-------------|
| Who is acting? | The signed-in user (through the app) | The app itself (no user) |
| Consent | User or admin | Admin only |
| Example | "Read the signed-in user's profile" | "Read all users in the directory" |
| Typical use | Web apps, mobile apps, interactive scripts | Daemons, background jobs, automation |

**How to add permissions:** In the app registration, go to **API permissions → Add a permission**. Choose the API (e.g. Microsoft Graph), then select either "Delegated permissions" or "Application permissions," and pick the specific permissions you need. After adding them, click **Grant admin consent for [Your tenant]** if you want to pre-approve them so users are not prompted.

## Part 4: Consent — User Consent vs. Admin Consent

**User consent** means that when a user signs in to an app that requests permissions, the user sees a consent prompt: "This app wants to access your profile. Allow?" If the user clicks Allow, the app gets the requested permissions for that user. User consent is only allowed for **delegated permissions** that are not classified as high-privilege. Some permissions (e.g. `User.Read.All` as an application permission) can never be consented by users — only admins.

**Admin consent** means an administrator pre-approves the permissions on behalf of the organization. When an admin grants consent, the app can access the requested resources for all users (or for the scope the admin specified) without each user seeing a consent prompt. Admin consent is required for all **application permissions** and for sensitive delegated permissions.

**Where to control consent:** You can restrict whether users are allowed to consent to apps at all. This is controlled in **Enterprise applications → User settings** (not in App registrations). The setting "Users can consent to apps accessing company data on their behalf" can be set to No, which means only admins can grant consent. You can also configure "Admin consent requests" so that users can request admin approval instead of consenting themselves.

> 🚨 **Exam trap:** The settings for "who can register apps" and "who can consent to apps" are in **different places** in the portal. Both have "User settings" in their path, but they are under different blades. Students often confuse them.
>
> **App registration control** (who can register new applications): **Microsoft Entra ID → User settings**. Set "Users can register applications" to No to prevent users from creating app registrations.
>
> **Consent control** (who can consent to apps accessing company data): **Enterprise applications → User settings**. Set "Users can consent to apps accessing company data on their behalf" to No to require admin consent for all apps.

> 📝 **Worked example (exam-style question):**
> *Question:* You need to configure Azure AD so that (1) users cannot register new applications, and (2) users cannot consent to apps accessing company data. Where in the Azure portal do you configure each?
>
> *Dropdown 1 — To configure registration settings:*
> A. Azure AD – User settings
> B. Azure AD – App registrations settings
> C. Enterprise Applications – User settings
>
> *Correct answer:* **A — Azure AD – User settings.** The "Users can register applications" toggle is under Microsoft Entra ID (Azure AD) → User settings.
>
> *Dropdown 2 — To configure consent settings:*
> A. Azure AD – User settings
> B. Azure AD – App registrations settings
> C. Enterprise Applications – User settings
>
> *Correct answer:* **C — Enterprise Applications – User settings.** The "Users can consent to apps accessing company data on their behalf" toggle is under Enterprise applications → User settings.

## Part 5: Service Principals — The Identity Your App Uses

A **service principal** is the identity that an application uses when it authenticates to Azure AD or accesses Azure resources. It is the "local instance" of the application in a tenant. When you assign an app a role (e.g. Storage Blob Data Reader on a storage account), you assign it to the **service principal**, not to the application object.

**How it is created:** When you register an app in your tenant, a service principal is created automatically. When a multi-tenant app is consented to in another tenant, a service principal is created in that tenant. You can also create service principals manually when connecting to third-party apps or when using automation tools that need a dedicated identity.

**What it contains:** The service principal has a **Client ID** (also called Application ID) and a **Object ID** (unique to the service principal in that tenant). To authenticate, the app typically needs a **client secret** (password) or a **certificate** — these are stored in the app registration and used by the service principal to prove its identity.

**Credentials:** Client secrets expire (typically 24 months or 2 years). You must rotate them before expiry. Certificates are more secure for production because they can be stored in a hardware security module and do not expire as frequently. For the exam, know that both secrets and certificates work; the choice depends on security requirements and operational constraints.

**Service principal vs. managed identity:**

| Feature | Service principal | Managed identity |
|---------|-------------------|------------------|
| **Creation** | Manual (app registration or automation) | Automatic when you enable it on an Azure resource |
| **Credential management** | Manual — you create and rotate client secrets or certificates | Automatic — Azure handles everything; no secrets to store |
| **Use case** | External apps, third-party integrations, automation that runs outside Azure | Azure resources (VMs, Functions, App Service) accessing other Azure services |
| **Lifecycle** | Managed separately from resources | System-assigned: tied to resource. User-assigned: standalone |

## Part 6: Managed Identities — Passwordless Authentication for Azure Resources

**Managed identities** are a special type of service principal that Azure creates and manages automatically. The key benefit: **no credentials to store or rotate**. Azure handles the entire lifecycle. Your app or VM simply requests a token from the Azure Instance Metadata Service (IMDS), and Azure issues a token for the managed identity. There are no secrets in your code or configuration.

**When to use:** Whenever an Azure resource (VM, Function App, App Service, Logic App, etc.) needs to access another Azure service (Key Vault, Storage, SQL Database, etc.), use a managed identity instead of a client secret or connection string. This is the recommended, secure approach.

### System-Assigned vs. User-Assigned Managed Identities

| Aspect | System-assigned | User-assigned |
|--------|-----------------|---------------|
| **Creation** | Enabled on a single resource (e.g. one VM). When you turn it on, Azure creates the identity. | Created as a standalone resource. You then assign it to one or more resources. |
| **Lifecycle** | Tied to the resource. When you delete the VM, the identity is deleted. | Independent. You can delete a VM and the identity remains. You can reassign it to another resource. |
| **Sharing** | Cannot be shared. One identity per resource. | Can be shared. One user-assigned identity can be assigned to multiple resources (e.g. all VMs in a scale set). |
| **Use case** | Simple, one-to-one: "This VM needs this identity." | Complex: "This identity is used by five VMs and two Function Apps." |

**How to enable system-assigned:** In the Azure Portal, go to the resource (e.g. VM, Function App) → **Identity** → **System assigned** tab → set Status to **On** → Save. Azure creates the identity and assigns it to the resource. You then assign it an RBAC role (e.g. Storage Blob Data Reader) on the target resource.

**How to create user-assigned:** Go to **Microsoft Entra ID → Enterprise applications** or create via **Managed identities** in the resource group. Create a user-assigned managed identity. Then, on each resource that needs it, go to **Identity** → **User assigned** tab → **Add** → select the identity.

> 🚨 **Exam trap:** When a question asks for "minimum required privileges" and "minimize administrative effort," the answer often involves a **managed identity** (no credentials to manage) plus the **narrowest RBAC role** that fulfills the requirement. For example, if you need to create storage accounts, use **Storage Account Contributor** — not Contributor (which is too broad). If you need to read blobs, use **Storage Blob Data Reader** — not Storage Account Contributor (which is management plane, not data plane).

> 📝 **Worked example (exam-style question):**
> *Question:* You plan to implement an Azure Function named Function1 that will create new storage accounts for containerized application instances. You need to grant Function1 the minimum required privileges to create the storage accounts. The solution must minimize administrative effort.
>
> *Dropdown 1 — Identity type for Function1:*
> A. User-assigned managed identity
> B. System-assigned managed identity
> C. Service principal with client secret
>
> *Correct answer:* **B — System-assigned managed identity.** The Function is a single resource that needs to create storage accounts. A system-assigned identity is simpler: enable it on the Function, assign the role, done. No credentials to manage. User-assigned would work but adds complexity for no benefit. Service principal with client secret increases administrative effort (secret rotation, storage).
>
> *Dropdown 2 — RBAC role to assign:*
> A. Contributor
> B. Storage Account Contributor
> C. Owner
>
> *Correct answer:* **B — Storage Account Contributor.** This role allows creating and managing storage accounts but nothing else. Contributor would allow managing any resource type (VMs, networks, etc.) — violates least privilege. Owner is even broader.

> 🎯 **Exam scenario (managed identity for database access):**
> *Scenario:* You have VM1 and an Azure SQL Database (SQL1). You need to provide VM1 with secure access to a database on SQL1 using a **contained database user**. The solution must not store credentials in the VM or in Key Vault.
>
> *Question:* What should you do?
> A. Enable a managed identity on VM1.
> B. Create a secret in Key Vault.
> C. Configure a service endpoint on SQL1.
> D. Create a key in Key Vault.
>
> *Correct answer:* **A.** Enable a system-assigned managed identity on VM1. Then, in SQL1, create a contained database user mapped to that identity: `CREATE USER [VM1] FROM EXTERNAL PROVIDER`. Grant the user the appropriate database roles. The VM authenticates to SQL using Azure AD tokens — no passwords, no secrets. The managed identity is the Azure AD principal that Azure SQL recognizes. Options B and D would require storing credentials. Option C (service endpoint) controls network routing, not authentication.

## Part 7: Expose an API — Permission Scopes

When you build an API that other apps will call, you must **expose** it in the app registration. In **App registrations → Your app → Expose an API**, you define **scopes** (also called OAuth2 permission scopes). A scope defines what a client app can request when it calls your API. For example, you might define a scope `Files.Read` that allows reading files, and `Files.Write` that allows writing. When another app requests access to your API, it asks for permission to `api://your-app-id/Files.Read`.

**Application ID URI:** This is the base identifier for your API (e.g. `api://myapp-12345`). Scopes are appended to it: `api://myapp-12345/Files.Read`.

**Admin consent:** When your API exposes sensitive scopes, you can require admin consent so that only administrators can grant access to those scopes.

## Part 8: Conditional Access — Advanced Scenarios

You already know from Day 1 that Conditional Access evaluates signals (user, location, device, risk) and makes access decisions. Day 2 reinforces and extends this.

### Named Locations

**Named locations** are IP address ranges or countries/regions you define in Entra ID. You use them in Conditional Access policies as conditions. For example: "If the user is signing in from a location that is NOT in Trusted Locations, require MFA."

**How to create:** Go to **Microsoft Entra ID → Security → Conditional Access → Named locations**. Add a location, give it a name (e.g. "Corporate HQ"), and specify either IP ranges (e.g. `203.0.113.0/24`) or countries/regions (e.g. United States, Canada).

**Trusted locations:** You can mark a named location as "Trusted." Some policies use this to bypass MFA for sign-ins from trusted locations. This is similar to the legacy MFA Trusted IPs but is managed in Conditional Access.

### Exclude Overrides Include — Revisited

From Day 1: **Exclude always takes priority over Include.** If a user is in both an included group and an excluded group, the policy does not apply to them. This is critical for break-glass accounts and for testing.

**Location exclusions:** The same rule applies to locations. If a policy targets "All locations" but **excludes** "Corporate HQ" (a named location), then users signing in from Corporate HQ are **exempt** from the policy. For a "Block access" policy, excluded users can access (they are not blocked). For a "Require MFA" policy, excluded users are not prompted for MFA. Always reason: exclude = "this policy does not apply."

> 🎯 **Exam scenario (Identity Protection sign-in risk policy):**
> *Scenario:* You have users:
>
> | User | Member of | MFA status |
> |------|-----------|------------|
> | User1 | Group1, **Group2** | Enabled |
> | User2 | Group1 | Disabled |
> | User3 | Group1 | Disabled |
>
> You create and enforce an Identity Protection **sign-in risk** policy:
> - Assignments: Include **Group1**, Exclude **Group2**
> - Conditions: Sign-in risk **Medium and above**
> - Access: Allow access, **Require multi-factor authentication**
>
> *Statement 1:* "When User1 signs in from an anonymous IP address (Medium risk), User1 must perform MFA."
> **Answer: No.** User1 is in Group1 (included) but also in Group2 (excluded). Because **exclude overrides include**, the policy does not apply to User1 at all. User1 will not be prompted for MFA, even though the sign-in is Medium risk.
>
> *Statement 2:* "When User2 signs in from an unfamiliar location (Medium risk), User2 must perform MFA."
> **Answer: Yes.** User2 is in Group1 (included) and not in Group2 (not excluded). The policy applies. Unfamiliar location = Medium risk, which meets the threshold. The policy requires MFA.
>
> *Statement 3:* "When User3 signs in from a trusted location (Low risk), User3 must perform MFA."
> **Answer: No.** The policy triggers only when sign-in risk is Medium and above. Low risk does not meet the condition, so the policy does not apply.

## Part 9: OAuth 2.0 vs. SAML vs. Kerberos — When the Exam Asks "Which Protocol?"

The exam may ask you to recommend or distinguish between authentication protocols. Memorize this table:

| Feature | OAuth 2.0 | SAML | Kerberos |
|---------|-----------|------|----------|
| **Purpose** | Delegated authorization (let app act on user's behalf) | SSO and federated identity (single sign-on across orgs) | Network authentication (prove identity on a network) |
| **Use cases** | Third-party apps, APIs, social login, modern web/mobile apps | Enterprise SSO (e.g. Salesforce, Workday with Azure AD) | On-premises AD, domain-joined devices, internal services |
| **Format** | Token-based (JSON Web Tokens) | XML-based assertions | Ticket-based (KDC issues tickets) |
| **Identity verification** | Does not define authentication; relies on IdP | Centralized IdP authenticates and issues assertions | Key Distribution Center (KDC) verifies identity |
| **Transport** | HTTPS | HTTP/HTTPS | Network protocol (UDP/TCP) |

**When to recommend:** For modern cloud apps and APIs, recommend **OAuth 2.0** and **OpenID Connect**. For enterprise SSO with third-party SaaS, **SAML** is common. For on-premises or hybrid scenarios with domain-joined machines, **Kerberos** (via Active Directory) is used — e.g. "Active Directory – Integrated" for Azure SQL uses Kerberos.

## Part 10: Microsoft Entra Application Proxy

**Application Proxy** allows you to publish internal web applications (hosted on-premises or in a private network) so that users can access them from the internet through a browser, without a VPN. The application is fronted by Azure AD — users authenticate with their Entra ID credentials, and Azure AD forwards the request to your internal app via a **connector** that runs on a server in your network.

**How it works:**
1. User navigates to `https://myapp.azurewebsites.net` (or your custom domain).
2. Azure AD authenticates the user (SSO, MFA, Conditional Access apply).
3. User is redirected to the Application Proxy service.
4. The Application Proxy service communicates with a **connector** installed on a server in your network.
5. The connector forwards the request to the internal application (e.g. `http://internal-server:8080`).
6. The response flows back through the connector to the user.

**How to configure Application Proxy:**
1. In **Microsoft Entra ID → Enterprise applications → New application → Create your own application**, create an application for "Integrate another application you don't find in the gallery" (or add an existing app).
2. Go to the application → **Application proxy**.
3. Set **Application Proxy** to Enabled.
4. Configure **Internal URL** — the URL your internal users use to access the app (e.g. `http://sharepoint.internal:8080`).
5. Configure **External URL** — the URL external users will use (e.g. `https://sharepoint.contoso.com`). Azure provides a default `*.msappproxy.net` domain, or you can use a custom domain.
6. Set **Pre Authentication** to Azure Active Directory (recommended) so that Azure AD authenticates users before forwarding requests.
7. Install the **Application Proxy connector** on a Windows Server in your network. Download it from the Application Proxy page. The connector must be able to reach the internal URL. Install multiple connectors for high availability.

**Connector requirements:** Windows Server 2012 R2 or later. The connector runs as a service and maintains an **outbound** connection to Azure (no inbound firewall rules needed). The server must have network connectivity to your internal application. The connector does not need to be domain-joined.

**Use cases:** SharePoint, Outlook Web Access, internal CRM, custom line-of-business apps. Any HTTP/HTTPS web app that you want to expose securely without opening inbound ports or deploying a VPN.

**Security:** All traffic is encrypted (HTTPS). You can apply Conditional Access (require MFA, block from certain locations, require compliant device). The internal app never needs to be directly exposed to the internet. Users authenticate to Azure AD first; only then does the connector forward the request.

> 🚨 **Exam trap:** Application Proxy is for **publishing internal web apps** to remote users. It is NOT for:
> - Authenticating users to HDInsight clusters (use site-to-site VPN or Azure AD DS).
> - Connecting Power BI to on-premises data sources (use the On-premises data gateway).
> - Generic "connect cloud to on-premises" — the gateway and data gateway serve different purposes.
>
> If the question describes "users need to access an internal SharePoint site from home" without VPN: Application Proxy. If the question describes "HDInsight cluster needs to authenticate users with on-premises AD": VPN or Azure AD DS.

## Part 11: Azure SQL Authentication — Minimize Prompts

When Azure SQL Database is configured for Azure AD authentication, users can connect using their Entra ID credentials. The exam tests which authentication method minimizes prompts.

**Active Directory – Integrated:** Uses the current Windows session (Kerberos). If the user is logged into Windows with their domain credentials (on a domain-joined or hybrid Azure AD joined device), the authentication is **seamless** — zero prompts. This is the answer when the requirement says "minimize authentication prompts."

**Active Directory – Password:** The user is prompted once for their username and password. One prompt.

**Active Directory – Universal with MFA support:** Forces MFA. Multiple prompts (password + MFA).

**SQL Server Authentication:** Uses SQL username and password. Not Azure AD. One prompt.

> 📝 **Worked example (exam-style question):**
> *Question:* You have a hybrid Azure AD setup. Azure SQL Database supports Azure AD authentication. Developers must connect using SSMS with their on-premises AD accounts. The solution must minimize authentication prompts.
>
> Which authentication method should you recommend?
> A. Active Directory – Password
> B. Active Directory – Universal with MFA support
> C. SQL Server Authentication
> D. Active Directory – Integrated
>
> *Correct answer:* **D — Active Directory – Integrated.** When users are on domain-joined or hybrid-joined devices and logged in with their AD credentials, Integrated authentication uses the existing Kerberos ticket — no additional prompts. Password and Universal with MFA require at least one prompt; SQL Server Authentication uses SQL credentials, not AD.

## Part 12: Subscription Transfer — Azure AD Accounts Only

When you transfer Azure subscription ownership to another account, the new owner must have an account in an **Azure AD tenant** (work or school account). You cannot transfer ownership to:
- Personal Microsoft accounts (Hotmail, Outlook.com)
- External identity provider accounts (e.g. OpenID, Google)

You can transfer to:
- Another user in the same tenant (contoso.com)
- A user in a different tenant (fabrikam.com)

> 🚨 **Exam trap:** "Transfer subscription ownership" = only Azure AD (work/school) accounts. Hotmail and OpenID are wrong answers.

## Part 13: 🔬 Hands-On Practice (No Official Lab)

Since Day 2 has no dedicated lab, perform these exercises in your Azure subscription:

1. **Conditional Access policy for Azure Management:** Create a policy that requires MFA when users access the Microsoft Azure Management cloud app. Assign it to a test group. Sign in from a browser and verify MFA is prompted.

2. **Named location:** Create a named location for your current public IP (or your office range). Create a policy that blocks access to a cloud app from outside that location. Test from a different network (e.g. mobile hotspot) to verify blocking.

3. **App registration:** Register a new app. Add the delegated permission `User.Read` (Microsoft Graph). Grant admin consent. Observe the service principal in Enterprise applications. Note the Client ID and Object ID.

4. **Managed identity on Azure Function:** Create an Azure Function App (consumption or premium plan). Enable system-assigned managed identity. Create a storage account. Assign the Function's managed identity the **Storage Blob Data Reader** role on the storage account. In the Function code, use the default Azure credential to get a token and list blobs — no connection string or secret needed.

5. **Restrict app registration and consent:** In Entra ID → User settings, set "Users can register applications" to No. In Enterprise applications → User settings, set "Users can consent to apps accessing company data on their behalf" to No. Verify that regular users can no longer register apps or consent.

## Part 14: Key Facts to Memorize (Day 2 Quick-Reference Card)

| Concept | Key fact |
|---------|----------|
| App registration → service principal | Automatically created when you register an app. |
| App registration vs. consent settings | Registration = Entra ID → User settings. Consent = Enterprise applications → User settings. |
| Delegated vs. application permissions | Delegated = on behalf of user. Application = app acts alone (admin consent required). |
| System-assigned managed identity | Tied to one resource; deleted with the resource. |
| User-assigned managed identity | Standalone; can be shared across multiple resources. |
| Managed identity for VM → SQL | Enable managed identity + contained database user. |
| Function creating storage accounts | System-assigned managed identity + Storage Account Contributor. |
| Least privilege for storage | Storage Account Contributor (management plane) vs. Storage Blob Data Reader (data plane). |
| Application Proxy | Publishes internal web apps; connector on-premises. |
| Application Proxy ≠ HDInsight auth | Use VPN or Azure AD DS for HDInsight. |
| Minimize SQL prompts | Active Directory – Integrated (Kerberos, zero prompts). |
| Subscription transfer | Azure AD accounts only; not Hotmail or OpenID. |
| Exclude vs. Include | Exclude always wins (Conditional Access, Identity Protection). |
| Service principal vs. managed identity | Service principal = manual credentials. Managed identity = no credentials, Azure-managed. |
| Gallery apps | Create enterprise app only; app registration lives in publisher's tenant. |

**Day 2 is complete.** Review any section you found difficult, re-attempt the worked examples, and complete the hands-on practice. Proceed to Day 3 (Networking Security) when you are confident with every concept above.
