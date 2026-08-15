import cron from 'node-cron';
import { runNightlySubscriptionSweep } from '../services/subscriptionService';

// Runs every night at midnight: expires lapsed subscriptions and sends 7-day-left reminders
cron.schedule('0 0 * * *', async () => {
  try {
    await runNightlySubscriptionSweep();
    console.log('Subscription sweep completed');
  } catch (err) {
    console.error('Subscription sweep failed:', err);
  }
});
