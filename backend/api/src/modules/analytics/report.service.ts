// Safe import for PDFDocument
const PDFDocument: any = (() => {
  try {
    return require('pdfkit');
  } catch {
    return class DummyPDF {};
  }
})();
import { supabaseAdmin as supabase } from '../../config/supabase';
import { AnalyticsService } from './analytics.service';
import { RecommendationService } from './recommendation.service';
import { DEMO_WINERY_ID, DEMO_WINERY_NAME } from './demoSeed';

const analyticsService = new AnalyticsService();

export interface AnalyticsReportData {
  winery: {
    id: string;
    name: string;
    slug?: string;
    isDemo: boolean;
  };
  period: {
    periodDays: number;
    label: string;
  };
  generatedAt: string;
  executiveSummary: {
    eventBookings: any;
    experienceBookings: any;
    corporateInquiries: any;
    totalGrossBookingValue: any;
    eventCapacityUtilization: any;
    eventGuests: any;
    experienceGuests: any;
  };
  wineEngagement: {
    wineViews: number;
    wineSaves: number;
    viewToSaveRate: number;
    mostViewedWines: any[];
    insufficientDataNotice?: string;
  };
  events: {
    eventBookings: any;
    eventGuests: any;
    eventCapacityUtilization: any;
    eventGrossBookingValue: any;
  };
  experiences: {
    experienceBookings: any;
    experienceGuests: any;
    experienceGrossBookingValue: any;
  };
  corporate: {
    corporateInquiries: any;
    statusBreakdown: { pending: number; approved: number; rejected: number };
    avgExpectedGuests: number;
    disclaimer: string;
  };
  grossBookingValue: {
    eventGBV: any;
    experienceGBV: any;
    combinedGBV: any;
    disclaimer: string;
  };
  comparisonTable: Array<{
    category: string;
    metric: string;
    current: string;
    previous: string;
    absoluteChange: string;
    percentageChange: string;
  }>;
  insights: any[];
  recommendations: any[];
}

