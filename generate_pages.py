import os
import re

DOMAIN = "https://taxiandfly.com"
PHONE = "+306974450008"

AREAS = [
    "Syntagma",
    "Kifisia",
    "Glyfada",
    "Piraeus",
    "Marousi",
    "Peristeri",
    "Kallithea",
    "Chalandri",
    "Voula",
    "Nea Smyrni",
    "Paleo Faliro",
    "Ilioupoli",
    "Zografou",
    "Agia Paraskevi",
    "Halandri",   # if you prefer Chalandri only, remove this
    "Egaleo",
    "Nikaia",
    "Keratsini",
    "Moschato",
    "Petralona",
]

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>Taxi from {AREA} to Athens Airport (ATH) | Taxi & Fly</title>
<meta name="description" content="Taxi transfer from {AREA} to Athens International Airport (ATH). Airport transfers by appointment only (minimum 4 hours in advance)." />
<link rel="canonical" href="{CANONICAL}" />

<style>
  body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;background:#fafafa;color:#111}}
  .container{{max-width:900px;margin:auto;padding:22px}}
  .card{{background:#fff;border:1px solid rgba(0,0,0,.10);border-radius:16px;padding:18px;box-shadow:0 12px 28px rgba(0,0,0,.06)}}
  h1{{margin:0 0 10px}}
  p,li{{line-height:1.55}}
  .btns{{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}}
  .btn{{display:inline-block;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:800}}
  .btn.call{{background:#ffd400;color:#111}}
  .btn.wa{{background:#25D366;color:#08150d}}
  .note{{margin-top:12px;color:#555;font-size:13px}}
  .links{{margin-top:14px;font-size:14px}}
</style>
</head>

<body>
  <div class="container">
    <div class="card">
      <h1>Taxi from {AREA} to Athens Airport (ATH)</h1>

      <p>
        Taxi & Fly provides scheduled taxi transfers from <strong>{AREA}</strong>
        to <strong>Athens International Airport (ATH)</strong>.
        All transfers are provided <strong>by appointment only</strong> and must be booked at least
        <strong>4 hours in advance</strong>.
      </p>

      <p>
        Pickup is available from homes, hotels, apartments and offices throughout {AREA}.
        Pricing is calculated based on driving distance and is highly competitive compared to other apps.
      </p>

      <h2>Service highlights</h2>
      <ul>
        <li><strong>Athens → Airport only</strong> (not airport → Athens)</li>
        <li><strong>Appointment only</strong> – minimum booking time: <strong>4 hours</strong> before pickup</li>
        <li>24/7 availability by appointment</li>
        <li>Quick confirmation via phone or WhatsApp</li>
      </ul>

      <div class="btns">
        <a class="btn call" href="tel:{PHONE}">📞 Call Now</a>
        <a class="btn wa" href="https://wa.me/{PHONE_NO_PLUS}" target="_blank" rel="noopener">💬 WhatsApp</a>
      </div>

      <div class="note">
        Tip: Send your pickup address + date/time (and optional flight number) for the fastest confirmation.
      </div>

      <div class="links">
        <a href="{DOMAIN}/">Back to main page</a>
      </div>
    </div>
  </div>
</body>
</html>
"""

def main():
    out_dir = "landing"
    os.makedirs(out_dir, exist_ok=True)

    phone_no_plus = PHONE.replace("+", "").replace(" ", "")
    for area in AREAS:
        slug = slugify(area)
        filename = f"athens-airport-taxi-{slug}.html"
        canonical = f"{DOMAIN}/athens-airport-taxi-{slug}"
        html = TEMPLATE.format(
            AREA=area,
            CANONICAL=canonical,
            DOMAIN=DOMAIN,
            PHONE=PHONE,
            PHONE_NO_PLUS=phone_no_plus,
        )
        with open(os.path.join(out_dir, filename), "w", encoding="utf-8") as f:
            f.write(html)

    print(f"✅ Created {len(AREAS)} pages in ./{out_dir}/")
    print("➡️ Upload these .html files to your site root (or move them where you want).")

if __name__ == "__main__":
    main()
