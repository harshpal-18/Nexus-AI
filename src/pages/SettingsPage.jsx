import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as Gear, Bell, Shield, Palette, Globe, Database } from 'lucide-react';

const sects = [
  { id: 'general', label: 'General', icon: Gear },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'data', label: 'Data', icon: Database },
];

function Toggle({ on, onChange }) {
  return <button onClick={() => onChange(!on)} className={`w-9 h-5 rounded-full transition-colors relative ${on ? 'bg-accent-blue' : 'bg-surface-500'}`}><div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${on ? 'left-[18px]' : 'left-[3px]'}`} /></button>;
}

function Row({ title, desc, children }) {
  return <div className="flex items-center justify-between py-3 border-b border-border last:border-0"><div><p className="text-sm text-text-primary">{title}</p>{desc && <p className="text-xs text-text-muted mt-0.5">{desc}</p>}</div>{children}</div>;
}

export default function SettingsPage() {
  const [sec, setSec] = useState('general');
  const [s, setS] = useState({ darkMode: true, compact: false, lang: 'en', tz: 'UTC+5:30', email: true, push: true, sms: false, ai: true, weekly: true, color: '#2563EB', anim: true, tfa: false, bio: false, enc: true, gcal: true, outlook: false, slack: false, github: true, backup: true, offline: true });
  const u = (k, v) => setS(p => ({ ...p, [k]: v }));

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-text-primary tracking-tight">Settings</h1>
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-48 flex-shrink-0"><div className="card p-1.5 space-y-0.5">{sects.map(x => (
          <button key={x.id} onClick={() => setSec(x.id)} className={`nav-item w-full ${sec === x.id ? 'active' : ''}`}><x.icon size={15} /><span className="text-xs">{x.label}</span></button>
        ))}</div></div>
        <div className="flex-1">
          <motion.div key={sec} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5">
            {sec === 'general' && (<><h2 className="text-sm font-semibold text-text-primary mb-4">General</h2>
              <Row title="Language" desc="Display language"><select value={s.lang} onChange={e => u('lang', e.target.value)} className="input !w-28 !py-1 !text-xs"><option value="en">English</option><option value="hi">Hindi</option></select></Row>
              <Row title="Timezone"><select value={s.tz} onChange={e => u('tz', e.target.value)} className="input !w-28 !py-1 !text-xs"><option>UTC+5:30</option><option>UTC</option></select></Row>
              <Row title="Compact Mode" desc="Reduce spacing"><Toggle on={s.compact} onChange={v => u('compact', v)} /></Row>
            </>)}
            {sec === 'notifications' && (<><h2 className="text-sm font-semibold text-text-primary mb-4">Notifications</h2>
              {[['email','Email','Task reminders'],['push','Push','Browser notifications'],['sms','SMS','Text reminders'],['ai','AI Insights','Suggestions'],['weekly','Weekly Report','Analytics email']].map(([k,t,d]) => (
                <Row key={k} title={t} desc={d}><Toggle on={s[k]} onChange={v => u(k, v)} /></Row>
              ))}
            </>)}
            {sec === 'appearance' && (<><h2 className="text-sm font-semibold text-text-primary mb-4">Appearance</h2>
              <div className="py-3 border-b border-border"><p className="text-sm text-text-primary mb-2.5">Accent Color</p><div className="flex gap-2">
                {['#2563EB','#22C55E','#8B5CF6','#EF4444','#F59E0B'].map(c => <button key={c} onClick={() => u('color', c)} className={`w-6 h-6 rounded-full ${s.color === c ? 'ring-2 ring-offset-2 ring-offset-surface-100' : ''}`} style={{ background: c, '--tw-ring-color': c }} />)}
              </div></div>
              <Row title="Animations" desc="Smooth transitions"><Toggle on={s.anim} onChange={v => u('anim', v)} /></Row>
            </>)}
            {sec === 'privacy' && (<><h2 className="text-sm font-semibold text-text-primary mb-4">Privacy</h2>
              {[['tfa','Two-Factor','Extra security'],['bio','Biometric','Face/fingerprint'],['enc','Encryption','E2E encryption']].map(([k,t,d]) => (
                <Row key={k} title={t} desc={d}><Toggle on={s[k]} onChange={v => u(k, v)} /></Row>
              ))}
              <button className="btn-secondary !py-1.5 !text-xs mt-3">Change Password</button>
            </>)}
            {sec === 'integrations' && (<><h2 className="text-sm font-semibold text-text-primary mb-4">Integrations</h2>
              {[['gcal','Google Calendar','📅','Calendar sync'],['outlook','Outlook','📧','Microsoft'],['slack','Slack','💬','Notifications'],['github','GitHub','🐙','Link commits']].map(([k,t,e,d]) => (
                <Row key={k} title={<span className="flex items-center gap-2"><span>{e}</span>{t}</span>} desc={d}><Toggle on={s[k]} onChange={v => u(k, v)} /></Row>
              ))}
            </>)}
            {sec === 'data' && (<><h2 className="text-sm font-semibold text-text-primary mb-4">Data</h2>
              <Row title="Auto Backup" desc="Daily cloud backup"><Toggle on={s.backup} onChange={v => u('backup', v)} /></Row>
              <Row title="Offline Mode" desc="Work without internet"><Toggle on={s.offline} onChange={v => u('offline', v)} /></Row>
              <div className="flex gap-2 mt-3"><button className="btn-secondary !py-1.5 !text-xs">Export Data</button><button className="btn-ghost !text-xs text-accent-red">Delete Account</button></div>
            </>)}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
