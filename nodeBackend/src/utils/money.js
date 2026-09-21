export const PLATFORM_FEE_RATE = 0.1;

export const calculatePlatformFee = (amount) => {
    const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
    const platformFee = Math.round(safeAmount * PLATFORM_FEE_RATE);
    const providerPayOut = Math.max(0, safeAmount - platformFee);
    return {
        platformFee,
        providerPayOut,
    }
}

export const formateMinerMoney = (amount , currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
    }).format((amount || 0) / 100);
}