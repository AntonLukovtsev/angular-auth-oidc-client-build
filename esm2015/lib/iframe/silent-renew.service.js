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
        const isCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
        if (isCodeFlow) {
            const urlParts = e.detail.toString().split('?');
            this.loggerService.logDebug(`$$$$$$$$$$2 silentRenewEventHandler > urlParts[1]: ${urlParts[1]}`);
            const params = new HttpParams({
                fromString: urlParts[1],
            });
            this.loggerService.logDebug(`$$$$$$$$$$2 silentRenewEventHandler > params: ${params}`);
            const state = params.get('state');
            const currentState = this.flowsDataService.getAuthStateControl();
            if (currentState !== state) {
                this.loggerService.logWarning(`$$$$$$$$$$2 silentRenewEventHandler > states don't match currentState ${currentState} state from iframe url ${state}`);
                return;
            }
            this.loggerService.logDebug(`$$$$$$$$$$2 silentRenewEventHandler > AFTER CHECK OF isSilentRenewRunning currentState ${currentState} state from iframe url ${state}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lsZW50LXJlbmV3LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFTaEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7Ozs7Ozs7Ozs7O0FBR25FLE1BQU0sa0NBQWtDLEdBQUcsd0JBQXdCLENBQUM7QUFHcEUsTUFBTSxPQUFPLGtCQUFrQjtJQU83QixZQUNVLHFCQUE0QyxFQUM1QyxhQUE0QixFQUM1QixZQUEwQixFQUMxQixnQkFBa0MsRUFDbEMsZ0JBQWtDLEVBQ2xDLGFBQTRCLEVBQzVCLFVBQXNCLEVBQ3RCLDJCQUF3RCxFQUN4RCxnQkFBa0M7UUFSbEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQTZCO1FBQ3hELHFCQUFnQixHQUFoQixnQkFB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QUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxTQUFTLEdBQUcsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlEO2lCQUFNO2dCQUNMLFNBQVMsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZGO1lBRUQsU0FBUyxDQUFDLFNBQVMsQ0FDakIsQ0FBQyxlQUFlLEVBQUUsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDdEUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDbEQsQ0FBQyxFQUNELENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsMENBQTBDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNsRCxDQUFDLENBQ0YsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsa0NBQWtDLENBQUMsQ0FBQztJQUNsRixDQUFDOztvRkF2SVUsa0JBQWtCOzBEQUFsQixrQkFBa0IsV0FBbEIsa0JBQWtCO2tEQUFsQixrQkFBa0I7Y0FEOUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBQYXJhbXMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgb2YsIFN1YmplY3QsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRob3JpemVkU3RhdGUgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aG9yaXplZC1zdGF0ZSc7XHJcbmltcG9ydCB7IEltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZSB9IGZyb20gJy4uL2NhbGxiYWNrL2ltcGxpY2l0LWZsb3ctY2FsbGJhY2suc2VydmljZSc7XHJcbmltcG9ydCB7IEludGVydmFsbFNlcnZpY2UgfSBmcm9tICcuLi9jYWxsYmFjay9pbnRlcnZhbGwuc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9mbG93cy9jYWxsYmFjay1jb250ZXh0JztcclxuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi4vdmFsaWRhdGlvbi92YWxpZGF0aW9uLXJlc3VsdCc7XHJcbmltcG9ydCB7IElGcmFtZVNlcnZpY2UgfSBmcm9tICcuL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlJztcclxuXHJcbmNvbnN0IElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIgPSAnbXlpRnJhbWVGb3JTaWxlbnRSZW5ldyc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBTaWxlbnRSZW5ld1NlcnZpY2Uge1xyXG4gIHByaXZhdGUgcmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkID0gbmV3IFN1YmplY3Q8Q2FsbGJhY2tDb250ZXh0PigpO1xyXG5cclxuICBnZXQgcmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkJCgpIHtcclxuICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uV2l0aElGcmFtZUNvbXBsZXRlZEludGVybmFsJC5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgaUZyYW1lU2VydmljZTogSUZyYW1lU2VydmljZSxcclxuICAgIHByaXZhdGUgZmxvd3NTZXJ2aWNlOiBGbG93c1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXHJcbiAgICBwcml2YXRlIGltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZTogSW1wbGljaXRGbG93Q2FsbGJhY2tTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBpbnRlcnZhbGxTZXJ2aWNlOiBJbnRlcnZhbGxTZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBnZXRPckNyZWF0ZUlmcmFtZSgpOiBIVE1MSUZyYW1lRWxlbWVudCB7XHJcbiAgICBjb25zdCBleGlzdGluZ0lmcmFtZSA9IHRoaXMuZ2V0RXhpc3RpbmdJZnJhbWUoKTtcclxuXHJcbiAgICBpZiAoIWV4aXN0aW5nSWZyYW1lKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmlGcmFtZVNlcnZpY2UuYWRkSUZyYW1lVG9XaW5kb3dCb2R5KElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBleGlzdGluZ0lmcmFtZTtcclxuICB9XHJcblxyXG4gIGlzU2lsZW50UmVuZXdDb25maWd1cmVkKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnVzZVJlZnJlc2hUb2tlbiAmJiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3O1xyXG4gIH1cclxuXHJcbiAgY29kZUZsb3dDYWxsYmFja1NpbGVudFJlbmV3SWZyYW1lKHVybFBhcnRzKSB7XHJcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgSHR0cFBhcmFtcyh7XHJcbiAgICAgIGZyb21TdHJpbmc6IHVybFBhcnRzWzFdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgZXJyb3IgPSBwYXJhbXMuZ2V0KCdlcnJvcicpO1xyXG5cclxuICAgIGlmIChlcnJvcikge1xyXG4gICAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XHJcbiAgICAgICAgYXV0aG9yaXphdGlvblN0YXRlOiBBdXRob3JpemVkU3RhdGUuVW5hdXRob3JpemVkLFxyXG4gICAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IFZhbGlkYXRpb25SZXN1bHQuTG9naW5SZXF1aXJlZCxcclxuICAgICAgICBpc1JlbmV3UHJvY2VzczogdHJ1ZSxcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldE5vbmNlKCcnKTtcclxuICAgICAgdGhpcy5pbnRlcnZhbGxTZXJ2aWNlLnN0b3BQZXJpb2RpY2FsbFRva2VuQ2hlY2soKTtcclxuICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvZGUgPSBwYXJhbXMuZ2V0KCdjb2RlJyk7XHJcbiAgICBjb25zdCBzdGF0ZSA9IHBhcmFtcy5nZXQoJ3N0YXRlJyk7XHJcbiAgICBjb25zdCBzZXNzaW9uU3RhdGUgPSBwYXJhbXMuZ2V0KCdzZXNzaW9uX3N0YXRlJyk7XHJcblxyXG4gICAgY29uc3QgY2FsbGJhY2tDb250ZXh0ID0ge1xyXG4gICAgICBjb2RlLFxyXG4gICAgICByZWZyZXNoVG9rZW46IG51bGwsXHJcbiAgICAgIHN0YXRlLFxyXG4gICAgICBzZXNzaW9uU3RhdGUsXHJcbiAgICAgIGF1dGhSZXN1bHQ6IG51bGwsXHJcbiAgICAgIGlzUmVuZXdQcm9jZXNzOiB0cnVlLFxyXG4gICAgICBqd3RLZXlzOiBudWxsLFxyXG4gICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxyXG4gICAgICBleGlzdGluZ0lkVG9rZW46IG51bGwsXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB0aGlzLmZsb3dzU2VydmljZS5wcm9jZXNzU2lsZW50UmVuZXdDb2RlRmxvd0NhbGxiYWNrKGNhbGxiYWNrQ29udGV4dCkucGlwZShcclxuICAgICAgY2F0Y2hFcnJvcigoZXJyb3JGcm9tRmxvdykgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWxsU2VydmljZS5zdG9wUGVyaW9kaWNhbGxUb2tlbkNoZWNrKCk7XHJcbiAgICAgICAgdGhpcy5mbG93c1NlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yRnJvbUZsb3cpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHNpbGVudFJlbmV3RXZlbnRIYW5kbGVyKGU6IEN1c3RvbUV2ZW50KSB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NpbGVudFJlbmV3RXZlbnRIYW5kbGVyJyk7XHJcbiAgICBpZiAoIWUuZGV0YWlsKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0NvZGVGbG93ID0gdGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpO1xyXG5cclxuICAgIGlmIChpc0NvZGVGbG93KXtcclxuICAgICAgY29uc3QgdXJsUGFydHMgPSBlLmRldGFpbC50b1N0cmluZygpLnNwbGl0KCc/Jyk7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgJCQkJCQkJCQkJDIgc2lsZW50UmVuZXdFdmVudEhhbmRsZXIgPiB1cmxQYXJ0c1sxXTogJHt1cmxQYXJ0c1sxXX1gKTtcclxuICAgICAgY29uc3QgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xyXG4gICAgICAgIGZyb21TdHJpbmc6IHVybFBhcnRzWzFdLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgJCQkJCQkJCQkJDIgc2lsZW50UmVuZXdFdmVudEhhbmRsZXIgPiBwYXJhbXM6ICR7cGFyYW1zfWApO1xyXG5cclxuICAgICAgY29uc3Qgc3RhdGUgPSBwYXJhbXMuZ2V0KCdzdGF0ZScpO1xyXG4gICAgICBjb25zdCBjdXJyZW50U3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0QXV0aFN0YXRlQ29udHJvbCgpO1xyXG5cclxuICAgICAgaWYgKGN1cnJlbnRTdGF0ZSAhPT0gc3RhdGUpe1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGAkJCQkJCQkJCQkMiBzaWxlbnRSZW5ld0V2ZW50SGFuZGxlciA+IHN0YXRlcyBkb24ndCBtYXRjaCBjdXJyZW50U3RhdGUgJHtjdXJyZW50U3RhdGV9IHN0YXRlIGZyb20gaWZyYW1lIHVybCAke3N0YXRlfWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGAkJCQkJCQkJCQkMiBzaWxlbnRSZW5ld0V2ZW50SGFuZGxlciA+IEFGVEVSIENIRUNLIE9GIGlzU2lsZW50UmVuZXdSdW5uaW5nIGN1cnJlbnRTdGF0ZSAke2N1cnJlbnRTdGF0ZX0gc3RhdGUgZnJvbSBpZnJhbWUgdXJsICR7c3RhdGV9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNpbGVudFJlbmV3UnVubmluZ09uSGFuZGxlcldoZW5Jc05vdExhdWNoZWQoKS50aGVuKChpc1N1Y2Nlc3MpID0+IHtcclxuICAgICAgaWYgKCFpc1N1Y2Nlc3MpIHJldHVybjtcclxuXHJcbiAgICAgIGxldCBjYWxsYmFjayQgPSBvZihudWxsKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzQ29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCk7XHJcblxyXG4gICAgICBpZiAoaXNDb2RlRmxvdykge1xyXG4gICAgICAgIGNvbnN0IHVybFBhcnRzID0gZS5kZXRhaWwudG9TdHJpbmcoKS5zcGxpdCgnPycpO1xyXG4gICAgICAgIGNhbGxiYWNrJCA9IHRoaXMuY29kZUZsb3dDYWxsYmFja1NpbGVudFJlbmV3SWZyYW1lKHVybFBhcnRzKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYWxsYmFjayQgPSB0aGlzLmltcGxpY2l0Rmxvd0NhbGxiYWNrU2VydmljZS5hdXRob3JpemVkSW1wbGljaXRGbG93Q2FsbGJhY2soZS5kZXRhaWwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjYWxsYmFjayQuc3Vic2NyaWJlKFxyXG4gICAgICAgIChjYWxsYmFja0NvbnRleHQpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQoY2FsbGJhY2tDb250ZXh0KTtcclxuICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgKGVycjogYW55KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ0Vycm9yOiAnICsgZXJyKTtcclxuICAgICAgICAgIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoSUZyYW1lQ29tcGxldGVkSW50ZXJuYWwkLm5leHQobnVsbCk7XHJcbiAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0RXhpc3RpbmdJZnJhbWUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmdldEV4aXN0aW5nSUZyYW1lKElGUkFNRV9GT1JfU0lMRU5UX1JFTkVXX0lERU5USUZJRVIpO1xyXG4gIH1cclxufVxyXG4iXX0=