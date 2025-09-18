import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

/**
 * @author Chris Michel
 * Service for storing, obtaining and deleting JSON objects
 */
@Injectable({
    providedIn: 'root'
})
export class StorageService {

    public storeOnDevice = new Storage();
    constructor(private platform: Platform) {
        if (this.platform.is('ios') || this.platform.is("android")) {
            this.storeOnDevice.create().then(storeReady => {
                console.log("store ready", storeReady);
            })
        }
    }

    /**
     * Save to local storage
     * @param key unique key identifier
     * @param value JSON object
     */
    set(key: string, value: any) {
        if (this.platform.is('ios') || this.platform.is("android")) {
            this.storeOnDevice.set(key, JSON.stringify(value));
        } else {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    }

    /**
     * Obtain from local storage
     * @param key unique key identifier
     * @returns JSON object or null
     */
    async get(key: string): Promise<any> {
        if (this.platform.is('ios') || this.platform.is("android")) {
            let item = await this.storeOnDevice.get(key);
            if (item) {
                return JSON.parse(item);
            }
        } else {
            let item = window.localStorage.getItem(key);
            if (item) {
                return JSON.parse(item);
            }
        }
        return null;
    }

    /**
     * Delete from local storage. Does not return anything, neither on success nor fail
     * @param key unique key identifier
     */
    delete(key: string) {
        if (this.platform.is('ios') || this.platform.is("android")) {
            this.storeOnDevice.remove(key);
        } else {
            window.localStorage.removeItem(key);
        }
    }

}