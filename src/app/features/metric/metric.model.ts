import { EntityState } from '@ngrx/entity';
// import { Label, SingleDataSet } from 'ng2-charts';
import { ChartData } from 'chart.js';

export interface MetricCopy {
  // string date of day
  id: string;

  // TODO remove
  obstructions: string[];
  // TODO remove
  improvements: string[];
  // TODO remove
  improvementsTomorrow: string[];
  // TODO remove
  mood?: number | null;
  // TODO remove
  productivity?: number | null;

  focusSessions?: number[];

  // Evaluation fields
  notes?: string | null;
  remindTomorrow?: boolean;

  // v2.4 Productivity scoring fields (impact-driven)
  impactOfWork?: number | null; // 1-4 scale

  // v2.3 Sustainability scoring fields
  energyCheckin?: number | null; // 1-3 scale (simple: 1=exhausted, 2=ok, 3=good)

  // TODO remove
  totalWorkMinutes?: number | null; // Total work time in minutes
  targetMinutes?: number | null; // Target deep work minutes (default 240)

  // Optional task completion tracking (for future use in productivity)
  completedTasks?: number | null;
  plannedTasks?: number | null;

  // Deprecated fields (v1, kept for backward compatibility)
  focusQuality?: number | null; // Replaced by density calculation in v2.4
}

export type Metric = Readonly<MetricCopy>;

export type MetricState = EntityState<Metric>;

export type PieChartData = ChartData<'pie', number[], string>;
export type LineChartData = ChartData<'line', (number | undefined)[], string>;

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
