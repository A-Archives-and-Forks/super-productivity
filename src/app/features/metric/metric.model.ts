import { EntityState } from '@ngrx/entity';
import { ChartDataset } from 'chart.js';
import { MODEL_VERSION_KEY } from '../../app.constants';

export interface MetricCopy {
  // string date of day
  id: string;

  // used as id
  obstructions: string[];
  improvements: string[];
  improvementsTomorrow: string[];
  mood?: number;
  productivity?: number;
}

export type Metric = Readonly<MetricCopy>;

export interface MetricState extends EntityState<Metric> {
  [MODEL_VERSION_KEY]?: number;
}

export interface PieChartData {
  // TODO fix type for ng2-charts
  labels: any[];
  // TODO fix type for ng2-charts
  data: any;
}

export interface LineChartData {
  // TODO fix type for ng2-charts
  labels: any[];
  data: ChartDataset[];
}

export interface SimpleMetrics {
  start: string;
  end: string;
  timeSpent: number;
  timeEstimate: number;
  breakTime: number;
  breakNr: number;
  nrOfCompletedTasks: number;
  nrOfAllTasks: number;
  nrOfSubTasks: number;
  nrOfMainTasks: number;
  nrOfParentTasks: number;
  daysWorked: number;
  avgTasksPerDay: number;
  avgTimeSpentOnDay: number;
  avgTimeSpentOnTask: number;
  avgTimeSpentOnTaskIncludingSubTasks: number;
  avgBreakNr: number;
  avgBreakTime: number;
}
