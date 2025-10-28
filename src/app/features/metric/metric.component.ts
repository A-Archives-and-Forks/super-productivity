import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MetricService } from './metric.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { fadeAnimation } from '../../ui/animations/fade.ani';
import { T } from '../../t.const';
import { ProjectMetricsService } from './project-metrics.service';
import { WorkContextService } from '../work-context/work-context.service';
import { LazyChartComponent } from './lazy-chart/lazy-chart.component';
import { DecimalPipe } from '@angular/common';
import { MsToStringPipe } from '../../ui/duration/ms-to-string.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivityHeatmapComponent } from './activity-heatmap/activity-heatmap.component';
import { ShareButtonComponent } from '../../core/share/share-button/share-button.component';
import { ShareFormatter } from '../../core/share/share-formatter';
import { SharePayload } from '../../core/share/share.model';
import { map } from 'rxjs/operators';
import { calculateSustainabilityScore } from './metric-scoring.util';

@Component({
  selector: 'metric',
  templateUrl: './metric.component.html',
  styleUrls: ['./metric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation],
  imports: [
    LazyChartComponent,
    DecimalPipe,
    MsToStringPipe,
    TranslatePipe,
    ActivityHeatmapComponent,
    ShareButtonComponent,
  ],
})
export class MetricComponent {
  workContextService = inject(WorkContextService);
  metricService = inject(MetricService);
  projectMetricsService = inject(ProjectMetricsService);

  T: typeof T = T;

  activeWorkContext = toSignal(this.workContextService.activeWorkContext$);

  simpleClickCounterData = toSignal(this.metricService.getSimpleClickCounterMetrics$());

  simpleCounterStopWatchData = toSignal(
    this.metricService.getSimpleCounterStopwatchMetrics$(),
  );

  focusSessionData = toSignal(this.metricService.getFocusSessionMetrics$());

  productivityBreakdownChartData = toSignal<ChartData<
    'line',
    (number | null)[],
    string
  > | null>(
    this.metricService.getProductivityBreakdown$().pipe(
      map((breakdown) => {
        if (!breakdown.length) {
          return null;
        }

        const labels = breakdown.map((item) => item.day);
        const productivityScores = breakdown.map((item) =>
          item.score != null ? item.score : null,
        );
        const sustainabilityScores = breakdown.map((item) =>
          item.energyCheckin != null
            ? calculateSustainabilityScore(
                item.focusedMinutes,
                item.totalWorkMinutes,
                600,
                item.energyCheckin,
              )
            : null,
        );

        const hasData =
          productivityScores.some((score) => score != null) ||
          sustainabilityScores.some((score) => score != null);

        if (!hasData) {
          return null;
        }

        return {
          labels,
          datasets: [
            {
              label: 'Productivity Score',
              data: productivityScores,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
            },
            {
              label: 'Sustainability Score',
              data: sustainabilityScores,
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              tension: 0.1,
            },
          ],
        } as ChartData<'line', (number | null)[], string>;
      }),
    ),
    { initialValue: null },
  );

  lineChartOptions: ChartConfiguration<
    'line',
    (number | undefined)[],
    string
  >['options'] = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          precision: 0,
        },
      },
    },
  };
  lineChartType: ChartType = 'line';

  sharePayload = computed<SharePayload>(() => {
    const sm = this.projectMetricsService.simpleMetrics();
    const workContext = this.activeWorkContext();

    if (!sm) {
      return ShareFormatter.formatPromotion();
    }

    return ShareFormatter.formatWorkSummary(
      {
        totalTimeSpent: sm.timeSpent,
        tasksCompleted: sm.nrOfCompletedTasks,
        dateRange: {
          start: sm.start,
          end: sm.end,
        },
        projectName: workContext?.title,
        detailedMetrics: {
          timeEstimate: sm.timeEstimate,
          totalTasks: sm.nrOfAllTasks,
          daysWorked: sm.daysWorked,
          avgTasksPerDay: sm.avgTasksPerDay,
          avgBreakNr: sm.avgBreakNr,
          avgTimeSpentOnDay: sm.avgTimeSpentOnDay,
          avgTimeSpentOnTask: sm.avgTimeSpentOnTask,
          avgTimeSpentOnTaskIncludingSubTasks: sm.avgTimeSpentOnTaskIncludingSubTasks,
          avgBreakTime: sm.avgBreakTime,
        },
      },
      {
        includeUTM: true,
        includeHashtags: true,
      },
    );
  });
}
