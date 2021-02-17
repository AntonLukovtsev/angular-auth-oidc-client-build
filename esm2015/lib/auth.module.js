import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { DataService } from './api/data.service';
import { HttpBaseService } from './api/http-base.service';
import { AuthStateService } from './authState/auth-state.service';
import { CheckAuthService } from './check-auth.service';
import { ConfigValidationService } from './config-validation/config-validation.service';
import { AuthWellKnownDataService } from './config/auth-well-known-data.service';
import { AuthWellKnownService } from './config/auth-well-known.service';
import { ConfigurationProvider } from './config/config.provider';
import { OidcConfigService } from './config/config.service';
import { FlowsDataService } from './flows/flows-data.service';
import { FlowsService } from './flows/flows.service';
import { RandomService } from './flows/random/random.service';
import { SigninKeyDataService } from './flows/signin-key-data.service';
import { CheckSessionService } from './iframe/check-session.service';
import { IFrameService } from './iframe/existing-iframe.service';
import { SilentRenewService } from './iframe/silent-renew.service';
import { LoggerService } from './logging/logger.service';
import { LoginService } from './login/login.service';
import { LogoffRevocationService } from './logoffRevoke/logoff-revocation.service';
import { OidcSecurityService } from './oidc.security.service';
import { PublicEventsService } from './public-events/public-events.service';
import { AbstractSecurityStorage } from './storage/abstract-security-storage';
import { BrowserStorageService } from './storage/browser-storage.service';
import { StoragePersistanceService } from './storage/storage-persistance.service';
import { UserService } from './userData/user-service';
import { EqualityService } from './utils/equality/equality.service';
import { FlowHelper } from './utils/flowHelper/flow-helper.service';
import { PlatformProvider } from './utils/platform-provider/platform.provider';
import { TokenHelperService } from './utils/tokenHelper/oidc-token-helper.service';
import { UrlService } from './utils/url/url.service';
import { StateValidationService } from './validation/state-validation.service';
import { TokenValidationService } from './validation/token-validation.service';
import * as i0 from "@angular/core";
export class AuthModule {
    static forRoot(token = {}) {
        return {
            ngModule: AuthModule,
            providers: [
                OidcConfigService,
                PublicEventsService,
                FlowHelper,
                OidcSecurityService,
                TokenValidationService,
                PlatformProvider,
                CheckSessionService,
                FlowsDataService,
                FlowsService,
                SilentRenewService,
                ConfigurationProvider,
                LogoffRevocationService,
                UserService,
                RandomService,
                HttpBaseService,
                UrlService,
                AuthStateService,
                SigninKeyDataService,
                StoragePersistanceService,
                TokenHelperService,
                LoggerService,
                IFrameService,
                EqualityService,
                LoginService,
                AuthWellKnownDataService,
                AuthWellKnownService,
                DataService,
                StateValidationService,
                ConfigValidationService,
                CheckAuthService,
                {
                    provide: AbstractSecurityStorage,
                    useClass: token.storage || BrowserStorageService,
                },
            ],
        };
    }
}
AuthModule.ɵmod = i0.ɵɵdefineNgModule({ type: AuthModule });
AuthModule.ɵinj = i0.ɵɵdefineInjector({ factory: function AuthModule_Factory(t) { return new (t || AuthModule)(); }, imports: [[CommonModule, HttpClientModule]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AuthModule, { imports: [CommonModule, HttpClientModule] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AuthModule, [{
        type: NgModule,
        args: [{
                imports: [CommonModule, HttpClientModule],
                declarations: [],
                exports: [],
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9hdXRoLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDdkUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDbkYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDNUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDbEYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNwRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDbkYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDOztBQU8vRSxNQUFNLE9BQU8sVUFBVTtJQUNyQixNQUFNLENBQUMsT0FBTyxDQUFDLFFBQWUsRUFBRTtRQUM5QixPQUFPO1lBQ0wsUUFBUSxFQUFFLFVBQVU7WUFDcEIsU0FBUyxFQUFFO2dCQUNULGlCQUFpQjtnQkFDakIsbUJBQW1CO2dCQUNuQixVQUFVO2dCQUNWLG1CQUFtQjtnQkFDbkIsc0JBQXNCO2dCQUN0QixnQkFBZ0I7Z0JBQ2hCLG1CQUFtQjtnQkFDbkIsZ0JBQWdCO2dCQUNoQixZQUFZO2dCQUNaLGtCQUFrQjtnQkFDbEIscUJBQXFCO2dCQUNyQix1QkFBdUI7Z0JBQ3ZCLFdBQVc7Z0JBQ1gsYUFBYTtnQkFDYixlQUFlO2dCQUNmLFVBQVU7Z0JBQ1YsZ0JBQWdCO2dCQUNoQixvQkFBb0I7Z0JBQ3BCLHlCQUF5QjtnQkFDekIsa0JBQWtCO2dCQUNsQixhQUFhO2dCQUNiLGFBQWE7Z0JBQ2IsZUFBZTtnQkFDZixZQUFZO2dCQUNaLHdCQUF3QjtnQkFDeEIsb0JBQW9CO2dCQUNwQixXQUFXO2dCQUNYLHNCQUFzQjtnQkFDdEIsdUJBQXVCO2dCQUN2QixnQkFBZ0I7Z0JBQ2hCO29CQUNFLE9BQU8sRUFBRSx1QkFBdUI7b0JBQ2hDLFFBQVEsRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLHFCQUFxQjtpQkFDakQ7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDOzs4Q0F6Q1UsVUFBVTttR0FBVixVQUFVLGtCQUpaLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDO3dGQUk5QixVQUFVLGNBSlgsWUFBWSxFQUFFLGdCQUFnQjtrREFJN0IsVUFBVTtjQUx0QixRQUFRO2VBQUM7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDO2dCQUN6QyxZQUFZLEVBQUUsRUFBRTtnQkFDaEIsT0FBTyxFQUFFLEVBQUU7YUFDWiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi9hcGkvZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSHR0cEJhc2VTZXJ2aWNlIH0gZnJvbSAnLi9hcGkvaHR0cC1iYXNlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ2hlY2tBdXRoU2VydmljZSB9IGZyb20gJy4vY2hlY2stYXV0aC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlnVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL2NvbmZpZy12YWxpZGF0aW9uL2NvbmZpZy12YWxpZGF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRoV2VsbEtub3duRGF0YVNlcnZpY2UgfSBmcm9tICcuL2NvbmZpZy9hdXRoLXdlbGwta25vd24tZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQXV0aFdlbGxLbm93blNlcnZpY2UgfSBmcm9tICcuL2NvbmZpZy9hdXRoLXdlbGwta25vd24uc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IE9pZGNDb25maWdTZXJ2aWNlIH0gZnJvbSAnLi9jb25maWcvY29uZmlnLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93c1NlcnZpY2UgfSBmcm9tICcuL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBSYW5kb21TZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9yYW5kb20vcmFuZG9tLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTaWduaW5LZXlEYXRhU2VydmljZSB9IGZyb20gJy4vZmxvd3Mvc2lnbmluLWtleS1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDaGVja1Nlc3Npb25TZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvY2hlY2stc2Vzc2lvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSUZyYW1lU2VydmljZSB9IGZyb20gJy4vaWZyYW1lL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9naW5TZXJ2aWNlIH0gZnJvbSAnLi9sb2dpbi9sb2dpbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UgfSBmcm9tICcuL2xvZ29mZlJldm9rZS9sb2dvZmYtcmV2b2NhdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgT2lkY1NlY3VyaXR5U2VydmljZSB9IGZyb20gJy4vb2lkYy5zZWN1cml0eS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUHVibGljRXZlbnRzU2VydmljZSB9IGZyb20gJy4vcHVibGljLWV2ZW50cy9wdWJsaWMtZXZlbnRzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBYnN0cmFjdFNlY3VyaXR5U3RvcmFnZSB9IGZyb20gJy4vc3RvcmFnZS9hYnN0cmFjdC1zZWN1cml0eS1zdG9yYWdlJztcclxuaW1wb3J0IHsgQnJvd3NlclN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi9zdG9yYWdlL2Jyb3dzZXItc3RvcmFnZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVc2VyU2VydmljZSB9IGZyb20gJy4vdXNlckRhdGEvdXNlci1zZXJ2aWNlJztcclxuaW1wb3J0IHsgRXF1YWxpdHlTZXJ2aWNlIH0gZnJvbSAnLi91dGlscy9lcXVhbGl0eS9lcXVhbGl0eS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUGxhdGZvcm1Qcm92aWRlciB9IGZyb20gJy4vdXRpbHMvcGxhdGZvcm0tcHJvdmlkZXIvcGxhdGZvcm0ucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuL3V0aWxzL3Rva2VuSGVscGVyL29pZGMtdG9rZW4taGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVcmxTZXJ2aWNlIH0gZnJvbSAnLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdGF0ZVZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi92YWxpZGF0aW9uL3N0YXRlLXZhbGlkYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL3ZhbGlkYXRpb24vdG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgSHR0cENsaWVudE1vZHVsZV0sXHJcbiAgZGVjbGFyYXRpb25zOiBbXSxcclxuICBleHBvcnRzOiBbXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIEF1dGhNb2R1bGUge1xyXG4gIHN0YXRpYyBmb3JSb290KHRva2VuOiBUb2tlbiA9IHt9KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuZ01vZHVsZTogQXV0aE1vZHVsZSxcclxuICAgICAgcHJvdmlkZXJzOiBbXHJcbiAgICAgICAgT2lkY0NvbmZpZ1NlcnZpY2UsXHJcbiAgICAgICAgUHVibGljRXZlbnRzU2VydmljZSxcclxuICAgICAgICBGbG93SGVscGVyLFxyXG4gICAgICAgIE9pZGNTZWN1cml0eVNlcnZpY2UsXHJcbiAgICAgICAgVG9rZW5WYWxpZGF0aW9uU2VydmljZSxcclxuICAgICAgICBQbGF0Zm9ybVByb3ZpZGVyLFxyXG4gICAgICAgIENoZWNrU2Vzc2lvblNlcnZpY2UsXHJcbiAgICAgICAgRmxvd3NEYXRhU2VydmljZSxcclxuICAgICAgICBGbG93c1NlcnZpY2UsXHJcbiAgICAgICAgU2lsZW50UmVuZXdTZXJ2aWNlLFxyXG4gICAgICAgIENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgICAgICBMb2dvZmZSZXZvY2F0aW9uU2VydmljZSxcclxuICAgICAgICBVc2VyU2VydmljZSxcclxuICAgICAgICBSYW5kb21TZXJ2aWNlLFxyXG4gICAgICAgIEh0dHBCYXNlU2VydmljZSxcclxuICAgICAgICBVcmxTZXJ2aWNlLFxyXG4gICAgICAgIEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICAgICAgU2lnbmluS2V5RGF0YVNlcnZpY2UsXHJcbiAgICAgICAgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgICAgICBUb2tlbkhlbHBlclNlcnZpY2UsXHJcbiAgICAgICAgTG9nZ2VyU2VydmljZSxcclxuICAgICAgICBJRnJhbWVTZXJ2aWNlLFxyXG4gICAgICAgIEVxdWFsaXR5U2VydmljZSxcclxuICAgICAgICBMb2dpblNlcnZpY2UsXHJcbiAgICAgICAgQXV0aFdlbGxLbm93bkRhdGFTZXJ2aWNlLFxyXG4gICAgICAgIEF1dGhXZWxsS25vd25TZXJ2aWNlLFxyXG4gICAgICAgIERhdGFTZXJ2aWNlLFxyXG4gICAgICAgIFN0YXRlVmFsaWRhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgQ29uZmlnVmFsaWRhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgQ2hlY2tBdXRoU2VydmljZSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBwcm92aWRlOiBBYnN0cmFjdFNlY3VyaXR5U3RvcmFnZSxcclxuICAgICAgICAgIHVzZUNsYXNzOiB0b2tlbi5zdG9yYWdlIHx8IEJyb3dzZXJTdG9yYWdlU2VydmljZSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFR5cGU8VD4gPSBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBUO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUb2tlbiB7XHJcbiAgc3RvcmFnZT86IFR5cGU8YW55PjtcclxufVxyXG4iXX0=