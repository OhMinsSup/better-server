export const RateLimiterStrategy = {
  FivePerMinute: {
    ttl: 60,
    limit: 5,
  },
  TenPerMinute: {
    ttl: 60,
    limit: 10,
  },
  OneHundredPerMinute: {
    ttl: 60,
    limit: 100,
  },
  OneThousandPerHour: {
    ttl: 3600,
    limit: 1000,
  },
  TenPerHour: {
    ttl: 3600,
    limit: 10,
  },
  FivePerHour: {
    ttl: 3600,
    limit: 5,
  },
};
