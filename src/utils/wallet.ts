/**
 * Wallet utility functions
 */

export interface WalletStats {
    availableBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
}

/**
 * Calculates the percentage of balance to withdraw
 */
export const calculateWithdrawalAmount = (balance: number, percentage: number): number => {
    if (percentage < 0 || percentage > 100) return 0;
    return Math.floor(balance * (percentage / 100) * 100) / 100;
};

/**
 * Validates a payout request amount
 */
export const validatePayoutAmount = (amount: number, availableBalance: number): { valid: boolean; error?: string } => {
    if (isNaN(amount) || amount <= 0) {
        return { valid: false, error: "Please enter a valid amount" };
    }
    if (amount > availableBalance) {
        return { valid: false, error: "Amount exceeds available balance" };
    }
    return { valid: true };
};

/**
 * Formats currency amount
 */
export const formatCurrency = (amount: number, locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
