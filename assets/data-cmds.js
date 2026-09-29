// ==========================================================
// Base de commandes
//   "## id | Titre | intro"  = nouvelle section
//   ligne de commande       = shell ¦ commande ¦ à quoi elle sert ¦ comment s'en servir ¦ ce qu'il faut regarder
//   shell : ps (PowerShell), cmd (Invite de commandes), lin (Linux / bash), tool (outil graphique ou Win+R)
//   {{VAR}} est remplacé par les variables saisies sur le site.
// ==========================================================
const CMDS_TXT = String.raw`
## start | 🚀 Démarrage de l'épreuve | Les premières minutes : repérer l'infra, se connecter, vérifier que tout répond.
tool ¦ Lire tout le sujet + plan d'adressage ¦ Repérer les machines, IP, comptes et livrables avant de toucher à quoi que ce soit. ¦ Recopier le plan d'adressage dans les variables du site (en haut de page) : toutes les commandes s'adaptent. ¦
ps ¦ Get-NetIPConfiguration ¦ Voir l'IP, la passerelle et le DNS de la machine sur laquelle tu es. ¦ À lancer sur chaque VM au début pour vérifier qu'elle est dans le bon réseau. ¦ IPv4Address, IPv4DefaultGateway, DNSServer.
cmd ¦ ipconfig /all ¦ Même chose en CMD, avec en plus MAC, DHCP et suffixe DNS. ¦ Marche partout, même sans PowerShell. ¦ DHCP activé Oui/Non, serveurs DNS.
ps ¦ Test-NetConnection {{SRV}} -Port 3389 ¦ Vérifier qu'on peut ouvrir un bureau à distance vers le serveur. ¦ Remplacer 3389 par 22 (SSH), 445 (partage), 5985 (WinRM). ¦ TcpTestSucceeded : True.
tool ¦ mstsc /v:{{SRV}} ¦ Ouvrir un Bureau à distance (RDP) vers un serveur Windows. ¦ Win+R puis la commande. Identifiant : {{NB}}\administrateur. Option /admin pour la session console. ¦
tool ¦ PuTTY → {{LIN}} port 22 ¦ Ouvrir un terminal SSH sur le serveur Linux. ¦ Host Name = IP, Port 22, type SSH, Open. Accepter la clé la 1re fois. Clic droit = coller, sélection = copier. ¦ « Connection refused » = sshd arrêté ; « timed out » = réseau / pare-feu.
tool ¦ WinSCP → SFTP {{LIN}} ¦ Transférer des fichiers entre Windows et Linux (et éditer un fichier de conf avec le Bloc-notes). ¦ Protocole SFTP, port 22, même compte que SSH. Glisser-déposer entre les 2 volets. F4 = éditer un fichier distant. ¦ Droits : un fichier déposé appartient au compte utilisé.
ps ¦ Checkpoint-VM -Name {{VM}} -SnapshotName "avant-exam" ¦ Prendre un point de contrôle Hyper-V avant de modifier une VM (si autorisé). ¦ Sous VirtualBox : Machine > Prendre un instantané. ¦

## net | 🌐 Réseau Windows | Toujours dans cet ordre : carte → IP → passerelle → DNS → service.
cmd ¦ ipconfig ¦ Affiche IP, masque et passerelle de chaque carte. ¦ Sans option : résumé. /all : détail complet. ¦ 169.254.x.x = aucune réponse DHCP. Pas de passerelle = pas d'accès hors réseau.
cmd ¦ ipconfig /release ¦ Libère l'adresse obtenue par DHCP. ¦ Toujours suivi de ipconfig /renew. Attention en RDP : tu perds la connexion. ¦
cmd ¦ ipconfig /renew ¦ Redemande une adresse au serveur DHCP. ¦ Après /release, ou après correction côté serveur DHCP. ¦ Erreur ou délai = DHCP injoignable (service, étendue, relais, mode réseau de la VM).
cmd ¦ ipconfig /flushdns ¦ Vide le cache DNS du poste. ¦ Après la modification d'un enregistrement DNS. ¦
cmd ¦ ipconfig /registerdns ¦ Réenregistre le poste dans le DNS. ¦ Quand le poste est introuvable par son nom depuis le serveur. ¦
cmd ¦ ping {{GW}} ¦ Teste la passerelle. ¦ -n 10 : 10 paquets · -t : continu (Ctrl+C) · -a : résolution inverse · -4 : forcer IPv4. ¦ Échec = problème local (câble, IP, VLAN, mode réseau VM).
cmd ¦ ping {{SRV}} ¦ Teste le serveur par son nom. ¦ Si l'IP répond mais pas le nom → problème DNS. ¦ « Hôte introuvable » = DNS. « Délai dépassé » = pare-feu ou machine éteinte.
cmd ¦ ping 8.8.8.8 ¦ Teste la sortie Internet sans DNS. ¦ OK mais « ping google.fr » KO → DNS / redirecteurs. ¦
cmd ¦ tracert -d 8.8.8.8 ¦ Chemin réseau saut par saut. ¦ -d : sans résolution de noms (plus rapide). ¦ Le dernier saut qui répond indique où ça coupe.
cmd ¦ pathping 8.8.8.8 ¦ Traceroute + pertes par saut (≈ 1 min). ¦ Pour une connexion lente ou instable. ¦ Saut avec perte élevée = maillon faible.
cmd ¦ arp -a ¦ Table IP ↔ MAC des voisins. ¦ arp -d * vide la table (admin). ¦ Deux IP avec la même MAC = conflit (VM clonée).
cmd ¦ route print ¦ Table de routage. ¦ route add 10.0.0.0 mask 255.0.0.0 {{GW}} -p : ajoute une route permanente. ¦ La ligne 0.0.0.0 donne la passerelle par défaut.
cmd ¦ netstat -ano | findstr :3389 ¦ Qui écoute / est connecté sur un port, avec le PID. ¦ Remplacer 3389 par le port. -a tout, -n numérique, -o PID. Puis tasklist /fi "PID eq 1234". ¦ LISTENING = le service écoute.
cmd ¦ nslookup {{SRV}} ¦ Résolution DNS d'un nom. ¦ nslookup nom serveurDNS : interroger un DNS précis. -type=SRV / MX / PTR. ¦ « Non-existent domain » = pas d'enregistrement.
cmd ¦ getmac /v ¦ Adresses MAC de chaque carte. ¦ Pour une réservation DHCP. ¦
cmd ¦ hostname ¦ Nom de la machine. ¦ ¦
cmd ¦ netsh advfirewall show allprofiles state ¦ État du pare-feu par profil. ¦ netsh advfirewall set allprofiles state off : désactive (à éviter, préférer une règle). ¦ Profil actif Domaine / Privé / Public.
cmd ¦ netsh interface ip set address "Ethernet" static {{NET}}.30 255.255.255.0 {{GW}} ¦ Mettre une IP fixe en CMD. ¦ Nom de la carte : netsh interface show interface. Repasser en DHCP : netsh interface ip set address "Ethernet" dhcp ¦
cmd ¦ netsh interface ip set dns "Ethernet" static {{IPSRV}} ¦ Mettre le DNS en CMD. ¦ ¦
ps ¦ Get-NetAdapter ¦ État des cartes (Up / Disconnected / Disabled) et vitesse. ¦ Name = nom à réutiliser dans les autres commandes (-InterfaceAlias). ¦ Disconnected = câble ou « câble branché » décoché dans VirtualBox.
ps ¦ New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress {{NET}}.30 -PrefixLength 24 -DefaultGateway {{GW}} ¦ Configurer une IP fixe. ¦ Si une IP existe déjà : Remove-NetIPAddress -InterfaceAlias "Ethernet" -Confirm:$false d'abord. ¦
ps ¦ Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses {{IPSRV}} ¦ Configurer le serveur DNS de la carte. ¦ Plusieurs DNS : -ServerAddresses {{IPSRV}},8.8.8.8 · Revenir au DHCP : -ResetServerAddresses ¦
ps ¦ Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled ¦ Repasser la carte en DHCP. ¦ Puis ipconfig /renew. ¦
ps ¦ Test-NetConnection {{SRV}} -Port 445 ¦ Tester un port TCP précis. ¦ 445 SMB · 389 LDAP · 88 Kerberos · 53 DNS · 3389 RDP · 22 SSH · 5985 WinRM · 3260 iSCSI. -TraceRoute pour le chemin. ¦ TcpTestSucceeded : True = joignable. False = pare-feu / service arrêté.
ps ¦ Get-NetTCPConnection -State Listen | Sort-Object LocalPort ¦ Ports en écoute sur la machine. ¦ Ajouter | Where-Object LocalPort -eq 80 pour filtrer. ¦
ps ¦ Rename-NetAdapter -Name "Ethernet 2" -NewName "iSCSI" ¦ Renommer une carte (bonne pratique sur un nœud de cluster). ¦ Noms parlants : LAN, iSCSI, Heartbeat. ¦
ps ¦ Enable-NetFirewallRule -Name FPS-ICMP4-ERQ-In ¦ Autoriser le ping entrant. ¦ Get-NetFirewallRule -DisplayName "*Ping*" pour retrouver la règle en français. ¦
ps ¦ New-NetFirewallRule -DisplayName "Web 80" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow ¦ Ouvrir un port entrant dans le pare-feu. ¦ -RemoteAddress {{NET}}.0/24 pour limiter à un réseau. ¦
ps ¦ Get-NetConnectionProfile ¦ Profil réseau de la carte. ¦ Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private ¦ Public sur un poste du domaine = il ne voit pas le DC.

## team | 🔗 Agrégation de cartes (NIC Teaming / SET) | Sur les nœuds du cluster : 2 cartes réunies en 1 lien logique (tolérance de panne + débit).
ps ¦ Get-NetLbfoTeam ¦ Voir les teams (agrégations) existantes. ¦ Get-NetLbfoTeamMember : cartes membres et leur état. ¦ Status Up / Degraded (une carte tombée).
ps ¦ New-NetLbfoTeam -Name "Team-LAN" -TeamMembers "Ethernet","Ethernet 2" -TeamingMode SwitchIndependent -LoadBalancingAlgorithm Dynamic ¦ Agréger deux cartes (serveur Windows, hors Hyper-V). ¦ SwitchIndependent : aucune config sur le switch. LACP : le switch doit être configuré (802.3ad). Console : lbfoadmin.exe ou Gestionnaire de serveur > Association de cartes réseau. ¦ La nouvelle carte « Team-LAN » reçoit l'IP.
ps ¦ New-VMSwitch -Name "vSwitch-LAN" -NetAdapterName "Ethernet","Ethernet 2" -EnableEmbeddedTeaming $true ¦ Agrégation SET pour Hyper-V (recommandée sur Server 2019+). ¦ Les VM se branchent sur ce commutateur virtuel. ¦ Get-VMSwitchTeam pour vérifier.
tool ¦ lbfoadmin.exe ¦ Console graphique d'association de cartes réseau. ¦ Win+R. Aussi : Gestionnaire de serveur > Serveur local > Association de cartes réseau. ¦

## iscsi | 💽 iSCSI et stockage | Le NAS présente un disque (LUN) aux nœuds par le réseau, port 3260.
tool ¦ iscsicpl ¦ Initiateur iSCSI (graphique) : connecter un nœud au NAS. ¦ Onglet Cibles : saisir {{NAS}} > Connexion rapide. Cocher « ajouter aux cibles favorites » pour la reconnexion au démarrage. ¦ État « Connecté ».
ps ¦ Start-Service MSiSCSI; Set-Service MSiSCSI -StartupType Automatic ¦ Démarrer le service initiateur iSCSI (arrêté par défaut). ¦ À faire sur chaque nœud. ¦
ps ¦ New-IscsiTargetPortal -TargetPortalAddress {{NAS}} ¦ Déclarer le NAS comme portail iSCSI. ¦ Puis Get-IscsiTarget pour voir les cibles (IQN) proposées. ¦
ps ¦ Get-IscsiTarget | Connect-IscsiTarget -IsPersistent $true ¦ Se connecter aux cibles, de façon persistante. ¦ -IsPersistent : reconnexion au redémarrage. ¦ IsConnected : True.
ps ¦ Get-IscsiSession ¦ Sessions iSCSI actives. ¦ ¦ Aucune session = NAS injoignable, cible non autorisée pour cet IQN, service arrêté.
ps ¦ (Get-InitiatorPort).NodeAddress ¦ IQN de ce nœud (à autoriser côté NAS). ¦ À copier dans la liste d'accès de la cible sur le NAS. ¦
ps ¦ Test-NetConnection {{NAS}} -Port 3260 ¦ Le NAS répond-il en iSCSI ? ¦ ¦ False = réseau / service iSCSI du NAS.
ps ¦ Get-Disk ¦ Disques vus par la machine (dont les LUN iSCSI). ¦ Un disque iSCSI apparaît en BusType iSCSI, souvent Offline au début. ¦ OperationalStatus Offline / PartitionStyle RAW = à initialiser.
ps ¦ Set-Disk -Number 1 -IsOffline $false ¦ Mettre un disque en ligne. ¦ Numéro donné par Get-Disk. Sur un disque de cluster : le faire sur UN seul nœud. ¦
ps ¦ Initialize-Disk -Number 1 -PartitionStyle GPT ¦ Initialiser un disque neuf. ¦ ⚠ Efface la table de partitions : vérifier le numéro ! ¦
ps ¦ New-Partition -DiskNumber 1 -UseMaximumSize -AssignDriveLetter | Format-Volume -FileSystem NTFS -NewFileSystemLabel "DATA" ¦ Créer et formater une partition. ¦ ReFS aussi possible pour Hyper-V. ¦
tool ¦ diskmgmt.msc ¦ Gestion des disques (graphique). ¦ Clic droit sur le disque : En ligne, Initialiser, Nouveau volume simple. ¦
ps ¦ Get-Volume ¦ Volumes, lettres, espace libre. ¦ ¦ SizeRemaining faible = disque plein.

## hv | 🖥️ Hyper-V | Sur un nœud Hyper-V (module Hyper-V). Console : virtmgmt.msc.
tool ¦ virtmgmt.msc ¦ Gestionnaire Hyper-V. ¦ Pour une VM de cluster, préférer le Gestionnaire du cluster de basculement. ¦
ps ¦ Get-VM ¦ Liste des VM, état, CPU, mémoire. ¦ Get-VM -ComputerName {{NODE2}} pour un autre hôte. ¦ State Running / Off / Saved / Paused.
ps ¦ Start-VM -Name {{VM}} ¦ Démarrer une VM. ¦ Stop-VM -Name {{VM}} (arrêt propre) · -TurnOff (couper) · Restart-VM · Suspend-VM / Resume-VM. ¦
ps ¦ New-VM -Name {{VM}} -MemoryStartupBytes 2GB -Generation 2 -NewVHDPath "C:\ClusterStorage\Volume1\{{VM}}\{{VM}}.vhdx" -NewVHDSizeBytes 60GB -SwitchName "vSwitch-LAN" ¦ Créer une VM dont le disque est sur le stockage partagé. ¦ Chemin C:\ClusterStorage\… = volume partagé du cluster (CSV). Ensuite l'ajouter au cluster (Add-ClusterVirtualMachineRole). ¦
ps ¦ Get-VMHardDiskDrive -VMName {{VM}} ¦ Où est le VHDX de la VM ? ¦ ¦ Path doit être sous C:\ClusterStorage pour que la VM puisse basculer.
ps ¦ Get-VMNetworkAdapter -VMName {{VM}} ¦ Carte réseau de la VM et commutateur utilisé. ¦ Connect-VMNetworkAdapter -VMName {{VM}} -SwitchName "vSwitch-LAN" pour la rebrancher. ¦ SwitchName vide = VM sans réseau.
ps ¦ Get-VMSwitch ¦ Commutateurs virtuels. ¦ Externe = relié à une carte physique · Interne = hôte + VM · Privé = VM seulement. ¦ Même nom de commutateur obligatoire sur les 2 nœuds pour la migration.
ps ¦ Checkpoint-VM -Name {{VM}} -SnapshotName "avant-modif" ¦ Créer un point de contrôle. ¦ Get-VMSnapshot -VMName {{VM}} · Restore-VMSnapshot -Name "avant-modif" -VMName {{VM}} · Remove-VMSnapshot. ¦
ps ¦ Set-VMMemory -VMName {{VM}} -DynamicMemoryEnabled $true -StartupBytes 2GB -MaximumBytes 4GB ¦ Régler la mémoire (VM éteinte pour certains réglages). ¦ Set-VMProcessor -VMName {{VM}} -Count 2 pour les CPU. ¦
ps ¦ Enable-VMIntegrationService -VMName {{VM}} -Name "Interface de services d'invité" ¦ Services d'intégration (copie de fichiers hôte → VM). ¦ Copy-VMFile {{VM}} -SourcePath C:\f.txt -DestinationPath C:\f.txt -FileSource Host ¦
ps ¦ Measure-VM -Name {{VM}} ¦ Consommation d'une VM (si la mesure est activée). ¦ Enable-VMResourceMetering -VMName {{VM}} d'abord. ¦

## clu | 🧩 Cluster de basculement (Failover Cluster) | 2 nœuds identiques + NAS en iSCSI : les VHDX sont sur le stockage partagé, une VM bascule d'un nœud à l'autre si l'un tombe (haute disponibilité). Console : cluadmin.msc.
tool ¦ cluadmin.msc ¦ Gestionnaire du cluster de basculement (console d'administration). ¦ Rôles = VM et services en HA · Nœuds · Stockage > Disques / Volumes partagés · Réseaux · Événements du cluster. ¦ Icônes rouges / « Échec » = à investiguer.
ps ¦ Install-WindowsFeature Failover-Clustering -IncludeManagementTools ¦ Installer la fonctionnalité Cluster sur un nœud. ¦ Sur CHAQUE nœud, + Hyper-V si les rôles sont des VM. Redémarrage conseillé. ¦
ps ¦ Test-Cluster -Node {{NODE1}},{{NODE2}} ¦ Valider la configuration avant création (ou pour diagnostiquer). ¦ Génère un rapport HTML (chemin indiqué à la fin). -Include "Stockage" pour un seul test. ¦ Avertissements acceptables en labo, Échec = bloquant.
ps ¦ New-Cluster -Name {{CLU}} -Node {{NODE1}},{{NODE2}} -StaticAddress {{NET}}.40 ¦ Créer le cluster. ¦ Il faut une IP libre pour le nom du cluster. Crée un objet ordinateur {{CLU}} dans l'AD (droits nécessaires). ¦
ps ¦ Get-Cluster ¦ Infos du cluster. ¦ Get-Cluster -Name {{CLU}} depuis une autre machine. ¦
ps ¦ Get-ClusterNode ¦ État des nœuds. ¦ Suspend-ClusterNode -Name {{NODE1}} -Drain : met en maintenance en déplaçant les rôles · Resume-ClusterNode -Name {{NODE1}} -Failback Immediate. ¦ State Up / Down / Paused.
ps ¦ Get-ClusterGroup ¦ Rôles du cluster (VM, serveur de fichiers…) et nœud propriétaire. ¦ ¦ State Online / Offline / Failed, OwnerNode = nœud qui l'héberge.
ps ¦ Move-ClusterVirtualMachineRole -Name {{VM}} -Node {{NODE2}} -MigrationType Live ¦ Migration dynamique (à chaud) d'une VM vers l'autre nœud. ¦ -MigrationType Quick = mise en veille puis reprise. Console : clic droit sur le rôle > Déplacer > Migration dynamique. ¦ La VM reste accessible pendant le déplacement (ping -t pour le montrer au jury).
ps ¦ Move-ClusterGroup -Name "{{VM}}" -Node {{NODE2}} ¦ Déplacer n'importe quel rôle vers un autre nœud. ¦ ¦
ps ¦ Add-ClusterVirtualMachineRole -VMName {{VM}} ¦ Rendre une VM hautement disponible (l'ajouter au cluster). ¦ Le VHDX et la configuration doivent être sur un CSV. Console : Rôles > Configurer un rôle > Ordinateur virtuel. ¦
ps ¦ Start-ClusterGroup -Name "{{VM}}" ¦ Démarrer un rôle. ¦ Stop-ClusterGroup pour l'arrêter. ¦
ps ¦ Get-ClusterSharedVolume ¦ Volumes partagés de cluster (CSV) : C:\ClusterStorage\VolumeX. ¦ Get-ClusterSharedVolumeState : accès direct ou redirigé par nœud. ¦ State Online. Accès « Redirigé » = problème de chemin iSCSI sur un nœud.
ps ¦ Get-ClusterAvailableDisk | Add-ClusterDisk ¦ Ajouter au cluster les disques iSCSI disponibles. ¦ Le disque doit être vu par tous les nœuds, en ligne et formaté. ¦
ps ¦ Add-ClusterSharedVolume -Name "Disque de cluster 1" ¦ Transformer un disque de cluster en CSV (accessible par tous les nœuds en même temps). ¦ Nom exact : Get-ClusterResource. Apparaît ensuite sous C:\ClusterStorage\Volume1. ¦
ps ¦ Get-ClusterQuorum ¦ Type de quorum (témoin). ¦ Set-ClusterQuorum -DiskWitness "Disque de cluster 2" · -FileShareWitness \\{{SRV}}\Temoin ¦ Avec 2 nœuds, un témoin est indispensable (sinon plus de majorité si un nœud tombe).
ps ¦ Get-ClusterNetwork ¦ Réseaux vus par le cluster et leur rôle. ¦ Role 3 = cluster + clients · 1 = cluster seulement (heartbeat) · 0 = aucun (iSCSI : à exclure du cluster). ¦
ps ¦ Get-ClusterResource ¦ Toutes les ressources (IP, nom, disques, VM) et leur état. ¦ Start-ClusterResource / Stop-ClusterResource -Name "…". ¦ Failed = regarder les événements.
ps ¦ Get-ClusterLog -Destination C:\Temp -TimeSpan 15 ¦ Générer le journal détaillé du cluster (15 dernières minutes). ¦ Un fichier par nœud. Aussi : Observateur d'événements > FailoverClustering/Operational. ¦
ps ¦ Get-WinEvent -LogName "Microsoft-Windows-FailoverClustering/Operational" -MaxEvents 20 ¦ Derniers événements du cluster. ¦ ¦ Basculements, pertes de nœud, disques en échec.

## ad | 👤 Active Directory | PowerShell sur le DC (module ActiveDirectory). Console : dsa.msc.
ps ¦ Get-ADUser {{USER}} -Properties * ¦ Toutes les infos d'un compte. ¦ Pour cibler : -Properties LockedOut,Enabled,PasswordExpired,PasswordLastSet,AccountExpirationDate,badPwdCount,LastLogonDate,MemberOf ¦ LockedOut, Enabled, PasswordExpired, AccountExpirationDate.
ps ¦ Get-ADUser -Filter "Name -like '*dupont*'" ¦ Chercher un utilisateur. ¦ -SearchBase "OU=Compta,{{DN}}" pour limiter à une OU. ¦
ps ¦ New-ADUser -Name "Jean Dupont" -GivenName Jean -Surname Dupont -SamAccountName {{USER}} -UserPrincipalName {{USER}}@{{FQDN}} -Path "OU=Utilisateurs,{{DN}}" -AccountPassword (Read-Host -AsSecureString "Mot de passe") -ChangePasswordAtLogon $true -Enabled $true ¦ Créer un utilisateur. ¦ L'OU doit exister. Le mot de passe est demandé à l'exécution. ¦
ps ¦ Unlock-ADAccount {{USER}} ¦ Déverrouiller un compte. ¦ Chercher l'origine avec l'événement 4740. ¦
ps ¦ Set-ADAccountPassword {{USER}} -Reset -NewPassword (Read-Host -AsSecureString "Nouveau mdp") ¦ Réinitialiser un mot de passe. ¦ Vérifier l'identité avant ! Puis Set-ADUser {{USER}} -ChangePasswordAtLogon $true ¦
ps ¦ Enable-ADAccount {{USER}} ¦ Réactiver un compte. ¦ Disable-ADAccount pour désactiver (départ). ¦
ps ¦ Search-ADAccount -LockedOut -UsersOnly | Select-Object Name,SamAccountName ¦ Tous les comptes verrouillés. ¦ -AccountDisabled · -PasswordExpired · -AccountExpired · -AccountInactive -TimeSpan 90.00:00:00 ¦
ps ¦ Get-ADUser {{USER}} | Move-ADObject -TargetPath "OU=Compta,{{DN}}" ¦ Déplacer un utilisateur dans une OU. ¦ Get-ADComputer PC01 | Move-ADObject … pour un ordinateur. ¦
ps ¦ New-ADOrganizationalUnit -Name "Compta" -Path "{{DN}}" ¦ Créer une OU. ¦ Protégée contre la suppression par défaut. ¦
ps ¦ New-ADGroup -Name "GG_{{SHARE}}" -GroupScope Global -GroupCategory Security -Path "OU=Groupes,{{DN}}" ¦ Créer un groupe global. ¦ -GroupScope DomainLocal pour un DL_ (AGDLP). ¦
ps ¦ Add-ADGroupMember GG_{{SHARE}} -Members {{USER}} ¦ Ajouter au groupe. ¦ L'utilisateur doit rouvrir sa session. Remove-ADGroupMember … -Confirm:$false pour retirer. ¦
ps ¦ Get-ADPrincipalGroupMembership {{USER}} | Select-Object Name ¦ Groupes d'un utilisateur. ¦ Get-ADGroupMember GG_{{SHARE}} pour les membres d'un groupe. ¦
ps ¦ Get-WinEvent -FilterHashtable @{LogName='Security';Id=4740} -MaxEvents 5 | Format-List TimeCreated,Message ¦ Origine des verrouillages de compte. ¦ Sur le DC (émulateur PDC). 4625 = échecs de connexion. ¦ « Nom de l'ordinateur appelant ».
ps ¦ Get-ADComputer -Filter * | Select-Object Name,Enabled ¦ Ordinateurs du domaine. ¦ ¦
ps ¦ Get-ADDefaultDomainPasswordPolicy ¦ Politique de mot de passe du domaine. ¦ ¦
cmd ¦ net user {{USER}} /domain ¦ Fiche du compte depuis n'importe quel poste. ¦ ¦ « Compte : actif Non », expiration, groupes.
cmd ¦ dcdiag /q ¦ Test du contrôleur de domaine (erreurs seulement). ¦ /test:dns pour le DNS. repadmin /replsummary pour la réplication. ¦ Aucune sortie = OK.
cmd ¦ netdom query fsmo ¦ Qui détient les rôles FSMO. ¦ ¦
ps ¦ Get-Service NTDS,DNS,Netlogon,KDC,W32Time | Select-Object Name,Status ¦ Services vitaux du DC. ¦ ¦ Tous Running.

## dom | 🔑 Poste, session, domaine | Sur le client : « impossible d'ouvrir la session », « relation d'approbation », joindre le domaine.
ps ¦ Add-Computer -DomainName {{FQDN}} -Credential {{NB}}\administrateur -Restart ¦ Joindre le poste au domaine. ¦ Le DNS du poste doit être le DC ! -OUPath "OU=Postes,{{DN}}" pour choisir l'OU. ¦
ps ¦ Rename-Computer -NewName PC-CLIENT01 -Restart ¦ Renommer le poste (avant de le joindre si VM clonée). ¦ ¦
ps ¦ Test-ComputerSecureChannel -Repair -Credential {{NB}}\administrateur ¦ Réparer « la relation d'approbation a échoué ». ¦ Depuis une session admin locale. Sans -Repair : juste tester. ¦ True = OK.
cmd ¦ whoami /groups ¦ Groupes dans le jeton de la session. ¦ whoami /upn · whoami /user (SID). ¦ Groupe absent = rouvrir la session.
cmd ¦ echo %logonserver% ¦ DC qui a authentifié la session. ¦ ¦ \\NOMDUPC = session en cache, DC non joint.
cmd ¦ nltest /dsgetdc:{{FQDN}} ¦ Trouver un DC joignable. ¦ nltest /sc_verify:{{FQDN}} : vérifier le canal sécurisé. ¦ Erreur = DNS ou réseau vers le DC.
cmd ¦ klist purge ¦ Vider les tickets Kerberos. ¦ klist seul : les voir. ¦
cmd ¦ w32tm /resync ¦ Resynchroniser l'heure. ¦ w32tm /query /status : source et décalage. ¦ Plus de 5 min d'écart = Kerberos refuse.
cmd ¦ gpupdate /force ¦ Réappliquer les GPO. ¦ /boot pour redémarrer si nécessaire. ¦ « Déconnexion requise » = certaines GPO à la prochaine session.
cmd ¦ gpresult /r /scope user ¦ GPO appliquées / refusées pour l'utilisateur. ¦ /scope computer (en admin) · gpresult /h C:\rapport.html /f pour un rapport complet. ¦ Section « GPO filtrées / refusées ».
cmd ¦ cmdkey /list ¦ Identifiants enregistrés. ¦ cmdkey /delete:{{SRV}} pour supprimer. ¦ Ancien mot de passe = verrouillages répétés.

## gpo | 📜 GPO | Sur le DC (module GroupPolicy). Console : gpmc.msc.
ps ¦ New-GPO -Name "U_Lecteurs_{{SHARE}}" | New-GPLink -Target "OU=Compta,{{DN}}" ¦ Créer une GPO et la lier à une OU. ¦ Ensuite l'éditer dans gpmc.msc (clic droit > Modifier). ¦
ps ¦ Get-GPO -All | Select-Object DisplayName,GpoStatus ¦ Toutes les GPO. ¦ GpoStatus AllSettingsEnabled / UserSettingsDisabled… ¦
ps ¦ Get-GPInheritance -Target "OU=Compta,{{DN}}" ¦ GPO appliquées à une OU (et héritées). ¦ ¦ GpoInheritanceBlocked : True = blocage d'héritage.
ps ¦ Get-GPOReport -Name "U_Lecteurs_{{SHARE}}" -ReportType Html -Path C:\gpo.html ¦ Rapport des paramètres d'une GPO. ¦ ¦
ps ¦ Invoke-GPUpdate -Computer PC-CLIENT01 -Force ¦ Forcer les GPO sur un poste distant. ¦ ¦
ps ¦ Backup-GPO -All -Path C:\BackupGPO ¦ Sauvegarder les GPO. ¦ Restore-GPO -Name "…" -Path C:\BackupGPO ¦

## srv | 🖧 DNS et DHCP (serveur) | Sur le serveur Windows. Consoles : dnsmgmt.msc, dhcpmgmt.msc.
ps ¦ Get-DnsServerZone ¦ Zones DNS. ¦ ¦ Zone inverse absente = résolution inverse KO.
ps ¦ Add-DnsServerResourceRecordA -ZoneName {{FQDN}} -Name srv-web -IPv4Address {{NET}}.20 -CreatePtr ¦ Créer un enregistrement A (+ PTR). ¦ La zone inverse doit exister pour -CreatePtr. ¦
ps ¦ Add-DnsServerResourceRecordCName -ZoneName {{FQDN}} -Name intranet -HostNameAlias srv-web.{{FQDN}} ¦ Créer un alias. ¦ ¦
ps ¦ Add-DnsServerPrimaryZone -NetworkId "{{NET}}.0/24" -ReplicationScope Domain ¦ Créer la zone inverse. ¦ ¦
ps ¦ Get-DnsServerResourceRecord -ZoneName {{FQDN}} ¦ Enregistrements de la zone. ¦ -Name srv-web pour un seul. ¦
ps ¦ Add-DnsServerForwarder -IPAddress 1.1.1.1,8.8.8.8 ¦ Redirecteurs vers Internet. ¦ Get-DnsServerForwarder pour vérifier. ¦ Vide = le DC ne résout pas Internet.
ps ¦ Get-DhcpServerInDC ¦ Serveurs DHCP autorisés. ¦ Add-DhcpServerInDC -DnsName {{SRV}}.{{FQDN}} -IPAddress {{IPSRV}} pour autoriser. ¦ Absent = rien n'est distribué.
ps ¦ Add-DhcpServerv4Scope -Name "LAN" -StartRange {{NET}}.100 -EndRange {{NET}}.200 -SubnetMask 255.255.255.0 -State Active ¦ Créer une étendue. ¦ Puis les options avec Set-DhcpServerv4OptionValue. ¦
ps ¦ Set-DhcpServerv4OptionValue -ScopeId {{NET}}.0 -Router {{GW}} -DnsServer {{IPSRV}} -DnsDomain {{FQDN}} ¦ Options 003, 006, 015 de l'étendue. ¦ ¦
ps ¦ Get-DhcpServerv4ScopeStatistics ¦ Taux d'occupation des étendues. ¦ ¦ PercentageInUse 100 = étendue pleine.
ps ¦ Get-DhcpServerv4Lease -ScopeId {{NET}}.0 ¦ Baux attribués. ¦ ¦
ps ¦ Add-DhcpServerv4Reservation -ScopeId {{NET}}.0 -IPAddress {{NET}}.60 -ClientId "AA-BB-CC-DD-EE-FF" -Name "IMP-COMPTA" ¦ Réserver une IP pour une MAC. ¦ MAC avec des tirets. ¦

## smb | 📁 Partages et droits NTFS | « Accès refusé », « lecteur absent ». Console : fsmgmt.msc.
ps ¦ New-SmbShare -Name {{SHARE}} -Path D:\Partages\{{SHARE}} -FullAccess "Utilisateurs authentifiés" -FolderEnumerationMode AccessBased ¦ Créer un partage (droits fins en NTFS ensuite). ¦ Le dossier doit exister (New-Item -ItemType Directory). ABE = on ne voit que ce à quoi on a droit. ¦
ps ¦ Get-SmbShareAccess -Name {{SHARE}} ¦ Droits de partage. ¦ Grant-SmbShareAccess -Name {{SHARE}} -AccountName "…" -AccessRight Change -Force ¦ Le plus restrictif entre partage et NTFS s'applique.
cmd ¦ icacls D:\Partages\{{SHARE}} ¦ Voir les droits NTFS. ¦ (I) hérité · (OI)(CI) fichiers + sous-dossiers · F total · M modification · RX lecture. ¦
cmd ¦ icacls D:\Partages\{{SHARE}} /grant "{{NB}}\DL_{{SHARE}}_RW:(OI)(CI)M" ¦ Donner Modification à un groupe. ¦ /inheritance:d : couper l'héritage en copiant · /remove "Utilisateurs" : retirer. ¦
cmd ¦ net use Z: \\{{SRV}}\{{SHARE}} /persistent:yes ¦ Connecter un lecteur réseau à la main. ¦ net use : lister · net use Z: /delete : supprimer. ¦
cmd ¦ net view \\{{SRV}} ¦ Partages visibles sur un serveur. ¦ ¦ Erreur 53 = nom introuvable, 5 = accès refusé.
ps ¦ Get-SmbOpenFile | Select-Object ClientUserName,Path ¦ Fichiers ouverts sur le serveur. ¦ | Close-SmbOpenFile -Force pour libérer un fichier « verrouillé ». ¦
cmd ¦ vssadmin list shadows ¦ Clichés instantanés existants (Versions précédentes). ¦ vssadmin create shadow /for=D: (serveur). ¦

## sys | 💻 Système Windows | Performances, services, journaux, réparations.
cmd ¦ systeminfo ¦ OS, version, démarrage, domaine, RAM, correctifs. ¦ | findstr /i "domain démarrage" pour filtrer. ¦
ps ¦ Get-Service | Where-Object {$_.StartType -eq 'Automatic' -and $_.Status -ne 'Running'} ¦ Services automatiques arrêtés. ¦ ¦ La cause d'une panne est souvent dans cette liste.
ps ¦ Restart-Service Spooler -Force ¦ Redémarrer un service. ¦ Start-Service / Stop-Service · Set-Service -StartupType Automatic. ¦
cmd ¦ sc query spooler ¦ État d'un service en CMD. ¦ sc qc : configuration · sc config spooler start= auto (espace après =). ¦
ps ¦ Get-WinEvent -FilterHashtable @{LogName='System';Level=1,2} -MaxEvents 20 | Format-Table TimeCreated,Id,ProviderName,Message -Wrap ¦ Dernières erreurs du journal Système. ¦ LogName='Application' pour les applis. ¦ Source + ID à coller dans le ticket.
ps ¦ Get-PSDrive -PSProvider FileSystem ¦ Espace libre des disques. ¦ ¦ C: plein = lenteurs.
ps ¦ Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name,CPU,WorkingSet ¦ Processus les plus gourmands. ¦ Stop-Process -Id 1234 -Force pour le tuer. ¦
cmd ¦ tasklist /svc ¦ Processus et services hébergés. ¦ taskkill /PID 1234 /F pour tuer. ¦
cmd ¦ sfc /scannow ¦ Réparer les fichiers système (admin). ¦ Si échec : DISM /Online /Cleanup-Image /RestoreHealth puis relancer. ¦
ps ¦ Install-WindowsFeature DNS,DHCP -IncludeManagementTools ¦ Installer des rôles. ¦ Get-WindowsFeature | Where-Object Installed pour voir ce qui est installé. ¦
ps ¦ Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5 ¦ Dernières mises à jour. ¦ ¦
cmd ¦ shutdown /r /t 0 ¦ Redémarrer maintenant. ¦ /s : arrêter · /m \\PC01 : machine distante. ¦
ps ¦ Enter-PSSession -ComputerName {{NODE2}} ¦ Session PowerShell à distance. ¦ Exit-PSSession pour sortir. Invoke-Command -ComputerName A,B -ScriptBlock { … } pour plusieurs machines. ¦ Erreur = Enable-PSRemoting -Force sur la cible.

## prn | 🖨️ Impression | File bloquée, imprimante absente, pilote.
ps ¦ Get-Printer | Select-Object Name,DriverName,PortName,PrinterStatus ¦ Imprimantes installées et leur état. ¦ -ComputerName {{SRV}} pour celles du serveur d'impression. ¦
ps ¦ Get-PrintJob -PrinterName "IMP-COMPTA" ¦ Travaux en attente. ¦ | Remove-PrintJob pour les supprimer. ¦ Un travail en erreur bloque toute la file.
cmd ¦ net stop spooler && del /q /f C:\Windows\System32\spool\PRINTERS\* && net start spooler ¦ Purger une file d'impression bloquée. ¦ En admin. En PowerShell : Stop-Service Spooler -Force ; Remove-Item C:\Windows\System32\spool\PRINTERS\* -Force ; Start-Service Spooler ¦
ps ¦ Add-Printer -ConnectionName \\{{SRV}}\IMP-COMPTA ¦ Connecter une imprimante partagée. ¦ Ou GPO (préférences > Imprimantes). ¦
ps ¦ Test-NetConnection {{NET}}.60 -Port 9100 ¦ L'imprimante réseau répond-elle ? ¦ 9100 = impression RAW. Remplacer par l'IP de l'imprimante. ¦
ps ¦ Get-PrinterPort ¦ Ports (IP) des imprimantes. ¦ ¦ L'IP du port correspond-elle à l'imprimante ?

## lnet | 🐧 Linux : réseau | Debian / Ubuntu (équivalent Red Hat entre parenthèses). Préfixer par sudo si tu n'es pas root.
lin ¦ ip a ¦ Adresses IP des interfaces. ¦ ip a show ens18 pour une seule carte. ¦ state DOWN ou pas de ligne inet = pas d'IP.
lin ¦ ip r ¦ Table de routage. ¦ ip route add default via {{GW}} : ajouter la passerelle (temporaire). ¦ « default via » = passerelle.
lin ¦ ping -c 4 {{GW}} ¦ Tester la passerelle. ¦ -c : nombre de paquets (sinon infini, Ctrl+C). ¦
lin ¦ cat /etc/resolv.conf ¦ Serveurs DNS utilisés. ¦ ¦ nameserver = le bon DNS ?
lin ¦ nano /etc/network/interfaces ¦ Configurer une IP fixe (Debian). ¦ Bloc : auto ens18 / iface ens18 inet static / address {{LIN}}/24 / gateway {{GW}}. Puis systemctl restart networking. Ubuntu : /etc/netplan/*.yaml + netplan apply. Red Hat : nmtui. ¦
lin ¦ ss -tulpn ¦ Ports en écoute et processus. ¦ | grep :80 pour filtrer. ¦ Service absent = il ne tourne pas.
lin ¦ dig {{SRV}}.{{FQDN}} ¦ Résolution DNS détaillée (paquet dnsutils). ¦ dig @{{IPSRV}} nom : interroger un DNS précis. host nom : version courte. ¦ ANSWER SECTION vide = pas d'enregistrement.
lin ¦ nc -zv {{IPSRV}} 445 ¦ Tester un port distant. ¦ Paquet netcat-openbsd. ¦ succeeded / open.
lin ¦ curl -I http://localhost ¦ Le serveur web répond-il ? ¦ -k pour HTTPS auto-signé. ¦ 200 OK · 500 = erreur appli · refused = service arrêté.
lin ¦ hostnamectl set-hostname srv-linux ¦ Renommer la machine. ¦ Mettre aussi à jour /etc/hosts. ¦

## lsys | 🐧 Linux : services, journaux, disque | systemd : systemctl et journalctl.
lin ¦ systemctl status apache2 ¦ État d'un service (httpd sur Red Hat). ¦ q pour quitter. ¦ active (running) / failed + dernières lignes de log.
lin ¦ systemctl restart apache2 ¦ Redémarrer un service. ¦ start · stop · reload (relit la conf sans couper) · enable --now (démarrage auto + démarrer). ¦
lin ¦ systemctl --failed ¦ Services en échec. ¦ ¦
lin ¦ journalctl -u apache2 -n 50 --no-pager ¦ Logs d'un service. ¦ -f : suivre en direct · -p err -b : erreurs depuis le démarrage · --since "10 min ago". ¦
lin ¦ tail -f /var/log/syslog ¦ Suivre le journal système (/var/log/messages sur Red Hat). ¦ Ctrl+C pour arrêter. /var/log/auth.log (secure) : connexions. ¦
lin ¦ df -h ¦ Espace disque. ¦ ¦ 100 % sur / ou /var = services qui plantent.
lin ¦ du -sh /var/* | sort -h ¦ Qui prend la place ? ¦ ¦ /var/log trop gros = logs à purger.
lin ¦ free -h ¦ Mémoire et swap. ¦ ¦
lin ¦ top ¦ Processus et charge en temps réel. ¦ q : quitter · M : trier par mémoire · k : tuer. htop si installé. ¦
lin ¦ ps aux | grep apache ¦ Chercher un processus. ¦ kill PID · kill -9 PID (forcer). ¦
lin ¦ uptime ¦ Depuis quand la machine tourne + charge. ¦ ¦
lin ¦ reboot ¦ Redémarrer. ¦ shutdown -h now : arrêter. ¦

## lusr | 🐧 Linux : utilisateurs et droits | Comptes, groupes, permissions.
lin ¦ adduser {{USER}} ¦ Créer un utilisateur (interactif, Debian). ¦ Red Hat : useradd -m {{USER}} puis passwd {{USER}}. ¦
lin ¦ passwd {{USER}} ¦ Changer un mot de passe. ¦ passwd -l : verrouiller · -u : déverrouiller. ¦
lin ¦ usermod -aG sudo {{USER}} ¦ Ajouter à un groupe (sudo = admin). ¦ -a indispensable (sinon les autres groupes sont retirés). Red Hat : groupe wheel. ¦
lin ¦ id {{USER}} ¦ UID et groupes. ¦ groups {{USER}} · getent passwd {{USER}} (compte existe ?). ¦
lin ¦ chmod 750 /srv/partage ¦ Changer les permissions. ¦ r=4 w=2 x=1 : 7=rwx 5=r-x 0=--- (propriétaire/groupe/autres). -R récursif. chmod u+x script.sh ¦
lin ¦ chown {{USER}}:compta /srv/partage ¦ Changer propriétaire et groupe. ¦ -R pour un dossier entier. ¦
lin ¦ ls -l ¦ Lister avec les droits. ¦ -a fichiers cachés · -h tailles lisibles. ¦ drwxr-x--- = dossier, rwx propriétaire, r-x groupe.
lin ¦ faillock --user {{USER}} --reset ¦ Déverrouiller après trop d'échecs. ¦ Sans --reset : voir les échecs. ¦
lin ¦ chage -l {{USER}} ¦ Expiration du mot de passe. ¦ chage -d 0 {{USER}} : forcer le changement à la prochaine connexion. ¦
lin ¦ last -n 10 ¦ Dernières connexions. ¦ lastb : échecs (root). ¦

## lpkg | 🐧 Linux : paquets, pare-feu, fichiers | Installation, ufw / firewalld, édition de fichiers.
lin ¦ apt update && apt upgrade -y ¦ Mettre à jour le système (dnf upgrade sur Red Hat). ¦ ¦
lin ¦ apt install apache2 ¦ Installer un paquet (dnf install httpd). ¦ apt remove : désinstaller · apt search : chercher. ¦
lin ¦ ufw status ¦ État du pare-feu (firewall-cmd --list-all). ¦ ¦ inactive = pas de filtrage.
lin ¦ ufw allow 22/tcp ¦ Ouvrir un port (penser au SSH avant ufw enable !). ¦ Red Hat : firewall-cmd --add-service=http --permanent ; firewall-cmd --reload ¦
lin ¦ nano /etc/ssh/sshd_config ¦ Éditer un fichier. ¦ Ctrl+O enregistrer · Ctrl+X quitter · Ctrl+W chercher. vi : i insérer, Échap, :wq. ¦
lin ¦ cp fichier.conf fichier.conf.bak ¦ Sauvegarder un fichier avant de le modifier. ¦ Réflexe à annoncer au jury. ¦
lin ¦ grep -i "error" /var/log/syslog ¦ Chercher un mot dans un fichier. ¦ -r dans un dossier · -n numéros de ligne · -v inverser. ¦
lin ¦ find / -name "*.conf" 2>/dev/null ¦ Chercher un fichier. ¦ -mtime -1 : modifiés depuis 24 h · -size +100M. ¦
lin ¦ tar -czf /backup/etc-$(date +%F).tar.gz /etc ¦ Archiver un dossier (sauvegarde). ¦ tar -xzf archive.tar.gz -C /dest : extraire. ¦
lin ¦ scp fichier.txt user@{{LIN}}:/tmp/ ¦ Copier un fichier par SSH (depuis PowerShell aussi). ¦ -r pour un dossier. Sens inverse : scp user@{{LIN}}:/tmp/f.txt . ¦
lin ¦ crontab -e ¦ Planifier une tâche. ¦ Format : min heure jour mois jour-semaine commande. 0 2 * * * /opt/save.sh = chaque jour à 2 h. crontab -l : lister. ¦

## ps1 | 🤖 Scripts PowerShell utiles | À coller dans PowerShell ISE ou une console admin.
ps ¦ Import-Csv C:\users.csv -Delimiter ";" | ForEach-Object { New-ADUser -Name "$($_.Prenom) $($_.Nom)" -SamAccountName $_.Login -Path "OU=$($_.Service),{{DN}}" -AccountPassword (ConvertTo-SecureString "Bienvenue@2026!" -AsPlainText -Force) -ChangePasswordAtLogon $true -Enabled $true } ¦ Créer des utilisateurs en masse depuis un CSV. ¦ CSV : Prenom;Nom;Login;Service. Tester sur une ligne d'abord. ¦
ps ¦ Search-ADAccount -LockedOut -UsersOnly | Unlock-ADAccount -PassThru ¦ Déverrouiller tous les comptes verrouillés. ¦ ¦
ps ¦ Get-ADUser -Filter * -Properties LastLogonDate | Select-Object Name,LastLogonDate | Export-Csv C:\users.csv -NoTypeInformation -Delimiter ";" -Encoding UTF8 ¦ Exporter une liste en CSV (pièce jointe au ticket). ¦ Export-Csv marche après n'importe quel Select-Object. ¦
ps ¦ Set-ExecutionPolicy RemoteSigned -Scope CurrentUser ¦ Autoriser l'exécution des scripts .ps1. ¦ Get-ExecutionPolicy pour voir l'état. ¦
ps ¦ Get-Help Get-ADUser -Examples ¦ Aide et exemples d'une commande. ¦ Get-Command *DhcpServer* : trouver une commande. ¦

## gui | 🧰 Consoles (Win+R) | Taper le nom dans Win+R ou dans la recherche.
tool ¦ dsa.msc ¦ Utilisateurs et ordinateurs Active Directory. ¦ Affichage > Fonctionnalités avancées pour l'éditeur d'attributs. ¦
tool ¦ gpmc.msc ¦ Gestion des stratégies de groupe. ¦ ¦
tool ¦ dnsmgmt.msc ¦ DNS. ¦ ¦
tool ¦ dhcpmgmt.msc ¦ DHCP. ¦ Flèche rouge = serveur non autorisé ou étendue inactive. ¦
tool ¦ cluadmin.msc ¦ Gestionnaire du cluster de basculement. ¦ ¦
tool ¦ virtmgmt.msc ¦ Gestionnaire Hyper-V. ¦ ¦
tool ¦ compmgmt.msc ¦ Gestion de l'ordinateur (disques, utilisateurs locaux, partages, services). ¦ ¦
tool ¦ eventvwr.msc ¦ Observateur d'événements. ¦ Filtrer le journal actuel par ID (4740, 4625…). ¦
tool ¦ services.msc ¦ Services. ¦ ¦
tool ¦ ncpa.cpl ¦ Cartes réseau (IP, DNS). ¦ ¦
tool ¦ sysdm.cpl ¦ Nom du PC, domaine, bureau à distance. ¦ ¦
tool ¦ printmanagement.msc ¦ Gestion de l'impression. ¦ ¦
`;
