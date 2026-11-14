/**
 * VinoSphere EDA Service Unit Tests
 * =================================
 * Verifies EDA service methods, return structures, and data schemas.
 */

import { EDAService } from '../eda.service';

describe('EDAService', () => {
  let edaService: EDAService;
  const mockWineryId = '00000000-0000-4000-d000-000000000999';

  beforeEach(() => {
    edaService = new EDAService();
  });

  describe('getOverview', () => {
    it('should return overview summary and data quality assessment', async () => {
      const overview = await edaService.getOverview(mockWineryId);
      expect(overview).toBeDefined();
      expect(overview.summary).toBeDefined();
      expect(overview.summary.totalWines).toBeGreaterThanOrEqual(0);
      expect(overview.dataQuality).toBeDefined();
    });
  });

  describe('getWineDistribution', () => {
    it('should return wine categorical and continuous distributions', async () => {
      const distribution = await edaService.getWineDistribution(mockWineryId);
      expect(distribution).toBeDefined();
      expect(distribution.distributions).toBeDefined();
      expect(Array.isArray(distribution.distributions.wineType)).toBe(true);
      expect(Array.isArray(distribution.distributions.grapeVariety)).toBe(true);
    });
  });

  describe('getPriceEngagement', () => {
    it('should return price data points and summary stats', async () => {
      const priceEngagement = await edaService.getPriceEngagement(mockWineryId);
      expect(priceEngagement).toBeDefined();
      expect(priceEngagement.availability).toBeDefined();
      expect(Array.isArray(priceEngagement.dataPoints)).toBe(true);
    });
  });

  describe('getConversionFunnel', () => {
    it('should return funnel stages and stage conversions', async () => {
      const funnel = await edaService.getConversionFunnel(mockWineryId);
      expect(funnel).toBeDefined();
      expect(Array.isArray(funnel.stages)).toBe(true);
      expect(Array.isArray(funnel.conversions)).toBe(true);
    });
  });

  describe('getSeasonality', () => {
    it('should return daily, weekly, monthly, and day-of-week trends', async () => {
      const seasonality = await edaService.getSeasonality(mockWineryId);
      expect(seasonality).toBeDefined();
      expect(Array.isArray(seasonality.daily)).toBe(true);
      expect(Array.isArray(seasonality.weekly)).toBe(true);
      expect(Array.isArray(seasonality.monthly)).toBe(true);
      expect(Array.isArray(seasonality.dayOfWeek)).toBe(true);
    });
  });

  describe('getBookingAnalysis', () => {
    it('should return booking summary and status/experience breakdown', async () => {
      const bookingAnalysis = await edaService.getBookingAnalysis(mockWineryId);
      expect(bookingAnalysis).toBeDefined();
      expect(bookingAnalysis.summary).toBeDefined();
      expect(Array.isArray(bookingAnalysis.eventBreakdown)).toBe(true);
      expect(Array.isArray(bookingAnalysis.experienceBreakdown)).toBe(true);
    });
  });

  describe('getQualityAnalysis', () => {
    it('should return wine quality physicochemical dataset analysis', async () => {
      const qualityAnalysis = await edaService.getQualityAnalysis();
      expect(qualityAnalysis).toBeDefined();
      expect(qualityAnalysis.availability).toBeDefined();
    });
  });

  describe('getCorrelation', () => {
    it('should return correlation assessment and quality correlation matrix', async () => {
      const correlation = await edaService.getCorrelation(mockWineryId);
      expect(correlation).toBeDefined();
      expect(correlation.availability).toBeDefined();
    });
  });
});
