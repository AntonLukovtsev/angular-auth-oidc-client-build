import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistance.service";
import * as i2 from "./random/random.service";
import * as i3 from "../config/config.provider";
import * as i4 from "../logging/logger.service";
export class FlowsDataService {
    constructor(storagePersistanceService, randomService, configurationProvider, loggerService) {
        this.storagePersistanceService = storagePersistanceService;
        this.randomService = randomService;
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
    }
    createNonce() {
        const nonce = this.randomService.createRandom(40);
        this.setNonce(nonce);
        return nonce;
    }
    setNonce(nonce) {
        this.storagePersistanceService.write('authNonce', nonce);
    }
    getAuthStateControl() {
        return this.storagePersistanceService.read('authStateControl');
    }
    setAuthStateControl(authStateControl) {
        this.storagePersistanceService.write('authStateControl', authStateControl);
    }
    getExistingOrCreateAuthStateControl() {
        let state = this.storagePersistanceService.read('authStateControl');
        if (!state) {
            state = this.randomService.createRandom(40);
            this.storagePersistanceService.write('authStateControl', state);
        }
        return state;
    }
    setSessionState(sessionState) {
        this.storagePersistanceService.write('session_state', sessionState);
    }
    resetStorageFlowData() {
        this.storagePersistanceService.resetStorageFlowData();
    }
    getCodeVerifier() {
        return this.storagePersistanceService.read('codeVerifier');
    }
    createCodeVerifier() {
        const codeVerifier = this.randomService.createRandom(67);
        this.storagePersistanceService.write('codeVerifier', codeVerifier);
        return codeVerifier;
    }
    // isSilentRenewRunning() {
    //   const storageObject = JSON.parse(this.storagePersistanceService.read('storageSilentRenewRunning'));
    //   if (storageObject) {
    //     const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
    //     const currentDateUtc = Date.parse(new Date().toISOString());
    //     const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
    //     const isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
    //     if (isProbablyStuck) {
    //       this.loggerService.logDebug('silent renew process is probably stuck, state will be reset.');
    //       this.resetSilentRenewRunning();
    //       return false;
    //     }
    //     return storageObject.state === 'running';
    //   }
    //   return false;
    // }
    setSilentRenewRunning() {
        const storageObject = {
            state: 'running',
            dateOfLaunchedProcessUtc: new Date().toISOString(),
        };
        this.storagePersistanceService.write('storageSilentRenewRunning', JSON.stringify(storageObject));
    }
    resetSilentRenewRunning() {
        this.storagePersistanceService.write('storageSilentRenewRunning', '');
    }
    isSilentRenewRunning(state = null) {
        const json = this.storagePersistanceService.read('storageSilentRenewRunning');
        const storageObject = !!json ? JSON.parse(json) : null;
        if (storageObject) {
            const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
            const currentDateUtc = Date.parse(new Date().toISOString());
            const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
            const isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
            if (isProbablyStuck) {
                this.loggerService.logDebug('silent renew process is probably stuck, state will be reset.');
                this.resetSilentRenewRunning();
                return false;
            }
            this.loggerService.logDebug(`isSilentRenewRunning > state: ${state} currentTime: ${new Date().toTimeString()}`);
            if (!!state) {
                this.loggerService.logDebug(`isSilentRenewRunning > state: ${state} > inside !!state > currentTime: ${new Date().toTimeString()}`);
                return storageObject.state === state;
            }
            this.loggerService.logDebug(`isSilentRenewRunning > state: ${state} > after !!state > currentTime: ${new Date().toTimeString()}`);
            return storageObject.state === 'running' || storageObject.state === 'onHandler';
        }
        return false;
    }
    setSilentRenewRunningOnHandlerWhenIsNotLauched() {
        this.loggerService.logDebug(`setSilentRenewRunningOnHandlerWhenIsNotLauched currentTime: ${new Date().toTimeString()}`);
        const lockingModel = {
            state: 'onHandler',
            xKey: 'oidc-on-handler-running-x',
            yKey: 'oidc-on-handler-running-y'
        };
        return this.runMutualExclusionLockingAlgorithm(lockingModel, 'storageSilentRenewRunning');
    }
    setSilentRenewRunningWhenIsNotLauched() {
        this.loggerService.logDebug(`setSilentRenewRunningWhenIsNotLauched currentTime: ${new Date().toTimeString()}`);
        const lockingModel = {
            state: 'running',
            xKey: 'oidc-process-running-x',
            yKey: 'oidc-process-running-y'
        };
        return this.runMutualExclusionLockingAlgorithm(lockingModel, 'storageSilentRenewRunning');
    }
    runMutualExclusionLockingAlgorithm(lockingModel, key) {
        return new Promise((resolve) => {
            const currentRandomId = `${Math.random().toString(36).substr(2, 9)}_${new Date().getUTCMilliseconds()}`;
            this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > currentRandomId: ${currentRandomId}`);
            const onSuccessLocking = () => {
                this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > INSIDE onSuccessLocking > currentRandomId: ${currentRandomId}`);
                if (this.isSilentRenewRunning(lockingModel.state)) {
                    this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > INSIDE onSuccessLocking > this.isSilentRenewRunning return true we go back > currentRandomId: ${currentRandomId}`);
                    resolve(false);
                }
                else {
                    this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > INSIDE onSuccessLocking > VICTORY !!!! WE WIN AND SET VALUE> currentRandomId: ${currentRandomId}`);
                    const storageObject = {
                        state: lockingModel.state,
                        dateOfLaunchedProcessUtc: new Date().toISOString(),
                    };
                    this.storagePersistanceService.write(key, JSON.stringify(storageObject));
                    // Release lock
                    this.storagePersistanceService.write(lockingModel.yKey, '');
                    resolve(true);
                }
            };
            this.storagePersistanceService.write(lockingModel.xKey, currentRandomId);
            const readedValueY = this.storagePersistanceService.read(lockingModel.yKey);
            if (!!readedValueY) {
                this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > readedValueY !== '' > currentRandomId: ${currentRandomId}`);
                const storageObject = JSON.parse(readedValueY);
                const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
                const currentDateUtc = Date.parse(new Date().toISOString());
                const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
                const isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
                if (isProbablyStuck) {
                    // Release lock
                    this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > isProbablyStuck - clear Y key> currentRandomId: ${currentRandomId}`);
                    this.storagePersistanceService.write(lockingModel.yKey, '');
                }
                resolve(false);
                return;
            }
            this.storagePersistanceService.write(lockingModel.yKey, JSON.stringify({
                id: currentRandomId,
                dateOfLaunchedProcessUtc: new Date().toISOString()
            }));
            if (this.storagePersistanceService.read(lockingModel.xKey) !== currentRandomId) {
                this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > before setTimeout > currentRandomId: ${currentRandomId}`);
                setTimeout(() => {
                    if (this.storagePersistanceService.read(lockingModel.yKey) !== currentRandomId) {
                        this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > inside setTimeout > we LOSE > currentRandomId: ${currentRandomId}`);
                        resolve(false);
                        return;
                    }
                    this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > inside setTimeout > we WIN > currentRandomId: ${currentRandomId}`);
                    onSuccessLocking();
                }, Math.round(Math.random() * 100));
            }
            else {
                this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > WE WIN ALL CONDITIONS > currentRandomId: ${currentRandomId}`);
                onSuccessLocking();
            }
        });
    }
}
FlowsDataService.ɵfac = function FlowsDataService_Factory(t) { return new (t || FlowsDataService)(i0.ɵɵinject(i1.StoragePersistanceService), i0.ɵɵinject(i2.RandomService), i0.ɵɵinject(i3.ConfigurationProvider), i0.ɵɵinject(i4.LoggerService)); };
FlowsDataService.ɵprov = i0.ɵɵdefineInjectable({ token: FlowsDataService, factory: FlowsDataService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FlowsDataService, [{
        type: Injectable
    }], function () { return [{ type: i1.StoragePersistanceService }, { type: i2.RandomService }, { type: i3.ConfigurationProvider }, { type: i4.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3MtZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7OztBQWEzQyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1UseUJBQW9ELEVBQ3BELGFBQTRCLEVBQzVCLHFCQUE0QyxFQUM1QyxhQUE0QjtRQUg1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDbkMsQ0FBQztJQUVKLFdBQVc7UUFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFhO1FBQ3BCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxtQkFBbUI7UUFDakIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELG1CQUFtQixDQUFDLGdCQUF3QjtRQUMxQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELG1DQUFtQztRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNWLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsZUFBZSxDQUFDLFlBQWlCO1FBQy9CLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRCxvQkFBb0I7UUFDbEIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUVELGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNuRSxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLHdHQUF3RztJQUV4Ryx5QkFBeUI7SUFDekIsMkZBQTJGO0lBQzNGLG1FQUFtRTtJQUNuRSw2RkFBNkY7SUFDN0YsNklBQTZJO0lBRTdJLDZCQUE2QjtJQUM3QixxR0FBcUc7SUFDckcsd0NBQXdDO0lBQ3hDLHNCQUFzQjtJQUN0QixRQUFRO0lBRVIsZ0RBQWdEO0lBQ2hELE1BQU07SUFFTixrQkFBa0I7SUFDbEIsSUFBSTtJQUVKLHFCQUFxQjtRQUNuQixNQUFNLGFBQWEsR0FBRztZQUNwQixLQUFLLEVBQUUsU0FBUztZQUNoQix3QkFBd0IsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNuRCxDQUFDO1FBRUYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7SUFDbkcsQ0FBQztJQUVELHVCQUF1QjtRQUNyQixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxRQUFnQixJQUFJO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUM5RSxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFdkQsSUFBSSxhQUFhLEVBQUU7WUFDakIsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3BGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzVELE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsd0JBQXdCLENBQUMsQ0FBQztZQUN0RixNQUFNLGVBQWUsR0FBRyx5QkFBeUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDO1lBRXRJLElBQUksZUFBZSxFQUFFO2dCQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO2dCQUM1RixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztnQkFDL0IsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxLQUFLLGlCQUFpQixJQUFJLElBQUksRUFBRSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoSCxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUM7Z0JBQ1YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEtBQUssb0NBQW9DLElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNuSSxPQUFPLGFBQWEsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDO2FBQ3RDO1lBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsaUNBQWlDLEtBQUssbUNBQW1DLElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWxJLE9BQU8sYUFBYSxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksYUFBYSxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUM7U0FDakY7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCw4Q0FBOEM7UUFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsK0RBQStELElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hILE1BQU0sWUFBWSxHQUFpQztZQUNqRCxLQUFLLEVBQUUsV0FBVztZQUNsQixJQUFJLEVBQUUsMkJBQTJCO1lBQ2pDLElBQUksRUFBRSwyQkFBMkI7U0FDbEMsQ0FBQTtRQUVELE9BQU8sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLFlBQVksRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFRCxxQ0FBcUM7UUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0RBQXNELElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRS9HLE1BQU0sWUFBWSxHQUFpQztZQUNqRCxLQUFLLEVBQUUsU0FBUztZQUNoQixJQUFJLEVBQUUsd0JBQXdCO1lBQzlCLElBQUksRUFBRSx3QkFBd0I7U0FDL0IsQ0FBQTtRQUVELE9BQU8sSUFBSSxDQUFDLGtDQUFrQyxDQUFDLFlBQVksRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFTyxrQ0FBa0MsQ0FBQyxZQUF5QyxFQUFFLEdBQWdCO1FBQ3BHLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUM3QixNQUFNLGVBQWUsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQztZQUV4RyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrQ0FBK0MsWUFBWSxDQUFDLEtBQUssd0JBQXdCLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFFeEksTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLCtDQUErQyxZQUFZLENBQUMsS0FBSyxrREFBa0QsZUFBZSxFQUFFLENBQUMsQ0FBQztnQkFDbEssSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNqRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrQ0FBK0MsWUFBWSxDQUFDLEtBQUsscUdBQXFHLGVBQWUsRUFBRSxDQUFDLENBQUM7b0JBQ3JOLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDaEI7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsK0NBQStDLFlBQVksQ0FBQyxLQUFLLHFGQUFxRixlQUFlLEVBQUUsQ0FBQyxDQUFDO29CQUNyTSxNQUFNLGFBQWEsR0FBRzt3QkFDcEIsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLO3dCQUN6Qix3QkFBd0IsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtxQkFDbkQsQ0FBQztvQkFDRixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ3pFLGVBQWU7b0JBQ2YsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2Y7WUFDSCxDQUFDLENBQUM7WUFFRixJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDekUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7WUFFM0UsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFO2dCQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrQ0FBK0MsWUFBWSxDQUFDLEtBQUssOENBQThDLGVBQWUsRUFBRSxDQUFDLENBQUM7Z0JBQzlKLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFDcEYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQzVELE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsd0JBQXdCLENBQUMsQ0FBQztnQkFDdEYsTUFBTSxlQUFlLEdBQUcseUJBQXlCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQztnQkFFdEksSUFBSSxlQUFlLEVBQUM7b0JBQ2pCLGVBQWU7b0JBQ2xCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLCtDQUErQyxZQUFZLENBQUMsS0FBSyx1REFBdUQsZUFBZSxFQUFFLENBQUMsQ0FBQztvQkFDdkssSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRDtnQkFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2YsT0FBTzthQUNSO1lBRUQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3JFLEVBQUUsRUFBRSxlQUFlO2dCQUNuQix3QkFBd0IsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTthQUNuRCxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssZUFBZSxFQUFFO2dCQUM5RSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrQ0FBK0MsWUFBWSxDQUFDLEtBQUssNENBQTRDLGVBQWUsRUFBRSxDQUFDLENBQUM7Z0JBQzVKLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ2QsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxlQUFlLEVBQUU7d0JBQzlFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLCtDQUErQyxZQUFZLENBQUMsS0FBSyxzREFBc0QsZUFBZSxFQUFFLENBQUMsQ0FBQzt3QkFDdEssT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNmLE9BQU87cUJBQ1I7b0JBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsK0NBQStDLFlBQVksQ0FBQyxLQUFLLHFEQUFxRCxlQUFlLEVBQUUsQ0FBQyxDQUFDO29CQUNySyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNyQixDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNyQztpQkFBTTtnQkFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrQ0FBK0MsWUFBWSxDQUFDLEtBQUssZ0RBQWdELGVBQWUsRUFBRSxDQUFDLENBQUM7Z0JBQ2hLLGdCQUFnQixFQUFFLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O2dGQTlNVSxnQkFBZ0I7d0RBQWhCLGdCQUFnQixXQUFoQixnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQUQ1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlS2V5cywgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmFuZG9tU2VydmljZSB9IGZyb20gJy4vcmFuZG9tL3JhbmRvbS5zZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsIHtcclxuICB4S2V5OiBTdG9yYWdlS2V5cyxcclxuICB5S2V5OiBTdG9yYWdlS2V5cyxcclxuICBzdGF0ZTogc3RyaW5nXHJcbn1cclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIEZsb3dzRGF0YVNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByYW5kb21TZXJ2aWNlOiBSYW5kb21TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgY3JlYXRlTm9uY2UoKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IG5vbmNlID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg0MCk7XHJcbiAgICB0aGlzLnNldE5vbmNlKG5vbmNlKTtcclxuICAgIHJldHVybiBub25jZTtcclxuICB9XHJcblxyXG4gIHNldE5vbmNlKG5vbmNlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aE5vbmNlJywgbm9uY2UpO1xyXG4gIH1cclxuXHJcbiAgZ2V0QXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoU3RhdGVDb250cm9sJyk7XHJcbiAgfVxyXG5cclxuICBzZXRBdXRoU3RhdGVDb250cm9sKGF1dGhTdGF0ZUNvbnRyb2w6IHN0cmluZykge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgYXV0aFN0YXRlQ29udHJvbCk7XHJcbiAgfVxyXG5cclxuICBnZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xyXG4gICAgbGV0IHN0YXRlID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhTdGF0ZUNvbnRyb2wnKTtcclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgc3RhdGUgPSB0aGlzLnJhbmRvbVNlcnZpY2UuY3JlYXRlUmFuZG9tKDQwKTtcclxuICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgc3RhdGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgc2V0U2Vzc2lvblN0YXRlKHNlc3Npb25TdGF0ZTogYW55KSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3Nlc3Npb25fc3RhdGUnLCBzZXNzaW9uU3RhdGUpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXRTdG9yYWdlRmxvd0RhdGEoKSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVzZXRTdG9yYWdlRmxvd0RhdGEoKTtcclxuICB9XHJcblxyXG4gIGdldENvZGVWZXJpZmllcigpIHtcclxuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnY29kZVZlcmlmaWVyJyk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVDb2RlVmVyaWZpZXIoKSB7XHJcbiAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLnJhbmRvbVNlcnZpY2UuY3JlYXRlUmFuZG9tKDY3KTtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnY29kZVZlcmlmaWVyJywgY29kZVZlcmlmaWVyKTtcclxuICAgIHJldHVybiBjb2RlVmVyaWZpZXI7XHJcbiAgfVxyXG5cclxuICAvLyBpc1NpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAvLyAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJykpO1xyXG5cclxuICAvLyAgIGlmIChzdG9yYWdlT2JqZWN0KSB7XHJcbiAgLy8gICAgIGNvbnN0IGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YyA9IERhdGUucGFyc2Uoc3RvcmFnZU9iamVjdC5kYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gIC8vICAgICBjb25zdCBjdXJyZW50RGF0ZVV0YyA9IERhdGUucGFyc2UobmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuICAvLyAgICAgY29uc3QgZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA9IE1hdGguYWJzKGN1cnJlbnREYXRlVXRjIC0gZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgY29uc3QgaXNQcm9iYWJseVN0dWNrID0gZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA+IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMDtcclxuXHJcbiAgLy8gICAgIGlmIChpc1Byb2JhYmx5U3R1Y2spIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NpbGVudCByZW5ldyBwcm9jZXNzIGlzIHByb2JhYmx5IHN0dWNrLCBzdGF0ZSB3aWxsIGJlIHJlc2V0LicpO1xyXG4gIC8vICAgICAgIHRoaXMucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAvLyAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgLy8gICAgIH1cclxuXHJcbiAgLy8gICAgIHJldHVybiBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAncnVubmluZyc7XHJcbiAgLy8gICB9XHJcblxyXG4gIC8vICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIH1cclxuXHJcbiAgc2V0U2lsZW50UmVuZXdSdW5uaW5nKCkge1xyXG4gICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9IHtcclxuICAgICAgc3RhdGU6ICdydW5uaW5nJyxcclxuICAgICAgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycsIEpTT04uc3RyaW5naWZ5KHN0b3JhZ2VPYmplY3QpKTtcclxuICB9XHJcblxyXG4gIHJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJywgJycpO1xyXG4gIH1cclxuXHJcbiAgaXNTaWxlbnRSZW5ld1J1bm5pbmcoc3RhdGU6IHN0cmluZyA9IG51bGwpIHtcclxuICAgIGNvbnN0IGpzb24gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpO1xyXG4gICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9ICEhanNvbiA/IEpTT04ucGFyc2UoanNvbikgOiBudWxsO1xyXG5cclxuICAgIGlmIChzdG9yYWdlT2JqZWN0KSB7XHJcbiAgICAgIGNvbnN0IGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YyA9IERhdGUucGFyc2Uoc3RvcmFnZU9iamVjdC5kYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gICAgICBjb25zdCBjdXJyZW50RGF0ZVV0YyA9IERhdGUucGFyc2UobmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuICAgICAgY29uc3QgZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA9IE1hdGguYWJzKGN1cnJlbnREYXRlVXRjIC0gZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAgICAgY29uc3QgaXNQcm9iYWJseVN0dWNrID0gZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA+IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMDtcclxuXHJcbiAgICAgIGlmIChpc1Byb2JhYmx5U3R1Y2spIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NpbGVudCByZW5ldyBwcm9jZXNzIGlzIHByb2JhYmx5IHN0dWNrLCBzdGF0ZSB3aWxsIGJlIHJlc2V0LicpO1xyXG4gICAgICAgIHRoaXMucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPiBzdGF0ZTogJHtzdGF0ZX0gY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuICAgICAgaWYgKCEhc3RhdGUpe1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPiBzdGF0ZTogJHtzdGF0ZX0gPiBpbnNpZGUgISFzdGF0ZSA+IGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcbiAgICAgICAgcmV0dXJuIHN0b3JhZ2VPYmplY3Quc3RhdGUgPT09IHN0YXRlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gc3RhdGU6ICR7c3RhdGV9ID4gYWZ0ZXIgISFzdGF0ZSA+IGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcblxyXG4gICAgICByZXR1cm4gc3RvcmFnZU9iamVjdC5zdGF0ZSA9PT0gJ3J1bm5pbmcnIHx8IHN0b3JhZ2VPYmplY3Quc3RhdGUgPT09ICdvbkhhbmRsZXInO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIHNldFNpbGVudFJlbmV3UnVubmluZ09uSGFuZGxlcldoZW5Jc05vdExhdWNoZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHNldFNpbGVudFJlbmV3UnVubmluZ09uSGFuZGxlcldoZW5Jc05vdExhdWNoZWQgY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuICAgIGNvbnN0IGxvY2tpbmdNb2RlbDogTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsICA9IHtcclxuICAgICAgc3RhdGU6ICdvbkhhbmRsZXInLFxyXG4gICAgICB4S2V5OiAnb2lkYy1vbi1oYW5kbGVyLXJ1bm5pbmcteCcsXHJcbiAgICAgIHlLZXk6ICdvaWRjLW9uLWhhbmRsZXItcnVubmluZy15J1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0obG9ja2luZ01vZGVsLCAnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpO1xyXG4gIH1cclxuXHJcbiAgc2V0U2lsZW50UmVuZXdSdW5uaW5nV2hlbklzTm90TGF1Y2hlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhgc2V0U2lsZW50UmVuZXdSdW5uaW5nV2hlbklzTm90TGF1Y2hlZCBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG5cclxuICAgIGNvbnN0IGxvY2tpbmdNb2RlbDogTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsICA9IHtcclxuICAgICAgc3RhdGU6ICdydW5uaW5nJyxcclxuICAgICAgeEtleTogJ29pZGMtcHJvY2Vzcy1ydW5uaW5nLXgnLFxyXG4gICAgICB5S2V5OiAnb2lkYy1wcm9jZXNzLXJ1bm5pbmcteSdcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5ydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtKGxvY2tpbmdNb2RlbCwgJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobShsb2NraW5nTW9kZWw6IE11dHVhbEV4Y2x1c2lvbkxvY2tpbmdNb2RlbCwga2V5OiBTdG9yYWdlS2V5cyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRSYW5kb21JZCA9IGAke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1fJHtuZXcgRGF0ZSgpLmdldFVUQ01pbGxpc2Vjb25kcygpfWA7XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuXHJcbiAgICAgIGNvbnN0IG9uU3VjY2Vzc0xvY2tpbmcgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IElOU0lERSBvblN1Y2Nlc3NMb2NraW5nID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICBpZiAodGhpcy5pc1NpbGVudFJlbmV3UnVubmluZyhsb2NraW5nTW9kZWwuc3RhdGUpKSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gSU5TSURFIG9uU3VjY2Vzc0xvY2tpbmcgPiB0aGlzLmlzU2lsZW50UmVuZXdSdW5uaW5nIHJldHVybiB0cnVlIHdlIGdvIGJhY2sgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBJTlNJREUgb25TdWNjZXNzTG9ja2luZyA+IFZJQ1RPUlkgISEhISBXRSBXSU4gQU5EIFNFVCBWQUxVRT4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSB7XHJcbiAgICAgICAgICAgIHN0YXRlOiBsb2NraW5nTW9kZWwuc3RhdGUsXHJcbiAgICAgICAgICAgIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgICAgfTsgXHJcbiAgICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoa2V5LCBKU09OLnN0cmluZ2lmeShzdG9yYWdlT2JqZWN0KSk7XHJcbiAgICAgICAgICAvLyBSZWxlYXNlIGxvY2tcclxuICAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueUtleSwgJycpO1xyXG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUobG9ja2luZ01vZGVsLnhLZXksIGN1cnJlbnRSYW5kb21JZCk7XHJcbiAgICAgIGNvbnN0IHJlYWRlZFZhbHVlWSA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKGxvY2tpbmdNb2RlbC55S2V5KVxyXG5cclxuICAgICAgaWYgKCEhcmVhZGVkVmFsdWVZKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IHJlYWRlZFZhbHVlWSAhPT0gJycgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSBKU09OLnBhcnNlKHJlYWRlZFZhbHVlWSk7XHJcbiAgICAgICAgY29uc3QgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjID0gRGF0ZS5wYXJzZShzdG9yYWdlT2JqZWN0LmRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgICAgY29uc3QgY3VycmVudERhdGVVdGMgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgY29uc3QgZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA9IE1hdGguYWJzKGN1cnJlbnREYXRlVXRjIC0gZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAgICAgICBjb25zdCBpc1Byb2JhYmx5U3R1Y2sgPSBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwO1xyXG5cclxuICAgICAgICBpZiAoaXNQcm9iYWJseVN0dWNrKXtcclxuICAgICAgICAgICAvLyBSZWxlYXNlIGxvY2tcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gaXNQcm9iYWJseVN0dWNrIC0gY2xlYXIgWSBrZXk+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC55S2V5LCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueUtleSwgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIGlkOiBjdXJyZW50UmFuZG9tSWQsXHJcbiAgICAgICAgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcclxuICAgICAgfSkpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKGxvY2tpbmdNb2RlbC54S2V5KSAhPT0gY3VycmVudFJhbmRvbUlkKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGJlZm9yZSBzZXRUaW1lb3V0ID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGlmICh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZChsb2NraW5nTW9kZWwueUtleSkgIT09IGN1cnJlbnRSYW5kb21JZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gaW5zaWRlIHNldFRpbWVvdXQgPiB3ZSBMT1NFID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBpbnNpZGUgc2V0VGltZW91dCA+IHdlIFdJTiA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgICBvblN1Y2Nlc3NMb2NraW5nKCk7XHJcbiAgICAgICAgfSwgTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IFdFIFdJTiBBTEwgQ09ORElUSU9OUyA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgb25TdWNjZXNzTG9ja2luZygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19