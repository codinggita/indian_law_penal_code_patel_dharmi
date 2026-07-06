import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../../store/slices/authSlice';
import api from '../../../services/api';

/* ─── Reusable Toggle ────────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none shadow-inner ${
      checked
        ? 'bg-gradient-to-r from-[#7c4dff] to-[#a78bfa] shadow-[#7c4dff]/30 shadow-md'
        : 'bg-gray-200 dark:bg-[#2d3748]'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

/* ─── Styled Input Field ─────────────────────────────────────────────── */
const Field = ({ label, id, type = 'text', value, onChange, readOnly = false, placeholder = '', icon }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-xs font-semibold text-gray-500 dark:text-[#94a3b8] tracking-widest uppercase">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 dark:text-[#475569] group-focus-within:text-[#c9a84c] transition-colors text-[18px]">
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
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none font-medium ${
          readOnly
            ? 'bg-gray-50 dark:bg-[#0a0d11] border-gray-200 dark:border-white/[0.05] text-gray-400 dark:text-[#475569] cursor-not-allowed'
            : 'bg-white dark:bg-[#0d1117] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#334155] focus:border-[#c9a84c]/60 focus:ring-2 focus:ring-[#c9a84c]/20 hover:border-gray-300 dark:hover:border-white/20'
        }`}
      />
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loadingUser, setLoadingUser] = useState(!user);
  const [activeTab, setActiveTab] = useState('profile');

  /* Auto-fetch user */
  useEffect(() => {
    if (!user) {
      setLoadingUser(true);
      api.get('/auth/me')
        .then((res) => { if (res.data?.data) dispatch(setUser(res.data.data)); })
        .catch(() => {})
        .finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, [user, dispatch]);

  /* Profile form */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [barCouncil, setBarCouncil] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  /* Avatar */
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  /* Security form */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  /* Prefs */
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefAlerts, setPrefAlerts] = useState(true);
  const [prefMarketing, setPrefMarketing] = useState(false);

  /* Stats */
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);

  /* Sync user */
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setBarCouncil(user.barCouncil || '');
    }
  }, [user]);

  /* Stats */
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
      setSaveMsg('Profile updated successfully.');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      setSaveErr(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwErr(''); setPwMsg('');
    if (!currentPw || !newPw || !confirmPw) { setPwErr('All fields are required.'); return; }
    if (newPw.length < 6) { setPwErr('New password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setPwErr('Passwords do not match.'); return; }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      setPwMsg('Password updated successfully.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwMsg(''), 4000);
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Incorrect current password.');
    } finally {
      setPwLoading(false);
    }
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const activeUntil = 'Dec 31, 2026';
  const joinDate = 'January 2026';

  const stats = [
    { label: 'Bookmarks', value: bookmarkCount, icon: 'bookmark_added', color: '#c9a84c', bg: 'from-amber-500/10 to-amber-600/5' },
    { label: 'Notes', value: noteCount, icon: 'edit_document', color: '#7c4dff', bg: 'from-violet-500/10 to-violet-600/5' },
    { label: 'Plan', value: 'Pro', icon: 'workspace_premium', color: '#22c55e', bg: 'from-emerald-500/10 to-emerald-600/5' },
    { label: 'Status', value: 'Active', icon: 'verified_user', color: '#38bdf8', bg: 'from-sky-500/10 to-sky-600/5' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#07090c] text-gray-900 dark:text-white">
      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[340px] bg-gradient-to-br from-[#c9a84c]/10 via-[#7c4dff]/5 to-transparent dark:from-[#c9a84c]/[0.06] dark:via-[#7c4dff]/[0.04]" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#c9a84c]/[0.06] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-[-5%] w-[500px] h-[400px] bg-[#7c4dff]/[0.05] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 lg:px-8 pt-8 pb-20">

        {/* ── HERO HEADER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-[#0f1015]/80 border border-gray-200/60 dark:border-white/[0.07] backdrop-blur-2xl shadow-xl mb-8">
          {/* Gradient stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a84c] via-[#f0d074] to-[#7c4dff]" />

          {/* Banner area */}
          <div className="h-32 bg-gradient-to-br from-[#c9a84c]/15 via-[#7c4dff]/10 to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(201,168,76,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,168,76,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute right-12 top-4 w-24 h-24 rounded-full bg-[#c9a84c]/10 blur-2xl" />
            <div className="absolute left-1/3 bottom-0 w-32 h-20 rounded-full bg-[#7c4dff]/10 blur-2xl" />
          </div>

          <div className="px-8 pb-7 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-16">
              {/* Avatar */}
              <div className="flex items-end gap-5">
                <div
                  className="relative cursor-pointer group flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-[#0f1015] shadow-2xl group-hover:shadow-[#c9a84c]/20 transition-all duration-300">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#c9a84c] via-[#e6c364] to-[#7c4dff] flex items-center justify-center text-black text-3xl font-black select-none">
                        {initials}
                      </div>
                    )}
                  </div>
                  {/* Camera overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-white dark:border-[#0f1015] shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  {/* Upload input */}
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

                <div className="mb-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {user?.name || 'Legal Professional'}
                    </h1>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#c9a84c]/10 text-[#8f6d19] dark:text-[#c9a84c] border border-[#c9a84c]/25 rounded-full uppercase tracking-wider">
                      {user?.role === 'admin' ? 'Admin' : 'Pro'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-[#64748b]">{user?.email}</p>
                  <p className="text-xs text-gray-400 dark:text-[#475569] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                    Member since {joinDate}
                  </p>
                </div>
              </div>

              {/* Edit avatar button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-[#c9a84c]/10 border border-gray-200 dark:border-white/10 hover:border-[#c9a84c]/40 text-sm font-semibold text-gray-600 dark:text-[#94a3b8] hover:text-[#c9a84c] transition-all duration-200 self-end sm:self-auto"
              >
                <span className="material-symbols-outlined text-[16px]">drive_file_rename_outline</span>
                Edit Profile Photo
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-7 pt-6 border-t border-gray-200 dark:border-white/[0.06]">
              {stats.map(({ label, value, icon, color, bg }) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br ${bg} border border-gray-200/50 dark:border-white/5`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                    <p className="text-[11px] text-gray-500 dark:text-[#64748b]">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 mb-7 bg-white/70 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-1.5 backdrop-blur-xl w-fit shadow-sm">
          {[
            { key: 'profile', label: 'Personal Info', icon: 'person' },
            { key: 'security', label: 'Security', icon: 'lock' },
            { key: 'preferences', label: 'Preferences', icon: 'tune' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-gray-200/80 dark:border-white/10'
                  : 'text-gray-500 dark:text-[#64748b] hover:text-gray-700 dark:hover:text-[#94a3b8] hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT (Main Content) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white/80 dark:bg-[#0f1015]/80 border border-gray-200/60 dark:border-white/[0.07] backdrop-blur-2xl rounded-2xl overflow-hidden shadow-sm animate-fade-in">
                <div className="px-7 py-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#c9a84c] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-base">Personal Information</h2>
                    <p className="text-xs text-gray-500 dark:text-[#64748b]">Update your name and professional details</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="px-7 py-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                      label="First Name"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Arjun"
                      icon="badge"
                    />
                    <Field
                      label="Last Name"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Mehta"
                      icon="badge"
                    />
                  </div>
                  <Field
                    label="Email Address"
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    placeholder="your@email.com"
                    icon="alternate_email"
                  />
                  <Field
                    label="Bar Council Number"
                    id="barCouncil"
                    value={barCouncil}
                    onChange={(e) => setBarCouncil(e.target.value)}
                    placeholder="DEL/1234/2015 (Optional)"
                    icon="gavel"
                  />

                  {/* Alerts */}
                  {saveErr && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-[#ef4444]/10 border border-red-200 dark:border-[#ef4444]/20 rounded-xl text-red-600 dark:text-[#ef4444] text-sm font-medium">
                      <span className="material-symbols-outlined text-[17px]">error</span>{saveErr}
                    </div>
                  )}
                  {saveMsg && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 dark:bg-[#22c55e]/10 border border-emerald-200 dark:border-[#22c55e]/20 rounded-xl text-emerald-700 dark:text-[#22c55e] text-sm font-medium">
                      <span className="material-symbols-outlined text-[17px]">check_circle</span>{saveMsg}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-[#7c4dff] to-[#9c73ff] hover:from-[#6538e6] hover:to-[#8659e8] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-[#7c4dff]/25 hover:shadow-[#7c4dff]/40"
                    >
                      {saving ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">save</span>
                      )}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="bg-white/80 dark:bg-[#0f1015]/80 border border-gray-200/60 dark:border-white/[0.07] backdrop-blur-2xl rounded-2xl overflow-hidden shadow-sm animate-fade-in">
                <div className="px-7 py-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-base">Change Password</h2>
                    <p className="text-xs text-gray-500 dark:text-[#64748b]">Keep your account secure with a strong password</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="px-7 py-6 space-y-5">
                  <Field
                    label="Current Password"
                    id="currentPw"
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter your current password"
                    icon="key"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field
                      label="New Password"
                      id="newPw"
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Min. 6 characters"
                      icon="lock_reset"
                    />
                    <Field
                      label="Confirm New Password"
                      id="confirmPw"
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Repeat new password"
                      icon="lock_open"
                    />
                  </div>

                  {/* Password strength hint */}
                  {newPw && (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 flex-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            newPw.length >= i * 2
                              ? newPw.length >= 10 ? 'bg-emerald-500' : newPw.length >= 6 ? 'bg-amber-500' : 'bg-red-500'
                              : 'bg-gray-200 dark:bg-white/10'
                          }`} />
                        ))}
                      </div>
                      <span className={`text-xs font-semibold ${
                        newPw.length >= 10 ? 'text-emerald-500' : newPw.length >= 6 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {newPw.length >= 10 ? 'Strong' : newPw.length >= 6 ? 'Good' : 'Weak'}
                      </span>
                    </div>
                  )}

                  {pwErr && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-[#ef4444]/10 border border-red-200 dark:border-[#ef4444]/20 rounded-xl text-red-600 dark:text-[#ef4444] text-sm font-medium">
                      <span className="material-symbols-outlined text-[17px]">error</span>{pwErr}
                    </div>
                  )}
                  {pwMsg && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 dark:bg-[#22c55e]/10 border border-emerald-200 dark:border-[#22c55e]/20 rounded-xl text-emerald-700 dark:text-[#22c55e] text-sm font-medium">
                      <span className="material-symbols-outlined text-[17px]">check_circle</span>{pwMsg}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-[#c9a84c] to-[#e6c364] hover:from-[#b8963e] hover:to-[#d4b052] disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-[#c9a84c]/25"
                    >
                      {pwLoading ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                      )}
                      {pwLoading ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="bg-white/80 dark:bg-[#0f1015]/80 border border-gray-200/60 dark:border-white/[0.07] backdrop-blur-2xl rounded-2xl overflow-hidden shadow-sm animate-fade-in">
                <div className="px-7 py-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-violet-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-base">Notification Preferences</h2>
                    <p className="text-xs text-gray-500 dark:text-[#64748b]">Manage how and when you receive updates</p>
                  </div>
                </div>

                <div className="px-7 py-6 space-y-1">
                  {[
                    {
                      id: 'pref-email',
                      label: 'Email Digest',
                      desc: 'Receive daily legal case summaries and act updates',
                      icon: 'email',
                      color: '#38bdf8',
                      value: prefEmail,
                      setter: setPrefEmail,
                    },
                    {
                      id: 'pref-alerts',
                      label: 'Act Change Alerts',
                      desc: 'Notify when bookmarked sections are amended',
                      icon: 'notifications',
                      color: '#c9a84c',
                      value: prefAlerts,
                      setter: setPrefAlerts,
                    },
                    {
                      id: 'pref-marketing',
                      label: 'Product Updates',
                      desc: 'Promotional offers, webinars, and new features',
                      icon: 'campaign',
                      color: '#a855f7',
                      value: prefMarketing,
                      setter: setPrefMarketing,
                    },
                  ].map(({ id, label, desc, icon, color, value, setter }) => (
                    <div key={id} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '15' }}>
                          <span className="material-symbols-outlined text-[18px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                          <p className="text-xs text-gray-500 dark:text-[#64748b] mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <Toggle id={id} checked={value} onChange={setter} />
                    </div>
                  ))}
                </div>

                <div className="px-7 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/[0.04]">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#7c4dff] to-[#9c73ff] hover:from-[#6538e6] hover:to-[#8659e8] text-white font-bold text-sm rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-[#7c4dff]/25">
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-5">

            {/* Subscription Card */}
            <div className="relative bg-white/80 dark:bg-[#0f1015]/80 border border-gray-200/60 dark:border-white/[0.07] backdrop-blur-2xl rounded-2xl overflow-hidden shadow-sm">
              {/* Top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c9a84c] via-[#f0d074] to-[#c9a84c]" />
              {/* Glow orb */}
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#c9a84c]/[0.12] blur-[50px] rounded-full" />

              <div className="px-6 py-5 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#c9a84c] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Subscription</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    Active
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] to-[#f0d074]">Professional</p>
                  <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#c9a84c] to-[#f0d074] -mt-1">Suite</p>
                  <p className="text-xs text-gray-500 dark:text-[#64748b] font-mono mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-[#c9a84c]">schedule</span>
                    Active until {activeUntil}
                  </p>
                </div>

                <div className="space-y-2.5 mb-5 pb-5 border-b border-gray-100 dark:border-white/[0.05]">
                  {['Unlimited Act Searches', 'Advanced Analytics', 'Priority Support'].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#c9a84c] text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                      <span className="text-[13px] text-gray-600 dark:text-[#94a3b8]">{feat}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#e6c364] hover:from-[#b8963e] hover:to-[#d4b052] text-black font-bold text-sm rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-[#c9a84c]/20 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Manage Billing
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white/80 dark:bg-[#0f1015]/80 border border-gray-200/60 dark:border-white/[0.07] backdrop-blur-2xl rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#64748b]">Quick Actions</span>
              </div>
              <div className="p-3 space-y-1">
                {[
                  { label: 'My Notes', icon: 'edit_document', color: '#10b981', href: '/dashboard/notes' },
                  { label: 'Bookmarks', icon: 'bookmark', color: '#38bdf8', href: '/dashboard/bookmarks' },
                  { label: 'Browse Laws', icon: 'gavel', color: '#c9a84c', href: '/dashboard/browse' },
                ].map(({ label, icon, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '15' }}>
                      <span className="material-symbols-outlined text-[16px]" style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-[#94a3b8] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
                    <span className="material-symbols-outlined text-[14px] text-gray-400 dark:text-[#475569] ml-auto group-hover:translate-x-0.5 transition-transform">chevron_right</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white/80 dark:bg-[#0f1015]/80 border border-gray-200/60 dark:border-white/[0.07] backdrop-blur-2xl rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05]">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#64748b]">Account Info</span>
              </div>
              <div className="px-6 py-4 space-y-3">
                {[
                  { label: 'Role', value: user?.role === 'admin' ? 'Administrator' : 'Legal Professional' },
                  { label: 'Member Since', value: joinDate },
                  { label: 'Plan', value: 'Professional Suite' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-[#475569]">{label}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-[#94a3b8]">{value}</span>
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
