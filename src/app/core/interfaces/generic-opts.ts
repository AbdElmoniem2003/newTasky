import { ActionSheetButton, AlertButton, ToastButton } from "@ionic/angular";

type Mode = 'md' | 'ios'
type color = | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'light'
  | 'medium'
  | 'dark';

export interface GenericOpts {
  header?: string;
  subHeader?: string;
  message?: string;
  cssClass?: string | string[];
  buttons?: (ToastButton | AlertButton | ActionSheetButton | string)[];
  mode?: Mode,
  color?: color
  duration?: number
}
