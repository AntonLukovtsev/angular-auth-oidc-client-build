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
        this.loggerService.logDebug('INSIDE RESET SilentRenewRunning !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        this.storagePersistanceService.write('storageSilentRenewRunning', '');
    }
    isSilentRenewRunning(state = null) {
        const json = this.storagePersistanceService.read('storageSilentRenewRunning');
        const storageObject = !!json ? JSON.parse(json) : null;
        this.loggerService.logDebug(`isSilentRenewRunning > state: ${state} > JSON ${json}`);
        this.loggerService.logDebug(`isSilentRenewRunning > state: ${state} > JSON check !!json ${!!json}`);
        this.loggerService.logDebug(`isSilentRenewRunning > state: ${state} > storageObject`, storageObject);
        this.loggerService.logDebug(`isSilentRenewRunning > state: ${state} > storageObject !!check = ${!storageObject}`);
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
            if (state === 'onHandler') {
                this.loggerService.logDebug(`isSilentRenewRunning > state: ${state} > inside state === 'onHandler' > currentTime: ${new Date().toTimeString()}`);
                return storageObject.state === 'onHandler';
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
        return this.runMutualExclusionLockingAlgorithm(lockingModel);
    }
    setSilentRenewRunningWhenIsNotLauched() {
        this.loggerService.logDebug(`setSilentRenewRunningWhenIsNotLauched currentTime: ${new Date().toTimeString()}`);
        const lockingModel = {
            state: 'running',
            xKey: 'oidc-process-running-x',
            yKey: 'oidc-process-running-y'
        };
        return this.runMutualExclusionLockingAlgorithm(lockingModel);
    }
    runMutualExclusionLockingAlgorithm(lockingModel) {
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
                        id: currentRandomId
                    };
                    this.storagePersistanceService.write('storageSilentRenewRunning', JSON.stringify(storageObject));
                    const afterWrite = this.storagePersistanceService.read('storageSilentRenewRunning');
                    this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > > currentRandomId: ${currentRandomId} > AFTER WIN WRITE AND CHECK LOCAL STORAGE VALUE ---`, afterWrite);
                    // Release lock
                    this.storagePersistanceService.write(lockingModel.yKey, '');
                    resolve(true);
                }
            };
            this.storagePersistanceService.write(lockingModel.xKey, currentRandomId);
            const readedValueY = this.storagePersistanceService.read(lockingModel.yKey);
            this.loggerService.logDebug(`runMutualExclusionLockingAlgorithm - state "${lockingModel.state}" > readedValueY = ${readedValueY} > currentRandomId: ${currentRandomId}`);
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
                    const readedValueYSecondTime = this.storagePersistanceService.read(lockingModel.yKey);
                    const readedValueYStorageObject = JSON.parse(readedValueYSecondTime);
                    if (readedValueYStorageObject.id !== currentRandomId) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3MtZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7OztBQWEzQyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1UseUJBQW9ELEVBQ3BELGFBQTRCLEVBQzVCLHFCQUE0QyxFQUM1QyxhQUE0QjtRQUg1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDbkMsQ0FBQztJQUVKLFdBQVc7UUFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFhO1FBQ3BCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxtQkFBbUI7UUFDakIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELG1CQUFtQixDQUFDLGdCQUF3QjtRQUMxQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELG1DQUFtQztRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJB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LFFBQVEsQ0FBQywrQ0FBK0MsWUFBWSxDQUFDLEtBQUssZ0RBQWdELGVBQWUsRUFBRSxDQUFDLENBQUM7Z0JBQ2hLLGdCQUFnQixFQUFFLENBQUM7YUFDcEI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O2dGQS9OVSxnQkFBZ0I7d0RBQWhCLGdCQUFnQixXQUFoQixnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQUQ1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlS2V5cywgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmFuZG9tU2VydmljZSB9IGZyb20gJy4vcmFuZG9tL3JhbmRvbS5zZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsIHtcclxuICB4S2V5OiBTdG9yYWdlS2V5cyxcclxuICB5S2V5OiBTdG9yYWdlS2V5cyxcclxuICBzdGF0ZTogc3RyaW5nXHJcbn1cclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIEZsb3dzRGF0YVNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByYW5kb21TZXJ2aWNlOiBSYW5kb21TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgY3JlYXRlTm9uY2UoKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IG5vbmNlID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg0MCk7XHJcbiAgICB0aGlzLnNldE5vbmNlKG5vbmNlKTtcclxuICAgIHJldHVybiBub25jZTtcclxuICB9XHJcblxyXG4gIHNldE5vbmNlKG5vbmNlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aE5vbmNlJywgbm9uY2UpO1xyXG4gIH1cclxuXHJcbiAgZ2V0QXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoU3RhdGVDb250cm9sJyk7XHJcbiAgfVxyXG5cclxuICBzZXRBdXRoU3RhdGVDb250cm9sKGF1dGhTdGF0ZUNvbnRyb2w6IHN0cmluZykge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgYXV0aFN0YXRlQ29udHJvbCk7XHJcbiAgfVxyXG5cclxuICBnZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xyXG4gICAgbGV0IHN0YXRlID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhTdGF0ZUNvbnRyb2wnKTtcclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgc3RhdGUgPSB0aGlzLnJhbmRvbVNlcnZpY2UuY3JlYXRlUmFuZG9tKDQwKTtcclxuICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgc3RhdGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgc2V0U2Vzc2lvblN0YXRlKHNlc3Npb25TdGF0ZTogYW55KSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3Nlc3Npb25fc3RhdGUnLCBzZXNzaW9uU3RhdGUpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXRTdG9yYWdlRmxvd0RhdGEoKSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVzZXRTdG9yYWdlRmxvd0RhdGEoKTtcclxuICB9XHJcblxyXG4gIGdldENvZGVWZXJpZmllcigpIHtcclxuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnY29kZVZlcmlmaWVyJyk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVDb2RlVmVyaWZpZXIoKSB7XHJcbiAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLnJhbmRvbVNlcnZpY2UuY3JlYXRlUmFuZG9tKDY3KTtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnY29kZVZlcmlmaWVyJywgY29kZVZlcmlmaWVyKTtcclxuICAgIHJldHVybiBjb2RlVmVyaWZpZXI7XHJcbiAgfVxyXG5cclxuICAvLyBpc1NpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAvLyAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJykpO1xyXG5cclxuICAvLyAgIGlmIChzdG9yYWdlT2JqZWN0KSB7XHJcbiAgLy8gICAgIGNvbnN0IGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YyA9IERhdGUucGFyc2Uoc3RvcmFnZU9iamVjdC5kYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gIC8vICAgICBjb25zdCBjdXJyZW50RGF0ZVV0YyA9IERhdGUucGFyc2UobmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuICAvLyAgICAgY29uc3QgZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA9IE1hdGguYWJzKGN1cnJlbnREYXRlVXRjIC0gZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgY29uc3QgaXNQcm9iYWJseVN0dWNrID0gZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA+IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMDtcclxuXHJcbiAgLy8gICAgIGlmIChpc1Byb2JhYmx5U3R1Y2spIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NpbGVudCByZW5ldyBwcm9jZXNzIGlzIHByb2JhYmx5IHN0dWNrLCBzdGF0ZSB3aWxsIGJlIHJlc2V0LicpO1xyXG4gIC8vICAgICAgIHRoaXMucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAvLyAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgLy8gICAgIH1cclxuXHJcbiAgLy8gICAgIHJldHVybiBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAncnVubmluZyc7XHJcbiAgLy8gICB9XHJcblxyXG4gIC8vICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIH1cclxuXHJcbiAgc2V0U2lsZW50UmVuZXdSdW5uaW5nKCkge1xyXG4gICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9IHtcclxuICAgICAgc3RhdGU6ICdydW5uaW5nJyxcclxuICAgICAgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycsIEpTT04uc3RyaW5naWZ5KHN0b3JhZ2VPYmplY3QpKTtcclxuICB9XHJcblxyXG4gIHJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCkge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdJTlNJREUgUkVTRVQgU2lsZW50UmVuZXdSdW5uaW5nICEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhJyk7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnLCAnJyk7XHJcbiAgfVxyXG5cclxuICBpc1NpbGVudFJlbmV3UnVubmluZyhzdGF0ZTogc3RyaW5nID0gbnVsbCkge1xyXG4gICAgY29uc3QganNvbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJyk7XHJcbiAgICBjb25zdCBzdG9yYWdlT2JqZWN0ID0gISFqc29uID8gSlNPTi5wYXJzZShqc29uKSA6IG51bGw7XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSA+IEpTT04gJHtqc29ufWApO1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPiBzdGF0ZTogJHtzdGF0ZX0gPiBKU09OIGNoZWNrICEhanNvbiAkeyEhanNvbn1gKTtcclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gc3RhdGU6ICR7c3RhdGV9ID4gc3RvcmFnZU9iamVjdGAsIHN0b3JhZ2VPYmplY3QpO1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPiBzdGF0ZTogJHtzdGF0ZX0gPiBzdG9yYWdlT2JqZWN0ICEhY2hlY2sgPSAkeyFzdG9yYWdlT2JqZWN0fWApO1xyXG5cclxuICAgIGlmIChzdG9yYWdlT2JqZWN0KSB7XHJcbiAgICAgIGNvbnN0IGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YyA9IERhdGUucGFyc2Uoc3RvcmFnZU9iamVjdC5kYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gICAgICBjb25zdCBjdXJyZW50RGF0ZVV0YyA9IERhdGUucGFyc2UobmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuICAgICAgY29uc3QgZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA9IE1hdGguYWJzKGN1cnJlbnREYXRlVXRjIC0gZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAgICAgY29uc3QgaXNQcm9iYWJseVN0dWNrID0gZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA+IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMDtcclxuXHJcbiAgICAgIGlmIChpc1Byb2JhYmx5U3R1Y2spIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NpbGVudCByZW5ldyBwcm9jZXNzIGlzIHByb2JhYmx5IHN0dWNrLCBzdGF0ZSB3aWxsIGJlIHJlc2V0LicpO1xyXG4gICAgICAgIHRoaXMucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPiBzdGF0ZTogJHtzdGF0ZX0gY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuICAgICAgaWYgKHN0YXRlID09PSAnb25IYW5kbGVyJyl7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSA+IGluc2lkZSBzdGF0ZSA9PT0gJ29uSGFuZGxlcicgPiBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG4gICAgICAgIHJldHVybiBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAnb25IYW5kbGVyJztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSA+IGFmdGVyICEhc3RhdGUgPiBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG5cclxuICAgICAgcmV0dXJuIHN0b3JhZ2VPYmplY3Quc3RhdGUgPT09ICdydW5uaW5nJyB8fCBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAnb25IYW5kbGVyJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBzZXRTaWxlbnRSZW5ld1J1bm5pbmdPbkhhbmRsZXJXaGVuSXNOb3RMYXVjaGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzZXRTaWxlbnRSZW5ld1J1bm5pbmdPbkhhbmRsZXJXaGVuSXNOb3RMYXVjaGVkIGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcbiAgICBjb25zdCBsb2NraW5nTW9kZWw6IE11dHVhbEV4Y2x1c2lvbkxvY2tpbmdNb2RlbCAgPSB7XHJcbiAgICAgIHN0YXRlOiAnb25IYW5kbGVyJyxcclxuICAgICAgeEtleTogJ29pZGMtb24taGFuZGxlci1ydW5uaW5nLXgnLFxyXG4gICAgICB5S2V5OiAnb2lkYy1vbi1oYW5kbGVyLXJ1bm5pbmcteSdcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5ydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtKGxvY2tpbmdNb2RlbCk7XHJcbiAgfVxyXG5cclxuICBzZXRTaWxlbnRSZW5ld1J1bm5pbmdXaGVuSXNOb3RMYXVjaGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzZXRTaWxlbnRSZW5ld1J1bm5pbmdXaGVuSXNOb3RMYXVjaGVkIGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcblxyXG4gICAgY29uc3QgbG9ja2luZ01vZGVsOiBNdXR1YWxFeGNsdXNpb25Mb2NraW5nTW9kZWwgID0ge1xyXG4gICAgICBzdGF0ZTogJ3J1bm5pbmcnLFxyXG4gICAgICB4S2V5OiAnb2lkYy1wcm9jZXNzLXJ1bm5pbmcteCcsXHJcbiAgICAgIHlLZXk6ICdvaWRjLXByb2Nlc3MtcnVubmluZy15J1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0obG9ja2luZ01vZGVsKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobShsb2NraW5nTW9kZWw6IE11dHVhbEV4Y2x1c2lvbkxvY2tpbmdNb2RlbCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRSYW5kb21JZCA9IGAke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1fJHtuZXcgRGF0ZSgpLmdldFVUQ01pbGxpc2Vjb25kcygpfWA7XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuXHJcbiAgICAgIGNvbnN0IG9uU3VjY2Vzc0xvY2tpbmcgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IElOU0lERSBvblN1Y2Nlc3NMb2NraW5nID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICBpZiAodGhpcy5pc1NpbGVudFJlbmV3UnVubmluZyhsb2NraW5nTW9kZWwuc3RhdGUpKSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gSU5TSURFIG9uU3VjY2Vzc0xvY2tpbmcgPiB0aGlzLmlzU2lsZW50UmVuZXdSdW5uaW5nIHJldHVybiB0cnVlIHdlIGdvIGJhY2sgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBJTlNJREUgb25TdWNjZXNzTG9ja2luZyA+IFZJQ1RPUlkgISEhISBXRSBXSU4gQU5EIFNFVCBWQUxVRT4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSB7XHJcbiAgICAgICAgICAgIHN0YXRlOiBsb2NraW5nTW9kZWwuc3RhdGUsXHJcbiAgICAgICAgICAgIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgICAgICBpZDogY3VycmVudFJhbmRvbUlkXHJcbiAgICAgICAgICB9OyBcclxuICAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycsIEpTT04uc3RyaW5naWZ5KHN0b3JhZ2VPYmplY3QpKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBhZnRlcldyaXRlID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnKTtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9ID4gQUZURVIgV0lOIFdSSVRFIEFORCBDSEVDSyBMT0NBTCBTVE9SQUdFIFZBTFVFIC0tLWAsIGFmdGVyV3JpdGUpO1xyXG4gICAgICAgICAgLy8gUmVsZWFzZSBsb2NrXHJcbiAgICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUobG9ja2luZ01vZGVsLnlLZXksICcnKTtcclxuICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC54S2V5LCBjdXJyZW50UmFuZG9tSWQpO1xyXG4gICAgICBjb25zdCByZWFkZWRWYWx1ZVkgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZChsb2NraW5nTW9kZWwueUtleSlcclxuXHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiByZWFkZWRWYWx1ZVkgPSAke3JlYWRlZFZhbHVlWX0gPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG5cclxuICAgICAgaWYgKCEhcmVhZGVkVmFsdWVZKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IHJlYWRlZFZhbHVlWSAhPT0gJycgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSBKU09OLnBhcnNlKHJlYWRlZFZhbHVlWSk7XHJcbiAgICAgICAgY29uc3QgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjID0gRGF0ZS5wYXJzZShzdG9yYWdlT2JqZWN0LmRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgICAgY29uc3QgY3VycmVudERhdGVVdGMgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgICAgY29uc3QgZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA9IE1hdGguYWJzKGN1cnJlbnREYXRlVXRjIC0gZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAgICAgICBjb25zdCBpc1Byb2JhYmx5U3R1Y2sgPSBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwO1xyXG5cclxuICAgICAgICBpZiAoaXNQcm9iYWJseVN0dWNrKXtcclxuICAgICAgICAgICAvLyBSZWxlYXNlIGxvY2tcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gaXNQcm9iYWJseVN0dWNrIC0gY2xlYXIgWSBrZXk+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC55S2V5LCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueUtleSwgSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIGlkOiBjdXJyZW50UmFuZG9tSWQsXHJcbiAgICAgICAgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcclxuICAgICAgfSkpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKGxvY2tpbmdNb2RlbC54S2V5KSAhPT0gY3VycmVudFJhbmRvbUlkKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGJlZm9yZSBzZXRUaW1lb3V0ID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJlYWRlZFZhbHVlWVNlY29uZFRpbWUgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZChsb2NraW5nTW9kZWwueUtleSk7XHJcbiAgICAgICAgICBjb25zdCByZWFkZWRWYWx1ZVlTdG9yYWdlT2JqZWN0ID0gSlNPTi5wYXJzZShyZWFkZWRWYWx1ZVlTZWNvbmRUaW1lKTtcclxuICAgICAgICAgIGlmIChyZWFkZWRWYWx1ZVlTdG9yYWdlT2JqZWN0LmlkICE9PSBjdXJyZW50UmFuZG9tSWQpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGluc2lkZSBzZXRUaW1lb3V0ID4gd2UgTE9TRSA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gaW5zaWRlIHNldFRpbWVvdXQgPiB3ZSBXSU4gPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgICAgb25TdWNjZXNzTG9ja2luZygpO1xyXG4gICAgICAgIH0sIE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBXRSBXSU4gQUxMIENPTkRJVElPTlMgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgIG9uU3VjY2Vzc0xvY2tpbmcoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==