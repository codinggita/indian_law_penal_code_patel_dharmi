import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../../store/slices/authSlice';
import api from '../../../services/api';

/* ─── Micro Toggle Switch ─────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, id }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-[20px] w-9 flex-shrink-0 cursor-pointer rounded-full transition-all duration-300 focus:outline-none ${
      checked
        ? 'bg-[#7C3AED] shadow-sm shadow-[#7C3AED]/30'
        : 'bg-gray-200 dark:bg-[#2A2F45]'
    }`}
  >
    <span
      className={`pointer-events-none absolute top-[2px] left-[2px] h-[16px] w-[16px] rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
        checked ? 'translate-x-[16px]' : 'translate-x-0'
      }`}
    />
  </button>
);

/* ─── Input Field ──────────────────────────────────────────────────────── */
const Field = ({ label, id, type = 'text', value, onChange, readOnly = false, placeholder = '', icon }) => (
  <div className="space-y-2 w-full">
    <label htmlFor={id} className="block text-sm font-semibold tracking-wider text-gray-500 dark:text-[#94A3B8]">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 dark:text-[#94A3B8] text-[18px] pointer-events-none">
          {icon}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-10' : 'pl-3.5'} pr-3.5 h-11 rounded-lg text-base transition-all duration-205 outline-none border ${
          readOnly
            ? 'bg-gray-50 dark:bg-[#182030] border-gray-200 dark:border-[#2A2F45] text-gray-450 dark:text-[#94A3B8] cursor-not-allowed'
            : 'bg-white dark:bg-[#09090B] border-gray-200 dark:border-[#2A2F45] text-gray-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30'
        }`}
      />
    </div>
  </div>
);

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  /* Edit modes */
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  /* User fetch */
  useEffect(() => {
    if (!user) {
      api.get('/auth/me').then(r => { if (r.data?.data) dispatch(setUser(r.data.data)); }).catch(() => {});
    }
  }, [user, dispatch]);

  /* Form state */
  const [firstName, setFirstName]   = useState('');
  const [lastName,  setLastName]    = useState('');
  const [email,     setEmail]       = useState('');
  const [barCouncil,setBarCouncil]  = useState('');
  const [saving,    setSaving]      = useState(false);
  const [saveMsg,   setSaveMsg]     = useState('');
  const [saveErr,   setSaveErr]     = useState('');

  /* Avatar */
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  /* Password */
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw,     setNewPw]       = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [pwLoading, setPwLoading]   = useState(false);
  const [pwMsg,     setPwMsg]       = useState('');
  const [pwErr,     setPwErr]       = useState('');

  /* Prefs */
  const [prefEmail,     setPrefEmail]     = useState(true);
  const [prefAlerts,    setPrefAlerts]    = useState(true);
  const [prefSMS,       setPrefSMS]       = useState(false);
  const [prefMarketing, setPrefMarketing] = useState(false);

  /* Stats */
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [noteCount,     setNoteCount]     = useState(0);

  /* Sync user into form */
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setBarCouncil(user.barCouncil || '');
    }
  }, [user]);

  /* Load stats */
  useEffect(() => {
    api.get('/bookmarks').then(r => setBookmarkCount(r.data?.data?.length || 0)).catch(() => {});
    api.get('/notes').then(r => setNoteCount(r.data?.data?.length || 0)).catch(() => {});
  }, []);

  /* Handlers */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) { setSaveErr('First name is required.'); return; }
    setSaving(true); setSaveErr(''); setSaveMsg('');
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await api.put('/auth/profile', { name: fullName, barCouncil });
      if (res.data?.data) dispatch(setUser(res.data.data));
      setSaveMsg('Profile saved successfully.');
      setIsEditingInfo(false);
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      setSaveErr(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwErr(''); setPwMsg('');
    if (!currentPw || !newPw || !confirmPw) { setPwErr('All fields are required.'); return; }
    if (newPw.length < 6)  { setPwErr('Password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setPwErr('Passwords do not match.'); return; }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setPwMsg('Password changed successfully.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setIsChangingPw(false);
      setTimeout(() => setPwMsg(''), 4000);
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Incorrect current password.');
    } finally {
      setPwLoading(false);
    }
  };

  const initials = (user?.name || 'Dhruva Patel').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const fullName = user?.name || 'Dhruva Patel';
  const roleName = user?.role === 'admin' ? 'Administrator' : 'Legal Professional';

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white font-sans selection:bg-[#7C3AED]/30 pb-20">
      
      {/* Container */}
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8 pt-6 pb-12">
        
        {/* Top Header Label */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-[#94A3B8] mt-1.5">Manage your personal information and account settings</p>
        </div>

        {/* Outer Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          
          {/* LEFT 70% PANEL */}
          <div className="space-y-6">
            
            {/* HERO PROFILE CARD */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl overflow-hidden p-6 relative shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                
                {/* User Info Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  {/* Avatar upload wrapper */}
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-[#2A2F45] ring-2 ring-[#7C3AED]/20 group-hover:ring-[#7C3AED]/60 transition-all duration-300">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-white text-3xl font-extrabold select-none">
                          {initials}
                        </div>
                      )}
                    </div>
                    {/* Hover edit camera icon */}
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-full flex items-center justify-center text-gray-600 dark:text-white shadow-md hover:bg-gray-50 dark:hover:bg-slate-800">
                      <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setAvatarPreview(ev.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  {/* Text details */}
                  <div className="space-y-2.5 mt-2 sm:mt-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{fullName}</h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#7C3AED]/10 border border-[#7C3AED]/35 text-[#a78bfa] text-xs font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        PRO
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-[#94A3B8] font-semibold">{roleName}</p>
                    
                    <div className="space-y-2 pt-1">
                      <p className="text-sm text-gray-550 dark:text-[#94A3B8] flex items-center justify-center sm:justify-start gap-2">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        {email}
                      </p>
                      <p className="text-sm text-gray-550 dark:text-[#94A3B8] flex items-center justify-center sm:justify-start gap-2">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        Member since January 2026
                      </p>
                    </div>

                    <div className="pt-1.5 flex justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/15 text-[#10B981] rounded-full text-xs font-bold tracking-wide uppercase">
                        <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                        Online
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditingInfo(true)}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-gray-200 dark:border-[#2A2F45] text-xs font-semibold text-gray-700 dark:text-white transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Edit Profile
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-t border-gray-100 dark:border-[#2A2F45] mt-6 pt-6 gap-4">
                {[
                  { label: 'Bookmarks Saved', value: bookmarkCount, icon: 'bookmark', color: '#FACC15' },
                  { label: 'Notes Created', value: noteCount, icon: 'edit_document', color: '#7C3AED' },
                  { label: 'Current Plan', value: 'Professional', icon: 'workspace_premium', color: '#10B981' },
                  { label: 'Searches Today', value: '—', icon: 'search', color: '#3B82F6' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-[#2A2F45] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold text-gray-900 dark:text-white">{value}</p>
                      <p className="text-xs text-gray-400 dark:text-[#94A3B8] font-medium truncate">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PERSONAL INFORMATION */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl overflow-hidden p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#7C3AED] text-[18px]">person</span>
                    Personal Information
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-[#94A3B8] mt-0.5">Update your name and professional credentials</p>
                </div>
                {!isEditingInfo && (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-gray-200 dark:border-[#2A2F45] text-xs font-semibold text-gray-700 dark:text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">edit</span>
                    Edit
                  </button>
                )}
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Dhruva" />
                    <Field label="Last Name" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Patel" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email Address" id="email" type="email" value={email} readOnly icon="mail" />
                    <Field label="Bar Council Number" id="barCouncil" value={barCouncil} onChange={e => setBarCouncil(e.target.value)} placeholder="Optional" icon="gavel" />
                  </div>

                  {saveErr && (
                    <div className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-2 rounded">
                      {saveErr}
                    </div>
                  )}

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-4 h-9 rounded-lg bg-transparent hover:bg-black/5 border border-gray-250 dark:border-[#2A2F45] text-xs font-semibold text-gray-500 dark:text-[#94A3B8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 h-9 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-xs font-semibold text-white shadow-sm flex items-center gap-1.5"
                    >
                      {saving && <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>}
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 pt-2">
                  {[
                    { label: 'First Name', value: firstName || 'dhruva' },
                    { label: 'Last Name', value: lastName || 'Mehta' },
                    { label: 'Email Address', value: email || 'dhruva123@gmail.com', verified: true },
                    { label: 'Bar Council Number', value: barCouncil || '—', optional: true },
                  ].map((field) => (
                    <div key={field.label} className="border-b border-gray-100 dark:border-[#2A2F45]/50 pb-2.5">
                      <p className="text-xs font-bold text-gray-400 dark:text-[#94A3B8] uppercase tracking-wider">{field.label}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">{field.value}</span>
                        {field.verified && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-semibold leading-none">
                            Verified
                          </span>
                        )}
                        {field.optional && !barCouncil && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-[#2A2F45]/50 rounded text-gray-500 dark:text-[#94A3B8]">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PASSWORD & SECURITY */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl overflow-hidden p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#EF4444] text-[18px]">lock</span>
                    Password & Security
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-[#94A3B8] mt-0.5">Use a strong password to keep your account safe</p>
                </div>
                {!isChangingPw && (
                  <button
                    onClick={() => setIsChangingPw(true)}
                    className="flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-gray-200 dark:border-[#2A2F45] text-xs font-semibold text-gray-700 dark:text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-[13px]">vpn_key</span>
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPw ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Field label="Current Password" id="currentPw" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" icon="key" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="New Password" id="newPw" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 chars" icon="lock" />
                    <Field label="Confirm Password" id="confirmPw" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" icon="lock" />
                  </div>

                  {pwErr && (
                    <div className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-2 rounded">
                      {pwErr}
                    </div>
                  )}

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingPw(false)}
                      className="px-4 h-9 rounded-lg bg-transparent hover:bg-black/5 border border-gray-250 dark:border-[#2A2F45] text-xs font-semibold text-gray-500 dark:text-[#94A3B8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="px-5 h-9 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 text-xs font-semibold text-white shadow-sm flex items-center gap-1.5"
                    >
                      {pwLoading && <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>}
                      Update Password
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {[
                    { label: 'Password', value: 'Last changed just now', icon: 'fingerprint', color: '#3B82F6' },
                    { label: 'Two Factor Authentication', value: 'Enabled', icon: 'gpp_good', color: '#10B981', arrow: true },
                    { label: 'Active Devices', value: '3 Devices', icon: 'devices', color: '#7C3AED', arrow: true },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 dark:bg-[#1F2937]/50 border border-gray-100 dark:border-[#2A2F45]/50 rounded-xl p-4 flex items-center justify-between hover:border-gray-200 dark:hover:border-[#2A2F45] cursor-pointer group transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: item.color + '15' }}>
                          <span className="material-symbols-outlined text-[20px]" style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-[#94A3B8] font-bold uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[15px] text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">chevron_right</span>
                    </div>
                  ))}
                </div>
              )}

              {pwMsg && (
                <div className="mt-4 text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-2 rounded">
                  {pwMsg}
                </div>
              )}
            </div>

            {/* NOTIFICATION PREFERENCES */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl overflow-hidden p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B82F6] text-[18px]">notifications</span>
                    Notification Preferences
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-[#94A3B8] mt-0.5">Control which communications you receive</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { id: 'pe', label: 'Email Digest', desc: 'Daily legal updates', val: prefEmail, set: setPrefEmail },
                  { id: 'pa', label: 'Act Change Alerts', desc: 'Get notified on amendments', val: prefAlerts, set: setPrefAlerts },
                  { id: 'ps', label: 'SMS Notifications', desc: 'Critical updates on phone', val: prefSMS, set: setPrefSMS },
                  { id: 'pm', label: 'Marketing & Offers', desc: 'Product updates & offers', val: prefMarketing, set: setPrefMarketing },
                ].map(({ id, label, desc, val, set }) => (
                  <div key={id} className="flex items-start justify-between gap-3 bg-gray-50/50 dark:bg-[#1F2937]/30 border border-gray-100 dark:border-[#2A2F45]/30 rounded-xl p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{label}</p>
                      <p className="text-[10px] text-gray-400 dark:text-[#94A3B8] leading-tight">{desc}</p>
                    </div>
                    <Toggle id={id} checked={val} onChange={set} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-[#94A3B8] mt-4 italic">You can update your preferences at any time.</p>
            </div>

          </div>

          {/* RIGHT 30% SIDEBAR */}
          <div className="space-y-6">
            
            {/* SUBSCRIPTION CARD */}
            <div className="relative bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl overflow-hidden p-5 shadow-sm">
              {/* Gold Top Border */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FACC15] via-amber-400 to-[#FACC15]" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#FACC15] text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  Subscription
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Active
                </span>
              </div>

              <div className="mb-4 space-y-1">
                <h4 className="text-xl font-black bg-gradient-to-r from-[#FACC15] to-amber-300 bg-clip-text text-transparent leading-tight">Professional Suite</h4>
                <p className="text-[11px] text-gray-400 dark:text-[#94A3B8] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#FACC15]">schedule</span>
                  Renews Dec 31, 2026
                </p>
              </div>

              <div className="space-y-2.5 mb-5 pt-3 border-t border-gray-100 dark:border-[#2A2F45]/60">
                {[
                  'Full IPC & BNS Access',
                  'Unlimited Searches',
                  'Advanced Analytics',
                  'Priority Support',
                  'Export to PDF',
                ].map(feat => (
                  <div key={feat} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#10B981] text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-xs text-gray-400 dark:text-[#94A3B8] font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <button className="w-full h-9 rounded-lg bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#EAB308] hover:to-[#CA8A04] text-black text-xs font-bold shadow-md shadow-[#FACC15]/10 flex items-center justify-center gap-1.5 transition-all">
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                Manage Billing
              </button>
            </div>

            {/* ACCOUNT DETAILS */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100 dark:border-[#2A2F45]/60">
                <span className="material-symbols-outlined text-[#7C3AED] text-[18px]">account_circle</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">Account Details</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Account Role', value: roleName },
                  { label: 'Member Since', value: 'January 2026' },
                  { label: 'Current Plan', value: 'Professional Suite' },
                  { label: 'Plan Status', value: 'Active & Verified', highlight: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-gray-400 dark:text-[#94A3B8] font-medium">{item.label}</span>
                    <span className={`font-bold ${item.highlight ? 'text-[#10B981]' : 'text-gray-900 dark:text-white'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-[#2A2F45]/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3B82F6] text-[18px]">history</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Recent Activity</span>
                </div>
                <span className="text-xs font-bold text-[#3B82F6] hover:underline cursor-pointer">View All</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: 'Saved IPC Section 420', time: 'Today, 10:30 AM', icon: 'bookmark', color: '#FACC15' },
                  { title: 'Created a new note', time: 'Today, 09:15 AM', icon: 'edit_note', color: '#7C3AED' },
                  { title: 'Exported Constitution PDF', time: 'Yesterday, 04:45 PM', icon: 'picture_as_pdf', color: '#3B82F6' },
                  { title: 'Changed password', time: '20 May 2024', icon: 'lock', color: '#EF4444' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: act.color + '15' }}>
                      <span className="material-symbols-outlined text-[15px]" style={{ color: act.color, fontVariationSettings: "'FILL' 1" }}>{act.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight truncate">{act.title}</p>
                      <p className="text-[10px] text-gray-400 dark:text-[#94A3B8] mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
