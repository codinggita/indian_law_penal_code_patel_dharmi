import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BillingPage() {
  const [selectedMethod, setSelectedMethod] = useState('card'); // 'upi', 'bank', 'card'
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [upiId, setUpiId] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-0701', date: 'Jul 01, 2026', desc: 'Professional Suite - Monthly subscription', amount: '$19.00', status: 'Paid' },
    { id: 'INV-2026-0601', date: 'Jun 01, 2026', desc: 'Professional Suite - Monthly subscription', amount: '$19.00', status: 'Paid' },
    { id: 'INV-2026-0501', date: 'May 01, 2026', desc: 'Professional Suite - Monthly subscription', amount: '$19.00', status: 'Paid' }
  ]);

  const handleVerifyUpi = () => {
    if (!upiId.trim()) return;
    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setUpiVerified(true);
    }, 1200);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(true);
      const txId = 'TXN_' + Math.floor(1000000000 + Math.random() * 9000000000);
      setReferenceId(txId);
      
      // Append new invoice
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      setInvoices(prev => [
        {
          id: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
          date: today,
          desc: 'Professional Suite - Subscription Renewal',
          amount: '$19.00',
          status: 'Paid'
        },
        ...prev
      ]);
    }, 1800);
  };

  const downloadInvoicePDF = (inv) => {
    const content = `BT
/F1 16 Tf
50 750 Td
(LEXINDIA LEGAL RESEARCH PLATFORM) Tj
0 -40 Td
/F1 12 Tf
(INVOICE RECEIPT) Tj
0 -30 Td
(Invoice ID: ${inv.id}) Tj
0 -20 Td
(Billing Date: ${inv.date}) Tj
0 -20 Td
(Description: ${inv.desc}) Tj
0 -20 Td
(Amount Paid: ${inv.amount}) Tj
0 -20 Td
(Payment Status: ${inv.status}) Tj
0 -50 Td
/F1 10 Tf
(Thank you for subscribing to LexIndia Professional Suite!) Tj
0 -15 Td
(For billing support, email: billing@lexindia.com) Tj
ET`;

    const doc = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 595.27 841.89] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length ${content.length} >>
