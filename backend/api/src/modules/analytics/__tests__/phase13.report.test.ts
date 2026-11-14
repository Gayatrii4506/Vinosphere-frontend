/**
 * Phase 13: Analytics Report Generation Test Suite
 * =================================================
 * Validates structured JSON reports, PDF generation, CSV generation, 
 * period filtering, zero-baseline safety, empty state truthfulness, 
 * winery data isolation, and Phase 12D demo winery report fidelity.
 */

import { ReportService } from '../report.service';
import { seedDemoDataset, resetDemoDataset, DEMO_WINERY_ID } from '../demoSeed';
import { supabaseAdmin as supabase } from '../../../config/supabase';

const EMPTY_WINERY_ID = '00000000-0000-4000-f000-000000000001';

describe('Phase 13: Analytics Report Generation', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await seedDemoDataset();
    await supabase.from('wineries').upsert([
      { id: EMPTY_WINERY_ID, name: 'Empty Report Winery', slug: 'empty-report-winery' }
    ], { onConflict: 'id' });
  }, 30000);

  afterAll(async () => {
    await seedDemoDataset();
    await supabase.from('wineries').delete().eq('id', EMPTY_WINERY_ID);
  }, 30000);

  // --------------------------------------------------------------------------
  // 1. Structured Report JSON & Demo Data Fidelity
  // --------------------------------------------------------------------------
  it('1. Generates structured JSON report with correct Phase 12D demo winery values', async () => {
    const report = await ReportService.generateReport(DEMO_WINERY_ID, 7);

    expect(report.winery.id).toBe(DEMO_WINERY_ID);
    expect(report.winery.isDemo).toBe(true);
    expect(report.period.periodDays).toBe(7);
    expect(report.period.label).toBe('Last 7 Days');

    // Executive Summary
    expect(report.executiveSummary.eventBookings.current).toBe(12);
    expect(report.executiveSummary.experienceBookings.current).toBe(9);
    expect(report.executiveSummary.corporateInquiries.current).toBe(4);
    expect(report.executiveSummary.totalGrossBookingValue.current).toBe(46300);

    // Event Performance
    expect(report.events.eventBookings.current).toBe(12);
    expect(report.events.eventCapacityUtilization.current).toBeCloseTo(54.67, 1);
    expect(report.events.eventGrossBookingValue.current).toBe(23300);

    // Experience Performance
    expect(report.experiences.experienceBookings.current).toBe(9);
    expect(report.experiences.experienceGrossBookingValue.current).toBe(23000);

    // Corporate Breakdown
    expect(report.corporate.statusBreakdown).toEqual({ pending: 1, approved: 2, rejected: 1 });
    expect(report.corporate.avgExpectedGuests).toBe(45.0);
    expect(report.corporate.disclaimer).toContain('Corporate inquiries represent business leads');

    // Gross Booking Value Breakdown
    expect(report.grossBookingValue.combinedGBV.current).toBe(46300);
    expect(report.grossBookingValue.disclaimer).toContain('Gross Booking Value represents eligible paid event');

    // Matrix Table & Recommendations
    expect(report.comparisonTable.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 2. Period Filtering (7d, 30d, 90d)
  // --------------------------------------------------------------------------
  it('2. Report respects 7d, 30d, and 90d analysis windows', async () => {
    const r7 = await ReportService.generateReport(DEMO_WINERY_ID, 7);
    const r30 = await ReportService.generateReport(DEMO_WINERY_ID, 30);
    const r90 = await ReportService.generateReport(DEMO_WINERY_ID, 90);

    expect(r7.period.label).toBe('Last 7 Days');
    expect(r30.period.label).toBe('Last 30 Days');
    expect(r90.period.label).toBe('Last 90 Days');
  });

  // --------------------------------------------------------------------------
  // 3. CSV Report Generation
  // --------------------------------------------------------------------------
  it('3. Generates valid CSV report with header row and backend metric data', async () => {
    const report = await ReportService.generateReport(DEMO_WINERY_ID, 7);
    const csv = ReportService.generateCSV(report);

    expect(csv).toContain('Category,Metric,Current Period,Previous Period,Absolute Change,Percentage Change');
    expect(csv).toContain('"Event Bookings"');
    expect(csv).toContain('"Total Gross Booking Value (GBV)"');
    expect(csv).toContain('"Gross Booking Value"');
  });

  // --------------------------------------------------------------------------
  // 4. PDF Report Generation
  // --------------------------------------------------------------------------
  it('4. Generates real binary PDF report with PDF header', async () => {
    const report = await ReportService.generateReport(DEMO_WINERY_ID, 7);
    const pdfBuffer = await ReportService.generatePDF(report);

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF'); // Valid PDF magic bytes
  });

  // --------------------------------------------------------------------------
  // 5. Zero Baseline Safety & Empty Winery Handling
  // --------------------------------------------------------------------------
  it('5. Empty winery produces truthful zero state without NaN or Infinity', async () => {
    const report = await ReportService.generateReport(EMPTY_WINERY_ID, 7);

    expect(report.executiveSummary.eventBookings.current).toBe(0);
    expect(report.executiveSummary.totalGrossBookingValue.current).toBe(0);
    expect(report.wineEngagement.insufficientDataNotice).toBe('Insufficient data for reliable trend analysis.');

    report.comparisonTable.forEach(row => {
      expect(row.percentageChange).not.toContain('NaN');
      expect(row.percentageChange).not.toContain('Infinity');
    });
  });

  // --------------------------------------------------------------------------
  // 6. Winery Data Isolation
  // --------------------------------------------------------------------------
  it('6. Report generator preserves strict winery isolation', async () => {
    const demoReport = await ReportService.generateReport(DEMO_WINERY_ID, 7);
    const emptyReport = await ReportService.generateReport(EMPTY_WINERY_ID, 7);

    expect(demoReport.grossBookingValue.combinedGBV.current).toBe(46300);
    expect(emptyReport.grossBookingValue.combinedGBV.current).toBe(0);
  });
});
