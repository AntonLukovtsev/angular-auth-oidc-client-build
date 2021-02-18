import { Injectable } from '@angular/core';
import { from, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "../flows/flows.service";
import * as i2 from "../utils/flowHelper/flow-helper.service";
import * as i3 from "../config/config.provider";
import * as i4 from "../flows/flows-data.service";
import * as i5 from "../logging/logger.service";
import * as i6 from "../userData/user-service";
import * as i7 from "../authState/auth-state.service";
import * as i8 from "../iframe/refresh-session-iframe.service";
import * as i9 from "./refresh-session-refresh-token.service";
import * as i10 from "./intervall.service";
import * as i11 from "../storage/storage-persistance.service";
export class PeriodicallyTokenCheckService {
    constructor(flowsService, flowHelper, configurationProvider, flowsDataService, loggerService, userService, authStateService, refreshSessionIframeService, refreshSessionRefreshTokenService, intervalService, storagePersistanceService) {
        this.flowsService = flowsService;
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.userService = userService;
        this.authStateService = authStateService;
        this.refreshSessionIframeService = refreshSessionIframeService;
        this.refreshSessionRefreshTokenService = refreshSessionRefreshTokenService;
        this.intervalService = intervalService;
        this.storagePersistanceService = storagePersistanceService;
    }
    startTokenValidationPeriodically(repeatAfterSeconds) {
        if (!!this.intervalService.runTokenValidationRunning || !this.configurationProvider.openIDConfiguration.silentRenew) {
            return;
        }
        this.loggerService.logDebug(`starting token validation check every ${repeatAfterSeconds}s`);
        const periodicallyCheck$ = this.intervalService.startPeriodicTokenCheck(repeatAfterSeconds).pipe(switchMap(() => {
            const idToken = this.authStateService.getIdToken();
            const isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning();
            const userDataFromStore = this.userService.getUserDataFromStore();
            this.loggerService.logDebug(`Checking: silentRenewRunning: ${isSilentRenewRunning} id_token: ${!!idToken} userData: ${!!userDataFromStore}`);
            const shouldBeExecuted = userDataFromStore && !isSilentRenewRunning && idToken;
            if (!shouldBeExecuted) {
                return of(null);
            }
            const idTokenHasExpired = this.authStateService.hasIdTokenExpired();
            const accessTokenHasExpired = this.authStateService.hasAccessTokenExpiredIfExpiryExists();
            if (!idTokenHasExpired && !accessTokenHasExpired) {
                return of(null);
            }
            if (!this.configurationProvider.openIDConfiguration.silentRenew) {
                this.flowsService.resetAuthorizationData();
                return of(null);
            }
            this.loggerService.logDebug('starting silent renew...');
            return from(this.flowsDataService.setSilentRenewRunningWhenIsNotLauched()).pipe(switchMap((isSuccessSet) => {
                if (isSuccessSet) {
                    this.loggerService.logDebug('&&&&&&&&&&&&& periodicallyCheck$ > SET LOCK WAS TRUE', (new Date()).getTime().toString());
                    // Retrieve Dynamically Set Custom Params
                    const customParams = this.storagePersistanceService.read('storageCustomRequestParams');
                    if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                        // Refresh Session using Refresh tokens
                        return this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(customParams);
                    }
                    return this.refreshSessionIframeService.refreshSessionWithIframe(customParams);
                }
                this.loggerService.logDebug('&&&&&&&&&&&&& periodicallyCheck$ > SET LOCK WAS FALSE', (new Date()).getTime().toString());
                return of(null);
            }));
        }));
        this.intervalService.runTokenValidationRunning = periodicallyCheck$
            .pipe(catchError(() => {
            this.flowsDataService.resetSilentRenewRunning();
            return throwError('periodically check failed');
        }))
            .subscribe(() => {
            this.loggerService.logDebug('silent renew, periodic check finished!');
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                this.flowsDataService.resetSilentRenewRunning();
            }
        }, (err) => {
            this.loggerService.logError('silent renew failed!', err);
        });
    }
}
PeriodicallyTokenCheckService.ɵfac = function PeriodicallyTokenCheckService_Factory(t) { return new (t || PeriodicallyTokenCheckService)(i0.ɵɵinject(i1.FlowsService), i0.ɵɵinject(i2.FlowHelper), i0.ɵɵinject(i3.ConfigurationProvider), i0.ɵɵinject(i4.FlowsDataService), i0.ɵɵinject(i5.LoggerService), i0.ɵɵinject(i6.UserService), i0.ɵɵinject(i7.AuthStateService), i0.ɵɵinject(i8.RefreshSessionIframeService), i0.ɵɵinject(i9.RefreshSessionRefreshTokenService), i0.ɵɵinject(i10.IntervallService), i0.ɵɵinject(i11.StoragePersistanceService)); };
PeriodicallyTokenCheckService.ɵprov = i0.ɵɵdefineInjectable({ token: PeriodicallyTokenCheckService, factory: PeriodicallyTokenCheckService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(PeriodicallyTokenCheckService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: i1.FlowsService }, { type: i2.FlowHelper }, { type: i3.ConfigurationProvider }, { type: i4.FlowsDataService }, { type: i5.LoggerService }, { type: i6.UserService }, { type: i7.AuthStateService }, { type: i8.RefreshSessionIframeService }, { type: i9.RefreshSessionRefreshTokenService }, { type: i10.IntervallService }, { type: i11.StoragePersistanceService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyaW9kaWNhbGx5LXRva2VuLWNoZWNrLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9wZXJpb2RpY2FsbHktdG9rZW4tY2hlY2suc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1QyxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7O0FBY3ZELE1BQU0sT0FBTyw2QkFBNkI7SUFDeEMsWUFDVSxZQUEwQixFQUMxQixVQUFzQixFQUN0QixxQkFBNEMsRUFDNUMsZ0JBQWtDLEVBQ2xDLGFBQTRCLEVBQzVCLFdBQXdCLEVBQ3hCLGdCQUFrQyxFQUNsQywyQkFBd0QsRUFDeEQsaUNBQW9FLEVBQ3BFLGVBQWlDLEVBQ2pDLHlCQUFvRDtRQVZwRCxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN4QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7UUFDeEQsc0NBQWlDLEdBQWpDLGlDQUFpQyxDQUFtQztRQUNwRSxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFDakMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtJQUMzRCxDQUFDO0lBRUosZ0NBQWdDLENBQUMsa0JBQTBC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QUMsQ0FBQyxDQUNILENBQUM7UUFDSixDQUFDLENBQUMsQ0FDSCxDQUFDO1FBRUYsSUFBSSxDQUFDLGVBQWUsQ0FBQyx5QkFBeUIsR0FBRyxrQkFBa0I7YUFDaEUsSUFBSSxDQUNILFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNoRCxPQUFPLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUNIO2FBQ0EsU0FBUyxDQUNSLEdBQUcsRUFBRTtZQUNILElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7WUFDdEUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLHNDQUFzQyxFQUFFLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2FBQ2pEO1FBQ0gsQ0FBQyxFQUNELENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDTixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQ0YsQ0FBQztJQUNOLENBQUM7OzBHQS9GVSw2QkFBNkI7cUVBQTdCLDZCQUE2QixXQUE3Qiw2QkFBNkIsbUJBRGhCLE1BQU07a0RBQ25CLDZCQUE2QjtjQUR6QyxVQUFVO2VBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBmcm9tLCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yLCBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93c1NlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlIH0gZnJvbSAnLi4vaWZyYW1lL3JlZnJlc2gtc2Vzc2lvbi1pZnJhbWUuc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuLi91c2VyRGF0YS91c2VyLXNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSW50ZXJ2YWxsU2VydmljZSB9IGZyb20gJy4vaW50ZXJ2YWxsLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2UgfSBmcm9tICcuL3JlZnJlc2gtc2Vzc2lvbi1yZWZyZXNoLXRva2VuLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcclxuZXhwb3J0IGNsYXNzIFBlcmlvZGljYWxseVRva2VuQ2hlY2tTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgZmxvd3NTZXJ2aWNlOiBGbG93c1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB1c2VyU2VydmljZTogVXNlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uSWZyYW1lU2VydmljZTogUmVmcmVzaFNlc3Npb25JZnJhbWVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvblJlZnJlc2hUb2tlblNlcnZpY2U6IFJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZSxcclxuICAgIHByaXZhdGUgaW50ZXJ2YWxTZXJ2aWNlOiBJbnRlcnZhbGxTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBzdGFydFRva2VuVmFsaWRhdGlvblBlcmlvZGljYWxseShyZXBlYXRBZnRlclNlY29uZHM6IG51bWJlcikge1xyXG4gICAgaWYgKCEhdGhpcy5pbnRlcnZhbFNlcnZpY2UucnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZyB8fCAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ldykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzdGFydGluZyB0b2tlbiB2YWxpZGF0aW9uIGNoZWNrIGV2ZXJ5ICR7cmVwZWF0QWZ0ZXJTZWNvbmRzfXNgKTtcclxuXHJcbiAgICBjb25zdCBwZXJpb2RpY2FsbHlDaGVjayQgPSB0aGlzLmludGVydmFsU2VydmljZS5zdGFydFBlcmlvZGljVG9rZW5DaGVjayhyZXBlYXRBZnRlclNlY29uZHMpLnBpcGUoXHJcbiAgICAgIHN3aXRjaE1hcCgoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCk7XHJcbiAgICAgICAgY29uc3QgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICBjb25zdCB1c2VyRGF0YUZyb21TdG9yZSA9IHRoaXMudXNlclNlcnZpY2UuZ2V0VXNlckRhdGFGcm9tU3RvcmUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICAgYENoZWNraW5nOiBzaWxlbnRSZW5ld1J1bm5pbmc6ICR7aXNTaWxlbnRSZW5ld1J1bm5pbmd9IGlkX3Rva2VuOiAkeyEhaWRUb2tlbn0gdXNlckRhdGE6ICR7ISF1c2VyRGF0YUZyb21TdG9yZX1gXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9IHVzZXJEYXRhRnJvbVN0b3JlICYmICFpc1NpbGVudFJlbmV3UnVubmluZyAmJiBpZFRva2VuO1xyXG5cclxuICAgICAgICBpZiAoIXNob3VsZEJlRXhlY3V0ZWQpIHtcclxuICAgICAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlkVG9rZW5IYXNFeHBpcmVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0lkVG9rZW5FeHBpcmVkKCk7XHJcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW5IYXNFeHBpcmVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0FjY2Vzc1Rva2VuRXhwaXJlZElmRXhwaXJ5RXhpc3RzKCk7XHJcblxyXG4gICAgICAgIGlmICghaWRUb2tlbkhhc0V4cGlyZWQgJiYgIWFjY2Vzc1Rva2VuSGFzRXhwaXJlZCkge1xyXG4gICAgICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3KSB7XHJcbiAgICAgICAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3N0YXJ0aW5nIHNpbGVudCByZW5ldy4uLicpO1xyXG5cclxuICAgICAgICByZXR1cm4gZnJvbSh0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0U2lsZW50UmVuZXdSdW5uaW5nV2hlbklzTm90TGF1Y2hlZCgpKS5waXBlKFxyXG4gICAgICAgICAgc3dpdGNoTWFwKChpc1N1Y2Nlc3NTZXQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGlzU3VjY2Vzc1NldCkge1xyXG4gICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnJiYmJiYmJiYmJiYmJiBwZXJpb2RpY2FsbHlDaGVjayQgPiBTRVQgTE9DSyBXQVMgVFJVRScsIChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgLy8gUmV0cmlldmUgRHluYW1pY2FsbHkgU2V0IEN1c3RvbSBQYXJhbXNcclxuICAgICAgICAgICAgICBjb25zdCBjdXN0b21QYXJhbXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9ID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoXHJcbiAgICAgICAgICAgICAgICAnc3RvcmFnZUN1c3RvbVJlcXVlc3RQYXJhbXMnXHJcbiAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmcmVzaFRva2VucygpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZWZyZXNoIFNlc3Npb24gdXNpbmcgUmVmcmVzaCB0b2tlbnNcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uUmVmcmVzaFRva2VuU2VydmljZS5yZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbklmcmFtZVNlcnZpY2UucmVmcmVzaFNlc3Npb25XaXRoSWZyYW1lKGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnJiYmJiYmJiYmJiYmJiBwZXJpb2RpY2FsbHlDaGVjayQgPiBTRVQgTE9DSyBXQVMgRkFMU0UnLCAobmV3IERhdGUoKSkuZ2V0VGltZSgpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICApO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmludGVydmFsU2VydmljZS5ydW5Ub2tlblZhbGlkYXRpb25SdW5uaW5nID0gcGVyaW9kaWNhbGx5Q2hlY2skXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIGNhdGNoRXJyb3IoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcigncGVyaW9kaWNhbGx5IGNoZWNrIGZhaWxlZCcpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIClcclxuICAgICAgLnN1YnNjcmliZShcclxuICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NpbGVudCByZW5ldywgcGVyaW9kaWMgY2hlY2sgZmluaXNoZWQhJyk7XHJcbiAgICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAoZXJyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ3NpbGVudCByZW5ldyBmYWlsZWQhJywgZXJyKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgfVxyXG59XHJcbiJdfQ==