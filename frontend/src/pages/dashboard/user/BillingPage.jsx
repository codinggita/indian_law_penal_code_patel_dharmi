import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BillingPage() {
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-0701', date: 'Jul 01, 2026', desc: 'Professional Suite - Monthly subscription', amount: '$19.00', status: 'Paid' },
    { id: 'INV-2026-0601', date: 'Jun 01, 2026', desc: 'Professional Suite - Monthly subscription', amount: '$19.00', status: 'Paid' },
    { id: 'INV-2026-0501', date: 'May 01, 2026', desc: 'Professional Suite - Monthly subscription', amount: '$19.00', status: 'Paid' },
    { id: 'INV-2026-0401', date: 'Apr 01, 2026', desc: 'Professional Suite - Trial activation', amount: '$0.00', status: 'Paid' }
  ]);

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white font-sans selection:bg-[#7C3AED]/30 pb-20">
      
      <div className="max-w-[960px] mx-auto px-4 lg:px-8 pt-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#94A3B8] font-medium mb-3">
          <Link to="/dashboard" className="hover:text-[#c9a84c] transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span className="text-gray-900 dark:text-white font-semibold">Billing & Subscriptions</span>
        </div>

        {/* Title Block */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#FACC15]">payments</span>
            Billing & Subscriptions
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-0.5">Manage your plans, invoice receipts, and active subscription details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Active Plan Card */}
          <div className="md:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider">Active Plan</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
            
            <div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-amber-500">Professional Suite</h3>
              <p className="text-xs text-gray-500 dark:text-[#94A3B8] mt-1">Complete platform access for independent practitioners and legal advisors.</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-150 dark:border-[#2A2F45]/60 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Renewal Date</p>
                <p className="font-bold text-gray-800 dark:text-white mt-0.5">Dec 31, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-medium">Pricing</p>
                <p className="font-bold text-gray-800 dark:text-white mt-0.5">$19.00 / month</p>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#2A2F45] rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-500 dark:text-[#94A3B8] uppercase tracking-wider block">Payment Method</span>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-500 italic text-[11px]">
                  VISA
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Visa ending in 4242</p>
                  <p className="text-[10px] text-gray-400 dark:text-[#94A3B8] mt-0.5">Expires 12/2028</p>
                </div>
              </div>
            </div>

            <button className="w-full h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#1F2937] dark:hover:bg-[#374151] text-gray-700 dark:text-white text-xs font-semibold border border-gray-200 dark:border-[#2A2F45] transition-all">
              Update Card
            </button>
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
                      <button className="h-7 px-2.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-gray-200 dark:border-[#2A2F45] text-[10px] font-bold text-gray-700 dark:text-white flex items-center justify-center gap-1 ml-auto">
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
