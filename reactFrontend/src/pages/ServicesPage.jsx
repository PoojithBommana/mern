import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllServices, createService, updateService, deleteService } from '../apis/servicesApi';
import Button from '../components/Button';
import { Banner, EmptyState, Field, SvgIcon, TextArea } from '../components/ui';
import { ServicesIllustration } from '../components/illustrations';
import { formatRupees } from '../utils/format';
import { useToast } from '../context/ToastContext';

const parseMoneyInput = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const cleaned = String(value).replace(/[^\d.]/g, '');
  if (cleaned === '') return '';
  const [whole, fraction] = cleaned.split('.');
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '');
  if (fraction === undefined) return normalizedWhole;
  return `${normalizedWhole}.${fraction.slice(0, 2)}`;
};

const SERVICE_ICONS = [
  { id: 'chart', label: 'chart' },
  { id: 'search', label: 'search' },
  { id: 'rocket', label: 'rocket' },
  { id: 'shield', label: 'shield' },
  { id: 'flame', label: 'flame' },
  { id: 'moon', label: 'moon' },
  { id: 'camera', label: 'camera' },
  { id: 'infinity', label: 'infinity' },
];

const asList = (value) => (Array.isArray(value) ? value : value?.services || []);

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState('');
  const [addedServiceName, setAddedServiceName] = useState('');
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    price: '',
    description: '',
    icon: 'rocket',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getAllServices();
      setServices(asList(data));
    } catch (err) {
      setError(err.message || 'Could not load services');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({ name: '', duration: 30, price: '', description: '', icon: 'rocket' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...formData,
      duration: Number(formData.duration) || 30,
      price: formData.price === '' ? 0 : Number(formData.price),
    };
    try {
      if (editingService) {
        await updateService(editingService._id, payload);
        setAddedServiceName('');
      } else {
        await createService(payload);
        setAddedServiceName(payload.name);
        toast('Service created. Go to Availability to set your hours.', {
          to: '/dashboard/availability',
          action: 'Set availability',
        });
      }
      await fetchServices();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setAddedServiceName('');
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price === 0 || service.price == null ? '' : String(service.price),
      description: service.description,
      icon: service.icon || 'rocket',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      await fetchServices();
    } catch {
      setError('Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="bm-kicker">Services</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 md:text-[44px]">
            Shape what customers
            <br />
            can <span className="italic text-rose-400">book.</span>
          </h1>
          <p className="mt-3 max-w-xl text-slate-500">
            Add each appointment type with a duration and price. Active services appear on your public booking page.
          </p>
        </div>
        <ServicesIllustration />
      </div>

      {error && <Banner>{error}</Banner>}
      {addedServiceName && (
        <div className="flex flex-col gap-4 rounded-[24px] border border-violet-100 bg-violet-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-900">{addedServiceName} is ready.</p>
            <p className="mt-1 text-sm text-slate-600">
              Next, set your weekly availability so customers can pick a time for this service.
            </p>
          </div>
          <Link to="/dashboard/availability" state={{ fromService: addedServiceName }}>
            <Button className="whitespace-nowrap">
              Set availability
              <SvgIcon name="arrowRight" className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bm-card p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="text-violet-500">+</span>
            {editingService ? 'Edit service' : 'Add new service'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Service name"
              icon="briefcase"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Consultation"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Duration"
                icon="clock"
                type="number"
                min="5"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                required
              />
              <Field
                label="Price"
                icon="rupee"
                type="text"
                inputMode="decimal"
                value={formData.price}
                onChange={(e) => {
                  const next = parseMoneyInput(e.target.value);
                  if (next === null) return;
                  setFormData({ ...formData, price: next });
                }}
                placeholder="0"
              />
            </div>
            <TextArea
              label="Description"
              icon="file"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A short customer-facing description"
              required
            />
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Service Icon</p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: icon.id })}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white transition ${
                      formData.icon === icon.id ? 'ring-2 ring-violet-500 ring-offset-2' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <SvgIcon name={icon.id} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" fullWidth size="lg" loading={saving}>
              <SvgIcon name="save" className="h-4 w-4" />
              {editingService ? 'Update service' : 'Add service'}
            </Button>
            {editingService && (
              <button type="button" onClick={resetForm} className="w-full text-sm font-semibold text-slate-500">
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="bm-card p-6">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Your services</h2>
          {services.length === 0 ? (
            <EmptyState icon="briefcase" title="No services yet." subtitle="Create your first bookable service." />
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service._id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <SvgIcon name={service.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900">{service.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{service.description}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {service.duration} min · <span className="font-semibold text-violet-600">{formatRupees(service.price)}</span>
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(service)} className="rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-600">
                        <SvgIcon name="edit" className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(service._id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                        <SvgIcon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