export class ReportService {
  /**
   * Generates structured JSON report composing existing analytics service data
   */
  static async generateReport(wineryId: string, periodDays: number = 7): Promise<AnalyticsReportData> {
    const isDemo = wineryId === DEMO_WINERY_ID;
    let wineryName = isDemo ? DEMO_WINERY_NAME : 'Winery';
    let winerySlug = isDemo ? 'vinosphere-analytics-demo-winery' : undefined;

    if (!isDemo) {
      const { data: winery } = await supabase
        .from('wineries')
        .select('name, slug')
        .eq('id', wineryId)
        .single();
      if (winery) {
        wineryName = winery.name || wineryName;
        winerySlug = winery.slug || winerySlug;
      }
    }

    const periodLabel = periodDays === 30 ? 'Last 30 Days' : periodDays === 90 ? 'Last 90 Days' : 'Last 7 Days';

    // 1. Fetch backend analytics
    const biz = await analyticsService.getBusinessAnalytics(wineryId, periodDays);
    const summary = await analyticsService.getDashboardSummary(wineryId);

    // 2. Fetch fresh insights & recommendations
    await RecommendationService.processWineInsights(wineryId).catch(() => {});
    await RecommendationService.processBusinessInsights(wineryId).catch(() => {});
    const recs = await RecommendationService.getRecommendations(wineryId);

    const formatNum = (val: any) => (val !== undefined && val !== null && !isNaN(val) ? Number(val) : 0);
    const formatCurrencyStr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    const formatChangePct = (metricObj: any) => {
      if (!metricObj) return 'No baseline';
      if (metricObj.previous === 0 && metricObj.current > 0) return 'New activity';
      if (metricObj.previous === 0 && metricObj.current === 0) return 'No activity';
      if (metricObj.percentageChange === null || metricObj.percentageChange === undefined || isNaN(metricObj.percentageChange)) return 'No baseline';
      const pct = metricObj.percentageChange;
      return `${pct >= 0 ? '+' : ''}${pct}%`;
    };

    const formatAbsChange = (metricObj: any, isMonetary: boolean = false) => {
      if (!metricObj) return '0';
      const change = metricObj.absoluteChange ?? 0;
      if (isMonetary) return `${change >= 0 ? '+' : ''}${formatCurrencyStr(change)}`;
      return `${change >= 0 ? '+' : ''}${change}`;
    };

    // Construct Comparison Table
    const comparisonTable = [
      {
        category: 'Event Performance',
        metric: 'Event Bookings',
        current: `${formatNum(biz.eventBookings?.current)} bookings`,
        previous: `${formatNum(biz.eventBookings?.previous)} bookings`,
        absoluteChange: formatAbsChange(biz.eventBookings),
        percentageChange: formatChangePct(biz.eventBookings)
      },
      {
        category: 'Event Performance',
        metric: 'Event Guests',
        current: `${formatNum(biz.eventGuests?.current)} guests`,
        previous: `${formatNum(biz.eventGuests?.previous)} guests`,
        absoluteChange: formatAbsChange(biz.eventGuests),
        percentageChange: formatChangePct(biz.eventGuests)
      },
      {
        category: 'Event Performance',
        metric: 'Capacity Utilization',
        current: `${formatNum(biz.eventCapacityUtilization?.current)}%`,
        previous: `${formatNum(biz.eventCapacityUtilization?.previous)}%`,
        absoluteChange: `${(formatNum(biz.eventCapacityUtilization?.current) - formatNum(biz.eventCapacityUtilization?.previous)).toFixed(2)}%`,
        percentageChange: 'N/A'
      },
      {
        category: 'Event Revenue',
        metric: 'Event GBV',
        current: formatCurrencyStr(formatNum(biz.eventGrossBookingValue?.current)),
        previous: formatCurrencyStr(formatNum(biz.eventGrossBookingValue?.previous)),
        absoluteChange: formatAbsChange(biz.eventGrossBookingValue, true),
        percentageChange: formatChangePct(biz.eventGrossBookingValue)
      },
      {
        category: 'Experience Performance',
        metric: 'Experience Bookings',
        current: `${formatNum(biz.experienceBookings?.current)} bookings`,
        previous: `${formatNum(biz.experienceBookings?.previous)} bookings`,
        absoluteChange: formatAbsChange(biz.experienceBookings),
        percentageChange: formatChangePct(biz.experienceBookings)
      },
      {
        category: 'Experience Performance',
        metric: 'Experience Guests',
        current: `${formatNum(biz.experienceGuests?.current)} guests`,
        previous: `${formatNum(biz.experienceGuests?.previous)} guests`,
        absoluteChange: formatAbsChange(biz.experienceGuests),
        percentageChange: formatChangePct(biz.experienceGuests)
      },
      {
        category: 'Experience Revenue',
        metric: 'Experience GBV',
        current: formatCurrencyStr(formatNum(biz.experienceGrossBookingValue?.current)),
        previous: formatCurrencyStr(formatNum(biz.experienceGrossBookingValue?.previous)),
        absoluteChange: formatAbsChange(biz.experienceGrossBookingValue, true),
        percentageChange: formatChangePct(biz.experienceGrossBookingValue)
      },
      {
        category: 'Corporate Leads',
        metric: 'Corporate Inquiries',
        current: `${formatNum(biz.corporateInquiries?.current)} inquiries`,
        previous: `${formatNum(biz.corporateInquiries?.previous)} inquiries`,
        absoluteChange: formatAbsChange(biz.corporateInquiries),
        percentageChange: formatChangePct(biz.corporateInquiries)
      },
      {
        category: 'Gross Booking Value',
        metric: 'Total Gross Booking Value (GBV)',
        current: formatCurrencyStr(formatNum(biz.totalGrossBookingValue?.current)),
        previous: formatCurrencyStr(formatNum(biz.totalGrossBookingValue?.previous)),
        absoluteChange: formatAbsChange(biz.totalGrossBookingValue, true),
        percentageChange: formatChangePct(biz.totalGrossBookingValue)
      }
    ];

    const wineEngagementNotice = summary.wine_views === 0 ? 'Insufficient data for reliable trend analysis.' : undefined;

    return {
      winery: {
        id: wineryId,
        name: wineryName,
        slug: winerySlug,
        isDemo
      },
      period: {
        periodDays,
        label: periodLabel
      },
      generatedAt: new Date().toISOString(),
      executiveSummary: {
        eventBookings: biz.eventBookings,
        experienceBookings: biz.experienceBookings,
        corporateInquiries: biz.corporateInquiries,
        totalGrossBookingValue: biz.totalGrossBookingValue,
        eventCapacityUtilization: biz.eventCapacityUtilization,
        eventGuests: biz.eventGuests,
        experienceGuests: biz.experienceGuests
      },
      wineEngagement: {
        wineViews: summary.wine_views || 0,
        wineSaves: summary.wine_saves || 0,
        viewToSaveRate: summary.view_to_save_rate || 0,
        mostViewedWines: summary.most_viewed_wines || [],
        insufficientDataNotice: wineEngagementNotice
      },
      events: {
        eventBookings: biz.eventBookings,
        eventGuests: biz.eventGuests,
        eventCapacityUtilization: biz.eventCapacityUtilization,
        eventGrossBookingValue: biz.eventGrossBookingValue
      },
      experiences: {
        experienceBookings: biz.experienceBookings,
        experienceGuests: biz.experienceGuests,
        experienceGrossBookingValue: biz.experienceGrossBookingValue
      },
      corporate: {
        corporateInquiries: biz.corporateInquiries,
        statusBreakdown: biz.corporateStatusBreakdown || { pending: 0, approved: 0, rejected: 0 },
        avgExpectedGuests: biz.corporateAvgExpectedGuests || 0,
        disclaimer: 'Corporate inquiries represent business leads received through VinoSphere. They are not included in Gross Booking Value unless represented by an eligible paid event or experience booking.'
      },
      grossBookingValue: {
        eventGBV: biz.eventGrossBookingValue,
        experienceGBV: biz.experienceGrossBookingValue,
        combinedGBV: biz.totalGrossBookingValue,
        disclaimer: 'Gross Booking Value represents eligible paid event and experience bookings recorded through VinoSphere. It is not total winery revenue and does not include offline sales, wholesale revenue, restaurant revenue, or external corporate contracts.'
      },
      comparisonTable,
      insights: (recs || []).map((r: any) => {
        let evStr = '';
        if (typeof r.evidence === 'string') {
          evStr = r.evidence;
        } else if (r.evidence && typeof r.evidence === 'object') {
          const m = r.evidence.metric || 'Metric';
          const cur = r.evidence.current_value ?? 0;
          const prev = r.evidence.comparison_value ?? 0;
          const pct = r.evidence.percentage_change !== undefined ? `${r.evidence.percentage_change >= 0 ? '+' : ''}${r.evidence.percentage_change}%` : '';
          evStr = `${m}: Current ${cur} vs previous ${prev} (${pct})`;
        } else {
          evStr = 'Automated trend evidence recorded';
        }

        return {
          rule_id: r.rule_id,
          category: r.category || 'Analytics',
          insight: r.condition_detected || r.rule_id || 'Detected Trend',
          evidence: evStr,
          recommendation: r.recommendation_text || r.llm_explanation || 'Action recommended based on platform rules',
          severity: r.severity || 'medium'
        };
      }),
      recommendations: (recs || []).map((r: any) => ({
        id: r.id,
        category: r.category,
        title: r.recommendation_text || r.rule_id,
        llmExplanation: r.llm_explanation || r.recommendation_text,
        status: r.status
      }))
    };
  }

