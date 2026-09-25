import { zeroFillDaily, type DateRange } from './date-range';
import { newUsersDaily } from './marketplace-health-repository';
import {
  activeAndReturningUsers,
  countNewSellersInRange,
  countNewUsersInRange,
  countSuspendedUsers,
  countTotalUsers,
} from './user-analytics-repository';

export async function getUserAnalytics(range: DateRange) {
  const [totalUsers, newUsers, suspendedUsers, newSellers, activity, newUsersRows] = await Promise.all([
    countTotalUsers(),
    countNewUsersInRange(range),
    countSuspendedUsers(),
    countNewSellersInRange(range),
    activeAndReturningUsers(range),
    newUsersDaily(range),
  ]);

  return {
    kpis: {
      totalUsers,
      newUsers,
      activeUsers: activity.activeUsers,
      newSellers,
      returningUsers: activity.returningUsers,
      suspendedUsers,
    },
    series: {
      newUsers: zeroFillDaily(newUsersRows, range),
    },
  };
}
