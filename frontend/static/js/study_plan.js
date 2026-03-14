/**
 * Study Plan — Multi-cert preparation plan.
 * Safe DOM construction (no innerHTML).
 */

const STUDY_PLANS = {
    "AZ-500": [
        {
            day: 1, title: "Identity & Access (Part 1): RBAC, PIM, MFA", weight: "15-20%",
            sections: [
                { id: "ms_learn", icon: "\ud83d\udcd6", label: "MS Learn Module", text: "Manage security controls for identity and access", link: "https://learn.microsoft.com/en-us/training/modules/manage-security-controls-identity-access/" },
                { id: "video", icon: "\ud83c\udfa5", label: "Exam Readiness Video", text: "Preparing for AZ-500: Secure identity and access (Part 1/4)", link: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-01-fy25" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts", text: "Owner vs Contributor, PIM (P2), Custom roles (Actions/DataActions), Conditional Access (P1/P2), Identity Protection" },
                { id: "lab", icon: "\ud83d\udd2c", label: "Lab: Role-Based Access Control", text: "LAB 01 \u2014 Create users/groups, assign VM Contributor role, verify permissions (~45 min)", link: "https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_01_RBAC.html" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Q23, Q44, Q99, Q143, Q194, Q197, Q198, Q200, Q222, Q292, Q349" }
            ]
        },
        {
            day: 2, title: "Identity & Access (Part 2): App Registrations, Managed Identities, Conditional Access", weight: "15-20%",
            sections: [
                { id: "ms_learn", icon: "\ud83d\udcd6", label: "MS Learn Module", text: "Manage Microsoft Entra application access", link: "https://learn.microsoft.com/en-us/training/modules/manage-application-access-microsoft-entra-id/" },
                { id: "video", icon: "\ud83c\udfa5", label: "Exam Readiness Video (rewatch identity section)", text: "Preparing for AZ-500: Secure identity and access (Part 1/4)", link: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-01-fy25" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts", text: "App registration \u2192 service principal, System vs User-assigned MI, Delegated vs Application permissions, Conditional Access: exclude > include" },
                { id: "lab", icon: "\ud83d\udd2c", label: "Hands-On Practice", text: "Conditional Access + MFA, Named locations, App registration, Managed Identity on Azure Function (~1.5h)" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Q9, Q45, Q100, Q102, Q124, Q142, Q214, Q215, Q256, Q257, Q301, Q303, Q381, Q449, Q450, Q451" }
            ]
        },
        {
            day: 3, title: "Networking Security (Part 1): NSGs, ASGs, Azure Firewall, UDRs", weight: "20-25%",
            sections: [
                { id: "ms_learn", icon: "\ud83d\udcd6", label: "MS Learn Module", text: "Plan and implement security for virtual networks", link: "https://learn.microsoft.com/en-us/training/modules/security-virtual-networks/" },
                { id: "video", icon: "\ud83c\udfa5", label: "Exam Readiness Video", text: "Preparing for AZ-500: Secure Networking (Part 2/4)", link: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-02-fy25" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts", text: "ASGs: same VNet only, Firewall: AzureFirewallSubnet /26, Rule order: DNAT\u2192Network\u2192Application, NSG flow logs: Network Watcher + same-region storage" },
                { id: "lab", icon: "\ud83d\udd2c", label: "Labs: NSGs/ASGs + Azure Firewall", text: "LAB 02 \u2014 NSGs and ASGs (~60 min) + LAB 03 \u2014 Azure Firewall (~60 min)", link: "https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_02_NSGs.html" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Q17, Q25, Q113, Q125, Q184, Q289, Q293, Q377, Q439, Q440, Q447, Q491" }
            ]
        },
        {
            day: 4, title: "Networking Security (Part 2): Private Endpoints, WAF, DDoS, Storage", weight: "20-25%",
            sections: [
                { id: "ms_learn", icon: "\ud83d\udcd6", label: "MS Learn Modules (2 modules)", text: "Security for private access to Azure resources + Security for public access to Azure resources", link: "https://learn.microsoft.com/en-us/training/modules/security-private-access-azure-resources/" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts", text: "Service Endpoint vs Private Endpoint, Private DNS zones (blob, SQL, Cosmos DB, Key Vault, Web App), DDoS Standard features, WAF: App GW (regional) vs Front Door (global)" },
                { id: "lab", icon: "\ud83d\udd2c", label: "Lab: Service Endpoints & Storage", text: "LAB 06 \u2014 Service Endpoints and Securing Storage (~45 min)", link: "https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_06_SecuringAzureStorage.html" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Q16, Q122, Q123, Q296, Q302, Q305, Q376, Q378, Q379, Q380, Q382, Q442, Q443, Q457, Q458, Q490" }
            ]
        },
        {
            day: 5, title: "Compute, Database & Key Vault Security", weight: "20-25%",
            sections: [
                { id: "ms_learn", icon: "\ud83d\udcd6", label: "MS Learn Modules (3 modules)", text: "Advanced security for compute + Security for storage + Security for Azure SQL Database", link: "https://learn.microsoft.com/en-us/training/modules/advanced-security-compute/" },
                { id: "video", icon: "\ud83c\udfa5", label: "Exam Readiness Video", text: "Preparing for AZ-500: Secure compute, storage, and databases (Part 3/4)", link: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-secure-compute-storage-and-databases-3-of-4" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts", text: "JIT: ARM only, Bastion: /26+, ADE: same region+subscription, TDE vs Always Encrypted, Dynamic Masking \u2260 encryption, ACR: acrpull/acrpush" },
                { id: "lab", icon: "\ud83d\udd2c", label: "Labs: ACR/AKS + SQL + Key Vault", text: "LAB 04 \u2014 ACR and AKS + LAB 05 \u2014 SQL + LAB 07 \u2014 Key Vault + Always Encrypted", link: "https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_04_ConfiguringandSecuringACRandAKS.html" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Q22, Q24, Q26, Q101, Q112, Q211, Q258, Q259, Q290, Q291, Q304, Q350, Q438, Q444" }
            ]
        },
        {
            day: 6, title: "Defender for Cloud, Azure Policy, Monitoring & Sentinel", weight: "30-35%",
            sections: [
                { id: "ms_learn", icon: "\ud83d\udcd6", label: "MS Learn Modules (4 modules)", text: "Cloud governance policies + Defender for Cloud posture + Threat protection + Security monitoring & automation", link: "https://learn.microsoft.com/en-us/training/modules/implement-manage-enforcement-cloud-governance-policies/" },
                { id: "video", icon: "\ud83c\udfa5", label: "Exam Readiness Video", text: "Preparing for AZ-500: Defender for Cloud and Sentinel (Part 4/4)", link: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/preparing-for-az-500-04-fy25" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts", text: "Policy effects (Deny, Audit, DeployIfNotExists, Modify), Key Vault access, Sentinel analytics rules (Fusion, Scheduled, NRT), CEF connector, Workflow automation = Logic Apps" },
                { id: "lab", icon: "\ud83d\udd2c", label: "Labs: Log Analytics + Defender + JIT + Sentinel", text: "LAB 08 + LAB 09 + LAB 10 + LAB 11 (4 labs!)", link: "https://microsoftlearning.github.io/AZ500-AzureSecurityTechnologies/Instructions/Labs/LAB_08_CreateaLogAnalyticsworkspaceAzureStorageAccountDataCollectionRule(DCR).html" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Q20, Q21, Q111, Q126, Q186, Q187, Q201, Q223, Q224, Q225, Q289, Q294, Q295, Q297, Q346, Q347, Q348, Q356, Q358-361, Q436, Q437, Q441, Q448, Q452-456" }
            ]
        },
        {
            day: 7, title: "Full Review, Weak Areas & Exam Simulation", weight: "All domains",
            sections: [
                { id: "concepts", icon: "\ud83d\udd01", label: "Morning: Quick Checklist Review (2h)", text: "Review all 4 domains: Identity & Access, Networking, Compute/Storage/DB, Defender/Policy/Sentinel" },
                { id: "practice", icon: "\u2753", label: "Afternoon: Exam Simulation (2.5h)", text: "Take a full 60-question Mock Exam with 150-minute timer. No peeking at explanations!" },
                { id: "lab", icon: "\ud83d\udd01", label: "Evening: Targeted Review (1.5h)", text: "For every wrong answer \u2192 read explanation \u2192 find it in Azure Portal" }
            ]
        }
    ],
    "CEH": [
        {
            day: 1, title: "Info Security Overview & Reconnaissance Techniques", weight: "23% (6%+17%)",
            sections: [
                { id: "material", icon: "\ud83d\udcd6", label: "Read Day 1 Study Material", text: "CIA triad, hacking phases, Cyber Kill Chain, MITRE ATT&CK, laws (HIPAA/SOX/PCI-DSS/GDPR), footprinting, Google dorking, Whois, DNS, Nmap scanning, enumeration (NetBIOS/SNMP/LDAP/NTP/SMTP)" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts to Master", text: "Hacker types (white/black/gray/suicide), 5 hacking phases, 7 Cyber Kill Chain stages, TTL values (Windows=128, Linux=64), Nmap flags (-sS/-sT/-sF/-sX/-sN/-sA/-sI/-sU), well-known ports (21/22/23/25/53/80/110/135/139/143/161/389/443/445/993/995/3389)" },
                { id: "tools", icon: "\ud83d\udee0\ufe0f", label: "Tools to Know", text: "Nmap, Hping3, Maltego, theHarvester, Recon-ng, Shodan, Nikto, Gobuster, nslookup, dig, Sublist3r, OSINT Framework" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Start a Learning Session filtered by domains: Information Security Overview + Reconnaissance Techniques (~176 questions)" }
            ]
        },
        {
            day: 2, title: "System Hacking, Vulnerability Analysis & Malware Threats", weight: "15%",
            sections: [
                { id: "material", icon: "\ud83d\udcd6", label: "Read Day 2 Study Material", text: "CVSS scoring, vulnerability assessment types, password cracking (dictionary/brute force/hybrid/rainbow table), privilege escalation, rootkits, clearing tracks, malware types, virus classification, APTs, fileless malware, Emotet, Mirai" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts to Master", text: "CVSS ranges (Low 0.1-3.9, Medium 4.0-6.9, High 7.0-8.9, Critical 9.0-10.0), LM hash weakness (uppercase, 7-char split, AAD3B435B51404EE = <8 chars), SID 500=Admin/501=Guest, password salting, rootkit levels (user/kernel/hypervisor), ADS (NTFS), steganography" },
                { id: "tools", icon: "\ud83d\udee0\ufe0f", label: "Tools to Know", text: "Metasploit (msfvenom, getsystem, msfencode), John the Ripper, Hashcat, L0phtCrack, Mimikatz, Netcat/Cryptcat, Nessus, OpenVAS, Qualys" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Start a Learning Session filtered by domain: System Hacking Phases and Attack Techniques (~67 questions)" }
            ]
        },
        {
            day: 3, title: "Sniffing, Social Engineering & Denial-of-Service", weight: "~14% of Domain 4",
            sections: [
                { id: "material", icon: "\ud83d\udcd6", label: "Read Day 3 Study Material", text: "Passive vs active sniffing, MAC flooding, ARP poisoning, DHCP starvation, DNS poisoning, promiscuous mode, social engineering types (17 attack types), DoS/DDoS attacks, SYN flood, Slowloris, RUDY, Smurf, Ping of Death, botnets" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts to Master", text: "MAC flooding \u2192 switch becomes hub, ARP poisoning \u2192 MiTM, DAI uses DHCP snooping DB, phishing vs spear phishing vs whaling vs vishing vs smishing, tailgating vs piggybacking, DoS vs DDoS, volumetric vs protocol vs application layer attacks" },
                { id: "tools", icon: "\ud83d\udee0\ufe0f", label: "Tools to Know", text: "Wireshark, tcpdump, tshark, Ettercap, BetterCAP, macof, Yersinia, LOIC, HOIC, Hping3, WinPcap/AirPcap" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Filter by domain: Network and Perimeter Hacking (~142 questions, do first half)" }
            ]
        },
        {
            day: 4, title: "Session Hijacking & Evading IDS/Firewalls/Honeypots", weight: "~10% of Domain 4",
            sections: [
                { id: "material", icon: "\ud83d\udcd6", label: "Read Day 4 Study Material", text: "TCP/IP hijacking, RST hijacking, blind hijacking, session fixation vs donation, IDS types (NIDS/HIDS, signature/anomaly), firewall types, evasion techniques, Snort rules, YARA rules, honeypot detection" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts to Master", text: "Session hijacking: application-level vs network-level, RST hijacking = spoofed RST packet, Nmap evasion: -D (decoy), -T (timing), -f (fragment), -sA (ACK scan), Snort rule syntax: action protocol src dst (options), stateful vs stateless firewall (ACK scan distinguishes)" },
                { id: "tools", icon: "\ud83d\udee0\ufe0f", label: "Tools to Know", text: "Burp Suite, bettercap, Snort, Suricata, yarGen, Send-Safe Honeypot Hunter, Nmap (evasion flags)" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Continue Network and Perimeter Hacking questions (second half)" }
            ]
        },
        {
            day: 5, title: "Web Application Hacking & SQL Injection", weight: "14%",
            sections: [
                { id: "material", icon: "\ud83d\udcd6", label: "Read Day 5 Study Material", text: "Web server attacks, directory traversal, OWASP Top 10, XSS (stored/reflected/DOM), CSRF, SSRF, clickjacking, IDOR, SQL injection types (in-band/blind/out-of-band), SQLi evasion, sqlmap, WAF bypass" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts to Master", text: "XSS: stored (persistent) vs reflected (non-persistent) vs DOM-based, CSRF = browser makes request without user knowledge, SSRF = server makes request to internal resources, SQLi: error-based \u2192 union-based \u2192 blind (boolean/time) \u2192 out-of-band, robots.txt = info leakage" },
                { id: "tools", icon: "\ud83d\udee0\ufe0f", label: "Tools to Know", text: "Burp Suite, OWASP ZAP, sqlmap, Nikto, Gobuster, Syhunt Hybrid, Wapiti, Netsparker, Acunetix" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Filter by domain: Web Application Hacking (~66 questions)" }
            ]
        },
        {
            day: 6, title: "Wireless, Mobile, IoT & OT Hacking", weight: "15% (5%+10%)",
            sections: [
                { id: "material", icon: "\ud83d\udcd6", label: "Read Day 6 Study Material", text: "WEP/WPA/WPA2/WPA3, evil twin, KRACK, Dragonblood, Bluetooth attacks, mobile attacks (Agent Smith, iOS Trustjacking, Spearphone), jailbreaking types, IoT protocols (MQTT/Zigbee/BLE), IoT attacks (replay, fault injection), OT/ICS/SCADA" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts to Master", text: "WEP=RC4 (weak), WPA=TKIP, WPA2=AES/CCMP, WPA3=SAE/Dragonfly, KRACK targets WPA2 4-way handshake, Bluejacking=messages, Bluesnarfing=data theft, Bluesmacking=DoS, untethered jailbreak=survives reboot, Mirai botnet port 48101, Zigbee=IEEE 802.15.4" },
                { id: "tools", icon: "\ud83d\udee0\ufe0f", label: "Tools to Know", text: "Aircrack-ng, Kismet, WiFi Pineapple, Wash, Reaver, Shodan, Censys, IoTSeeker, Flowmon, Btlejack" },
                { id: "practice", icon: "\u2753", label: "Practice Questions", text: "Filter by domains: Wireless + Mobile/IoT/OT (~55 questions)" }
            ]
        },
        {
            day: 7, title: "Cloud, Cryptography & Final Review", weight: "10% (5%+5%) + Review",
            sections: [
                { id: "material", icon: "\ud83d\udcd6", label: "Read Day 7 Study Material", text: "Cloud models (IaaS/PaaS/SaaS/FaaS), Docker/Kubernetes, cloud attacks (Cloud Hopper/Cloudborne/MITC), CASB, zero trust, symmetric algorithms (DES/3DES/AES/Blowfish/Twofish), asymmetric (RSA/DH/ECC), hashing, PKI, digital signatures, cryptanalysis" },
                { id: "concepts", icon: "\ud83e\udde0", label: "Key Concepts to Master", text: "IaaS=full control, SaaS=no control, PaaS=middle, CASB=multi-cloud security broker, AES key sizes: 128/192/256 only (no 512!), private key signs + public key verifies, PGP=Web of Trust, S/MIME=PKI hierarchy, meet-in-the-middle \u2260 man-in-the-middle, DROWN=SSLv2" },
                { id: "review", icon: "\ud83d\udd01", label: "Cheatsheet & Port Review", text: "Open the Day 7 material for comprehensive port table (60+ ports), tools reference (80+ tools), and common exam traps" },
                { id: "mock", icon: "\ud83c\udfaf", label: "Mock Exam (125 questions, 4 hours)", text: "Take a full CEH Mock Exam under real conditions. 125 questions, 240 minutes, no peeking!" },
                { id: "practice", icon: "\u2753", label: "Weak Spots Review", text: "After the mock exam, use Weak Spots mode to review domains where your accuracy is below 70%" }
            ]
        }
    ]
};

// Select the right plan based on active certification
const STUDY_PLAN = STUDY_PLANS[getActiveCertificationCode()] || STUDY_PLANS["AZ-500"] || [];

function buildScopedMaterialsDayHref(dayNumber) {
    const params = new URLSearchParams(window.location.search);
    const certSlug = params.get('cert');
    return certSlug ? `/materials/day/${dayNumber}?cert=${encodeURIComponent(certSlug)}` : `/materials/day/${dayNumber}`;
}

let userProgress = {};
let expandedDays = new Set();
const studyPlanCertificationCode = getActiveCertificationCode();

document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('study-days')) return;
    try {
        const progressUrl = studyPlanCertificationCode
            ? '/analytics/study-plan/progress?certification_code=' + encodeURIComponent(studyPlanCertificationCode)
            : '/analytics/study-plan/progress';
        const data = await api(progressUrl);
        userProgress = data.progress || {};
    } catch (e) {
        // Not logged in or no progress yet
    }
    renderPlan();
});

function renderPlan() {
    const container = document.getElementById('study-days');
    container.textContent = '';

    let totalSections = 0;
    let completedSections = 0;

    STUDY_PLAN.forEach(day => {
        // Filter out practice sections
        const sections = day.sections.filter(s => s.id !== 'practice');

        totalSections += sections.length;
        const dayCompleted = sections.filter(s => {
            const key = day.day + '_' + s.id;
            return userProgress[key] && userProgress[key].completed;
        }).length;
        completedSections += dayCompleted;

        const card = document.createElement('div');
        card.className = 'card';
        card.style.cssText = 'padding: 0; overflow: hidden;';

        // Day header (clickable to expand)
        const header = document.createElement('div');
        header.style.cssText = 'padding: 20px 24px; cursor: pointer; display: flex; align-items: center; gap: 16px; transition: background 0.15s;';
        header.onmouseenter = () => { header.style.background = 'var(--c-surface-hover)'; };
        header.onmouseleave = () => { header.style.background = ''; };

        const dayBadge = document.createElement('div');
        dayBadge.style.cssText = 'width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; font-family: "JetBrains Mono", monospace; flex-shrink: 0;';
        if (dayCompleted === sections.length) {
            dayBadge.style.background = 'var(--c-success-muted)';
            dayBadge.style.color = 'var(--c-success)';
        } else if (dayCompleted > 0) {
            dayBadge.style.background = 'var(--c-primary-muted)';
            dayBadge.style.color = 'var(--c-primary)';
        } else {
            dayBadge.style.background = 'var(--c-bg)';
            dayBadge.style.color = 'var(--c-text-muted)';
        }
        dayBadge.textContent = day.day;
        header.appendChild(dayBadge);

        const titleArea = document.createElement('div');
        titleArea.style.cssText = 'flex: 1; min-width: 0;';
        const title = document.createElement('div');
        title.style.cssText = 'font-size: 15px; font-weight: 600; color: var(--c-text); margin-bottom: 2px;';
        title.textContent = 'Day ' + day.day + ' \u2014 ' + day.title;
        titleArea.appendChild(title);
        const meta = document.createElement('div');
        meta.style.cssText = 'font-size: 12px; color: var(--c-text-muted); display: flex; gap: 12px;';
        const weightSpan = document.createElement('span');
        weightSpan.textContent = 'Exam weight: ' + day.weight;
        meta.appendChild(weightSpan);
        const progressSpan = document.createElement('span');
        progressSpan.textContent = dayCompleted + '/' + sections.length + ' complete';
        progressSpan.style.color = dayCompleted === sections.length ? 'var(--c-success)' : '';
        meta.appendChild(progressSpan);
        titleArea.appendChild(meta);
        header.appendChild(titleArea);

        const arrow = document.createElement('div');
        arrow.style.cssText = 'font-size: 18px; color: var(--c-text-muted); transition: transform 0.2s;';
        arrow.textContent = '\u25bc';
        header.appendChild(arrow);
        card.appendChild(header);

        // Sections (collapsible body)
        const body = document.createElement('div');
        const isExpanded = expandedDays.has(day.day);
        body.style.cssText = isExpanded
            ? 'overflow: hidden; transition: max-height 0.3s ease; border-top: 1px solid var(--c-border);'
            : 'max-height: 0; overflow: hidden; transition: max-height 0.3s ease; border-top: 0 solid var(--c-border);';
        if (isExpanded) arrow.style.transform = 'rotate(180deg)';

        const bodyInner = document.createElement('div');
        bodyInner.style.cssText = 'padding: 0 24px 20px;';

        const materialLink = document.createElement('a');
        materialLink.href = buildScopedMaterialsDayHref(day.day);
        materialLink.className = 'study-material-btn';
        materialLink.textContent = '\ud83d\udcd6 Read Day ' + day.day + ' Study Material';
        const materialRow = document.createElement('div');
        materialRow.style.cssText = 'padding: 16px 0 8px; text-align: center;';
        materialRow.appendChild(materialLink);
        bodyInner.appendChild(materialRow);

        sections.forEach(section => {
            const key = day.day + '_' + section.id;
            const isCompleted = userProgress[key] && userProgress[key].completed;
            const sRow = document.createElement('div');
            sRow.style.cssText = 'display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--c-border);';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isCompleted;
            checkbox.style.cssText = 'width: 18px; height: 18px; margin-top: 2px; cursor: pointer; accent-color: var(--c-primary); flex-shrink: 0;';
            checkbox.onclick = (e) => { e.stopPropagation(); };
            checkbox.onchange = (e) => { e.stopPropagation(); toggleSection(day.day, section.id, checkbox); };
            sRow.appendChild(checkbox);
            const icon = document.createElement('span');
            icon.style.cssText = 'font-size: 16px; flex-shrink: 0; margin-top: 1px;';
            icon.textContent = section.icon;
            sRow.appendChild(icon);
            const content = document.createElement('div');
            content.style.cssText = 'flex: 1; min-width: 0;';
            const label = document.createElement('div');
            label.style.cssText = 'font-size: 13px; font-weight: 600; color: var(--c-text); margin-bottom: 2px;';
            if (isCompleted) label.style.textDecoration = 'line-through';
            label.textContent = section.label;
            content.appendChild(label);
            const text = document.createElement('div');
            text.style.cssText = 'font-size: 12px; color: var(--c-text-secondary); line-height: 1.5;';
            text.textContent = section.text;
            content.appendChild(text);
            if (section.link) {
                const link = document.createElement('a');
                link.href = section.link;
                link.target = '_blank';
                link.rel = 'noopener';
                link.style.cssText = 'font-size: 11px; color: var(--c-primary); display: inline-block; margin-top: 4px;';
                link.textContent = 'Open resource \u2192';
                content.appendChild(link);
            }
            sRow.appendChild(content);
            bodyInner.appendChild(sRow);
        });

        body.appendChild(bodyInner);
        card.appendChild(body);
        if (isExpanded) {
            requestAnimationFrame(() => { body.style.maxHeight = body.scrollHeight + 'px'; });
        }
        header.onclick = () => {
            const nowExpanded = expandedDays.has(day.day);
            if (nowExpanded) {
                expandedDays.delete(day.day);
                body.style.maxHeight = '0';
                body.style.borderTopWidth = '0';
                arrow.style.transform = '';
            } else {
                expandedDays.add(day.day);
                body.style.maxHeight = body.scrollHeight + 'px';
                body.style.borderTopWidth = '1px';
                arrow.style.transform = 'rotate(180deg)';
            }
        };
        container.appendChild(card);
    });

    const pct = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
    document.getElementById('plan-progress-fill').style.width = pct + '%';
    document.getElementById('plan-progress-pct').textContent = pct + '%';
}

async function toggleSection(day, section, checkbox) {
    try {
        const result = await api('/analytics/study-plan/toggle', {
            method: 'POST',
            body: { day, section, certification_code: studyPlanCertificationCode },
        });
        const key = day + '_' + section;
        userProgress[key] = { completed: result.completed };
        const row = checkbox.closest('div[style*="display: flex"]');
        if (row) {
            const label = row.querySelector('div[style*="font-weight: 600"]');
            if (label) label.style.textDecoration = result.completed ? 'line-through' : 'none';
        }
    } catch (e) {
        console.error('Failed to toggle section:', e);
        checkbox.checked = !checkbox.checked;
    }
}
