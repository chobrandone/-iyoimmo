import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { api } from '../context/AuthContext';
import Icon from '../components/icons';
import MapEmbed from '../components/MapEmbed';
import toast from 'react-hot-toast';
import './Contact.css';

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ subject: '', name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leads', { ...form, type: 'contact', channel: 'form' });
      toast.success(t.contact.success);
      setForm({ subject: '', name: '', phone: '', email: '', message: '' });
    } catch {
      toast.error(t.common.error);
    }
    setSubmitting(false);
  };

  const contactItems = [
    { icon: 'phone', label: t.contact.phone, value: '+236 72 63 71 71', href: 'tel:+23672637171' },
    { icon: 'whatsapp', label: t.contact.whatsapp, value: '+236 72 63 71 71', href: 'https://wa.me/23672637171', green: true },
    { icon: 'mail', label: t.contact.email, value: 'contact@iyoimmo.com', href: 'mailto:contact@iyoimmo.com' },
    { icon: 'pin', label: t.contact.office, value: 'Avenue Boganda, Bangui', href: null },
    { icon: 'eye', label: t.contact.hours, value: t.contact.hoursValue, href: null },
  ];

  return (
    <main style={{ paddingTop: 68 }}>
      <section className="contact-page">
        <div className="container">
          <h1 className="contact-title">{t.contact.title}</h1>
          <p className="contact-subtitle">{t.contact.subtitle}</p>

          <div className="contact-grid">
            {/* Info column */}
            <div className="contact-info">
              <h3>{t.contact.phone === 'Phone' ? 'Contact' : 'Nous joindre'}</h3>
              {contactItems.map((item, i) => (
                <div key={i} className="contact-item">
                  <div className={`contact-item__icon${item.green ? ' contact-item__icon--wa' : ''}`}>
                    <Icon name={item.icon} size={18} />
                  </div>
                  <div className="contact-item__detail">
                    <div className="contact-item__label">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="contact-item__value" target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                        {item.value}
                      </a>
                    ) : (
                      <div className="contact-item__value">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 24 }}>
                <MapEmbed
                  query="Avenue Boganda, Bangui, République Centrafricaine"
                  height={260}
                  zoom={15}
                />
              </div>
            </div>

            {/* Form */}
            <div className="contact-form-card">
              <h3>{t.contact.form.title}</h3>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="field">
                  <label>{t.contact.form.subject}</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required>
                    <option value="">—</option>
                    {t.contact.form.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>{t.contact.form.name}</label>
                    <input placeholder={t.contact.form.placeholders.name} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="field">
                    <label>{t.contact.form.phone}</label>
                    <input placeholder={t.contact.form.placeholders.phone} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="field">
                  <label>{t.contact.form.email}</label>
                  <input type="email" placeholder={t.contact.form.placeholders.email} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="field">
                  <label>{t.contact.form.message}</label>
                  <textarea rows={5} placeholder={t.contact.form.placeholders.message} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '...' : t.contact.form.send}
                </button>
                <p className="privacy-note">{t.contact.form.privacy}</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
