export interface UserFactoryOptions {
    role?: string;
    countryCode?: string;
}
export interface VoucherFactoryOptions {
    amount?: number;
    expiresInDays?: number;
}
export declare const DataFactory: {
    user: (options?: UserFactoryOptions) => {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        countryCode: string;
    };
    voucher: (options?: VoucherFactoryOptions) => {
        code: string;
        amount: number;
        currency: string;
        expiresAt: string;
    };
    course: () => {
        id: string;
        title: string;
        durationMinutes: number;
        description: string;
    };
};
