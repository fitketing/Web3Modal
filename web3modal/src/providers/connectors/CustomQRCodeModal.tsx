import EventContainer from "eventcontainer";
import QRCode from "qrcode";
import KlipQRPopup from "./KlipQRPopup";
import Store from "./Store";

const klipSDK = require("klip-sdk");

class CustomQRCodeModal extends EventContainer {

private static readonly BAPP_NAME = "Klubs";

public store = new Store("klip-store");

public get address() {
    return this.store.get("address");
}

public set address(address: string | undefined) {
    this.store.set("address", address, true);
}

private async request(res: any): Promise<any> {

    let qrPopup: KlipQRPopup | undefined;
    klipSDK.request(res.request_key, async () => {
        const qr = await QRCode.toDataURL(`https://klipwallet.com/?target=/a2a?request_key=${res.request_key}`);
        qrPopup = new KlipQRPopup(qr);
    });

    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            const result = await klipSDK.getResult(res.request_key);
            if (result.result !== undefined) {
                qrPopup?.delete();
                clearInterval(interval);
                setTimeout(() => resolve(result.result), 2000);
            }
        }, 1000);
    });
}

public async connect() {
    const res = await klipSDK.prepare.auth({ bappName: CustomQRCodeModal.BAPP_NAME });
    this.address = (await this.request(res)).klaytn_address;
    this.fireEvent("connect");
}

}

export default new CustomQRCodeModal();