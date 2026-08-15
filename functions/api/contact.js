const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const clean = (value, max = 2000) =>
  String(value ?? "").replace(/\0/g, "").trim().slice(0, max);

const escapeHtml = (value) =>
  clean(value, 10000)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      body = await context.request.json();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      body = Object.fromEntries((await context.request.formData()).entries());
    } else {
      return json({ ok: false, error: "Unsupported request." }, 415);
    }

    const name = clean(body.name, 140);
    const email = clean(body.email, 254);
    const service = clean(body.service, 120);
    const message = clean(body.message, 5000);
    const website = clean(body.website, 200);

    // Honeypot: silently accept bot submissions without sending mail.
    if (website) {
      return json({ ok: true });
    }

    if (!name || !email || !service || !message) {
      return json({ ok: false, error: "Please complete all required fields." }, 400);
    }

    if (!isEmail(email)) {
      return json({ ok: false, error: "Please enter a valid email address." }, 400);
    }

    const apiKey = context.env.RESEND_API_KEY;
    if (!apiKey) {
      return json({ ok: false, error: "Contact service is not configured yet." }, 503);
    }

    const to = context.env.CONTACT_TO || "contact@pulselore.studio";
    const from =
      context.env.CONTACT_FROM ||
      "PulseLore Studio Website <contact@pulselore.studio>";

    const subject = `PulseLore Studio Inquiry — ${service}`;
    const text = [
      "New PulseLore Studio website request",
      "",
      `Name / studio / project: ${name}`,
      `Email: ${email}`,
      `Service: ${service}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const emailPayload = {
      from,
      to: [to],
      reply_to: email,
      subject,
      text,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.55;color:#171719">
          <h2>New PulseLore Studio website request</h2>
          <p><strong>Name / studio / project:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Service:</strong> ${escapeHtml(service)}</p>
          <hr style="border:0;border-top:1px solid #ddd;margin:20px 0">
          <p><strong>Message</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
      `,
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      const providerText = await resendResponse.text();
      console.error("Resend contact error:", resendResponse.status, providerText);
      return json({ ok: false, error: "Email delivery service rejected the request." }, 502);
    }

    const result = await resendResponse.json();
    return json({ ok: true, id: result.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return json({ ok: false, error: "Unexpected contact form error." }, 500);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: "Method not allowed." }, 405);
}
