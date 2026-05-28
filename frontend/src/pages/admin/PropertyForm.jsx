import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import Icon from '../../components/icons';
import toast from 'react-hot-toast';
import './PropertyForm.css';

const AMENITY_KEYS = ['airConditioning', 'generator', 'waterTank', 'pool', 'parking', 'security', 'fibreInternet', 'equippedKitchen', 'garden', 'furnished'];
const AMENITY_LABELS = {
  airConditioning: 'Climatisation', generator: 'Groupe électrogène', waterTank: "Réservoir d'eau",
  pool: 'Piscine', parking: 'Parking', security: 'Gardiennage 24/7',
  fibreInternet: 'Internet fibre', equippedKitchen: 'Cuisine équipée', garden: 'Jardin', furnished: 'Meublé',
};

const EMPTY = {
  title: { fr: '', en: '' },
  description: { fr: '', en: '' },
  intent: 'rent', type: 'apartment', status: 'available',
  price: '', priceUnit: 'month',
  neighbourhood: '', address: '', city: 'Bangui',
  specs: { bedrooms: '', bathrooms: '', area: '', parking: '', yearBuilt: '' },
  amenities: { airConditioning: false, generator: false, waterTank: false, pool: false, parking: false, security: false, fibreInternet: false, equippedKitchen: false, garden: false, furnished: false },
  isFeatured: false, isPublished: true, nearby: '',
  images: [], coverImage: '',
};

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    api.get('/team/users').then(r => setAgents(r.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/properties/${id}`).then(r => {
        const p = r.data;
        setForm({
          ...EMPTY, ...p,
          title: p.title || { fr: '', en: '' },
          description: p.description || { fr: '', en: '' },
          specs: { ...EMPTY.specs, ...p.specs },
          amenities: { ...EMPTY.amenities, ...p.amenities },
        });
      }).catch(() => toast.error('Propriété introuvable'));
    }
  }, [id]);

  const set = (path, val) => {
    setForm(f => {
      const copy = { ...f };
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = val;
      return copy;
    });
  };

  const handleImages = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const { data } = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newUrls = data.urls || [];
      setForm(f => ({
        ...f,
        images: [...f.images, ...newUrls],
        coverImage: f.coverImage || newUrls[0] || '',
      }));
      toast.success(`${newUrls.length} photo(s) uploadée(s)`);
    } catch {
      toast.error('Erreur upload');
    }
    setUploadingImages(false);
  };

  const removeImage = (url) => {
    setForm(f => ({
      ...f,
      images: f.images.filter(i => i !== url),
      coverImage: f.coverImage === url ? (f.images.find(i => i !== url) || '') : f.coverImage,
    }));
  };

  const setCover = (url) => setForm(f => ({ ...f, coverImage: url }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/properties/${id}`, form);
        toast.success('Propriété mise à jour');
      } else {
        await api.post('/properties', form);
        toast.success('Propriété créée');
      }
      navigate('/admin/properties');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
    setSaving(false);
  };

  return (
    <div className="prop-form">
      <div className="prop-form__header">
        <button className="back-btn" onClick={() => navigate('/admin/properties')}>
          <Icon name="chevronLeft" size={18} /> Retour
        </button>
        <h1>{isEdit ? 'Modifier la propriété' : 'Nouvelle propriété'}</h1>
        <div className="prop-form__header-actions">
          <label className="toggle-label">
            <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
            En vedette
          </label>
          <label className="toggle-label">
            <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
            Publié
          </label>
          <button className="dash-btn" onClick={handleSave} disabled={saving}>
            {saving ? '...' : <><Icon name="check" size={16} /> {isEdit ? 'Sauvegarder' : 'Créer'}</>}
          </button>
        </div>
      </div>

      <div className="prop-form__body">
        {/* Left column */}
        <div className="prop-form__main">
          {/* Basic info */}
          <div className="form-card">
            <h3>Informations générales</h3>
            <div className="field-row">
              <div className="field">
                <label>Titre (FR) *</label>
                <input value={form.title.fr} onChange={e => set('title.fr', e.target.value)} placeholder="Villa moderne 4 chambres..." />
              </div>
              <div className="field">
                <label>Title (EN) *</label>
                <input value={form.title.en} onChange={e => set('title.en', e.target.value)} placeholder="Modern 4-bedroom villa..." />
              </div>
            </div>
            <div className="field">
              <label>Description (FR) *</label>
              <textarea rows={4} value={form.description.fr} onChange={e => set('description.fr', e.target.value)} placeholder="Décrivez la propriété..." />
            </div>
            <div className="field">
              <label>Description (EN) *</label>
              <textarea rows={4} value={form.description.en} onChange={e => set('description.en', e.target.value)} placeholder="Describe the property..." />
            </div>
            <div className="field">
              <label>À proximité</label>
              <input value={form.nearby} onChange={e => set('nearby', e.target.value)} placeholder="École · Pharmacie · Ambassade..." />
            </div>
          </div>

          {/* Classification */}
          <div className="form-card">
            <h3>Classification</h3>
            <div className="field-row">
              <div className="field">
                <label>Intention *</label>
                <select value={form.intent} onChange={e => set('intent', e.target.value)}>
                  <option value="rent">Location</option>
                  <option value="buy">Vente</option>
                  <option value="land">Terrain</option>
                </select>
              </div>
              <div className="field">
                <label>Type *</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="apartment">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="house">Maison</option>
                  <option value="land">Terrain</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="field">
                <label>Statut *</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="available">Disponible</option>
                  <option value="reserved">Réservé</option>
                  <option value="rented">Loué</option>
                  <option value="sold">Vendu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-card">
            <h3>Localisation</h3>
            <div className="field-row">
              <div className="field">
                <label>Quartier *</label>
                <input value={form.neighbourhood} onChange={e => set('neighbourhood', e.target.value)} placeholder="Boy-Rabe" />
              </div>
              <div className="field">
                <label>Adresse</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Rue, Numéro..." />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="form-card">
            <h3>Caractéristiques</h3>
            <div className="field-row">
              <div className="field">
                <label>Chambres</label>
                <input type="number" min={0} value={form.specs.bedrooms} onChange={e => set('specs.bedrooms', e.target.value)} />
              </div>
              <div className="field">
                <label>Salles de bain</label>
                <input type="number" min={0} value={form.specs.bathrooms} onChange={e => set('specs.bathrooms', e.target.value)} />
              </div>
              <div className="field">
                <label>Surface (m²)</label>
                <input type="number" min={0} value={form.specs.area} onChange={e => set('specs.area', e.target.value)} />
              </div>
              <div className="field">
                <label>Parking</label>
                <input type="number" min={0} value={form.specs.parking} onChange={e => set('specs.parking', e.target.value)} />
              </div>
              <div className="field">
                <label>Année</label>
                <input type="number" value={form.specs.yearBuilt} onChange={e => set('specs.yearBuilt', e.target.value)} placeholder="2020" />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="form-card">
            <h3>Équipements</h3>
            <div className="amenities-grid">
              {AMENITY_KEYS.map(key => (
                <label key={key} className={`amenity-check${form.amenities[key] ? ' amenity-check--on' : ''}`}>
                  <input type="checkbox" checked={!!form.amenities[key]} onChange={e => set(`amenities.${key}`, e.target.checked)} />
                  {AMENITY_LABELS[key]}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="prop-form__side">
          {/* Price */}
          <div className="form-card">
            <h3>Prix</h3>
            <div className="field">
              <label>Prix (XAF) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="450000" />
            </div>
            <div className="field">
              <label>Unité</label>
              <select value={form.priceUnit} onChange={e => set('priceUnit', e.target.value)}>
                <option value="month">/ mois (location)</option>
                <option value="total">Prix total (vente)</option>
              </select>
            </div>
          </div>

          {/* Agent */}
          <div className="form-card">
            <h3>Agent responsable</h3>
            <div className="field">
              <label>Agent</label>
              <select value={form.agent || ''} onChange={e => set('agent', e.target.value)}>
                <option value="">— Sélectionner —</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          {/* Photos */}
          <div className="form-card">
            <h3>Photos</h3>
            <label className="upload-btn">
              <Icon name="upload" size={16} />
              {uploadingImages ? 'Upload en cours...' : 'Ajouter des photos'}
              <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} disabled={uploadingImages} />
            </label>
            {form.images.length > 0 && (
              <div className="photos-grid">
                {form.images.map((url, i) => (
                  <div key={i} className={`photo-item${form.coverImage === url ? ' photo-item--cover' : ''}`}>
                    <img src={`http://localhost:5000${url}`} alt="" onClick={() => setCover(url)} title="Définir comme couverture" />
                    {form.coverImage === url && <div className="photo-cover">Cover</div>}
                    <button className="photo-del" onClick={() => removeImage(url)}><Icon name="x" size={10} /></button>
                  </div>
                ))}
              </div>
            )}
            {form.images.length > 0 && (
              <p style={{ fontSize: 11, color: 'var(--slate)', marginTop: 8 }}>Cliquez sur une photo pour la définir comme couverture.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
