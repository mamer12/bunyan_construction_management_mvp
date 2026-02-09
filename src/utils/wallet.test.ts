import { describe, it, expect } from 'vitest';
import { calculateWithdrawalAmount, validatePayoutAmount, formatCurrency } from './wallet';

describe('Wallet Utilities', () => {
    describe('calculateWithdrawalAmount', () => {
        it('should calculate correct percentage of balance', () => {
            expect(calculateWithdrawalAmount(1000, 25)).toBe(250);
            expect(calculateWithdrawalAmount(1000, 50)).toBe(500);
            expect(calculateWithdrawalAmount(1000, 100)).toBe(1000);
        });

        it('should handle decimals correctly', () => {
            expect(calculateWithdrawalAmount(1000.50, 50)).toBe(500.25);
        });

        it('should return 0 for invalid percentages', () => {
            expect(calculateWithdrawalAmount(1000, -10)).toBe(0);
            expect(calculateWithdrawalAmount(1000, 110)).toBe(0);
        });
    });

    describe('validatePayoutAmount', () => {
        it('should validate correct amounts', () => {
            expect(validatePayoutAmount(500, 1000)).toEqual({ valid: true });
            expect(validatePayoutAmount(1000, 1000)).toEqual({ valid: true });
        });

        it('should reject non-positive amounts', () => {
            expect(validatePayoutAmount(0, 1000)).toEqual({ valid: false, error: "Please enter a valid amount" });
            expect(validatePayoutAmount(-100, 1000)).toEqual({ valid: false, error: "Please enter a valid amount" });
        });

        it('should reject amounts exceeding balance', () => {
            expect(validatePayoutAmount(1001, 1000)).toEqual({ valid: false, error: "Amount exceeds available balance" });
        });
    });

    describe('formatCurrency', () => {
        it('should format numbers correctly', () => {
            expect(formatCurrency(1000)).toBe('1,000');
            expect(formatCurrency(1000000)).toBe('1,000,000');
        });

        it('should handle different locales (optional)', () => {
            // Basic check for default locale
            const result = formatCurrency(1000);
            expect(typeof result).toBe('string');
        });
    });
});
