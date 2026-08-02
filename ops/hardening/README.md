# Ageless VPS hardening

These files mirror the security configuration deployed to the production VPS.

## File mapping

- `ssh/00-ageless-hardening.conf` -> `/etc/ssh/sshd_config.d/00-ageless-hardening.conf`
- `nginx/00-ageless-hardening.conf` -> `/etc/nginx/conf.d/00-ageless-hardening.conf`
- `nginx/security-headers.conf` -> `/etc/nginx/snippets/ageless-security-headers.conf`
- `nginx/ageless.conf` -> `/etc/nginx/sites-available/ageless`
- `fail2ban/ageless.local` -> `/etc/fail2ban/jail.d/ageless.local`
- `fail2ban/ageless-scanners.conf` -> `/etc/fail2ban/filter.d/ageless-scanners.conf`
- `sysctl/99-zz-ageless-hardening.conf` -> `/etc/sysctl.d/99-zz-ageless-hardening.conf`

Always validate before reload/restart:

```sh
sshd -t
nginx -t
fail2ban-client -t
sysctl --system
```

The firewall exposes only rate-limited SSH and the Nginx Full profile. The final
edge-hardening phase is to proxy the web records through Cloudflare, configure
trusted Cloudflare real-IP ranges, and then allow ports 80/443 only from those
ranges. Do not apply that firewall restriction before the Cloudflare zone is live.
