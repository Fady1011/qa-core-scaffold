import { faker } from "@faker-js/faker";

export interface UserFactoryOptions {
  role?: string;
  countryCode?: string;
}

export interface VoucherFactoryOptions {
  amount?: number;
  expiresInDays?: number;
}

export const DataFactory = {
  user: (options: UserFactoryOptions = {}) => ({
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    role: options.role ?? faker.person.jobType(),
    countryCode: options.countryCode ?? faker.location.countryCode("alpha-2")
  }),
  voucher: (options: VoucherFactoryOptions = {}) => ({
    code: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
    amount: options.amount ?? faker.number.int({ min: 5, max: 500 }),
    currency: faker.finance.currencyCode(),
    expiresAt: faker.date.soon({ days: options.expiresInDays ?? 30 }).toISOString()
  }),
  course: () => ({
    id: faker.string.uuid(),
    title: faker.person.jobTitle(),
    durationMinutes: faker.number.int({ min: 15, max: 480 }),
    description: faker.lorem.paragraph()
  })
};