  /**
   * Generates CSV string from report data
   */
  static generateCSV(report: AnalyticsReportData): string {
    const lines: string[] = [];
    lines.push('Category,Metric,Current Period,Previous Period,Absolute Change,Percentage Change');

    report.comparisonTable.forEach(row => {
      const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
      lines.push(`${escape(row.category)},${escape(row.metric)},${escape(row.current)},${escape(row.previous)},${escape(row.absoluteChange)},${escape(row.percentageChange)}`);
    });

    lines.push('');
    lines.push('Wine Engagement Analytics');
    lines.push(`Wine Views,${report.wineEngagement.wineViews}`);
    lines.push(`Wine Saves,${report.wineEngagement.wineSaves}`);
    lines.push(`View to Save Rate,${report.wineEngagement.viewToSaveRate}%`);

    lines.push('');
    lines.push('Corporate Inquiry Breakdown');
    lines.push(`Pending Inquiries,${report.corporate.statusBreakdown.pending}`);
    lines.push(`Approved Inquiries,${report.corporate.statusBreakdown.approved}`);
    lines.push(`Rejected Inquiries,${report.corporate.statusBreakdown.rejected}`);
    lines.push(`Average Expected Guests,${report.corporate.avgExpectedGuests}`);

    lines.push('');
    lines.push('Disclaimers');
    lines.push(`"Gross Booking Value","${report.grossBookingValue.disclaimer.replace(/"/g, '""')}"`);
    lines.push(`"Corporate Leads","${report.corporate.disclaimer.replace(/"/g, '""')}"`);

    return lines.join('\n');
  }

