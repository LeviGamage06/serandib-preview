# Serandib — GitHub Pages website

Static HTML, CSS and JavaScript. No self-hosted backend, API keys, server sessions or database is required. Email enquiries use the external FormSubmit service.

## Publish

1. Commit and push this project to the `main` branch of your GitHub repository.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Run or wait for **Test and deploy static site to GitHub Pages** in Actions.
4. Open the URL shown by the successful deployment. A failed workflow is not a published update.
5. **Activate email delivery before inviting clients:** from the live website, submit a clearly labelled test enquiry using an email address you control. Complete FormSubmit’s verification if prompted. Check `serandib.enquiries@gmail.com` (including Spam) for the activation email and click its confirmation link.
6. Submit another test from the live site and verify the full enquiry actually arrives in the inbox. Confirm that replying to it addresses the email entered by the visitor. Do not consider delivery verified until this succeeds.

The workflow reads the Pages base URL automatically, including repository subpaths and configured custom domains. `scripts/build.py` creates `_site`, the only folder uploaded. It generates the sitemap, canonical and social-image URLs and fixes nested 404 links. Do not publish the source folder using a separate branch-based Jekyll workflow.

## Local preview and checks

```sh
node --test tests/*.test.cjs
python3 scripts/check.py
python3 scripts/build.py --base-url http://localhost:8000/
python3 scripts/check.py _site
python3 -m http.server 8000 --directory _site
```

Open http://localhost:8000/. JavaScript is required for planning tools and attaching shared shortlist details. The basic email form works without JavaScript; the build generates its absolute return URL. Direct contact links remain available.

## What works without a server

- Venue filtering, price estimates, and comparison of up to three packages or quote-only venues.
- Saved shortlists (up to 30) in this browser. Share links embed the selected IDs and search settings, so recipients do not need the original browser or an account. These links are public to anyone who has them and cannot be revoked. No contact details are encoded.
- Budget and checklist saving in the current browser, resetting, and printing. Clearing site data removes saved plans. Blocked storage displays a fallback message.
- **Send enquiry** posts the form by HTTPS to `https://formsubmit.co/serandib.enquiries@gmail.com`. FormSubmit processes it and emails the configured recipient after activation. Its default spam verification remains enabled. Successful submissions return to `thank-you.html`. The optional WhatsApp/email draft buttons remain available as alternatives; those drafts still require the visitor to send in their app.
- Venue, portfolio and content updates are made in repository files and published with the next deployment. `admin.html` explains this workflow; it is not an authentication system.

## Maintain content

Edit `venue-data.js` only with checked source information. Preserve stable venue/package IDs so shared links continue to resolve. Keep real `checkedAt`, validity dates, source URLs and unknown-price flags accurate. Source records older than 90 days require a quotation; do not advance dates without checking sources. New years appear automatically in the finder; they do not imply that any package price is valid for that year.

Update the public phone/email consistently in HTML and JavaScript when business contact details change. Do not commit client messages, private notes, passwords or tokens. Real venue availability, hotel pricing, rights to photographs, business statements and contact delivery must be confirmed by the owner before launch.

## Final live smoke check

After a successful deployment, open the site on mobile and desktop. Filter venues, save/share a shortlist and open its complete link in a different browser, send a labelled test enquiry and confirm its arrival in the recipient inbox, reload a saved budget, and check an unknown nested URL returns the styled 404 with working navigation. Automatic delivery depends on activation, FormSubmit availability and mail filtering. Alternative email draft handling depends on the visitor having an email app configured. Old API-backed shortlist links cannot be recovered by this static version.

## Interface and motion

The Forever Edition interface is styled in `elegance.css`: a forest-green photographic hero, champagne accents, an editorial photo spread, staggered service imagery and coordinated planning pages. The shared `elegance.js` controller adds title entrances, scroll reveals, a decorative ribbon, subtle desktop photo parallax, a breathing portrait frame, a rotating floral ornament, a reading-progress line and animated setting changes. There are no animation libraries or new remote JavaScript dependencies. `portfolio.js` retains the keyboard-accessible photo dialog.

Use **Pause motion** in the hero or footer to disable decorative motion across pages. The preference stays on this browser, and the device’s reduced-motion preference always takes priority. Content remains readable without JavaScript. All paths remain relative for GitHub Pages project URLs.

## Email delivery details

The form requests names and a valid email address, with an optional phone number. The visitor email field is named `email`, which FormSubmit uses for Reply-To. Wedding preferences, consent and any loaded shortlist names/link are included in the notification. No email credentials are embedded in the site. Do not add SMTP passwords or private keys to GitHub Pages.

The form’s default CAPTCHA and `_honey` field are retained. A first-time activation request is not proof of inbox delivery. We have not accessed the owner’s inbox, clicked its activation link or verified receipt. The owner must complete the live activation and receipt check above. If the recipient address or site domain changes, check activation again.

The privacy page discloses FormSubmit processing and the provider’s documented 30-day submission retention. Incoming emails are also held in your mailbox. No client message is stored in browser local storage.

Official setup references: https://formsubmit.co/documentation and https://formsubmit.co/help
