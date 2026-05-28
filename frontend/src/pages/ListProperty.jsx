import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { api } from '../context/AuthContext';
import Icon from '../components/icons';
import toast from 'react-hot-toast';
import './ListProperty.css';

const STEPS = 6;

export default function ListProperty() {
  const { t } = useLang();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    ownerName: '', ownerPhone: '', ownerEmail: '',
    intent: 'rent', type: 'apartment',
    neighbourhood: '', address: '', area: '', bedrooms: '', bathrooms: '', parking: '',
    amenities: [], description_fr: '', description_en: '',
    price: '', priceUnit: 'month',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleDrop = (e) => {
    e.preventDefault();
    const incoming = Array.from(e.dataTransfer?.files || e.target.files || []);
    setFiles(prev => [...prev, ...incoming].slice(0, 20));
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let imageUrls = [];
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach(f => fd.append('images', f));
        const res = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrls = res.data.urls || [];
      }

      await api.post('/leads', {
        type: 'property_submission',
        name: form.ownerName,
        phone: form.ownerPhone,
        email: form.ownerEmail,
        channel: 'form',
        submissionData: {
          ...form,
          images: imageUrls,
        },
      });

      setDone(true);
    } catch {
      toast.error(t.common.error);
    }
    setSubmitting(false);
  };

  if (done) return (
    <main style={{ paddingTop: 68 }}>
      <div className="container" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center', maxWidth: 560 }}>
        <div className="success-icon"><Icon name="checkCircle" size={56} color="var(--forest)" /></div>
        <h2>{t.listProperty.success.title}</h2>
        <p style={{ color: 'var(--slate)', marginTop: 12 }}>{t.listProperty.success.desc}</p>
        <Link to="/" className="btn-primary" style={{ marginTop: 28, display: 'inline-flex' }}>
          {t.listProperty.success.back}
        </Link>
      </div>
    </main>
  );

  return (
    <main style={{ paddingTop: 68 }}>
      <section className="list-page">
        <div className="container">
          <h1>{t.listProperty.title}</h1>
          <p style={{ color: 'var(--slate)', marginBottom: 32, maxWidth: 560 }}>{t.listProperty.subtitle}</p>

          {/* Stepper */}
          <div className="stepper">
            {t.listProperty.steps.map((label, i) => (
              <div key={i} className={`step${step === i + 1 ? ' step--active' : ''}${step > i + 1 ? ' step--done' : ''}`}>
                <div className="step__num">{step > i + 1 ? <Icon name="check" size={14} /> : i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="list-form-card">
            {/* Step 1: Owner info */}
            {step === 1 && (
              <>
                <h2>1. {t.listProperty.steps[0]}</h2>
                <div className="field-row">
                  <div className="field">
                    <label>Nom complet *</label>
                    <input placeholder="Jean Mbongo" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Téléphone WhatsApp *</label>
                    <input placeholder="+236 72 63 71 71" value={form.ownerPhone} onChange={e => set('ownerPhone', e.target.value)} required />
                  </div>
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="vous@email.com" value={form.ownerEmail} onChange={e => set('ownerEmail', e.target.value)} />
                </div>
              </>
            )}

            {/* Step 2: Type */}
            {step === 2 && (
              <>
                <h2>2. {t.listProperty.steps[1]}</h2>
                <div className="field">
                  <label>Intention *</label>
                  <div className="radio-group">
                    {[['rent', 'Louer'], ['buy', 'Vendre'], ['land', 'Terrain']].map(([val, label]) => (
                      <label key={val} className={`radio-card${form.intent === val ? ' radio-card--active' : ''}`}>
                        <input type="radio" name="intent" value={val} checked={form.intent === val} onChange={() => set('intent', val)} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Type de bien *</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="apartment">Appartement</option>
                    <option value="villa">Villa</option>
                    <option value="house">Maison</option>
                    <option value="land">Terrain</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 3: Address & Specs */}
            {step === 3 && (
              <>
                <h2>3. {t.listProperty.steps[2]}</h2>
                <div className="field-row">
                  <div className="field">
                    <label>Quartier *</label>
                    <input placeholder="Boy-Rabe" value={form.neighbourhood} onChange={e => set('neighbourhood', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Surface (m²)</label>
                    <input type="number" placeholder="220" value={form.area} onChange={e => set('area', e.target.value)} />
                  </div>
                </div>
                {form.type !== 'land' && (
                  <div className="field-row">
                    <div className="field">
                      <label>Chambres</label>
                      <input type="number" placeholder="4" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Salles de bain</label>
                      <input type="number" placeholder="3" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
                    </div>
                  </div>
                )}
                <div className="field">
                  <label>Description (FR)</label>
                  <textarea rows={3} placeholder="Décrivez votre bien..." value={form.description_fr} onChange={e => set('description_fr', e.target.value)} />
                </div>
                <div className="field">
                  <label>Description (EN)</label>
                  <textarea rows={3} placeholder="Describe your property..." value={form.description_en} onChange={e => set('description_en', e.target.value)} />
                </div>
              </>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <>
                <h2>4. {t.listProperty.steps[3]}</h2>
                <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 16 }}>Minimum 5 photos. La première sera la photo de couverture.</p>
                <div
                  className="upload-zone"
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <Icon name="upload" size={36} color="var(--slate)" />
                  <div style={{ fontWeight: 700, color: 'var(--ink)', marginTop: 10 }}>Glissez-déposez vos photos ici</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>ou <span style={{ color: 'var(--navy)', fontWeight: 600 }}>cliquez pour parcourir</span></div>
                  <input id="file-input" type="file" accept="image/*" multiple onChange={handleDrop} style={{ display: 'none' }} />
                </div>
                {files.length > 0 && (
                  <div className="photo-grid">
                    {files.map((file, i) => (
                      <div key={i} className="photo-thumb">
                        <img src={URL.createObjectURL(file)} alt="" />
                        {i === 0 && <div className="photo-cover-badge">COUVERTURE</div>}
                        <button className="photo-remove" onClick={() => removeFile(i)}>
                          <Icon name="x" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 5: Price */}
            {step === 5 && (
              <>
                <h2>5. {t.listProperty.steps[4]}</h2>
                <div className="field-row">
                  <div className="field">
                    <label>Prix (XAF) *</label>
                    <input type="number" placeholder="450000" value={form.price} onChange={e => set('price', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Unité</label>
                    <select value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)}>
                      <option value="month">Par mois (location)</option>
                      <option value="total">Prix total (vente)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Confirm */}
            {step === 6 && (
              <>
                <h2>6. {t.listProperty.steps[5]}</h2>
                <div className="confirm-summary">
                  <div className="confirm-row"><strong>Propriétaire :</strong> {form.ownerName}</div>
                  <div className="confirm-row"><strong>Contact :</strong> {form.ownerPhone}</div>
                  <div className="confirm-row"><strong>Type :</strong> {form.type} ({form.intent})</div>
                  <div className="confirm-row"><strong>Quartier :</strong> {form.neighbourhood}</div>
                  <div className="confirm-row"><strong>Surface :</strong> {form.area} m²</div>
                  <div className="confirm-row"><strong>Prix :</strong> {form.price} XAF</div>
                  <div className="confirm-row"><strong>Photos :</strong> {files.length} photo(s)</div>
                </div>
              </>
            )}

            <div className="list-form-actions">
              {step > 1 && (
                <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>{t.listProperty.prev}</button>
              )}
              {step < STEPS ? (
                <button className="btn-primary" onClick={() => setStep(s => s + 1)}>{t.listProperty.next}</button>
              ) : (
                <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? '...' : 'Envoyer ma demande →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
