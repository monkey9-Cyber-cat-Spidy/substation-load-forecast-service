import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SubstationForecastService } from '../src/forecastService.mjs';

describe('Substation Load Forecast Service Suite', () => {
  const service = new SubstationForecastService(50.0);

  test('should predict load within safe margins under nominal conditions', () => {
    const res = service.forecastNextInterval([30.0, 32.0, 31.5], 28);
    assert.ok(res.forecastMva > 31.0 && res.forecastMva < 32.0);
    assert.strictEqual(res.riskLevel, 'LOW');
  });

  test('should flag CRITICAL risk when load approaches transformer limits under heatwave', () => {
    const res = service.forecastNextInterval([44.0, 46.0, 47.5], 42); // 42C temperature
    assert.ok(res.utilizationPct > 95.0);
    assert.strictEqual(res.riskLevel, 'CRITICAL');
  });
});