  /**
   * Generates text-based PDF Buffer from report data using PDFKit
   */
  static async generatePDF(report: AnalyticsReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk: any) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Color Palette
        const primaryColor = '#6D071A'; // Burgundy
        const secondaryColor = '#841126';
        const textColor = '#1F2937';
        const subTextColor = '#4B5563';
        const lightBg = '#F9FAFB';
        const accentBorder = '#E5E7EB';
        const pageBottomMargin = 750;

        // Reset X to left margin (40)
        const resetMargin = () => {
          doc.x = 40;
        };

        const checkPageBreak = (neededHeight: number = 40) => {
          if (doc.y + neededHeight > pageBottomMargin) {
            doc.addPage();
            doc.x = 40;
            doc.y = 45; // Below running header
            return true;
          }
          return false;
        };

        // --- 1. HEADER BANNER ---
        resetMargin();
        doc.rect(40, 35, 515, 60).fill(primaryColor);

        doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('VinoSphere Winery Analytics Report', 50, 47, { width: 495 });
        doc.fillColor('#FDE68A').fontSize(9).font('Helvetica').text(
          `${report.winery.name}  |  Period: ${report.period.label}  |  Generated: ${new Date(report.generatedAt).toLocaleDateString('en-IN')}`,
          50,
          72,
          { width: 495 }
        );

        let currentY = 105;

        if (report.winery.isDemo) {
          doc.rect(40, currentY, 515, 20).fill('#FEF3C7');
          doc.fillColor('#92400E').fontSize(9).font('Helvetica-Bold').text('Controlled Analytics Demonstration Dataset', 48, currentY + 5, { width: 500, align: 'center' });
          currentY += 28;
        } else {
          currentY += 10;
        }

        doc.y = currentY;
        resetMargin();

        // --- 2. EXECUTIVE SUMMARY GRID ---
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('1. Executive Summary', 40, doc.y);
        currentY = doc.y + 18;

        const summaryCards = [
          { label: 'EVENT BOOKINGS', val: `${report.executiveSummary.eventBookings?.current ?? 0}`, prev: `vs ${report.executiveSummary.eventBookings?.previous ?? 0} prev` },
          { label: 'EXPERIENCE BOOKINGS', val: `${report.executiveSummary.experienceBookings?.current ?? 0}`, prev: `vs ${report.executiveSummary.experienceBookings?.previous ?? 0} prev` },
          { label: 'CORPORATE INQUIRIES', val: `${report.executiveSummary.corporateInquiries?.current ?? 0}`, prev: `vs ${report.executiveSummary.corporateInquiries?.previous ?? 0} prev` },
          { label: 'GROSS BOOKING VALUE', val: `Rs. ${(report.executiveSummary.totalGrossBookingValue?.current ?? 0).toLocaleString('en-IN')}`, prev: `vs Rs. ${(report.executiveSummary.totalGrossBookingValue?.previous ?? 0).toLocaleString('en-IN')} prev` },
          { label: 'CAPACITY UTILIZATION', val: `${report.executiveSummary.eventCapacityUtilization?.current ?? 0}%`, prev: `vs ${report.executiveSummary.eventCapacityUtilization?.previous ?? 0}% prev` },
          { label: 'EVENT & EXP GUESTS', val: `${(report.executiveSummary.eventGuests?.current ?? 0) + (report.executiveSummary.experienceGuests?.current ?? 0)} guests`, prev: `vs ${(report.executiveSummary.eventGuests?.previous ?? 0) + (report.executiveSummary.experienceGuests?.previous ?? 0)} prev` },
        ];

        const cardWidth = 165;
        const cardHeight = 44;
        const colGap = 10;

        summaryCards.forEach((card, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const x = 40 + col * (cardWidth + colGap);
          const y = currentY + row * (cardHeight + 8);

          doc.rect(x, y, cardWidth, cardHeight).fillAndStroke(lightBg, accentBorder);
          doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica-Bold').text(card.label, x + 8, y + 6, { width: cardWidth - 16, lineBreak: false });
          doc.fillColor(textColor).fontSize(11).font('Helvetica-Bold').text(card.val, x + 8, y + 17, { width: cardWidth - 16, lineBreak: false });
          doc.fillColor('#9CA3AF').fontSize(7.5).font('Helvetica').text(card.prev, x + 8, y + 31, { width: cardWidth - 16, lineBreak: false });
        });

        currentY = currentY + 2 * (cardHeight + 8) + 12;
        doc.y = currentY;
        resetMargin();

