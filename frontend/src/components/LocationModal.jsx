import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Plus, 
  Check, 
  Home, 
  Briefcase, 
  Navigation, 
  Compass, 
  Radio, 
  Search, 
  Trash2, 
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export const LocationModal = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    savedLocations,
    currentLocation,
    setCurrentLocation,
    addLocation,
    removeLocation,
    detectGPSLocation,
    isDetectingGPS,
    gpsError,
    gpsAccuracy
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [gpsSuccessNotice, setGpsSuccessNotice] = useState(false);

  if (!isLocationModalOpen) return null;

  const popularIndianHubs = [
    { label: 'Indiranagar, Bengaluru', city: 'Bengaluru', lat: 12.9784, lng: 77.6408, pin: '560038' },
    { label: 'Koramangala, Bengaluru', city: 'Bengaluru', lat: 12.9352, lng: 77.6245, pin: '560034' },
    { label: 'Bandra West, Mumbai', city: 'Mumbai', lat: 19.0596, lng: 72.8295, pin: '400050' },
    { label: 'Connaught Place, Delhi', city: 'New Delhi', lat: 28.6315, lng: 77.2167, pin: '110001' },
    { label: 'Hitech City, Hyderabad', city: 'Hyderabad', lat: 17.4435, lng: 78.3772, pin: '500081' },
    { label: 'Koregaon Park, Pune', city: 'Pune', lat: 18.5362, lng: 73.8940, pin: '411001' }
  ];

  const handleSelect = (loc) => {
    setCurrentLocation(loc);
    setIsLocationModalOpen(false);
  };

  const handleSelectQuickHub = (hub) => {
    const loc = {
      id: `loc-hub-${Date.now()}`,
      label: hub.label,
      address: `${hub.label}, Pin: ${hub.pin}`,
      city: hub.city,
      postalCode: hub.pin,
      lat: hub.lat,
      lng: hub.lng,
      isGPS: false
    };
    addLocation(loc);
    setIsLocationModalOpen(false);
  };

  const handleTriggerGPS = async () => {
    try {
      setGpsSuccessNotice(false);
      const loc = await detectGPSLocation();
      setGpsSuccessNotice(true);
      setTimeout(() => {
        setIsLocationModalOpen(false);
        setGpsSuccessNotice(false);
      }, 1500);
    } catch (err) {
      console.warn('GPS Trigger error:', err);
    }
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    addLocation({
      label: `${newLabel} (${newCity})`,
      address: `${newAddress}, ${newCity}${newPostalCode ? ` - ${newPostalCode}` : ''}`,
      city: newCity,
      postalCode: newPostalCode,
      lat: 12.9716,
      lng: 77.5946
    });
    setIsAddingNew(false);
    setNewAddress('');
    setNewPostalCode('');
    setIsLocationModalOpen(false);
  };

  const filteredLocations = savedLocations.filter(loc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      loc.label?.toLowerCase().includes(q) ||
      loc.address?.toLowerCase().includes(q) ||
      loc.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
      <div
        className="glass-panel animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 10px var(--primary-glow)'
            }}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                Delivery Location
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Live GPS detection & address book
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsLocationModalOpen(false)} 
            className="btn btn-ghost btn-sm" 
            style={{ padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Real-time GPS Detection Button Card */}
          <div 
            onClick={!isDetectingGPS ? handleTriggerGPS : undefined}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(255, 94, 30, 0.12) 0%, rgba(255, 161, 51, 0.08) 100%)',
              border: '1.5px dashed var(--primary)',
              cursor: isDetectingGPS ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(255, 94, 30, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: isDetectingGPS ? 'var(--bg-elevated)' : 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 3px 12px var(--primary-glow)'
              }}>
                {isDetectingGPS ? (
                  <Loader2 size={22} className="animate-spin" color="var(--primary)" />
                ) : (
                  <Navigation size={22} />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {isDetectingGPS ? 'Pinpointing GPS Coordinates...' : 'Detect Current GPS Location'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {isDetectingGPS 
                    ? 'Fetching satellite location & street details...' 
                    : 'Using device GPS sensor (High Accuracy)'}
                </div>
              </div>
            </div>

            <div style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              flexShrink: 0
            }}>
              {isDetectingGPS ? 'Scanning...' : 'Detect'}
            </div>
          </div>

          {/* GPS Success / Error Alerts */}
          {gpsSuccessNotice && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--veg-color)',
              color: 'var(--veg-color)',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <CheckCircle2 size={18} />
              <span>Location calibrated: {currentLocation?.label} ({currentLocation?.city})</span>
            </div>
          )}

          {gpsError && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '0.8rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Location Access:</strong> {gpsError}
              </div>
            </div>
          )}

          {/* Current Active Location Highlight */}
          {currentLocation && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 10px #10B981'
                }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Active Delivery Zone
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                    {currentLocation.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {currentLocation.address}
                  </div>
                </div>
              </div>
              <span className="badge badge-veg" style={{ fontSize: '0.68rem' }}>
                LIVE
              </span>
            </div>
          )}

          {/* Search Indian Localities */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Indian locality, street, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: '12px',
                paddingTop: '10px',
                paddingBottom: '10px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          {/* Quick Popular Indian Hubs */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Popular Gourmet Hubs
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularIndianHubs.map((hub, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuickHub(hub)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.78rem',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-input)'
                  }}
                >
                  📍 {hub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Addresses List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Saved Addresses ({filteredLocations.length})
              </span>
              <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.78rem', color: 'var(--primary)', padding: '2px 8px' }}
              >
                <Plus size={14} /> {isAddingNew ? 'Cancel' : 'Add New'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {filteredLocations.map((loc) => {
                const isSelected = currentLocation?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelect(loc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(255, 94, 30, 0.12)' : 'var(--bg-elevated)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--bg-input)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        flexShrink: 0
                      }}>
                        {loc.isGPS ? (
                          <Radio size={16} color="#10B981" />
                        ) : loc.label?.toLowerCase().includes('office') ? (
                          <Briefcase size={16} />
                        ) : (
                          <Home size={16} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{loc.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{loc.address}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isSelected && <Check size={18} color="var(--primary)" />}
                      {!loc.isGPS && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLocation(loc.id);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px', color: 'var(--text-muted)' }}
                          title="Delete address"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Custom Address Form */}
          {isAddingNew && (
            <form onSubmit={handleAddNew} style={{
              padding: '16px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Add Custom Delivery Address</div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['Home', 'Office', 'Hotel / Other'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNewLabel(tag)}
                    className="btn btn-sm"
                    style={{
                      flex: 1,
                      background: newLabel === tag ? 'var(--primary)' : 'var(--bg-elevated)',
                      color: newLabel === tag ? '#fff' : 'var(--text-main)',
                      fontSize: '0.78rem'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Flat / House / Street Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Shanti Heights, 12th Main Road"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="input"
                  style={{ width: '100%', padding: '8px 12px', marginTop: '4px', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '8px 12px', marginTop: '4px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PIN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 560038"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '8px 12px', marginTop: '4px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save & Deliver Here
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
