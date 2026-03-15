# AZ-500 Exam Preparation: Day 3 — Networking Security (Part 1): NSGs, ASGs, Azure Firewall, UDRs

> Solving exercises will teach you more than you can think. Most of our knowledge comes from doing — and while doing you must solve problems, search for clues, and try different things; in this way you will learn rapidly.

This is Day 3 of your 7-day AZ-500 preparation. Today's focus is **Networking Security**, which accounts for **20–25%** of the exam. You will learn how to filter traffic with Network Security Groups (NSGs), group resources with Application Security Groups (ASGs), deploy Azure Firewall, and control routing with User-Defined Routes (UDRs). You will also cover VNet peering, VPN Gateway, ExpressRoute encryption, and Network Watcher. This is a heavy day with two official labs.

## Day 3 Official Resources

| Resource | Description | Link |
|----------|-------------|------|
| MS Learn Module (Day 3) | Official module covering NSGs, ASGs, UDRs, VNet peering, VPN Gateway, Virtual WAN, ExpressRoute, Network Watcher. | [Plan and implement security for virtual networks](https://learn.microsoft.com/en-us/training/modules/security-virtual-networks/) |
| Learning Path 2 (full) | The complete "Protect network infrastructure in Azure" path. | [Learning Path 2](https://learn.microsoft.com/en-us/training/paths/implement-platform-protection/) |
| Exam Readiness Video | Microsoft's exam prep for the networking section. | [Part 2 of 4: Secure networking](https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-02-fy25) |
| LAB 02 | Hands-on: create VNet, subnets, ASGs, NSG rules, deploy VMs, test filtering. ~60 min. | [LAB 02 — NSGs and ASGs](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_02_NSGs.html) |
| LAB 03 | Hands-on: deploy Azure Firewall, create rules, UDR routing, test via RDP. ~60 min. | [LAB 03 — Azure Firewall](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_03_AzureFirewall.html) |
| Lab files (ZIP) | Download all lab instructions and ARM templates. | [Download ZIP](https://github.com/MicrosoftLearning/AZ500-AzureSecurityTechnologies/archive/master.zip) |

**Cost warning:** Azure Firewall costs approximately $1.25 per hour. Run cleanup immediately after LAB 03:
```powershell
Remove-AzResourceGroup -Name "AZ500LAB08" -Force -AsJob
```

**Recommended schedule for today (5–7 hours):**
Block 1 (1.5–2 h): Read this guide + complete the MS Learn module.
Block 2 (2–2.5 h): LAB 02 + LAB 03.
Block 3 (1–1.5 h): Work through the exam-style questions embedded in this guide.

## Part 1: Network Security Groups (NSGs) — Complete Guide

### What an NSG Is and How It Works

A **Network Security Group (NSG)** is a firewall that filters network traffic at Layer 3 (IP) and Layer 4 (TCP, UDP, port). It contains **security rules** that allow or deny traffic based on source IP, destination IP, source port, destination port, and protocol. NSGs do not inspect application-layer content (no HTTP headers, no URLs) — that is the job of Azure Firewall or a Web Application Firewall (WAF).

**Where NSGs can be attached:** You can associate an NSG with a **subnet** (all traffic to/from that subnet) or with a **network interface (NIC)** (traffic to/from that specific VM). A VM can have an NSG on its NIC, on its subnet, or both. When both exist, traffic is evaluated by **both** NSGs, and it must be **allowed** by both to pass.

### NSG Evaluation Order — Critical for the Exam

**Inbound traffic** (e.g. from Internet to VM):
1. **Subnet NSG** is evaluated first.
2. **NIC NSG** is evaluated second.
3. Traffic must be **allowed** by both to reach the VM. If either denies, the traffic is dropped.

**Outbound traffic** (e.g. from VM to Internet):
1. **NIC NSG** is evaluated first.
2. **Subnet NSG** is evaluated second.
3. Again, both must allow for traffic to pass.

> 🚨 **Exam trap:** If a VM has no NSG on its subnet and no NSG on its NIC, **all traffic is allowed** at that level. Azure's default behavior is allow. NSGs restrict; absence of NSG means no restriction. When the exam asks "Can you connect from the Internet to VM3?" you must trace the path: subnet NSG rules → NIC NSG rules. Both must have an Allow rule that matches; otherwise the traffic is blocked by the default Deny (priority 65500).

### NSG Rule Priority

Each rule has a **priority** number from 100 to 4096. **Lower number = higher priority.** Azure evaluates rules in order of priority (lowest first). The first rule that matches the traffic is applied; no further rules are evaluated. Default rules (Azure creates them automatically) have priorities 65000 and above. Your custom rules should use lower numbers (e.g. 100, 200, 300).

**Default rules:** Every NSG has default Allow rules for VirtualNetwork-to-VirtualNetwork traffic, Azure Load Balancer, and a default Deny for everything else (priority 65500). You cannot delete the default rules, but your custom rules (with lower priority numbers) override them when they match.

> 📝 **Worked example (exam-style question — NSG evaluation):**
>
> *Scenario:* VNetwork1 has Subnet1 (NSG-A) and Subnet2 (NSG-B). All VMs have public IPs and IIS installed.
>
> | VM | Subnet | NIC NSG |
> |----|--------|---------|
> | VM1 | Subnet1 | None |
> | VM2 | Subnet1 | NSG-C (custom rule: Allow TCP 80 from Internet, priority 100) |
> | VM3 | Subnet2 | None |
>
> **NSG-A (Subnet1):** Priority 100, Allow TCP 80, Source=Internet.  
> **NSG-B (Subnet2):** No custom rules; only defaults (Allow VirtualNetwork, Deny all else at 65500).
>
> For each statement, select Yes if true, otherwise No:
>
> | Statement | Answer | Reasoning |
> |-----------|--------|-----------|
> | From the Internet, you can connect to the web server on VM1 by using HTTP. | **Yes** | Subnet1 NSG-A allows TCP 80 from Internet. VM1 has no NIC NSG, so no second evaluation. Traffic passes. |
> | From the Internet, you can connect to the web server on VM2 by using HTTP. | **Yes** | Subnet1 NSG-A allows. NIC NSG-C also has Allow TCP 80 from Internet. Both levels allow → traffic passes. |
> | From the Internet, you can connect to the web server on VM3 by using HTTP. | **No** | Subnet2 NSG-B has no Allow for Internet. The default Deny (65500) matches. Traffic is blocked at the subnet level before it reaches the VM. |
>
> **Key takeaway:** For inbound traffic, the subnet NSG is evaluated first, then the NIC NSG. Traffic must be allowed by both (if both exist). If the subnet NSG denies, the traffic never reaches the NIC.

### NSG Rules and Service Tags

Instead of specifying individual IP addresses, you can use **service tags** — predefined groups of IP ranges for Azure services. For example:
- `VirtualNetwork` — all private IP ranges in your VNet, peered VNets, and on-premises (via VPN/ExpressRoute)
- `Internet` — public IP space (traffic to/from the internet)
- `Storage` — Azure Storage service IPs (all regions)
- `Storage/EastUS2` — Azure Storage in East US 2 only
- `Sql` — Azure SQL Database
- `AzureCloud` — Azure datacenter IP ranges

> 📝 **Worked example (exam-style question):**
> *Scenario:* An NSG is bound to a subnet with these outbound rules:
>
> | Rule | Protocol | Dst Port | Dst Address | Access | Priority |
> |------|----------|----------|-------------|--------|----------|
> | DenyStorageAccess | * | * | Storage | Deny | 105 |
> | StorageEA2Allow | * | 443 | Storage/EastUS2 | Allow | 104 |
>
> *Statement 1:* A VM in the subnet that accesses Azure Storage on port 443 is able to connect to any Azure Storage region.
> **Answer: No.** The Allow rule (priority 104) only permits traffic to `Storage/EastUS2`. Other regions do not match that rule. The Deny rule (105) would then match and block. Result: the VM can connect **only** to East US 2 Storage.
>
> *Statement 2:* A VM that accesses Azure Storage on port 80 is dropped.
> **Answer: Yes.** The Allow rule specifies port 443 only — port 80 does not match. The Deny rule (all ports to Storage) matches, so traffic is dropped.

## Part 2: Application Security Groups (ASGs) — Complete Guide

### What an ASG Is

An **Application Security Group (ASG)** is a logical grouping of network interfaces (NICs). Instead of writing NSG rules with individual IP addresses or subnets, you use ASGs as source or destination. For example: "Allow traffic from ASG-WebServers to ASG-Databases on port 1433." When you add or remove a VM from an ASG, the NSG rules automatically apply to the new membership — no rule changes needed.

**Important:** ASGs do not have rules themselves. They are used **inside** NSG rules. They simplify management; they do not replace NSGs.

### ASG Constraints — Same VNet and Same Region

> 🚨 **Exam trap:** ASGs have two critical constraints that the exam tests repeatedly:
>
> **Constraint 1 — Same virtual network:** All NICs in an ASG must belong to the **same virtual network**. NICs in different VNets cannot be in the same ASG. NICs in different **subnets** within the same VNet **can** be in the same ASG.
>
> **Constraint 2 — Same region:** An ASG can only be used in NSG rules when the NSG is in the **same region** as the ASG. A VM's NIC can only be assigned to an ASG that is in the **same region** as the NIC. (Some documentation emphasizes same VNet; the exam has also tested same-region — know both.)

> 🎯 **Exam scenario (ASG assignment):**
> *Scenario:* VNET1 has Subnet11 and Subnet12. VNET2 has Subnet21. VNET3 has Subnet31.
>
> | VM | NIC | Subnet |
> |----|-----|--------|
> | VM1 | NIC1 | Subnet11 (VNET1) |
> | VM2 | NIC2 | Subnet11 (VNET1) |
> | VM3 | NIC3 | Subnet12 (VNET1) |
> | VM4 | NIC4 | Subnet21 (VNET2) |
> | VM5 | NIC5 | Subnet31 (VNET3) |
>
> You add NIC1 to ASG1. Which other NICs can you add to ASG1?
>
> A. NIC2 only
> B. NIC2, NIC3, NIC4, and NIC5
> C. NIC2 and NIC3 only
> D. NIC2, NIC3, and NIC4 only
>
> *Correct answer:* **C — NIC2 and NIC3 only.** ASG1 can only contain NICs from the same VNet as NIC1. NIC1 is in VNET1, so ASG1 can include NIC2 (Subnet11/VNET1) and NIC3 (Subnet12/VNET1). NIC4 and NIC5 are in different VNets — they cannot be in ASG1.

### ASG in NSG Rules — Protocol Matters

When you use ASGs in NSG rules, the **protocol** field is critical. A rule that allows only **TCP** will block **ICMP** (ping). A rule that allows **Any** will allow both TCP and ICMP.

> 🚨 **Exam trap:** If a rule says `Protocol=TCP` and `Port=Any`, it allows all TCP traffic but **blocks ICMP** (ping). If the question asks "Can VM1 ping VM4?" and the only allow rule between them specifies TCP, the answer is **No** — ping uses ICMP.

## Part 3: User-Defined Routes (UDRs) and Route Tables

### What UDRs Are

Azure uses **system routes** by default — routes that direct traffic within the VNet, to the internet, to other VNets via peering, and to VPN/ExpressRoute gateways. You cannot modify system routes. **User-Defined Routes (UDRs)** override system routes. You create a **route table**, add custom routes to it, and associate the route table with a subnet. Traffic from that subnet then follows your routes instead of the default behavior.

**Typical use:** Force traffic through a **Network Virtual Appliance (NVA)** — a VM running a firewall, IDS, or proxy. You add a route with a specific destination (e.g. 0.0.0.0/0 for all traffic) and set the **next hop** to the NVA's private IP address.

### Next Hop Types

| Next hop type | Meaning |
|---------------|---------|
| **Virtual appliance** | Traffic goes to a VM's private IP (your NVA, firewall VM) |
| **Virtual network gateway** | Traffic goes to the VPN or ExpressRoute gateway |
| **Internet** | Traffic is sent to the internet (Azure's default for 0.0.0.0/0) |
| **None** | Traffic is dropped (blackhole) |

### UDR Constraints and Routing Logic

- **Longest prefix match:** If you have routes for 10.0.0.0/16 and 10.0.0.0/24 in the same table, traffic to 10.0.0.50 matches the /24 route (more specific). You CAN have overlapping prefixes — the most specific route wins. What you cannot have is two routes with the **exact same address prefix** (e.g. two entries for 10.0.0.0/16).
- **No route tables on AzureFirewallSubnet** — assigning a route table to the Azure Firewall subnet can break the firewall. Never do it.

> 🚨 **Exam trap:** To route traffic through an NVA (e.g. a VM that analyzes traffic), you use a **UDR**, not an NSG. NSGs filter (allow/deny); UDRs route (where to send). If the question says "ensure all network traffic is routed through VM1," the answer is **User-defined route**.

## Part 4: Azure Firewall — Complete Guide

### Deployment Prerequisites

Azure Firewall requires a **dedicated subnet** with these exact requirements:

1. **Name:** The subnet must be named **AzureFirewallSubnet** (exact spelling, case-sensitive).
2. **Size:** Minimum **/26** (64 addresses). Azure Firewall can use multiple addresses.
3. **No NSG:** Do not associate an NSG with AzureFirewallSubnet. It can break firewall functionality.
4. **No other resources:** The subnet should contain only the Azure Firewall. No VMs, no other services.

> 🚨 **Exam trap:** If the question asks "What should you do first to deploy Azure Firewall?" and the VNet does not have an AzureFirewallSubnet, the answer is **Create a new subnet** named AzureFirewallSubnet with at least /26. Do not remove NSGs from other subnets, associate NSGs to other subnets, or configure DDoS — those are unrelated.

### Azure Firewall Rule Types and Order

Azure Firewall evaluates rules in a fixed order:

1. **DNAT rules** (Destination NAT) — inbound traffic, translate public IP to private IP for internal servers.
2. **Network rules** — Layer 4 (IP, port, protocol). Filter by source/destination IP, FQDN, port.
3. **Application rules** — Layer 7 (FQDN). Allow or deny traffic to specific domains (e.g. `*.google.com`).

**Rule types summary:**

| Rule type | Purpose | Example |
|-----------|---------|---------|
| **DNAT** | Inbound traffic; translate public IP to private IP | Allow RDP to 203.0.113.10 → forward to 10.0.1.5 |
| **Network** | L4 filtering; IP, port, protocol | Allow TCP 443 from 10.0.0.0/8 to 192.168.1.0/24 |
| **Application** | L7 filtering; FQDN | Allow outbound to *.microsoft.com |

### Hub-Spoke with Azure Firewall — UDR Assignment

In a hub-spoke architecture, you typically route traffic through the firewall:

- **Spoke subnet:** Assign a route table with a UDR that sends traffic (e.g. 0.0.0.0/0 for default) to the firewall's private IP as the next hop. This forces outbound traffic from spoke VMs through the firewall.
- **Gateway subnet:** Assign a route table that **disables BGP route propagation** and sets the firewall as the default gateway. This forces traffic from on-premises (via VPN/ExpressRoute) through the firewall before it reaches the spoke.
- **AzureFirewallSubnet:** **Never** assign a route table to it.

> 🎯 **Exam scenario (hub-spoke firewall routing):**
> *Scenario:* HubVNet (East US) with site-to-site VPN (BGP enabled). SpokeVNet (East US) peered to HubVNet. VMs on SpokeVNetSubnet0 can reach on-premises. You deploy Azure Firewall to HubVNet.
>
> You create:
> - **RT1:** UDR with next hop = firewall private IP
> - **RT2:** BGP propagation disabled, default gateway = firewall private IP
>
> Where do you assign RT1 and RT2?
>
> *Correct answers:*
> - **RT1 → SpokeVNetSubnet0.** Spoke traffic is routed to the firewall.
> - **RT2 → GatewaySubnet.** On-premises traffic arriving via VPN is routed to the firewall instead of directly to the spoke.
>
> **Never** assign route tables to AzureFirewallSubnet or HubVNetSubnet0 (workload subnet). The hub workload subnet is not the gateway — the GatewaySubnet is.

## Part 5: VPN Gateway — Complete Guide

### VPN Types

| VPN type | How it works | Use case |
|----------|-------------|----------|
| **Site-to-Site (S2S)** | Connects on-premises network to Azure VNet via IPsec/IKE tunnel | Branch office connectivity |
| **Point-to-Site (P2S)** | Connects individual client devices to Azure VNet | Remote workers, developers |
| **VNet-to-VNet** | Connects two Azure VNets via IPsec tunnel (alternative to peering) | Cross-region connectivity |

### Gateway Types: PolicyBased vs RouteBased

| Feature | PolicyBased | RouteBased |
|---------|------------|-----------|
| Tunnel count | 1 S2S tunnel only | Multiple S2S tunnels |
| P2S support | No | Yes |
| BGP support | No | Yes (except Basic SKU) |
| Active-Active | No | Yes |
| Use case | Legacy devices; single tunnel | Production; most scenarios |

> 🚨 **Exam trap:** PolicyBased gateway supports only **1 S2S tunnel** and no BGP. If the requirement says "multiple site-to-site connections" or "BGP," you must use **RouteBased**. Almost all modern scenarios use RouteBased.

### VPN Gateway SKUs

| SKU | Max S2S tunnels | BGP support | Active-Active | Typical use |
|-----|-----------------|-------------|---------------|-------------|
| **Basic** | 10 | **No** | No | Dev/test; no BGP |
| **VpnGw1** | 30 | Yes | Yes | Production; cost-effective |
| **VpnGw2** | 30 | Yes | Yes | Higher throughput |
| **VpnGw3** | 30 | Yes | Yes | Highest throughput |

> 🚨 **Exam trap:** **Basic SKU does NOT support BGP.** If the requirement says "site-to-site connections that use BGP," you cannot use Basic — even if Basic supports enough tunnels (e.g. 10). You must use VpnGw1 or higher. VpnGw1 supports 30 S2S tunnels and BGP; for cost minimization with BGP, VpnGw1 is the answer.

> 📝 **Worked example (exam-style question — VPN Gateway SKU):**
>
> *Question:* You need VPN gateways for two VNets:
> - VNET1: 6 site-to-site connections that use BGP.
> - VNET2: 12 site-to-site connections that use BGP.
> - Costs must be minimized.
>
> Available SKUs: Basic, VpnGw1, VpnGw2, VpnGw3
>
> *Correct answer:* **VpnGw1 for both.**
>
> | Requirement | Basic? | VpnGw1? |
> |-------------|--------|---------|
> | 6 S2S tunnels | Yes (supports 10) | Yes (supports 30) |
> | 12 S2S tunnels | No (only 10) | Yes (supports 30) |
> | BGP | **No** | Yes |
> | Cost minimized | Cheapest but fails BGP | **Cheapest with BGP** |
>
> Basic fails the BGP requirement for both VNets. VpnGw1 is the cheapest SKU that supports both BGP and enough tunnels (30 > 12). VpnGw2/VpnGw3 are more expensive — unnecessary.

### Active-Active VPN Gateway

An Active-Active VPN Gateway deploys **two gateway instances**, each with its own public IP. Both tunnels are active simultaneously. If one instance fails, the other takes over with no downtime.

- Requires **VpnGw1 or higher** (not Basic).
- Each instance creates its own tunnel to the on-premises device.
- On-premises device must support two simultaneous IPsec tunnels.

## Part 6: ExpressRoute — Private Connectivity and Encryption

### What ExpressRoute Is

**ExpressRoute** provides a private, dedicated connection from your on-premises network to Azure. Traffic does NOT go over the public internet — it flows through a connectivity provider's private network to the Microsoft edge.

### ExpressRoute Circuit Types

| Type | Description |
|------|-------------|
| **Standard ExpressRoute** | Via a connectivity provider (e.g. Equinix, AT&T). Shared infrastructure. |
| **ExpressRoute Direct** | Direct physical connection to Microsoft edge. Dedicated ports (10 Gbps or 100 Gbps). Required for MACsec. |
| **ExpressRoute Metro** | Low-latency connection at metro locations. Available as standard or Direct. |

### ExpressRoute Encryption

ExpressRoute traffic is private but **not encrypted by default**. For additional encryption:

- **MACsec (Layer 2)** — Encrypts at the Ethernet frame level between your router and Microsoft's edge. **Only available with ExpressRoute Direct** (dedicated ports). Protects the physical link.
- **IPsec VPN over ExpressRoute (Layer 3)** — Run an IPsec VPN tunnel over the ExpressRoute connection. Provides end-to-end encryption from your network to the Azure VNet. Works with any ExpressRoute type.

> 🚨 **Exam trap:** If the requirement says "Layer 2 encryption for ExpressRoute," the answer is **MACsec** (requires ExpressRoute Direct). If it says "Layer 3 encryption," the answer is **IPsec VPN over ExpressRoute**. If it says "Layer 2 or Layer 3," both are acceptable — but MACsec only works with ExpressRoute Direct.

## Part 7: NSG Flow Logs and Network Watcher

### What NSG Flow Logs Are

**NSG flow logs** capture metadata about IP traffic flowing through an NSG. Each flow record includes: source IP, destination IP, source port, destination port, protocol, and whether the traffic was allowed or denied. This is **per-flow** data — not just "rule X was hit." You use it for traffic analysis, troubleshooting, and security auditing.

**NSG flow logs vs. NSG diagnostic logs:**
- **Flow logs** — Per-flow traffic data (5-tuple: src/dst IP, src/dst port, protocol + action). Stored in Azure Storage or Log Analytics. Require **Network Watcher**.
- **Diagnostic logs** — Rule evaluation events (which rule matched). Different data; used for different purposes.

### Prerequisites for NSG Flow Logs

1. **Enable Network Watcher** in the region where the NSG is used. Network Watcher is a regional service — you enable it per region.
2. **Storage account** in the same region for storing flow log data (or Log Analytics for Traffic Analytics).
3. **Enable NSG flow logs** on the NSG — configure the flow log resource, destination (storage or Log Analytics), and retention.

> 📝 **Worked example (exam-style question):**
> *Question:* You have 10 VMs on a single subnet with a single NSG. You need to log network traffic to an Azure Storage account. Which two actions should you perform?
>
> A. Install Network Performance Monitor solution.
> B. Enable Azure Network Watcher.
> C. Enable diagnostic logging for the NSG.
> D. Enable NSG flow logs.
> E. Create an Azure Log Analytics workspace.
>
> *Correct answers:* **B and D.** Network Watcher must be enabled first (flow logs are a Network Watcher feature). Then enable NSG flow logs and configure the storage account as the destination. Option C (diagnostic logging) captures rule events, not per-flow traffic. Option A (NPM) is for connectivity monitoring. Option E (Log Analytics) is optional for Traffic Analytics but not required for basic storage logging.

## Part 8: Azure Virtual Network Manager

**Azure Virtual Network Manager** is a management service that lets you centrally configure and manage multiple virtual networks. It supports:

- **Connectivity configuration** — mesh (all-to-all) or hub-spoke topology across VNets in different regions.
- **Security admin configuration** — push security rules (e.g. NSG rules) to multiple VNets from a central place. Rules are applied as **security admin rules** at the network level; they take precedence over NSG rules when there is a conflict.
- **Scope** — you define a network group (VNets to manage) and apply configurations to that group.

**Exam relevance:** Know that Virtual Network Manager can centralize connectivity and security rules across many VNets. For the AZ-500, the focus is more on NSGs, ASGs, Azure Firewall, and UDRs — but the plan lists it as a topic, so be aware it exists.

## Part 9: VNet Peering and Virtual WAN

### VNet Peering

**VNet peering** connects two virtual networks directly over the Microsoft backbone. Traffic stays on the private network — no internet, no encryption needed (Microsoft's backbone is private). Peering can be:
- **Regional** — same region
- **Global** — different regions

**Key points:** Peering is bidirectional (you must create the peering in both directions). Traffic uses private IPs. No gateway is required for peering. You can peer across subscriptions and tenants (with proper permissions). Address spaces **must not overlap**.

### Peering Settings — Critical for the Exam

When you create a peering, you configure three important settings:

| Setting | What it does |
|---------|-------------|
| **Allow forwarded traffic** | Allows traffic forwarded by an NVA (not originating from the peered VNet) to flow through the peering. Enable on the receiving side. |
| **Allow gateway transit** | Allows the peered VNet to use your VPN/ExpressRoute gateway. Enable on the VNet that **has** the gateway. |
| **Use remote gateway** | Tells a VNet to use the peered VNet's gateway instead of deploying its own. Enable on the VNet that does **NOT** have a gateway. |

**Typical pattern:** Hub VNet has a VPN Gateway. Spoke VNet peers to Hub. On the Hub side, enable "Allow gateway transit." On the Spoke side, enable "Use remote gateway." Now spoke VMs can reach on-premises via the hub's gateway.

> 🚨 **Exam trap:** "Use remote gateway" and "Allow gateway transit" are on **opposite sides** of the peering. If the question asks which setting to enable on the spoke, the answer is "Use remote gateway." If it asks what to enable on the hub (the one with the gateway), the answer is "Allow gateway transit."

### Virtual WAN and Secured Virtual Hub

**Virtual WAN** simplifies large-scale connectivity for branch offices, VPNs, and ExpressRoute. It uses a **hub-and-spoke** model: hubs are central locations; spokes are branches or VNets.

- **Virtual WAN hub** — a Microsoft-managed VNet that acts as the central connectivity point. Branches, VNets, and users connect to the hub.
- **Secured Virtual Hub** — a Virtual WAN hub with **Azure Firewall** (or third-party security) deployed inside it. All traffic between spokes and branches flows through the firewall for centralized inspection.
- **Azure Firewall Manager** manages Secured Virtual Hubs — you configure firewall policies and routing from one place.

## Part 10: 🔬 LAB 02 — NSGs and ASGs

**Link:** [LAB 02 — NSGs and ASGs](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_02_NSGs.html)
**Duration:** ~60 minutes.

In this lab you will:
1. Create a VNet with subnets.
2. Create Application Security Groups and assign them to NICs.
3. Create an NSG with rules that use ASGs as source and destination.
4. Deploy VMs and verify that traffic is filtered according to the rules.

## Part 11: 🔬 LAB 03 — Azure Firewall

**Link:** [LAB 03 — Azure Firewall](https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_03_AzureFirewall.html)
**Duration:** ~60 minutes.

In this lab you will:
1. Create the AzureFirewallSubnet (if not present).
2. Deploy Azure Firewall.
3. Create Application rules and Network rules.
4. Create a route table with UDRs to route traffic through the firewall.
5. Test connectivity (e.g. RDP from jump box to workload VM via firewall).

**Cleanup:** Run immediately after the lab:
```powershell
Remove-AzResourceGroup -Name "AZ500LAB08" -Force -AsJob
```

## Part 12: Key Facts to Memorize (Day 3 Quick-Reference Card)

| Concept | Key fact |
|---------|----------|
| NSG evaluation order (inbound) | Subnet NSG first → NIC NSG second. Both must allow. |
| NSG evaluation order (outbound) | NIC NSG first → Subnet NSG second. |
| NSG rule priority | Lower number = higher priority. First match wins. |
| Default rules | Priority 65000+; cannot delete. Custom rules override when they match. |
| ASG constraint | Same VNet (not same subnet). Same region for NSG/ASG use. |
| ASG in rules | Protocol matters: TCP-only rule blocks ICMP (ping). |
| UDR routing | Longest prefix match; route through NVA = next hop Virtual appliance. |
| UDR vs NSG | UDR routes (where to send); NSG filters (allow/deny). |
| Azure Firewall subnet | AzureFirewallSubnet, /26 minimum, no NSG, no other resources. |
| Firewall rule order | DNAT → Network → Application. |
| Route table on hub-spoke | RT with firewall next hop → spoke subnet. RT with disabled BGP → GatewaySubnet. |
| Never on AzureFirewallSubnet | Route tables. |
| VPN Gateway types | PolicyBased = 1 tunnel, no BGP. RouteBased = multiple tunnels, BGP. |
| VPN Gateway Basic | No BGP, no Active-Active. |
| VPN Gateway VpnGw1 | 30 S2S, BGP, Active-Active. Cheapest production SKU. |
| VNet peering | Non-overlapping address spaces; bidirectional; cross-sub/tenant OK. |
| Allow gateway transit | Enable on VNet WITH gateway. |
| Use remote gateway | Enable on VNet WITHOUT gateway (spoke). |
| ExpressRoute encryption | MACsec = L2, requires Direct. IPsec VPN over ER = L3, any type. |
| NSG flow logs | Require Network Watcher + storage (or Log Analytics). |
| Flow logs vs. diagnostic logs | Flow = per-flow traffic. Diagnostic = rule hit events. |

**Day 3 is complete.** Review any section you found difficult, complete both labs, and re-attempt the worked examples. Proceed to Day 4 (Private Endpoints, Service Endpoints, WAF, DDoS) when you are confident with every concept above.

**Practice questions (exam dump):** Q17, Q25, Q50, Q106, Q107, Q113, Q125, Q184 — these are covered by the concepts and worked examples in this guide. Use them to verify your understanding.
