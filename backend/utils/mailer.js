/**
 * mailer.js — Nodemailer setup for IYO Immo
 * SMTP via Hostinger: smtp.hostinger.com:465 (SSL)
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.hostinger.com',
  port:   parseInt(process.env.SMTP_PORT || '465'),
  secure: true,           // SSL on port 465
  auth: {
    user: process.env.SMTP_USER || process.env.MAIL_FROM,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"IYO Immo" <${process.env.MAIL_FROM || 'contact@iyoimmobilier.com'}>`;
const ADMIN_EMAIL = process.env.MAIL_FROM || 'contact@iyoimmobilier.com';

/**
 * Send notification to admin + auto-reply to the person
 */
async function sendContactEmails({ name, email, phone, subject, message, type }) {
  const subjectLine = subject || type || 'Nouveau message';

  // ── 1. Notification to admin ────────────────────────────────────────────────
  const adminHtml = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f7f8fa;padding:32px 16px">
      <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
        <div style="background:#0A2540;padding:24px 32px">
          <h1 style="color:white;margin:0;font-size:22px;letter-spacing:-0.5px">
            IYO<span style="color:#D4A81B">immo</span>
          </h1>
          <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px">Nouveau message reçu</p>
        </div>
        <div style="padding:28px 32px">
          <h2 style="margin:0 0 20px;font-size:18px;color:#0A2540">📩 ${subjectLine}</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr style="border-bottom:1px solid #e8edf2">
              <td style="padding:10px 0;color:#64748B;width:130px">Nom</td>
              <td style="padding:10px 0;font-weight:600;color:#1a1a2e">${name}</td>
            </tr>
            ${email ? `<tr style="border-bottom:1px solid #e8edf2">
              <td style="padding:10px 0;color:#64748B">Email</td>
              <td style="padding:10px 0;font-weight:600"><a href="mailto:${email}" style="color:#0A2540">${email}</a></td>
            </tr>` : ''}
            ${phone ? `<tr style="border-bottom:1px solid #e8edf2">
              <td style="padding:10px 0;color:#64748B">Téléphone</td>
              <td style="padding:10px 0;font-weight:600"><a href="tel:${phone}" style="color:#0A2540">${phone}</a></td>
            </tr>` : ''}
            <tr>
              <td style="padding:10px 0;color:#64748B;vertical-align:top">Message</td>
              <td style="padding:10px 0;color:#1a1a2e;line-height:1.6">${(message||'').replace(/\n/g,'<br>')}</td>
            </tr>
          </table>
          <div style="margin-top:24px">
            <a href="https://iyoimmobilier.com/admin/leads"
               style="display:inline-block;background:#0A2540;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
              Voir dans le tableau de bord →
            </a>
          </div>
        </div>
        <div style="padding:16px 32px;background:#f7f8fa;font-size:11px;color:#94a3b8;border-top:1px solid #e8edf2">
          Ce message a été envoyé depuis le formulaire de contact de iyoimmobilier.com
        </div>
      </div>
    </div>`;

  // ── 2. Auto-reply to the sender ─────────────────────────────────────────────
  const autoReplyHtml = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f7f8fa;padding:32px 16px">
      <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
        <div style="background:#0A2540;padding:24px 32px">
          <h1 style="color:white;margin:0;font-size:22px;letter-spacing:-0.5px">
            IYO<span style="color:#D4A81B">immo</span>
          </h1>
          <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px">Votre premier partenaire immobilier à Bangui</p>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 16px;font-size:20px;color:#0A2540">Bonjour ${name} 👋</h2>
          <p style="color:#475569;line-height:1.7;margin-bottom:16px">
            Merci de nous avoir contactés ! Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais,
            généralement sous <strong style="color:#0A2540">24 à 48 heures</strong>.
          </p>
          <p style="color:#475569;line-height:1.7;margin-bottom:24px">
            En attendant, n'hésitez pas à parcourir nos propriétés disponibles ou à nous contacter directement via WhatsApp pour une réponse immédiate.
          </p>

          <div style="background:#f0f4f8;border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:13px;color:#64748B;font-weight:600">VOTRE MESSAGE</p>
            <p style="margin:0;color:#1a1a2e;font-size:14px;line-height:1.6;font-style:italic">"${(message||'').replace(/\n/g,'<br>')}"</p>
          </div>

          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <a href="https://iyoimmobilier.com/properties"
               style="display:inline-block;background:#0A2540;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:8px">
              🏠 Voir les propriétés
            </a>
            <a href="https://wa.me/23672637171"
               style="display:inline-block;background:#25D366;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:8px">
              💬 WhatsApp direct
            </a>
          </div>
        </div>
        <div style="padding:20px 32px;background:#f7f8fa;border-top:1px solid #e8edf2">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0A2540">IYO Immo</p>
          <p style="margin:0;font-size:12px;color:#94a3b8">Avenue Boganda, Bangui · +236 72 63 71 71 · contact@iyoimmobilier.com</p>
        </div>
      </div>
    </div>`;

  const results = await Promise.allSettled([
    // Admin notification
    transporter.sendMail({
      from:    FROM,
      to:      ADMIN_EMAIL,
      subject: `[IYO Immo] ${subjectLine} — ${name}`,
      html:    adminHtml,
    }),
    // Auto-reply (only if sender has an email)
    email ? transporter.sendMail({
      from:    FROM,
      to:      email,
      subject: `Nous avons bien reçu votre message — IYO Immo`,
      html:    autoReplyHtml,
    }) : Promise.resolve(),
  ]);

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length) {
    failed.forEach(f => console.error('⚠️  Mail error:', f.reason?.message));
  }
}

module.exports = { sendContactEmails };
