

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function requiredEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

function isValidEmail(email: string) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const origin = req.headers.origin || req.headers.referer;
  const isAllowed = !origin ||
    origin.includes('localhost') ||
    origin.includes('vercel.app') ||
    (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL));

  if (!isAllowed) {
    return json(res, 403, { ok: false, error: 'Forbidden' });
  }

  const raw = typeof req.body === 'string' ? req.body : null;
  const body = raw ? JSON.parse(raw) : req.body;

  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const message = String(body?.message ?? '').trim();

  if (!name || !email || !message) {
    return json(res, 400, { ok: false, error: 'Missing fields' });
  }

  if (!isValidEmail(email)) {
    return json(res, 400, { ok: false, error: 'Invalid email' });
  }

  if (message.length > 5000) {
    return json(res, 400, { ok: false, error: 'Message too long' });
  }

  const toEmail = requiredEnv('CONTACT_TO_EMAIL');
  const fromEmail = requiredEnv('CONTACT_FROM_EMAIL');
  const resendApiKey = requiredEnv('RESEND_API_KEY');

  if (!resendApiKey || !toEmail || !fromEmail) {

    return json(res, 501, {
      ok: false,
      error: 'Email provider not configured',
      fallback: 'mailto',
      to: toEmail,
    });
  }

  try {
    const subject = `Portfolio message from ${name}`;

    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n');

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Ali Oudah Portfolio <${fromEmail}>`,
        to: [toEmail],
        reply_to: email,
        subject,
        text,
      }),
    });

    const emailJson = await emailRes.json().catch(() => null);

    if (!emailRes.ok) {
      return json(res, 502, {
        ok: false,
        error: 'Email send failed',
      });
    }

    return json(res, 200, { ok: true, id: emailJson?.id ?? null });
  } catch {
    return json(res, 502, { ok: false, error: 'Email send failed' });
  }
}
