import { inject, Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, tap } from 'rxjs/operators';
import { timer } from 'rxjs';
import { ReminderService } from '../../reminder/reminder.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SnackService } from '../../../core/snack/snack.service';
import { IS_ANDROID_WEB_VIEW } from '../../../util/is-android-web-view';
import { LocalNotificationSchema } from '@capacitor/local-notifications/dist/esm/definitions';
import { DroidLog } from '../../../core/log';

// TODO send message to electron when current task changes here

const DELAY_PERMISSIONS = 2000;
const DELAY_SCHEDULE = 5000;

@Injectable()
export class AndroidEffects {
  private _actions$ = inject(Actions);
  private _store$ = inject<Store<any>>(Store);
  private _reminderService = inject(ReminderService);
  private _snackService = inject(SnackService);
  // Single-shot guard so we don’t spam the user with duplicate warnings.
  private _hasShownNotificationWarning = false;
  private _hasCheckedExactAlarm = false;

  askPermissionsIfNotGiven$ =
    IS_ANDROID_WEB_VIEW &&
    createEffect(
      () =>
        timer(DELAY_PERMISSIONS).pipe(
          tap(async (v) => {
            try {
              const checkResult = await LocalNotifications.checkPermissions();
              DroidLog.log('AndroidEffects: initial permission check', checkResult);
              const displayPermissionGranted = checkResult.display === 'granted';
              if (displayPermissionGranted) {
                await this._ensureExactAlarmAccess();
                return;
              }
              // Surface a gentle warning early, but defer the actual permission prompt until we truly need it.
              this._notifyPermissionIssue();
            } catch (error) {
              DroidLog.err(error);
              this._notifyPermissionIssue(error?.toString());
            }
          }),
        ),
      {
        dispatch: false,
      },
    );

  scheduleNotifications$ =
    IS_ANDROID_WEB_VIEW &&
    createEffect(
      () =>
        timer(DELAY_SCHEDULE).pipe(
          switchMap(() => this._reminderService.reminders$),
          tap(async (reminders) => {
            try {
              if (!reminders || reminders.length === 0) {
                // Nothing to schedule yet, so avoid triggering the runtime permission dialog prematurely.
                return;
              }
              DroidLog.log('AndroidEffects: scheduling reminders', {
                reminderCount: reminders.length,
              });
              const checkResult = await LocalNotifications.checkPermissions();
              DroidLog.log('AndroidEffects: pre-schedule permission check', checkResult);
              let displayPermissionGranted = checkResult.display === 'granted';
              if (!displayPermissionGranted) {
                // Reminder scheduling only works after the runtime permission is accepted.
                const requestResult = await LocalNotifications.requestPermissions();
                DroidLog.log({ requestResult });
                displayPermissionGranted = requestResult.display === 'granted';
                if (!displayPermissionGranted) {
                  this._notifyPermissionIssue();
                  return;
                }
              }
              await this._ensureExactAlarmAccess();
              const pendingNotifications = await LocalNotifications.getPending();
              DroidLog.log({ pendingNotifications });
              if (pendingNotifications.notifications.length > 0) {
                await LocalNotifications.cancel({
                  notifications: pendingNotifications.notifications.map((n) => ({
                    id: n.id,
                  })),
                });
              }
              // Re-schedule the full set so the native alarm manager is always in sync.
              await LocalNotifications.schedule({
                notifications: reminders.map((reminder) => {
                  // since the ids are temporary we can use just Math.random()
                  const id = Math.round(Math.random() * 10000000);
                  const mapped: LocalNotificationSchema = {
                    id,
                    title: reminder.title,
                    body: '',
                    extra: {
                      reminder,
                    },
                    schedule: {
                      // eslint-disable-next-line no-mixed-operators
                      at: new Date(reminder.remindAt),
                      allowWhileIdle: true,
                      repeats: false,
                      every: undefined,
                    },
                  };
                  return mapped;
                }),
              });
              DroidLog.log('AndroidEffects: scheduled local notifications', {
                reminderCount: reminders.length,
              });
            } catch (error) {
              DroidLog.err(error);
              this._notifyPermissionIssue(error?.toString());
            }
          }),
        ),
      {
        dispatch: false,
      },
    );

  // markTaskAsDone$ = createEffect(() =>
  //   androidInterface.onMarkCurrentTaskAsDone$.pipe(
  //     withLatestFrom(this._store$.select(selectCurrentTask)),
  //     filter(([, currentTask]) => !!currentTask),
  //     map(([, currentTask]) =>
  //       updateTask({
  //         task: { id: (currentTask as TaskCopy).id, changes: { isDone: true } },
  //       }),
  //     ),
  //   ),
  // );
  //
  // pauseTracking$ = createEffect(() =>
  //   androidInterface.onPauseCurrentTask$.pipe(
  //     withLatestFrom(this._store$.select(selectCurrentTask)),
  //     filter(([, currentTask]) => !!currentTask),
  //     map(([, currentTask]) => setCurrentTask({ id: null })),
  //   ),
  // );
  // showAddTaskBar$ = createEffect(() =>
  //   androidInterface.onAddNewTask$.pipe(map(() => showAddTaskBar())),
  // );

  private async _ensureExactAlarmAccess(): Promise<void> {
    try {
      if (this._hasCheckedExactAlarm) {
        return;
      }
      // Android 12+ gates exact alarms behind a separate toggle; surface the settings screen if needed.
      const exactAlarmStatus = await LocalNotifications.checkExactNotificationSetting();
      if (exactAlarmStatus?.exact_alarm !== 'granted') {
        DroidLog.log(await LocalNotifications.changeExactNotificationSetting());
      } else {
        this._hasCheckedExactAlarm = true;
      }
    } catch (error) {
      DroidLog.warn(error);
    }
  }

  private _notifyPermissionIssue(message?: string): void {
    if (this._hasShownNotificationWarning) {
      return;
    }
    this._hasShownNotificationWarning = true;
    // Fallback snackbar so the user gets feedback even when the native APIs throw.
    this._snackService.open({
      type: 'ERROR',
      msg: message || 'Notifications not supported',
    });
  }
}
