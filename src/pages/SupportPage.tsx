import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  LifeBuoy,
  MessageSquare,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  ChevronDown,
  Star,
  Search,
} from 'lucide-react';
import { SupportTicket, FAQ } from '../types';

interface SupportPageProps {
  setCurrentTab: (tab: string) => void;
  initialTab?: 'tickets' | 'faq';
}

export const SupportPage: React.FC<SupportPageProps> = ({ setCurrentTab, initialTab = 'tickets' }) => {
  const { user, customer } = useAuth();
  const [activeView, setActiveView] = useState<'tickets' | 'faq'>(initialTab);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  useEffect(() => {
    if (initialTab) setActiveView(initialTab);
  }, [initialTab]);

  // New Ticket Form
  const [name, setName] = useState(customer?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('عام');
  const [message, setMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Selected Ticket View
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadData = () => {
    api.getFAQs().then(setFaqs).catch(() => {});
    if (user) {
      api.getSupportTickets().then(setTickets).catch(() => {});
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createSupportTicket({
        name,
        phone,
        email,
        subject,
        category,
        message,
        customerId: customer?.id,
      });
      setTicketSuccess(res.message);
      setSubject('');
      setMessage('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    try {
      const updated = await api.addSupportMessage(selectedTicket.id, replyText);
      setSelectedTicket(updated);
      setReplyText('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">خدمة العملاء والدعم الفني</span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">مركز الدعم والمساعدة</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            نحن هنا لمساعدتك على مدار الساعة في أي استفسار يخص كارتك، رصيد نقاطك، أو شراكتك التجارية
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-[#0c101c] p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveView('tickets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'tickets'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>تذاكر الدعم</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('faq')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'faq'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>الأسئلة الشائعة FAQ</span>
          </button>
        </div>
      </div>

      {/* Contact Quick Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c101c] border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">الاتصال المباشر</span>
            <strong className="text-white text-sm font-mono">01026541250</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101c] border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">البريد الإلكتروني</span>
            <strong className="text-white text-sm font-mono">support@sugarbusiness.com</strong>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101c] border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-xs block">ساعات العمل</span>
            <strong className="text-white text-sm">يومياً من 9 ص حتى 11 م</strong>
          </div>
        </div>
      </div>

      {/* Grid: Tickets & Form */}
      {activeView === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Form / Create Ticket */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <span>فتح تذكرة دعم فني جديدة</span>
          </h3>

          {ticketSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="leading-relaxed">{ticketSuccess}</p>
              <button
                type="button"
                onClick={() => setTicketSuccess(null)}
                className="py-1.5 px-4 rounded-xl bg-slate-900 text-white text-xs"
              >
                إرسال تذكرة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">الاسم</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">تصنيف الاستفسار</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                >
                  <option value="النقاط والمكافآت">النقاط والمكافآت</option>
                  <option value="الكروت الذكية">الكروت الذكية ورمز الـ QR</option>
                  <option value="المتجر والشحن">المتجر وطلبات الشحن</option>
                  <option value="الشركاء والتجار">شراكات الأعمال والتجار</option>
                  <option value="عام">استفسار عام</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">موضوع التذكرة</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="عنوان مختصر..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">التفاصيل والرسالة</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="يرجى كتابة التفاصيل بدقة لمساعدتنا على حل المشكلة سريعاً..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'جاري الإرسال...' : 'إرسال التذكرة'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Existing Tickets */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <LifeBuoy className="w-4 h-4 text-sky-400" />
            <span>تذاكري السابقة ({tickets.length})</span>
          </h3>

          {selectedTicket ? (
            <div className="space-y-4 text-xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="font-mono text-sky-300 font-bold">{selectedTicket.ticketNumber}</span>
                  <h4 className="font-bold text-white text-sm">{selectedTicket.subject}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:underline"
                >
                  العودة للقائمة
                </button>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(selectedTicket.messages || []).map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl ${
                      m.sender === 'SUPPORT'
                        ? 'bg-sky-950/60 border border-sky-500/30 text-sky-200'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between font-semibold text-[10px] text-slate-400 mb-1">
                      <span>{m.senderName}</span>
                      <span className="font-mono">{new Date(m.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك..."
                  required
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs text-right"
                />
                <button type="submit" className="py-2 px-4 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs">
                  إرسال
                </button>
              </form>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {(!tickets || tickets.length === 0) ? (
                <p className="text-xs text-slate-500 py-8 text-center">لا توجد تذاكر دعم مسجلة حتى الآن.</p>
              ) : (
                (tickets || []).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/40 p-2 rounded-xl transition-colors"
                  >
                    <div>
                      <span className="font-mono text-[10px] text-sky-400 font-bold">{t.ticketNumber}</span>
                      <h4 className="text-xs font-bold text-white">{t.subject}</h4>
                      <span className="text-[10px] text-slate-500">{t.category}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      {t.status === 'RESOLVED' ? 'تم الحل' : 'قيد المتابعة'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* ================= FAQ SECTION (SECTION 81) ================= */}
      {activeView === 'faq' && (
      <div className="p-6 sm:p-10 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <span>الأسئلة الشائعة FAQ</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">إجابات سريعة ومفصلة عن كافة تفاصيل المنظومة</p>
          </div>

          <div className="relative sm:w-64">
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="ابحث في الأسئلة..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white text-right focus:border-sky-400"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full p-4 text-right flex items-center justify-between gap-4 hover:text-sky-300 transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-white">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
};
