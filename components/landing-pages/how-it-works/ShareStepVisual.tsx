import { phoneCropClass } from "../shared/PhoneCrop";
import { WalletPhone } from "../shared/WalletPhone";
import { PlacardVisual } from "./PlacardVisual";

/**
 * The counter flyer propped in front of the Apple Wallet phone with the café's
 * card open: the flyer is what they scan, the phone is where the card lands.
 * On a phone both are smaller and the phone is cut with a fade.
 */
export function ShareStepVisual() {
  return (
    <div className="relative mx-auto h-[372px] w-full max-w-[340px] lg:h-[640px] lg:max-w-[460px]">
      <div className={`absolute right-1 top-0 lg:right-0 ${phoneCropClass(360)}`}>
        <WalletPhone width={300} narrowWidth={190} stamps={4} />
      </div>
      <div className="absolute bottom-0 left-0 z-10 -rotate-3 origin-bottom-left lg:bottom-12">
        <PlacardVisual width={240} narrowWidth={165} />
      </div>
    </div>
  );
}
