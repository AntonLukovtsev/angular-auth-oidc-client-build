import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthorizedState } from '../authState/authorized-state';
import { ValidationResult } from '../validation/validation-result';
import * as i0 from "@angular/core";
import * as i1 from "../config/config.provider";
import * as i2 from "./existing-iframe.service";
import * as i3 from "../flows/flows.service";
import * as i4 from "../flows/flows-data.service";
import * as i5 from "../authState/auth-state.service";
import * as i6 from "../logging/logger.service";
import * as i7 from "../utils/flowHelper/flow-helper.service";
import * as i8 from "../callback/implicit-flow-callback.service";
import * as i9 from "../callback/intervall.service";
const IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
export class SilentRenewService {
    constructor(configurationProvider, iFrameService, flowsService, flowsDataService, authStateService, loggerService, flowHelper, implicitFlowCallbackService, intervallService) {
        this.configurationProvider = configurationProvider;
        this.iFrameService = iFrameService;
        this.flowsService = flowsService;
        this.flowsDataService = flowsDataService;
        this.authStateService = authStateService;
        this.loggerService = loggerService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.intervallService = intervallService;
        this.refreshSessionWithIFrameCompletedInternal$ = new Subject();
    }
    get refreshSessionWithIFrameCompleted$() {
        return this.refreshSessionWithIFrameCompletedInternal$.asObservable();
    }
    getOrCreateIframe() {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
        }
        return existingIframe;
    }
    isSilentRenewConfigured() {
        return !this.configurationProvider.openIDConfiguration.useRefreshToken && this.configurationProvider.openIDConfiguration.silentRenew;
    }
    codeFlowCallbackSilentRenewIframe(urlParts) {
        const params = new HttpParams({
            fromString: urlParts[1],
        });
        const error = params.get('error');
        if (error) {
            this.authStateService.updateAndPublishAuthState({
                authorizationState: AuthorizedState.Unauthorized,
                validationResult: ValidationResult.LoginRequired,
                isRenewProcess: true,
            });
            this.flowsService.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.intervallService.stopPeriodicallTokenCheck();
            return throwError(error);
        }
        const code = params.get('code');
        const state = params.get('state');
        const sessionState = params.get('session_state');
        const callbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: true,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return this.flowsService.processSilentRenewCodeFlowCallback(callbackContext).pipe(catchError((errorFromFlow) => {
            this.intervallService.stopPeriodicallTokenCheck();
            this.flowsService.resetAuthorizationData();
            return throwError(errorFromFlow);
        }));
    }
    silentRenewEventHandler(e) {
        this.loggerService.logDebug('silentRenewEventHandler');
        if (!e.detail) {
            return;
        }
        this.flowsDataService.setSilentRenewRunningOnHandlerWhenIsNotLauched().then((isSuccess) => {
            if (!isSuccess)
                return;
            let callback$ = of(null);
            const isCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
            if (isCodeFlow) {
                const urlParts = e.detail.toString().split('?');
                callback$ = this.codeFlowCallbackSilentRenewIframe(urlParts);
            }
            else {
                callback$ = this.implicitFlowCallbackService.authorizedImplicitFlowCallback(e.detail);
            }
            callback$.subscribe((callbackContext) => {
                this.refreshSessionWithIFrameCompletedInternal$.next(callbackContext);
                this.flowsDataService.resetSilentRenewRunning();
            }, (err) => {
                this.loggerService.logError('Error: ' + err);
                this.refreshSessionWithIFrameCompletedInternal$.next(null);
                this.flowsDataService.resetSilentRenewRunning();
            });
        });
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
    }
}
SilentRenewService.ɵfac = function SilentRenewService_Factory(t) { return new (t || SilentRenewService)(i0.ɵɵinject(i1.ConfigurationProvider), i0.ɵɵinject(i2.IFrameService), i0.ɵɵinject(i3.FlowsService), i0.ɵɵinject(i4.FlowsDataService), i0.ɵɵinject(i5.AuthStateService), i0.ɵɵinject(i6.LoggerService), i0.ɵɵinject(i7.FlowHelper), i0.ɵɵinject(i8.ImplicitFlowCallbackService), i0.ɵɵinject(i9.IntervallService)); };
SilentRenewService.ɵprov = i0.ɵɵdefineInjectable({ token: SilentRenewService, factory: SilentRenewService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(SilentRenewService, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }, { type: i2.IFrameService }, { type: i3.FlowsService }, { type: i4.FlowsDataService }, { type: i5.AuthStateService }, { type: i6.LoggerService }, { type: i7.FlowHelper }, { type: i8.ImplicitFlowCallbackService }, { type: i9.IntervallService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lsZW50LXJlbmV3LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFTaEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7Ozs7Ozs7Ozs7O0FBR25FLE1BQU0sa0NBQWtDLEdBQUcsd0JBQXdCLENBQUM7QUFHcEUsTUFBTSxPQUFPLGtCQUFrQjtJQU83QixZQUNVLHFCQUE0QyxFQUM1QyxhQUE0QixFQUM1QixZQUEwQixFQUMxQixnQkFBa0MsRUFDbEMsZ0JBQWtDLEVBQ2xDLGFBQTRCLEVBQzVCLFVBQXNCLEVBQ3RCLDJCQUF3RCxFQUN4RCxnQkFBa0M7UUFSbEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBQ3hELHFCQUFnQixHQUFoQixnQkFB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QVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwUGFyYW1zIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IG9mLCBTdWJqZWN0LCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aG9yaXplZFN0YXRlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGhvcml6ZWQtc3RhdGUnO1xyXG5pbXBvcnQgeyBJbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2UgfSBmcm9tICcuLi9jYWxsYmFjay9pbXBsaWNpdC1mbG93LWNhbGxiYWNrLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBJbnRlcnZhbGxTZXJ2aWNlIH0gZnJvbSAnLi4vY2FsbGJhY2svaW50ZXJ2YWxsLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi4vZmxvd3MvY2FsbGJhY2stY29udGV4dCc7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93c1NlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uL3ZhbGlkYXRpb24vdmFsaWRhdGlvbi1yZXN1bHQnO1xyXG5pbXBvcnQgeyBJRnJhbWVTZXJ2aWNlIH0gZnJvbSAnLi9leGlzdGluZy1pZnJhbWUuc2VydmljZSc7XHJcblxyXG5jb25zdCBJRlJBTUVfRk9SX1NJTEVOVF9SRU5FV19JREVOVElGSUVSID0gJ215aUZyYW1lRm9yU2lsZW50UmVuZXcnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgU2lsZW50UmVuZXdTZXJ2aWNlIHtcclxuICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZEludGVybmFsJCA9IG5ldyBTdWJqZWN0PENhbGxiYWNrQ29udGV4dD4oKTtcclxuXHJcbiAgZ2V0IHJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZCQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbldpdGhJRnJhbWVDb21wbGV0ZWRJbnRlcm5hbCQuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGlGcmFtZVNlcnZpY2U6IElGcmFtZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSBpbXBsaWNpdEZsb3dDYWxsYmFja1NlcnZpY2U6IEltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZSxcclxuICAgIHByaXZhdGUgaW50ZXJ2YWxsU2VydmljZTogSW50ZXJ2YWxsU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgZ2V0T3JDcmVhdGVJZnJhbWUoKTogSFRNTElGcmFtZUVsZW1lbnQge1xyXG4gICAgY29uc3QgZXhpc3RpbmdJZnJhbWUgPSB0aGlzLmdldEV4aXN0aW5nSWZyYW1lKCk7XHJcblxyXG4gICAgaWYgKCFleGlzdGluZ0lmcmFtZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmFkZElGcmFtZVRvV2luZG93Qm9keShJRlJBTUVfRk9SX1NJTEVOVF9SRU5FV19JREVOVElGSUVSKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZXhpc3RpbmdJZnJhbWU7XHJcbiAgfVxyXG5cclxuICBpc1NpbGVudFJlbmV3Q29uZmlndXJlZCgpIHtcclxuICAgIHJldHVybiAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi51c2VSZWZyZXNoVG9rZW4gJiYgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ldztcclxuICB9XHJcblxyXG4gIGNvZGVGbG93Q2FsbGJhY2tTaWxlbnRSZW5ld0lmcmFtZSh1cmxQYXJ0cykge1xyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xyXG4gICAgICBmcm9tU3RyaW5nOiB1cmxQYXJ0c1sxXSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGVycm9yID0gcGFyYW1zLmdldCgnZXJyb3InKTtcclxuXHJcbiAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnVwZGF0ZUFuZFB1Ymxpc2hBdXRoU3RhdGUoe1xyXG4gICAgICAgIGF1dGhvcml6YXRpb25TdGF0ZTogQXV0aG9yaXplZFN0YXRlLlVuYXV0aG9yaXplZCxcclxuICAgICAgICB2YWxpZGF0aW9uUmVzdWx0OiBWYWxpZGF0aW9uUmVzdWx0LkxvZ2luUmVxdWlyZWQsXHJcbiAgICAgICAgaXNSZW5ld1Byb2Nlc3M6IHRydWUsXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5zZXROb25jZSgnJyk7XHJcbiAgICAgIHRoaXMuaW50ZXJ2YWxsU2VydmljZS5zdG9wUGVyaW9kaWNhbGxUb2tlbkNoZWNrKCk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb2RlID0gcGFyYW1zLmdldCgnY29kZScpO1xyXG4gICAgY29uc3Qgc3RhdGUgPSBwYXJhbXMuZ2V0KCdzdGF0ZScpO1xyXG4gICAgY29uc3Qgc2Vzc2lvblN0YXRlID0gcGFyYW1zLmdldCgnc2Vzc2lvbl9zdGF0ZScpO1xyXG5cclxuICAgIGNvbnN0IGNhbGxiYWNrQ29udGV4dCA9IHtcclxuICAgICAgY29kZSxcclxuICAgICAgcmVmcmVzaFRva2VuOiBudWxsLFxyXG4gICAgICBzdGF0ZSxcclxuICAgICAgc2Vzc2lvblN0YXRlLFxyXG4gICAgICBhdXRoUmVzdWx0OiBudWxsLFxyXG4gICAgICBpc1JlbmV3UHJvY2VzczogdHJ1ZSxcclxuICAgICAgand0S2V5czogbnVsbCxcclxuICAgICAgdmFsaWRhdGlvblJlc3VsdDogbnVsbCxcclxuICAgICAgZXhpc3RpbmdJZFRva2VuOiBudWxsLFxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5mbG93c1NlcnZpY2UucHJvY2Vzc1NpbGVudFJlbmV3Q29kZUZsb3dDYWxsYmFjayhjYWxsYmFja0NvbnRleHQpLnBpcGUoXHJcbiAgICAgIGNhdGNoRXJyb3IoKGVycm9yRnJvbUZsb3cpID0+IHtcclxuICAgICAgICB0aGlzLmludGVydmFsbFNlcnZpY2Uuc3RvcFBlcmlvZGljYWxsVG9rZW5DaGVjaygpO1xyXG4gICAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvckZyb21GbG93KTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBzaWxlbnRSZW5ld0V2ZW50SGFuZGxlcihlOiBDdXN0b21FdmVudCkge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnRSZW5ld0V2ZW50SGFuZGxlcicpO1xyXG4gICAgaWYgKCFlLmRldGFpbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNpbGVudFJlbmV3UnVubmluZ09uSGFuZGxlcldoZW5Jc05vdExhdWNoZWQoKS50aGVuKChpc1N1Y2Nlc3MpID0+IHtcclxuICAgICAgaWYgKCFpc1N1Y2Nlc3MpIHJldHVybjtcclxuXHJcbiAgICAgIGxldCBjYWxsYmFjayQgPSBvZihudWxsKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzQ29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCk7XHJcblxyXG4gICAgICBpZiAoaXNDb2RlRmxvdykge1xyXG4gICAgICAgIGNvbnN0IHVybFBhcnRzID0gZS5kZXRhaWwudG9TdHJpbmcoKS5zcGxpdCgnPycpO1xyXG4gICAgICAgIGNhbGxiYWNrJCA9IHRoaXMuY29kZUZsb3dDYWxsYmFja1NpbGVudFJlbmV3SWZyYW1lKHVybFBhcnRzKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYWxsYmFjayQgPSB0aGlzLmltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZS5hdXRob3JpemVkSW1wbGljaXRGbG93Q2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjYWxsYmFjayQuc3Vic2NyaWJlKFxyXG4gICAgICAgIChjYWxsYmFja0NvbnRleHQpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKGVycjogYW55KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ0Vycm9yOiAnICsgZXJyKTtcclxuICAgICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQobnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RXhpc3RpbmdJZnJhbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmdldEV4aXN0aW5nSUZyYW1lKElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIpO1xyXG4gIH1cclxufVxyXG4iXX0=