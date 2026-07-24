export class SubstationForecastService {
  constructor(transformerCapacityMva = 50.0) {
    this.transformerCapacityMva = transformerCapacityMva;
  }

  forecastNextInterval(historicalMvaSeries, ambientTempC) {
    if (!historicalMvaSeries || historicalMvaSeries.length < 3) {
      throw new Error('Insufficient historical series: minimum 3 observations required');
    }

    // Exponentially weighted moving average with temperature sensitivity (+1.2% load per degree above 32C)
    const weights = [0.2, 0.3, 0.5];
    const recent = historicalMvaSeries.slice(-3);
    let weightedBase = recent[0] * weights[0] + recent[1] * weights[1] + recent[2] * weights[2];

    if (ambientTempC > 32) {
      const tempFactor = 1 + ((ambientTempC - 32) * 0.012);
      weightedBase *= tempFactor;
    }

    const forecastMva = Number(weightedBase.toFixed(2));
    const utilizationPct = Number(((forecastMva / this.transformerCapacityMva) * 100).toFixed(1));

    let riskLevel = 'LOW';
    if (utilizationPct >= 95.0) riskLevel = 'CRITICAL';
    else if (utilizationPct >= 85.0) riskLevel = 'HIGH';
    else if (utilizationPct >= 70.0) riskLevel = 'MODERATE';

    return {
      forecastMva,
      capacityMva: this.transformerCapacityMva,
      utilizationPct,
      riskLevel
    };
  }
}
