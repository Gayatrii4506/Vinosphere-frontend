import { Request, Response } from 'express';
import { qualityService } from './quality.service';

export class QualityController {
  /**
   * Predict wine quality based on physicochemical parameters.
   */
  public async predict(req: Request, res: Response) {
    try {
      const features = req.body;
      if (!features || Object.keys(features).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing physicochemical features in request body'
        });
      }

      const result = await qualityService.predictQuality(features);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      console.error('Quality prediction error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to predict wine quality'
      });
    }
  }

  /**
   * Return enological benchmark ranges.
   */
  public getBenchmarks(_req: Request, res: Response) {
    const benchmarks = qualityService.getBenchmarks();
    return res.status(200).json({
      success: true,
      data: benchmarks
    });
  }
}

export const qualityController = new QualityController();
