import { format, parseISO } from 'date-fns';

export const groupTransactionsByMonth = <T extends { created_at: string }>(transactions: T[]) => {
  const groups: { [key: string]: T[] } = {};

  transactions.forEach((transaction) => {
    try {
      const date = parseISO(transaction.created_at);
      const monthYear = format(date, 'MMMM yyyy').toUpperCase();

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(transaction);
    } catch (error) {
      console.error('Error grouping transaction by month:', error, transaction);
    }
  });

  return groups;
};
