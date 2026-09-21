import React, { useEffect, useState } from 'react';
import { getPaymentOverview, updatePayoutDetails, requestWithdrawal } from '../apis/paymentApi';
import Button from '../components/Button';
import { Banner, Field, SvgIcon } from '../components/ui';
import { PaymentsIllustration } from '../components/illustrations';
import { formatPaise } from '../utils/format';

const PaymentsPage = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutForm, setPayoutForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
  });
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const data = await getPaymentOverview();
      setPaymentData(data);
      if (data.payoutDetails) {
        setPayoutForm((prev) => ({
          ...prev,
          accountHolderName: data.payoutDetails.accountHolderName || '',
          bankName: data.payoutDetails.bankName || '',
          ifsc: data.payoutDetails.ifsc || '',
          upiId: data.payoutDetails.upiId || '',
        }));
      }
    } catch (err) {
      setError(err.message || 'Could not load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayout = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updatePayoutDetails(payoutForm);
      setMessage('Payout details saved.');
      await fetchPaymentData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save payout details');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdrawal = async () => {
    const rupees = parseFloat(withdrawalAmount);
    if (!rupees || rupees <= 0) {
      setError('Enter a valid withdrawal amount');
      return;
    }
    try {
      await requestWithdrawal(Math.round(rupees * 100));
      setMessage('Withdrawal requested.');
      setWithdrawalAmount('');
      await fetchPaymentData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request withdrawal');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" />
      </div>
    );
  }

  const wallet = paymentData?.wallet || {};
  const transactions = paymentData?.transactions || [];
  const withdrawals = paymentData?.withdrawals || [];
  const activity = [
    ...withdrawals.map((item) => ({ ...item, kind: 'withdrawal' })),
    ...transactions.map((item) => ({ ...item, kind: item.type === 'booking_payout' ? 'payout' : item.type })),
  ]
    .sort((a, b) => new Date(b.createdAt || b.requestedAt || 0) - new Date(a.createdAt || a.requestedAt || 0))
    .slice(0, 10);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="bm-kicker">Payments</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 md:text-[44px]">
            Track <span className="italic text-emerald-500">earnings</span>
            <br />
            and request
            <br />
            withdrawals.
          </h1>
          <p className="mt-3 max-w-xl text-slate-500">
            Customer payments land with the platform first. A 10% platform fee is deducted, then the remaining balance becomes available here.
          </p>
        </div>
        <PaymentsIllustration />
      </div>

      {error && <Banner>{error}</Banner>}
      {message && <Banner type="success">{message}</Banner>}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available" value={formatPaise(wallet.available)} tone="mint" />
        <StatCard label="Total earned" value={formatPaise(wallet.earned)} tone="violet" />
        <StatCard
          label="Pending payouts"
          value={formatPaise(wallet.pendingWithdrawals)}
          hint={`Paid out: ${formatPaise(wallet.paidWithdrawals)}`}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bm-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <SvgIcon name="download" className="h-5 w-5 text-violet-500" />
            Withdraw balance
          </h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">₹</span>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder={((wallet.available || 0) / 100).toFixed(2)}
                className="bm-input"
              />
            </div>
            <Button onClick={handleWithdrawal}>
              Request
            </Button>
          </div>
          <p className="mt-3 text-sm text-slate-400">Save payout details before requesting a withdrawal.</p>
        </div>

        <div className="bm-card p-6">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
            <SvgIcon name="wallet" className="h-5 w-5 text-violet-500" />
            Payout details
          </h2>
          <p className="mb-5 text-sm text-slate-500">
            We store only masked account information. Use Stripe Connect or a payout provider before moving real money in production.
          </p>
          <form onSubmit={handleSavePayout} className="space-y-4">
            <Field
              label="Account holder"
              value={payoutForm.accountHolderName}
              onChange={(e) => setPayoutForm({ ...payoutForm, accountHolderName: e.target.value })}
            />
            <Field
              label="Bank name"
              value={payoutForm.bankName}
              onChange={(e) => setPayoutForm({ ...payoutForm, bankName: e.target.value })}
            />
            <Field
              label="Account number"
              value={payoutForm.accountNumber}
              onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
              placeholder={paymentData?.payoutDetails?.accountLast4 ? `•••• ${paymentData.payoutDetails.accountLast4}` : ''}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="IFSC"
                value={payoutForm.ifsc}
                onChange={(e) => setPayoutForm({ ...payoutForm, ifsc: e.target.value })}
              />
              <Field
                label="UPI ID"
                value={payoutForm.upiId}
                onChange={(e) => setPayoutForm({ ...payoutForm, upiId: e.target.value })}
              />
            </div>
            <Button type="submit" fullWidth size="lg" loading={saving}>
              <SvgIcon name="save" className="h-4 w-4" />
              Save payout details
            </Button>
          </form>
        </div>
      </div>

      <div className="bm-card p-6">
        <h2 className="mb-5 text-lg font-bold text-slate-900">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((item, index) => {
              const isOut = item.kind === 'withdrawal';
              return (
                <div key={item._id || index} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isOut ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isOut ? '↗' : '↙'}
                    </div>
                    <p className="font-semibold text-slate-800">
                      {isOut ? 'Withdrawal requested' : `Booking payment`}
                    </p>
                  </div>
                  <p className={`font-bold ${isOut ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {isOut ? '-' : '+'}
                    {formatPaise(item.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, hint, tone }) => {
  const tones = {
    mint: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bm-card p-5">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
        <SvgIcon name="wallet" className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
};

export default PaymentsPage;
