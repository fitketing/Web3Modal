import { IAbstractConnectorOptions, getChainId } from "../../helpers";
import CustomQRCodeModal from "./CustomQRCodeModal";

export interface IWalletConnectConnectorOptions
  extends IAbstractConnectorOptions {
  infuraId?: string;
  rpc?: { [chainId: number]: string };
  bridge?: string;
  qrcode?: boolean;
  qrcodeModalOptions?: { mobileLinks?: string[] };
}

const ConnectToWalletConnect = (
  WalletConnectProvider: any,
  opts: IWalletConnectConnectorOptions
) => {
  return new Promise(async (resolve, reject) => {
    let bridge = "https://bridge.walletconnect.org";
    let qrcode = true;
    let infuraId = "";
    let rpc = undefined;
    let chainId = 1;
    let qrcodeModalOptions = undefined;

    if (opts) {
      bridge = opts.bridge || bridge;
      qrcode = typeof opts.qrcode !== "undefined" ? opts.qrcode : qrcode;
      infuraId = opts.infuraId || "";
      rpc = opts.rpc || undefined;
      chainId =
        opts.network && getChainId(opts.network) ? getChainId(opts.network) : 1;
      qrcodeModalOptions = opts.qrcodeModalOptions || undefined;
    }

    const provider = new WalletConnectProvider({
      bridge,
      qrcode: false,
      infuraId,
      rpc,
      chainId,
      qrcodeModalOptions
    });

    provider.connector.on("display_uri", (err, payload) => {
      const uri = payload.params[0];
      CustomQRCodeModal.connect();
    });

    try {
      await provider.enable();
      resolve(provider);
    } catch (e) {
      reject(e);
    }
  });
};

export default ConnectToWalletConnect;
