# 🌐 DNS CONFIGURATION GUIDE

## ⚠️ IMPORTANT - This must be completed BEFORE GitLab CE deployment

Since I cannot configure external DNS automatically, you need to manually configure these records with your DNS provider.

---

## 📋 DNS Records to Add

### **For GitLab CE (Critical)**

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | gitlab.hexastudio.net | 19.16.1.100 | Auto | GitLab Web Interface |
| A | registry.gitlab.hexastudio.net | 19.16.1.100 | Auto | Container Registry |
| A | pages.gitlab.hexastudio.net | 19.16.1.100 | Auto | GitLab Pages |

### **For Production Deployment (After GitLab)**

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | api.hexastudio.net | [YOUR_API_SERVER_IP] | Auto | API Server |
| A | app.hexastudio.net | [YOUR_APP_SERVER_IP] | Auto | Web Application |
| CNAME | www.hexastudio.net | hexastudio.net | Auto | Redirect www |
| MX | hexastudio.net | mail.hexastudio.net | Auto | Email Server |
| TXT | hexastudio.net | v=spf1 include:_spf.google.com ~all | Auto | SPF Record |

---

## 🔧 DNS Provider Instructions

### **For GoDaddy**

1. Log in to GoDaddy.com
2. Click "DNS Management" next to your domain
3. Scroll to "Records" section
4. Click "Add" to create each record
5. Fill in the details from the table above
6. Click "Save" for each record
7. Wait 15-30 minutes for propagation

**Video Guide:** https://www.godaddy.com/help/manage-dns-records-680

### **For Namecheap**

1. Log in to Namecheap.com
2. Go to Domain List → Manage → Advanced DNS
3. Scroll to "Host Records" section
4. Click "Add New Record"
5. Select type (A, CNAME, MX, TXT)
6. Enter details from the table
7. Click "Save All Changes"
8. Wait 15-30 minutes for propagation

**Video Guide:** https://www.namecheap.com/support/knowledgebase/article.aspx/317/2237/how-to-set-up-dns-records/

### **For Cloudflare**

1. Log in to Cloudflare.com
2. Select your domain
3. Go to "DNS" tab
4. Click "Add record"
5. Select type and fill details
6. Click "Save"
7. Wait 15-30 minutes for propagation (Cloudflare is fast!)

**Video Guide:** https://developers.cloudflare.com/dns/manage-dns-records/

### **For Custom DNS (Self-Hosted)**

Edit your zone file:

```
$TTL 3600
@       IN  SOA     ns1.hexastudio.net. admin.hexastudio.net. (
                    2026073001 ; Serial
                    3600       ; Refresh
                    1800       ; Retry
                    604800     ; Expire
                    86400 )    ; Minimum TTL

; A Records
@       IN  A       192.0.2.1
api     IN  A       192.0.2.2
app     IN  A       192.0.2.3
gitlab  IN  A       19.16.1.100
registry IN A      19.16.1.100
pages   IN  A       19.16.1.100

; CNAME Records
www     IN  CNAME   @

; MX Records
@       IN  MX  10  mail.hexastudio.net.

; TXT Records
@       IN  TXT     "v=spf1 include:_spf.google.com ~all"
```

---

## ✅ Verification Commands

### **Check DNS Resolution**

```bash
# Windows
nslookup gitlab.hexastudio.net
ping gitlab.hexastudio.net

# Linux/Mac
dig gitlab.hexastudio.net
nslookup -type=A gitlab.hexastudio.net
```

### **Expected Output**

```
Server:     8.8.8.8
Address:    8.8.8.8#53

Non-authoritative answer:
gitlab.hexastudio.net   canonical name = hexastudio.net.
Name:   hexastudio.net
Address: 19.16.1.100
```

### **Check Propagation**

Use these tools to verify DNS is fully propagated:

- **DNS Checker:** https://dnschecker.org
- **WhatsMyDNS:** https://www.whatsmydns.net
- **Pingdom DNS:** https://www.pingdom.com/dns-health/

**All locations should show:** `19.16.1.100`

---

## ⏱️ Timeline

| Step | Duration | Status |
|------|----------|--------|
| Configure DNS Records | 15-30 min | ⏳ Pending |
| DNS Propagation | 15-30 min | ⏳ Pending |
| Verify Propagation | 5 min | ⏳ Pending |

**Total Time:** 35-65 minutes

---

## 🚨 Troubleshooting

### **DNS Not Resolving?**

1. **Check spelling** - Ensure correct domain name
2. **Check record type** - Must be A record for IP addresses
3. **Check TTL** - Set to Auto or 300 for quick propagation
4. **Check DNS provider** - Some providers take longer
5. **Clear cache** - `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### **Still Not Working?**

- Try different DNS server: `8.8.8.8` (Google) or `1.1.1.1` (Cloudflare)
- Wait longer (up to 48 hours for some providers)
- Contact your DNS provider support

---

## 📞 Support

If you need help with DNS configuration:
- **HEXA Studio:** dev@hexastudio.net
- **DNS Provider:** Your hosting company's support
- **Documentation:** This guide + screenshots in DNS-CONFIGURATION-GUIDE.md

---

**Status:** ⏳ DNS CONFIGURATION REQUIRED BEFORE DEPLOYMENT
**Next Step:** Configure DNS records with your provider