        // --- 3. PERIOD COMPARISON MATRIX ---
        checkPageBreak(210);
        currentY = doc.y;
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('2. Period Comparison Matrix', 40, currentY);
        currentY += 18;

        doc.rect(40, currentY, 515, 20).fill(primaryColor);
        doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
        doc.text('Business Metric', 48, currentY + 5, { width: 160, lineBreak: false });
        doc.text('Current Period', 210, currentY + 5, { width: 80, align: 'right', lineBreak: false });
        doc.text('Previous Period', 295, currentY + 5, { width: 80, align: 'right', lineBreak: false });
        doc.text('Abs Change', 380, currentY + 5, { width: 75, align: 'right', lineBreak: false });
        doc.text('Pct Change', 460, currentY + 5, { width: 85, align: 'right', lineBreak: false });

        let rowY = currentY + 20;

        report.comparisonTable.forEach((row, i) => {
          if (rowY + 18 > pageBottomMargin) {
            doc.addPage();
            resetMargin();
            rowY = 45;
          }
          if (i % 2 === 1) {
            doc.rect(40, rowY, 515, 18).fill('#F9FAFB');
          }
          const cleanCurrent = row.current.replace(/₹/g, 'Rs. ');
          const cleanPrev = row.previous.replace(/₹/g, 'Rs. ');
          const cleanAbs = row.absoluteChange.replace(/₹/g, 'Rs. ');

          doc.fillColor(textColor).fontSize(8).font('Helvetica');
          doc.text(row.metric, 48, rowY + 4, { width: 160, lineBreak: false });
          doc.text(cleanCurrent, 210, rowY + 4, { width: 80, align: 'right', lineBreak: false });
          doc.fillColor(subTextColor).text(cleanPrev, 295, rowY + 4, { width: 80, align: 'right', lineBreak: false });
          doc.fillColor(textColor).text(cleanAbs, 380, rowY + 4, { width: 75, align: 'right', lineBreak: false });
          doc.fillColor(row.percentageChange.startsWith('+') ? '#059669' : textColor)
             .font('Helvetica-Bold')
             .text(row.percentageChange, 460, rowY + 4, { width: 85, align: 'right', lineBreak: false });

          rowY += 18;
        });

        currentY = rowY + 14;
        doc.y = currentY;
        resetMargin();

        // --- 4. WINE ENGAGEMENT & BEHAVIORAL ANALYTICS ---
        checkPageBreak(85);
        currentY = doc.y;
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('3. Wine Engagement & Behavioral Analytics', 40, currentY);
        currentY += 18;

        doc.rect(40, currentY, 515, 52).fillAndStroke(lightBg, accentBorder);
        doc.fillColor(textColor).fontSize(8.5).font('Helvetica');
        doc.text(`Total Wine Views: ${report.wineEngagement.wineViews}`, 52, currentY + 8, { width: 240, lineBreak: false });
        doc.text(`Total Wine Saves: ${report.wineEngagement.wineSaves}`, 52, currentY + 22, { width: 240, lineBreak: false });
        doc.text(`View-to-Save Conversion Rate: ${report.wineEngagement.viewToSaveRate}%`, 52, currentY + 36, { width: 240, lineBreak: false });

        if (report.wineEngagement.insufficientDataNotice) {
          doc.fillColor('#D97706').fontSize(8).font('Helvetica-Bold')
             .text(report.wineEngagement.insufficientDataNotice, 280, currentY + 20, { width: 260, align: 'right', lineBreak: false });
        }

        currentY += 64;
        doc.y = currentY;
        resetMargin();

        // --- 5. CORPORATE INQUIRIES & PIPELINE ---
        checkPageBreak(95);
        currentY = doc.y;
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('4. Corporate Inquiries & Pipeline', 40, currentY);
        currentY += 18;

        doc.rect(40, currentY, 515, 72).fillAndStroke(lightBg, accentBorder);
        doc.fillColor(textColor).fontSize(8.5).font('Helvetica');
        doc.text(`Total Corporate Inquiries: ${report.corporate.corporateInquiries?.current ?? 0}`, 52, currentY + 8, { width: 490, lineBreak: false });
        doc.text(
          `Status Breakdown: Pending (${report.corporate.statusBreakdown.pending})  |  Approved (${report.corporate.statusBreakdown.approved})  |  Rejected (${report.corporate.statusBreakdown.rejected})`,
          52,
          currentY + 22,
          { width: 490, lineBreak: false }
        );
        doc.text(`Average Expected Guests per Lead: ${report.corporate.avgExpectedGuests} guests`, 52, currentY + 36, { width: 490, lineBreak: false });
        doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica')
           .text(`Note: ${report.corporate.disclaimer}`, 52, currentY + 52, { width: 490, lineBreak: false });

