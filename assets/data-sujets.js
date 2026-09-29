// Sujets d'examen blanc écrit (questions ouvertes + corrigés + points clés)
const SUJETS = {
A: {
  titre: "Examen blanc A – PME « Atlantique Services »",
  contexte: `<p>Tu es technicien au service informatique d'<b>Atlantique Services</b>, PME de 60 salariés basée à Saintes. L'infrastructure comprend un domaine Active Directory <code>atlantique.local</code> sur Windows Server 2025, un serveur Linux Debian (GLPI, serveur web), un hyperviseur et un parc de postes Windows 11. Réponds à toutes les questions. Durée : 2 h.</p>`,
  questions: [
{t:"Réseau IP", p:6,
 q:`<p>Le réseau <code>192.168.20.0/24</code> doit être découpé en <b>4 sous-réseaux de même taille</b> : Administration, Comptabilité, Production, Serveurs.</p><p>Pour chacun, donne l'adresse réseau, la plage d'adresses utilisables et l'adresse de broadcast. Indique le masque (notation décimale et CIDR) et le nombre d'hôtes par sous-réseau.</p>`,
 c:`<p>4 sous-réseaux = 2 bits empruntés (2² = 4) → <b>/26</b>, masque <b>255.255.255.192</b>, blocs de 64 adresses, <b>62 hôtes</b> utilisables (2⁶ − 2).</p>
<div class="tw"><table><tr><th>Sous-réseau</th><th>Réseau</th><th>Plage</th><th>Broadcast</th></tr>
<tr><td>Administration</td><td>192.168.20.0</td><td>.1 → .62</td><td>192.168.20.63</td></tr>
<tr><td>Comptabilité</td><td>192.168.20.64</td><td>.65 → .126</td><td>192.168.20.127</td></tr>
<tr><td>Production</td><td>192.168.20.128</td><td>.129 → .190</td><td>192.168.20.191</td></tr>
<tr><td>Serveurs</td><td>192.168.20.192</td><td>.193 → .254</td><td>192.168.20.255</td></tr></table></div>`,
 k:["Masque /26 = 255.255.255.192","62 hôtes par sous-réseau (calcul expliqué)","Les 4 adresses réseau justes","Les 4 plages justes","Les 4 broadcasts justes"]},

{t:"Réseau IP", p:4,
 q:`<p>Un utilisateur signale qu'il n'a plus accès à rien. <code>ipconfig</code> affiche l'adresse <code>169.254.12.4</code>. Que signifie cette adresse ? Donne trois causes possibles classées par probabilité et ta démarche de résolution.</p>`,
 c:`<p><b>169.254.0.0/16 = APIPA</b> : adresse que Windows s'attribue seul quand <b>aucun serveur DHCP n'a répondu</b>.</p>
<p>Causes par probabilité : 1) problème physique ou de lien (câble, Wi-Fi, port de switch, VLAN, carte désactivée) ; 2) service DHCP arrêté, serveur non autorisé dans l'AD ou étendue désactivée ; 3) <b>étendue pleine</b> (plus d'adresses libres) ; 4) poste dans un autre sous-réseau sans relais DHCP.</p>
<p>Démarche : vérifier le lien (voyant, câble, <code>Get-NetAdapter</code>), <code>ipconfig /release</code> puis <code>/renew</code>, un voisin est-il touché aussi ? Sur le serveur : service DHCPServer, autorisation (<code>Get-DhcpServerInDC</code>), état et occupation de l'étendue. Tracer dans le ticket.</p>`,
 k:["APIPA = pas de réponse DHCP","Cause physique / lien citée en premier","Cause serveur DHCP (service, autorisation, étendue désactivée)","Étendue pleine ou relais DHCP","Démarche avec ipconfig /renew et vérifications côté serveur"]},

{t:"Réseau IP", p:4,
 q:`<p>Explique la différence entre un <b>switch</b> et un <b>routeur</b>. Qu'est-ce qu'un <b>VLAN</b> et un <b>lien trunk</b> ? Comment deux VLAN peuvent-ils communiquer entre eux ?</p>`,
 c:`<p><b>Switch</b> : couche 2, commute les trames d'un même réseau grâce aux adresses <b>MAC</b> (table CAM). <b>Routeur</b> : couche 3, fait passer les paquets <b>entre réseaux IP différents</b> grâce à sa table de routage.</p>
<p><b>VLAN</b> : réseau logique sur un switch physique, qui isole les domaines de diffusion (sécurité, performances, organisation par service). <b>Trunk (802.1Q)</b> : lien qui transporte plusieurs VLAN en ajoutant une étiquette (tag) avec le numéro de VLAN.</p>
<p>Communication inter-VLAN : il faut du <b>routage</b>, soit un routeur avec sous-interfaces sur un trunk (<i>router on a stick</i>), soit un <b>switch de niveau 3</b> (interfaces SVI), soit le pare-feu. On y applique des règles de filtrage (ACL).</p>`,
 k:["Switch couche 2 / adresses MAC","Routeur couche 3 / entre réseaux IP","VLAN = segmentation logique / domaine de diffusion","Trunk 802.1Q avec tag","Routage inter-VLAN (routeur sur trunk ou switch L3)"]},

{t:"Windows Server – DHCP", p:5,
 q:`<p>Décris le fonctionnement d'un bail DHCP (les 4 échanges). À quoi servent les options 003, 006 et 015 ? Quelle est la différence entre une <b>exclusion</b> et une <b>réservation</b> ? Pourquoi faut-il un <b>relais DHCP</b> dans certains cas ?</p>`,
 c:`<p><b>DORA</b> : <b>D</b>iscover (le client diffuse en broadcast), <b>O</b>ffer (le serveur propose une IP), <b>R</b>equest (le client demande celle-ci), <b>A</b>ck (le serveur confirme le bail). Renouvellement à 50 % de la durée du bail.</p>
<p>Options : <b>003</b> = routeur (passerelle), <b>006</b> = serveurs DNS, <b>015</b> = nom de domaine DNS.</p>
<p><b>Exclusion</b> : plage retirée de la distribution (IP fixes des serveurs, imprimantes). <b>Réservation</b> : une IP toujours attribuée à la même adresse MAC, tout en restant gérée par le DHCP.</p>
<p><b>Relais</b> : le Discover est un broadcast qui ne traverse pas les routeurs. Pour servir un autre sous-réseau ou VLAN, le routeur ou le switch L3 relaie la demande vers le serveur (ip helper-address).</p>`,
 k:["DORA dans l'ordre","003 passerelle / 006 DNS / 015 domaine","Exclusion = plage non distribuée","Réservation = IP liée à une MAC","Relais : broadcast non routé, autre sous-réseau"]},

{t:"Windows Server – DNS", p:5,
 q:`<p>Pourquoi le DNS est-il indispensable à Active Directory ? Donne le rôle des enregistrements A, PTR, CNAME, MX et SRV. Pourquoi les postes du domaine doivent-ils utiliser le contrôleur de domaine comme DNS plutôt que la box, et comment le DC résout-il les noms Internet ?</p>`,
 c:`<p>Les clients trouvent les contrôleurs de domaine (authentification, GPO) grâce aux <b>enregistrements SRV</b> publiés dans la zone AD (<code>_ldap._tcp.dc._msdcs.domaine</code>). Sans le DNS AD, pas de jonction au domaine ni d'ouverture de session domaine, et les GPO échouent.</p>
<p><b>A</b> : nom → IPv4 · <b>PTR</b> : IP → nom (zone inverse) · <b>CNAME</b> : alias vers un autre nom · <b>MX</b> : serveur de messagerie du domaine · <b>SRV</b> : localisation d'un service (LDAP, Kerberos…).</p>
<p>La box ne connaît pas la zone <code>atlantique.local</code> ni ses SRV. Le DC sort sur Internet par des <b>redirecteurs</b> (DNS du FAI ou publics) ou, à défaut, par les indications de racine.</p>`,
 k:["AD localise les DC via DNS (SRV)","A et PTR corrects","CNAME, MX, SRV corrects","La box ne connaît pas la zone AD","Redirecteurs (ou indications de racine) pour Internet"]},

{t:"Windows Server – AD", p:6,
 q:`<p>Le dossier partagé <code>Compta</code> doit être accessible en <b>modification</b> aux comptables et en <b>lecture seule</b> à la direction. Explique la méthode <b>AGDLP</b> et applique-la : nom et étendue des groupes, imbrications, droits de partage et droits NTFS.</p>`,
 c:`<p><b>AGDLP</b> : les <b>A</b>ccounts (comptes) vont dans des groupes <b>G</b>lobaux (par métier), eux-mêmes membres de groupes <b>D</b>omaine <b>L</b>ocal (par ressource et niveau d'accès), qui reçoivent les <b>P</b>ermissions.</p>
<ul><li>GG_Comptables ← comptes des comptables · GG_Direction ← comptes de la direction</li>
<li>DL_Compta_RW ← GG_Comptables · DL_Compta_RO ← GG_Direction</li>
<li>Partage : « Utilisateurs authentifiés » en contrôle total (ou modification)</li>
<li>NTFS : DL_Compta_RW = <b>Modification</b>, DL_Compta_RO = <b>Lecture et exécution</b>, héritage vers les sous-dossiers, groupes par défaut trop larges retirés</li></ul>
<p>Intérêt : un nouvel arrivant = un seul ajout au groupe métier ; les droits sont lisibles et faciles à auditer, et aucun utilisateur n'apparaît en direct dans les ACL.</p>`,
 k:["Définition AGDLP correcte","Groupes globaux par métier","Groupes domaine local par ressource / niveau","Droits de partage larges + restriction NTFS","Modification vs lecture bien attribuées","Intérêt de la méthode expliqué"]},

{t:"Windows Server – AD", p:4,
 q:`<p>Un utilisateur du domaine n'arrive plus à ouvrir sa session. Cite cinq causes possibles <b>classées par probabilité</b> et, pour chacune, la vérification ou la commande correspondante.</p>`,
 c:`<ol><li><b>Compte verrouillé</b> après trop d'erreurs → <code>Get-ADUser -Properties LockedOut</code>, <code>Unlock-ADAccount</code>, origine via l'événement 4740.</li>
<li><b>Mot de passe expiré ou oublié</b> → réinitialisation + changement obligatoire à la prochaine connexion.</li>
<li><b>Compte désactivé ou expiré</b> → propriétés du compte, <code>Enable-ADAccount</code>.</li>
<li><b>Restrictions</b> : horaires d'accès, « Se connecter à… », saisie (Verr. Maj, mauvais domaine).</li>
<li><b>Poste</b> : relation d'approbation cassée (<code>Test-ComputerSecureChannel -Repair</code>), heure décalée de plus de 5 min (Kerberos), DNS qui ne pointe pas vers le DC.</li></ol>`,
 k:["Compte verrouillé en premier + commande","Mot de passe expiré / reset","Compte désactivé ou expiré","Restrictions horaires / poste / saisie","Cause côté poste (approbation, heure, DNS)"]},

{t:"Windows Server – GPO", p:5,
 q:`<p>Une GPO qui mappe le lecteur <code>S:</code> a été liée à l'OU « Comptabilité », mais un comptable n'a pas le lecteur. Décris ta démarche de diagnostic. Rappelle l'ordre d'application des GPO et la différence entre configuration ordinateur et configuration utilisateur.</p>`,
 c:`<p>Ordre <b>LSDOU</b> : Local → Site → Domaine → OU (OU parente puis enfant) ; en cas de conflit, la dernière appliquée l'emporte. Exceptions : <i>Appliqué</i> (forcé), <i>Blocage de l'héritage</i>.</p>
<p>La <b>configuration utilisateur</b> s'applique si le <b>compte utilisateur</b> est dans l'OU liée, la <b>configuration ordinateur</b> si le <b>compte ordinateur</b> y est. Un mappage de lecteur est un paramètre utilisateur.</p>
<p>Démarche : 1) l'utilisateur est-il bien dans l'OU Comptabilité ? 2) <code>gpupdate /force</code> puis nouvelle session ; 3) <code>gpresult /r /scope user</code> : GPO appliquée ou refusée ? 4) filtrage de sécurité et ciblage (groupe manquant, session non relancée après l'ajout au groupe) ; 5) chemin UNC et droits sur le partage ; 6) journaux GroupPolicy, accès au SYSVOL, DNS vers le DC.</p>`,
 k:["LSDOU + dernière appliquée gagne","Config utilisateur vs ordinateur (selon l'objet dans l'OU)","Vérifier l'OU de l'utilisateur","gpupdate /force + gpresult /r","Filtrage de sécurité / groupe / droits / UNC"]},

{t:"Support utilisateurs", p:5,
 q:`<p>Définis <b>incident</b>, <b>demande de service</b> et <b>problème</b> selon ITIL. Comment détermine-t-on la <b>priorité</b> d'un ticket ? Qualifie ces deux situations : a) tout le service commercial ne peut plus imprimer une veille de salon ; b) un salarié demande l'installation d'un logiciel de retouche photo.</p>`,
 c:`<p><b>Incident</b> : interruption ou dégradation non planifiée d'un service, à rétablir au plus vite. <b>Demande de service</b> : besoin standard (compte, accès, installation, matériel). <b>Problème</b> : cause racine, inconnue, d'un ou plusieurs incidents (souvent récurrents).</p>
<p><b>Priorité = impact × urgence</b> : impact = nombre de personnes et criticité métier touchées ; urgence = délai acceptable avant que ça pose problème. La matrice (dans GLPI par exemple) donne la priorité, à laquelle correspondent les délais de prise en charge et de résolution (SLA).</p>
<p>a) <b>Incident</b>, impact moyen/haut (un service entier), urgence haute (échéance) → priorité <b>haute</b>. b) <b>Demande</b>, impact bas, urgence basse → priorité <b>basse</b>, sous réserve de validation (licence, accord du responsable).</p>`,
 k:["Incident défini","Demande défini","Problème = cause racine","Priorité = impact × urgence (+ SLA)","Deux qualifications cohérentes"]},

{t:"Support utilisateurs", p:4,
 q:`<p>Rédige le message de résolution envoyé à une utilisatrice dont le compte était verrouillé (tu l'as déverrouillé et as réinitialisé son mot de passe). Précise les règles de rédaction que tu respectes.</p>`,
 c:`<pre>Objet : [Ticket n°1234] Accès à votre session rétabli

Bonjour Madame Martin,

Votre compte avait été bloqué suite à plusieurs saisies
erronées du mot de passe. Je l'ai débloqué et un mot de passe
provisoire vous a été communiqué par téléphone ; il vous sera
demandé d'en choisir un nouveau à la connexion.

Pouvez-vous me confirmer que vous accédez bien à votre session ?
Sans retour de votre part, le ticket sera clôturé sous 48 h.

Cordialement,
Julien – Support informatique</pre>
<p>Règles : vouvoiement et politesse, numéro de ticket, cause expliquée <b>sans jargon</b>, action réalisée, <b>jamais de mot de passe en clair dans le même message</b>, demande de confirmation, délai de clôture.</p>`,
 k:["Politesse / formule d'appel et de fin","Référence du ticket","Cause et action sans jargon","Pas de mot de passe en clair dans le message","Demande de confirmation / clôture"]},

{t:"Linux", p:5,
 q:`<p>Sur le serveur Debian, donne la commande pour : a) afficher les adresses IP ; b) connaître l'état du service <code>apache2</code> puis le redémarrer ; c) consulter les 50 dernières lignes de journal de ce service ; d) créer l'utilisateur <code>tech1</code> et lui donner les droits d'administration ; e) vérifier l'espace disque.</p>`,
 c:`<pre>a) ip a
b) systemctl status apache2
   systemctl restart apache2
c) journalctl -u apache2 -n 50
d) adduser tech1
   usermod -aG sudo tech1
e) df -h</pre>
<p>Variantes acceptées : <code>ip addr</code>, <code>service apache2 status</code>, <code>tail -n 50 /var/log/apache2/error.log</code>, <code>useradd -m tech1 && passwd tech1</code>.</p>`,
 k:["ip a","systemctl status / restart","journalctl -u ou fichier de log","adduser + usermod -aG sudo","df -h"]},

{t:"Linux", p:3,
 q:`<p>Interprète les droits <code>-rwxr-x---</code> d'un fichier. Donne la commande qui applique les droits <code>rw-r-----</code> au fichier <code>rapport.txt</code>, puis celle qui en fait la propriété de l'utilisateur <code>tech1</code> et du groupe <code>compta</code>.</p>`,
 c:`<p><code>-rwxr-x---</code> : fichier ordinaire ; propriétaire = lecture, écriture, exécution (7) ; groupe = lecture, exécution (5) ; autres = aucun droit (0) → <b>750</b>.</p>
<pre>chmod 640 rapport.txt
chown tech1:compta rapport.txt</pre>`,
 k:["Lecture propriétaire/groupe/autres correcte (750)","chmod 640","chown tech1:compta"]},

{t:"Virtualisation", p:5,
 q:`<p>Différencie un hyperviseur de <b>type 1</b> et de <b>type 2</b>, avec deux exemples de chaque. Un instantané (snapshot) est-il une sauvegarde ? Explique les modes réseau <b>pont</b>, <b>NAT</b> et <b>réseau interne</b> d'une VM.</p>`,
 c:`<p><b>Type 1 (bare metal)</b> : installé directement sur le matériel, pour la production → Proxmox VE, VMware ESXi, Hyper-V, XCP-ng. <b>Type 2 (hébergé)</b> : logiciel qui tourne sur un OS, pour les tests et labos → VirtualBox, VMware Workstation.</p>
<p><b>Snapshot ≠ sauvegarde</b> : c'est un point de retour arrière stocké sur le même stockage que la VM. Si le disque meurt, il meurt avec elle. De plus, il dégrade les performances s'il est conservé longtemps. C'est utile avant une mise à jour, puis on le supprime.</p>
<p><b>Pont</b> : la VM est sur le réseau physique comme un vrai poste (IP du réseau réel). <b>NAT</b> : la VM sort via l'IP de l'hôte et n'est pas joignable depuis le réseau. <b>Réseau interne</b> : les VM communiquent uniquement entre elles, pour un labo isolé.</p>`,
 k:["Type 1 défini + exemples","Type 2 défini + exemples","Snapshot ≠ sauvegarde (même stockage)","Mode pont","NAT et réseau interne"]},

{t:"Scripts", p:5,
 q:`<p>Écris un script PowerShell qui exporte dans <code>C:\\Rapports\\desactives.csv</code> la liste des comptes utilisateurs <b>désactivés</b> du domaine (nom, identifiant, date de dernière connexion), puis affiche leur nombre. Commente chaque étape.</p>`,
 c:`<pre># Charger le module Active Directory
Import-Module ActiveDirectory

# Récupérer les comptes utilisateurs désactivés avec la date de dernière connexion
$comptes = Get-ADUser -Filter 'Enabled -eq $false' -Properties LastLogonDate |
           Select-Object Name, SamAccountName, LastLogonDate

# Exporter en CSV (séparateur ; pour Excel en français)
$comptes | Export-Csv C:\\Rapports\\desactives.csv -NoTypeInformation -Delimiter ";" -Encoding UTF8

# Afficher le nombre de comptes
Write-Host "Comptes désactivés : $($comptes.Count)"</pre>
<p>Variante acceptée : <code>Search-ADAccount -AccountDisabled -UsersOnly</code>. Planification possible avec le Planificateur de tâches.</p>`,
 k:["Get-ADUser filtré sur Enabled false (ou Search-ADAccount)","Propriété LastLogonDate demandée","Select-Object des bons champs","Export-Csv avec chemin","Comptage + commentaires"]},

{t:"Sécurité", p:5,
 q:`<p>Explique ce que sont une <b>DMZ</b>, le <b>NAT/PAT</b> et un <b>VPN</b> (différence entre VPN site à site et VPN nomade). Cite trois règles de base pour sécuriser l'accès Internet de l'entreprise.</p>`,
 c:`<p><b>DMZ</b> : zone réseau isolée, entre Internet et le LAN, qui héberge les serveurs exposés (web, messagerie). Si l'un d'eux est compromis, le LAN reste protégé par le pare-feu.</p>
<p><b>NAT</b> : traduction des adresses privées en adresse publique. <b>PAT</b> (NAT surchargé) : plusieurs postes partagent une IP publique grâce aux numéros de port. Redirection de port (DNAT) pour publier un service.</p>
<p><b>VPN</b> : tunnel chiffré à travers Internet. <b>Site à site</b> : relie deux réseaux en permanence (siège ↔ agence, IPsec). <b>Nomade</b> : un utilisateur se connecte au réseau de l'entreprise depuis l'extérieur (OpenVPN, WireGuard, SSL).</p>
<p>Règles : pare-feu en <b>refus par défaut</b> (n'ouvrir que le nécessaire), filtrage web / proxy, MFA sur les accès distants, mises à jour des équipements, journalisation, séparation des flux (VLAN, DMZ), moindre privilège.</p>`,
 k:["DMZ définie","NAT / PAT expliqués","VPN tunnel chiffré","Site à site vs nomade","Trois règles de sécurité pertinentes"]},

{t:"Sauvegardes", p:5,
 q:`<p>Une sauvegarde <b>complète</b> est faite le dimanche soir et une sauvegarde <b>incrémentielle</b> chaque soir du lundi au vendredi. Le serveur tombe en panne jeudi à 10 h. Quelles sauvegardes faut-il restaurer, et quelles données sont perdues ? Même question si les sauvegardes quotidiennes étaient <b>différentielles</b>. Explique la règle 3-2-1 et les notions de RPO/RTO.</p>`,
 c:`<p><b>Incrémentielle</b> (depuis la dernière sauvegarde, quelle qu'elle soit) : restaurer la complète du dimanche <b>+ lundi + mardi + mercredi</b>, dans l'ordre.</p>
<p><b>Différentielle</b> (depuis la dernière complète) : complète du dimanche <b>+ différentielle du mercredi</b> seulement. Restauration plus rapide, mais sauvegardes plus volumineuses au fil de la semaine.</p>
<p>Dans les deux cas, les modifications faites <b>jeudi entre la sauvegarde de mercredi soir et 10 h</b> sont perdues.</p>
<p><b>3-2-1</b> : 3 copies des données, sur 2 supports différents, dont 1 hors site (voire hors ligne contre les rançongiciels). <b>RPO</b> : perte de données maximale acceptable (ici environ 1 jour). <b>RTO</b> : durée maximale acceptable pour rétablir le service.</p>`,
 k:["Incrémentielle : complète + lun + mar + mer","Différentielle : complète + mercredi","Données de jeudi matin perdues","Règle 3-2-1","RPO et RTO définis"]},

{t:"Déploiement", p:4,
 q:`<p>L'entreprise doit installer 30 postes Windows 11 identiques. Décris une méthode de déploiement industrialisée, du master à la mise en production, en citant les outils et le rôle de PXE.</p>`,
 c:`<ol><li>Préparer un <b>master</b> (OS, pilotes, mises à jour, logiciels communs) sur un poste ou une VM de référence.</li>
<li>Le <b>généraliser avec Sysprep</b> (supprime SID, nom et pilotes spécifiques), puis <b>capturer l'image</b>.</li>
<li>Déployer via un serveur : <b>WDS / MDT</b>, <b>FOG</b>, ou SCCM/Intune en environnement plus grand.</li>
<li>Les postes démarrent en <b>PXE</b> : la carte réseau obtient une IP et, par les options DHCP <b>66</b> (serveur de démarrage) et <b>67</b> (fichier de boot), charge l'environnement de déploiement.</li>
<li>Post-installation : jonction au domaine automatique, applications et paramètres par <b>GPO</b>, inventaire (agent GLPI), tests et recette.</li></ol>`,
 k:["Master préparé","Sysprep / généralisation + capture","Outil de déploiement cité (WDS/MDT, FOG…)","PXE + options DHCP 66/67","Post-install : domaine, GPO, inventaire"]},

{t:"Réseau IP", p:4,
 q:`<p>Qu'est-ce que le <b>RAID</b> ? Compare RAID 0, 1, 5 et 10 (nombre minimal de disques, tolérance de panne, usage). Le RAID remplace-t-il une sauvegarde ?</p>`,
 c:`<div class="tw"><table><tr><th>RAID</th><th>Disques min.</th><th>Tolérance</th><th>Usage</th></tr>
<tr><td>0 (agrégat)</td><td>2</td><td>Aucune</td><td>Performance pure</td></tr>
<tr><td>1 (miroir)</td><td>2</td><td>1 disque</td><td>Système, petits serveurs</td></tr>
<tr><td>5 (parité répartie)</td><td>3</td><td>1 disque</td><td>Serveurs de fichiers, bon compromis capacité</td></tr>
<tr><td>10 (miroirs agrégés)</td><td>4</td><td>1 disque par miroir</td><td>Bases de données, performance + sécurité</td></tr></table></div>
<p><b>Non</b> : le RAID protège d'une panne de disque (disponibilité), pas d'une suppression, d'un rançongiciel, d'un incendie ou d'une corruption, qui sont répliqués immédiatement.</p>`,
 k:["RAID 0 et 1 corrects","RAID 5 correct (3 disques, 1 panne)","RAID 10 correct","RAID ≠ sauvegarde, avec justification"]},

{t:"Réseau IP", p:6,
 q:`<p>Cite les 7 couches du modèle OSI avec un exemple d'équipement ou de protocole pour chacune. Associe ensuite chaque service à son port et à son protocole de transport : DNS, DHCP, HTTPS, SSH, RDP, SMB, LDAP, SMTP.</p>`,
 c:`<p>7 Application (HTTP, DNS) · 6 Présentation (chiffrement, encodage, TLS) · 5 Session · 4 Transport (TCP, UDP) · 3 Réseau (IP, routeur) · 2 Liaison (Ethernet, MAC, switch) · 1 Physique (câble, hub, signal).</p>
<div class="tw"><table><tr><th>Service</th><th>Port</th><th>Transport</th></tr>
<tr><td>DNS</td><td>53</td><td>UDP (et TCP)</td></tr><tr><td>DHCP</td><td>67 / 68</td><td>UDP</td></tr>
<tr><td>HTTPS</td><td>443</td><td>TCP</td></tr><tr><td>SSH</td><td>22</td><td>TCP</td></tr>
<tr><td>RDP</td><td>3389</td><td>TCP (et UDP)</td></tr><tr><td>SMB</td><td>445</td><td>TCP</td></tr>
<tr><td>LDAP</td><td>389 (636 en LDAPS)</td><td>TCP</td></tr><tr><td>SMTP</td><td>25 (587 en soumission)</td><td>TCP</td></tr></table></div>`,
 k:["7 couches dans l'ordre","Exemples corrects par couche","Ports DNS/DHCP/HTTPS/SSH justes","Ports RDP/SMB/LDAP/SMTP justes","TCP/UDP corrects"]},

{t:"Anglais technique", p:10,
 q:`<p>Lis la documentation suivante et réponds en français.</p>
<div class="doc"><h4>KB-2217 – Repeated account lockouts after a password change</h4>
<p><b>Symptoms</b><br>After changing their password, some users report that their account is locked out several times a day, even when they did not type a wrong password.</p>
<p><b>Cause</b><br>This issue usually occurs when the old password is still stored on another device or service. Common sources include mapped network drives with saved credentials, scheduled tasks running under the user account, mobile devices synchronizing mail, and disconnected Remote Desktop sessions. Each time one of these sources tries to authenticate with the old password, the bad password count increases until the lockout threshold is reached.</p>
<p><b>Resolution</b><br>1. On a domain controller, filter the Security log for event ID 4740 to identify the caller computer name.<br>2. On that computer, remove saved credentials using Credential Manager and update any scheduled task or service configured with the user account.<br>3. Ask the user to update the password on all mobile devices.<br>4. Unlock the account only after the source has been removed; otherwise, the account will be locked again within minutes.</p>
<p><b>Note</b><br>Increasing the lockout threshold is not recommended, as it weakens protection against password-guessing attacks.</p></div>
<ol><li>Résume le problème décrit en deux phrases.</li>
<li>Cite quatre sources possibles de l'ancien mot de passe.</li>
<li>Quelle information donne l'événement 4740 et où le trouve-t-on ?</li>
<li>Pourquoi ne faut-il pas déverrouiller le compte immédiatement ?</li>
<li>Traduis la note finale et explique pourquoi la solution évoquée est déconseillée.</li></ol>`,
 c:`<ol><li>Après un changement de mot de passe, des utilisateurs voient leur compte se verrouiller plusieurs fois par jour sans erreur de saisie. La cause : un appareil ou un service utilise encore l'ancien mot de passe et accumule les échecs jusqu'au seuil de verrouillage.</li>
<li>Lecteurs réseau avec identifiants enregistrés, tâches planifiées exécutées avec le compte, téléphones qui synchronisent la messagerie, sessions Bureau à distance déconnectées.</li>
<li>Il indique le <b>nom de l'ordinateur appelant</b>, à l'origine du verrouillage. On le trouve dans le <b>journal Sécurité d'un contrôleur de domaine</b>.</li>
<li>Tant que la source n'est pas corrigée, elle continue d'envoyer l'ancien mot de passe et le compte sera <b>reverrouillé en quelques minutes</b>.</li>
<li>« Augmenter le seuil de verrouillage n'est pas recommandé, car cela affaiblit la protection contre les attaques par devinette de mot de passe. » Un seuil plus haut laisse plus d'essais à un attaquant (force brute) et masque le vrai problème au lieu de le corriger.</li></ol>`,
 k:["Résumé fidèle","Quatre sources citées","4740 = ordinateur appelant, journal Sécurité du DC","Pourquoi attendre avant de déverrouiller","Traduction correcte de la note","Justification sécurité (force brute)"]}
  ]
},

B: {
  titre: "Examen blanc B – Groupe « Horizon Santé »",
  contexte: `<p>Tu rejoins l'équipe informatique d'<b>Horizon Santé</b>, groupe de trois cliniques (400 postes). Le siège héberge un domaine <code>horizon.lan</code>, un cluster d'hyperviseurs, des serveurs Linux (supervision, web) et un outil de gestion de parc GLPI. Réponds à toutes les questions. Durée : 2 h.</p>`,
  questions: [
{t:"Réseau IP", p:6,
 q:`<p>À partir du réseau <code>172.16.0.0/16</code>, propose un plan d'adressage <b>VLSM</b> optimisé pour ces besoins : Utilisateurs 500 hôtes, Wi-Fi invités 100 hôtes, Serveurs 20 hôtes, liaison entre deux routeurs 2 hôtes. Donne pour chacun le réseau/CIDR, la plage et le broadcast, en commençant par le plus grand.</p>`,
 c:`<div class="tw"><table><tr><th>Besoin</th><th>Taille retenue</th><th>Réseau</th><th>Plage</th><th>Broadcast</th></tr>
<tr><td>Utilisateurs (500)</td><td>/23 = 510 hôtes</td><td>172.16.0.0/23</td><td>172.16.0.1 → 172.16.1.254</td><td>172.16.1.255</td></tr>
<tr><td>Wi-Fi invités (100)</td><td>/25 = 126 hôtes</td><td>172.16.2.0/25</td><td>172.16.2.1 → 172.16.2.126</td><td>172.16.2.127</td></tr>
<tr><td>Serveurs (20)</td><td>/27 = 30 hôtes</td><td>172.16.2.128/27</td><td>.129 → .158</td><td>172.16.2.159</td></tr>
<tr><td>Liaison (2)</td><td>/30 = 2 hôtes</td><td>172.16.2.160/30</td><td>.161 → .162</td><td>172.16.2.163</td></tr></table></div>
<p>Méthode : pour chaque besoin, prendre la plus petite puissance de 2 telle que 2ⁿ − 2 ≥ besoin, et placer les réseaux du plus grand au plus petit pour éviter les chevauchements.</p>`,
 k:["Tailles justes (/23, /25, /27, /30)","Utilisateurs juste","Wi-Fi juste","Serveurs juste","Liaison juste","Méthode expliquée (2ⁿ−2, ordre décroissant)"]},

{t:"Réseau IP", p:4,
 q:`<p>Un poste a l'adresse <code>10.5.37.200/21</code>. Calcule le masque décimal, l'adresse réseau, l'adresse de broadcast, la plage utilisable et le nombre d'hôtes. Détaille ton calcul.</p>`,
 c:`<p>/21 → <b>255.255.248.0</b>. Le 3e octet est découpé en blocs de 256 − 248 = <b>8</b> : 0, 8, 16, 24, <b>32</b>, 40… 37 est dans le bloc 32–39.</p>
<p>Réseau <b>10.5.32.0</b> · Broadcast <b>10.5.39.255</b> · Plage <b>10.5.32.1 → 10.5.39.254</b> · Hôtes : 2¹¹ − 2 = <b>2046</b>.</p>`,
 k:["Masque 255.255.248.0","Réseau 10.5.32.0","Broadcast 10.5.39.255","Plage + 2046 hôtes avec calcul"]},

{t:"Réseau IP", p:5,
 q:`<p>Compare <b>TCP</b> et <b>UDP</b> (fonctionnement, avantages, exemples d'usage). Décris la « poignée de main » TCP.</p>`,
 c:`<p><b>TCP</b> : orienté connexion, fiable (accusés de réception, retransmission), données remises dans l'ordre, contrôle de flux. Plus lent. Usages : HTTP(S), SMB, SSH, RDP, SMTP.</p>
<p><b>UDP</b> : sans connexion, sans garantie de livraison ni d'ordre, léger et rapide. Usages : DNS, DHCP, VoIP (RTP), streaming, SNMP, NTP.</p>
<p>Poignée de main en 3 temps : <b>SYN</b> (client) → <b>SYN-ACK</b> (serveur) → <b>ACK</b> (client). Fermeture par FIN/ACK.</p>`,
 k:["TCP connexion + fiabilité","UDP sans connexion + rapidité","Exemples TCP justes","Exemples UDP justes","SYN / SYN-ACK / ACK"]},

{t:"Réseau IP", p:4,
 q:`<p>Un utilisateur dont le poste a déjà une configuration IP tape <code>https://www.exemple.fr</code> dans son navigateur. Décris les grandes étapes réseau jusqu'à l'affichage de la page.</p>`,
 c:`<ol><li><b>Résolution DNS</b> : cache local et fichier hosts, puis requête au DNS configuré (le DC), qui interroge ses redirecteurs ou fait la récursion racine → .fr → serveur faisant autorité pour exemple.fr.</li>
<li>La destination est hors du réseau local : le poste envoie à la <b>passerelle</b>, dont il obtient la MAC par <b>ARP</b>.</li>
<li>Le pare-feu ou routeur fait le <b>NAT</b> vers l'IP publique.</li>
<li><b>Connexion TCP</b> sur le port <b>443</b> (poignée de main en 3 temps).</li>
<li><b>Négociation TLS</b> : certificat vérifié, clés de session.</li>
<li>Requête <b>HTTP GET</b> chiffrée, réponse du serveur, affichage de la page.</li></ol>`,
 k:["Résolution DNS (cache, serveur, récursion)","Passerelle + ARP","TCP 443","TLS / certificat","Requête HTTP"]},

{t:"Windows Server – AD", p:5,
 q:`<p>Compare les protocoles d'authentification <b>Kerberos</b> et <b>NTLM</b>. Pourquoi une différence d'heure entre un poste et le DC peut-elle empêcher l'ouverture de session ? Un poste affiche « La relation d'approbation entre cette station de travail et le domaine principal a échoué » : que se passe-t-il et comment corriger ?</p>`,
 c:`<p><b>Kerberos</b> (par défaut dans AD) : le KDC du contrôleur de domaine délivre des tickets (TGT, puis tickets de service) ; authentification mutuelle, le mot de passe ne circule pas. Il exige un DNS correct (on s'adresse aux services par leur nom) et des horloges synchronisées. <b>NTLM</b> : ancien mécanisme défi/réponse, moins sûr, utilisé en secours (accès par IP, poste hors domaine).</p>
<p>Les tickets Kerberos sont horodatés contre le rejeu : au-delà de <b>5 minutes d'écart</b> (valeur par défaut), ils sont refusés. D'où l'importance de la hiérarchie NTP (le PDC synchronisé sur une source fiable, les postes sur les DC).</p>
<p>Relation d'approbation : le <b>mot de passe du compte ordinateur</b> ne correspond plus entre le poste et l'AD (restauration d'un vieil instantané, compte réinitialisé ou supprimé). Correction : session admin locale, puis <code>Test-ComputerSecureChannel -Repair -Credential DOMAINE\\admin</code>, ou retirer le poste du domaine et le rejoindre.</p>`,
 k:["Kerberos : tickets / KDC","NTLM : ancien, défi-réponse, secours","Tolérance de 5 min + horodatage","Cause relation d'approbation (mot de passe du compte ordinateur)","Correction (Test-ComputerSecureChannel ou re-jonction)"]},

{t:"Windows Server – AD", p:5,
 q:`<p>Le partage <code>\\\\SRV-FIC\\Qualite</code> a pour droits de partage « Tout le monde : Lecture ». Les droits NTFS donnent au groupe <code>DL_Qualite_RW</code> la « Modification ». Un membre de ce groupe peut-il créer un fichier : a) en passant par le réseau ? b) en session locale sur le serveur ? Explique la règle. Que se passe-t-il s'il est aussi membre d'un groupe ayant un <b>refus explicite</b> en écriture ?</p>`,
 c:`<p>Règle : via le réseau, les droits effectifs sont le <b>plus restrictif</b> entre droits de partage et droits NTFS. En local, seuls les droits NTFS comptent. Entre plusieurs groupes au même niveau, les autorisations s'additionnent, mais un <b>refus explicite l'emporte</b>.</p>
<p>a) Réseau : partage = lecture, NTFS = modification → <b>lecture seule</b>, il ne peut pas créer de fichier. Correction : droit de partage « Modification » ou « Contrôle total » pour les utilisateurs authentifiés, et gestion fine en NTFS.</p>
<p>b) Local : NTFS modification → <b>oui</b>.</p>
<p>Refus explicite en écriture : il <b>ne peut plus écrire</b>, ni en réseau ni en local, même avec l'autorisation du groupe DL (le refus explicite prime sur l'autorisation explicite du même niveau d'héritage).</p>`,
 k:["Règle du plus restrictif partage/NTFS","a) lecture seule par le réseau","b) écriture possible en local","Refus explicite prioritaire","Correction proposée"]},

{t:"Windows Server – AD", p:4,
 q:`<p>Où configure-t-on la stratégie de mot de passe et de verrouillage des comptes du domaine ? Comment appliquer une politique plus stricte aux seuls administrateurs ? Propose des valeurs raisonnables et justifie-les.</p>`,
 c:`<p>Dans une GPO liée <b>à la racine du domaine</b> (en pratique la Default Domain Policy) : Configuration ordinateur › Stratégies › Paramètres Windows › Paramètres de sécurité › Stratégies de comptes. Une GPO de ce type liée à une OU n'a pas d'effet sur les comptes du domaine.</p>
<p>Politique différente pour un groupe : <b>stratégie de mot de passe affinée (PSO / FGPP)</b>, créée dans le Centre d'administration Active Directory et appliquée à un groupe global (ex. Admins du domaine).</p>
<p>Valeurs indicatives : longueur de 12 caractères minimum (14 ou plus pour les admins), complexité ou phrases de passe, historique de 24, verrouillage après 5 à 10 échecs pendant 15 à 30 min. Il faut équilibrer sécurité (force brute) et support (trop de verrouillages), et ajouter le <b>MFA</b> pour les accès sensibles.</p>`,
 k:["GPO au niveau du domaine","Chemin Stratégies de comptes","PSO / FGPP pour un groupe","Valeurs cohérentes et justifiées"]},

{t:"Windows Server – fichiers", p:5,
 q:`<p>Sur le serveur de fichiers, à quoi servent : a) les <b>quotas FSRM</b> ; b) le <b>filtrage de fichiers</b> ; c) l'<b>énumération basée sur l'accès (ABE)</b> ; d) les <b>clichés instantanés</b> ? Donne un exemple d'usage pour chacun.</p>`,
 c:`<p>a) <b>Quotas FSRM</b> : limiter l'espace utilisé par dossier (quota strict qui bloque, ou souple qui alerte). Ex. : 5 Go par dossier personnel, alerte mail à 85 %.</p>
<p>b) <b>Filtrage de fichiers</b> : interdire certains types de fichiers. Ex. : bloquer .mp4 et .exe sur le partage commun, ou détecter des extensions de rançongiciel.</p>
<p>c) <b>ABE</b> : l'utilisateur ne voit que les dossiers auxquels il a accès. Ex. : dans « Services », un comptable ne voit pas le dossier RH.</p>
<p>d) <b>Clichés instantanés (VSS)</b> : copies ponctuelles du volume, restaurables par l'utilisateur via « Versions précédentes ». Ex. : fichier écrasé par erreur, restauré dans la version de midi. Ce n'est pas une sauvegarde : c'est le même disque.</p>`,
 k:["Quotas + exemple","Filtrage + exemple","ABE + exemple","Clichés instantanés + exemple","Clichés ≠ sauvegarde"]},

{t:"Supervision", p:5,
 q:`<p>Pourquoi superviser une infrastructure ? Explique le principe d'un outil comme Zabbix (ou Centreon, Nagios) : agents, SNMP, seuils, alertes. Quelle différence entre SNMP v2c et v3 ? Quels indicateurs surveillerais-tu sur un serveur de fichiers ?</p>`,
 c:`<p>But : <b>détecter avant l'utilisateur</b> (anticiper la saturation d'un disque, voir une panne), mesurer la disponibilité, garder un historique pour analyser et dimensionner.</p>
<p>Principe : le serveur de supervision collecte des métriques via des <b>agents</b> installés sur les hôtes (Windows, Linux), via <b>SNMP</b> pour les équipements réseau, NAS et imprimantes, ou via ping et HTTP. Il compare les valeurs à des <b>seuils</b> (déclencheurs) et envoie des <b>alertes</b> (mail, SMS, messagerie), le tout présenté dans des tableaux de bord et des graphiques.</p>
<p><b>SNMP v2c</b> : authentification par « communauté » transmise <b>en clair</b>. <b>v3</b> : authentification par utilisateur et <b>chiffrement</b>, donc à privilégier. Ports 161 (requêtes) et 162 (traps).</p>
<p>Indicateurs d'un serveur de fichiers : espace disque libre, CPU, RAM, état des services (LanmanServer), ping, santé des disques / RAID, résultat des sauvegardes, nombre de sessions.</p>`,
 k:["Intérêt : anticiper / historique","Agents + SNMP","Seuils et alertes","v2c en clair vs v3 chiffré","Indicateurs pertinents"]},

{t:"Support utilisateurs", p:4,
 q:`<p>Présente les principales fonctions de <b>GLPI</b>. Décris le cycle de vie d'un ticket, de sa création à sa clôture, et le rôle de l'agent GLPI.</p>`,
 c:`<p>Fonctions : <b>gestion de parc / inventaire</b> (ordinateurs, logiciels, licences, matériel réseau), <b>helpdesk</b> (tickets, SLA, files par groupe de techniciens), <b>base de connaissances</b>, gestion des problèmes et changements (ITIL), contrats, fournisseurs, statistiques et tableaux de bord.</p>
<p>Cycle : <b>Nouveau</b> → <b>En cours (attribué)</b> → éventuellement <b>En cours (planifié)</b> ou <b>En attente</b> (réponse de l'utilisateur, d'un fournisseur…) → <b>Résolu</b> (solution saisie) → <b>Clos</b> (après validation de l'utilisateur ou clôture automatique). Suivis, tâches et documents alimentent la chronologie.</p>
<p><b>Agent GLPI</b> : installé sur les postes (déploiement par GPO par exemple), il remonte automatiquement l'inventaire matériel et logiciel ; il sait aussi faire de la découverte et de l'inventaire réseau.</p>`,
 k:["Inventaire / gestion de parc","Helpdesk + base de connaissances","Cycle de vie avec statuts","Agent = inventaire automatique"]},

{t:"Linux", p:5,
 q:`<p>Le serveur Linux de supervision est accessible en SSH depuis le réseau. Propose cinq mesures pour sécuriser ce serveur et l'accès SSH, avec les fichiers ou commandes concernés.</p>`,
 c:`<ul><li>Interdire la connexion directe de root : <code>PermitRootLogin no</code> dans <code>/etc/ssh/sshd_config</code>, puis <code>systemctl restart ssh</code>.</li>
<li>Authentification par <b>clés</b> (<code>ssh-keygen</code>, <code>ssh-copy-id</code>) et <code>PasswordAuthentication no</code>.</li>
<li><b>Pare-feu</b> : <code>ufw default deny incoming</code>, <code>ufw allow from 10.0.10.0/24 to any port 22</code>, <code>ufw enable</code>.</li>
<li><b>fail2ban</b> contre la force brute (bannissement après N échecs).</li>
<li><b>Mises à jour</b> régulières : <code>apt update && apt upgrade</code>, voire unattended-upgrades.</li>
<li>Utilisateurs nominatifs + <code>sudo</code>, services inutiles désactivés, journaux surveillés (<code>/var/log/auth.log</code>), éventuellement changement du port 22.</li></ul>`,
 k:["Root login désactivé","Authentification par clés","Pare-feu restreint","fail2ban","Mises à jour / sudo / journaux"]},

{t:"Linux", p:4,
 q:`<p>À quoi servent les répertoires <code>/etc</code>, <code>/var/log</code>, <code>/home</code> et <code>/tmp</code> ? Que contiennent les fichiers <code>/etc/passwd</code>, <code>/etc/shadow</code>, <code>/etc/group</code>, <code>/etc/resolv.conf</code> et <code>/etc/fstab</code> ?</p>`,
 c:`<p><code>/etc</code> : fichiers de configuration du système et des services · <code>/var/log</code> : journaux · <code>/home</code> : dossiers personnels des utilisateurs · <code>/tmp</code> : fichiers temporaires (vidés au redémarrage).</p>
<p><code>/etc/passwd</code> : liste des comptes (identifiant, UID, GID, dossier personnel, shell) · <code>/etc/shadow</code> : mots de passe <b>hachés</b> et règles d'expiration (lisible par root seulement) · <code>/etc/group</code> : groupes et leurs membres · <code>/etc/resolv.conf</code> : serveurs DNS utilisés · <code>/etc/fstab</code> : systèmes de fichiers montés au démarrage.</p>`,
 k:["Rôle des 4 répertoires","passwd et shadow (haché, root)","group, resolv.conf, fstab"]},

{t:"Scripts", p:5,
 q:`<p>Écris un script bash qui : sauvegarde le dossier <code>/var/www</code> dans une archive compressée datée dans <code>/backup</code>, supprime les archives de plus de 7 jours et écrit une ligne dans un fichier journal. Indique comment l'exécuter tous les jours à 23 h.</p>`,
 c:`<pre>#!/bin/bash
# Sauvegarde quotidienne du site web
DATE=$(date +%F)                 # date du jour, ex. 2026-10-08
DEST=/backup
LOG=/var/log/sauvegarde_www.log

# Archive compressée datée
tar -czf "$DEST/www-$DATE.tar.gz" /var/www

# Journalisation du résultat
if [ $? -eq 0 ]; then
  echo "$(date '+%F %T') OK www-$DATE.tar.gz" >> "$LOG"
else
  echo "$(date '+%F %T') ECHEC sauvegarde" >> "$LOG"
fi

# Suppression des archives de plus de 7 jours
find "$DEST" -name "www-*.tar.gz" -mtime +7 -delete</pre>
<p>Rendre exécutable : <code>chmod +x /opt/scripts/sauvegarde_www.sh</code>. Planifier avec <code>crontab -e</code> :</p>
<pre>0 23 * * * /opt/scripts/sauvegarde_www.sh</pre>`,
 k:["Shebang + variables de date","tar -czf avec nom daté","Journalisation (test $? ou équivalent)","find -mtime +7 -delete","Ligne cron correcte + chmod +x"]},

{t:"Virtualisation", p:5,
 q:`<p>Le siège dispose d'un cluster de trois hyperviseurs. Explique les notions de <b>haute disponibilité (HA)</b>, <b>migration à chaud</b> et <b>stockage partagé</b>. Quelle différence entre un disque virtuel <b>dynamique (thin)</b> et <b>fixe (thick)</b> ?</p>`,
 c:`<p><b>Cluster</b> : plusieurs hyperviseurs gérés ensemble. <b>HA</b> : si un nœud tombe, ses VM sont <b>redémarrées automatiquement</b> sur un autre nœud (court arrêt). Le quorum évite que deux nœuds se croient seuls maîtres.</p>
<p><b>Migration à chaud</b> (live migration / vMotion) : déplacer une VM en fonctionnement d'un nœud à l'autre sans interruption. Utile pour la maintenance d'un hôte.</p>
<p><b>Stockage partagé</b> (SAN iSCSI/FC, NAS NFS/SMB, Ceph) : les disques des VM sont accessibles par tous les nœuds, prérequis de la HA et de la migration à chaud.</p>
<p><b>Thin</b> : le fichier grossit au fur et à mesure de l'usage (économise l'espace, risque de <b>surallocation</b> du stockage à surveiller). <b>Thick</b> : tout l'espace est réservé dès la création (performances régulières, pas de mauvaise surprise).</p>`,
 k:["HA = redémarrage auto sur un autre nœud","Migration à chaud sans coupure","Stockage partagé, prérequis","Thin vs thick + risque de surallocation"]},

{t:"Sécurité", p:5,
 q:`<p>Une secrétaire appelle : elle a cliqué sur un lien dans un mail « de la banque » et saisi ses identifiants de messagerie. Quelles actions mènes-tu, dans l'ordre ? Quelles mesures préventives proposes-tu ensuite ?</p>`,
 c:`<ol><li>Garder son calme, remercier l'utilisatrice d'avoir prévenu, ouvrir un ticket de <b>priorité haute</b> (incident de sécurité).</li>
<li><b>Isoler le poste</b> du réseau si une pièce jointe a été exécutée ou si le poste semble compromis.</li>
<li><b>Changer immédiatement le mot de passe</b> du compte et fermer les sessions ouvertes. Vérifier les règles de transfert ou de redirection ajoutées dans la boîte mail et les connexions suspectes.</li>
<li>Prévenir le responsable ou le <b>RSSI</b> et suivre la procédure interne (déclaration à la CNIL sous 72 h en cas de violation de données personnelles, très sensible dans une clinique).</li>
<li>Analyser : antivirus / EDR, journaux. Bloquer l'expéditeur et l'URL, prévenir les autres utilisateurs, supprimer le mail des autres boîtes.</li></ol>
<p>Prévention : <b>MFA</b>, sensibilisation et campagnes de faux hameçonnage, filtrage mail (SPF, DKIM, DMARC, antispam), moindre privilège, sauvegardes hors ligne.</p>`,
 k:["Ticket prioritaire / ne pas culpabiliser","Isoler le poste si nécessaire","Changer le mot de passe + vérifier la boîte","Informer RSSI / procédure (CNIL)","Mesures préventives (MFA, sensibilisation, filtrage)"]},

{t:"Maintenance", p:4,
 q:`<p>Comment organiser la gestion des mises à jour Windows sur 400 postes et 20 serveurs ? Présente le rôle de <b>WSUS</b> et une démarche de déploiement qui limite les risques.</p>`,
 c:`<p><b>WSUS</b> : serveur qui télécharge les mises à jour Microsoft une seule fois et les distribue en interne. L'administrateur <b>approuve</b> les mises à jour par groupe d'ordinateurs et suit la conformité. Les postes y sont rattachés par <b>GPO</b> (adresse du serveur, planning d'installation). Alternatives : Intune / Windows Update for Business, SCCM.</p>
<p>Démarche par anneaux : Patch Tuesday (2e mardi du mois) → groupe <b>pilote</b> (quelques postes et une VM de test) → validation au bout de quelques jours → déploiement général → serveurs en fenêtre de maintenance, après <b>sauvegarde / instantané</b>, avec un plan de retour arrière. Correctifs de sécurité critiques accélérés.</p>`,
 k:["WSUS : centralise, approuve, rapports","Rattachement par GPO","Groupe pilote / anneaux","Serveurs en maintenance avec sauvegarde et retour arrière"]},

{t:"Sécurité", p:4,
 q:`<p>Les médecins veulent accéder depuis chez eux à une application hébergée sur un serveur RDS du siège. Propose une solution sécurisée et justifie tes choix. Pourquoi ne faut-il pas ouvrir le port 3389 directement sur Internet ?</p>`,
 c:`<p>Solutions : un <b>VPN</b> (WireGuard, OpenVPN, IPsec) puis RDP en interne, ou une <b>passerelle Bureau à distance (RD Gateway)</b> qui encapsule RDP dans HTTPS (443). Dans les deux cas : <b>MFA</b>, comptes nominatifs, accès restreint aux seuls serveurs utiles, journalisation, postes à jour, NLA activé.</p>
<p>3389 exposé : il est scanné en permanence, donc exposé à la force brute et aux failles RDP. C'est une porte d'entrée classique des rançongiciels. On ne publie jamais RDP directement.</p>`,
 k:["VPN ou passerelle RD en HTTPS","MFA","Restrictions / journalisation","Risque 3389 exposé (force brute, rançongiciel)"]},

{t:"Sauvegardes", p:5,
 q:`<p>Définis le <b>PCA</b> et le <b>PRA</b>. Donne la définition du RPO et du RTO et un exemple chiffré pour le serveur du dossier patient. Quels moyens techniques permettent d'atteindre un RPO très faible ?</p>`,
 c:`<p><b>PCA</b> (plan de continuité d'activité) : maintenir le service <b>pendant</b> un sinistre, éventuellement en mode dégradé (redondance, cluster, site de secours actif). <b>PRA</b> (plan de reprise d'activité) : procédures pour <b>redémarrer</b> après un sinistre (restauration, site de repli), testées régulièrement.</p>
<p><b>RPO</b> : quantité maximale de données qu'on accepte de perdre, exprimée en temps. <b>RTO</b> : durée maximale d'interruption acceptable. Exemple pour le dossier patient : RPO de 15 min, RTO de 2 h.</p>
<p>Pour un RPO faible : <b>réplication</b> (synchrone ou asynchrone) vers un second site ou un second stockage, instantanés fréquents, sauvegarde continue des journaux de base de données, cluster en haute disponibilité. Et sauvegardes hors ligne contre les rançongiciels.</p>`,
 k:["PCA défini","PRA défini","RPO / RTO définis","Exemple chiffré cohérent","Moyens techniques (réplication, snapshots…)"]},

{t:"Anglais technique", p:10,
 q:`<p>Lis l'extrait de notes de version suivant et réponds en français.</p>
<div class="doc"><h4>StoreBox NAS – Firmware 6.0 Release Notes</h4>
<p><b>Important changes</b><br>SMB version 1 is now disabled by default. SMBv1 is a deprecated protocol that does not support encryption and is vulnerable to well-known attacks. Clients that only support SMBv1, such as some older scanners and legacy Windows systems, will no longer be able to access shared folders.</p>
<p>If you must keep a legacy device, you may temporarily re-enable SMBv1 in <i>Control Panel &gt; File Services &gt; Advanced</i>. This setting should only be used as a short-term workaround until the device is replaced.</p>
<p><b>Before upgrading</b><br>Back up your configuration and make sure no users are connected. The upgrade takes about 15 minutes and the NAS will restart twice. Do not power off the device during the process, as this may corrupt the system partition.</p>
<p><b>Known issue</b><br>After the upgrade, scheduled backup jobs to remote servers may fail if the destination uses a self-signed certificate. Re-import the certificate in <i>Security &gt; Certificates</i> to resolve the issue.</p></div>
<ol><li>Quel est le changement principal de cette version et pourquoi a-t-il été fait ?</li>
<li>Après la mise à jour, le vieux scanner de l'accueil ne dépose plus ses fichiers sur le NAS. Explique pourquoi et ce que tu proposes à court et à long terme.</li>
<li>Cite les précautions à prendre avant la mise à jour.</li>
<li>Quel problème connu est signalé et comment le résoudre ?</li>
<li>Traduis : « This setting should only be used as a short-term workaround until the device is replaced. »</li></ol>`,
 c:`<ol><li>Le protocole <b>SMB v1 est désactivé par défaut</b>. Il est obsolète, ne gère pas le chiffrement et reste vulnérable à des attaques connues (WannaCry par exemple).</li>
<li>Le scanner ne parle probablement que SMBv1, que le NAS refuse désormais. Court terme : réactiver <b>temporairement</b> SMBv1 (Panneau de configuration › Services de fichiers › Avancé), en le documentant comme risque dans le ticket, ou utiliser un autre mode d'envoi (scan vers mail ou FTP). Long terme : <b>mettre à jour le firmware du scanner</b> s'il gère SMBv2/v3, sinon le <b>remplacer</b>, puis désactiver SMBv1.</li>
<li>Sauvegarder la configuration, vérifier qu'aucun utilisateur n'est connecté, prévoir environ 15 min d'indisponibilité avec deux redémarrages, <b>ne pas couper l'alimentation</b> (risque de corruption de la partition système).</li>
<li>Les sauvegardes planifiées vers des serveurs distants peuvent échouer si la destination utilise un <b>certificat auto-signé</b>. Solution : réimporter le certificat dans Sécurité › Certificats.</li>
<li>« Ce paramètre ne doit être utilisé que comme solution de contournement à court terme, jusqu'au remplacement de l'appareil. »</li></ol>`,
 k:["SMBv1 désactivé + raisons","Explication scanner (SMBv1 uniquement)","Solution court terme + long terme","Précautions avant mise à jour","Problème connu + résolution","Traduction correcte"]},

{t:"Réseau IP", p:6,
 q:`<p>Présente les principales caractéristiques d'<b>IPv6</b> : taille et écriture d'une adresse, règles d'abréviation, principaux types d'adresses (avec leur préfixe), et ce qui remplace le broadcast et ARP. Abrège l'adresse <code>2001:0db8:0000:0000:0000:ff00:0042:8329</code>.</p>`,
 c:`<p>Adresse de <b>128 bits</b>, écrite en <b>8 groupes de 4 chiffres hexadécimaux</b> séparés par « : ».</p>
<p>Abréviation : on supprime les zéros en tête de chaque groupe, et on remplace <b>une seule</b> suite de groupes nuls par « :: ». → <b>2001:db8::ff00:42:8329</b></p>
<p>Types : <b>lien local</b> fe80::/10 (automatique, non routée) · <b>globale unicast</b> 2000::/3 (routable sur Internet) · <b>unique locale</b> fc00::/7 (équivalent des adresses privées) · <b>multicast</b> ff00::/8 · <b>boucle locale</b> ::1.</p>
<p><b>Plus de broadcast</b> : remplacé par le multicast. <b>ARP</b> est remplacé par <b>NDP</b> (Neighbor Discovery, ICMPv6). Configuration automatique par <b>SLAAC</b> ou DHCPv6.</p>`,
 k:["128 bits / 8 groupes hexadécimaux","Règles d'abréviation (:: une seule fois)","Abréviation juste","Types avec préfixes","Pas de broadcast / NDP remplace ARP / SLAAC"]}
  ]
}
};
