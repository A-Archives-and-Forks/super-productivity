import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { MetricService } from './metric.service';
import { Observable } from 'rxjs';
import { LineChartData } from './metric.model';
import { fadeAnimation } from '../../ui/animations/fade.ani';
import { T } from '../../t.const';
import { ProjectMetricsService } from './project-metrics.service';
import { WorkContextService } from '../work-context/work-context.service';

@Component({
  selector: 'metric',
  templateUrl: './metric.component.html',
  styleUrls: ['./metric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation],
})
export class MetricComponent {
  T: typeof T = T;

  productivityHappiness$: Observable<LineChartData> =
    this.metricService.getProductivityHappinessChartData$();

  simpleClickCounterData$: Observable<LineChartData> =
    this.metricService.getSimpleClickCounterMetrics$();

  simpleCounterStopWatchData$: Observable<LineChartData> =
    this.metricService.getSimpleCounterStopwatchMetrics$();

  pieChartOptions: ChartOptions = {
    responsive: true,
    // legend: {
    //   position: 'top',
    // },
  };
  pieChartType: ChartType = 'pie';
  pieChartPlugins: any[] = [];

  lineChartOptions: ChartOptions = {
    responsive: true,
  };
  // TODO fix type
  lineChartColors: any[] = [];
  lineChartLegend: boolean = true;
  lineChartType: ChartType = 'line';
  lineChartPlugins: any[] = [];

  constructor(
    public workContextService: WorkContextService,
    public metricService: MetricService,
    public projectMetricsService: ProjectMetricsService,
  ) {}
}