        currentY += 84;
        doc.y = currentY;
        resetMargin();

        // --- 6. GROSS BOOKING VALUE (GBV) ---
        checkPageBreak(85);
        currentY = doc.y;
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('5. Gross Booking Value (GBV)', 40, currentY);
        currentY += 18;

        doc.rect(40, currentY, 515, 68).fillAndStroke(lightBg, accentBorder);
        doc.fillColor(textColor).fontSize(8.5).font('Helvetica');
        doc.text(`Event Gross Booking Value: Rs. ${(report.grossBookingValue.eventGBV?.current ?? 0).toLocaleString('en-IN')}`, 52, currentY + 8, { width: 490, lineBreak: false });
        doc.text(`Experience Gross Booking Value: Rs. ${(report.grossBookingValue.experienceGBV?.current ?? 0).toLocaleString('en-IN')}`, 52, currentY + 22, { width: 490, lineBreak: false });
        doc.fillColor(primaryColor).font('Helvetica-Bold').text(`Combined Total GBV: Rs. ${(report.grossBookingValue.combinedGBV?.current ?? 0).toLocaleString('en-IN')}`, 52, currentY + 36, { width: 490, lineBreak: false });
        doc.fillColor('#6B7280').fontSize(7.5).font('Helvetica')
           .text(`Disclaimer: ${report.grossBookingValue.disclaimer}`, 52, currentY + 49, { width: 490 });

        currentY += 80;
        doc.y = currentY;
        resetMargin();

        // --- 7. DETECTED INSIGHTS & RECOMMENDATIONS ---
        checkPageBreak(90);
        currentY = doc.y;
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('6. Detected Insights & Actionable Recommendations', 40, currentY);
        currentY += 18;

        if (!report.insights || report.insights.length === 0) {
          doc.fillColor(subTextColor).fontSize(8.5).font('Helvetica').text('No active recommendations or insight anomalies detected for this evaluation period.', 40, currentY, { width: 515 });
        } else {
          report.insights.forEach((item, idx) => {
            if (currentY + 58 > pageBottomMargin) {
              doc.addPage();
              resetMargin();
              currentY = 45;
            }

            const evText = typeof item.evidence === 'string' ? item.evidence : (item.evidence?.metric ? `${item.evidence.metric}: ${item.evidence.current_value}` : 'Trend evidence recorded');
            const recText = typeof item.recommendation === 'string' ? item.recommendation : 'Action recommended based on platform rules';
            const insightText = typeof item.insight === 'string' ? item.insight : (item.condition || 'Detected Trend');

            doc.rect(40, currentY, 515, 54).fillAndStroke('#FFFFFF', accentBorder);
            doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold')
               .text(`${idx + 1}. [${item.category || 'Analytics'}] ${insightText}`, 48, currentY + 6, { width: 498, lineBreak: false });

            doc.fillColor(textColor).fontSize(7.5).font('Helvetica')
               .text(`Evidence: ${evText}`, 48, currentY + 20, { width: 498, lineBreak: false });

            doc.fillColor(secondaryColor).fontSize(7.5).font('Helvetica-Bold')
               .text(`Recommendation: ${recText}`, 48, currentY + 34, { width: 498, lineBreak: false });

            currentY += 62;
          });
        }

        // --- 8. BUFFERED PAGES HEADER & FOOTER PASS ---
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);

          // Top Header on pages after Page 1
          if (i > 0) {
            doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold')
               .text('VinoSphere Winery Analytics Report', 40, 20, { width: 300, lineBreak: false });
            doc.fillColor('#6B7280').fontSize(8).font('Helvetica')
               .text(`${report.winery.name}  |  ${report.period.label}`, 340, 20, { width: 215, align: 'right', lineBreak: false });
            doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(40, 32).lineTo(555, 32).stroke();
          }

          // Bottom Running Footer on all pages (y=785 line, y=790 text ensures < 801.89 margin threshold)
          doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(40, 785).lineTo(555, 785).stroke();
          doc.fillColor('#9CA3AF').fontSize(8).font('Helvetica')
             .text(`VinoSphere Analytics Module v13.0  |  Page ${i + 1} of ${range.count}`, 40, 790, { width: 515, align: 'center', lineBreak: false });
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

