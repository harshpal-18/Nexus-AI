import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Users, UserPlus, CheckCircle2, X, Mail, Send, AlertCircle } from 'lucide-react';

export default function WorkspacePage() {
  const { teamMembers, tasks } = useApp();
  const [tab, setTab] = useState('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [invited, setInvited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setLoading(true);
    setError('');

    try {
      await emailjs.send(
        'service_y0e6vfn',    // ← replace with your EmailJS Service ID
        'template_hqkau38',   // ← replace with your EmailJS Template ID
        {
          to_email: inviteEmail,
          role: inviteRole,
          from_name: 'NexusAI',
        },
        'WU-SsX5iMH-dmQGzW'     // ← replace with your EmailJS Public Key
      );

      setInvited(true);
      setTimeout(() => {
        setInvited(false);
        setInviteEmail('');
        setInviteRole('member');
        setShowInviteModal(false);
      }, 1800);

    } catch (err) {
      setError('Failed to send invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">Team</h1>
          <p className="text-sm text-text-muted">{teamMembers.length} members</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary !py-1.5 flex items-center gap-1.5 !text-xs self-start"
        >
          <UserPlus size={14} /> Invite
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {[{ id: 'members', label: 'Members', icon: Users }, { id: 'tasks', label: 'Tasks', icon: CheckCircle2 }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs ${tab === t.id ? 'bg-surface-300 text-text-primary' : 'text-text-muted'}`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Members Grid */}
      {tab === 'members' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamMembers.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="card-hover p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-surface-400 flex items-center justify-center text-base">{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{m.name}</p>
                  <p className="text-xs text-text-muted">{m.role}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${m.status === 'online' ? 'bg-accent-green' : m.status === 'away' ? 'bg-amber-500' : 'bg-text-muted'}`} />
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{m.tasksCompleted} completed</span>
                <span className="capitalize">{m.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tasks List */}
      {tab === 'tasks' && (
        <div className="space-y-1.5">
          {tasks.slice(0, 5).map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200/40 transition-colors">
              <div className={`w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center ${t.status === 'done' ? 'bg-accent-green/20 border-accent-green' : 'border-text-muted'}`}>
                {t.status === 'done' && <CheckCircle2 size={10} className="text-accent-green" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{t.title}</p>
              </div>
              <div className="text-base">{teamMembers[i % teamMembers.length]?.avatar}</div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowInviteModal(false); setError(''); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-surface-100 border border-surface-300 rounded-xl p-6 w-full max-w-md shadow-xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">Invite teammate</h2>
                  <p className="text-xs text-text-muted mt-0.5">Send an invite link via email</p>
                </div>
                <button
                  onClick={() => { setShowInviteModal(false); setError(''); }}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Email Input */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Email address</label>
                  <div className="flex items-center gap-2 bg-surface-200 border border-surface-300 rounded-lg px-3 py-2">
                    <Mail size={14} className="text-text-muted shrink-0" />
                    <input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => { setInviteEmail(e.target.value); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                      className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-full"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Role Select */}
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-surface-200 border border-surface-300 rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle size={13} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { setShowInviteModal(false); setError(''); }}
                  className="flex-1 px-4 py-2 rounded-lg text-sm text-text-muted border border-surface-300 hover:bg-surface-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || invited || loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 !py-2 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {invited ? (
                    <><CheckCircle2 size={14} /> Invited!</>
                  ) : loading ? (
                    <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={14} /> Send Invite</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}