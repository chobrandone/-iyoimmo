/**
 * mailer.js — Nodemailer for IYO Immo
 * Hostinger SMTP: smtp.hostinger.com:465 (SSL)
 *
 * Two emails sent on every lead:
 *  1. Admin notification  → contact@iyoimmobilier.com
 *  2. Auto-reply          → person who submitted (if email provided)
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.hostinger.com',
  port:   parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'contact@iyoimmobilier.com',
    pass: process.env.SMTP_PASS,
  },
});

const FROM        = `"IYO Immo" <${process.env.MAIL_FROM || 'contact@iyoimmobilier.com'}>`;
const ADMIN_EMAIL =  process.env.MAIL_FROM || 'contact@iyoimmobilier.com';

// ── Shared header / footer snippets ──────────────────────────────────────────
const header = `
  <div style="background:#0A2540;padding:24px 32px;">
    <h1 style="color:white;margin:0;font-size:22px;letter-spacing:-0.5px">
      IYO<span style="color:#D4A81B">immo</span>
    </h1>
    <p style="color:rgba(255,255,255,.65);margin:4px 0 0;font-size:12px">
      Votre premier partenaire immobilier à Bangui
    </p>
  </div>`;

const footer = `
  <div style="padding:18px 32px;background:#f7f8fa;border-top:1px solid #e8edf2;">
    <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#0A2540">IYO Immo</p>
    <p style="margin:0;font-size:11px;color:#94a3b8">
      Avenue Boganda, Bangui &nbsp;·&nbsp; +236 72 63 71 71 &nbsp;·&nbsp; contact@iyoimmobilier.com
    </p>
  </div>`;

const wrap = (body) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f7f8fa;padding:32px 16px;">
    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
      ${header}
      ${body}
      ${footer}
    </div>
  </div>`;

const btn = (href, label, bg = '#0A2540') =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:white;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin:4px 6px 4px 0">${label}</a>`;

// ── Type labels ───────────────────────────────────────────────────────────────
const typeLabel = {
  contact:             'Message de contact',
  inquiry:             'Demande de renseignement',
  visit_request:       'Demande de visite',
  property_submission: 'Soumission de bien',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════════
function buildAdminEmail({ name, email, phone, subject, message, type, propertyTitle, propertyRef }) {
  const label = typeLabel[type] || subject || 'Nouveau message';
  const icon  = type === 'visit_request' ? '🏠' : type === 'property_submission' ? '📋' : '📩';

  const propertyRow = (propertyTitle || propertyRef) ? `
    <tr style="border-bottom:1px solid #e8edf2;">
      <td style="padding:10px 0;color:#64748B;width:130px;font-size:14px">Bien</td>
      <td style="padding:10px 0;font-weight:600;color:#1a1a2e;font-size:14px">
        ${propertyTitle || ''}${propertyRef ? ` <span style="color:#64748B;font-weight:400">(${propertyRef})</span>` : ''}
      </td>
    </tr>` : '';

  return wrap(`
    <div style="padding:28px 32px;">
      <div style="display:inline-block;background:#EFF6FF;color:#1D4ED8;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:16px;">
        ${icon} ${label}
      </div>
      <h2 style="margin:0 0 20px;font-size:18px;color:#0A2540;">Nouvelle demande de ${name}</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e8edf2;">
          <td style="padding:10px 0;color:#64748B;width:130px;font-size:14px">Nom</td>
          <td style="padding:10px 0;font-weight:600;color:#1a1a2e;font-size:14px">${name}</td>
        </tr>
        ${email ? `<tr style="border-bottom:1px solid #e8edf2;">
          <td style="padding:10px 0;color:#64748B;font-size:14px">Email</td>
          <td style="padding:10px 0;font-size:14px"><a href="mailto:${email}" style="color:#0A2540;font-weight:600">${email}</a></td>
        </tr>` : ''}
        ${phone ? `<tr style="border-bottom:1px solid #e8edf2;">
          <td style="padding:10px 0;color:#64748B;font-size:14px">Téléphone</td>
          <td style="padding:10px 0;font-size:14px"><a href="tel:${phone}" style="color:#0A2540;font-weight:600">${phone}</a></td>
        </tr>` : ''}
        ${propertyRow}
        ${message ? `<tr>
          <td style="padding:10px 0;color:#64748B;vertical-align:top;font-size:14px">Message</td>
          <td style="padding:10px 0;color:#1a1a2e;line-height:1.65;font-size:14px">${message.replace(/\n/g,'<br>')}</td>
        </tr>` : ''}
      </table>
      <div style="margin-top:24px;">
        ${btn('https://iyoimmobilier.com/admin/leads', '📋 Voir dans le tableau de bord →')}
        ${phone ? btn(`tel:${phone}`, `📞 Appeler ${name}`, '#166534') : ''}
        ${email ? btn(`mailto:${email}`, `✉️ Répondre`, '#1D4ED8') : ''}
      </div>
    </div>`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT / INQUIRY AUTO-REPLY
// ═══════════════════════════════════════════════════════════════════════════════
function buildContactReply({ name, message }) {
  return wrap(`
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;font-size:20px;color:#0A2540;">Bonjour ${name} 👋</h2>
      <p style="color:#475569;line-height:1.7;margin-bottom:16px;">
        Merci de nous avoir contactés ! Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais,
        généralement sous <strong style="color:#0A2540">24 à 48 heures ouvrées</strong>.
      </p>
      ${message ? `
      <div style="background:#f0f4f8;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:1px">Votre message</p>
        <p style="margin:0;color:#1a1a2e;font-size:14px;line-height:1.65;font-style:italic;">"${message.replace(/\n/g,'<br>')}"</p>
      </div>` : ''}
      <p style="color:#475569;line-height:1.7;margin-bottom:24px;">
        En attendant, n'hésitez pas à parcourir nos propriétés ou à nous joindre directement via WhatsApp pour une réponse immédiate.
      </p>
      <div>
        ${btn('https://iyoimmobilier.com/properties', '🏠 Voir les propriétés')}
        ${btn('https://wa.me/23672637171', '💬 WhatsApp direct', '#25D366')}
      </div>
    </div>`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISIT REQUEST / BOOKING CONFIRMATION AUTO-REPLY
// ═══════════════════════════════════════════════════════════════════════════════
function buildVisitReply({ name, propertyTitle, propertyRef, message }) {
  const propInfo = propertyTitle
    ? `<strong style="color:#0A2540">${propertyTitle}</strong>${propertyRef ? ` <span style="color:#64748B;font-size:13px">(${propertyRef})</span>` : ''}`
    : 'le bien que vous avez sélectionné';

  return wrap(`
    <div style="padding:32px;">
      <div style="background:#DCFCE7;border-left:4px solid #16A34A;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-weight:700;color:#166534;font-size:15px;">✅ Demande de visite reçue !</p>
      </div>
      <h2 style="margin:0 0 16px;font-size:20px;color:#0A2540;">Bonjour ${name},</h2>
      <p style="color:#475569;line-height:1.7;margin-bottom:16px;">
        Nous avons bien reçu votre demande de visite pour ${propInfo}.
        Notre équipe vous contactera très prochainement pour confirmer la date et l'heure qui vous conviennent.
      </p>
      <div style="background:#f0f4f8;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:1px">Récapitulatif</p>
        <table style="width:100%;font-size:14px;">
          <tr>
            <td style="color:#64748B;padding:4px 0;width:110px">Bien</td>
            <td style="font-weight:600;color:#0A2540">${propertyTitle || 'Non précisé'}${propertyRef ? ` — ${propertyRef}` : ''}</td>
          </tr>
          ${message ? `<tr>
            <td style="color:#64748B;padding:4px 0;vertical-align:top">Votre note</td>
            <td style="color:#1a1a2e">${message.replace(/\n/g,'<br>')}</td>
          </tr>` : ''}
        </table>
      </div>
      <p style="color:#475569;line-height:1.7;margin-bottom:24px;">
        Pour toute urgence, vous pouvez nous joindre directement via WhatsApp ou par téléphone.
      </p>
      <div>
        ${btn('https://wa.me/23672637171?text=' + encodeURIComponent(`Bonjour, j'ai fait une demande de visite pour ${propertyTitle || 'un bien'}.`), '💬 WhatsApp direct', '#25D366')}
        ${btn('tel:+23672637171', '📞 +236 72 63 71 71', '#0A2540')}
      </div>
    </div>`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY SUBMISSION AUTO-REPLY
// ═══════════════════════════════════════════════════════════════════════════════
function buildSubmissionReply({ name }) {
  return wrap(`
    <div style="padding:32px;">
      <div style="background:#FEF9C3;border-left:4px solid #CA8A04;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-weight:700;color:#92400E;font-size:15px;">📋 Soumission reçue — en cours d'examen</p>
      </div>
      <h2 style="margin:0 0 16px;font-size:20px;color:#0A2540;">Bonjour ${name},</h2>
      <p style="color:#475569;line-height:1.7;margin-bottom:16px;">
        Merci d'avoir soumis votre bien sur IYO Immo ! Notre équipe va examiner votre dossier et vous contactera
        sous <strong style="color:#0A2540">48 à 72 heures</strong> pour la suite des démarches.
      </p>
      <p style="color:#475569;line-height:1.7;margin-bottom:24px;">
        Si votre bien est accepté, il sera publié sur notre plateforme et présenté à nos nombreux clients à la recherche d'une propriété à Bangui.
      </p>
      <div>
        ${btn('https://wa.me/23672637171', '💬 Nous contacter sur WhatsApp', '#25D366')}
      </div>
    </div>`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
async function sendContactEmails({ name, email, phone, subject, message, type, propertyTitle, propertyRef }) {
  const subjectLine = typeLabel[type] || subject || 'Nouveau message';

  // Auto-reply content depends on type
  let replyHtml;
  if (type === 'visit_request') {
    replyHtml = buildVisitReply({ name, propertyTitle, propertyRef, message });
  } else if (type === 'property_submission') {
    replyHtml = buildSubmissionReply({ name });
  } else {
    replyHtml = buildContactReply({ name, message });
  }

  const adminHtml = buildAdminEmail({ name, email, phone, subject: subjectLine, message, type, propertyTitle, propertyRef });

  const jobs = [
    transporter.sendMail({
      from:    FROM,
      to:      ADMIN_EMAIL,
      subject: `[IYO Immo] ${subjectLine} — ${name}`,
      html:    adminHtml,
    }),
  ];

  if (email) {
    const replySubject = type === 'visit_request'
      ? `✅ Demande de visite confirmée — IYO Immo`
      : type === 'property_submission'
        ? `📋 Votre soumission est en cours d'examen — IYO Immo`
        : `Nous avons bien reçu votre message — IYO Immo`;

    jobs.push(transporter.sendMail({
      from:    FROM,
      to:      email,
      subject: replySubject,
      html:    replyHtml,
    }));
  }

  const results = await Promise.allSettled(jobs);
  results
    .filter(r => r.status === 'rejected')
    .forEach(f => console.error('⚠️  Mail error:', f.reason?.message));
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY APPROVAL CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════════
async function sendApprovalEmail({ name, email, propertyTitle, refId, propertyUrl }) {
  const html = wrap(`
    <div style="padding:32px;">
      <div style="background:#DCFCE7;border-left:4px solid #16A34A;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:16px;font-weight:800;color:#166534;">🎉 Votre bien a été approuvé et publié !</p>
      </div>
      <h2 style="margin:0 0 16px;font-size:20px;color:#0A2540;">Félicitations ${name} !</h2>
      <p style="color:#475569;line-height:1.75;margin-bottom:16px;">
        Nous avons le plaisir de vous informer que votre bien immobilier a été <strong style="color:#166534">examiné, approuvé et publié</strong>
        sur notre plateforme IYO Immo. Il est désormais visible par tous nos visiteurs à la recherche d'une propriété à Bangui.
      </p>
      <div style="background:#f0f4f8;border-radius:10px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:11px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Détails de votre publication</p>
        <table style="width:100%;font-size:14px;">
          <tr><td style="color:#64748B;padding:5px 0;width:110px;">Bien</td><td style="font-weight:600;color:#0A2540;">${propertyTitle}</td></tr>
          <tr><td style="color:#64748B;padding:5px 0;">Référence</td><td style="font-weight:600;color:#0A2540;">${refId}</td></tr>
          <tr><td style="color:#64748B;padding:5px 0;">Statut</td><td><span style="background:#DCFCE7;color:#166534;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;">✅ Publié</span></td></tr>
        </table>
      </div>
      <p style="color:#475569;line-height:1.75;margin-bottom:24px;">
        Vous pouvez dès maintenant voir votre annonce en ligne. Notre équipe vous contactera si des acheteurs ou locataires
        potentiels se manifestent. En attendant, n'hésitez pas à nous contacter pour toute question.
      </p>
      <div>
        ${btn(propertyUrl, '🏠 Voir mon annonce en ligne')}
        ${btn('https://wa.me/23672637171', '💬 Nous contacter', '#25D366')}
      </div>
    </div>`);

  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: `✅ Votre bien a été approuvé — IYO Immo (${refId})`,
    html,
  });
}

module.exports = { sendContactEmails, sendApprovalEmail };
