declare module 'react-native-camera' {
  import * as React from 'react';
  import { ViewProps, StyleProp, ViewStyle } from 'react-native';

  export type BarCodeReadEvent = {
    data: string;
    type: string;
  };

  export type PermissionOptions = {
    title: string;
    message: string;
    buttonPositive: string;
    buttonNegative?: string;
  };

  export interface RNCameraProps extends ViewProps {
    type?: string;
    captureAudio?: boolean;
    style?: StyleProp<ViewStyle>;
    barCodeTypes?: string[];
    onBarCodeRead?: (event: BarCodeReadEvent) => void;
    onStatusChange?: (event: { cameraStatus: string }) => void;
    androidCameraPermissionOptions?: PermissionOptions;
    androidRecordAudioPermissionOptions?: PermissionOptions;
  }

  export class RNCamera extends React.Component<RNCameraProps> {
    static Constants: {
      Type: {
        back: string;
        front: string;
      };
      BarCodeType: Record<string, string>;
      FlashMode: Record<string, string>;
      AutoFocus: Record<string, string>;
    };
  }

  export default RNCamera;
}