stream
${content}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
0000000301 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;

    const blob = new Blob([doc], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inv.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white font-sans selection:bg-[#7C3AED]/30 pb-20">
      
      <div className="max-w-[960px] mx-auto px-4 lg:px-8 pt-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#94A3B8] font-medium mb-3">
          <Link to="/dashboard" className="hover:text-[#c9a84c] transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span className="text-gray-900 dark:text-white font-semibold">Billing & Checkout</span>
        </div>

        {/* Title Block */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#FACC15]">credit_card</span>
            Secure Billing Portal
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">Select a payment option below to manage or upgrade your subscription plan</p>
        </div>

        {/* Checkout & Plan Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* LEFT 7 cols: Payment Option Selection */}
          <div className="lg:col-span-8 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl p-6 shadow-sm space-y-6">
            
            {paymentSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-[#10B981]/15 text-[#10B981] rounded-full flex items-center justify-center mx-auto border border-[#10B981]/30">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-950 dark:text-white">Subscription Active!</h3>
                  <p className="text-xs text-[#10B981] font-semibold">Plan: Professional Suite ($19.00 / month)</p>
                </div>
                
                <div className="bg-gray-55 dark:bg-[#09090B] border border-gray-150 dark:border-[#2A2F45]/60 rounded-xl p-4 max-w-sm mx-auto text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reference ID:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{referenceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Mode:</span>
                    <span className="font-semibold text-gray-900 dark:text-white uppercase">{selectedMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Billing Date:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">Just now</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPaymentSuccess(false);
                    setUpiVerified(false);
                    setUpiId('');
                  }}
                  className="px-6 h-9 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-semibold text-white shadow transition-all"
                >
                  Back to Billing
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-6">
                
                {/* Method selector tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
                    Choose Payment Option
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'card', name: 'Credit Card', icon: 'credit_card' },
                      { id: 'upi', name: 'UPI / QR', icon: 'qr_code' },
                      { id: 'bank', name: 'Net Banking', icon: 'account_balance' }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                          selectedMethod === method.id
                            ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED] dark:text-[#a78bfa] font-bold'
                            : 'bg-transparent border-gray-200 dark:border-[#2A2F45] text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg mb-1">{method.icon}</span>
                        <span className="text-[11px] leading-none">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card input panel */}
                {selectedMethod === 'card' && (
                  <div className="space-y-4 pt-2 border-t border-gray-150 dark:border-[#2A2F45]/60 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="Dhruva Patel"
                        className="w-full px-3.5 h-10 bg-transparent border border-gray-200 dark:border-[#2A2F45] rounded-lg text-sm text-gray-950 dark:text-white placeholder-slate-400 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength="19"
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4242 4242 4242 4242"
                          className="w-full pl-3.5 pr-10 h-10 bg-transparent border border-gray-200 dark:border-[#2A2F45] rounded-lg text-sm text-gray-950 dark:text-white placeholder-slate-400 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">credit_card</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase">Expiry Date</label>
                        <input
                          type="text"
                          required
                          maxLength="5"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className="w-full px-3.5 h-10 bg-transparent border border-gray-200 dark:border-[#2A2F45] rounded-lg text-sm text-gray-950 dark:text-white placeholder-slate-400 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 outline-none text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength="3"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="123"
                          className="w-full px-3.5 h-10 bg-transparent border border-gray-200 dark:border-[#2A2F45] rounded-lg text-sm text-gray-950 dark:text-white placeholder-slate-400 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI / QR Panel */}
                {selectedMethod === 'upi' && (
                  <div className="space-y-5 pt-2 border-t border-gray-150 dark:border-[#2A2F45]/60 animate-fade-in text-center">
                    
                    {/* QR Code SVG layout */}
                    <div className="max-w-[150px] mx-auto p-3 bg-white border border-gray-200 rounded-xl shadow-inner">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                        {/* Mock QR Code Pattern */}
                        <path d="M5,5 h25 v25 h-25 z M70,5 h25 v25 h-25 z M5,70 h25 v25 h-25 z" fill="currentColor" />
                        <path d="M12,12 h11 v11 h-11 z M77,12 h11 v11 h-11 z M12,77 h11 v11 h-11 z" fill="white" />
                        <path d="M40,5 h5 v30 h-5 z M50,15 h10 v5 h-10 z M60,30 h10 v5 h-10 z M35,45 h25 v5 h-25 z" fill="currentColor" />
                        <path d="M5,40 h15 v5 h-15 z M45,70 h5 v25 h-5 z M55,80 h25 v5 h-25 z M85,45 h10 v15 h-10 z" fill="currentColor" />
                        <path d="M42,42 h16 v16 h-16 z" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Scan UPI QR Code</p>
                      <p className="text-[10px] text-gray-450 dark:text-[#94A3B8]">Supports Google Pay, PhonePe, Paytm, and BHIM</p>
                    </div>

                    <div className="relative max-w-sm mx-auto pt-2 border-t border-gray-100 dark:border-[#2A2F45]/40">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="Enter UPI ID (e.g. name@upi)"
                          className="flex-1 px-3.5 h-10 bg-transparent border border-gray-200 dark:border-[#2A2F45] rounded-lg text-sm text-gray-955 dark:text-white placeholder-slate-400 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyUpi}
                          disabled={isVerifyingUpi}
                          className="px-4 h-10 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-xs font-bold text-white rounded-lg transition-colors whitespace-nowrap"
                        >
                          {isVerifyingUpi ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                      {upiVerified && (
                        <p className="text-left text-[11px] text-[#10B981] font-semibold mt-1.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          Verified Account
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Net Banking Panel */}
                {selectedMethod === 'bank' && (
                  <div className="space-y-5 pt-2 border-t border-gray-150 dark:border-[#2A2F45]/60 animate-fade-in">
                    
                    {/* Bank selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase">Select Your Bank</label>
                      <select
                        value={selectedBank}
                        onChange={e => setSelectedBank(e.target.value)}
                        className="w-full px-3 h-10 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-lg text-sm text-gray-950 dark:text-white focus:border-[#7C3AED] outline-none"
                      >
                        <option value="SBI">State Bank of India (SBI)</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="AXIS">Axis Bank</option>
                      </select>
                    </div>

                    {/* Show static Bank transfer details */}
                    <div className="bg-gray-50 dark:bg-[#09090B] border border-gray-200 dark:border-[#2A2F45]/80 rounded-xl p-4.5 space-y-3 text-xs">
                      <div className="flex justify-between border-b border-gray-200/50 dark:border-[#2A2F45]/50 pb-2">
                        <span className="text-gray-400 font-medium">Beneficiary Name</span>
                        <span className="font-bold text-gray-800 dark:text-white">LexIndia Tech Private Ltd</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/50 dark:border-[#2A2F45]/50 pb-2">
                        <span className="text-gray-400 font-medium">Bank Name</span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          {selectedBank === 'SBI' && 'State Bank of India'}
                          {selectedBank === 'HDFC' && 'HDFC Bank Ltd'}
                          {selectedBank === 'ICICI' && 'ICICI Bank Ltd'}
                          {selectedBank === 'AXIS' && 'Axis Bank Ltd'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/50 dark:border-[#2A2F45]/50 pb-2">
                        <span className="text-gray-400 font-medium">Account Number</span>
                        <span className="font-mono font-bold text-gray-800 dark:text-white">39485720194</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">IFSC Code</span>
                        <span className="font-mono font-bold text-gray-800 dark:text-white">
                          {selectedBank === 'SBI' && 'SBIN0001042'}
                          {selectedBank === 'HDFC' && 'HDFC0000060'}
                          {selectedBank === 'ICICI' && 'ICIC0000007'}
                          {selectedBank === 'AXIS' && 'UTIB0000245'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form CTA action button */}
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="w-full h-11 bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#EAB308] hover:to-[#CA8A04] text-black text-sm font-bold shadow-md shadow-[#FACC15]/10 flex items-center justify-center gap-1.5 transition-all rounded-lg active:scale-98"
                >
                  {paymentLoading ? (
                    <><span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>Processing Payment...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">verified_user</span>Pay & Activate Plan ($19.00)</>
                  )}
                </button>

              </form>
            )}

          </div>

          {/* RIGHT 5 cols: Order Invoice Summary */}
          <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider pb-3 border-b border-gray-150 dark:border-[#2A2F45]/60">Order Summary</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-[#94A3B8]">Professional Suite</span>
                <span className="font-semibold text-gray-900 dark:text-white">$19.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-[#94A3B8]">GST (18%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">$3.42</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 dark:border-[#2A2F45]/40 pt-3 text-sm font-extrabold">
                <span className="text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-amber-500">$22.42</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-[#2A2F45]/40 space-y-2.5">
              <p className="text-[10px] text-gray-400 dark:text-[#94A3B8] leading-normal">
                By purchasing, you agree to LexIndia's subscription terms. Subscriptions are billed monthly and renew automatically.
              </p>
              <div className="flex items-center gap-1.5 text-[#10B981] text-[10px] font-bold">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                256-Bit SSL Encrypted Connection
              </div>
            </div>
          </div>

        </div>

        {/* Invoice History List */}
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-150 dark:border-[#2A2F45]/60">
            <span className="material-symbols-outlined text-[#7C3AED] text-lg">receipt</span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Invoice History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-400 dark:text-slate-500 font-bold border-b border-gray-150 dark:border-[#2A2F45]/60 pb-2">
                  <th className="py-2.5">Invoice ID</th>
                  <th className="py-2.5">Billing Date</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2A2F45]/40 text-gray-700 dark:text-slate-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3 font-semibold text-gray-900 dark:text-white">{inv.id}</td>
                    <td className="py-3">{inv.date}</td>
                    <td className="py-3 font-medium text-gray-500 dark:text-slate-400">{inv.desc}</td>
                    <td className="py-3 font-bold text-gray-900 dark:text-white">{inv.amount}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] font-bold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => downloadInvoicePDF(inv)}
                        className="h-7 px-2.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-gray-200 dark:border-[#2A2F45] text-[10px] font-bold text-gray-700 dark:text-white flex items-center justify-center gap-1 ml-auto"
                      >
                        <span className="material-symbols-outlined text-[12px]">download</span>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
