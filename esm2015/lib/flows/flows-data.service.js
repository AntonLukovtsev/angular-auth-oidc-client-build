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
        return this.runMutualExclusionLockingAlgorithm(lockingModel);
    }
    setSilentRenewRunningWhenIsNotLauched() {
        this.loggerService.logDebug(`setSilentRenewRunningWhenIsNotLauched currentTime: ${new Date().toTimeString()}`);
        const lockingModel = {
            state: null,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3MtZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7OztBQWEzQyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1UseUJBQW9ELEVBQ3BELGFBQTRCLEVBQzVCLHFCQUE0QyxFQUM1QyxhQUE0QjtRQUg1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDbkMsQ0FBQztJQUVKLFdBQVc7UUFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFhO1FBQ3BCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxtQkFBbUI7UUFDakIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELG1CQUFtQixDQUFDLGdCQUF3QjtRQUMxQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELG1DQUFtQztRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJB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QUFRLENBQUMsK0NBQStDLFlBQVksQ0FBQyxLQUFLLGdEQUFnRCxlQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUNoSyxnQkFBZ0IsRUFBRSxDQUFDO2FBQ3BCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOztnRkEvTlUsZ0JBQWdCO3dEQUFoQixnQkFBZ0IsV0FBaEIsZ0JBQWdCO2tEQUFoQixnQkFBZ0I7Y0FENUIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZUtleXMsIFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IFJhbmRvbVNlcnZpY2UgfSBmcm9tICcuL3JhbmRvbS9yYW5kb20uc2VydmljZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE11dHVhbEV4Y2x1c2lvbkxvY2tpbmdNb2RlbCB7XHJcbiAgeEtleTogU3RvcmFnZUtleXMsXHJcbiAgeUtleTogU3RvcmFnZUtleXMsXHJcbiAgc3RhdGU6IHN0cmluZ1xyXG59XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBGbG93c0RhdGFTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgIHByaXZhdGUgcmFuZG9tU2VydmljZTogUmFuZG9tU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGNyZWF0ZU5vbmNlKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBub25jZSA9IHRoaXMucmFuZG9tU2VydmljZS5jcmVhdGVSYW5kb20oNDApO1xyXG4gICAgdGhpcy5zZXROb25jZShub25jZSk7XHJcbiAgICByZXR1cm4gbm9uY2U7XHJcbiAgfVxyXG5cclxuICBzZXROb25jZShub25jZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhOb25jZScsIG5vbmNlKTtcclxuICB9XHJcblxyXG4gIGdldEF1dGhTdGF0ZUNvbnRyb2woKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFN0YXRlQ29udHJvbCcpO1xyXG4gIH1cclxuXHJcbiAgc2V0QXV0aFN0YXRlQ29udHJvbChhdXRoU3RhdGVDb250cm9sOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aFN0YXRlQ29udHJvbCcsIGF1dGhTdGF0ZUNvbnRyb2wpO1xyXG4gIH1cclxuXHJcbiAgZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woKTogYW55IHtcclxuICAgIGxldCBzdGF0ZSA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoU3RhdGVDb250cm9sJyk7XHJcbiAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgIHN0YXRlID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg0MCk7XHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aFN0YXRlQ29udHJvbCcsIHN0YXRlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIHNldFNlc3Npb25TdGF0ZShzZXNzaW9uU3RhdGU6IGFueSkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdzZXNzaW9uX3N0YXRlJywgc2Vzc2lvblN0YXRlKTtcclxuICB9XHJcblxyXG4gIHJlc2V0U3RvcmFnZUZsb3dEYXRhKCkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlc2V0U3RvcmFnZUZsb3dEYXRhKCk7XHJcbiAgfVxyXG5cclxuICBnZXRDb2RlVmVyaWZpZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2NvZGVWZXJpZmllcicpO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlQ29kZVZlcmlmaWVyKCkge1xyXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg2Nyk7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2NvZGVWZXJpZmllcicsIGNvZGVWZXJpZmllcik7XHJcbiAgICByZXR1cm4gY29kZVZlcmlmaWVyO1xyXG4gIH1cclxuXHJcbiAgLy8gaXNTaWxlbnRSZW5ld1J1bm5pbmcoKSB7XHJcbiAgLy8gICBjb25zdCBzdG9yYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpKTtcclxuXHJcbiAgLy8gICBpZiAoc3RvcmFnZU9iamVjdCkge1xyXG4gIC8vICAgICBjb25zdCBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMgPSBEYXRlLnBhcnNlKHN0b3JhZ2VPYmplY3QuZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgY29uc3QgY3VycmVudERhdGVVdGMgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XHJcbiAgLy8gICAgIGNvbnN0IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPSBNYXRoLmFicyhjdXJyZW50RGF0ZVV0YyAtIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgLy8gICAgIGNvbnN0IGlzUHJvYmFibHlTdHVjayA9IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gIC8vICAgICBpZiAoaXNQcm9iYWJseVN0dWNrKSB7XHJcbiAgLy8gICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnQgcmVuZXcgcHJvY2VzcyBpcyBwcm9iYWJseSBzdHVjaywgc3RhdGUgd2lsbCBiZSByZXNldC4nKTtcclxuICAvLyAgICAgICB0aGlzLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgLy8gICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vICAgICB9XHJcblxyXG4gIC8vICAgICByZXR1cm4gc3RvcmFnZU9iamVjdC5zdGF0ZSA9PT0gJ3J1bm5pbmcnO1xyXG4gIC8vICAgfVxyXG5cclxuICAvLyAgIHJldHVybiBmYWxzZTtcclxuICAvLyB9XHJcblxyXG4gIHNldFNpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSB7XHJcbiAgICAgIHN0YXRlOiAncnVubmluZycsXHJcbiAgICAgIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnLCBKU09OLnN0cmluZ2lmeShzdG9yYWdlT2JqZWN0KSk7XHJcbiAgfVxyXG5cclxuICByZXNldFNpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnSU5TSURFIFJFU0VUIFNpbGVudFJlbmV3UnVubmluZyAhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIScpO1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJywgJycpO1xyXG4gIH1cclxuXHJcbiAgaXNTaWxlbnRSZW5ld1J1bm5pbmcoc3RhdGU6IHN0cmluZyA9IG51bGwpIHtcclxuICAgIGNvbnN0IGpzb24gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpO1xyXG4gICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9ICEhanNvbiA/IEpTT04ucGFyc2UoanNvbikgOiBudWxsO1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPiBzdGF0ZTogJHtzdGF0ZX0gPiBKU09OICR7anNvbn1gKTtcclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gc3RhdGU6ICR7c3RhdGV9ID4gSlNPTiBjaGVjayAhIWpzb24gJHshIWpzb259YCk7XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSA+IHN0b3JhZ2VPYmplY3RgLCBzdG9yYWdlT2JqZWN0KTtcclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gc3RhdGU6ICR7c3RhdGV9ID4gc3RvcmFnZU9iamVjdCAhIWNoZWNrID0gJHshc3RvcmFnZU9iamVjdH1gKTtcclxuXHJcbiAgICBpZiAoc3RvcmFnZU9iamVjdCkge1xyXG4gICAgICBjb25zdCBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMgPSBEYXRlLnBhcnNlKHN0b3JhZ2VPYmplY3QuZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAgICAgY29uc3QgY3VycmVudERhdGVVdGMgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgIGNvbnN0IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPSBNYXRoLmFicyhjdXJyZW50RGF0ZVV0YyAtIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgIGNvbnN0IGlzUHJvYmFibHlTdHVjayA9IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gICAgICBpZiAoaXNQcm9iYWJseVN0dWNrKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnQgcmVuZXcgcHJvY2VzcyBpcyBwcm9iYWJseSBzdHVjaywgc3RhdGUgd2lsbCBiZSByZXNldC4nKTtcclxuICAgICAgICB0aGlzLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gc3RhdGU6ICR7c3RhdGV9IGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcbiAgICAgIGlmICghIXN0YXRlKXtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gc3RhdGU6ICR7c3RhdGV9ID4gaW5zaWRlICEhc3RhdGUgPiBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG4gICAgICAgIHJldHVybiBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSBzdGF0ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSA+IGFmdGVyICEhc3RhdGUgPiBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG5cclxuICAgICAgcmV0dXJuIHN0b3JhZ2VPYmplY3Quc3RhdGUgPT09ICdydW5uaW5nJyB8fCBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAnb25IYW5kbGVyJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBzZXRTaWxlbnRSZW5ld1J1bm5pbmdPbkhhbmRsZXJXaGVuSXNOb3RMYXVjaGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzZXRTaWxlbnRSZW5ld1J1bm5pbmdPbkhhbmRsZXJXaGVuSXNOb3RMYXVjaGVkIGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcbiAgICBjb25zdCBsb2NraW5nTW9kZWw6IE11dHVhbEV4Y2x1c2lvbkxvY2tpbmdNb2RlbCAgPSB7XHJcbiAgICAgIHN0YXRlOiAnb25IYW5kbGVyJyxcclxuICAgICAgeEtleTogJ29pZGMtb24taGFuZGxlci1ydW5uaW5nLXgnLFxyXG4gICAgICB5S2V5OiAnb2lkYy1vbi1oYW5kbGVyLXJ1bm5pbmcteSdcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5ydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtKGxvY2tpbmdNb2RlbCk7XHJcbiAgfVxyXG5cclxuICBzZXRTaWxlbnRSZW5ld1J1bm5pbmdXaGVuSXNOb3RMYXVjaGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzZXRTaWxlbnRSZW5ld1J1bm5pbmdXaGVuSXNOb3RMYXVjaGVkIGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcblxyXG4gICAgY29uc3QgbG9ja2luZ01vZGVsOiBNdXR1YWxFeGNsdXNpb25Mb2NraW5nTW9kZWwgID0ge1xyXG4gICAgICBzdGF0ZTogbnVsbCxcclxuICAgICAgeEtleTogJ29pZGMtcHJvY2Vzcy1ydW5uaW5nLXgnLFxyXG4gICAgICB5S2V5OiAnb2lkYy1wcm9jZXNzLXJ1bm5pbmcteSdcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5ydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtKGxvY2tpbmdNb2RlbCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0obG9ja2luZ01vZGVsOiBNdXR1YWxFeGNsdXNpb25Mb2NraW5nTW9kZWwpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICBjb25zdCBjdXJyZW50UmFuZG9tSWQgPSBgJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9XyR7bmV3IERhdGUoKS5nZXRVVENNaWxsaXNlY29uZHMoKX1gO1xyXG5cclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcblxyXG4gICAgICBjb25zdCBvblN1Y2Nlc3NMb2NraW5nID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBJTlNJREUgb25TdWNjZXNzTG9ja2luZyA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNTaWxlbnRSZW5ld1J1bm5pbmcobG9ja2luZ01vZGVsLnN0YXRlKSkge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IElOU0lERSBvblN1Y2Nlc3NMb2NraW5nID4gdGhpcy5pc1NpbGVudFJlbmV3UnVubmluZyByZXR1cm4gdHJ1ZSB3ZSBnbyBiYWNrID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gSU5TSURFIG9uU3VjY2Vzc0xvY2tpbmcgPiBWSUNUT1JZICEhISEgV0UgV0lOIEFORCBTRVQgVkFMVUU+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgICBjb25zdCBzdG9yYWdlT2JqZWN0ID0ge1xyXG4gICAgICAgICAgICBzdGF0ZTogbG9ja2luZ01vZGVsLnN0YXRlLFxyXG4gICAgICAgICAgICBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGM6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgICAgICAgaWQ6IGN1cnJlbnRSYW5kb21JZFxyXG4gICAgICAgICAgfTsgXHJcbiAgICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnLCBKU09OLnN0cmluZ2lmeShzdG9yYWdlT2JqZWN0KSk7XHJcblxyXG4gICAgICAgICAgY29uc3QgYWZ0ZXJXcml0ZSA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJyk7XHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfSA+IEFGVEVSIFdJTiBXUklURSBBTkQgQ0hFQ0sgTE9DQUwgU1RPUkFHRSBWQUxVRSAtLS1gLCBhZnRlcldyaXRlKTtcclxuICAgICAgICAgIC8vIFJlbGVhc2UgbG9ja1xyXG4gICAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC55S2V5LCAnJyk7XHJcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueEtleSwgY3VycmVudFJhbmRvbUlkKTtcclxuICAgICAgY29uc3QgcmVhZGVkVmFsdWVZID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQobG9ja2luZ01vZGVsLnlLZXkpXHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gcmVhZGVkVmFsdWVZID0gJHtyZWFkZWRWYWx1ZVl9ID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuXHJcbiAgICAgIGlmICghIXJlYWRlZFZhbHVlWSkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiByZWFkZWRWYWx1ZVkgIT09ICcnID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICBjb25zdCBzdG9yYWdlT2JqZWN0ID0gSlNPTi5wYXJzZShyZWFkZWRWYWx1ZVkpO1xyXG4gICAgICAgIGNvbnN0IGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YyA9IERhdGUucGFyc2Uoc3RvcmFnZU9iamVjdC5kYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlVXRjID0gRGF0ZS5wYXJzZShuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgIGNvbnN0IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPSBNYXRoLmFicyhjdXJyZW50RGF0ZVV0YyAtIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgICAgY29uc3QgaXNQcm9iYWJseVN0dWNrID0gZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA+IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMDtcclxuXHJcbiAgICAgICAgaWYgKGlzUHJvYmFibHlTdHVjayl7XHJcbiAgICAgICAgICAgLy8gUmVsZWFzZSBsb2NrXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGlzUHJvYmFibHlTdHVjayAtIGNsZWFyIFkga2V5PiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueUtleSwgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUobG9ja2luZ01vZGVsLnlLZXksIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBpZDogY3VycmVudFJhbmRvbUlkLFxyXG4gICAgICAgIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXHJcbiAgICAgIH0pKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZChsb2NraW5nTW9kZWwueEtleSkgIT09IGN1cnJlbnRSYW5kb21JZCkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBiZWZvcmUgc2V0VGltZW91dCA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByZWFkZWRWYWx1ZVlTZWNvbmRUaW1lID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQobG9ja2luZ01vZGVsLnlLZXkpO1xyXG4gICAgICAgICAgY29uc3QgcmVhZGVkVmFsdWVZU3RvcmFnZU9iamVjdCA9IEpTT04ucGFyc2UocmVhZGVkVmFsdWVZU2Vjb25kVGltZSk7XHJcbiAgICAgICAgICBpZiAocmVhZGVkVmFsdWVZU3RvcmFnZU9iamVjdC5pZCAhPT0gY3VycmVudFJhbmRvbUlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBpbnNpZGUgc2V0VGltZW91dCA+IHdlIExPU0UgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGluc2lkZSBzZXRUaW1lb3V0ID4gd2UgV0lOID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICAgIG9uU3VjY2Vzc0xvY2tpbmcoKTtcclxuICAgICAgICB9LCBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDApKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gV0UgV0lOIEFMTCBDT05ESVRJT05TID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICBvblN1Y2Nlc3NMb2NraW5nKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=