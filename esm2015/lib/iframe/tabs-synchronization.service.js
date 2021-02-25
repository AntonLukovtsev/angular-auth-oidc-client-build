import { Injectable } from '@angular/core';
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';
import { ReplaySubject } from 'rxjs';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../config/config.provider";
import * as i2 from "../public-events/public-events.service";
import * as i3 from "./../logging/logger.service";
export class TabsSynchronizationService {
    constructor(configurationProvider, publicEventsService, loggerService) {
        this.configurationProvider = configurationProvider;
        this.publicEventsService = publicEventsService;
        this.loggerService = loggerService;
        this._isLeaderSubjectInitialized = false;
        this._silentRenewFinished$ = new ReplaySubject();
        this._currentRandomId = `${Math.random().toString(36).substr(2, 9)}_${new Date().getUTCMilliseconds()}`;
        this.Initialization();
    }
    isLeaderCheck() {
        return new Promise((resolve) => {
            this.loggerService.logDebug(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            if (!this._isLeaderSubjectInitialized) {
                setTimeout(() => {
                    if (!this._isLeaderSubjectInitialized) {
                        this.loggerService.logWarning(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId} > leader subject doesn't initialized`);
                        resolve(false);
                    }
                    else {
                        resolve(this._elector.isLeader);
                    }
                    return;
                }, 1000);
            }
            setTimeout(() => {
                const isLeader = this._elector.isLeader;
                this.loggerService.logWarning(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId} > inside setTimeout isLeader = ${isLeader}`);
                resolve(isLeader);
            }, 1000);
        });
    }
    getSilentRenewFinishedObservable() {
        return this._silentRenewFinished$.asObservable();
    }
    sendSilentRenewFinishedNotification() {
        if (!this._silentRenewFinishedChannel) {
            this._silentRenewFinishedChannel = new BroadcastChannel(`${this._prefix}_silent_renew_finished`);
        }
        this._silentRenewFinishedChannel.postMessage(`Silent renew finished by _currentRandomId ${this._currentRandomId}`);
    }
    Initialization() {
        var _a;
        this.loggerService.logDebug('TabsSynchronizationService > Initialization started');
        this._prefix = ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId) || '';
        const channel = new BroadcastChannel(`${this._prefix}_leader`);
        this._elector = createLeaderElection(channel, {
            fallbackInterval: 2000,
            responseTime: 1000,
        });
        this._elector.awaitLeadership().then(() => {
            if (!this._isLeaderSubjectInitialized) {
                this._isLeaderSubjectInitialized = true;
            }
            this.loggerService.logDebug(`this tab is now leader > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        });
        this.initializeSilentRenewFinishedChannelWithHandler();
    }
    initializeSilentRenewFinishedChannelWithHandler() {
        this._silentRenewFinishedChannel = new BroadcastChannel(`${this._prefix}_silent_renew_finished`);
        this._silentRenewFinishedChannel.onmessage = () => {
            this.loggerService.logDebug(`FROM SILENT RENEW FINISHED RECIVED EVENT > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            this._silentRenewFinished$.next(true);
            this.publicEventsService.fireEvent(EventTypes.SilentRenewFinished, true);
        };
    }
}
TabsSynchronizationService.ɵfac = function TabsSynchronizationService_Factory(t) { return new (t || TabsSynchronizationService)(i0.ɵɵinject(i1.ConfigurationProvider), i0.ɵɵinject(i2.PublicEventsService), i0.ɵɵinject(i3.LoggerService)); };
TabsSynchronizationService.ɵprov = i0.ɵɵdefineInjectable({ token: TabsSynchronizationService, factory: TabsSynchronizationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(TabsSynchronizationService, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }, { type: i2.PublicEventsService }, { type: i3.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy1zeW5jaHJvbml6YXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2lmcmFtZS90YWJzLXN5bmNocm9uaXphdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFpQixNQUFNLG1CQUFtQixDQUFDO0FBQzFGLE9BQU8sRUFBYyxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7OztBQUsxRCxNQUFNLE9BQU8sMEJBQTBCO0lBU3JDLFlBQ21CLHFCQUE0QyxFQUM1QyxtQkFBd0MsRUFDeEMsYUFBNEI7UUFGNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBWHZDLGdDQUEyQixHQUFHLEtBQUssQ0FBQztRQUdwQywwQkFBcUIsR0FBRyxJQUFJLGFBQWEsRUFBVyxDQUFDO1FBRXJELHFCQUFnQixHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDO1FBUXpHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU0sYUFBYTtRQUNsQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLElB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RCxJQUFJLENBQUMsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2pILENBQUM7WUFDRixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNFLENBQUMsQ0FBQztJQUNKLENBQUM7O29HQXZGVSwwQkFBMEI7a0VBQTFCLDBCQUEwQixXQUExQiwwQkFBMEI7a0RBQTFCLDBCQUEwQjtjQUR0QyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBCcm9hZGNhc3RDaGFubmVsLCBjcmVhdGVMZWFkZXJFbGVjdGlvbiwgTGVhZGVyRWxlY3RvciB9IGZyb20gJ2Jyb2FkY2FzdC1jaGFubmVsJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgUmVwbGF5U3ViamVjdCB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgRXZlbnRUeXBlcyB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvZXZlbnQtdHlwZXMnO1xyXG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9wdWJsaWMtZXZlbnRzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFRhYnNTeW5jaHJvbml6YXRpb25TZXJ2aWNlIHtcclxuICBwcml2YXRlIF9pc0xlYWRlclN1YmplY3RJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gIHByaXZhdGUgX2VsZWN0b3I6IExlYWRlckVsZWN0b3I7XHJcbiAgcHJpdmF0ZSBfc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWw6IEJyb2FkY2FzdENoYW5uZWw7XHJcbiAgcHJpdmF0ZSBfc2lsZW50UmVuZXdGaW5pc2hlZCQgPSBuZXcgUmVwbGF5U3ViamVjdDxib29sZWFuPigpO1xyXG5cclxuICBwcml2YXRlIF9jdXJyZW50UmFuZG9tSWQgPSBgJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9XyR7bmV3IERhdGUoKS5nZXRVVENNaWxsaXNlY29uZHMoKX1gO1xyXG4gIHByaXZhdGUgX3ByZWZpeDogc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IHB1YmxpY0V2ZW50c1NlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2VcclxuICApIHtcclxuICAgIHRoaXMuSW5pdGlhbGl6YXRpb24oKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0xlYWRlckNoZWNrKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNMZWFkZXJDaGVjayA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgaWYgKCF0aGlzLl9pc0xlYWRlclN1YmplY3RJbml0aWFsaXplZCkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCF0aGlzLl9pc0xlYWRlclN1YmplY3RJbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcclxuICAgICAgICAgICAgICBgaXNMZWFkZXJDaGVjayA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH0gPiBsZWFkZXIgc3ViamVjdCBkb2Vzbid0IGluaXRpYWxpemVkYFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodGhpcy5fZWxlY3Rvci5pc0xlYWRlcik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0sIDEwMDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICBjb25zdCBpc0xlYWRlciA9IHRoaXMuX2VsZWN0b3IuaXNMZWFkZXI7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoXHJcbiAgICAgICAgICBgaXNMZWFkZXJDaGVjayA+IHByZWZpeDogJHt0aGlzLl9wcmVmaXh9ID4gY3VycmVudFJhbmRvbUlkOiAke3RoaXMuX2N1cnJlbnRSYW5kb21JZH0gPiBpbnNpZGUgc2V0VGltZW91dCBpc0xlYWRlciA9ICR7aXNMZWFkZXJ9YFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmVzb2x2ZShpc0xlYWRlcik7XHJcbiAgICAgIH0sIDEwMDApO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2lsZW50UmVuZXdGaW5pc2hlZE9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZCQuYXNPYnNlcnZhYmxlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2VuZFNpbGVudFJlbmV3RmluaXNoZWROb3RpZmljYXRpb24oKSB7XHJcbiAgICBpZiAoIXRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsKSB7XHJcbiAgICAgIHRoaXMuX3NpbGVudFJlbmV3RmluaXNoZWRDaGFubmVsID0gbmV3IEJyb2FkY2FzdENoYW5uZWwoYCR7dGhpcy5fcHJlZml4fV9zaWxlbnRfcmVuZXdfZmluaXNoZWRgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbC5wb3N0TWVzc2FnZShgU2lsZW50IHJlbmV3IGZpbmlzaGVkIGJ5IF9jdXJyZW50UmFuZG9tSWQgJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIEluaXRpYWxpemF0aW9uKCk6IHZvaWQge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdUYWJzU3luY2hyb25pemF0aW9uU2VydmljZSA+IEluaXRpYWxpemF0aW9uIHN0YXJ0ZWQnKTtcclxuICAgIHRoaXMuX3ByZWZpeCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LmNsaWVudElkIHx8ICcnO1xyXG4gICAgY29uc3QgY2hhbm5lbCA9IG5ldyBCcm9hZGNhc3RDaGFubmVsKGAke3RoaXMuX3ByZWZpeH1fbGVhZGVyYCk7XHJcblxyXG4gICAgdGhpcy5fZWxlY3RvciA9IGNyZWF0ZUxlYWRlckVsZWN0aW9uKGNoYW5uZWwsIHtcclxuICAgICAgZmFsbGJhY2tJbnRlcnZhbDogMjAwMCwgLy8gb3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgaG93IG9mdGVuIHdpbGwgcmVuZWdvdGlhdGlvbiBmb3IgbGVhZGVyIG9jY3VyXHJcbiAgICAgIHJlc3BvbnNlVGltZTogMTAwMCwgLy8gb3B0aW9uYWwgY29uZmlndXJhdGlvbiBmb3IgaG93IGxvbmcgd2lsbCBpbnN0YW5jZXMgaGF2ZSB0byByZXNwb25kXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9lbGVjdG9yLmF3YWl0TGVhZGVyc2hpcCgpLnRoZW4oKCkgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMuX2lzTGVhZGVyU3ViamVjdEluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgdGhpcy5faXNMZWFkZXJTdWJqZWN0SW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHRoaXMgdGFiIGlzIG5vdyBsZWFkZXIgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmluaXRpYWxpemVTaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbFdpdGhIYW5kbGVyKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVTaWxlbnRSZW5ld0ZpbmlzaGVkQ2hhbm5lbFdpdGhIYW5kbGVyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwgPSBuZXcgQnJvYWRjYXN0Q2hhbm5lbChgJHt0aGlzLl9wcmVmaXh9X3NpbGVudF9yZW5ld19maW5pc2hlZGApO1xyXG4gICAgdGhpcy5fc2lsZW50UmVuZXdGaW5pc2hlZENoYW5uZWwub25tZXNzYWdlID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXHJcbiAgICAgICAgYEZST00gU0lMRU5UIFJFTkVXIEZJTklTSEVEIFJFQ0lWRUQgRVZFTlQgPiBwcmVmaXg6ICR7dGhpcy5fcHJlZml4fSA+IGN1cnJlbnRSYW5kb21JZDogJHt0aGlzLl9jdXJyZW50UmFuZG9tSWR9YFxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLl9zaWxlbnRSZW5ld0ZpbmlzaGVkJC5uZXh0KHRydWUpO1xyXG4gICAgICB0aGlzLnB1YmxpY0V2ZW50c1NlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuU2lsZW50UmVuZXdGaW5pc2hlZCwgdHJ1ZSk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iXX0=