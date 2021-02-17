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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3MtZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7OztBQWEzQyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1UseUJBQW9ELEVBQ3BELGFBQTRCLEVBQzVCLHFCQUE0QyxFQUM1QyxhQUE0QjtRQUg1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDbkMsQ0FBQztJQUVKLFdBQVc7UUFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFhO1FBQ3BCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxtQkFBbUI7UUFDakIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELG1CQUFtQixDQUFDLGdCQUF3QjtRQUMxQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELG1DQUFtQztRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJB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dCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZUtleXMsIFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IFJhbmRvbVNlcnZpY2UgfSBmcm9tICcuL3JhbmRvbS9yYW5kb20uc2VydmljZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE11dHVhbEV4Y2x1c2lvbkxvY2tpbmdNb2RlbCB7XHJcbiAgeEtleTogU3RvcmFnZUtleXMsXHJcbiAgeUtleTogU3RvcmFnZUtleXMsXHJcbiAgc3RhdGU6IHN0cmluZ1xyXG59XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBGbG93c0RhdGFTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgIHByaXZhdGUgcmFuZG9tU2VydmljZTogUmFuZG9tU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGNyZWF0ZU5vbmNlKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBub25jZSA9IHRoaXMucmFuZG9tU2VydmljZS5jcmVhdGVSYW5kb20oNDApO1xyXG4gICAgdGhpcy5zZXROb25jZShub25jZSk7XHJcbiAgICByZXR1cm4gbm9uY2U7XHJcbiAgfVxyXG5cclxuICBzZXROb25jZShub25jZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhOb25jZScsIG5vbmNlKTtcclxuICB9XHJcblxyXG4gIGdldEF1dGhTdGF0ZUNvbnRyb2woKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFN0YXRlQ29udHJvbCcpO1xyXG4gIH1cclxuXHJcbiAgc2V0QXV0aFN0YXRlQ29udHJvbChhdXRoU3RhdGVDb250cm9sOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aFN0YXRlQ29udHJvbCcsIGF1dGhTdGF0ZUNvbnRyb2wpO1xyXG4gIH1cclxuXHJcbiAgZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woKTogYW55IHtcclxuICAgIGxldCBzdGF0ZSA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoU3RhdGVDb250cm9sJyk7XHJcbiAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgIHN0YXRlID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg0MCk7XHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aFN0YXRlQ29udHJvbCcsIHN0YXRlKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIHNldFNlc3Npb25TdGF0ZShzZXNzaW9uU3RhdGU6IGFueSkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdzZXNzaW9uX3N0YXRlJywgc2Vzc2lvblN0YXRlKTtcclxuICB9XHJcblxyXG4gIHJlc2V0U3RvcmFnZUZsb3dEYXRhKCkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlc2V0U3RvcmFnZUZsb3dEYXRhKCk7XHJcbiAgfVxyXG5cclxuICBnZXRDb2RlVmVyaWZpZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2NvZGVWZXJpZmllcicpO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlQ29kZVZlcmlmaWVyKCkge1xyXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg2Nyk7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2NvZGVWZXJpZmllcicsIGNvZGVWZXJpZmllcik7XHJcbiAgICByZXR1cm4gY29kZVZlcmlmaWVyO1xyXG4gIH1cclxuXHJcbiAgLy8gaXNTaWxlbnRSZW5ld1J1bm5pbmcoKSB7XHJcbiAgLy8gICBjb25zdCBzdG9yYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpKTtcclxuXHJcbiAgLy8gICBpZiAoc3RvcmFnZU9iamVjdCkge1xyXG4gIC8vICAgICBjb25zdCBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMgPSBEYXRlLnBhcnNlKHN0b3JhZ2VPYmplY3QuZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgY29uc3QgY3VycmVudERhdGVVdGMgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XHJcbiAgLy8gICAgIGNvbnN0IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPSBNYXRoLmFicyhjdXJyZW50RGF0ZVV0YyAtIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgLy8gICAgIGNvbnN0IGlzUHJvYmFibHlTdHVjayA9IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gIC8vICAgICBpZiAoaXNQcm9iYWJseVN0dWNrKSB7XHJcbiAgLy8gICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnQgcmVuZXcgcHJvY2VzcyBpcyBwcm9iYWJseSBzdHVjaywgc3RhdGUgd2lsbCBiZSByZXNldC4nKTtcclxuICAvLyAgICAgICB0aGlzLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgLy8gICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vICAgICB9XHJcblxyXG4gIC8vICAgICByZXR1cm4gc3RvcmFnZU9iamVjdC5zdGF0ZSA9PT0gJ3J1bm5pbmcnO1xyXG4gIC8vICAgfVxyXG5cclxuICAvLyAgIHJldHVybiBmYWxzZTtcclxuICAvLyB9XHJcblxyXG4gIHNldFNpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSB7XHJcbiAgICAgIHN0YXRlOiAncnVubmluZycsXHJcbiAgICAgIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnLCBKU09OLnN0cmluZ2lmeShzdG9yYWdlT2JqZWN0KSk7XHJcbiAgfVxyXG5cclxuICByZXNldFNpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycsICcnKTtcclxuICB9XHJcblxyXG4gIGlzU2lsZW50UmVuZXdSdW5uaW5nKHN0YXRlOiBzdHJpbmcgPSBudWxsKSB7XHJcbiAgICBjb25zdCBqc29uID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnKTtcclxuICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSAhIWpzb24gPyBKU09OLnBhcnNlKGpzb24pIDogbnVsbDtcclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gc3RhdGU6ICR7c3RhdGV9ID4gSlNPTiAke2pzb259YCk7XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSA+IEpTT04gY2hlY2sgISFqc29uICR7ISFqc29ufWApO1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPiBzdGF0ZTogJHtzdGF0ZX0gPiBzdG9yYWdlT2JqZWN0YCwgc3RvcmFnZU9iamVjdCk7XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSA+IHN0b3JhZ2VPYmplY3QgISFjaGVjayA9ICR7IXN0b3JhZ2VPYmplY3R9YCk7XHJcblxyXG4gICAgaWYgKHN0b3JhZ2VPYmplY3QpIHtcclxuICAgICAgY29uc3QgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjID0gRGF0ZS5wYXJzZShzdG9yYWdlT2JqZWN0LmRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnREYXRlVXRjID0gRGF0ZS5wYXJzZShuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICBjb25zdCBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID0gTWF0aC5hYnMoY3VycmVudERhdGVVdGMgLSBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gICAgICBjb25zdCBpc1Byb2JhYmx5U3R1Y2sgPSBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwO1xyXG5cclxuICAgICAgaWYgKGlzUHJvYmFibHlTdHVjaykge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnc2lsZW50IHJlbmV3IHByb2Nlc3MgaXMgcHJvYmFibHkgc3R1Y2ssIHN0YXRlIHdpbGwgYmUgcmVzZXQuJyk7XHJcbiAgICAgICAgdGhpcy5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG4gICAgICBpZiAoISFzdGF0ZSl7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IHN0YXRlOiAke3N0YXRlfSA+IGluc2lkZSAhIXN0YXRlID4gY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuICAgICAgICByZXR1cm4gc3RvcmFnZU9iamVjdC5zdGF0ZSA9PT0gc3RhdGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPiBzdGF0ZTogJHtzdGF0ZX0gPiBhZnRlciAhIXN0YXRlID4gY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuXHJcbiAgICAgIHJldHVybiBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAncnVubmluZycgfHwgc3RvcmFnZU9iamVjdC5zdGF0ZSA9PT0gJ29uSGFuZGxlcic7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgc2V0U2lsZW50UmVuZXdSdW5uaW5nT25IYW5kbGVyV2hlbklzTm90TGF1Y2hlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhgc2V0U2lsZW50UmVuZXdSdW5uaW5nT25IYW5kbGVyV2hlbklzTm90TGF1Y2hlZCBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG4gICAgY29uc3QgbG9ja2luZ01vZGVsOiBNdXR1YWxFeGNsdXNpb25Mb2NraW5nTW9kZWwgID0ge1xyXG4gICAgICBzdGF0ZTogJ29uSGFuZGxlcicsXHJcbiAgICAgIHhLZXk6ICdvaWRjLW9uLWhhbmRsZXItcnVubmluZy14JyxcclxuICAgICAgeUtleTogJ29pZGMtb24taGFuZGxlci1ydW5uaW5nLXknXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMucnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobShsb2NraW5nTW9kZWwsICdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJyk7XHJcbiAgfVxyXG5cclxuICBzZXRTaWxlbnRSZW5ld1J1bm5pbmdXaGVuSXNOb3RMYXVjaGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzZXRTaWxlbnRSZW5ld1J1bm5pbmdXaGVuSXNOb3RMYXVjaGVkIGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcblxyXG4gICAgY29uc3QgbG9ja2luZ01vZGVsOiBNdXR1YWxFeGNsdXNpb25Mb2NraW5nTW9kZWwgID0ge1xyXG4gICAgICBzdGF0ZTogJ3J1bm5pbmcnLFxyXG4gICAgICB4S2V5OiAnb2lkYy1wcm9jZXNzLXJ1bm5pbmcteCcsXHJcbiAgICAgIHlLZXk6ICdvaWRjLXByb2Nlc3MtcnVubmluZy15J1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLnJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0obG9ja2luZ01vZGVsLCAnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtKGxvY2tpbmdNb2RlbDogTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsLCBrZXk6IFN0b3JhZ2VLZXlzKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgY29uc3QgY3VycmVudFJhbmRvbUlkID0gYCR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfV8ke25ldyBEYXRlKCkuZ2V0VVRDTWlsbGlzZWNvbmRzKCl9YDtcclxuXHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG5cclxuICAgICAgY29uc3Qgb25TdWNjZXNzTG9ja2luZyA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gSU5TSURFIG9uU3VjY2Vzc0xvY2tpbmcgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgIGlmICh0aGlzLmlzU2lsZW50UmVuZXdSdW5uaW5nKGxvY2tpbmdNb2RlbC5zdGF0ZSkpIHtcclxuICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBJTlNJREUgb25TdWNjZXNzTG9ja2luZyA+IHRoaXMuaXNTaWxlbnRSZW5ld1J1bm5pbmcgcmV0dXJuIHRydWUgd2UgZ28gYmFjayA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IElOU0lERSBvblN1Y2Nlc3NMb2NraW5nID4gVklDVE9SWSAhISEhIFdFIFdJTiBBTkQgU0VUIFZBTFVFPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9IHtcclxuICAgICAgICAgICAgc3RhdGU6IGxvY2tpbmdNb2RlbC5zdGF0ZSxcclxuICAgICAgICAgICAgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgICB9OyBcclxuICAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShrZXksIEpTT04uc3RyaW5naWZ5KHN0b3JhZ2VPYmplY3QpKTtcclxuICAgICAgICAgIC8vIFJlbGVhc2UgbG9ja1xyXG4gICAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC55S2V5LCAnJyk7XHJcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueEtleSwgY3VycmVudFJhbmRvbUlkKTtcclxuICAgICAgY29uc3QgcmVhZGVkVmFsdWVZID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQobG9ja2luZ01vZGVsLnlLZXkpXHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gcmVhZGVkVmFsdWVZID0gJHtyZWFkZWRWYWx1ZVl9ID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuXHJcbiAgICAgIGlmICghIXJlYWRlZFZhbHVlWSkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiByZWFkZWRWYWx1ZVkgIT09ICcnID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICBjb25zdCBzdG9yYWdlT2JqZWN0ID0gSlNPTi5wYXJzZShyZWFkZWRWYWx1ZVkpO1xyXG4gICAgICAgIGNvbnN0IGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YyA9IERhdGUucGFyc2Uoc3RvcmFnZU9iamVjdC5kYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnREYXRlVXRjID0gRGF0ZS5wYXJzZShuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICAgIGNvbnN0IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPSBNYXRoLmFicyhjdXJyZW50RGF0ZVV0YyAtIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgICAgY29uc3QgaXNQcm9iYWJseVN0dWNrID0gZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA+IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMDtcclxuXHJcbiAgICAgICAgaWYgKGlzUHJvYmFibHlTdHVjayl7XHJcbiAgICAgICAgICAgLy8gUmVsZWFzZSBsb2NrXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGlzUHJvYmFibHlTdHVjayAtIGNsZWFyIFkga2V5PiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueUtleSwgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUobG9ja2luZ01vZGVsLnlLZXksIEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBpZDogY3VycmVudFJhbmRvbUlkLFxyXG4gICAgICAgIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXHJcbiAgICAgIH0pKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZChsb2NraW5nTW9kZWwueEtleSkgIT09IGN1cnJlbnRSYW5kb21JZCkge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBiZWZvcmUgc2V0VGltZW91dCA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByZWFkZWRWYWx1ZVlTZWNvbmRUaW1lID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQobG9ja2luZ01vZGVsLnlLZXkpO1xyXG4gICAgICAgICAgY29uc3QgcmVhZGVkVmFsdWVZU3RvcmFnZU9iamVjdCA9IEpTT04ucGFyc2UocmVhZGVkVmFsdWVZU2Vjb25kVGltZSk7XHJcbiAgICAgICAgICBpZiAocmVhZGVkVmFsdWVZU3RvcmFnZU9iamVjdC5pZCAhPT0gY3VycmVudFJhbmRvbUlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBpbnNpZGUgc2V0VGltZW91dCA+IHdlIExPU0UgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGluc2lkZSBzZXRUaW1lb3V0ID4gd2UgV0lOID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICAgIG9uU3VjY2Vzc0xvY2tpbmcoKTtcclxuICAgICAgICB9LCBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDApKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gV0UgV0lOIEFMTCBDT05ESVRJT05TID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAgICAgICBvblN1Y2Nlc3NMb2NraW5nKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=